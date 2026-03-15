import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/dbConnect";
import { Chapter, Lesson } from "@/models/ChapterLesson";
import Course from "@/models/Course";
import User from "@/models/User";

export async function GET(
    req: Request,
    props: { params: Promise<{ courseId: string; chapterId: string }> }
) {
    try {
        const { userId } = await auth();
        const resolvedParams = await props.params;

        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        await connectToDatabase();
        const dbUser = await User.findOne({ clerkId: userId });

        const course = await Course.findOne({
            _id: resolvedParams.courseId,
            instructorId: dbUser._id,
        });

        if (!course) return new NextResponse("Unauthorized", { status: 401 });

        const chapter = await Chapter.findById(resolvedParams.chapterId);
        if (!chapter) return new NextResponse("Not Found", { status: 404 });

        const lessons = await Lesson.find({ chapterId: chapter._id }).sort({ position: 1 });

        return NextResponse.json({ chapter, lessons });
    } catch (error) {
        console.error("[CHAPTER_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    props: { params: Promise<{ courseId: string; chapterId: string }> }
) {
    try {
        const { userId } = await auth();
        const resolvedParams = await props.params;
        const values = await req.json();

        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        await connectToDatabase();
        const dbUser = await User.findOne({ clerkId: userId });

        const course = await Course.findOne({
            _id: resolvedParams.courseId,
            instructorId: dbUser._id,
        });

        if (!course) return new NextResponse("Unauthorized", { status: 401 });

        const chapter = await Chapter.findByIdAndUpdate(
            resolvedParams.chapterId,
            { ...values },
            { new: true }
        );

        if (!chapter) return new NextResponse("Not Found", { status: 404 });

        return NextResponse.json(chapter);
    } catch (error) {
        console.error("[CHAPTER_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
