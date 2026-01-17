import { Router, Request, Response } from 'express';
import { demoSession, getFreshDemoSession } from '../data/demo-session';
import { Session } from '../models/Session';

const router = Router();

/**
 * GET /demo/session
 * Returns the demo session data for demonstration purposes
 * This allows the frontend to load a pre-filled form with realistic data
 */
router.get('/session', async (req: Request, res: Response) => {
  try {
    // Check if demo session exists in database
    let session = await Session.findById(demoSession._id);

    if (!session) {
      // Create the demo session in database if it doesn't exist
      const freshDemo = getFreshDemoSession();
      session = await Session.create({
        _id: freshDemo._id,
        answers: freshDemo.answers,
        conversations: freshDemo.conversations,
        completedSections: freshDemo.completedSections,
      });
    }

    res.json({
      sessionId: session._id,
      answers: session.answers,
      conversations: session.conversations,
      completedSections: session.completedSections,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      isDemo: true,
      demoPersona: {
        name: "Maria Garcia",
        scenario: "Single mother, recently laid off, looking for work with childcare barriers"
      }
    });
  } catch (error) {
    console.error('Error loading demo session:', error);
    res.status(500).json({
      error: 'Failed to load demo session',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /demo/reset
 * Resets the demo session to its initial state
 * Useful for starting a fresh demo
 */
router.post('/reset', async (req: Request, res: Response) => {
  try {
    const freshDemo = getFreshDemoSession();

    // Delete existing demo session and recreate
    await Session.findByIdAndDelete(demoSession._id);

    const session = await Session.create({
      _id: freshDemo._id,
      answers: freshDemo.answers,
      conversations: freshDemo.conversations,
      completedSections: freshDemo.completedSections,
    });

    res.json({
      message: 'Demo session reset successfully',
      sessionId: session._id,
      answers: session.answers,
      completedSections: session.completedSections,
      isDemo: true
    });
  } catch (error) {
    console.error('Error resetting demo session:', error);
    res.status(500).json({
      error: 'Failed to reset demo session',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /demo/personas
 * Returns available demo personas (for future expansion)
 */
router.get('/personas', (req: Request, res: Response) => {
  res.json({
    personas: [
      {
        id: "demo-maria-garcia",
        name: "Maria Garcia",
        description: "Single mother, recently laid off, childcare barriers",
        scenario: "Part-time cashier laid off due to store downsizing. Has 6-year-old daughter. Receiving child support. Looking for work but needs flexible hours for childcare.",
        sections_completed: 6,
        total_sections: 7
      }
      // Future personas can be added here
      // {
      //   id: "demo-john-smith",
      //   name: "John Smith",
      //   description: "Recently arrived immigrant, language barriers",
      //   ...
      // }
    ]
  });
});

export default router;
