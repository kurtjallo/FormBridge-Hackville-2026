'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { 
  knowledgeBase, 
  KnowledgeEntry, 
  PageContext, 
  ValidationRule 
} from '@/lib/knowledgeBase';
import { ontarioWorksForm } from '@/data/ontarioWorksForm';
import { FormQuestion, FormSection } from '@/types';

// ============================================
// TYPES
// ============================================

export interface CurrentPageContext {
  /** Current URL path */
  path: string;
  /** Page title from knowledge base */
  title: string;
  /** Page description */
  description: string;
  /** Current section (if on form) */
  currentSection?: FormSection;
  /** Current question being viewed/edited */
  currentQuestion?: FormQuestion;
  /** Knowledge entries relevant to this page */
  relevantKnowledge: KnowledgeEntry[];
  /** Validation rules for fields on this page */
  validationRules: ValidationRule[];
  /** Breadcrumb path */
  breadcrumbs: { label: string; path: string }[];
}

export interface UsePageContextOptions {
  /** ID of the currently focused form question */
  activeQuestionId?: string | null;
  /** Additional context from the app state */
  additionalContext?: Record<string, unknown>;
}

// ============================================
// HOOK: usePageContext
// ============================================

/**
 * Hook to retrieve current page context for the chatbot
 * 
 * This hook:
 * 1. Detects the current page from the URL
 * 2. Retrieves relevant knowledge base entries
 * 3. Gets form field validation rules
 * 4. Provides contextual information for the AI
 */
export function usePageContext(options: UsePageContextOptions = {}): CurrentPageContext {
  const pathname = usePathname();
  const { activeQuestionId, additionalContext } = options;

  const [context, setContext] = useState<CurrentPageContext>(() => 
    buildContext(pathname, activeQuestionId)
  );

  // Update context when pathname or active question changes
  useEffect(() => {
    setContext(buildContext(pathname, activeQuestionId));
  }, [pathname, activeQuestionId]);

  return context;
}

/**
 * Build the page context object
 */
function buildContext(
  pathname: string, 
  activeQuestionId?: string | null
): CurrentPageContext {
  // Get page context from knowledge base
  const pageCtx = knowledgeBase.getPageContext(pathname);
  
  // Find current section and question from form data
  let currentSection: FormSection | undefined;
  let currentQuestion: FormQuestion | undefined;
  
  if (activeQuestionId) {
    for (const section of ontarioWorksForm.sections) {
      const question = section.questions.find(q => q.id === activeQuestionId);
      if (question) {
        currentSection = section;
        currentQuestion = question;
        break;
      }
    }
  } else if (pathname.startsWith('/form/')) {
    // Try to determine section from URL
    const sectionSlug = pathname.split('/form/')[1]?.split('/')[0];
    currentSection = ontarioWorksForm.sections.find(
      s => s.id === sectionSlug || s.title.toLowerCase().replace(/\s+/g, '-') === sectionSlug
    );
  }

  // Get relevant knowledge
  const pageKnowledge = knowledgeBase.getPageKnowledge(pathname);
  
  // Add question-specific knowledge if available
  let questionKnowledge: KnowledgeEntry[] = [];
  if (currentQuestion) {
    // Search knowledge base for terms in the question
    const questionTerms = currentQuestion.originalText.toLowerCase();
    questionKnowledge = knowledgeBase.search(questionTerms, 2);
  }

  // Combine and deduplicate knowledge
  const allKnowledge = [...pageKnowledge];
  questionKnowledge.forEach(qk => {
    if (!allKnowledge.some(pk => pk.id === qk.id)) {
      allKnowledge.push(qk);
    }
  });

  // Get validation rules for fields on this page
  const validationRules: ValidationRule[] = [];
  if (currentSection) {
    currentSection.questions.forEach(q => {
      const rules = knowledgeBase.getValidationRules(q.fieldId);
      if (rules) {
        validationRules.push(rules);
      }
    });
  }

  // Build breadcrumbs
  const breadcrumbs = buildBreadcrumbs(pathname, currentSection);

  return {
    path: pathname,
    title: pageCtx?.title || getPageTitle(pathname),
    description: pageCtx?.description || '',
    currentSection,
    currentQuestion,
    relevantKnowledge: allKnowledge,
    validationRules,
    breadcrumbs,
  };
}

/**
 * Build breadcrumb navigation
 */
function buildBreadcrumbs(
  pathname: string, 
  currentSection?: FormSection
): { label: string; path: string }[] {
  const breadcrumbs: { label: string; path: string }[] = [
    { label: 'Home', path: '/' },
  ];

  if (pathname.startsWith('/form')) {
    breadcrumbs.push({ label: 'Application', path: '/form' });
    
    if (currentSection) {
      breadcrumbs.push({ 
        label: currentSection.title, 
        path: `/form/${currentSection.id}` 
      });
    }
  }

  return breadcrumbs;
}

