/**
 * Knowledge Base System
 * 
 * This module provides a structured knowledge base derived from:
 * 1. Website content and navigation structure
 * 2. Form validation rules and requirements
 * 3. Terminology glossary and jargon explanations
 * 4. User guides and FAQs
 */

// ============================================
// TYPES
// ============================================

export interface KnowledgeEntry {
  id: string;
  category: 'terminology' | 'validation' | 'navigation' | 'faq' | 'guide';
  title: string;
  content: string;
  keywords: string[];
  relatedEntries?: string[];
  pageContext?: string[];  // Which pages this is relevant to
}

export interface PageContext {
  path: string;
  title: string;
  description: string;
  relevantKnowledge: string[];  // Knowledge entry IDs
  formFields?: string[];        // Field IDs on this page
}

export interface ValidationRule {
  fieldId: string;
  fieldName: string;
  rules: {
    type: string;
    message: string;
    details?: string;
  }[];
}

// ============================================
// TERMINOLOGY GLOSSARY
// ============================================

export const terminologyGlossary: KnowledgeEntry[] = [
  {
    id: 'term-benefit-unit',
    category: 'terminology',
    title: 'Benefit Unit',
    content: 'A benefit unit is the group of people who receive Ontario Works together. It usually includes you, your spouse or common-law partner, and any dependent children under 18 who live with you. Roommates are NOT part of your benefit unit unless you are in a romantic relationship.',
    keywords: ['benefit unit', 'household', 'family', 'dependents', 'who is included'],
    pageContext: ['/form', '/form/household'],
  },
  {
    id: 'term-common-law',
    category: 'terminology',
    title: 'Common-Law Partner',
    content: 'In Ontario Works, you are considered common-law after living together with a romantic partner for only 3 MONTHS. This is different from federal rules (1 year) or family law (3 years). If you live with a partner, you are likely considered common-law for OW purposes.',
    keywords: ['common-law', 'partner', 'spouse', 'living together', 'cohabitation', '3 months'],
    pageContext: ['/form', '/form/household'],
  },
  {
    id: 'term-asset-limit',
    category: 'terminology',
    title: 'Asset Limits',
    content: 'Asset limits are the maximum value of things you own that still allow you to qualify. Single people: $10,000. Couples/families: $15,000. Exempt assets (not counted): your home, one vehicle, RDSP savings, prepaid funerals, and tools for work.',
    keywords: ['assets', 'savings', 'limit', 'money', 'bank account', 'property', 'exempt'],
    pageContext: ['/form', '/form/assets'],
  },
  {
    id: 'term-gross-income',
    category: 'terminology',
    title: 'Gross Income',
    content: 'Gross income means your total earnings BEFORE any deductions like taxes, EI, or CPP are taken out. Look at your pay stub - the larger number at the top is your gross pay. Net income (the smaller number) is what you actually receive.',
    keywords: ['gross', 'income', 'earnings', 'before tax', 'pay stub', 'salary'],
    pageContext: ['/form', '/form/income'],
  },
  {
    id: 'term-earnings-exemption',
    category: 'terminology',
    title: 'Earnings Exemption',
    content: 'If you work while on Ontario Works, not all your income is counted against your benefits. The first $200 per month is completely exempt (you keep it all). After that, 50% of your remaining earnings are exempt. This encourages working while receiving assistance.',
    keywords: ['exemption', 'earnings', 'work', 'employment', '200 dollars', '50 percent'],
    pageContext: ['/form', '/form/income'],
  },
  {
    id: 'term-sin',
    category: 'terminology',
    title: 'Social Insurance Number (SIN)',
    content: 'Your SIN is a 9-digit number used by the government for taxes and benefits. Keep it private! SINs starting with 9 are for temporary residents. If you don\'t have a SIN, you can still apply for Ontario Works, but you should apply for one as soon as possible.',
    keywords: ['SIN', 'social insurance number', '9 digit', 'identification'],
    pageContext: ['/form', '/form/personal'],
  },
  {
    id: 'term-refugee-claimant',
    category: 'terminology',
    title: 'Refugee Claimant',
    content: 'A refugee claimant is someone who has come to Canada and asked for protection because they fear persecution in their home country. Refugee claimants ARE eligible for Ontario Works while their claim is being processed. You\'ll need your refugee claim documents.',
    keywords: ['refugee', 'claimant', 'asylum', 'protection', 'persecution'],
    pageContext: ['/form', '/form/eligibility'],
  },
  {
    id: 'term-dependent',
    category: 'terminology',
    title: 'Dependent Child',
    content: 'A dependent child is someone under 18 who lives with you and relies on you for financial support. This includes biological children, stepchildren, adopted children, and children you have legal custody of. Children 18+ are usually not dependents unless they\'re in school full-time.',
    keywords: ['dependent', 'child', 'children', 'kids', 'minor', 'custody'],
    pageContext: ['/form', '/form/household'],
  },
];

