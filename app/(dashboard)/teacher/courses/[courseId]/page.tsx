"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, LayoutDashboard, ListChecks, CircleDollarSign, Image as ImageIcon, PlusCircle } from "lucide-react";

interface CourseEditorProps {
    params: Promise<{ courseId: string }>;
}

export default function CourseEditorPage({ params }: CourseEditorProps) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [course, setCourse] = useState<any>(null);
    const [chapters, setChapters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    // Form states
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [price, setPrice] = useState("");

    useEffect(() => {
        fetch(`/api/courses/${resolvedParams.courseId}`)
            .then(res => res.json())
            .then(data => {
                setCourse(data.course);
                setChapters(data.chapters);
                setTitle(data.course.title);
                setDescription(data.course.description || "");
                setImageUrl(data.course.imageUrl || "");
                setPrice(data.course.price?.toString() || "");
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [resolvedParams.courseId]);

    const onUpdate = async (values: any) => {
        try {
            setIsUpdating(true);
            const res = await fetch(`/api/courses/${resolvedParams.courseId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            if (res.ok) {
                const updated = await res.json();
                setCourse(updated);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsUpdating(false);
        }
    };

    const togglePublish = async () => {
        await onUpdate({ isPublished: !course.isPublished });
    };

    if (loading) return <div className="p-6">Loading course editor...</div>;
    if (!course) return <div className="p-6">Course not found.</div>;

    const completionText = `(${[title, description, imageUrl, price, chapters.length > 0].filter(Boolean).length}/5) fields completed`;
    const isComplete = title && description && imageUrl && price && chapters.length > 0;

const [chapterTitle, setChapterTitle] = useState("");

    const addChapter = async () => {
        if (!chapterTitle) return;
        try {
            setIsUpdating(true);
            const res = await fetch(`/api/courses/${resolvedParams.courseId}/chapters`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: chapterTitle }),
            });
            if (res.ok) {
                const newChapter = await res.json();
                setChapters([...chapters, newChapter]);
                setChapterTitle("");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* ... rest of header ... */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col gap-y-2">
                    <Link href="/teacher/courses" className="flex items-center text-sm hover:opacity-75 transition mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to course list
                    </Link>
                    <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col gap-y-2">
                            <h1 className="text-2xl font-bold">Course setup</h1>
                            <span className="text-sm text-zinc-500 font-medium">{completionText}</span>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-x-2">
                            <div className="rounded-full p-2 bg-emerald-100">
                                <LayoutDashboard className="h-5 w-5 text-emerald-700" />
                            </div>
                            <CardTitle className="text-xl text-emerald-950 font-bold">Customize your course</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-emerald-900">Course Title</label>
                                <input 
                                    className="flex h-11 w-full rounded-xl border-2 border-emerald-100 bg-emerald-50/30 px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all mt-2"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onBlur={() => onUpdate({ title })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-emerald-900">Course Description</label>
                                <textarea 
                                    className="flex min-h-[120px] w-full rounded-xl border-2 border-emerald-100 bg-emerald-50/30 px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all mt-2"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    onBlur={() => onUpdate({ description })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-emerald-900">Course Image URL</label>
                                <input 
                                    className="flex h-11 w-full rounded-xl border-2 border-emerald-100 bg-emerald-50/30 px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all mt-2"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    onBlur={() => onUpdate({ imageUrl })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center gap-x-2">
                            <div className="rounded-full p-2 bg-sky-100">
                                <CircleDollarSign className="h-5 w-5 text-sky-700" />
                            </div>
                            <CardTitle className="text-xl text-sky-950 font-bold">Sell your course</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <label className="text-sm font-bold text-sky-900">Course Price ($)</label>
                                <input 
                                    type="number"
                                    className="flex h-11 w-full rounded-xl border-2 border-sky-100 bg-sky-50/30 px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 transition-all mt-2"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    onBlur={() => onUpdate({ price: parseFloat(price) })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="flex items-center gap-x-2">
                                <div className="rounded-full p-2 bg-purple-100">
                                    <ListChecks className="h-5 w-5 text-purple-700" />
                                </div>
                                <CardTitle className="text-xl text-purple-950 font-bold">Course chapters</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-x-2">
                                <input 
                                    className="flex h-10 w-full rounded-lg border-2 border-purple-100 bg-purple-50/30 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 transition-all"
                                    placeholder="Add new chapter title..."
                                    value={chapterTitle}
                                    onChange={(e) => setChapterTitle(e.target.value)}
                                />
                                <Button onClick={addChapter} size="sm" className="bg-purple-600 hover:bg-purple-700">
                                    Add
                                </Button>
                            </div>

                            {chapters.length === 0 ? (
                                <div className="italic text-sm text-zinc-500 py-10 text-center border-2 border-dashed rounded-xl">
                                    No chapters yet. Add one to get started!
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {chapters.map(chapter => (
                                        <div 
                                            key={chapter._id} 
                                            className="flex items-center gap-x-2 bg-white border-2 border-purple-50 text-purple-900 font-bold rounded-xl mb-4 text-sm p-4 shadow-sm hover:border-purple-200 transition-all cursor-pointer hover:shadow-md"
                                            onClick={() => router.push(`/teacher/courses/${resolvedParams.courseId}/chapters/${chapter._id}`)}
                                        >
                                            <ListChecks className="h-4 w-4 text-purple-600" />
                                            {chapter.title}
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
                        <CardFooter>
                            <p className="text-xs text-zinc-500">Chapters will appear here as you create them.</p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
