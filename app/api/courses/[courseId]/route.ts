import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/dbConnect";
import Course from "@/models/Course";
import { Chapter, Lesson } from "@/models/ChapterLesson";
import User from "@/models/User";

export async function GET(
    req: Request,
    props: { params: Promise<{ courseId: string }> }
) {
    try {
        const { userId } = await auth();
        const params = await props.params;
        await connectToDatabase();
        
        const course = await Course.findById(params.courseId);
        if (!course) {
            return new NextResponse("Not Found", { status: 404 });
        }

        // Check if user is instructor to show unpublished content
        let dbUser = null;
        if (userId) {
            dbUser = await User.findOne({ clerkId: userId });
        }

        const isInstructor = dbUser && (dbUser.role === "INSTRUCTOR" || dbUser.role === "ADMIN") && course.instructorId.toString() === dbUser._id.toString();

        const chaptersQuery = { courseId: course._id };
        if (!isInstructor) {
            Object.assign(chaptersQuery, { isPublished: true });
        }
        
        const chapters = await Chapter.find(chaptersQuery).sort({ position: 1 });
        const chapterIds = chapters.map(c => c._id);
        
        const lessonsQuery = { chapterId: { $in: chapterIds } };
        if (!isInstructor) {
            Object.assign(lessonsQuery, { isPublished: true });
        }

        const lessons = await Lesson.find(lessonsQuery).sort({ position: 1 });

        const chaptersWithLessons = chapters.map(chapter => ({
            ...chapter.toObject(),
            lessons: lessons.filter(l => l.chapterId.toString() === chapter._id.toString())
        }));

        return NextResponse.json({ course, chapters: chaptersWithLessons });

    } catch (error) {
        console.error("[COURSE_GET_ID]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    props: { params: Promise<{ courseId: string }> }
) {
    try {
        const { userId } = await auth();
        const params = await props.params;
        const values = await req.json();

        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        await connectToDatabase();
        const dbUser = await User.findOne({ clerkId: userId });
        
        const course = await Course.findOneAndUpdate(
            { _id: params.courseId, instructorId: dbUser._id },
            { ...values },
            { new: true }
        );

        if (!course) return new NextResponse("Not Found", { status: 404 });

        return NextResponse.json(course);
    } catch (error) {
        console.error("[COURSE_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
