import { Router, Request, Response } from 'express';
import { chatAboutQuestion } from '../services/gemini';
import { ChatRequest, ChatResponse } from '../types';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      questionId,
      originalText,
      fieldType,
      context,
      conversationHistory,
      userMessage,
      currentAnswers,
      language,
    } = req.body as ChatRequest;

    // Validate required fields
    if (!questionId || !originalText || !fieldType || !userMessage) {
      res.status(400).json({
        error: 'Missing required fields',
        required: ['questionId', 'originalText', 'fieldType', 'userMessage'],
      });
      return;
    }

    const result = await chatAboutQuestion({
      questionId,
      originalText,
      fieldType,
      context,
      conversationHistory: conversationHistory || [],
      userMessage,
      currentAnswers,
      language,
    });

    const response: ChatResponse = {
      message: result.message,
      suggestedAnswer: result.suggestedAnswer,
      confidence: result.confidence,
    };

    res.json(response);
  } catch (error) {
    console.error('Error in /chat:', error);
    res.status(500).json({
      error: 'Failed to generate response',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export { router as chatRouter };
