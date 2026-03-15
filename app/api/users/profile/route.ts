import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/dbConnect";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDatabase();
    const dbUser = await User.findOne({ clerkId: userId });

    if (!dbUser) {
      // Return a 200 with null user instead of 404 to handle the onboarding check gracefully
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: dbUser });
  } catch (error) {
    console.error("[USER_GET_PROFILE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
