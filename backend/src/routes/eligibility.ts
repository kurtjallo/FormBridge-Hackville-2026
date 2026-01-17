import { Router, Request, Response } from 'express';
import { formsRegistry } from '../data/ontario-works';
import { EligibilityRequest, EligibilityResponse } from '../types/form';

const router = Router();

// POST /eligibility - Check if user likely qualifies based on quick questions
router.post('/', (req: Request, res: Response) => {
  const { formId, answers } = req.body as EligibilityRequest;

  // Validate request
  if (!formId) {
    res.status(400).json({ error: 'formId is required' });
    return;
  }

  if (!answers || typeof answers !== 'object') {
    res.status(400).json({ error: 'answers object is required' });
    return;
  }

  // Get form template
  const form = formsRegistry[formId];
  if (!form) {
    res.status(404).json({ error: `Form "${formId}" not found` });
    return;
  }

  const issues: string[] = [];
  const warnings: string[] = [];

  // Check each eligibility question
  for (const question of form.eligibilityQuestions) {
    const answer = answers[question.id];

    // Skip if no answer provided for this question
    if (answer === undefined) continue;

    // Check if this answer triggers disqualification
    // disqualifyIf: true means "Yes" to this question is bad
    // disqualifyIf: false means "No" to this question is bad
    const isDisqualifying = question.disqualifyIf === answer;

    if (isDisqualifying) {
      // Some disqualifications are soft (warnings) vs hard (issues)
      // For now, treat asset-related ones as warnings since exemptions may apply
      if (question.id.includes('asset') || question.id === 'eq-4') {
        warnings.push(question.disqualifyMessage);
      } else {
        issues.push(question.disqualifyMessage);
      }
    }
  }

  // Determine overall eligibility
  const eligible = issues.length === 0;

  let message: string;
  if (eligible && warnings.length === 0) {
    message = "Based on your answers, you likely qualify for Ontario Works. Let's continue with your application.";
  } else if (eligible && warnings.length > 0) {
    message = "Based on your answers, you may qualify for Ontario Works, but there are some things to note. We recommend continuing with your application.";
  } else {
    message = "Based on your answers, you may not qualify for Ontario Works at this time. However, we recommend speaking with a caseworker as exemptions may apply to your situation.";
  }

  const response: EligibilityResponse = {
    eligible,
    message,
    issues,
    warnings
  };

  res.json(response);
});

export default router;
