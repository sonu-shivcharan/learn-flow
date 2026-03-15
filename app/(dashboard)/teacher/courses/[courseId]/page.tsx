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
import { ArrowLeft, LayoutDashboard, ListChecks, CircleDollarSign, PlusCircle } from "lucide-react";

interface CourseEditorProps {
    params: Promise<{ courseId: string }>;
}

export default function CourseEditorPage({ params }: CourseEditorProps) {
    const resolvedParams = use(params);
    const router = useRouter();
    const queryClient = useQueryClient();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [price, setPrice] = useState("");
    const [chapterTitle, setChapterTitle] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["course", resolvedParams.courseId],
        queryFn: async () => {
            const res = await fetch(`/api/courses/${resolvedParams.courseId}`);
            if (!res.ok) throw new Error("Failed to fetch course details");
            return res.json();
        }
    });

    useEffect(() => {
        if (data?.course) {
            setTitle(data.course.title || "");
            setDescription(data.course.description || "");
            setImageUrl(data.course.imageUrl || "");
            setPrice(data.course.price?.toString() || "");
        }
    }, [data]);

    const updateMutation = useMutation({
        mutationFn: async (values: any) => {
            const res = await fetch(`/api/courses/${resolvedParams.courseId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            if (!res.ok) throw new Error("Failed to update course");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["course", resolvedParams.courseId] });
            queryClient.invalidateQueries({ queryKey: ["teacher-courses"] });
        }
    });

    const addChapterMutation = useMutation({
        mutationFn: async (title: string) => {
            const res = await fetch(`/api/courses/${resolvedParams.courseId}/chapters`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title }),
            });
            if (!res.ok) throw new Error("Failed to add chapter");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["course", resolvedParams.courseId] });
            setChapterTitle("");
        }
    });

    const course = data?.course;
    const chapters = data?.chapters || [];
    const isUpdating = updateMutation.isPending || addChapterMutation.isPending;

    const onUpdate = (values: any) => {
        updateMutation.mutate(values);
    };

    const togglePublish = () => {
        onUpdate({ isPublished: !course.isPublished });
    };

    const addChapter = () => {
        if (!chapterTitle) return;
        addChapterMutation.mutate(chapterTitle);
    };

    if (isLoading) return <div className="p-6">Loading course editor...</div>;
    if (!course) return <div className="p-6">Course not found.</div>;

    const completionText = `(${[title, description, imageUrl, price, chapters.length > 0].filter(Boolean).length}/5) fields completed`;
    const isComplete = title && description && imageUrl && price && chapters.length > 0;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col gap-y-2">
                    <Link href="/teacher/courses" className="flex items-center text-sm hover:underline transition mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to course list
                    </Link>
                    <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col gap-y-2">
                            <h1 className="text-2xl font-bold">Course setup</h1>
                            <span className="text-sm text-muted-foreground">{completionText}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-x-2">
                    <Button 
                        onClick={togglePublish}
                        disabled={!isComplete || isUpdating}
                        variant={course.isPublished ? "secondary" : "destructive"}
                    >
                        {course.isPublished ? "Unpublish" : "Publish"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
                <div className="space-y-6">
                    <Card className="border shadow-sm">
                        <CardHeader className="flex flex-row items-center gap-x-3 pb-2">
                            <LayoutDashboard className="h-5 w-5 text-zinc-700" />
                            <CardTitle className="text-xl">Customize your course</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                             <div className="space-y-2">
                                <Label className="text-sm font-medium">Course Title</Label>
                                <Input 
                                    className="h-10"
                                    placeholder="e.g. 'Advanced React Mastery'"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onBlur={() => onUpdate({ title })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Course Description</Label>
                                <Textarea 
                                    className="min-h-[140px]"
                                    placeholder="Enter a compelling description..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    onBlur={() => onUpdate({ description })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Course Image URL</Label>
                                <Input 
                                    className="h-10"
                                    placeholder="https://example.com/image.jpg"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    onBlur={() => onUpdate({ imageUrl })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border shadow-sm">
                        <CardHeader className="flex flex-row items-center gap-x-3 pb-2">
                            <CircleDollarSign className="h-5 w-5 text-zinc-700" />
                            <CardTitle className="text-xl">Sell your course</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Course Price ($)</Label>
                                <Input 
                                    type="number"
                                    className="h-10"
                                    placeholder="0 for free"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    onBlur={() => onUpdate({ price: parseFloat(price) })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-x-3">
                                <ListChecks className="h-5 w-5 text-zinc-700" />
                                <CardTitle className="text-xl">Course chapters</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            <div className="flex items-center gap-x-3">
                                <Input 
                                    className="h-10"
                                    placeholder="e.g. 'Introduction to Hooks'"
                                    value={chapterTitle}
                                    onChange={(e) => setChapterTitle(e.target.value)}
                                />
                                <Button onClick={addChapter}>
                                    Add
                                </Button>
                            </div>

                            {chapters.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 border border-dashed rounded-lg bg-zinc-50/50 text-muted-foreground">
                                    <PlusCircle className="h-12 w-12 mb-4 opacity-20" />
                                    <p className="text-sm italic">No chapters yet. Add one to get started!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {chapters.map((chapter: any) => (
                                        <div 
                                            key={chapter._id} 
                                            className="group flex items-center gap-x-3 bg-zinc-50 border text-zinc-900 font-medium rounded-lg text-sm p-3 hover:bg-white transition-all cursor-pointer"
                                            onClick={() => router.push(`/teacher/courses/${resolvedParams.courseId}/chapters/${chapter._id}`)}
                                        >
                                            <ListChecks className="h-4 w-4 text-zinc-500" />
                                            <span className="truncate">{chapter.title}</span>
                                            <div className="ml-auto flex items-center gap-x-2">
                                                <Badge variant={chapter.isPublished ? "default" : "secondary"}>
                                                    {chapter.isPublished ? "Published" : "Draft"}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="pt-0">
                            <p className="text-xs text-muted-foreground">Reorder with drag and drop coming soon.</p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
