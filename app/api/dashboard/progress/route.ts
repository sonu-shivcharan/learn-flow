import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/dbConnect";
import User from "@/models/User";
import { Enrollment } from "@/models/Enrollment";
import Course from "@/models/Course";
import { Chapter, Lesson } from "@/models/ChapterLesson";
import { UserProgress } from "@/models/Progress";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        await connectToDatabase();
        const dbUser = await User.findOne({ clerkId: userId });
        if (!dbUser) {
            return new NextResponse("User not found", { status: 404 });
        }

        // 1. Fetch all enrollments for this user
        const enrollments = await Enrollment.find({ userId: dbUser._id }).populate({
            path: 'courseId',
            model: Course,
            select: 'title _id'
        });

        if (!enrollments || enrollments.length === 0) {
            return NextResponse.json([]);
        }

        const progressData = [];

        // 2. Calculate progress for each enrolled course
        for (const enrollment of enrollments) {
            const course = enrollment.courseId;
            if (!course) continue;

            // Fetch chapters
            const chapters = await Chapter.find({ courseId: course._id });
            const chapterIds = chapters.map(c => c._id);

            // Fetch all published lessons under these chapters
            const lessons = await Lesson.find({ chapterId: { $in: chapterIds }, isPublished: true });
            const totalLessons = lessons.length;
            const lessonIds = lessons.map(l => l._id);

            // Fetch completed UserProgress for these lessons
            const completedProgress = await UserProgress.countDocuments({
                userId: dbUser._id,
                lessonId: { $in: lessonIds },
                isCompleted: true
            });

            const progressPercentage = totalLessons === 0 ? 0 : Math.round((completedProgress / totalLessons) * 100);

            progressData.push({
                courseId: course._id,
                courseTitle: course.title,
                progressPercentage,
                completedLessons: completedProgress,
                totalLessons,
            });
        }

        return NextResponse.json(progressData);
    } catch (error) {
        console.error("[DASHBOARD_PROGRESS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
