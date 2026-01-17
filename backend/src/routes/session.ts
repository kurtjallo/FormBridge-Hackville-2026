import { Router, Request, Response } from 'express';
import { Session } from '../models/Session';
import { SaveSessionRequest } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const sessionRouter = Router();

// GET /session/:id - Load existing session
sessionRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      sessionId: session._id,
      answers: session.answers,
      conversations: session.conversations,
      completedSections: session.completedSections,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    });
  } catch (error) {
    console.error('Error loading session:', error);
    res.status(500).json({ error: 'Failed to load session' });
  }
});

// POST /session - Create or update session
sessionRouter.post('/', async (req: Request<{}, {}, SaveSessionRequest>, res: Response) => {
  try {
    const { sessionId, answers, conversations, completedSections } = req.body;

    const id = sessionId || uuidv4();

    const session = await Session.findByIdAndUpdate(
      id,
      {
        _id: id,
        answers: answers || {},
        conversations: conversations || {},
        completedSections: completedSections || [],
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({
      sessionId: session._id,
      message: sessionId ? 'Session updated' : 'Session created',
    });
  } catch (error) {
    console.error('Error saving session:', error);
    res.status(500).json({ error: 'Failed to save session' });
  }
});
