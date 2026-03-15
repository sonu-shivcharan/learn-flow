import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import Course from "@/models/Course";
import { Chapter, Lesson } from "@/models/ChapterLesson";

export async function GET(
    req: Request,
    props: { params: Promise<{ courseId: string }> }
) {
    try {
        const params = await props.params;
        await connectToDatabase();
        
        if (!params.courseId) {
             return new NextResponse("Course ID missing", { status: 400 });
        }
        
        const course = await Course.findById(params.courseId);
        if (!course) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const chapters = await Chapter.find({ courseId: course._id, isPublished: true }).sort({ position: 1 });
        const chapterIds = chapters.map(c => c._id);
        
        const lessons = await Lesson.find({ chapterId: { $in: chapterIds }, isPublished: true }).sort({ position: 1 });

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
