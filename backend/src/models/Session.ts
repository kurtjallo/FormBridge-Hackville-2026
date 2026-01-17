import mongoose, { Schema } from 'mongoose';

export interface ISession {
  _id: string;
  answers: Record<string, string | number | boolean>;
  conversations: Record<string, Array<{
    role: 'user' | 'assistant';
    content: string;
    suggestedAnswer?: string;
    confidence?: 'low' | 'medium' | 'high';
    timestamp: number;
  }>>;
  completedSections: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>({
  _id: { type: String, required: true },
  answers: { type: Schema.Types.Mixed, default: {} },
  conversations: { type: Schema.Types.Mixed, default: {} },
  completedSections: { type: [String], default: [] },
}, {
  timestamps: true,
  _id: false,
});

export const Session = mongoose.model<ISession>('Session', SessionSchema);
