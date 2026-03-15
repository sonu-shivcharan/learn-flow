import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import Course from "@/models/Course";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const courses = await Course.find({ isPublished: true }).sort({ createdAt: -1 });
    return NextResponse.json({ courses });
  } catch (error) {
    console.error("[COURSES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
