import mongoose, { Schema, Document } from 'mongoose';

export interface ILearningPathway extends Document {
  userId: mongoose.Types.ObjectId;
  recommendedLessons: mongoose.Types.ObjectId[];
  rationale: string;
  createdAt: Date;
}

const LearningPathwaySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recommendedLessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
  rationale: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.LearningPathway || mongoose.model<ILearningPathway>('LearningPathway', LearningPathwaySchema);
