import { Router, Request, Response } from 'express';
import { formsRegistry, ontarioWorksForm } from '../data/ontario-works';
import { FormListItem } from '../types/form';

const router = Router();

// GET /forms - List all available forms
router.get('/', (req: Request, res: Response) => {
  const forms: FormListItem[] = Object.values(formsRegistry).map(form => ({
    id: form.id,
    name: form.name,
    description: form.description,
    estimatedTime: form.estimatedTime
  }));

  res.json({ forms });
});

// GET /forms/:formId - Get full form template
router.get('/:formId', (req: Request, res: Response) => {
  const { formId } = req.params;

  const form = formsRegistry[formId];

  if (!form) {
    res.status(404).json({
      error: 'Form not found',
      message: `No form exists with ID "${formId}"`,
      availableForms: Object.keys(formsRegistry)
    });
    return;
  }

  res.json({ form });
});

export default router;
