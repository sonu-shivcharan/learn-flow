import mongoose, { Schema, Document } from 'mongoose';

export interface IChapter extends Document {
  title: string;
  description?: string;
  position: number;
  isPublished: boolean;
  isFree: boolean;
  courseId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ChapterSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  position: { type: Number, required: true },
  isPublished: { type: Boolean, default: false },
  isFree: { type: Boolean, default: false },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
}, { timestamps: true });

export const Chapter = mongoose.models.Chapter || mongoose.model<IChapter>('Chapter', ChapterSchema);

export interface ILesson extends Document {
  title: string;
  description?: string;
  videoUrl?: string;
  position: number;
  isPublished: boolean;
  isFree: boolean;
  chapterId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  videoUrl: { type: String },
  position: { type: Number, required: true },
  isPublished: { type: Boolean, default: false },
  isFree: { type: Boolean, default: false },
  chapterId: { type: Schema.Types.ObjectId, ref: 'Chapter', required: true },
}, { timestamps: true });

export const Lesson = mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema);
