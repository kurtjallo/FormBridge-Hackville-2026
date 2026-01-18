/**
 * PDF Ingestion Service
 *
 * Extracts text from PDFs, chunks it semantically, generates embeddings,
 * and stores in the RAG knowledge base with formId tagging.
 */

import { Storage } from '@google-cloud/storage';
import { PDFParse } from 'pdf-parse';
import { PDFForm } from '../models/PDFForm';
import { KnowledgeDoc } from '../models/KnowledgeDoc';
import { addKnowledgeDoc } from './ragService';

// Chunking configuration
const CHUNK_TARGET_SIZE = 800;   // Target ~150-200 words
const CHUNK_MIN_SIZE = 200;      // Minimum to avoid fragments
const CHUNK_MAX_SIZE = 1200;     // Max for embedding context
const CHUNK_OVERLAP = 100;       // Overlap for context continuity

// GCS lazy initialization
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

// Result types
export interface IngestionResult {
    status: 'completed' | 'already_ingested' | 'failed';
    formId: string;
    chunksCreated: number;
    error?: string;
}

export interface IngestionStatus {
    formId: string;
    isIngested: boolean;
    chunkCount: number;
    formName?: string;
    category?: string;
}

interface Chunk {
    text: string;
    index: number;
}

/**
 * Download PDF from GCS
 */
async function downloadPDFFromGCS(gcsPath: string): Promise<Buffer> {
    const gcs = getGCS();
    const bucket = gcs.storage!.bucket(gcs.bucketName);
    const file = bucket.file(gcsPath);

    const [exists] = await file.exists();
    if (!exists) {
        throw new Error(`PDF not found in GCS: ${gcsPath}`);
    }

    const [buffer] = await file.download();
    return buffer;
}

/**
 * Extract keywords from text for search optimization
 */
function extractKeywords(text: string): string[] {
    // Common stop words to filter out
    const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
        'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
        'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'this',
        'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
        'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each',
        'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
        'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just'
    ]);

    // Extract words, filter, and get unique
    const words = text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word));

    // Count frequency and return top keywords
    const freq = new Map<string, number>();
    words.forEach(word => freq.set(word, (freq.get(word) || 0) + 1));

    return Array.from(freq.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word]) => word);
}

/**
 * Chunk text into semantic pieces with overlap
 * Tries to split on paragraph boundaries, falls back to sentences
 */
function chunkText(text: string): Chunk[] {
    const chunks: Chunk[] = [];

    // Normalize whitespace and clean text
    const cleanText = text
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    if (cleanText.length <= CHUNK_MAX_SIZE) {
        // Text is small enough to be one chunk
        return [{ text: cleanText, index: 0 }];
    }

    // Split into paragraphs first
    const paragraphs = cleanText.split(/\n\n+/);

    let currentChunk = '';
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
        const trimmedPara = paragraph.trim();
        if (!trimmedPara) continue;

        // If paragraph alone is too big, split by sentences
        if (trimmedPara.length > CHUNK_MAX_SIZE) {
            // Save current chunk if we have one
            if (currentChunk.length >= CHUNK_MIN_SIZE) {
                chunks.push({ text: currentChunk.trim(), index: chunkIndex++ });
                currentChunk = '';
            }

            // Split large paragraph by sentences
            const sentences = trimmedPara.split(/(?<=[.!?])\s+/);
            let sentenceChunk = '';

            for (const sentence of sentences) {
                if (sentenceChunk.length + sentence.length > CHUNK_TARGET_SIZE && sentenceChunk.length >= CHUNK_MIN_SIZE) {
                    chunks.push({ text: sentenceChunk.trim(), index: chunkIndex++ });
                    // Add overlap from end of previous chunk
                    const overlapStart = Math.max(0, sentenceChunk.length - CHUNK_OVERLAP);
                    sentenceChunk = sentenceChunk.slice(overlapStart) + ' ' + sentence;
                } else {
                    sentenceChunk += (sentenceChunk ? ' ' : '') + sentence;
                }
            }

            if (sentenceChunk.length >= CHUNK_MIN_SIZE) {
                currentChunk = sentenceChunk;
            } else if (sentenceChunk) {
                currentChunk += ' ' + sentenceChunk;
            }
            continue;
        }

        // Check if adding this paragraph exceeds target
        const potentialLength = currentChunk.length + trimmedPara.length + 2;

        if (potentialLength > CHUNK_TARGET_SIZE && currentChunk.length >= CHUNK_MIN_SIZE) {
            // Save current chunk
            chunks.push({ text: currentChunk.trim(), index: chunkIndex++ });

            // Start new chunk with overlap
            const overlapStart = Math.max(0, currentChunk.length - CHUNK_OVERLAP);
            currentChunk = currentChunk.slice(overlapStart) + '\n\n' + trimmedPara;
        } else {
            // Add to current chunk
            currentChunk += (currentChunk ? '\n\n' : '') + trimmedPara;
        }
    }

    // Don't forget the last chunk
    if (currentChunk.length >= CHUNK_MIN_SIZE) {
        chunks.push({ text: currentChunk.trim(), index: chunkIndex });
    } else if (currentChunk && chunks.length > 0) {
        // Append to last chunk if too small
        chunks[chunks.length - 1].text += '\n\n' + currentChunk.trim();
    } else if (currentChunk) {
        // Only chunk, even if small
        chunks.push({ text: currentChunk.trim(), index: chunkIndex });
    }

    return chunks;
}

