/**
 * Knowledge Base System - Backend
 *
 * Category-agnostic knowledge base supporting Legal, Financial,
 * and Government document types.
 */

// ============================================
// TYPES
// ============================================

export interface KnowledgeEntry {
  id: string;
  category: 'legal' | 'financial' | 'government' | 'general' | 'navigation';
  title: string;
  content: string;
  keywords: string[];
  relatedEntries?: string[];
  pageContext?: string[];
}

export interface SupportChatRequest {
  message: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  pagePath: string;
  knowledgeContext?: string;
  additionalContext?: string;
  formId?: string; // For form-scoped RAG context
}

export interface SupportChatResponse {
  message: string;
  suggestions?: string[];
  knowledgeUsed?: string[];
  confidence: 'high' | 'medium' | 'low';
  structured?: {
    interpretation: string;
    breakdown: string[];
    suggestedQuestions: string[];
  };
}

// ============================================
// LEGAL TERMINOLOGY
// ============================================

export const legalTerminology: KnowledgeEntry[] = [
  {
    id: 'legal-nda',
    category: 'legal',
    title: 'Non-Disclosure Agreement (NDA)',
    content: 'An NDA (Non-Disclosure Agreement) is a legal contract that creates a confidential relationship between parties. It protects sensitive information from being shared with others. Common uses: protecting business secrets, client lists, and proprietary information. Breaking an NDA can result in lawsuits and financial penalties.',
    keywords: ['NDA', 'non-disclosure', 'confidentiality agreement', 'secret', 'confidential'],
    pageContext: ['/form', '/legal'],
  },
  {
    id: 'legal-confidentiality',
    category: 'legal',
    title: 'Confidentiality',
    content: 'Confidentiality means keeping certain information private and not sharing it with unauthorized people. In legal documents, confidentiality clauses specify what information must be kept secret, who can access it, and for how long. Violating confidentiality can lead to legal action.',
    keywords: ['confidentiality', 'confidential', 'private', 'secret', 'sensitive information'],
    pageContext: ['/form', '/legal'],
  },
  {
    id: 'legal-indemnification',
    category: 'legal',
    title: 'Indemnification',
    content: 'Indemnification means one party agrees to compensate the other for certain damages or losses. In simple terms: "If something goes wrong because of X, I will pay for the damages." This protects one party from financial loss caused by the other party\'s actions.',
    keywords: ['indemnify', 'indemnification', 'hold harmless', 'compensate', 'damages'],
    pageContext: ['/form', '/legal'],
  },
  {
    id: 'legal-liability',
    category: 'legal',
    title: 'Liability',
    content: 'Liability is legal responsibility for something, especially damages or debts. "Limited liability" means there\'s a cap on how much you can be held responsible for. Liability clauses in contracts define who is responsible if something goes wrong and to what extent.',
    keywords: ['liability', 'liable', 'responsible', 'responsibility', 'limited liability'],
    pageContext: ['/form', '/legal'],
  },
  {
    id: 'legal-jurisdiction',
    category: 'legal',
    title: 'Jurisdiction',
    content: 'Jurisdiction specifies which location\'s laws apply to a contract and where legal disputes will be resolved. For example, "This agreement is governed by Ontario law" means Ontario courts and laws apply. This is important if parties are in different provinces or countries.',
    keywords: ['jurisdiction', 'governing law', 'court', 'legal venue', 'applicable law'],
    pageContext: ['/form', '/legal'],
  },
  {
    id: 'legal-breach',
    category: 'legal',
    title: 'Breach of Contract',
    content: 'A breach of contract occurs when one party fails to fulfill their obligations under the agreement. This can be "material" (major violation) or "minor." The non-breaching party may seek remedies like damages (money) or specific performance (forcing the other party to act).',
    keywords: ['breach', 'violation', 'break contract', 'default', 'non-compliance'],
    pageContext: ['/form', '/legal'],
  },
  {
    id: 'legal-term',
    category: 'legal',
    title: 'Term and Termination',
    content: 'The "term" is how long an agreement lasts. Termination clauses explain how and when a contract can be ended early. Common termination reasons: breach of contract, mutual agreement, or "for convenience" (either party can end it with notice).',
    keywords: ['term', 'duration', 'termination', 'end contract', 'cancellation', 'expire'],
    pageContext: ['/form', '/legal'],
  },
  {
    id: 'legal-waiver',
    category: 'legal',
    title: 'Waiver',
    content: 'A waiver is voluntarily giving up a known right. For example, signing a waiver at a gym means you agree not to sue them if you get injured. Waivers must be clear about what rights are being waived. Some rights cannot be waived by law.',
    keywords: ['waiver', 'release', 'give up rights', 'disclaimer', 'release of liability'],
    pageContext: ['/form', '/legal'],
  },
  {
    id: 'legal-force-majeure',
    category: 'legal',
    title: 'Force Majeure',
    content: 'Force majeure (French for "superior force") excuses parties from contract obligations due to extraordinary events beyond their control: natural disasters, wars, pandemics, etc. If a force majeure event occurs, affected parties typically aren\'t liable for non-performance.',
    keywords: ['force majeure', 'act of god', 'natural disaster', 'unforeseeable', 'extraordinary event'],
    pageContext: ['/form', '/legal'],
  },
  {
    id: 'legal-severability',
    category: 'legal',
    title: 'Severability',
    content: 'Severability means if one part of a contract is found invalid or unenforceable, the rest of the contract still applies. Without this clause, an invalid provision could void the entire agreement. It\'s a standard protective clause in most contracts.',
    keywords: ['severability', 'invalid provision', 'unenforceable', 'remainder valid'],
    pageContext: ['/form', '/legal'],
  },
];

