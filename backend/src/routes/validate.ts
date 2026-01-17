import { Router, Request, Response } from 'express';
import { ValidateRequest, ValidateResponse, ValidationIssue } from '../types';

export const validateRouter = Router();

// POST /validate - Check form answers for consistency
validateRouter.post('/', (req: Request<{}, {}, ValidateRequest>, res: Response) => {
  const { answers } = req.body;
  const issues: ValidationIssue[] = [];

  // Check employment income consistency
  if (answers.employmentIncome === 'Yes' && !answers.monthlyEarnings) {
    issues.push({
      fieldId: 'monthlyEarnings',
      message: 'You indicated you have employment income but did not enter monthly earnings',
      severity: 'warning',
    });
  }

  if (answers.employmentIncome === 'No' && answers.monthlyEarnings) {
    issues.push({
      fieldId: 'employmentIncome',
      message: 'You entered monthly earnings but indicated no employment income',
      severity: 'error',
    });
  }

  // Check other income consistency
  if (answers.otherIncome === 'Yes' && !answers.otherIncomeDetails) {
    issues.push({
      fieldId: 'otherIncomeDetails',
      message: 'You indicated other income but did not provide details',
      severity: 'warning',
    });
  }

  // Check housing consistency
  if (answers.housingType === 'Homeless/shelter' && answers.monthlyRent) {
    issues.push({
      fieldId: 'monthlyRent',
      message: 'You indicated homeless/shelter status but entered a rent amount',
      severity: 'warning',
    });
  }

  if (answers.housingType &&
      answers.housingType !== 'Homeless/shelter' &&
      answers.housingType !== 'Living with family/friends (not paying rent)' &&
      !answers.monthlyRent) {
    issues.push({
      fieldId: 'monthlyRent',
      message: 'Please enter your monthly rent or mortgage payment',
      severity: 'warning',
    });
  }

  // Check marital status and other adults consistency
  if ((answers.maritalStatus === 'Married' || answers.maritalStatus === 'Common-law') &&
      answers.otherAdults === 'No') {
    issues.push({
      fieldId: 'otherAdults',
      message: 'You indicated married/common-law status but said no other adults live with you',
      severity: 'error',
    });
  }

  // Check review declarations
  const declarations = ['infoAccurate', 'reportChanges', 'consentToVerify'];
  const missingDeclarations = declarations.filter(d => !answers[d]);
  if (missingDeclarations.length > 0 && Object.keys(answers).length > 5) {
    missingDeclarations.forEach(fieldId => {
      issues.push({
        fieldId,
        message: 'This declaration must be checked before submitting',
        severity: 'error',
      });
    });
  }

  const response: ValidateResponse = {
    valid: issues.filter(i => i.severity === 'error').length === 0,
    issues,
  };

  res.json(response);
});
