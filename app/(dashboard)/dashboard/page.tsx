import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import connectToDatabase from "@/lib/dbConnect";
import User from "@/models/User";
import { CourseList } from "@/components/CourseList";
import { Recommendations } from "@/components/Recommendations";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/");
  }

  await connectToDatabase();
  const dbUser = await User.findOne({ clerkId: userId });

  // If the user signed in but hasn't completed our DB onboarding, redirect them
  if (!dbUser) {
    return redirect("/onboarding");
  }

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border rounded-md p-4 bg-white shadow-sm flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold">⏱</span>
            </div>
            <div>
                <p className="text-sm text-zinc-500 font-medium">In Progress</p>
                <h3 className="text-2xl font-bold">0 Courses</h3>
            </div>
        </div>
        <div className="border rounded-md p-4 bg-white shadow-sm flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-emerald-600 font-bold">✓</span>
            </div>
            <div>
                <p className="text-sm text-zinc-500 font-medium">Completed</p>
                <h3 className="text-2xl font-bold">0 Courses</h3>
            </div>
        </div>
      </div>
      
      <div className="mt-12">
        <Recommendations />
      </div>
      
      <div className="mt-12">
        <div className="flex items-center gap-x-3 mb-6">
            <div className="h-10 w-2 bg-zinc-900 rounded-full" />
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Available Courses</h2>
        </div>
        <CourseList />
      </div>
    </div>
  );
}
