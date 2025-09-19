import mongoose, { Schema, Document } from 'mongoose';

export interface INote extends Document {
  title: string;
  content: string;
  tenantId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  tenantId: {
    type: String,
    required: true,
    index: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Compound index for tenant isolation
NoteSchema.index({ tenantId: 1, _id: 1 });

export default mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);