// ============================================
// VALIDATION RULES KNOWLEDGE
// ============================================

export const validationRules: ValidationRule[] = [
  {
    fieldId: 'postalCode',
    fieldName: 'Postal Code',
    rules: [
      { type: 'format', message: 'Must be a valid Canadian postal code (e.g., M5V 1A1)', details: 'Canadian postal codes alternate between letters and numbers: A1A 1A1' },
      { type: 'location', message: 'Must be an Ontario postal code', details: 'Ontario postal codes start with K, L, M, N, or P' },
    ],
  },
  {
    fieldId: 'sin',
    fieldName: 'Social Insurance Number',
    rules: [
      { type: 'format', message: 'Must be exactly 9 digits', details: 'Enter numbers only, no dashes or spaces needed' },
      { type: 'checksum', message: 'Must be a valid SIN (passes Luhn check)', details: 'SINs have a built-in verification digit' },
      { type: 'info', message: 'SINs starting with 9 indicate temporary resident status', details: 'This is informational only, not an error' },
    ],
  },
  {
    fieldId: 'monthlyEarnings',
    fieldName: 'Monthly Earnings',
    rules: [
      { type: 'range', message: 'Must be a positive number', details: 'Enter your gross (before tax) monthly income' },
      { type: 'consistency', message: 'Should be consistent with employment status', details: 'If you said you\'re employed, this should be greater than 0' },
    ],
  },
  {
    fieldId: 'dependents',
    fieldName: 'Number of Dependents',
    rules: [
      { type: 'range', message: 'Must be 0 or greater', details: 'Enter the number of dependent children under 18 living with you' },
      { type: 'reasonable', message: 'Unusually high numbers may require verification', details: 'More than 10 dependents will require additional documentation' },
    ],
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
    content: 'The Ontario Works application has several sections: Eligibility, Household Information, Income, Assets, and Contact Information. You can save your progress at any time and return later. Click the "Help" button next to any question if you need assistance.',
    keywords: ['form', 'sections', 'overview', 'how to', 'navigate', 'save'],
    pageContext: ['/form'],
  },
  {
    id: 'nav-save-progress',
    category: 'navigation',
    title: 'Saving Your Progress',
    content: 'Your answers are automatically saved as you go. You can also click "Save & Continue Later" to get a session code. Use this code to return to your application from any device. Your data is saved securely for 30 days.',
    keywords: ['save', 'progress', 'session', 'continue', 'later', 'code'],
    pageContext: ['/form'],
  },
  {
    id: 'nav-get-help',
    category: 'navigation',
    title: 'Getting Help',
    content: 'Every question has a help button (?) that opens this chat assistant. You can ask me to explain the question in simpler terms, give you examples, or help you figure out your answer. I can also suggest an answer based on what you tell me.',
    keywords: ['help', 'assistant', 'chat', 'explain', 'example', 'suggest'],
    pageContext: ['/form'],
  },
];

// ============================================
// FAQS
// ============================================

