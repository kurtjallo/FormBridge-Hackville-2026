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
    ];

    for (const doc of knowledgeDocs) {
        await addKnowledgeDoc(doc);
    }

    console.log(`Seeded ${knowledgeDocs.length} knowledge documents`);
}
