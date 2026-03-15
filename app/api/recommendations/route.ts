import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/dbConnect";
import { QuizAttempt } from "@/models/Progress";
import Course from "@/models/Course";
import User from "@/models/User";
import { Enrollment } from "@/models/Enrollment";

export async function GET(req: Request) {
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

        // 1. Get user's quiz attempts to find weak topics
        const attempts = await QuizAttempt.find({ userId: dbUser._id }).sort({ createdAt: -1 });
        
        const weakTopicsSet = new Set<string>();
        attempts.forEach(attempt => {
            attempt.weakTopics.forEach((topic: string) => weakTopicsSet.add(topic));
        });

        const weakTopics = Array.from(weakTopicsSet);

        // 2. Get enrolled course IDs to exclude them from recommendations
        const enrollments = await Enrollment.find({ userId: dbUser._id });
        const enrolledCourseIds = enrollments.map(e => e.courseId.toString());

        let recommendations = [];

        if (weakTopics.length > 0) {
            // 3. Find courses that match weak topics in title or description
            recommendations = await Course.find({
                _id: { $nin: enrolledCourseIds },
                isPublished: true,
                $or: [
                    { title: { $regex: weakTopics.join("|"), $options: "i" } },
                    { description: { $regex: weakTopics.join("|"), $options: "i" } }
                ]
            }).limit(5);
        }

        // 4. If no specific topic recommendations, just suggest some popular/new published courses
        if (recommendations.length === 0) {
            recommendations = await Course.find({
                _id: { $nin: enrolledCourseIds },
                isPublished: true
            }).sort({ createdAt: -1 }).limit(5);
        }

        return NextResponse.json(recommendations);
    } catch (error) {
        console.error("[RECOMMENDATIONS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
