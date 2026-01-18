import mongoose, { Schema } from 'mongoose';

// Form categories matching frontend types
export type FormCategory =
    | 'employment'
    | 'legal'
    | 'finance'
    | 'government'
    | 'healthcare'
    | 'immigration';

// PDF Form metadata stored in MongoDB
export interface IPDFForm {
    _id: string;
    name: string;
    description: string;
    category: FormCategory;
    pdfUrl: string; // GCS URL
    gcsPath: string; // Full GCS path for deletion
    estimatedTime: string;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
    pageCount?: number;
    isXFA?: boolean;
    uploadedAt: Date;
    updatedAt: Date;
}

const PDFFormSchema = new Schema<IPDFForm>({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: ['employment', 'legal', 'finance', 'government', 'healthcare', 'immigration'],
        index: true
    },
    pdfUrl: { type: String, required: true },
    gcsPath: { type: String, required: true },
    estimatedTime: { type: String, default: '10-15 minutes' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    tags: { type: [String], index: true },
    pageCount: { type: Number },
    isXFA: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, {
    _id: false,
});

// Text search index
PDFFormSchema.index({ name: 'text', description: 'text', tags: 'text' });

export const PDFForm = mongoose.model<IPDFForm>('PDFForm', PDFFormSchema);