/**
 * Main ingestion function - extract, chunk, and store PDF content
 */
export async function ingestPDF(formId: string, force = false): Promise<IngestionResult> {
    try {
        // 1. Get PDF metadata
        const pdfForm = await PDFForm.findById(formId);
        if (!pdfForm) {
            return {
                status: 'failed',
                formId,
                chunksCreated: 0,
                error: `PDF form not found: ${formId}`
            };
        }

        // 2. Check if already ingested (idempotency)
        const existingChunks = await KnowledgeDoc.countDocuments({ formId });
        if (existingChunks > 0 && !force) {
            console.log(`Form ${formId} already ingested with ${existingChunks} chunks`);
            return {
                status: 'already_ingested',
                formId,
                chunksCreated: existingChunks
            };
        }

        // 3. If force re-ingestion, delete existing chunks
        if (force && existingChunks > 0) {
            console.log(`Force re-ingestion: deleting ${existingChunks} existing chunks`);
            await KnowledgeDoc.deleteMany({ formId });
        }

        // 4. Download PDF from GCS
        console.log(`Downloading PDF: ${pdfForm.gcsPath}`);
        const pdfBuffer = await downloadPDFFromGCS(pdfForm.gcsPath);

        // 5. Extract text using pdf-parse v2 API
        console.log('Extracting text from PDF...');
        const parser = new PDFParse({ data: pdfBuffer });
        const textResult = await parser.getText();

        if (!textResult.text || textResult.text.trim().length === 0) {
            await parser.destroy();
            return {
                status: 'failed',
                formId,
                chunksCreated: 0,
                error: 'No text could be extracted from PDF (may be scanned/image-based)'
            };
        }

        const numPages = textResult.pages?.length || 1;
        console.log(`Extracted ${textResult.text.length} characters from ${numPages} pages`);

        // 6. Chunk the text
        const chunks = chunkText(textResult.text);
        console.log(`Created ${chunks.length} chunks`);

        // Clean up parser
        await parser.destroy();

        // 7. Store each chunk via ragService
        let chunksCreated = 0;
        for (const chunk of chunks) {
            try {
                await addKnowledgeDoc({
                    category: pdfForm.category,
                    formId: formId,
                    title: `${pdfForm.name} - Section ${chunk.index + 1}`,
                    content: chunk.text,
                    keywords: extractKeywords(chunk.text),
                    source: `PDF: ${pdfForm.name} (Page ~${Math.ceil((chunk.index + 1) * numPages / chunks.length)})`
                });
                chunksCreated++;
            } catch (chunkError) {
                console.error(`Failed to store chunk ${chunk.index}:`, chunkError);
                // Continue with other chunks
            }
        }

        console.log(`Successfully ingested ${chunksCreated} chunks for form ${formId}`);

        return {
            status: 'completed',
            formId,
            chunksCreated
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Ingestion failed for form ${formId}:`, errorMessage);
        return {
            status: 'failed',
            formId,
            chunksCreated: 0,
            error: errorMessage
        };
    }
}

/**
 * Delete all chunks for a form
 */
export async function deleteChunksForForm(formId: string): Promise<number> {
    const result = await KnowledgeDoc.deleteMany({ formId });
    console.log(`Deleted ${result.deletedCount} chunks for form ${formId}`);
    return result.deletedCount;
}

/**
 * Get ingestion status for a form
 */
export async function getIngestionStatus(formId: string): Promise<IngestionStatus> {
    const chunkCount = await KnowledgeDoc.countDocuments({ formId });
    const pdfForm = await PDFForm.findById(formId);

    return {
        formId,
        isIngested: chunkCount > 0,
        chunkCount,
        formName: pdfForm?.name,
        category: pdfForm?.category
    };
}

/**
 * Ingest all PDFs that haven't been ingested yet
 */
export async function ingestAllPending(): Promise<{
    processed: number;
    succeeded: number;
    failed: number;
    results: IngestionResult[];
}> {
    // Get all forms
    const allForms = await PDFForm.find({});

    // Get forms that have been ingested
    const ingestedFormIds = await KnowledgeDoc.distinct('formId');
    const ingestedSet = new Set(ingestedFormIds);

    // Filter to pending forms
    const pendingForms = allForms.filter(form => !ingestedSet.has(form._id));

    console.log(`Found ${pendingForms.length} forms pending ingestion`);

    const results: IngestionResult[] = [];
    let succeeded = 0;
    let failed = 0;

    for (const form of pendingForms) {
        const result = await ingestPDF(form._id);
        results.push(result);

        if (result.status === 'completed') {
            succeeded++;
        } else if (result.status === 'failed') {
            failed++;
        }
    }

    return {
        processed: pendingForms.length,
        succeeded,
        failed,
        results
    };
}
