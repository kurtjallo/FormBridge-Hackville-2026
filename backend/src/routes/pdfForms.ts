import { Router, Request, Response } from 'express';
import { Storage } from '@google-cloud/storage';
import { PDFForm, IPDFForm, FormCategory } from '../models/PDFForm';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Lazy initialization for GCS
let storage: Storage | null = null;
let bucketName: string | null = null;

function getGCS() {
    if (!storage) {
        storage = new Storage({
            keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
        });
        bucketName = process.env.GCS_BUCKET_NAME || 'formbridge-pdfs';
    }
    return { storage, bucketName: bucketName! };
}

// Types
interface UploadFormRequest {
    name: string;
    description: string;
    category: FormCategory;
    estimatedTime?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    tags?: string[];
    pageCount?: number;
    isXFA?: boolean;
}

interface ListFormsQuery {
    category?: FormCategory;
    search?: string;
    limit?: string;
    offset?: string;
}

/**
 * GET /api/pdf-forms
 * List all available PDF forms with optional filtering
 */
router.get('/', async (req: Request<{}, {}, {}, ListFormsQuery>, res: Response) => {
    try {
        const { category, search, limit = '50', offset = '0' } = req.query;

        const filter: Record<string, unknown> = {};
        if (category) filter.category = category;

        let query = PDFForm.find(filter);

        // Text search if provided
        if (search) {
            query = PDFForm.find({
                ...filter,
                $text: { $search: search }
            });
        }

        const forms = await query
            .sort({ uploadedAt: -1 })
            .skip(parseInt(offset))
            .limit(parseInt(limit));

        const total = await PDFForm.countDocuments(filter);

        // Transform to frontend format
        const formattedForms = forms.map(form => ({
            id: form._id,
            name: form.name,
            description: form.description,
            category: form.category,
            pdfUrl: form.pdfUrl,
            estimatedTime: form.estimatedTime,
            difficulty: form.difficulty,
            tags: form.tags,
            pageCount: form.pageCount,
            isXFA: form.isXFA,
        }));

        res.json({
            forms: formattedForms,
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
        });
    } catch (error) {
        console.error('Error listing forms:', error);
        res.status(500).json({ error: 'Failed to list forms' });
    }
});

/**
 * GET /api/pdf-forms/categories
 * Get form counts by category
 */
router.get('/categories', async (_req: Request, res: Response) => {
    try {
        const counts = await PDFForm.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        const categories: Record<string, number> = {
            employment: 0,
            legal: 0,
            finance: 0,
            government: 0,
            healthcare: 0,
            immigration: 0,
        };

        counts.forEach(c => {
            if (c._id in categories) {
                categories[c._id] = c.count;
            }
        });

        res.json({ categories });
    } catch (error) {
        console.error('Error getting category counts:', error);
        res.status(500).json({ error: 'Failed to get category counts' });
    }
});

/**
 * GET /api/pdf-forms/proxy/*
 * Proxy PDF files from GCS to avoid CORS issues
 * Example: /api/pdf-forms/proxy/forms/legal/abc123.pdf
 */
router.get('/proxy/*', async (req: Request, res: Response) => {
    try {
        const gcsPath = req.params[0]; // Everything after /proxy/

        if (!gcsPath) {
            return res.status(400).json({ error: 'File path is required' });
        }

        const gcs = getGCS();
        const bucket = gcs.storage.bucket(gcs.bucketName);
        const file = bucket.file(gcsPath);

        // Check if file exists
        const [exists] = await file.exists();
        if (!exists) {
            return res.status(404).json({ error: 'PDF file not found' });
        }

        // Set headers for PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Cache-Control', 'public, max-age=3600');

        // Stream the file
        file.createReadStream()
            .on('error', (err) => {
                console.error('Error streaming PDF:', err);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Failed to stream PDF' });
                }
            })
            .pipe(res);
    } catch (error) {
        console.error('Error proxying PDF:', error);
        res.status(500).json({ error: 'Failed to proxy PDF' });
    }
});

/**
 * GET /api/pdf-forms/:id
 * Get a specific form by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const form = await PDFForm.findById(req.params.id);

        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }

        res.json({
            id: form._id,
            name: form.name,
            description: form.description,
            category: form.category,
            pdfUrl: form.pdfUrl,
            estimatedTime: form.estimatedTime,
            difficulty: form.difficulty,
            tags: form.tags,
            pageCount: form.pageCount,
            isXFA: form.isXFA,
        });
    } catch (error) {
        console.error('Error getting form:', error);
        res.status(500).json({ error: 'Failed to get form' });
    }
});

/**
 * POST /api/pdf-forms/upload
 * Upload a new PDF form to GCS and create metadata
 * Expects multipart/form-data with 'pdf' file and metadata fields
 */