export const faqs: KnowledgeEntry[] = [
  {
    id: 'faq-eligibility',
    category: 'faq',
    title: 'Am I eligible for Ontario Works?',
    content: 'You may be eligible if: 1) You live in Ontario, 2) You\'re a Canadian citizen, permanent resident, or refugee claimant, 3) You\'re 18+ (or 16-17 with special circumstances), 4) You\'re in financial need, and 5) Your assets are below the limit ($10,000 single, $15,000 family). Apply even if you\'re unsure - a caseworker will help determine your eligibility.',
    keywords: ['eligible', 'qualify', 'requirements', 'can I apply', 'who can apply'],
    pageContext: ['/form', '/form/eligibility', '/'],
  },
  {
    id: 'faq-how-long',
    category: 'faq',
    title: 'How long does the application take?',
    content: 'The online application typically takes 20-30 minutes to complete. After submitting, you\'ll have an interview with a caseworker within 4 business days. If approved, benefits usually start within 1-2 weeks of your application date.',
    keywords: ['how long', 'time', 'duration', 'when', 'wait', 'process'],
    pageContext: ['/form', '/'],
  },
  {
    id: 'faq-documents',
    category: 'faq',
    title: 'What documents do I need?',
    content: 'Have ready: 1) ID (health card, driver\'s license, passport), 2) Proof of address (utility bill, lease), 3) SIN card or number, 4) Income proof (pay stubs, EI statements), 5) Bank statements (last 3 months), 6) Rent receipt or mortgage statement. Don\'t have everything? Apply anyway - your caseworker can tell you exactly what\'s needed.',
    keywords: ['documents', 'papers', 'need', 'required', 'bring', 'proof'],
    pageContext: ['/form', '/'],
  },
  {
    id: 'faq-work-while-receiving',
    category: 'faq',
    title: 'Can I work while receiving Ontario Works?',
    content: 'Yes! Ontario Works encourages employment. The first $200 you earn each month doesn\'t affect your benefits at all. After that, only 50% of additional earnings are deducted. Example: If you earn $500/month, only $150 would reduce your benefits ($500 - $200 = $300 × 50% = $150).',
    keywords: ['work', 'job', 'employment', 'earn', 'money', 'part-time'],
    pageContext: ['/form', '/form/income'],
  },
  {
    id: 'faq-denied',
    category: 'faq',
    title: 'What if I\'m denied?',
    content: 'If your application is denied, you have the right to appeal. You\'ll receive a letter explaining why. Common reasons: assets too high, missing documents, or not meeting residency requirements. You can request an internal review first, then appeal to the Social Benefits Tribunal if needed.',
    keywords: ['denied', 'rejected', 'appeal', 'refused', 'not approved'],
    pageContext: ['/form', '/'],
  },
];

// ============================================
// PAGE CONTEXTS
// ============================================

export const pageContexts: PageContext[] = [
  {
    path: '/',
    title: 'Home',
    description: 'Welcome page for Clarify - Ontario Works application assistant',
    relevantKnowledge: ['faq-eligibility', 'faq-how-long', 'faq-documents'],
  },
  {
    path: '/form',
    title: 'Application Form',
    description: 'Ontario Works online application form',
    relevantKnowledge: ['nav-form-overview', 'nav-save-progress', 'nav-get-help', 'faq-eligibility'],
  },
  {
    path: '/form/eligibility',
    title: 'Eligibility Section',
    description: 'Confirm your eligibility for Ontario Works',
    relevantKnowledge: ['faq-eligibility', 'term-refugee-claimant'],
    formFields: ['residencyStatus', 'ageConfirmation', 'financialNeed'],
  },
  {
    path: '/form/household',
    title: 'Household Section',
    description: 'Tell us about who lives with you',
    relevantKnowledge: ['term-benefit-unit', 'term-common-law', 'term-dependent'],
    formFields: ['maritalStatus', 'dependents', 'otherAdults'],
  },
  {
    path: '/form/income',
    title: 'Income Section',
    description: 'Tell us about your income from all sources',
    relevantKnowledge: ['term-gross-income', 'term-earnings-exemption', 'faq-work-while-receiving'],
    formFields: ['employmentIncome', 'monthlyEarnings', 'otherIncome'],
  },
  {
    path: '/form/assets',
    title: 'Assets Section',
    description: 'Tell us about your savings and property',
    relevantKnowledge: ['term-asset-limit'],
    formFields: ['bankAccounts', 'vehicles', 'property'],
  },
];

// ============================================
// KNOWLEDGE BASE CLASS
// ============================================

export class KnowledgeBase {
  private entries: Map<string, KnowledgeEntry>;
  private validationRulesMap: Map<string, ValidationRule>;
  private pageContextsMap: Map<string, PageContext>;

  constructor() {
    this.entries = new Map();
    this.validationRulesMap = new Map();
    this.pageContextsMap = new Map();

    // Load all knowledge
    [...terminologyGlossary, ...navigationGuides, ...faqs].forEach(entry => {
      this.entries.set(entry.id, entry);
    });

    validationRules.forEach(rule => {
      this.validationRulesMap.set(rule.fieldId, rule);
    });

    pageContexts.forEach(ctx => {
      this.pageContextsMap.set(ctx.path, ctx);
    });
  }

