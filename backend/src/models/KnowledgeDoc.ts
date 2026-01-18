import mongoose, { Schema } from 'mongoose';

// RAG Knowledge Document
// Stores chunks of information that can be retrieved for AI context
export interface IKnowledgeDoc {
    _id: string;
    category: string;          // 'employment', 'finance', 'government', 'legal'
    formId?: string;           // Optional: specific form this applies to
    title: string;             // Short title for the chunk
    content: string;           // The actual knowledge content
    keywords: string[];        // Keywords for search matching
    source?: string;           // Where this info came from (URL, doc name)
    embedding?: number[];      // 768-dimension vector from Gemini text-embedding-005
    lastUpdated: Date;
}

const KnowledgeDocSchema = new Schema<IKnowledgeDoc>({
    _id: { type: String, required: true },
    category: { type: String, required: true, index: true },
    formId: { type: String, index: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    keywords: { type: [String], index: true },
    source: { type: String },
    embedding: { type: [Number] },
    lastUpdated: { type: Date, default: Date.now },
}, {
    _id: false,
});

// Text index for full-text search fallback
KnowledgeDocSchema.index({ title: 'text', content: 'text', keywords: 'text' });

export const KnowledgeDoc = mongoose.model<IKnowledgeDoc>('KnowledgeDoc', KnowledgeDocSchema);
