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

    const { course, chapters } = data;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
                <div className="aspect-video w-full bg-zinc-100 rounded-lg overflow-hidden relative">
                    {course.imageUrl ? (
                        <img src={course.imageUrl} alt={course.title} className="object-cover w-full h-full" />
                    ) : (
                        <div className="flex items-center justify-center w-full h-full text-zinc-400">
                            No course image
                        </div>
                    )}
                </div>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold">{course.title}</h1>
                        <p className="text-zinc-500 mt-2">{course.description || "No description provided."}</p>
                    </div>
                    {course.price ? (
                        <div className="bg-blue-50 text-blue-700 px-4 py-2 font-bold rounded-md">
                            ${course.price}
                        </div>
                    ) : (
                        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 font-bold rounded-md">
                            Free
                        </div>
                    )}
                </div>
            </div>

            <Separator />

            <div>
                <h2 className="text-2xl font-bold mb-4">Course Syllabus</h2>
                {chapters.length === 0 ? (
                    <p className="text-zinc-500">No chapters published yet.</p>
                ) : (
                    <div className="space-y-4">
                        {chapters.map((chapter: any, index: number) => (
                            <div key={chapter._id} className="border rounded-md p-4 bg-white">
                                <h3 className="font-semibold text-lg">
                                    Chapter {index + 1}: {chapter.title}
                                </h3>
                                <div className="mt-4 space-y-2">
                                    {chapter.lessons.length === 0 && (
                                        <p className="text-sm text-zinc-400">No lessons yet.</p>
                                    )}
                                    {chapter.lessons.map((lesson: any, lIndex: number) => (
                                        <div key={lesson._id} className="flex items-center justify-between p-3 bg-zinc-50 rounded border">
                                            <div className="flex items-center gap-x-3">
                                                <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                                                    {lIndex + 1}
                                                </div>
                                                <span className="font-medium text-sm">{lesson.title}</span>
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={`/courses/${course._id}/lessons/${lesson._id}`}>
                                                    View
                                                </a>
                                            </Button>
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
