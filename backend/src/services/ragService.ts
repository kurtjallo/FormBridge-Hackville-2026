import { KnowledgeDoc, IKnowledgeDoc } from '../models/KnowledgeDoc';
import { generateEmbedding, cosineSimilarity } from './gemini';
import { v4 as uuidv4 } from 'uuid';

/**
 * RAG Service - Retrieval-Augmented Generation
 *
 * Searches the knowledge base using vector search (with text search fallback)
 * and returns relevant context for the AI to use when answering questions.
 */

// Search options
interface SearchOptions {
    category?: string;
    formId?: string;
    limit?: number;
}

// Search result with relevance score
interface SearchResult {
    doc: IKnowledgeDoc;
    score: number;
}

/**
 * Vector search using in-memory cosine similarity
 * No Atlas Vector Search index required
 */
async function vectorSearch(
    queryEmbedding: number[],
    options: SearchOptions = {}
): Promise<SearchResult[]> {
    const { category, formId, limit = 3 } = options;

    // Build filter for docs with embeddings
    const filter: Record<string, unknown> = { embedding: { $exists: true, $ne: [] } };
    if (category) filter.category = category;
    if (formId) filter.formId = formId;

    const docs = await KnowledgeDoc.find(filter);

    if (docs.length === 0) {
        return [];
    }

    // Calculate cosine similarity for each doc
    const scored = docs.map(doc => ({
        doc: doc.toObject() as IKnowledgeDoc,
        score: cosineSimilarity(queryEmbedding, doc.embedding!)
    }));

    // Sort by score descending and limit
    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}

/**
 * Text search fallback using MongoDB text index
 */
async function textSearch(
    query: string,
    options: SearchOptions = {}
): Promise<SearchResult[]> {
    const { category, formId, limit = 3 } = options;

    // Build match filter
    const matchFilter: Record<string, unknown> = {};
    if (category) matchFilter.category = category;
    if (formId) matchFilter.formId = formId;

    const results = await KnowledgeDoc.aggregate([
        {
            $match: {
                $text: { $search: query },
                ...matchFilter,
            },
        },
        {
            $addFields: {
                score: { $meta: 'textScore' },
            },
        },
        { $sort: { score: -1 } },
        { $limit: limit },
    ]);

    return results.map((doc) => ({
        doc: doc as IKnowledgeDoc,
        score: doc.score,
    }));
}

/**
 * Search knowledge base - tries vector search first, falls back to text search
 */
