import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

// Define Schema inline to avoid import issues for a quick script
const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },
  price: { type: Number },
  isPublished: { type: Boolean, default: false },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  role: { type: String, enum: ['STUDENT', 'INSTRUCTOR', 'ADMIN'], default: 'STUDENT' },
}, { timestamps: true });

const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected to MongoDB');

    // Find an instructor or admin
    let instructor = await User.findOne({ role: { $in: ['INSTRUCTOR', 'ADMIN'] } });

    if (!instructor) {
      console.log('No instructor found, creating a mock instructor...');
      instructor = await User.create({
        clerkId: 'mock_instructor_id',
        email: 'instructor@example.com',
        firstName: 'Mock',
        lastName: 'Instructor',
        role: 'INSTRUCTOR'
      });
    }

    const coursesToCreate = [
      {
        title: 'DevOps',
        description: 'Master DevOps practices and tools.',
        instructorId: instructor._id,
        isPublished: true,
        imageUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?q=80&w=1000&auto=format&fit=crop'
      },
      {
        title: 'Full Stack',
        description: 'Become a full stack developer with modern technologies.',
        instructorId: instructor._id,
        isPublished: true,
        imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop'
      },
      {
        title: 'Data Science',
        description: 'Dive deep into data analysis and machine learning.',
        instructorId: instructor._id,
        isPublished: true,
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop'
      }
    ];

    for (const data of coursesToCreate) {
      const existing = await Course.findOne({ title: data.title });
      if (!existing) {
        await Course.create(data);
        console.log(`Created course: ${data.title}`);
      } else {
        console.log(`Course already exists: ${data.title}`);
      }
    }

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
