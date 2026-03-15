import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import connectToDatabase from "@/lib/dbConnect"
import User from "@/models/User"
import { CourseList } from "@/components/CourseList"
import { ProgressChart } from "@/components/ProgressChart"

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    return redirect("/")
  }

  await connectToDatabase()
  const dbUser = await User.findOne({ clerkId: userId })

  // If the user signed in but hasn't completed our DB onboarding, redirect them
  if (!dbUser) {
    return redirect("/onboarding")
  }

  return (
    <div className="space-y-4 p-6">
      <div className="mt-12">
        <ProgressChart />
      </div>

      <div className="mt-12">
        <div className="mb-6 flex items-center gap-x-3">
          <div className="h-10 w-2 rounded-full bg-primary" />
          <h2 className="text-2xl font-black tracking-tight text-foreground">
            Available Courses
          </h2>
        </div>
        <CourseList />
      </div>
    </div>
  )
}
