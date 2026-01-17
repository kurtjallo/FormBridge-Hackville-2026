import { FormTemplate } from '../types/form';

export const ontarioWorksForm: FormTemplate = {
  id: "ontario-works",
  name: "Ontario Works Application",
  description: "Social assistance for Ontario residents in financial need",
  estimatedTime: "20-30 minutes",

  eligibilityQuestions: [
    {
      id: "eq-1",
      question: "Do you currently live in Ontario?",
      disqualifyIf: false,
      disqualifyMessage: "Ontario Works is only available to Ontario residents."
    },
    {
      id: "eq-2",
      question: "Are you a Canadian citizen, permanent resident, or refugee claimant?",
      disqualifyIf: false,
      disqualifyMessage: "You must have eligible immigration status to apply."
    },
    {
      id: "eq-3",
      question: "Are you in financial need? (Unable to cover basic living costs)",
      disqualifyIf: false,
      disqualifyMessage: "Ontario Works is for people in financial need."
    },
    {
      id: "eq-4",
      question: "Do you have liquid assets over $10,000 (single) or $15,000 (couple)?",
      disqualifyIf: true,
      disqualifyMessage: "Your assets may exceed the limit, but some assets are exempt (like your primary residence and one vehicle). You may still qualify."
    },
    {
      id: "eq-5",
      question: "Are you currently on strike from employment?",
      disqualifyIf: true,
      disqualifyMessage: "You cannot receive Ontario Works while on strike, but may qualify after the strike ends."
    }
  ],

  requiredDocuments: [
    {
      id: "doc-1",
      name: "Government-issued photo ID",
      description: "Driver's license, passport, Ontario photo card, or PR card",
      required: true
    },
    {
      id: "doc-2",
      name: "Proof of address",
      description: "Utility bill, lease agreement, or bank statement showing your Ontario address",
      required: true
    },
    {
      id: "doc-3",
      name: "Social Insurance Number (SIN)",
      description: "Your 9-digit SIN card or letter from Service Canada",
      required: true
    },
    {
      id: "doc-4",
      name: "Proof of immigration status",
      description: "PR card, work permit, refugee claim documents",
      required: true,
      conditionalOn: "If not a Canadian citizen"
    },
    {
      id: "doc-5",
      name: "Recent pay stubs",
      description: "Last 2 months of pay stubs from all jobs",
      required: false,
      conditionalOn: "If currently employed"
    },
    {
      id: "doc-6",
      name: "Bank statements",
      description: "Last 3 months of statements from all bank accounts",
      required: true
    },
    {
      id: "doc-7",
      name: "Rent receipt or lease",
      description: "Showing monthly rent amount and landlord information",
      required: false,
      conditionalOn: "If renting"
    },
    {
      id: "doc-8",
      name: "Child's birth certificate",
      description: "For each child in your household",
      required: false,
      conditionalOn: "If you have children"
    }
  ],

  sections: [
    // SECTION 1: Personal Information
    {
      id: "section-personal",
      title: "Personal Information",
      description: "Tell us about yourself",
      items: [
        {
          type: "instruction",
          id: "inst-personal-intro",
          originalText: "Complete this section with your personal details. All information must match your government-issued ID.",
          context: "Make sure your name is spelled exactly as it appears on your ID. Small differences can delay your application.",
          commonConfusions: [
            "Use your legal name, not a nickname",
            "If you recently changed your name, use the name on your current ID"
          ]
        },
        {
          type: "question",
          id: "q-legal-name",
          fieldId: "legal_name",
          originalText: "What is your full legal name?",
          fieldType: "text",
          required: true,
          placeholder: "First Middle Last",
          context: "Enter your name exactly as it appears on your government ID. Include middle name(s) if on your ID.",
          commonConfusions: [
            "Use your legal name, not a nickname or preferred name",
            "Include middle names if they appear on your ID"
          ]
        },
        {
          type: "question",
          id: "q-date-of-birth",
          fieldId: "date_of_birth",
          originalText: "What is your date of birth?",
          fieldType: "date",
          required: true,
          context: "Your birth date as shown on your ID.",
          commonConfusions: []
        },
        {
          type: "question",
          id: "q-sin",
          fieldId: "sin",
          originalText: "What is your Social Insurance Number (SIN)?",
          fieldType: "text",
          required: true,
          placeholder: "XXX-XXX-XXX",
          context: "Your 9-digit SIN. This is required to process your application and check your eligibility.",
          commonConfusions: [
            "Don't have a SIN? You can apply for one at Service Canada",
            "SINs starting with 9 are temporary - include your expiry date"
          ],
          validation: {
            pattern: "^\\d{3}-?\\d{3}-?\\d{3}$"
          }
        },
        {
          type: "definition",
          id: "def-sin",
          term: "Social Insurance Number (SIN)",
          originalText: "A 9-digit number issued by the Government of Canada for working and accessing government programs.",
          context: "Your SIN is like a key to government services. It's used to track your taxes, benefits, and work history. Keep it safe and don't share it unnecessarily.",
          commonConfusions: [
            "SIN is different from a health card number",
            "Everyone who works in Canada needs a SIN"
          ]
        },
        {
          type: "question",
          id: "q-address",
          fieldId: "address",
          originalText: "What is your current mailing address?",
          fieldType: "textarea",
          required: true,
          placeholder: "Street address, City, Province, Postal code",
          context: "Where you currently live and can receive mail. This must be an Ontario address.",
          commonConfusions: [
            "If staying with someone temporarily, use that address",
            "Shelter addresses are acceptable"
          ]
        },
        {
          type: "question",
          id: "q-postal-code",
          fieldId: "postal_code",
          originalText: "Postal Code",
          fieldType: "text",
          required: true,
          placeholder: "A1A 1A1",
          context: "Your Ontario postal code. Must start with K, L, M, N, or P.",
          commonConfusions: [],
          validation: {
            pattern: "^[KLMNP]\\d[A-Z]\\s?\\d[A-Z]\\d$"
          }
        },
        {
          type: "question",
          id: "q-phone",
          fieldId: "phone",
          originalText: "What phone number can we reach you at?",
          fieldType: "text",
          required: true,
          placeholder: "(XXX) XXX-XXXX",
          context: "A phone number where you can be reached. If you don't have a phone, you can use a friend's or family member's number with their permission.",
          commonConfusions: [
            "Cell phone or landline both work",
            "Include area code"
          ]
        },
        {
          type: "question",
          id: "q-email",
          fieldId: "email",
          originalText: "What is your email address? (optional)",
          fieldType: "text",
          required: false,
          placeholder: "email@example.com",
          context: "An email address helps speed up communication about your application.",
          commonConfusions: [
            "Free email services like Gmail work fine",
            "Check spam folder for government emails"
          ]
        }
      ]
    },

    // SECTION 2: Household Information
    {
      id: "section-household",
      title: "Household Information",
      description: "Tell us about who lives with you",
      items: [
        {
          type: "definition",
          id: "def-benefit-unit",
          term: "Benefit Unit",
          originalText: "Benefit unit means all persons who customarily purchase and prepare food together for home consumption.",
          context: "Ontario defines a benefit unit as people who live together AND share food expenses/meals. This is different from just 'roommates' or 'people at your address'.",
          commonConfusions: [
            "Roommates who buy food separately are NOT in your benefit unit",
            "A partner you've lived with for 3+ months IS in your benefit unit (Ontario's common-law rule)",
            "Children under 18 are always in your benefit unit"
          ]
        },
        {
          type: "instruction",
          id: "inst-include-spouse",
          originalText: "Include your spouse or same-sex partner, even if they are temporarily absent from the home.",
          context: "If you're married or common-law (living together 3+ months), you MUST include your partner even if they're away temporarily (hospital, work trip, etc.).",
          commonConfusions: [
            "Separated but still living together - you must include them",
            "Partner in hospital - still include them",
            "Partner in jail for less than 90 days - still include them"
          ]
        },
        {
          type: "question",
          id: "q-marital-status",
          fieldId: "marital_status",
          originalText: "What is your marital status?",
          fieldType: "select",
          options: ["Single", "Married", "Common-law", "Separated", "Divorced", "Widowed"],
          required: true,
          context: "In Ontario, common-law means you've lived with a partner for 3 continuous months. This affects your benefit calculation.",
          commonConfusions: [
            "Living together 3+ months = common-law in Ontario",
            "Separated but same house = still need to report spouse"
          ]
        },
        {
          type: "question",
          id: "q-household-size",
          fieldId: "household_size",
          originalText: "How many people are in your benefit unit, including yourself?",
          fieldType: "number",
          required: true,
          placeholder: "Enter a number",
          context: "Count yourself + spouse/partner + dependent children. Don't count roommates who buy their own food.",
          commonConfusions: [
            "Count children under 18",
            "Count adult children 18-24 if in school full-time",
            "Don't count roommates who buy their own groceries"
          ],
          validation: {
            min: 1,
            max: 20
          }
        },
        {
          type: "question",
          id: "q-household-members",
          fieldId: "household_members",
          originalText: "List all members of your benefit unit, including yourself. Provide full legal name, date of birth, and relationship to you.",
          fieldType: "textarea",
          required: true,
          placeholder: "1. John Smith (Self) - Jan 15, 1985\n2. Jane Smith (Spouse) - Mar 22, 1987\n3. ...",
          context: "List everyone who lives with you AND shares meals/food expenses. Include yourself first, then spouse/partner, then children.",
          commonConfusions: [
            "Adult children (18+) not in school - they apply separately",
            "Roommates who buy their own food - don't include them"
          ],
          commonMistake: {
            pattern: "household_size > 1 but only one person listed",
            warning: "You indicated a household size greater than 1, but only listed yourself.",
            suggestion: "Add the other members of your household."
          }
        },
        {
          type: "warning",
          id: "warn-common-law",
          originalText: "If you have been living with a partner for 3 consecutive months or more, you are considered common-law and must include their income.",
          context: "Ontario has a 3-month rule for common-law relationships. This is shorter than the federal rule (12 months). If you've lived with your partner for 3+ months, their income counts.",
          severity: "caution"
        },
        {
          type: "question",
          id: "q-dependents-under-18",
          fieldId: "dependents_under_18",
          originalText: "How many dependent children under 18 live with you?",
          fieldType: "number",
          required: true,
          placeholder: "0",
          context: "Count all children under 18 who live with you and depend on you for support.",
          commonConfusions: [
            "Include step-children living with you",
            "Include children you have custody of",
            "Don't include children who live with their other parent"
          ],
          validation: {
            min: 0,
            max: 15
          }
        }
      ]
    },

    // SECTION 3: Income Information
    {
      id: "section-income",
      title: "Income Information",
      description: "Tell us about your income sources",
      items: [
        {
          type: "instruction",
          id: "inst-gross-income",
          originalText: "Report gross income (before deductions). Include all sources of employment income.",
          context: "GROSS income is your pay BEFORE taxes, CPP, and EI are taken out. Look at your pay stub - it's the bigger number at the top, not your take-home pay.",
          commonConfusions: [
            "Net pay (take-home) vs Gross pay - use GROSS",
            "Where to find it on pay stub - usually labeled 'Gross Pay' or 'Total Earnings'"
          ]
        },
        {
          type: "definition",
          id: "def-gross-income",
          term: "Gross Income",
          originalText: "Total earnings before any deductions such as taxes, CPP contributions, or EI premiums.",
          context: "Think of gross income as your 'full' pay before the government takes its share. It's always higher than what you actually receive in your bank account.",
          commonConfusions: [
            "Gross = bigger number (before deductions)",
            "Net = smaller number (what you take home)"
          ]
        },
        {
          type: "question",
          id: "q-employment-status",
          fieldId: "employment_status",
          originalText: "What is your current employment status?",
          fieldType: "select",
          options: ["Not employed", "Employed full-time", "Employed part-time", "Self-employed", "Seasonal work", "Multiple jobs"],
          required: true,
          context: "Select the option that best describes your current work situation.",
          commonConfusions: [
            "Part-time = less than 30 hours per week",
            "Gig work (Uber, DoorDash) = self-employed"
          ]
        },
        {
          type: "question",
          id: "q-gross-income",
          fieldId: "gross_income",
          originalText: "What is your total gross monthly employment income?",
          fieldType: "number",
          required: true,
          placeholder: "Enter amount in dollars",
          context: "Enter your GROSS (before tax) monthly income from all jobs. If paid bi-weekly, multiply by 2.17 to get monthly amount.",
          commonConfusions: [
            "Gross vs net - use the BIGGER number (before deductions)",
            "Bi-weekly to monthly - multiply by 2.17, not 2",
            "Weekly to monthly - multiply by 4.33"
          ],
          commonMistake: {
            pattern: "amount between 1000-2000 for full-time work",
            warning: "This looks like it might be your net (take-home) pay instead of gross pay.",
            suggestion: "Gross pay is usually 20-30% higher than net pay. Check your pay stub for 'Gross Pay' or 'Total Earnings'."
          },
          validation: {
            min: 0
          }
        },
        {
          type: "definition",
          id: "def-self-employment",
          term: "Self-Employment Income",
          originalText: "Self-employment income includes income from operating a business, freelance work, or gig economy work such as Uber, DoorDash, or Etsy sales.",
          context: "If you make money outside of a regular job - freelancing, driving Uber, selling on Etsy, doing odd jobs for cash - that's self-employment income.",
          commonConfusions: [
            "Driving Uber occasionally - yes, still counts",
            "Selling old stuff on Facebook Marketplace - occasional sales don't count, but regular selling does",
            "Cash jobs (babysitting, lawn care) - yes, counts as self-employment"
          ]
        },
        {
          type: "question",
          id: "q-self-employment",
          fieldId: "has_self_employment",
          originalText: "Do you have any self-employment, gig work, or freelance income?",
          fieldType: "select",
          options: ["No", "Yes"],
          required: true,
          context: "Answer Yes if you earn ANY money outside of a regular employee job.",
          commonConfusions: [
            "Even occasional gig work counts",
            "Cash payments still need to be reported"
          ]
        },
        {
          type: "question",
          id: "q-self-employment-income",
          fieldId: "self_employment_income",
          originalText: "What is your average monthly self-employment income (after business expenses)?",
          fieldType: "number",
          required: false,
          placeholder: "Enter amount in dollars",
          context: "For self-employment, report your NET income (what's left after business expenses). This is different from employment income where you report GROSS.",
          commonConfusions: [
            "Can deduct: gas, supplies, phone used for work",
            "Cannot deduct: personal expenses, meals"
          ],
          validation: {
            min: 0
          }
        },
        {
          type: "question",
          id: "q-other-income",
          fieldId: "other_income",
          originalText: "Do you receive any other income? (EI, child support, pensions, etc.)",
          fieldType: "select",
          options: ["No", "Yes"],
          required: true,
          context: "Other income includes: Employment Insurance (EI), child support, spousal support, pensions, disability payments, WSIB, rental income, investment income.",
          commonConfusions: [
            "Child tax benefit (CCB) - don't include, it's exempt",
            "GST/HST credit - don't include, it's exempt",
            "CERB repayments - mention if you're repaying"
          ]
        },
        {
          type: "question",
          id: "q-other-income-details",
          fieldId: "other_income_details",
          originalText: "List your other income sources and monthly amounts.",
          fieldType: "textarea",
          required: false,
          placeholder: "EI: $1,200/month\nChild support: $400/month",
          context: "List each source of income and the monthly amount. Be specific about the type.",
          commonConfusions: []
        },
        {
          type: "warning",
          id: "warn-report-all-income",
          originalText: "Failure to report all income may result in an overpayment that must be repaid.",
          context: "OW checks your income through CRA and other sources. If you don't report income and they find out, you'll have to pay back benefits plus potentially face penalties.",
          severity: "caution"
        }
      ]
    },

    // SECTION 4: Assets
    {
      id: "section-assets",
      title: "Assets and Resources",
      description: "Tell us about what you own",
      items: [
        {
          type: "instruction",
          id: "inst-assets-intro",
          originalText: "List all assets owned by you and members of your benefit unit. Some assets are exempt from the asset limit.",
          context: "You need to tell us about everything you own that has value. But don't worry - many things are exempt (your home, one car, RRSPs up to a limit).",
          commonConfusions: [
            "Your primary residence is exempt - don't count it",
            "One vehicle is exempt - only count additional vehicles",
            "RRSPs have exemptions - we'll calculate"
          ]
        },
        {
          type: "definition",
          id: "def-liquid-assets",
          term: "Liquid Assets",
          originalText: "Assets that can be easily converted to cash, including bank accounts, investments, and cash on hand.",
          context: "Liquid assets are things you can turn into cash quickly - money in the bank, stocks you can sell, cash in your wallet. These count toward the asset limit.",
          commonConfusions: [
            "Checking and savings accounts - liquid",
            "Stocks and bonds - liquid",
            "Your car - not liquid (exempt)",
            "Your house - not liquid (exempt)"
          ]
        },
        {
          type: "question",
          id: "q-bank-accounts",
          fieldId: "bank_account_total",
          originalText: "What is the total balance of all bank accounts (checking, savings) for everyone in your benefit unit?",
          fieldType: "number",
          required: true,
          placeholder: "Enter total in dollars",
          context: "Add up all bank accounts for you and everyone in your benefit unit. Include checking, savings, and any other accounts.",
          commonConfusions: [
            "Include joint accounts",
            "Include children's accounts if you control them",
            "Use current balance, not average"
          ],
          validation: {
            min: 0
          }
        },
        {
          type: "question",
          id: "q-investments",
          fieldId: "investments_total",
          originalText: "What is the total value of investments (stocks, bonds, GICs, mutual funds)?",
          fieldType: "number",
          required: true,
          placeholder: "Enter total in dollars",
          context: "Include all non-RRSP investments. TFSAs count as liquid assets.",
          commonConfusions: [
            "TFSAs - count the full value",
            "RRSPs - don't include here (separate question)",
            "Employer pension - don't include (not accessible)"
          ],
          validation: {
            min: 0
          }
        },
        {
          type: "question",
          id: "q-vehicles",
          fieldId: "vehicles_count",
          originalText: "How many vehicles do you own?",
          fieldType: "number",
          required: true,
          placeholder: "0",
          context: "One vehicle is exempt. Additional vehicles may count toward your asset limit depending on their value.",
          commonConfusions: [
            "First vehicle is exempt regardless of value",
            "Second vehicle - value counts if over $15,000",
            "Vehicles used for work may have additional exemptions"
          ],
          validation: {
            min: 0,
            max: 10
          }
        },
        {
          type: "question",
          id: "q-property",
          fieldId: "owns_property",
          originalText: "Do you own any property other than your primary residence?",
          fieldType: "select",
          options: ["No", "Yes"],
          required: true,
          context: "Your primary home (where you live) is exempt. But vacation properties, rental properties, or land you own would count.",
          commonConfusions: [
            "Primary residence - exempt, don't include",
            "Cottage or vacation home - not exempt",
            "Rental property - not exempt"
          ]
        },
        {
          type: "warning",
          id: "warn-asset-limit",
          originalText: "Asset limits: $10,000 for single applicants, $15,000 for couples/families. Some assets are exempt.",
          context: "If your non-exempt assets are over these limits, you may not qualify. But many assets are exempt - we'll help you figure out what counts.",
          severity: "info"
        }
      ]
    },

    // SECTION 5: Housing
    {
      id: "section-housing",
      title: "Housing Situation",
      description: "Tell us about where you live",
      items: [
        {
          type: "question",
          id: "q-housing-type",
          fieldId: "housing_type",
          originalText: "What is your current housing situation?",
          fieldType: "select",
          options: [
            "Renting an apartment/house",
            "Own my home",
            "Living with family/friends (no rent)",
            "Living with family/friends (paying rent)",
            "Rooming house",
            "Shelter",
            "No fixed address (homeless)"
          ],
          required: true,
          context: "Your housing situation affects your benefit amount. Be honest - there's help available for all situations.",
          commonConfusions: [
            "Couch surfing = no fixed address",
            "Staying with parents but paying them = paying rent"
          ]
        },
        {
          type: "question",
          id: "q-monthly-rent",
          fieldId: "monthly_rent",
          originalText: "How much do you pay for rent/housing each month?",
          fieldType: "number",
          required: true,
          placeholder: "Enter amount in dollars",
          context: "Enter your monthly rent or mortgage payment. If you don't pay rent, enter 0.",
          commonConfusions: [
            "Include only the rent/mortgage amount",
            "Don't include utilities unless they're included in rent",
            "If sharing rent with roommates, only include YOUR portion"
          ],
          validation: {
            min: 0
          }
        },
        {
          type: "question",
          id: "q-utilities-included",
          fieldId: "utilities_included",
          originalText: "Are utilities (heat, hydro) included in your rent?",
          fieldType: "select",
          options: ["Yes, all utilities included", "Some utilities included", "No, I pay all utilities separately", "N/A - I don't pay rent"],
          required: true,
          context: "If you pay utilities separately, you may be eligible for additional assistance.",
          commonConfusions: [
            "Hydro = electricity",
            "Heat could be gas, oil, or electric"
          ]
        },
        {
          type: "question",
          id: "q-utility-costs",
          fieldId: "utility_costs",
          originalText: "If you pay utilities separately, what is your average monthly cost?",
          fieldType: "number",
          required: false,
          placeholder: "Enter amount in dollars",
          context: "Average your utility bills over the year. Winter heating can be much higher than summer.",
          commonConfusions: [
            "Include: hydro, gas, heating oil, water if billed",
            "Don't include: phone, internet, cable"
          ],
          validation: {
            min: 0
          }
        },
        {
          type: "warning",
          id: "warn-eviction",
          originalText: "If you are facing eviction, additional emergency assistance may be available.",
          context: "If you have an eviction notice or are at risk of losing your housing, let your caseworker know. There may be emergency funds to help.",
          severity: "info"
        }
      ]
    },

    // SECTION 6: Employment History
    {
      id: "section-employment",
      title: "Employment History",
      description: "Tell us about your recent work history",
      items: [
        {
          type: "instruction",
          id: "inst-employment-intro",
          originalText: "Provide information about your most recent employment. This helps us understand your work history and any barriers to employment.",
          context: "Ontario Works requires you to be actively seeking work (unless exempt). Your employment history helps caseworkers connect you with the right support.",
          commonConfusions: [
            "If you've never worked, that's okay - just tell us",
            "Include part-time and casual work",
            "Gig work (Uber, DoorDash) counts as employment"
          ]
        },
        {
          type: "definition",
          id: "def-employment-termination",
          term: "Reason for Leaving Employment",
          originalText: "The circumstances under which your last job ended, such as layoff, resignation, termination, or contract completion.",
          context: "Why you left your last job matters for your application. Being laid off or having a contract end is different from quitting without reason.",
          commonConfusions: [
            "Laid off = employer ended your job (not your choice)",
            "Quit = you chose to leave",
            "Terminated = fired for cause",
            "Contract ended = job had a set end date"
          ]
        },
        {
          type: "question",
          id: "q-last-employer",
          fieldId: "last_employer",
          originalText: "What was the name of your most recent employer?",
          fieldType: "text",
          required: false,
          placeholder: "Company or employer name",
          context: "Enter the name of the last company or person you worked for. If you've never worked, leave this blank.",
          commonConfusions: [
            "Self-employed? Enter your business name or 'Self-employed'",
            "Multiple jobs? Enter the most recent one"
          ]
        },
        {
          type: "question",
          id: "q-last-job-title",
          fieldId: "last_job_title",
          originalText: "What was your job title or role?",
          fieldType: "text",
          required: false,
          placeholder: "e.g., Cashier, Server, Office Assistant",
          context: "Describe what you did at your last job.",
          commonConfusions: []
        },
        {
          type: "question",
          id: "q-reason-for-leaving",
          fieldId: "reason_for_leaving",
          originalText: "Why did you leave your last job?",
          fieldType: "select",
          options: [
            "Never employed",
            "Laid off / Downsized",
            "Contract or seasonal work ended",
            "Quit - found better opportunity",
            "Quit - personal or family reasons",
            "Quit - health reasons",
            "Terminated / Fired",
            "Business closed",
            "Retired",
            "Other"
          ],
          required: true,
          context: "Select the option that best describes why your last job ended. Be honest - there's no 'wrong' answer.",
          commonConfusions: [
            "Downsizing and layoff are the same thing",
            "Quitting for health reasons is valid",
            "If your hours were cut to zero, that's a layoff"
          ]
        },
        {
          type: "question",
          id: "q-last-day-worked",
          fieldId: "last_day_worked",
          originalText: "What was your last day of work?",
          fieldType: "date",
          required: false,
          placeholder: "YYYY-MM-DD",
          context: "The last day you actually worked at any job. This helps determine your eligibility timing.",
          commonConfusions: [
            "Use your actual last working day, not your official end date",
            "If on leave, use the last day you worked"
          ]
        },
        {
          type: "question",
          id: "q-seeking-work",
          fieldId: "seeking_work",
          originalText: "Are you currently looking for work?",
          fieldType: "select",
          options: [
            "Yes, actively looking",
            "Yes, but facing barriers",
            "No, unable to work (health reasons)",
            "No, caring for family member",
            "No, in school or training",
            "No, other reason"
          ],
          required: true,
          context: "Ontario Works generally requires you to look for work, but there are valid exemptions (health, caregiving, education).",
          commonConfusions: [
            "Barriers include: no transportation, childcare issues, health limitations",
            "You may be exempt from job search if caring for young children",
            "Being in school can exempt you from job search"
          ]
        },
        {
          type: "question",
          id: "q-employment-barriers",
          fieldId: "employment_barriers",
          originalText: "What barriers, if any, are preventing you from finding work? (Select all that apply)",
          fieldType: "textarea",
          required: false,
          placeholder: "e.g., No transportation, childcare needs, health issues, language barriers, lack of experience",
          context: "List anything that makes it hard for you to find or keep a job. This helps us connect you with support services.",
          commonConfusions: [
            "Being honest helps - there are programs to address most barriers",
            "Common barriers: transportation, childcare, health, language, criminal record",
            "Mental health challenges are valid barriers"
          ]
        },
        {
          type: "warning",
          id: "warn-job-search",
          originalText: "Ontario Works recipients are generally required to participate in employment assistance activities and actively seek employment.",
          context: "This is an important requirement. You'll work with a caseworker to create an employment plan. There are exemptions for people who can't work due to health, caregiving, or education.",
          severity: "info"
        }
      ]
    },

    // SECTION 7: Declaration
    {
      id: "section-declaration",
      title: "Declaration and Consent",
      description: "Review and sign your application",
      items: [
        {
          type: "legal",
          id: "legal-declaration",
          originalText: "I declare that the information provided in this application is true and complete to the best of my knowledge. I understand that providing false or incomplete information is an offence under the Ontario Works Act, 1997 and may result in prosecution, repayment of benefits, and/or removal from the program.",
          context: "This is a legal promise that everything you've told us is true. Double-check your answers before signing. Mistakes are okay if you fix them, but intentional lies can have serious consequences.",
          requiresAcknowledgment: true,
          commonConfusions: [
            "Honest mistakes won't get you in trouble - just report them",
            "If your situation changes after applying, report it within 10 days"
          ]
        },
        {
          type: "legal",
          id: "legal-consent",
          originalText: "I consent to Ontario Works collecting, using, and disclosing my personal information for the purpose of determining and managing my eligibility for assistance, as permitted under the Ontario Works Act, 1997 and the Freedom of Information and Protection of Privacy Act.",
          context: "This gives Ontario Works permission to check your information (like with CRA for income verification) and share it with relevant agencies to process your application.",
          requiresAcknowledgment: true,
          commonConfusions: [
            "They will verify income with CRA",
            "They may contact your landlord to verify rent",
            "Information is kept confidential"
          ]
        },
        {
          type: "warning",
          id: "warn-false-info",
          originalText: "Providing false or incomplete information is an offence under the Ontario Works Act, 1997 and may result in prosecution.",
          context: "This is a legal warning. Be honest and complete. If you lie or hide information, you could face legal consequences and have to repay benefits.",
          severity: "critical"
        },
        {
          type: "question",
          id: "q-declaration-agree",
          fieldId: "declaration_agreed",
          originalText: "I have read and agree to the declaration above.",
          fieldType: "checkbox",
          required: true,
          context: "By checking this box, you confirm that everything in your application is true and you understand your responsibilities.",
          commonConfusions: []
        },
        {
          type: "question",
          id: "q-signature-date",
          fieldId: "signature_date",
          originalText: "Date of signature",
          fieldType: "date",
          required: true,
          context: "Today's date when you submit this application.",
          commonConfusions: []
        }
      ]
    }
  ]
};

// Export a forms registry for future expansion
export const formsRegistry: Record<string, FormTemplate> = {
  "ontario-works": ontarioWorksForm
};
