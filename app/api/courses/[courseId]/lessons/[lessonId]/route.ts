import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/dbConnect";
import User from "@/models/User";
import { Lesson, Chapter } from "@/models/ChapterLesson";
import { UserProgress } from "@/models/Progress";
import Course from "@/models/Course";

export async function GET(
    req: Request,
    props: { params: Promise<{ courseId: string, lessonId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const resolvedParams = await props.params;
        
        await connectToDatabase();
        const dbUser = await User.findOne({ clerkId: userId });

        const lesson = await Lesson.findById(resolvedParams.lessonId);
        if (!lesson || !lesson.isPublished) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const chapter = await Chapter.findById(lesson.chapterId);
        if (!chapter || chapter.courseId.toString() !== resolvedParams.courseId) {
             return new NextResponse("Bad Request", { status: 400 });
        }
        
        const course = await Course.findById(chapter.courseId);

        const progress = await UserProgress.findOne({
            userId: dbUser._id,
            lessonId: lesson._id
        });

        return NextResponse.json({
            lesson,
            course,
            userProgress: progress || null
        });
    } catch (error) {
        console.error("[LESSON_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
