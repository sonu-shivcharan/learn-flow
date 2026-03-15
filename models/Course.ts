import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  isPublished: boolean;
  instructorId: mongoose.Types.ObjectId;
  categoryId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },
  price: { type: Number },
  isPublished: { type: Boolean, default: false },
  instructorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
}, { timestamps: true });

export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
