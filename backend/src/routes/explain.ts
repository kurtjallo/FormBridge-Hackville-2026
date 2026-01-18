import { Router, Request, Response } from 'express';
import { explainQuestion } from '../services/gemini';
import { ExplainRequest, ExplainResponse } from '../types';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      questionId,
      originalText,
      fieldType,
      required,
      context,
      commonConfusions,
      userContext,
      language,
    } = req.body as ExplainRequest;

    // Validate required fields
    if (!questionId || !originalText || !fieldType) {
      res.status(400).json({
        error: 'Missing required fields',
        required: ['questionId', 'originalText', 'fieldType'],
      });
      return;
    }

    const explanation = await explainQuestion({
      questionId,
      originalText,
      fieldType,
      required: required ?? false,
      context,
      commonConfusions,
      userContext,
      language,
    });

    const response: ExplainResponse = {
      explanation,
      questionId,
    };

    res.json(response);
  } catch (error) {
    console.error('Error in /explain:', error);
    res.status(500).json({
      error: 'Failed to generate explanation',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export { router as explainRouter };
