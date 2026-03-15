import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LessonClient } from "@/components/LessonClient";

export default async function LessonIdPage(props: { params: Promise<{ courseId: string, lessonId: string }> }) {
    const { userId } = await auth();
    if (!userId) {
        return redirect("/");
    }

    const params = await props.params;

    return (
        <div className="h-full">
            <LessonClient courseId={params.courseId} lessonId={params.lessonId} />
        </div>
    );
}
