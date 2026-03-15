"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, LayoutDashboard, Eye, Video, PlusCircle, Trash } from "lucide-react";

interface ChapterEditorProps {
    params: Promise<{ courseId: string; chapterId: string }>;
}

export default function ChapterEditorPage({ params }: ChapterEditorProps) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [chapter, setChapter] = useState<any>(null);
    const [lessons, setLessons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    // Form states
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isFree, setIsFree] = useState(false);
    const [lessonTitle, setLessonTitle] = useState("");

    useEffect(() => {
        fetch(`/api/courses/${resolvedParams.courseId}/chapters/${resolvedParams.chapterId}`)
            .then(res => res.json())
            .then(data => {
                setChapter(data.chapter);
                setLessons(data.lessons);
                setTitle(data.chapter.title);
                setDescription(data.chapter.description || "");
                setIsFree(data.chapter.isFree || false);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [resolvedParams.courseId, resolvedParams.chapterId]);

    const onUpdate = async (values: any) => {
        try {
            setIsUpdating(true);
            const res = await fetch(`/api/courses/${resolvedParams.courseId}/chapters/${resolvedParams.chapterId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            if (res.ok) {
                const updated = await res.json();
                setChapter(updated);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsUpdating(false);
        }
    };

    const addLesson = async () => {
        if (!lessonTitle) return;
        try {
            setIsUpdating(true);
            const res = await fetch(`/api/courses/${resolvedParams.courseId}/chapters/${resolvedParams.chapterId}/lessons`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: lessonTitle }),
            });
            if (res.ok) {
                const newLesson = await res.json();
                setLessons([...lessons, newLesson]);
                setLessonTitle("");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsUpdating(false);
        }
    };

    const togglePublish = async () => {
        await onUpdate({ isPublished: !chapter.isPublished });
    };

    if (loading) return <div className="p-6 text-emerald-800">Loading chapter editor...</div>;
    if (!chapter) return <div className="p-6">Chapter not found.</div>;

    const requiredFields = [title, description, lessons.some(l => l.isPublished)];
    const completionText = `(${requiredFields.filter(Boolean).length}/${requiredFields.length}) fields completed`;
    const isComplete = requiredFields.every(Boolean);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col gap-y-2">
                    <Link 
                        href={`/teacher/courses/${resolvedParams.courseId}`} 
                        className="flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700 transition"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to course setup
                    </Link>
                    <div className="flex flex-col gap-y-1 mt-4">
                        <h1 className="text-3xl font-bold text-emerald-950">Chapter details</h1>
                        <span className="text-sm text-zinc-500 font-medium">{completionText}</span>
                    </div>
                </div>
                <div className="flex items-center gap-x-2">
                    <Button 
                        onClick={togglePublish}
                        disabled={!isComplete || isUpdating}
                        variant={chapter.isPublished ? "secondary" : "destructive"}
                    >
                        {chapter.isPublished ? "Unpublish" : "Publish"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <Card className="border-2 border-emerald-50">
                        <CardHeader className="flex flex-row items-center gap-x-3 pb-2">
                            <div className="rounded-xl p-2.5 bg-emerald-100/50">
                                <LayoutDashboard className="h-5 w-5 text-emerald-700" />
                            </div>
                            <CardTitle className="text-xl text-emerald-950">Customize chapter</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div>
                                <label className="text-sm font-bold text-emerald-900 ml-1">Chapter Title</label>
                                <input 
                                    className="flex h-11 w-full rounded-xl border-2 border-emerald-50 bg-emerald-50/20 px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all mt-2"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onBlur={() => onUpdate({ title })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-emerald-900 ml-1">Chapter Description</label>
                                <textarea 
                                    className="flex min-h-[140px] w-full rounded-xl border-2 border-emerald-50 bg-emerald-50/20 px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all mt-2"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    onBlur={() => onUpdate({ description })}
                                />
                                <p className="text-xs text-zinc-400 mt-2 px-1">Describe what students will learn in this specific chapter.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-sky-50">
                        <CardHeader className="flex flex-row items-center gap-x-3 pb-2">
                            <div className="rounded-xl p-2.5 bg-sky-100/50">
                                <Eye className="h-5 w-5 text-sky-700" />
                            </div>
                            <CardTitle className="text-xl text-sky-950">Access settings</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="flex items-center space-x-3 p-4 bg-sky-50/30 rounded-xl border-2 border-sky-50">
                                <input 
                                    type="checkbox" 
                                    className="h-5 w-5 rounded border-sky-300 text-sky-600 focus:ring-sky-500"
                                    checked={isFree}
                                    onChange={(e) => {
                                        setIsFree(e.target.checked);
                                        onUpdate({ isFree: e.target.checked });
                                    }}
                                />
                                <div className="space-y-0.5">
                                    <label className="text-sm font-bold text-sky-900">Make this chapter free</label>
                                    <p className="text-xs text-zinc-500">Free chapters are available for preview to all visitors.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-2 border-purple-50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-x-3">
                                <div className="rounded-xl p-2.5 bg-purple-100/50">
                                    <Video className="h-5 w-5 text-purple-700" />
                                </div>
                                <CardTitle className="text-xl text-purple-950">Chapter lessons</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            <div className="flex items-center gap-x-3">
                                <input 
                                    className="flex h-11 w-full rounded-xl border-2 border-purple-100 bg-purple-50/20 px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 transition-all font-medium"
                                    placeholder="Add a new lesson title..."
                                    value={lessonTitle}
                                    onChange={(e) => setLessonTitle(e.target.value)}
                                />
                                <Button onClick={addLesson} className="bg-purple-600 hover:bg-purple-700 h-11 rounded-xl px-6 font-bold">
                                    Add
                                </Button>
                            </div>

                            {lessons.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-purple-100 rounded-2xl bg-purple-50/10 text-zinc-400">
                                    <PlusCircle className="h-10 w-10 mb-3 opacity-20" />
                                    <p className="text-sm italic font-medium">No lessons in this chapter yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {lessons.map(lesson => (
                                        <div 
                                            key={lesson._id} 
                                            className="group flex items-center gap-x-3 bg-white border-2 border-purple-50/50 text-purple-900 font-bold rounded-xl text-sm p-4 shadow-sm hover:border-purple-200 hover:shadow-md transition-all cursor-pointer"
                                            onClick={() => router.push(`/teacher/courses/${resolvedParams.courseId}/chapters/${resolvedParams.chapterId}/lessons/${lesson._id}`)}
                                        >
                                            <Video className="h-4 w-4 text-purple-600" />
                                            <span className="truncate">{lesson.title}</span>
                                            <div className="ml-auto flex items-center gap-x-2">
                                                <Badge variant={lesson.isPublished ? "default" : "secondary"} className="rounded-lg">
                                                    {lesson.isPublished ? "Published" : "Draft"}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="pt-0">
                            <p className="text-xs text-zinc-500 font-medium px-1 underline underline-offset-4 decoration-purple-200">Click on a lesson to edit its video and content.</p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
