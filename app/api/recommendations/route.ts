import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/dbConnect";
import { QuizAttempt } from "@/models/Progress";
import Course from "@/models/Course";
import User from "@/models/User";
import { Enrollment } from "@/models/Enrollment";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

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

        // 3. Get all published courses that the user is NOT enrolled in
        const availableCourses = await Course.find({
            _id: { $nin: enrolledCourseIds },
            isPublished: true
        }).select("title description _id");

        if (availableCourses.length === 0) {
            return NextResponse.json([]);
        }

        // 4. Use AI to select top 3 recommendations
        const prompt = `
            You are an expert learning consultant. Based on the student's weak topics, suggest the best courses from the available list.
            
            Student's Weak Topics: ${weakTopics.length > 0 ? weakTopics.join(", ") : "New student, no data yet."}
            
            Available Courses:
            ${availableCourses.map(c => `- ID: ${c._id}, Title: ${c.title}, Description: ${c.description}`).join("\n")}
            
            Return a JSON array of exactly 3 recommendation objects (or fewer if not enough courses).
            Each object MUST have:
            - courseId: The ID of the course.
            - reason: A short, encouraging sentence (max 15 words) explaining why this course perfectly addresses their needs or is a great start.
            
            Return ONLY the raw JSON array.
        `;

        const { text } = await generateText({
            model: google("gemini-1.5-pro"),
            prompt: prompt,
        });

        const aiRecommendations = JSON.parse(text.replace(/```json|```/g, "").trim());
        
        // 5. Hydrate the recommendations with full course data
        const hydratedRecommendations = await Promise.all(
            aiRecommendations.map(async (rec: any) => {
                const course = await Course.findById(rec.courseId);
                if (!course) return null;
                return {
                    ...course.toObject(),
                    aiReason: rec.reason
                };
            })
        );

        return NextResponse.json(hydratedRecommendations.filter(Boolean));
    } catch (error) {
        console.error("[RECOMMENDATIONS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
