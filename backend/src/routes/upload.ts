import express from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { getGCSBucket } from '../services/gcsClient';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    },
});

// POST /api/upload - Upload a PDF form
router.post('/', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Generate unique filename
        const fileId = crypto.randomBytes(16).toString('hex');
        const ext = path.extname(req.file.originalname);
        const filename = `${fileId}${ext}`;

        // Upload to GCS
        const gcsBucket = getGCSBucket();
        const blob = gcsBucket.file(`uploads/${filename}`);
        const blobStream = blob.createWriteStream({
            metadata: {
                contentType: req.file.mimetype,
                metadata: {
                    originalName: req.file.originalname,
                    uploadedAt: new Date().toISOString(),
                },
            },
        });

        blobStream.on('error', (err) => {
            console.error('GCS upload error:', err);
            res.status(500).json({ error: 'Failed to upload file' });
        });

        blobStream.on('finish', async () => {
            // Get public URL (bucket must be configured for public access)
            const gcsBucket = getGCSBucket();
            const publicUrl = `https://storage.googleapis.com/${gcsBucket.name}/uploads/${filename}`;

            res.json({
                id: fileId,
                name: req.file!.originalname,
                pdfUrl: publicUrl,
                uploadedAt: new Date().toISOString(),
            });
        });

        blobStream.end(req.file.buffer);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
