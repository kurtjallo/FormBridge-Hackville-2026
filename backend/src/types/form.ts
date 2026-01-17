// Form Template - the complete structure for a government form
export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  estimatedTime: string;
  eligibilityQuestions: EligibilityQuestion[];
  requiredDocuments: RequiredDocument[];
  sections: FormSection[];
}

// Eligibility pre-check questions
export interface EligibilityQuestion {
  id: string;
  question: string;
  disqualifyIf: boolean; // If answer matches this, user may not qualify
  disqualifyMessage: string;
}

// Required documents checklist
export interface RequiredDocument {
  id: string;
  name: string;
  description: string;
  required: boolean;
  conditionalOn?: string; // Only required if condition met
}

// Form section containing multiple items
export interface FormSection {
  id: string;
  title: string;
  description?: string;
  items: FormItem[];
}

// Union type for all form item types
export type FormItem =
  | QuestionItem
  | InstructionItem
  | DefinitionItem
  | WarningItem
  | LegalItem;

// Base interface shared by all item types
export interface BaseItem {
  id: string;
  originalText: string;
  context: string;
  commonConfusions?: string[];
}

// Question with form input
export interface QuestionItem extends BaseItem {
  type: "question";
  fieldId: string;
  fieldType: "text" | "number" | "select" | "textarea" | "checkbox" | "date";
  options?: string[];
  required: boolean;
  placeholder?: string;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
  commonMistake?: {
    pattern: string;
    warning: string;
    suggestion: string;
  };
}

// Instruction block
export interface InstructionItem extends BaseItem {
  type: "instruction";
}

// Definition of a term
export interface DefinitionItem extends BaseItem {
  type: "definition";
  term: string;
}

// Warning or alert
export interface WarningItem extends BaseItem {
  type: "warning";
  severity: "info" | "caution" | "critical";
}

// Legal text
export interface LegalItem extends BaseItem {
  type: "legal";
  requiresAcknowledgment: boolean;
}

// Eligibility check request/response
export interface EligibilityRequest {
  formId: string;
  answers: Record<string, boolean>;
}

export interface EligibilityResponse {
  eligible: boolean;
  message: string;
  issues: string[];
  warnings: string[];
}

// Form list item (summary for listing)
export interface FormListItem {
  id: string;
  name: string;
  description: string;
  estimatedTime: string;
}
