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
        if (!lesson) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const chapter = await Chapter.findById(lesson.chapterId);
        if (!chapter || chapter.courseId.toString() !== resolvedParams.courseId) {
             return new NextResponse("Bad Request", { status: 400 });
        }
        
        const course = await Course.findById(chapter.courseId);
        const isInstructor = dbUser && (dbUser.role === "INSTRUCTOR" || dbUser.role === "ADMIN") && course.instructorId.toString() === dbUser._id.toString();

        if (!lesson.isPublished && !isInstructor) {
            return new NextResponse("Not Found", { status: 404 });
        }

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

export async function PATCH(
    req: Request,
    props: { params: Promise<{ courseId: string, lessonId: string }> }
) {
    try {
        const { userId } = await auth();
        const resolvedParams = await props.params;
        const values = await req.json();

        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        await connectToDatabase();
        const dbUser = await User.findOne({ clerkId: userId });

        const lesson = await Lesson.findById(resolvedParams.lessonId);
        if (!lesson) return new NextResponse("Not Found", { status: 404 });

        const chapter = await Chapter.findById(lesson.chapterId);
        const course = await Course.findOne({
            _id: chapter.courseId,
            instructorId: dbUser._id,
        });

        if (!course) return new NextResponse("Unauthorized", { status: 401 });

        const updatedLesson = await Lesson.findByIdAndUpdate(
            resolvedParams.lessonId,
            { ...values },
            { new: true }
        );

        return NextResponse.json(updatedLesson);
    } catch (error) {
        console.error("[LESSON_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PUT(
    req: Request,
    props: { params: Promise<{ courseId: string, lessonId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const { isCompleted } = await req.json();
        const resolvedParams = await props.params;

        await connectToDatabase();
        const dbUser = await User.findOne({ clerkId: userId });

        const userProgress = await UserProgress.findOneAndUpdate(
            {
                userId: dbUser._id,
                lessonId: resolvedParams.lessonId,
            },
            {
                isCompleted
            },
            { upsert: true, new: true }
        );

        return NextResponse.json(userProgress);
    } catch (error) {
        console.error("[LESSON_PROGRESS_PUT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
