/**
 * PDF Ingestion API Routes
 *
 * Endpoints for triggering and monitoring PDF ingestion into the RAG system.
 */

import { Router, Request, Response } from 'express';
import {
    ingestPDF,
    getIngestionStatus,
    deleteChunksForForm,
    ingestAllPending
} from '../services/pdfIngestionService';

const router = Router();

/**
 * POST /api/ingestion/:formId
 *
 * Trigger ingestion for a specific PDF form.
 * Query params:
 *   - force=true: Re-ingest even if already done (deletes existing chunks first)
 */
router.post('/:formId', async (req: Request, res: Response) => {
    try {
        const { formId } = req.params;
        const force = req.query.force === 'true';

        console.log(`Ingestion requested for form ${formId}${force ? ' (force)' : ''}`);

        const result = await ingestPDF(formId, force);

        if (result.status === 'failed') {
            res.status(400).json(result);
            return;
        }

        res.json(result);
    } catch (error) {
        console.error('Error in /ingestion/:formId:', error);
        res.status(500).json({
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * GET /api/ingestion/:formId/status
 *
 * Check ingestion status for a specific form.
 */
router.get('/:formId/status', async (req: Request, res: Response) => {
    try {
        const { formId } = req.params;
        const status = await getIngestionStatus(formId);
        res.json(status);
    } catch (error) {
        console.error('Error in /ingestion/:formId/status:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * DELETE /api/ingestion/:formId
 *
 * Delete all ingested chunks for a form.
 */
router.delete('/:formId', async (req: Request, res: Response) => {
    try {
        const { formId } = req.params;
        const deletedCount = await deleteChunksForForm(formId);
        res.json({
            formId,
            deletedCount,
            message: `Deleted ${deletedCount} chunks`
        });
    } catch (error) {
        console.error('Error in DELETE /ingestion/:formId:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * POST /api/ingestion/batch
 *
 * Ingest all PDFs that haven't been processed yet.
 * Useful for initial setup or catching up after adding new forms.
 */
router.post('/batch', async (req: Request, res: Response) => {
    try {
        console.log('Batch ingestion requested');
        const result = await ingestAllPending();
        res.json(result);
    } catch (error) {
        console.error('Error in /ingestion/batch:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export { router as ingestionRouter };
