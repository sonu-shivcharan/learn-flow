import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/dbConnect";
import { Enrollment } from "@/models/Enrollment";
import User from "@/models/User";
import Course from "@/models/Course";

export async function POST(
    req: Request,
    props: { params: Promise<{ courseId: string }> }
) {
    try {
        const { userId } = await auth();
        const resolvedParams = await props.params;

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        await connectToDatabase();
        const dbUser = await User.findOne({ clerkId: userId });
        
        if (!dbUser) {
            return new NextResponse("User not found", { status: 404 });
        }

        const course = await Course.findById(resolvedParams.courseId);
        if (!course || !course.isPublished) {
            return new NextResponse("Course not found", { status: 404 });
        }

        // Check for existing enrollment
        const existingEnrollment = await Enrollment.findOne({
            userId: dbUser._id,
            courseId: resolvedParams.courseId,
        });

        if (existingEnrollment) {
            return new NextResponse("Already enrolled", { status: 400 });
        }

        const enrollment = await Enrollment.create({
            userId: dbUser._id,
            courseId: resolvedParams.courseId,
        });

        return NextResponse.json(enrollment);
    } catch (error) {
        console.error("[COURSE_ENROLL_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