// ============================================
// FINANCIAL TERMINOLOGY
// ============================================

export const financialTerminology: KnowledgeEntry[] = [
  {
    id: 'fin-apr',
    category: 'financial',
    title: 'Annual Percentage Rate (APR)',
    content: 'APR is the yearly interest rate charged on borrowed money, including fees. It helps compare loan costs. For example, a $10,000 loan at 5% APR costs $500/year in interest. Credit cards often have APRs of 15-25%. Lower APR = less expensive borrowing.',
    keywords: ['APR', 'annual percentage rate', 'interest rate', 'borrowing cost'],
    pageContext: ['/form', '/financial'],
  },
  {
    id: 'fin-principal',
    category: 'financial',
    title: 'Principal',
    content: 'Principal is the original amount of money borrowed or invested, not including interest. For a $200,000 mortgage, the principal is $200,000. Your monthly payments go toward both principal (reducing what you owe) and interest (the cost of borrowing).',
    keywords: ['principal', 'original amount', 'loan amount', 'base amount'],
    pageContext: ['/form', '/financial'],
  },
  {
    id: 'fin-collateral',
    category: 'financial',
    title: 'Collateral',
    content: 'Collateral is an asset you pledge as security for a loan. If you can\'t repay, the lender can take the collateral. Examples: your house for a mortgage, your car for an auto loan. Secured loans (with collateral) usually have lower interest rates than unsecured loans.',
    keywords: ['collateral', 'security', 'secured loan', 'pledge', 'asset'],
    pageContext: ['/form', '/financial'],
  },
  {
    id: 'fin-amortization',
    category: 'financial',
    title: 'Amortization',
    content: 'Amortization is paying off debt through regular payments over time. An amortization schedule shows how each payment splits between principal and interest. Early payments are mostly interest; later payments are mostly principal. Common for mortgages and car loans.',
    keywords: ['amortization', 'amortize', 'payment schedule', 'loan payments'],
    pageContext: ['/form', '/financial'],
  },
  {
    id: 'fin-equity',
    category: 'financial',
    title: 'Equity',
    content: 'Equity is ownership value. For homes: your home\'s value minus what you owe. If your home is worth $400,000 and you owe $250,000, you have $150,000 in equity. For businesses: ownership stake (shares). Equity can be used as collateral for loans.',
    keywords: ['equity', 'ownership', 'home equity', 'net worth', 'stake'],
    pageContext: ['/form', '/financial'],
  },
  {
    id: 'fin-gross-net',
    category: 'financial',
    title: 'Gross vs Net Income',
    content: 'Gross income is your total earnings BEFORE deductions (taxes, insurance, retirement). Net income is what you actually take home AFTER deductions. On your pay stub: gross is the bigger number at top, net is the smaller amount you receive.',
    keywords: ['gross income', 'net income', 'take home pay', 'before tax', 'after tax'],
    pageContext: ['/form', '/financial'],
  },
  {
    id: 'fin-deductible',
    category: 'financial',
    title: 'Deductible',
    content: 'A deductible is the amount you pay out-of-pocket before insurance kicks in. For a $500 deductible: if you have $2,000 in damages, you pay $500 and insurance pays $1,500. Higher deductibles usually mean lower monthly premiums.',
    keywords: ['deductible', 'out of pocket', 'insurance', 'premium'],
    pageContext: ['/form', '/financial'],
  },
  {
    id: 'fin-liability-asset',
    category: 'financial',
    title: 'Assets vs Liabilities',
    content: 'Assets are things you OWN that have value: cash, property, investments, vehicles. Liabilities are what you OWE: loans, mortgages, credit card debt. Net worth = Assets minus Liabilities. Financial forms often ask you to list both.',
    keywords: ['assets', 'liabilities', 'net worth', 'own', 'owe', 'debt'],
    pageContext: ['/form', '/financial'],
  },
  {
    id: 'fin-credit-score',
    category: 'financial',
    title: 'Credit Score',
    content: 'A credit score (300-900 in Canada) predicts how likely you are to repay debt. Higher is better. 660+ is generally "good." Factors: payment history (35%), amounts owed (30%), credit history length (15%), new credit (10%), credit mix (10%). Lenders use it to decide loan approval and rates.',
    keywords: ['credit score', 'credit rating', 'credit history', 'creditworthy'],
    pageContext: ['/form', '/financial'],
  },
  {
    id: 'fin-cosigner',
    category: 'financial',
    title: 'Co-signer/Guarantor',
    content: 'A co-signer agrees to repay a loan if you can\'t. They\'re equally responsible for the debt. Lenders require co-signers when the primary borrower has limited credit history or income. Warning: if you don\'t pay, the co-signer\'s credit is also affected.',
    keywords: ['cosigner', 'co-signer', 'guarantor', 'guarantee', 'joint'],
    pageContext: ['/form', '/financial'],
  },
];

