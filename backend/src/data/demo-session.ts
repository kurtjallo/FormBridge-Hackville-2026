/**
 * Demo Session Data
 * Pre-populated session for demonstration purposes
 * Represents a realistic Ontario Works application scenario
 */

export interface DemoSessionData {
  _id: string;
  answers: Record<string, string | number | boolean>;
  conversations: Record<string, Array<{
    role: 'user' | 'assistant';
    content: string;
    suggestedAnswer?: string;
    confidence?: 'low' | 'medium' | 'high';
    timestamp: number;
  }>>;
  completedSections: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Demo persona: Maria Garcia
 * - Single mother with one child (age 6)
 * - Recently laid off from part-time job
 * - Renting an apartment in Toronto
 * - Receiving child support
 * - Looking for work but has childcare barriers
 */
export const demoSession: DemoSessionData = {
  _id: "demo-maria-garcia",

  answers: {
    // Personal Information
    legal_name: "Maria Isabella Garcia",
    date_of_birth: "1988-06-15",
    sin: "046-454-286", // Valid Luhn checksum for demo
    address: "456 Bloor Street West, Apt 12\nToronto, ON",
    postal_code: "M4W 1A8",
    phone: "(416) 555-0198",
    email: "maria.garcia@email.com",

    // Household Information
    marital_status: "Single",
    household_size: 2,
    household_members: "1. Maria Isabella Garcia (Self) - June 15, 1988\n2. Sofia Garcia (Daughter) - March 10, 2018",
    dependents_under_18: 1,

    // Income Information
    employment_status: "Not employed",
    gross_income: 0,
    has_self_employment: "No",
    other_income: "Yes",
    other_income_details: "Child support: $400/month from ex-spouse",

    // Assets
    bank_account_total: 2500,
    investments_total: 0,
    vehicles_count: 0,
    owns_property: "No",

    // Housing
    housing_type: "Renting an apartment/house",
    monthly_rent: 1400,
    utilities_included: "No, I pay all utilities separately",
    utility_costs: 150,

    // Employment History
    last_employer: "Shoppers Drug Mart",
    last_job_title: "Cashier",
    reason_for_leaving: "Laid off / Downsized",
    last_day_worked: "2025-12-15",
    seeking_work: "Yes, but facing barriers",
    employment_barriers: "Childcare - my daughter is in school until 3pm and after-school care is expensive. Also limited by public transit schedule."
  },

  conversations: {
    "q-household-members": [
      {
        role: "assistant",
        content: "This question is asking about your 'benefit unit' - that means people who live with you AND share meals together. Let me help you list them correctly.",
        timestamp: Date.now() - 600000
      },
      {
        role: "user",
        content: "My daughter is 6 years old, do I include her?",
        timestamp: Date.now() - 540000
      },
      {
        role: "assistant",
        content: "Yes, absolutely! Children under 18 are always included in your benefit unit. List yourself first, then your daughter with her full name, birth date, and relationship to you.",
        suggestedAnswer: "1. Maria Isabella Garcia (Self) - June 15, 1988\n2. Sofia Garcia (Daughter) - March 10, 2018",
        confidence: "high",
        timestamp: Date.now() - 480000
      }
    ],

    "q-gross-income": [
      {
        role: "assistant",
        content: "Since you mentioned you were recently laid off, your current employment income would be $0. This question asks for GROSS monthly income - that's before any taxes.",
        timestamp: Date.now() - 420000
      },
      {
        role: "user",
        content: "I used to make about $1,800 before I was laid off. Should I put that?",
        timestamp: Date.now() - 360000
      },
      {
        role: "assistant",
        content: "No - enter your CURRENT income, not your previous income. Since you're not working right now, enter $0 for employment income. Your child support ($400/month) goes in the 'other income' section.",
        suggestedAnswer: "0",
        confidence: "high",
        timestamp: Date.now() - 300000
      }
    ],

    "q-other-income-details": [
      {
        role: "assistant",
        content: "List any money you receive that's not from a job. This includes child support, spousal support, EI benefits, pensions, etc.",
        timestamp: Date.now() - 240000
      },
      {
        role: "user",
        content: "I get $400 child support from my ex. Do I have to report this?",
        timestamp: Date.now() - 180000
      },
      {
        role: "assistant",
        content: "Yes, you need to report child support. However, the good news is that Ontario Works allows you to keep a portion of child support - it's not fully deducted from your benefits. Be honest about all income sources.",
        suggestedAnswer: "Child support: $400/month from ex-spouse",
        confidence: "high",
        timestamp: Date.now() - 120000
      }
    ],

    "q-seeking-work": [
      {
        role: "assistant",
        content: "Ontario Works generally requires you to look for work, but there are exemptions. Since you have a young child and mentioned childcare barriers, you may qualify for a modified participation requirement.",
        timestamp: Date.now() - 60000
      },
      {
        role: "user",
        content: "I want to work but finding childcare is really hard. What should I select?",
        timestamp: Date.now() - 30000
      },
      {
        role: "assistant",
        content: "Select 'Yes, but facing barriers' - this is honest and shows you want to work but have real challenges. Your caseworker can help connect you with subsidized childcare options.",
        suggestedAnswer: "Yes, but facing barriers",
        confidence: "high",
        timestamp: Date.now()
      }
    ]
  },

  completedSections: [
    "section-personal",
    "section-household",
    "section-income",
    "section-assets",
    "section-housing",
    "section-employment"
  ],

  createdAt: new Date(Date.now() - 86400000), // 1 day ago
  updatedAt: new Date()
};

/**
 * Get a fresh copy of the demo session with updated timestamps
 */
export function getFreshDemoSession(): DemoSessionData {
  const now = Date.now();

  // Create deep copy and update timestamps
  const fresh = JSON.parse(JSON.stringify(demoSession));
  fresh.updatedAt = new Date();

  // Update conversation timestamps to be relative to now
  for (const questionId of Object.keys(fresh.conversations)) {
    fresh.conversations[questionId] = fresh.conversations[questionId].map(
      (msg: any, index: number) => ({
        ...msg,
        timestamp: now - (fresh.conversations[questionId].length - index) * 60000
      })
    );
  }

  return fresh;
}
