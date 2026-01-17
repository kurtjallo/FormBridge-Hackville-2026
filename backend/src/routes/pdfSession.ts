import { Router, Request, Response } from 'express';
import { PDFSession, IPDFSession } from '../models/PDFSession';
import { v4 as uuidv4 } from 'uuid';

export const pdfSessionRouter = Router();

// Types for request bodies
interface CreatePDFSessionRequest {
    formId: string;
    formName: string;
    category: string;
}

interface UpdatePDFSessionRequest {
    fieldValues?: Record<string, string>;
    lastPage?: number;
    progress?: number;
    status?: 'in_progress' | 'completed' | 'abandoned';
}

interface AddChatMessageRequest {
    fieldId?: string;
    role: 'user' | 'assistant';
    content: string;
}

// GET /pdf-session/:id - Load existing PDF session
pdfSessionRouter.get('/:id', async (req: Request, res: Response) => {
    try {
        const session = await PDFSession.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json({
            sessionId: session._id,
            formId: session.formId,
            formName: session.formName,
            category: session.category,
            fieldValues: session.fieldValues,
            lastPage: session.lastPage,
            progress: session.progress,
            status: session.status,
            chatHistory: session.chatHistory,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
        });
    } catch (error) {
        console.error('Error loading PDF session:', error);
        res.status(500).json({ error: 'Failed to load session' });
    }
});

// GET /pdf-session/form/:formId - Get all sessions for a specific form
pdfSessionRouter.get('/form/:formId', async (req: Request, res: Response) => {
    try {
        const sessions = await PDFSession.find({
            formId: req.params.formId
        })
            .sort({ updatedAt: -1 })
            .limit(10);

        res.json({ sessions });
    } catch (error) {
        console.error('Error loading form sessions:', error);
        res.status(500).json({ error: 'Failed to load sessions' });
    }
});

// POST /pdf-session - Create new PDF session
pdfSessionRouter.post('/', async (req: Request<{}, {}, CreatePDFSessionRequest>, res: Response) => {
    try {
        const { formId, formName, category } = req.body;

        if (!formId || !formName || !category) {
            return res.status(400).json({ error: 'formId, formName, and category are required' });
        }

        const sessionId = uuidv4();

        const session = await PDFSession.create({
            _id: sessionId,
            formId,
            formName,
            category,
            fieldValues: {},
            lastPage: 1,
            progress: 0,
            status: 'in_progress',
            chatHistory: [],
        });

        res.status(201).json({
            sessionId: session._id,
            message: 'Session created',
        });
    } catch (error) {
        console.error('Error creating PDF session:', error);
        res.status(500).json({ error: 'Failed to create session' });
    }
});

// PATCH /pdf-session/:id - Update PDF session (field values, page, progress)
pdfSessionRouter.patch('/:id', async (req: Request<{ id: string }, {}, UpdatePDFSessionRequest>, res: Response) => {
    try {
        const { fieldValues, lastPage, progress, status } = req.body;

        const updateData: Partial<IPDFSession> = {};

        if (fieldValues !== undefined) {
            // Merge field values instead of replacing
            const session = await PDFSession.findById(req.params.id);
            if (session) {
                updateData.fieldValues = { ...session.fieldValues, ...fieldValues };
            }
        }
        if (lastPage !== undefined) updateData.lastPage = lastPage;
        if (progress !== undefined) updateData.progress = progress;
        if (status !== undefined) updateData.status = status;

        const session = await PDFSession.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json({
            sessionId: session._id,
            fieldValues: session.fieldValues,
            lastPage: session.lastPage,
            progress: session.progress,
            status: session.status,
            message: 'Session updated',
        });
    } catch (error) {
        console.error('Error updating PDF session:', error);
        res.status(500).json({ error: 'Failed to update session' });
    }
});

// POST /pdf-session/:id/chat - Add chat message to session
pdfSessionRouter.post('/:id/chat', async (req: Request<{ id: string }, {}, AddChatMessageRequest>, res: Response) => {
    try {
        const { fieldId, role, content } = req.body;

        if (!role || !content) {
            return res.status(400).json({ error: 'role and content are required' });
        }

        const chatMessage = {
            fieldId,
            role,
            content,
            timestamp: Date.now(),
        };

        const session = await PDFSession.findByIdAndUpdate(
            req.params.id,
            { $push: { chatHistory: chatMessage } },
            { new: true }
        );

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json({
            sessionId: session._id,
            chatHistory: session.chatHistory,
            message: 'Chat message added',
        });
    } catch (error) {
        console.error('Error adding chat message:', error);
        res.status(500).json({ error: 'Failed to add chat message' });
    }
});

// DELETE /pdf-session/:id - Delete a session
pdfSessionRouter.delete('/:id', async (req: Request, res: Response) => {
    try {
        const session = await PDFSession.findByIdAndDelete(req.params.id);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json({ message: 'Session deleted' });
    } catch (error) {
        console.error('Error deleting PDF session:', error);
        res.status(500).json({ error: 'Failed to delete session' });
    }
});

export default pdfSessionRouter;
