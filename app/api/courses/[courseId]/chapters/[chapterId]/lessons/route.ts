import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/dbConnect";
import { Chapter, Lesson } from "@/models/ChapterLesson";
import Course from "@/models/Course";
import User from "@/models/User";

export async function POST(
    req: Request,
    props: { params: Promise<{ courseId: string; chapterId: string }> }
) {
    try {
        const { userId } = await auth();
        const { title } = await req.json();
        const resolvedParams = await props.params;

        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        await connectToDatabase();
        const dbUser = await User.findOne({ clerkId: userId });

        const course = await Course.findOne({
            _id: resolvedParams.courseId,
            instructorId: dbUser._id,
        });

        if (!course) return new NextResponse("Unauthorized", { status: 401 });

        const lastLesson = await Lesson.findOne({
            chapterId: resolvedParams.chapterId,
        }).sort({ position: -1 });

        const newPosition = lastLesson ? lastLesson.position + 1 : 1;

        const lesson = await Lesson.create({
            title,
            chapterId: resolvedParams.chapterId,
            position: newPosition,
        });

        return NextResponse.json(lesson);
    } catch (error) {
        console.error("[LESSONS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
