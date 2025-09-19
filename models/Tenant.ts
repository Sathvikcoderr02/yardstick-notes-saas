import mongoose, { Schema, Document } from 'mongoose';

export interface ITenant extends Document {
  name: string;
  slug: string;
  subscription: 'free' | 'pro';
  noteLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  subscription: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free',
  },
  noteLimit: {
    type: Number,
    default: 3, // Free plan limit
  },
}, {
  timestamps: true,
});

export default mongoose.models.Tenant || mongoose.model<ITenant>('Tenant', TenantSchema);