  /**
   * Search knowledge base by query string
   */
  search(query: string, limit: number = 5): KnowledgeEntry[] {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/);

    const scored = Array.from(this.entries.values()).map(entry => {
      let score = 0;
      
      // Title match (highest weight)
      if (entry.title.toLowerCase().includes(queryLower)) {
        score += 10;
      }

      // Keyword matches
      entry.keywords.forEach(keyword => {
        if (keyword.toLowerCase().includes(queryLower) || queryLower.includes(keyword.toLowerCase())) {
          score += 5;
        }
        // Partial word matches
        queryWords.forEach(word => {
          if (keyword.toLowerCase().includes(word) && word.length > 2) {
            score += 2;
          }
        });
      });

      // Content matches
      queryWords.forEach(word => {
        if (entry.content.toLowerCase().includes(word) && word.length > 2) {
          score += 1;
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
   * Get knowledge entries relevant to a specific page
   */
  getPageKnowledge(path: string): KnowledgeEntry[] {
    const pageCtx = this.pageContextsMap.get(path);
    if (!pageCtx) {
      // Try partial match
      const matchingPath = Array.from(this.pageContextsMap.keys()).find(p => path.startsWith(p));
      if (matchingPath) {
        const ctx = this.pageContextsMap.get(matchingPath)!;
        return ctx.relevantKnowledge.map(id => this.entries.get(id)).filter(Boolean) as KnowledgeEntry[];
      }
      return [];
    }
    return pageCtx.relevantKnowledge.map(id => this.entries.get(id)).filter(Boolean) as KnowledgeEntry[];
  }

  /**
   * Get page context information
   */
  getPageContext(path: string): PageContext | undefined {
    return this.pageContextsMap.get(path);
  }

  /**
   * Get validation rules for a field
   */
  getValidationRules(fieldId: string): ValidationRule | undefined {
    return this.validationRulesMap.get(fieldId);
  }

  /**
   * Get a specific knowledge entry by ID
   */
  getEntry(id: string): KnowledgeEntry | undefined {
    return this.entries.get(id);
  }

  /**
   * Get all entries of a specific category
   */
  getByCategory(category: KnowledgeEntry['category']): KnowledgeEntry[] {
    return Array.from(this.entries.values()).filter(e => e.category === category);
  }

  /**
   * Build context string for AI from query and page
   */
  buildContextForAI(query: string, pagePath: string): string {
    const relevantEntries = this.search(query, 3);
    const pageKnowledge = this.getPageKnowledge(pagePath);
    const pageContext = this.getPageContext(pagePath);

    const parts: string[] = [];

    if (pageContext) {
      parts.push(`📍 Current Page: ${pageContext.title} - ${pageContext.description}`);
    }

    if (relevantEntries.length > 0) {
      parts.push('\n📚 Relevant Knowledge:');
      relevantEntries.forEach(entry => {
        parts.push(`• ${entry.title}: ${entry.content}`);
      });
    }

    // Add unique page knowledge not already included
    const pageKnowledgeNotIncluded = pageKnowledge.filter(
      pk => !relevantEntries.some(re => re.id === pk.id)
    );
    if (pageKnowledgeNotIncluded.length > 0) {
      parts.push('\n📖 Page Context:');
      pageKnowledgeNotIncluded.slice(0, 2).forEach(entry => {
        parts.push(`• ${entry.title}: ${entry.content}`);
      });
    }

    return parts.join('\n');
  }

  /**
   * Format all knowledge as a summary for the AI
   */
  getAllKnowledgeSummary(): string {
    const terminology = this.getByCategory('terminology');
    const faqs = this.getByCategory('faq');
    
    const parts: string[] = ['📋 KNOWLEDGE BASE SUMMARY\n'];
    
    parts.push('🔤 KEY TERMS:');
    terminology.forEach(t => parts.push(`• ${t.title}: ${t.content.slice(0, 100)}...`));
    
    parts.push('\n❓ COMMON QUESTIONS:');
    faqs.forEach(f => parts.push(`• ${f.title}`));
    
    return parts.join('\n');
  }
}

// Singleton instance
export const knowledgeBase = new KnowledgeBase();
