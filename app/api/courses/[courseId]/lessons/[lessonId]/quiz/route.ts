import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/dbConnect";
import User from "@/models/User";
import { QuizAttempt } from "@/models/Progress";

export async function POST(
    req: Request,
    props: { params: Promise<{ courseId: string, lessonId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const { score, totalQuestions, weakTopics } = await req.json();
        const resolvedParams = await props.params;

        await connectToDatabase();
        const dbUser = await User.findOne({ clerkId: userId });

        const quizAttempt = await QuizAttempt.create({
            userId: dbUser._id,
            lessonId: resolvedParams.lessonId,
            score,
            totalQuestions,
            weakTopics,
        });

        return NextResponse.json(quizAttempt);
    } catch (error) {
        console.error("[QUIZ_ATTEMPT_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
