"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Quiz } from "@/components/Quiz";

const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

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
            const res = await fetch(`/api/courses/${courseId}/lessons/${lessonId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isCompleted: !isCompleted }),
            });

            if (res.ok) {
                const updatedProgress = await res.json();
                setData({ ...data, userProgress: updatedProgress });
            }
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
                <Tabs defaultValue="video" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="video">Lesson Video</TabsTrigger>
                        {lesson.quiz && lesson.quiz.length > 0 && (
                            <TabsTrigger value="quiz">Assessment Quiz</TabsTrigger>
                        )}
                    </TabsList>
                    
                    <TabsContent value="video" className="space-y-4">
                        <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center relative shadow-lg">
                            {lesson.videoUrl ? (
                                getYouTubeId(lesson.videoUrl) ? (
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={`https://www.youtube.com/embed/${getYouTubeId(lesson.videoUrl)}`}
                                        title="YouTube video player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="w-full h-full shadow-lg"
                                    />
                                ) : (
                                    <video 
                                        controls 
                                        className="w-full h-full object-contain"
                                        src={lesson.videoUrl}
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                )
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
                    </TabsContent>

                    {lesson.quiz && lesson.quiz.length > 0 && (
                        <TabsContent value="quiz">
                            <Quiz 
                                courseId={courseId} 
                                lessonId={lessonId} 
                                questions={lesson.quiz} 
                            />
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </div>
    );
}
