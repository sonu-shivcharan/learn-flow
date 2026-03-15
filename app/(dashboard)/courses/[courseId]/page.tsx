import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CourseDetailsClient } from "@/components/CourseDetailsClient";

export default async function CourseIdPage(props: { params: Promise<{ courseId: string }> }) {
    const { userId } = await auth();
    if (!userId) {
        return redirect("/");
    }

    const params = await props.params;

    return (
        <CourseDetailsClient courseId={params.courseId} />
    );
}
