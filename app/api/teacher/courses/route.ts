import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/dbConnect";
import Course from "@/models/Course";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDatabase();
    const dbUser = await User.findOne({ clerkId: userId });

    if (!dbUser || (dbUser.role !== "INSTRUCTOR" && dbUser.role !== "ADMIN")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const courses = await Course.find({ instructorId: dbUser._id }).sort({ createdAt: -1 });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("[TEACHER_COURSES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
