/**
 * Knowledge Base System - Backend
 * 
 * This module mirrors the frontend knowledge base and provides
 * server-side context injection for AI responses.
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
  pageContext?: string[];
}

export interface SupportChatRequest {
  message: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  pagePath: string;
  knowledgeContext?: string;
  additionalContext?: string;
}

export interface SupportChatResponse {
  message: string;
  suggestions?: string[];
  knowledgeUsed?: string[];
  confidence: 'high' | 'medium' | 'low' | 'unknown';
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
];

// ============================================
// UNKNOWN ANSWER RESPONSES
// ============================================

export const UNKNOWN_RESPONSES = [
  "I don't have specific information about that in my knowledge base. For detailed questions about your particular situation, I recommend contacting your local Ontario Works office. Is there anything else about the application form I can help with?",
  "That's a bit outside what I can confidently answer. I can help with questions about the application process, explain terminology, or guide you through the form. Would you like help with any of those?",
  "I'm not certain about that specific question. I'm best at explaining form fields, terminology, and general eligibility. For case-specific questions, a caseworker would be the best resource. What else can I help you with?",
];

// ============================================
// KNOWLEDGE BASE CLASS
// ============================================

export class KnowledgeBase {
  private entries: Map<string, KnowledgeEntry>;

  constructor() {
    this.entries = new Map();
    [...terminologyGlossary, ...faqs, ...navigationGuides].forEach(entry => {
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