/**
 * Get page title from pathname
 */
function getPageTitle(pathname: string): string {
  if (pathname === '/') return 'Home';
  if (pathname === '/form') return 'Application Form';
  
  // Extract last segment and format
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  return lastSegment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ============================================
// HOOK: useContextualHelp
// ============================================

export interface ContextualHelp {
  /** Get help text for a specific field */
  getFieldHelp: (fieldId: string) => string | undefined;
  /** Get validation message for a field */
  getValidationHelp: (fieldId: string, errorType: string) => string | undefined;
  /** Search knowledge base */
  searchKnowledge: (query: string) => KnowledgeEntry[];
  /** Get terminology explanation */
  explainTerm: (term: string) => KnowledgeEntry | undefined;
  /** Build AI context string for current state */
  buildAIContext: (userQuery: string) => string;
}

/**
 * Hook to provide contextual help functions
 */
export function useContextualHelp(): ContextualHelp {
  const pathname = usePathname();

  const getFieldHelp = useCallback((fieldId: string): string | undefined => {
    // First check form data for context
    for (const section of ontarioWorksForm.sections) {
      const question = section.questions.find(q => q.fieldId === fieldId);
      if (question) {
        return question.context;
      }
    }
    
    // Then check validation rules
    const rules = knowledgeBase.getValidationRules(fieldId);
    if (rules) {
      return rules.rules.map(r => r.details || r.message).join(' ');
    }
    
    return undefined;
  }, []);

  const getValidationHelp = useCallback((fieldId: string, errorType: string): string | undefined => {
    const rules = knowledgeBase.getValidationRules(fieldId);
    if (!rules) return undefined;
    
    const matchingRule = rules.rules.find(r => r.type === errorType);
    return matchingRule?.details || matchingRule?.message;
  }, []);

  const searchKnowledge = useCallback((query: string): KnowledgeEntry[] => {
    return knowledgeBase.search(query, 5);
  }, []);

  const explainTerm = useCallback((term: string): KnowledgeEntry | undefined => {
    const results = knowledgeBase.search(term, 1);
    return results.find(r => r.category === 'terminology');
  }, []);

  const buildAIContext = useCallback((userQuery: string): string => {
    return knowledgeBase.buildContextForAI(userQuery, pathname);
  }, [pathname]);

  return {
    getFieldHelp,
    getValidationHelp,
    searchKnowledge,
    explainTerm,
    buildAIContext,
  };
}

// ============================================
// HOOK: useFormFieldContext
// ============================================

export interface FormFieldContext {
  question: FormQuestion | undefined;
  section: FormSection | undefined;
  helpText: string | undefined;
  commonConfusions: string[];
  relatedQuestions: FormQuestion[];
  validationRules: ValidationRule | undefined;
  relevantKnowledge: KnowledgeEntry[];
}

/**
 * Hook to get context for a specific form field
 */
export function useFormFieldContext(fieldId: string | null): FormFieldContext {
  const [context, setContext] = useState<FormFieldContext>(() => 
    buildFieldContext(fieldId)
  );

  useEffect(() => {
    setContext(buildFieldContext(fieldId));
  }, [fieldId]);

  return context;
}

function buildFieldContext(fieldId: string | null): FormFieldContext {
  if (!fieldId) {
    return {
      question: undefined,
      section: undefined,
      helpText: undefined,
      commonConfusions: [],
      relatedQuestions: [],
      validationRules: undefined,
      relevantKnowledge: [],
    };
  }

  let question: FormQuestion | undefined;
  let section: FormSection | undefined;

  // Find the question and section
  for (const sec of ontarioWorksForm.sections) {
    const q = sec.questions.find(q => q.fieldId === fieldId || q.id === fieldId);
    if (q) {
      question = q;
      section = sec;
      break;
    }
  }

  if (!question) {
    return {
      question: undefined,
      section: undefined,
      helpText: undefined,
      commonConfusions: [],
      relatedQuestions: [],
      validationRules: undefined,
      relevantKnowledge: [],
    };
  }

  // Get related questions
  const relatedQuestions: FormQuestion[] = [];
  if (question.relatedQuestions) {
    question.relatedQuestions.forEach(relId => {
      for (const sec of ontarioWorksForm.sections) {
        const relQ = sec.questions.find(q => q.id === relId);
        if (relQ) {
          relatedQuestions.push(relQ);
          break;
        }
      }
    });
  }

  // Get validation rules
  const validationRules = knowledgeBase.getValidationRules(question.fieldId);

  // Search for relevant knowledge
  const relevantKnowledge = knowledgeBase.search(question.originalText, 3);

  return {
    question,
    section,
    helpText: question.context,
    commonConfusions: question.commonConfusions || [],
    relatedQuestions,
    validationRules,
    relevantKnowledge,
  };
}
