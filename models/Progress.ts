import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  lessonId: mongoose.Types.ObjectId;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserProgressSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
  isCompleted: { type: Boolean, default: false },
}, { timestamps: true });

UserProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

export const UserProgress = mongoose.models.UserProgress || mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);

export interface IQuizAttempt extends Document {
  userId: mongoose.Types.ObjectId;
  lessonId: mongoose.Types.ObjectId;
  score: number;
  totalQuestions: number;
  weakTopics: string[];
  createdAt: Date;
}

const QuizAttemptSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  weakTopics: [{ type: String }],
}, { timestamps: true });

export const QuizAttempt = mongoose.models.QuizAttempt || mongoose.model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema);