router.post('/upload', async (req: Request, res: Response) => {
    try {
        // Check if we have file data (base64 encoded in body for simplicity)
        const { pdfBase64, ...metadata } = req.body as UploadFormRequest & { pdfBase64: string };

        if (!pdfBase64) {
            return res.status(400).json({ error: 'PDF file (pdfBase64) is required' });
        }

        if (!metadata.name || !metadata.category) {
            return res.status(400).json({ error: 'name and category are required' });
        }

        // Generate unique ID and filename
        const formId = uuidv4();
        const filename = `forms/${metadata.category}/${formId}.pdf`;

        // Upload to GCS
        const gcs = getGCS();
        const bucket = gcs.storage.bucket(gcs.bucketName);
        const file = bucket.file(filename);

        const pdfBuffer = Buffer.from(pdfBase64, 'base64');
        await file.save(pdfBuffer, {
            contentType: 'application/pdf',
            metadata: {
                formId,
                formName: metadata.name,
                category: metadata.category,
            },
        });

        // Bucket has uniform bucket-level access enabled, so no per-object ACL needed
        // Use proxy URL to avoid CORS issues when loading in browser
        const pdfUrl = `/api/pdf-forms/proxy/${filename}`;

        // Return the URL directly (no database storage)
        res.status(201).json({
            id: formId,
            name: metadata.name,
            pdfUrl,
            message: 'Form uploaded successfully',
        });
    } catch (error) {
        console.error('Error uploading form:', error);
        res.status(500).json({ error: 'Failed to upload form' });
    }
});

/**
 * POST /api/pdf-forms/upload-url
 * Generate a signed URL for direct upload to GCS
 * More efficient for large files
 */
router.post('/upload-url', async (req: Request, res: Response) => {
    try {
        const { name, category, contentType = 'application/pdf' } = req.body;

        if (!name || !category) {
            return res.status(400).json({ error: 'name and category are required' });
        }

        const formId = uuidv4();
        const filename = `forms/${category}/${formId}.pdf`;

        const gcs = getGCS();
        const bucket = gcs.storage.bucket(gcs.bucketName);
        const file = bucket.file(filename);

        // Generate signed URL valid for 15 minutes
        const [signedUrl] = await file.getSignedUrl({
            version: 'v4',
            action: 'write',
            expires: Date.now() + 15 * 60 * 1000,
            contentType,
        });

        res.json({
            formId,
            uploadUrl: signedUrl,
            filename,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        });
    } catch (error) {
        console.error('Error generating upload URL:', error);
        res.status(500).json({ error: 'Failed to generate upload URL' });
    }
});

/**
 * POST /api/pdf-forms/confirm-upload
 * Confirm upload and create metadata after direct GCS upload
 */
router.post('/confirm-upload', async (req: Request, res: Response) => {
    try {
        const { formId, filename, ...metadata } = req.body as UploadFormRequest & {
            formId: string;
            filename: string;
        };

        if (!formId || !filename || !metadata.name || !metadata.category) {
            return res.status(400).json({
                error: 'formId, filename, name, and category are required'
            });
        }

        const gcs = getGCS();
        const pdfUrl = `https://storage.googleapis.com/${gcs.bucketName}/${filename}`;

        // Verify file exists in GCS
        const bucket = gcs.storage.bucket(gcs.bucketName);
        const file = bucket.file(filename);
        const [exists] = await file.exists();

        if (!exists) {
            return res.status(404).json({ error: 'Uploaded file not found in storage' });
        }

        // Bucket has uniform bucket-level access enabled, so no per-object ACL needed

        // Create database entry
        const form = await PDFForm.create({
            _id: formId,
            name: metadata.name,
            description: metadata.description || '',
            category: metadata.category,
            pdfUrl,
            gcsPath: filename,
            estimatedTime: metadata.estimatedTime || '10-15 minutes',
            difficulty: metadata.difficulty || 'medium',
            tags: metadata.tags || [],
            pageCount: metadata.pageCount,
            isXFA: metadata.isXFA || false,
        });

        res.status(201).json({
            id: form._id,
            name: form.name,
            pdfUrl: form.pdfUrl,
            message: 'Form metadata saved successfully',
        });
    } catch (error) {
        console.error('Error confirming upload:', error);
        res.status(500).json({ error: 'Failed to confirm upload' });
    }
});

/**
 * DELETE /api/pdf-forms/:id
 * Delete a form and its PDF from GCS
 */
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const form = await PDFForm.findById(req.params.id);

        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }

        // Delete from GCS
        try {
            const gcs = getGCS();
            const bucket = gcs.storage.bucket(gcs.bucketName);
            await bucket.file(form.gcsPath).delete();
        } catch (gcsError) {
            console.warn('GCS deletion failed (file may not exist):', gcsError);
        }

        // Delete from database
        await PDFForm.findByIdAndDelete(req.params.id);

        res.json({ message: 'Form deleted successfully' });
    } catch (error) {
        console.error('Error deleting form:', error);
        res.status(500).json({ error: 'Failed to delete form' });
    }
});

/**
 * PATCH /api/pdf-forms/:id
 * Update form metadata
 */
router.patch('/:id', async (req: Request, res: Response) => {
    try {
        const updates = req.body as Partial<UploadFormRequest>;

        const form = await PDFForm.findByIdAndUpdate(
            req.params.id,
            { $set: { ...updates, updatedAt: new Date() } },
            { new: true }
        );

        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }

        res.json({
            id: form._id,
            name: form.name,
            description: form.description,
            category: form.category,
            pdfUrl: form.pdfUrl,
            message: 'Form updated successfully',
        });
    } catch (error) {
        console.error('Error updating form:', error);
        res.status(500).json({ error: 'Failed to update form' });
    }
});

export default router;
