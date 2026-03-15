"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Quiz } from "@/components/Quiz";
import { Badge } from "@/components/ui/badge";
import { Download, CheckCircle, Trash2, Loader2 } from "lucide-react";
import { cacheVideo, removeCachedVideo, checkIsCached, getCachedVideoUrl } from "@/lib/offlineStorage";

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
    const queryClient = useQueryClient();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [offlineStatus, setOfflineStatus] = useState<"checking" | "cached" | "not_cached" | "downloading">("checking");
    const [offlineUrl, setOfflineUrl] = useState<string | null>(null);

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

    useEffect(() => {
        if (!data || !data.lesson || !data.lesson.videoUrl || getYouTubeId(data.lesson.videoUrl)) {
            setOfflineStatus("not_cached");
            return;
        }

        const checkCache = async () => {
            const cached = await checkIsCached(lessonId);
            if (cached) {
                const url = await getCachedVideoUrl(lessonId);
                setOfflineUrl(url);
                setOfflineStatus("cached");
            } else {
                setOfflineStatus("not_cached");
            }
        };

        checkCache();
    }, [data, lessonId]);

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
                queryClient.invalidateQueries({ queryKey: ["dashboard-progress"] });
                queryClient.invalidateQueries({ queryKey: ["course", courseId] });
            }
        } catch (error) {
            console.error(error);
        }
    }

    const handleDownload = async () => {
        if (!data?.lesson?.videoUrl) return;
        setOfflineStatus("downloading");
        const success = await cacheVideo(data.lesson.videoUrl, lessonId);
        if (success) {
            const url = await getCachedVideoUrl(lessonId);
            setOfflineUrl(url);
            setOfflineStatus("cached");
        } else {
            setOfflineStatus("not_cached");
            alert("Failed to download video.");
        }
    };

    const handleRemoveDownload = async () => {
        setOfflineStatus("checking");
        const success = await removeCachedVideo(lessonId);
        if (success) {
            setOfflineUrl(null);
            setOfflineStatus("not_cached");
        } else {
            setOfflineStatus("cached");
        }
    };

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
                        <div className="aspect-video bg-zinc-100 rounded-md overflow-hidden flex items-center justify-center relative border">
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
                                        className="w-full h-full"
                                    />
                                ) : (
                                    <video 
                                        controls 
                                        className="w-full h-full object-contain"
                                        src={offlineUrl || lesson.videoUrl}
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

                        <div className="flex items-center justify-between mt-8">
                            <h1 className="text-2xl font-bold">{lesson.title}</h1>
                            {lesson.videoUrl && !getYouTubeId(lesson.videoUrl) && (
                                <div className="flex items-center">
                                    {offlineStatus === "cached" ? (
                                        <div className="flex items-center gap-x-2">
                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                <CheckCircle className="h-3.5 w-3.5" /> Downloaded
                                            </Badge>
                                            <Button variant="ghost" size="icon" onClick={handleRemoveDownload} className="text-destructive h-8 w-8">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : offlineStatus === "downloading" ? (
                                        <Button disabled variant="outline" size="sm" className="rounded-full font-semibold text-xs h-8">
                                            <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> Downloading...
                                        </Button>
                                    ) : offlineStatus === "not_cached" ? (
                                        <Button onClick={handleDownload} variant="outline" size="sm">
                                            <Download className="h-3.5 w-3.5 mr-2" /> Download Offline
                                        </Button>
                                    ) : null}
                                </div>
                            )}
                        </div>
                        
                        <div className="space-y-4">
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
