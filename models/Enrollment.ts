import mongoose, { Schema, Document } from 'mongoose';

export interface IEnrollment extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
}, { timestamps: true });

// Ensure a user can only enroll in a course once
EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const Enrollment = mongoose.models.Enrollment || mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
