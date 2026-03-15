"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface CourseDetailsClientProps {
    courseId: string;
}

export function CourseDetailsClient({ courseId }: CourseDetailsClientProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/courses/${courseId}`)
            .then(res => res.json())
            .then(resData => {
                setData(resData);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [courseId]);

    if (loading) {
        return <div className="p-6 animate-pulse">Loading course details...</div>;
    }

    if (!data || !data.course) {
        return <div className="p-6 text-red-500">Course not found.</div>;
    }

    const { course, chapters, isEnrolled: initialIsEnrolled } = data;
    const [isEnrolled, setIsEnrolled] = useState(initialIsEnrolled);
    const [isEnrolling, setIsEnrolling] = useState(false);

    const onEnroll = async () => {
        try {
            setIsEnrolling(true);
            const res = await fetch(`/api/courses/${courseId}/enroll`, {
                method: "POST"
            });
            if (res.ok) {
                setIsEnrolled(true);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsEnrolling(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8 pb-32">
            <div className="space-y-4">
                <div className="aspect-video w-full bg-zinc-100 rounded-2xl overflow-hidden relative border-4 border-white shadow-xl">
                    {course.imageUrl ? (
                        <img src={course.imageUrl} alt={course.title} className="object-cover w-full h-full" />
                    ) : (
                        <div className="flex items-center justify-center w-full h-full text-zinc-400 bg-zinc-50 font-medium">
                            No course image
                        </div>
                    )}
                    {!isEnrolled && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                            <Button size="lg" className="rounded-full px-10 h-14 text-lg font-bold shadow-2xl transition-all hover:scale-105" onClick={onEnroll} disabled={isEnrolling}>
                                {isEnrolling ? "Enrolling..." : "Enroll Now"}
                            </Button>
                        </div>
                    )}
                </div>
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
                    <div>
                        <h1 className="text-4xl font-black text-zinc-900 tracking-tight">{course.title}</h1>
                        <p className="text-zinc-500 mt-2 font-medium max-w-xl">{course.description || "No description provided."}</p>
                    </div>
                    {isEnrolled ? (
                        <div className="bg-emerald-50 text-emerald-700 px-6 py-3 font-black rounded-2xl border-2 border-emerald-100 flex items-center gap-x-2">
                            <span>✓</span> Enrolled
                        </div>
                    ) : (
                        course.price ? (
                            <div className="bg-blue-50 text-blue-700 px-6 py-3 font-black rounded-2xl border-2 border-blue-100 text-xl">
                                ${course.price}
                            </div>
                        ) : (
                            <div className="bg-emerald-50 text-emerald-700 px-6 py-3 font-black rounded-2xl border-2 border-emerald-100 text-xl">
                                Free
                            </div>
                        )
                    )}
                </div>
            </div>

            <Separator className="bg-zinc-100 h-1 rounded-full" />

            <div className="space-y-6">
                <div className="flex items-center gap-x-3">
                    <div className="h-10 w-2 bg-blue-600 rounded-full" />
                    <h2 className="text-3xl font-black text-zinc-900">Course Syllabus</h2>
                </div>
                
                {chapters.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
                        <p className="text-zinc-400 font-bold italic">No chapters published yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {chapters.map((chapter: any, index: number) => (
                            <div key={chapter._id} className="group border-2 border-zinc-50 rounded-3xl p-6 bg-white hover:border-blue-100 transition-all shadow-sm">
                                <div className="flex items-center gap-x-4 mb-6">
                                    <div className="h-12 w-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-black text-xl shadow-lg">
                                        {index + 1}
                                    </div>
                                    <h3 className="font-black text-2xl text-zinc-800">
                                        {chapter.title}
                                    </h3>
                                </div>
                                <div className="grid gap-4">
                                    {chapter.lessons.length === 0 && (
                                        <p className="text-sm text-zinc-400 font-medium italic py-4 px-2">No lessons in this chapter yet.</p>
                                    )}
                                    {chapter.lessons.map((lesson: any, lIndex: number) => (
                                        <div key={lesson._id} className="flex items-center justify-between p-4 bg-zinc-50/50 rounded-2xl border-2 border-transparent hover:border-zinc-100 hover:bg-white transition-all group/lesson">
                                            <div className="flex items-center gap-x-4">
                                                <div className="h-8 w-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold ring-4 ring-white">
                                                    {lIndex + 1}
                                                </div>
                                                <span className="font-bold text-zinc-700">{lesson.title}</span>
                                            </div>
                                            {isEnrolled ? (
                                                <Button className="rounded-xl font-bold bg-white text-zinc-900 border-2 border-zinc-100 hover:bg-zinc-900 hover:text-white transition-all shadow-sm" asChild>
                                                    <a href={`/courses/${course._id}/lessons/${lesson._id}`}>
                                                        Start Learning
                                                    </a>
                                                </Button>
                                            ) : (
                                                <div className="text-xs font-bold text-zinc-400 flex items-center gap-x-1 opacity-0 group/lesson-hover:opacity-100 transition-opacity">
                                                    <span>🔒</span> Enroll to unlock
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