// ============================================
// GENERAL/GOVERNMENT TERMINOLOGY
// ============================================

export const generalTerminology: KnowledgeEntry[] = [
  {
    id: 'gen-sin',
    category: 'government',
    title: 'Social Insurance Number (SIN)',
    content: 'Your SIN is a 9-digit number used by the Canadian government for taxes, benefits, and services. Keep it private! Only share when legally required (employers, banks, government). SINs starting with 9 are for temporary residents.',
    keywords: ['SIN', 'social insurance number', '9 digit', 'identification', 'government ID'],
    pageContext: ['/form'],
  },
  {
    id: 'gen-notarize',
    category: 'general',
    title: 'Notarization',
    content: 'Notarization is when a notary public officially witnesses your signature and verifies your identity. Some documents require notarization to be legally valid. The notary stamps/seals the document. Common for: real estate, wills, powers of attorney.',
    keywords: ['notarize', 'notary', 'notarization', 'witness', 'seal', 'stamp'],
    pageContext: ['/form'],
  },
  {
    id: 'gen-affidavit',
    category: 'general',
    title: 'Affidavit',
    content: 'An affidavit is a written statement you swear is true, signed before a notary or commissioner. Lying in an affidavit is perjury (a crime). Used when you need official proof of facts: name changes, lost documents, statutory declarations.',
    keywords: ['affidavit', 'sworn statement', 'statutory declaration', 'oath'],
    pageContext: ['/form'],
  },
  {
    id: 'gen-power-of-attorney',
    category: 'general',
    title: 'Power of Attorney',
    content: 'A power of attorney (POA) lets someone else make decisions on your behalf. Types: General (broad powers), Specific (limited to certain tasks), Enduring/Continuing (remains valid if you become incapacitated). Choose your attorney carefully - they\'ll have significant authority.',
    keywords: ['power of attorney', 'POA', 'attorney', 'authority', 'representative'],
    pageContext: ['/form'],
  },
  {
    id: 'gen-beneficiary',
    category: 'general',
    title: 'Beneficiary',
    content: 'A beneficiary is the person who receives benefits from something: insurance payout, trust fund, will inheritance, retirement account. You can name primary (first choice) and contingent (backup) beneficiaries. Keep beneficiary designations updated!',
    keywords: ['beneficiary', 'heir', 'recipient', 'inheritance', 'payout'],
    pageContext: ['/form'],
  },
];

// ============================================
// NAVIGATION GUIDES
// ============================================