export async function searchKnowledge(
    query: string,
    options: SearchOptions = {}
): Promise<SearchResult[]> {
    // Try vector search first
    try {
        const queryEmbedding = await generateEmbedding(query);
        const results = await vectorSearch(queryEmbedding, options);

        if (results.length > 0) {
            console.log(`Vector search found ${results.length} results`);
            return results;
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log('Vector search failed, falling back to text search:', errorMessage);
    }

    // Fallback to text search
    try {
        const results = await textSearch(query, options);
        console.log(`Text search found ${results.length} results`);
        return results;
    } catch (error) {
        console.error('Text search also failed:', error);
        return [];
    }
}

/**
 * Build context string from search results
 * This gets injected into the AI prompt
 */
export function buildRAGContext(results: SearchResult[]): string {
    if (results.length === 0) {
        return '';
    }

    const contextParts = results.map((r, i) => {
        return `[Source ${i + 1}: ${r.doc.title}]\n${r.doc.content}`;
    });

    return `
📚 RELEVANT KNOWLEDGE:
${contextParts.join('\n\n')}
---
Use the above information to help answer the user's question. Cite sources when relevant.
`;
}

/**
 * Main RAG function - search and build context
 */
export async function getRAGContext(
    query: string,
    category?: string,
    formId?: string
): Promise<string> {
    const results = await searchKnowledge(query, { category, formId, limit: 3 });
    return buildRAGContext(results);
}

/**
 * Add a knowledge document to the database with embedding
 */
export async function addKnowledgeDoc(
    doc: Omit<IKnowledgeDoc, '_id' | 'lastUpdated' | 'embedding'>
): Promise<IKnowledgeDoc> {
    // Generate embedding from title + content
    const textForEmbedding = `${doc.title} ${doc.content}`;
    let embedding: number[] | undefined;

    try {
        embedding = await generateEmbedding(textForEmbedding);
        console.log(`Generated embedding for: ${doc.title}`);
    } catch (error) {
        console.error(`Failed to generate embedding for ${doc.title}:`, error);
        // Continue without embedding - text search will still work
    }

    const newDoc = await KnowledgeDoc.create({
        ...doc,
        _id: uuidv4(),
        embedding,
        lastUpdated: new Date(),
    });
    return newDoc;
}

/**
 * Migrate embeddings only for documents that don't have them yet
 * More efficient than reindexing all documents
 */
export async function migrateEmbeddings(): Promise<{ migrated: number; failed: number }> {
    // Find docs without embeddings
    const docs = await KnowledgeDoc.find({
        $or: [
            { embedding: { $exists: false } },
            { embedding: { $size: 0 } },
            { embedding: null }
        ]
    });

    console.log(`Found ${docs.length} documents without embeddings`);

    let migrated = 0;
    let failed = 0;

    for (const doc of docs) {
        try {
            const textForEmbedding = `${doc.title} ${doc.content}`;
            const embedding = await generateEmbedding(textForEmbedding);

            await KnowledgeDoc.updateOne(
                { _id: doc._id },
                { $set: { embedding } }
            );

            migrated++;
            console.log(`Migrated: ${doc.title}`);
        } catch (error) {
            failed++;
            console.error(`Failed to migrate ${doc.title}:`, error);
        }
    }

    return { migrated, failed };
}

/**
 * Seed initial knowledge base with form-specific information
 */
export async function seedKnowledgeBase(): Promise<void> {
    const existingCount = await KnowledgeDoc.countDocuments();
    if (existingCount > 0) {
        console.log(`Knowledge base already has ${existingCount} documents`);
        return;
    }

    console.log('Seeding RAG knowledge base...');

    const knowledgeDocs: Omit<IKnowledgeDoc, '_id' | 'lastUpdated' | 'embedding'>[] = [
        // Employment / Legal
        {
            category: 'employment',
            title: 'Indemnification Clauses Explained',
            content: `Indemnification means you agree to protect and compensate another party for losses.

In employment contracts, this typically means:
- If your work causes the company to be sued, you might have to pay
- Usually limited to your own negligence or misconduct
- Standard in most contracts, but scope matters

RED FLAGS:
- "Unlimited" indemnification
- Covering company's own negligence
- No cap on liability`,
            keywords: ['indemnify', 'indemnification', 'hold harmless', 'liability', 'protect'],
            source: 'Legal best practices guide',
        },
        {
            category: 'employment',
            title: 'IP Assignment and Prior Inventions',
            content: `Intellectual Property (IP) assignment transfers ownership of your work to the company.

Key points for employees:
- Usually covers work done during employment hours
- "Prior inventions" = things you made BEFORE the job
- ALWAYS list your prior inventions to protect them
- Side projects may need separate agreement

What to list as prior inventions:
- Personal websites and apps
- Open source contributions
- Hobby projects and prototypes
- Academic work and papers`,
            keywords: ['ip', 'intellectual property', 'prior inventions', 'work for hire', 'invention assignment'],
            source: 'Employment law guide',
        },
        {
            category: 'employment',
            title: 'Non-Compete Clauses in Canada',
            content: `Non-compete clauses restrict where you can work after leaving a job.

Canadian law (especially Ontario):
- Courts are skeptical of non-competes
- Must be "reasonable" in scope, time, and geography
- Tech industry: often unenforceable
- Non-solicitation is more likely to be enforced than non-compete

2021 Ontario law change:
- Non-competes now BANNED for most employees
- Only valid for executives and business sellers
- Existing non-competes may be void`,
            keywords: ['non-compete', 'non compete', 'restrictive covenant', 'competition'],
            source: 'Ontario Employment Standards Act 2021',
        },

        // Finance / Tax
        {
            category: 'finance',
            title: 'T4 Box 14 - Employment Income',
            content: `Box 14 on your T4 shows your GROSS employment income.

This includes:
- Regular salary and wages
- Overtime pay
- Bonuses and commissions
- Taxable benefits (company car, group life insurance over $25k)
- Vacation pay

This does NOT include:
- Employer pension contributions
- Health/dental benefits (usually not taxable)

This number is BEFORE deductions - it's larger than your take-home pay.`,
            keywords: ['t4', 'box 14', 'employment income', 'gross income', 'salary'],
            source: 'CRA T4 Guide',
        },
        {
            category: 'finance',
            title: 'Work From Home Tax Deduction',
            content: `Canadians who work from home may claim expenses on their tax return.

Two methods available:

1. FLAT RATE METHOD (simpler):
- $2 per day worked from home
- Maximum $500 per year (250 days)
- No receipts required
- No T2200 form needed

2. DETAILED METHOD (more work):
- Claim actual expenses: internet, utilities, rent/mortgage interest
- Need form T2200 signed by employer
- Calculate workspace percentage
- Keep all receipts

Most people use flat rate for simplicity.`,
            keywords: ['work from home', 'home office', 't2200', 'wfh deduction', 'remote work tax'],
            source: 'CRA Work From Home Guide',
        },

        // Government forms
        {
            category: 'government',
            title: 'Ontario Works - Benefit Unit Explained',
            content: `A "benefit unit" is the group of people who apply for Ontario Works together.

WHO TO INCLUDE:
- Yourself
- Your spouse or common-law partner
- Your dependent children under 18
- Adult children who financially depend on you

WHO NOT TO INCLUDE:
- Roommates (even if sharing rent)
- Friends or extended family
- Adult children with their own income

Common-law in Ontario = living together 3+ months (not the federal 12 months).`,
            keywords: ['benefit unit', 'ontario works', 'ow', 'household', 'family members'],
            source: 'Ontario Works Policy Directive',
        },
        {
            category: 'government',
            title: 'Ontario Works - Asset Limits',
            content: `You can have some savings and still qualify for Ontario Works.

Asset limits (2024):
- Single person: $10,000
- Couple: $15,000
- Family: $15,000+ ($500 per child)

ASSETS THAT DON'T COUNT:
- Your home (primary residence)
- One motor vehicle
- RDSP (Registered Disability Savings Plan)
- Prepaid funeral expenses (up to $15,000)
- Tools needed for work
- Personal belongings

ASSETS THAT COUNT:
- Bank accounts
- Investments (stocks, GICs)
- Second vehicle
- Property you don't live in`,
            keywords: ['asset limit', 'savings', 'ontario works', 'liquid assets', 'exemptions'],
            source: 'Ontario Works Policy Directive 2024',
        },
        {
            category: 'government',
            title: 'Ontario Works - Income Reporting',
            content: `You can work and still receive Ontario Works benefits.

How earnings affect your benefits:
- First $200/month = you keep 100%
- After that = you keep 50%, benefits reduced by 50%

EXAMPLE with $600/month earnings:
- First $200 → fully exempt → you keep $200
- Remaining $400 → 50% exempt → you keep $200
- Total you keep: $400
- Only $200 reduces your benefits

IMPORTANT:
- Report ALL income (even cash, gifts over $50)
- Report income in the month you RECEIVE it
- Not reporting is fraud and has consequences`,
            keywords: ['income', 'earnings', 'employment', 'work', 'report income', 'exemption'],
            source: 'Ontario Works Policy Directive',
        },

        // Healthcare Forms
        {
            category: 'healthcare',
            title: 'Medical Consent Form Basics',
            content: `A medical consent form gives permission for doctors to treat you.

KEY SECTIONS TO UNDERSTAND:
- Procedure description: What the doctor will do
- Risks: Possible problems that could happen
- Alternatives: Other treatment options available
- Acknowledgment: You confirm you understand

YOUR RIGHTS:
- You can ask questions before signing
- You can refuse treatment
- You can withdraw consent at any time
- You should get a copy of what you signed

For non-emergency procedures, take time to read carefully.`,
            keywords: ['consent', 'medical', 'treatment', 'procedure', 'permission', 'healthcare'],
            source: 'Ontario Health Guidelines',
        },
        {
            category: 'healthcare',
            title: 'OHIP Coverage and Eligibility',
            content: `OHIP (Ontario Health Insurance Plan) covers most medical services for Ontario residents.

WHO IS ELIGIBLE:
- Canadian citizens living in Ontario
- Permanent residents living in Ontario
- Some work permit holders
- Refugee claimants with valid documents

WAITING PERIOD:
- 3 months for new residents
- Coverage starts first day of third month
- Get private insurance for the waiting period

WHAT'S COVERED:
- Doctor visits
- Hospital stays
- Medical tests
- Most surgeries

NOT COVERED:
- Prescription drugs (unless in hospital)
- Dental care
- Eye exams (for most adults)
- Ambulance fees ($45 co-pay)`,
            keywords: ['ohip', 'health insurance', 'coverage', 'medical', 'ontario health'],
            source: 'Ontario Ministry of Health',
        },

        // Immigration Forms
        {
            category: 'immigration',
            title: 'IMM 5257 - Visitor Visa Application',
            content: `The IMM 5257 is for people who want to visit Canada temporarily.

WHO NEEDS THIS FORM:
- Tourists visiting Canada
- People visiting family
- Business visitors (short trips)
- Super Visa applicants (parents/grandparents)

KEY SECTIONS:
- Personal details (name exactly as on passport)
- Travel history (countries visited in last 10 years)
- Family information
- Purpose of visit
- Financial support proof

COMMON MISTAKES:
- Name doesn't match passport exactly
- Gaps in travel history
- Missing supporting documents
- Unclear purpose of visit

Processing time varies by country (2-8 weeks typically).`,
            keywords: ['imm 5257', 'visitor visa', 'trv', 'temporary resident', 'tourist visa', 'visit canada'],
            source: 'IRCC Visitor Visa Guide',
        },
        {
            category: 'immigration',
            title: 'Immigration Document Checklist',
            content: `Common documents needed for Canadian immigration applications:

IDENTITY DOCUMENTS:
- Valid passport (6+ months remaining)
- Birth certificate
- National ID card
- Previous passports

CIVIL DOCUMENTS:
- Marriage certificate
- Divorce decree (if applicable)
- Children's birth certificates

FINANCIAL DOCUMENTS:
- Bank statements (6 months)
- Employment letter
- Pay stubs
- Tax returns
- Proof of funds

TRAVEL DOCUMENTS:
- Flight itinerary
- Hotel bookings
- Invitation letter (if visiting someone)

All documents not in English/French need certified translation.`,
            keywords: ['documents', 'immigration', 'checklist', 'proof', 'requirements'],
            source: 'IRCC Document Requirements',
        },

        // Legal Forms
        {
            category: 'legal',
            title: 'Liability Waiver Explained',
            content: `A liability waiver releases someone from responsibility if you get hurt.

WHAT IT DOES:
- You agree not to sue if injured
- The company is not responsible for accidents
- Applies to known risks of the activity

WHAT TO LOOK FOR:
- What activities are covered
- What risks you're accepting
- Whether it covers their negligence
- Time period it covers

IMPORTANT:
- Read before signing
- You can negotiate terms
- Waivers for gross negligence may not be enforceable
- Keep a copy for your records

Common for: gyms, sports activities, events, rentals.`,
            keywords: ['waiver', 'liability', 'release', 'hold harmless', 'injury', 'sue'],
            source: 'Legal Best Practices',
        },
        {
            category: 'legal',
            title: 'Power of Attorney Types',
            content: `Power of Attorney (POA) lets someone make decisions for you.

TYPES IN ONTARIO:

1. POWER OF ATTORNEY FOR PROPERTY:
- Manages money, property, finances
- Can be "continuing" (works if you become incapable)
- Can set conditions on when it takes effect

2. POWER OF ATTORNEY FOR PERSONAL CARE:
- Health and personal decisions
- Only takes effect if you can't decide yourself
- Covers medical treatment, housing, nutrition

KEY POINTS:
- Choose someone you trust completely
- They must act in your best interest
- You can revoke it anytime (while capable)
- Should be witnessed properly
- Consider having a backup person

Get legal advice for complex situations.`,
            keywords: ['power of attorney', 'poa', 'attorney', 'decisions', 'property', 'personal care'],
            source: 'Ontario Attorney General',
        },

        // More Finance/Tax
        {
            category: 'finance',
            title: 'RRSP Basics for Tax Forms',
            content: `RRSP (Registered Retirement Savings Plan) helps reduce your taxes.

HOW IT WORKS:
- Money you contribute reduces your taxable income
- Investments grow tax-free inside RRSP
- You pay tax when you withdraw (usually in retirement)

CONTRIBUTION LIMITS:
- 18% of previous year's income
- Maximum around $30,000/year (changes yearly)
- Unused room carries forward
- Check your CRA account for your limit

TAX FORMS:
- T4RSP: Shows contributions made
- Box 20 on T4: Employer RRSP contributions
- Line 20800: Where you claim deduction

DEADLINE: 60 days after year end (usually March 1).`,
            keywords: ['rrsp', 'retirement', 'savings', 'tax deduction', 'contribution'],
            source: 'CRA RRSP Guide',
        },
        {
            category: 'finance',
            title: 'GST/HST Credit Application',
            content: `The GST/HST credit is money back from the government for low/middle income Canadians.

WHO QUALIFIES:
- Canadian resident for tax purposes
- 19+ years old (or have spouse/child)
- Income below threshold (around $50,000 single)

HOW TO APPLY:
- File your tax return (even with no income)
- Check "yes" on GST/HST credit application
- CRA automatically calculates your amount

PAYMENT SCHEDULE:
- Paid quarterly (Jan, Apr, Jul, Oct)
- Direct deposit or cheque
- Amount based on family size and income

TYPICAL AMOUNTS (2024):
- Single: up to $496/year
- Couple: up to $650/year
- Per child: up to $171/year

Keep address updated with CRA for payments.`,
            keywords: ['gst', 'hst', 'credit', 'tax', 'rebate', 'benefit'],
            source: 'CRA GST/HST Credit Guide',
        },

        // ==========================================
        // CANADIAN LAW - Contracts & Legal Terms
        // ==========================================
        {
            category: 'legal',
            title: 'Contract Basics in Canada',
            content: `A contract is a legally binding agreement between parties. In Canada, contracts can be written or verbal (though written is better for proof).

ESSENTIAL ELEMENTS:
- Offer: One party proposes terms
- Acceptance: Other party agrees to those exact terms
- Consideration: Something of value exchanged (money, services, goods)
- Intention: Both parties intend to be legally bound
- Capacity: Parties are legally able to contract (18+, mentally capable)

WHEN CONTRACTS ARE VOID:
- Signed under duress or threats
- One party was deceived (fraud)
- Illegal purpose
- Person lacked mental capacity
- Minor signed without guardian (some exceptions)

COOLING-OFF PERIODS:
- Door-to-door sales: 10 days in Ontario
- Gym memberships: 10 days
- Timeshares: 10 days
- Payday loans: 2 business days`,
            keywords: ['contract', 'agreement', 'binding', 'offer', 'acceptance', 'consideration', 'void'],
            source: 'Canadian Contract Law Principles',
        },
        {
            category: 'legal',
            title: 'Termination Clauses Explained',
            content: `A termination clause specifies how and when a contract can be ended.

COMMON TERMINATION TYPES:

1. FOR CAUSE (immediate):
- Serious breach of contract
- Fraud or misconduct
- Usually no notice required

2. FOR CONVENIENCE (without reason):
- Either party can end with proper notice
- Usually 30-90 days notice
- May require payment for work done

3. AUTOMATIC TERMINATION:
- Contract ends on specific date
- Upon completion of project
- When certain conditions are met

WHAT TO LOOK FOR:
- Notice period required
- What counts as "cause"
- Penalties for early termination
- Whether you can terminate at all
- Survival clauses (what continues after termination)

In employment, termination clauses must meet minimum standards under the Employment Standards Act.`,
            keywords: ['termination', 'end contract', 'notice period', 'cancel', 'breach', 'cause'],
            source: 'Canadian Contract Law',
        },
        {
            category: 'legal',
            title: 'Force Majeure Clauses',
            content: `Force majeure ("superior force") excuses contract performance when extraordinary events occur.

TYPICALLY COVERED EVENTS:
- Natural disasters (floods, earthquakes, fires)
- War or terrorism
- Government actions (new laws, embargoes)
- Pandemics (post-COVID, often explicit)
- Strikes or labor disputes

WHAT HAPPENS WHEN TRIGGERED:
- Obligations suspended (not cancelled)
- No liability for non-performance
- Must resume when event ends
- May allow termination if prolonged

NOT USUALLY COVERED:
- Economic hardship
- Market changes
- Poor business decisions
- Events you could have prevented

IMPORTANT: If no force majeure clause exists, you may still have the common law doctrine of "frustration" - but it's much harder to prove.`,
            keywords: ['force majeure', 'act of god', 'pandemic', 'disaster', 'impossible', 'frustration'],
            source: 'Canadian Contract Law',
        },
        {
            category: 'legal',
            title: 'Limitation of Liability Clauses',
            content: `Limitation of liability caps how much one party can claim from another if something goes wrong.

COMMON TYPES:

1. CAP ON DAMAGES:
- "Liability limited to fees paid under this contract"
- "Maximum liability of $10,000"
- Protects against unlimited claims

2. EXCLUSION OF DAMAGES:
- No liability for "indirect" or "consequential" damages
- No liability for lost profits
- No liability for data loss

3. TIME LIMITS:
- Must bring claim within 1-2 years
- Shorter than normal limitation period

WHAT COURTS WON'T ALLOW:
- Excluding liability for fraud
- Excluding liability for gross negligence
- Clauses that are "unconscionable" (extremely unfair)
- Limits that violate consumer protection laws

For consumers: Many limitations don't apply - the Consumer Protection Act overrides unfair terms.`,
            keywords: ['limitation', 'liability', 'damages', 'cap', 'exclude', 'consequential'],
            source: 'Canadian Contract Law',
        },

        // ==========================================
        // CANADIAN LAW - Employment
        // ==========================================
        {
            category: 'employment',
            title: 'Employment Standards Act (Ontario)',
            content: `The ESA sets MINIMUM standards for most Ontario workplaces. Contracts cannot go below these.

KEY MINIMUMS (2024):

WAGES:
- Minimum wage: $16.55/hour (general)
- Students under 18: $15.60/hour
- Must be paid at least every 2 weeks

HOURS:
- Maximum 8 hours/day or 48 hours/week (unless agreed)
- Overtime after 44 hours/week at 1.5x
- 11 hours off between shifts
- 24 hours off per week (or 48 hours per 2 weeks)

VACATION:
- 2 weeks after 1 year (4% pay)
- 3 weeks after 5 years (6% pay)

LEAVES:
- Sick leave: 3 unpaid days/year
- Family responsibility: 3 unpaid days/year
- Bereavement: 2 unpaid days
- Pregnancy: 17 weeks unpaid
- Parental: 61-63 weeks unpaid

Your contract can give you MORE than the ESA, but never less.`,
            keywords: ['employment standards', 'esa', 'minimum wage', 'overtime', 'vacation', 'leave', 'ontario'],
            source: 'Ontario Employment Standards Act, 2000',
        },
        {
            category: 'employment',
            title: 'Wrongful Dismissal in Canada',
            content: `Wrongful dismissal occurs when an employer fires you without proper notice or pay.

YOUR RIGHTS:

1. NOTICE OR PAY IN LIEU:
- ESA minimum: 1 week per year of service (max 8 weeks)
- Common law: Much more generous (up to 24+ months for senior employees)
- Factors: age, position, length of service, job market

2. WHAT'S NOT WRONGFUL DISMISSAL:
- Being fired WITH proper notice/pay
- Termination for "just cause" (serious misconduct)
- Layoff with recall rights

3. "JUST CAUSE" EXAMPLES:
- Theft or fraud
- Violence or harassment
- Serious insubordination
- Repeated misconduct after warnings

4. CONSTRUCTIVE DISMISSAL:
- Employer fundamentally changes your job
- Major pay cut, demotion, relocation
- Treated as if you were fired

WHAT TO DO:
- Don't sign anything immediately
- Get legal advice before accepting a package
- You have 2 years to file a claim`,
            keywords: ['wrongful dismissal', 'fired', 'termination', 'notice', 'severance', 'just cause'],
            source: 'Canadian Employment Law',
        },
        {
            category: 'employment',
            title: 'Probationary Periods Explained',
            content: `Probation lets employers assess new employees before full commitment.

KEY POINTS:

TYPICAL LENGTH:
- 3 months is standard
- Can be up to 6 months
- Must be in writing to be enforceable

DURING PROBATION:
- Employer can terminate more easily
- Still entitled to ESA minimums
- Still protected from discrimination
- Cannot waive all rights

WHAT EMPLOYERS CAN DO:
- End employment with minimal notice
- Assess performance and fit
- Extend probation (if contract allows)

WHAT THEY CANNOT DO:
- Fire you for discriminatory reasons
- Deny you minimum ESA entitlements
- Extend indefinitely without agreement

AFTER PROBATION:
- Full termination notice applies
- Harder to dismiss without cause
- All regular employment rights apply

If no probation clause exists, regular termination rules apply from day one.`,
            keywords: ['probation', 'probationary', 'trial period', 'new employee', '3 months'],
            source: 'Canadian Employment Law',
        },
        {
            category: 'employment',
            title: 'Severance Pay vs Termination Pay',
            content: `These are different things in Ontario - you might be owed both!

TERMINATION PAY (most employees):
- 1 week per year of service
- Maximum 8 weeks
- Applies after 3 months of employment

SEVERANCE PAY (additional, if eligible):
- 1 week per year of service
- Maximum 26 weeks
- Only if: 5+ years employed AND employer payroll is $2.5M+ (or 50+ employees laid off in 6 months)

EXAMPLE (10 years service, large employer):
- Termination pay: 8 weeks (capped)
- Severance pay: 10 weeks
- Total: 18 weeks statutory pay

COMMON LAW (on top of statutory):
- Can be much higher
- Based on reasonable notice period
- Factors: age, position, years, job availability
- Can reach 24+ months for senior employees

IMPORTANT: Accepting a package may waive your right to sue for more. Get legal advice first!`,
            keywords: ['severance', 'termination pay', 'package', 'weeks', 'entitled'],
            source: 'Ontario Employment Standards Act',
        },

        // ==========================================
        // CANADIAN LAW - NDAs & Confidentiality
        // ==========================================
        {
            category: 'legal',
            title: 'NDA (Non-Disclosure Agreement) Explained',
            content: `An NDA protects confidential information shared between parties.

TYPES OF NDAS:

1. ONE-WAY (unilateral):
- Only one party shares secrets
- Common for employees, contractors
- You receive info, promise not to share

2. TWO-WAY (mutual):
- Both parties share confidential info
- Common in business partnerships
- Both sides have obligations

WHAT'S TYPICALLY COVERED:
- Trade secrets and formulas
- Customer lists and data
- Business strategies
- Financial information
- Software code
- Unreleased products

WHAT'S NOT CONFIDENTIAL:
- Publicly available information
- Information you already knew
- Information from other legitimate sources
- Information independently developed

DURATION:
- Often 2-5 years after relationship ends
- Trade secrets: can be indefinite
- Must be "reasonable" to be enforceable`,
            keywords: ['nda', 'non-disclosure', 'confidential', 'secret', 'confidentiality agreement'],
            source: 'Canadian Contract Law',
        },
        {
            category: 'legal',
            title: 'Confidentiality Obligations in Employment',
            content: `Even without an NDA, employees have confidentiality duties.

IMPLIED DUTIES (no contract needed):
- Duty of good faith while employed
- Cannot share trade secrets
- Cannot compete while still employed
- Must act in employer's interest

WHAT YOU CAN'T SHARE:
- Customer lists and contacts
- Pricing strategies
- Manufacturing processes
- Software source code
- Business plans
- Financial data

WHAT YOU CAN USE:
- General skills learned
- General industry knowledge
- Public information
- Your own professional contacts (usually)

AFTER YOU LEAVE:
- Trade secrets: protected indefinitely
- Confidential info: depends on NDA terms
- General knowledge: yours to keep

BREACH CONSEQUENCES:
- Injunction (court order to stop)
- Damages (compensation)
- Possibly criminal charges (theft of trade secrets)
- Account of profits (give back what you gained)`,
            keywords: ['confidentiality', 'trade secret', 'employee', 'duty', 'share', 'information'],
            source: 'Canadian Employment Law',
        },

        // ==========================================
        // CANADIAN LAW - IP Agreements
        // ==========================================
        {
            category: 'employment',
            title: 'IP Assignment in Employment',
            content: `IP (Intellectual Property) assignment transfers ownership of your work to your employer.

THE DEFAULT RULE IN CANADA:
- Employees: Employer usually owns work-related IP automatically
- Contractors: Creator usually owns IP unless assigned
- This is why contracts specify ownership

WHAT'S TYPICALLY ASSIGNED:
- Inventions made during employment
- Software code written for employer
- Documents and materials created
- Improvements to employer's products

WHAT YOU MAY KEEP:
- Inventions made entirely on your own time
- Work unrelated to employer's business
- Pre-existing IP you brought in (if disclosed)
- Personal projects (if clearly separated)

MORAL RIGHTS:
- Canadian copyright includes "moral rights"
- Right to be credited as author
- Right to prevent distortion of work
- Often waived in employment contracts
- Cannot be assigned, only waived

PRIOR INVENTIONS SCHEDULE:
- Lists things you created before the job
- Protects your existing work
- Fill it out completely!`,
            keywords: ['ip', 'intellectual property', 'assignment', 'invention', 'ownership', 'moral rights'],
            source: 'Canadian Intellectual Property Law',
        },
        {
            category: 'legal',
            title: 'Work for Hire vs Assignment',
            content: `Understanding who owns creative work in Canada.

WORK FOR HIRE (built into law):
- Employees: Employer owns copyright by default
- Must be created "in the course of employment"
- No separate assignment needed

ASSIGNMENT (contract needed):
- Contractors: They own unless assigned
- Must be in writing
- Should be signed before work begins
- Can be partial or full transfer

KEY DIFFERENCE:
- Employee creates logo at work → employer owns it
- Contractor creates logo → contractor owns it (unless assigned)

WHAT TO LOOK FOR IN CONTRACTS:
- "All IP shall be assigned to..."
- "Work made for hire" language
- "Waiver of moral rights"
- When assignment happens (on creation? on payment?)

RETAINING RIGHTS:
- You can negotiate to keep some rights
- License back for portfolio use
- Credit/attribution rights
- Right to use non-confidential parts`,
            keywords: ['work for hire', 'assignment', 'copyright', 'contractor', 'ownership', 'creative'],
            source: 'Canadian Copyright Act',
        },

        // ==========================================
        // CANADIAN LAW - Common Legal Terms
        // ==========================================
        {
            category: 'legal',
            title: 'Governing Law and Jurisdiction',
            content: `These clauses determine which laws apply and where disputes are heard.

GOVERNING LAW:
- Which province/country's laws interpret the contract
- Example: "This agreement is governed by Ontario law"
- Important because laws vary significantly

JURISDICTION:
- Which courts can hear disputes
- "Exclusive jurisdiction": only those courts
- "Non-exclusive jurisdiction": those courts, but others possible too

WHY IT MATTERS:
- Different provinces have different rules
- Consumer protection varies
- Employment standards differ
- Limitation periods vary

COMMON COMBINATIONS:
- Ontario company + Ontario employee = Ontario law
- US company + Canadian employee = often negotiable
- Online terms = often company's home jurisdiction

TIPS:
- Prefer your own province's jurisdiction
- Avoid distant jurisdictions (expensive to litigate)
- Consumer contracts: often can't waive local protections`,
            keywords: ['governing law', 'jurisdiction', 'disputes', 'courts', 'applicable law', 'venue'],
            source: 'Canadian Contract Law',
        },
        {
            category: 'legal',
            title: 'Warranties and Representations',
            content: `These are promises and statements of fact in contracts.

REPRESENTATIONS:
- Statements of fact that induce you to sign
- "The car has never been in an accident"
- If false, may allow you to cancel contract
- Can sue for misrepresentation

WARRANTIES:
- Promises about quality or condition
- "The software will function for 12 months"
- If broken, you can claim damages
- May allow you to terminate

DISCLAIMERS:
- "As is" - no promises about condition
- "No warranties, express or implied"
- Often limited by consumer protection laws

IMPLIED WARRANTIES (even without writing):
- Goods are fit for purpose
- Goods match description
- Seller has right to sell
- Consumer goods are durable

LIMITATION:
- Consumer transactions: can't disclaim implied warranties
- Business-to-business: more freedom to disclaim`,
            keywords: ['warranty', 'representation', 'promise', 'as is', 'disclaimer', 'guarantee'],
            source: 'Canadian Sale of Goods Law',
        },
        {
            category: 'legal',
            title: 'Assignment and Successors',
            content: `These clauses control whether contract rights/obligations can be transferred.

ASSIGNMENT:
- Transferring your contract rights to someone else
- "You may not assign this agreement without consent"
- Common in employment (you can't send someone else to do your job)

WHAT CAN BE ASSIGNED:
- Right to receive payment (usually yes)
- Right to receive services (depends)
- Obligations (usually need consent)

SUCCESSORS AND ASSIGNS:
- "This agreement binds successors and assigns"
- Means the contract survives if company is sold
- Your obligations transfer to new owner

CHANGE OF CONTROL:
- What happens if the other company is bought
- May trigger termination rights
- May require notice to you

WHY IT MATTERS:
- Company you contracted with may be sold
- Your boss today may not be your boss tomorrow
- Contract terms should survive ownership changes`,
            keywords: ['assignment', 'transfer', 'successor', 'change of control', 'assign rights'],
            source: 'Canadian Contract Law',
        },
        {
            category: 'legal',
            title: 'Entire Agreement Clause',
            content: `Also called "integration clause" - says the written contract is the complete deal.

WHAT IT DOES:
- The signed document is the whole agreement
- Cancels out prior discussions and promises
- Verbal promises don't count anymore
- Previous drafts don't matter

TYPICAL LANGUAGE:
"This Agreement constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, and agreements."

WHY IT'S IMPORTANT:
- Sales rep's verbal promises? Not enforceable
- Emails discussing different terms? Don't count
- Earlier draft with better terms? Doesn't apply

LIMITATIONS:
- Cannot exclude fraudulent misrepresentation
- May not apply to collateral agreements
- Consumer protection may override

PRACTICAL TIP:
- Get ALL promises in writing before signing
- Don't rely on "we'll work it out later"
- If it's not in the contract, it doesn't exist`,
            keywords: ['entire agreement', 'integration', 'whole agreement', 'prior', 'supersede'],
            source: 'Canadian Contract Law',
        },
        {
            category: 'legal',
            title: 'Severability Clauses',
            content: `Severability saves the contract if part of it is found invalid.

HOW IT WORKS:
- If one clause is illegal/unenforceable
- That clause is removed ("severed")
- Rest of contract continues

EXAMPLE:
- Contract has an unenforceable non-compete
- Court strikes the non-compete
- Everything else still applies

WITHOUT SEVERABILITY:
- Invalid clause might void entire contract
- Parties left with no agreement
- Must start over

TYPICAL LANGUAGE:
"If any provision is found invalid, the remaining provisions shall continue in full force and effect."

LIMITATIONS:
- Can't save fundamentally flawed contracts
- Core terms can't usually be severed
- Courts may refuse if result is unfair

WHY IT'S INCLUDED:
- Laws change over time
- Hard to predict what courts will enforce
- Provides safety net for both parties`,
            keywords: ['severability', 'invalid', 'unenforceable', 'void', 'strike', 'clause'],
            source: 'Canadian Contract Law',
        },
        {
            category: 'legal',
            title: 'Waiver Provisions',
            content: `Waiver provisions prevent accidental loss of contract rights.

THE PROBLEM:
- If you don't enforce a right once, do you lose it forever?
- Example: Late payment accepted once - always allowed?

WAIVER CLAUSE SOLUTION:
- Failing to enforce once doesn't waive the right
- Must expressly waive in writing
- Protects both parties

TYPICAL LANGUAGE:
"No waiver of any breach shall constitute a waiver of any other breach. Any waiver must be in writing signed by the waiving party."

PRACTICAL MEANING:
- You can be flexible without losing rights
- One-time exceptions don't become permanent
- Must be clear and intentional to give up rights

RELATED CONCEPTS:
- Estoppel: Can't go back on a clear promise relied upon
- Course of dealing: Pattern of behavior may imply terms
- Waiver clause helps prevent these arguments`,
            keywords: ['waiver', 'enforce', 'breach', 'right', 'give up', 'excuse'],
            source: 'Canadian Contract Law',
        },
        {
            category: 'legal',
            title: 'Notice Provisions',
            content: `Notice clauses specify how parties must communicate formally.

WHY IT MATTERS:
- Termination notices must be done right
- Breach notices start cure periods
- Wrong delivery = notice may be invalid

COMMON REQUIREMENTS:
- Written notice required
- Specific addresses listed
- Acceptable methods (email, courier, registered mail)
- When notice is "effective"

DELIVERY METHODS:
- Personal delivery: effective immediately
- Courier: usually effective on delivery
- Registered mail: often effective after X days
- Email: may or may not be acceptable

WHAT TO CHECK:
- Is email allowed? (often not for important notices)
- How many days notice required?
- Address to send notices to
- Do you need to update address changes?

COMMON TRAP:
- Sending notice by email when contract requires courier
- Notice is invalid
- You may lose rights or miss deadlines`,
            keywords: ['notice', 'written notice', 'delivery', 'address', 'effective', 'communication'],
            source: 'Canadian Contract Law',
        },
    ];

    for (const doc of knowledgeDocs) {
        await addKnowledgeDoc(doc);
    }

    console.log(`Seeded ${knowledgeDocs.length} knowledge documents`);
}
