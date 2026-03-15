"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface LessonClientProps {
    courseId: string;
    lessonId: string;
}

export function LessonClient({ courseId, lessonId }: LessonClientProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/courses/${courseId}/lessons/${lessonId}`)
            .then(res => res.json())
            .then(resData => {
                setData(resData);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [courseId, lessonId]);

    const markAsComplete = async () => {
        try {
            // Placeholder: we haven't built the POST route yet, but we will in Phase 2
            alert("Mark as complete triggered.");
        } catch (error) {
            console.error(error);
        }
    }

    if (loading) {
        return <div className="p-6 animate-pulse">Loading lesson...</div>;
    }

    if (!data || !data.lesson) {
        return <div className="p-6 text-red-500">Lesson not found.</div>;
    }

    const { lesson, course, userProgress } = data;
    const isCompleted = userProgress?.isCompleted || false;

    return (
        <div className="flex flex-col max-w-5xl mx-auto pb-20">
            <div className="p-4 flex items-center justify-between border-b">
                <h2 className="font-semibold text-lg truncate">
                    {course.title} - {lesson.title}
                </h2>
                <Button 
                    onClick={markAsComplete} 
                    variant={isCompleted ? "outline" : "default"}
                    className={isCompleted ? "text-emerald-600 border-emerald-600 bg-emerald-50" : ""}
                >
                    {isCompleted ? "Completed" : "Mark as Complete"}
                </Button>
            </div>
            
            <div className="p-4">
                <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center relative shadow-lg">
                    {lesson.videoUrl ? (
                         <video 
                            controls 
                            className="w-full h-full object-contain"
                            src={lesson.videoUrl}
                         >
                            Your browser does not support the video tag.
                         </video>
                    ) : (
                        <div className="text-zinc-500 font-medium">
                            No Video Provided for this Lesson
                        </div>
                    )}
                </div>

                <div className="mt-8 space-y-4">
                    <h1 className="text-2xl font-bold">{lesson.title}</h1>
                    <p className="text-zinc-600 whitespace-pre-wrap leading-relaxed">
                        {lesson.description || "No description provided for this lesson."}
                    </p>
                </div>
            </div>
        </div>
    );
}
