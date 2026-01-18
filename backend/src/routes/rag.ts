import { Router, Request, Response } from 'express';
import { KnowledgeDoc } from '../models/KnowledgeDoc';
import { searchKnowledge, addKnowledgeDoc, seedKnowledgeBase, getRAGContext, migrateEmbeddings } from '../services/ragService';

export const ragRouter = Router();

// GET /rag/search - Search knowledge base
ragRouter.get('/search', async (req: Request, res: Response) => {
    try {
        const { q, category, formId, limit } = req.query;

        if (!q || typeof q !== 'string') {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }

        const results = await searchKnowledge(q, {
            category: category as string,
            formId: formId as string,
            limit: limit ? parseInt(limit as string) : 3,
        });

        res.json({
            query: q,
            results: results.map((r) => ({
                id: r.doc._id,
                title: r.doc.title,
                content: r.doc.content,
                category: r.doc.category,
                score: r.score,
            })),
        });
    } catch (error) {
        console.error('RAG search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// GET /rag/context - Get formatted RAG context for AI
ragRouter.get('/context', async (req: Request, res: Response) => {
    try {
        const { q, category, formId } = req.query;

        if (!q || typeof q !== 'string') {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }

        const context = await getRAGContext(
            q,
            category as string,
            formId as string
        );

        res.json({
            query: q,
            context,
        });
    } catch (error) {
        console.error('RAG context error:', error);
        res.status(500).json({ error: 'Failed to get context' });
    }
});

// POST /rag/seed - Seed the knowledge base with initial data
ragRouter.post('/seed', async (req: Request, res: Response) => {
    try {
        await seedKnowledgeBase();
        const count = await KnowledgeDoc.countDocuments();
        res.json({ message: 'Knowledge base seeded', documentCount: count });
    } catch (error) {
        console.error('RAG seed error:', error);
        res.status(500).json({ error: 'Failed to seed knowledge base' });
    }
});

// POST /rag/migrate - Migrate embeddings for documents without them
ragRouter.post('/migrate', async (req: Request, res: Response) => {
    try {
        console.log('Starting embedding migration...');
        const result = await migrateEmbeddings();
        res.json({
            message: 'Migration complete',
            migrated: result.migrated,
            failed: result.failed,
        });
    } catch (error) {
        console.error('RAG migrate error:', error);
        res.status(500).json({ error: 'Failed to migrate embeddings' });
    }
});

// GET /rag/docs - List all knowledge documents
ragRouter.get('/docs', async (req: Request, res: Response) => {
    try {
        const { category } = req.query;
        const filter = category ? { category } : {};

        const docs = await KnowledgeDoc.find(filter)
            .select('_id title category keywords embedding lastUpdated')
            .sort({ lastUpdated: -1 });

        // Include hasEmbedding flag for migration visibility
        const docsWithStatus = docs.map(doc => ({
            id: doc._id,
            title: doc.title,
            category: doc.category,
            keywords: doc.keywords,
            hasEmbedding: Array.isArray(doc.embedding) && doc.embedding.length > 0,
            lastUpdated: doc.lastUpdated,
        }));

        res.json({ documents: docsWithStatus });
    } catch (error) {
        console.error('RAG docs error:', error);
        res.status(500).json({ error: 'Failed to list documents' });
    }
});

// POST /rag/docs - Add a new knowledge document
ragRouter.post('/docs', async (req: Request, res: Response) => {
    try {
        const { category, formId, title, content, keywords, source } = req.body;

        if (!category || !title || !content) {
            return res.status(400).json({
                error: 'category, title, and content are required'
            });
        }

        const doc = await addKnowledgeDoc({
            category,
            formId,
            title,
            content,
            keywords: keywords || [],
            source,
        });

        res.status(201).json({
            message: 'Document added',
            document: {
                id: doc._id,
                title: doc.title,
                category: doc.category,
                hasEmbedding: Array.isArray(doc.embedding) && doc.embedding.length > 0,
            },
        });
    } catch (error) {
        console.error('RAG add doc error:', error);
        res.status(500).json({ error: 'Failed to add document' });
    }
});

// DELETE /rag/docs/:id - Delete a knowledge document
ragRouter.delete('/docs/:id', async (req: Request, res: Response) => {
    try {
        const result = await KnowledgeDoc.findByIdAndDelete(req.params.id);

        if (!result) {
            return res.status(404).json({ error: 'Document not found' });
        }

        res.json({ message: 'Document deleted' });
    } catch (error) {
        console.error('RAG delete doc error:', error);
        res.status(500).json({ error: 'Failed to delete document' });
    }
});

export default ragRouter;
