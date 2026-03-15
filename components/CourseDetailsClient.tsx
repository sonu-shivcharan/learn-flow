"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CourseDetailsClientProps {
    courseId: string;
}

export function CourseDetailsClient({ courseId }: CourseDetailsClientProps) {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["course", courseId],
        queryFn: async () => {
            const res = await fetch(`/api/courses/${courseId}`);
            if (!res.ok) throw new Error("Failed to fetch course details");
            return res.json();
        }
    });

    const enrollMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/courses/${courseId}/enroll`, {
                method: "POST"
            });
            if (!res.ok) throw new Error("Failed to enroll");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["course", courseId] });
            queryClient.invalidateQueries({ queryKey: ["recommendations"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-progress"] });
        }
    });

    if (isLoading) {
        return <div className="p-6 animate-pulse">Loading course details...</div>;
    }

    if (!data || !data.course) {
        return <div className="p-6 text-red-500">Course not found.</div>;
    }

    const { course, chapters, isEnrolled } = data;
    const isEnrolling = enrollMutation.isPending;

    const onEnroll = () => {
        enrollMutation.mutate();
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8 pb-32">
            <div className="space-y-4">
                <div className="aspect-video w-full bg-zinc-100 rounded-lg overflow-hidden relative border shadow-sm">
                    {course.imageUrl ? (
                        <img src={course.imageUrl} alt={course.title} className="object-cover w-full h-full" />
                    ) : (
                        <div className="flex items-center justify-center w-full h-full text-zinc-400 bg-zinc-50 font-medium">
                            No course image
                        </div>
                    )}
                    {!isEnrolled && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                            <Button size="lg" onClick={onEnroll} disabled={isEnrolling}>
                                {isEnrolling ? "Enrolling..." : "Enroll Now"}
                            </Button>
                        </div>
                    )}
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">{course.title}</h1>
                        <p className="text-muted-foreground mt-2 max-w-xl">{course.description || "No description provided."}</p>
                    </div>
                    <div>
                        {isEnrolled ? (
                            <Badge variant="secondary" className="px-4 py-2 text-sm">
                                Enrolled
                            </Badge>
                        ) : (
                            <Badge className="px-4 py-2 text-sm" variant="default">
                                {course.price ? `$${course.price}` : "Free"}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            <Separator className="bg-zinc-100 h-1 rounded-full" />

            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-zinc-900">Course Syllabus</h2>
                
                {chapters.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
                        <p className="text-zinc-400 font-bold italic">No chapters published yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {chapters.map((chapter: any, index: number) => (
                            <div key={chapter._id} className="border rounded-xl p-6 bg-white shadow-sm">
                                <div className="flex items-center gap-x-4 mb-4">
                                    <div className="h-10 w-10 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-lg">
                                        {index + 1}
                                    </div>
                                    <h3 className="font-semibold text-xl text-zinc-800">
                                        {chapter.title}
                                    </h3>
                                </div>
                                <div className="grid gap-4">
                                    {chapter.lessons.length === 0 && (
                                        <p className="text-sm text-zinc-400 font-medium italic py-4 px-2">No lessons in this chapter yet.</p>
                                    )}
                                    {chapter.lessons.map((lesson: any, lIndex: number) => (
                                        <div key={lesson._id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-transparent transition-all">
                                            <div className="flex items-center gap-x-3">
                                                <div className="text-xs text-muted-foreground font-medium">
                                                    {lIndex + 1}.
                                                </div>
                                                <span className="font-medium text-zinc-700 text-sm">{lesson.title}</span>
                                            </div>
                                            {isEnrolled ? (
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href={`/courses/${course._id}/lessons/${lesson._id}`}>
                                                        Start Learning
                                                    </a>
                                                </Button>
                                            ) : (
                                                <div className="text-xs text-muted-foreground flex items-center gap-x-1">
                                                    <span>🔒</span> Enroll
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
