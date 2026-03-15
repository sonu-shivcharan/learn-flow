import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { role } = await req.json();
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return new NextResponse("Clerk user not found", { status: 404 });
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ clerkId: userId });

    if (existingUser) {
      return NextResponse.json({ message: "User already registered" }, { status: 200 });
    }

    const primaryEmail = clerkUser.emailAddresses.find(
      (emailAddress) => emailAddress.id === clerkUser.primaryEmailAddressId
    )?.emailAddress;

    const newUser = await User.create({
      clerkId: userId,
      email: primaryEmail || clerkUser.emailAddresses[0]?.emailAddress,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      // Default to STUDENT if an invalid role is somehow provided
      role: ['STUDENT', 'INSTRUCTOR'].includes(role) ? role : 'STUDENT',
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("[ONBOARDING_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
