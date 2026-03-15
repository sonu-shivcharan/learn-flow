import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/dbConnect";
import { Chapter } from "@/models/ChapterLesson";
import Course from "@/models/Course";
import User from "@/models/User";

export async function POST(
    req: Request,
    props: { params: Promise<{ courseId: string }> }
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

        const lastChapter = await Chapter.findOne({
            courseId: resolvedParams.courseId,
        }).sort({ position: -1 });

        const newPosition = lastChapter ? lastChapter.position + 1 : 1;

        const chapter = await Chapter.create({
            title,
            courseId: resolvedParams.courseId,
            position: newPosition,
        });

        return NextResponse.json(chapter);
    } catch (error) {
        console.error("[CHAPTERS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
