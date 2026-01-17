import mongoose, { Schema } from 'mongoose';

// PDF Form Session - stores user's form field values for PDF forms
export interface IPDFSession {
    _id: string;
    formId: string; // e.g., 'ip-assignment', 'nda-mutual'
    formName: string;
    category: string;
    fieldValues: Record<string, string>; // fieldId -> value
    lastPage: number;
    progress: number; // 0-100 percentage
    status: 'in_progress' | 'completed' | 'abandoned';
    chatHistory: Array<{
        fieldId?: string;
        role: 'user' | 'assistant';
        content: string;
        timestamp: number;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const PDFSessionSchema = new Schema<IPDFSession>({
    _id: { type: String, required: true },
    formId: { type: String, required: true, index: true },
    formName: { type: String, required: true },
    category: { type: String, required: true },
    fieldValues: { type: Schema.Types.Mixed, default: {} },
    lastPage: { type: Number, default: 1 },
    progress: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['in_progress', 'completed', 'abandoned'],
        default: 'in_progress'
    },
    chatHistory: { type: Schema.Types.Mixed, default: [] },
}, {
    timestamps: true,
    _id: false,
});

// Indexes for efficient queries
PDFSessionSchema.index({ formId: 1, updatedAt: -1 });
PDFSessionSchema.index({ status: 1, updatedAt: -1 });

export const PDFSession = mongoose.model<IPDFSession>('PDFSession', PDFSessionSchema);
