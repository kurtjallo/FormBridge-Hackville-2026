# Backend Task Split

## Person 1: Data & Forms

**Files you own:**
```
backend/src/
├── data/
│   └── ontario-works.ts      # NEW - Full form template with all content types
├── routes/
│   ├── forms.ts              # NEW - GET /forms, GET /forms/:id
│   └── eligibility.ts        # NEW - POST /eligibility
└── types/
    └── form.ts               # NEW - All TypeScript interfaces for forms
```

**Your tasks:**
1. Create the form data file with eligibility questions, required documents, and all sections/items
2. Build `GET /forms` - returns list of available forms
3. Build `GET /forms/:formId` - returns full form template
4. Build `POST /eligibility` - checks if user qualifies based on answers
5. Define all TypeScript interfaces (FormTemplate, FormItem, EligibilityQuestion, etc.)

---

## Person 2: AI & Services

**Files you own:**
```
backend/src/
├── services/
│   ├── gemini.ts             # NEW - Gemini API wrapper (reusable)
│   └── promptBuilder.ts      # NEW - Build prompts for each item type
└── routes/
    └── explain.ts            # NEW - POST /explain endpoint
```

**Your tasks:**
1. Create Gemini service wrapper (initialize client, handle errors, rate limits)
2. Build prompt templates for each item type (question, definition, instruction, warning, legal)
3. Build `POST /explain` - returns plain language explanation for any form item
4. Refactor existing `/chat` route to use the new Gemini service and prompt builder

---

## Shared/Coordination

| File | Who touches it | When |
|------|----------------|------|
| `index.ts` | Both | Coordinate when adding route imports - do it at the end together |
| `routes/chat.ts` | Person 2 | Refactor to use new services |
| `routes/validate.ts` | Person 2 | Minor updates if needed |
| `models/session.ts` | Neither | Already done, leave it |

---

## Dependency Order

```
Person 1 creates types/form.ts FIRST (30 min)
    ↓
Both can work in parallel after types exist
    ↓
Merge together, wire routes in index.ts
```

Person 1 should push the `types/form.ts` file first since Person 2 will import those interfaces in the services.