export const navigationGuides: KnowledgeEntry[] = [
  {
    id: 'nav-form-overview',
    category: 'navigation',
    title: 'Form Overview',
    content: 'FormBridge helps you understand and complete various documents. Use the AI assistant to explain any confusing terms or sections. Click the help button next to any field for instant explanations in plain language.',
    keywords: ['form', 'sections', 'overview', 'how to', 'navigate', 'help'],
    pageContext: ['/form'],
  },
  {
    id: 'nav-save-progress',
    category: 'navigation',
    title: 'Saving Your Progress',
    content: 'Your answers are automatically saved as you work. You can return later to continue. Your data is stored securely. For sensitive documents, make sure to complete and submit within any stated deadlines.',
    keywords: ['save', 'progress', 'continue', 'later', 'autosave'],
    pageContext: ['/form'],
  },
  {
    id: 'nav-ai-help',
    category: 'navigation',
    title: 'Using the AI Assistant',
    content: 'The AI assistant can explain terminology, clarify confusing sections, and answer questions about your document. Click any highlighted term or use the chat panel. For legal or financial advice specific to your situation, consult a professional.',
    keywords: ['AI', 'assistant', 'help', 'chat', 'explain', 'question'],
    pageContext: ['/form'],
  },
];

// ============================================
// UNKNOWN ANSWER RESPONSES
// ============================================

export const UNKNOWN_RESPONSES = [
  "I don't have specific information about that in my knowledge base. For detailed questions about your situation, I recommend consulting the appropriate professional (lawyer, financial advisor, or relevant agency). Is there anything else about this document I can help explain?",
  "That's a bit outside what I can confidently answer. I can help explain terminology, clarify document sections, or guide you through the form. Would you like help with any of those?",
  "I'm not certain about that specific question. I'm best at explaining document terms and helping you understand what's being asked. For advice specific to your situation, please consult a qualified professional.",
];

// ============================================
// KNOWLEDGE BASE CLASS
// ============================================

export class KnowledgeBase {
  private entries: Map<string, KnowledgeEntry>;

  constructor() {
    this.entries = new Map();
    [
      ...legalTerminology,
      ...financialTerminology,
      ...generalTerminology,
      ...navigationGuides,
    ].forEach(entry => {
      this.entries.set(entry.id, entry);
    });
  }

  /**
   * Search knowledge base by query
   */
  search(query: string, limit: number = 5): KnowledgeEntry[] {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

    const scored = Array.from(this.entries.values()).map(entry => {
      let score = 0;

      // Title exact match
      if (entry.title.toLowerCase().includes(queryLower)) {
        score += 10;
      }

      // Keyword matches
      entry.keywords.forEach(keyword => {
        if (keyword.toLowerCase().includes(queryLower) || queryLower.includes(keyword.toLowerCase())) {
          score += 5;
        }
        queryWords.forEach(word => {
          if (keyword.toLowerCase().includes(word)) {
            score += 2;
          }
        });
      });

      // Content word matches
      queryWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = entry.content.match(regex);
        if (matches) {
          score += matches.length;
        }
      });

      return { entry, score };
    });

    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.entry);
  }

  /**
   * Get entries relevant to a page path
   */
  getPageKnowledge(path: string): KnowledgeEntry[] {
    return Array.from(this.entries.values()).filter(entry =>
      entry.pageContext?.some(p => path.startsWith(p) || path === p)
    );
  }

  /**
   * Get entry by ID
   */
  getEntry(id: string): KnowledgeEntry | undefined {
    return this.entries.get(id);
  }

  /**
   * Get all entries by category
   */
  getByCategory(category: KnowledgeEntry['category']): KnowledgeEntry[] {
    return Array.from(this.entries.values()).filter(e => e.category === category);
  }

  /**
   * Build context string for AI prompt
   */
  buildPromptContext(query: string, pagePath: string): string {
    const searchResults = this.search(query, 3);
    const pageKnowledge = this.getPageKnowledge(pagePath);

    // Combine and deduplicate
    const allKnowledge = [...searchResults];
    pageKnowledge.forEach(pk => {
      if (!allKnowledge.some(sr => sr.id === pk.id)) {
        allKnowledge.push(pk);
      }
    });

    if (allKnowledge.length === 0) {
      return '';
    }

    const parts = ['📚 KNOWLEDGE BASE CONTEXT:'];
    allKnowledge.slice(0, 5).forEach(entry => {
      parts.push(`\n[${entry.category.toUpperCase()}] ${entry.title}:`);
      parts.push(entry.content);
    });

    return parts.join('\n');
  }

  /**
   * Check if we have knowledge to answer the query
   */
  hasKnowledgeFor(query: string): boolean {
    const results = this.search(query, 1);
    return results.length > 0;
  }

  /**
   * Get a random unknown response
   */
  getUnknownResponse(): string {
    return UNKNOWN_RESPONSES[Math.floor(Math.random() * UNKNOWN_RESPONSES.length)];
  }
}

// Singleton instance
export const knowledgeBase = new KnowledgeBase();
