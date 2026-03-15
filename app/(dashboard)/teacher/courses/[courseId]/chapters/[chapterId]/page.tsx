"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, LayoutDashboard, Eye, Video, PlusCircle } from "lucide-react";

interface ChapterEditorProps {
    params: Promise<{ courseId: string; chapterId: string }>;
}

export default function ChapterEditorPage({ params }: ChapterEditorProps) {
    const resolvedParams = use(params);
    const router = useRouter();
    const queryClient = useQueryClient();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isFree, setIsFree] = useState(false);
    const [lessonTitle, setLessonTitle] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["chapter", resolvedParams.courseId, resolvedParams.chapterId],
        queryFn: async () => {
            const res = await fetch(`/api/courses/${resolvedParams.courseId}/chapters/${resolvedParams.chapterId}`);
            if (!res.ok) throw new Error("Failed to fetch chapter details");
            return res.json();
        }
    });

    useEffect(() => {
        if (data?.chapter) {
            setTitle(data.chapter.title || "");
            setDescription(data.chapter.description || "");
            setIsFree(data.chapter.isFree || false);
        }
    }, [data]);

    const updateMutation = useMutation({
        mutationFn: async (values: any) => {
            const res = await fetch(`/api/courses/${resolvedParams.courseId}/chapters/${resolvedParams.chapterId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            if (!res.ok) throw new Error("Failed to update chapter");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["chapter", resolvedParams.courseId, resolvedParams.chapterId] });
            queryClient.invalidateQueries({ queryKey: ["course", resolvedParams.courseId] });
        }
    });

    const addLessonMutation = useMutation({
        mutationFn: async (title: string) => {
            const res = await fetch(`/api/courses/${resolvedParams.courseId}/chapters/${resolvedParams.chapterId}/lessons`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title }),
            });
            if (!res.ok) throw new Error("Failed to add lesson");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["chapter", resolvedParams.courseId, resolvedParams.chapterId] });
            setLessonTitle("");
        }
    });

    const chapter = data?.chapter;
    const lessons = data?.lessons || [];
    const isUpdating = updateMutation.isPending || addLessonMutation.isPending;

    const onUpdate = (values: any) => {
        updateMutation.mutate(values);
    };

    const togglePublish = () => {
        onUpdate({ isPublished: !chapter.isPublished });
    };

    const addLesson = () => {
        if (!lessonTitle) return;
        addLessonMutation.mutate(lessonTitle);
    };

    if (isLoading) return <div className="p-6 text-emerald-800">Loading chapter editor...</div>;
    if (!chapter) return <div className="p-6">Chapter not found.</div>;

    const requiredFields = [title, description, lessons.some((l: any) => l.isPublished)];
    const completionText = `(${requiredFields.filter(Boolean).length}/${requiredFields.length}) fields completed`;
    const isComplete = requiredFields.every(Boolean);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col gap-y-2">
                    <Link 
                        href={`/teacher/courses/${resolvedParams.courseId}`} 
                        className="flex items-center text-sm font-medium hover:underline transition"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to course setup
                    </Link>
                    <div className="flex flex-col gap-y-1 mt-4">
                        <h1 className="text-2xl font-bold">Chapter details</h1>
                        <span className="text-sm text-muted-foreground">{completionText}</span>
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
                    <Card className="border shadow-sm">
                        <CardHeader className="flex flex-row items-center gap-x-3 pb-2">
                            <LayoutDashboard className="h-5 w-5 text-zinc-700" />
                            <CardTitle className="text-xl">Customize chapter</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Chapter Title</Label>
                                <Input 
                                    className="h-10"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onBlur={() => onUpdate({ title })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Chapter Description</Label>
                                <Textarea 
                                    className="min-h-[140px]"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    onBlur={() => onUpdate({ description })}
                                />
                                <p className="text-xs text-muted-foreground mt-2">Describe what students will learn in this specific chapter.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border shadow-sm">
                        <CardHeader className="flex flex-row items-center gap-x-3 pb-2">
                            <Eye className="h-5 w-5 text-zinc-700" />
                            <CardTitle className="text-xl">Access settings</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="flex items-center space-x-4 p-4 bg-zinc-50 rounded-md border">
                                <Checkbox 
                                    id="isFree"
                                    checked={isFree}
                                    onCheckedChange={(checked) => {
                                        setIsFree(!!checked);
                                        onUpdate({ isFree: !!checked });
                                    }}
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="isFree" className="text-sm font-medium cursor-pointer">Make this chapter free</Label>
                                    <p className="text-xs text-muted-foreground">Free chapters are available for preview to all visitors.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-x-3">
                                <Video className="h-5 w-5 text-zinc-700" />
                                <CardTitle className="text-xl">Chapter lessons</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            <div className="flex items-center gap-x-3">
                                <Input 
                                    className="h-10"
                                    placeholder="Add a new lesson title..."
                                    value={lessonTitle}
                                    onChange={(e) => setLessonTitle(e.target.value)}
                                />
                                <Button onClick={addLesson}>
                                    Add
                                </Button>
                            </div>

                            {lessons.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 border border-dashed rounded-lg bg-zinc-50/50 text-muted-foreground">
                                    <PlusCircle className="h-12 w-12 mb-4 opacity-20" />
                                    <p className="text-sm italic">No lessons in this chapter yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                     {lessons.map((lesson: any) => (
                                        <div 
                                            key={lesson._id} 
                                            className="group flex items-center gap-x-3 bg-zinc-50 border text-zinc-900 font-medium rounded-lg text-sm p-3 hover:bg-white transition-all cursor-pointer"
                                            onClick={() => router.push(`/teacher/courses/${resolvedParams.courseId}/chapters/${resolvedParams.chapterId}/lessons/${lesson._id}`)}
                                        >
                                            <Video className="h-4 w-4 text-zinc-500" />
                                            <span className="truncate">{lesson.title}</span>
                                            <div className="ml-auto flex items-center gap-x-2">
                                                <Badge variant={lesson.isPublished ? "default" : "secondary"}>
                                                    {lesson.isPublished ? "Published" : "Draft"}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="pt-0">
                            <p className="text-xs text-muted-foreground">Click on a lesson to edit its content.</p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
