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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, LayoutDashboard, Video, HelpCircle, Plus, Trash } from "lucide-react";

interface LessonEditorProps {
    params: Promise<{ courseId: string; chapterId: string; lessonId: string }>;
}

export default function LessonEditorPage({ params }: LessonEditorProps) {
    const resolvedParams = use(params);
    const router = useRouter();
    const queryClient = useQueryClient();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [quiz, setQuiz] = useState<any[]>([]);

    const { data, isLoading } = useQuery({
        queryKey: ["lesson", resolvedParams.courseId, resolvedParams.lessonId],
        queryFn: async () => {
            const res = await fetch(`/api/courses/${resolvedParams.courseId}/lessons/${resolvedParams.lessonId}`);
            if (!res.ok) throw new Error("Failed to fetch lesson details");
            return res.json();
        }
    });

    useEffect(() => {
        if (data?.lesson) {
            setTitle(data.lesson.title || "");
            setDescription(data.lesson.description || "");
            setVideoUrl(data.lesson.videoUrl || "");
            setQuiz(data.lesson.quiz || []);
        }
    }, [data]);

    const updateMutation = useMutation({
        mutationFn: async (values: any) => {
            const res = await fetch(`/api/courses/${resolvedParams.courseId}/lessons/${resolvedParams.lessonId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            if (!res.ok) throw new Error("Failed to update lesson");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lesson", resolvedParams.courseId, resolvedParams.lessonId] });
            queryClient.invalidateQueries({ queryKey: ["chapter", resolvedParams.courseId, resolvedParams.chapterId] });
        }
    });

    const isUpdating = updateMutation.isPending;
    const lesson = data?.lesson;

    const onUpdate = (values: any) => {
        updateMutation.mutate(values);
    };

    const addQuizQuestion = () => {
        const newQuestion = {
            question: "New Question?",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: "Option A",
            topic: "General",
        };
        const updatedQuiz = [...quiz, newQuestion];
        setQuiz(updatedQuiz);
        onUpdate({ quiz: updatedQuiz });
    };

    const updateQuizQuestion = (index: number, field: string, value: any) => {
        const updatedQuiz = [...quiz];
        updatedQuiz[index] = { ...updatedQuiz[index], [field]: value };
        setQuiz(updatedQuiz);
    };

    const updateQuizOption = (qIndex: number, oIndex: number, value: string) => {
        const updatedQuiz = [...quiz];
        const updatedOptions = [...updatedQuiz[qIndex].options];
        updatedOptions[oIndex] = value;
        updatedQuiz[qIndex] = { ...updatedQuiz[qIndex], options: updatedOptions };
        setQuiz(updatedQuiz);
    };

    const removeQuizQuestion = (index: number) => {
        const updatedQuiz = quiz.filter((_, i) => i !== index);
        setQuiz(updatedQuiz);
        onUpdate({ quiz: updatedQuiz });
    };

    const togglePublish = () => {
        onUpdate({ isPublished: !lesson.isPublished });
    };

    if (isLoading) return <div className="p-6 text-purple-800">Loading lesson editor...</div>;
    if (!lesson) return <div className="p-6">Lesson not found.</div>;

    const requiredFields = [title, description, videoUrl];
    const completionText = `(${requiredFields.filter(Boolean).length}/${requiredFields.length}) fields completed`;
    const isComplete = requiredFields.every(Boolean);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col gap-y-2">
                    <Link 
                        href={`/teacher/courses/${resolvedParams.courseId}/chapters/${resolvedParams.chapterId}`} 
                        className="flex items-center text-sm font-medium text-purple-600 hover:text-purple-700 transition"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to chapter setup
                    </Link>
                    <div className="flex flex-col gap-y-1 mt-4">
                        <h1 className="text-3xl font-bold text-purple-950 tracking-tight">Lesson setup</h1>
                        <span className="text-sm text-zinc-500 font-medium">{completionText}</span>
                    </div>
                </div>
                <div className="flex items-center gap-x-2">
                    <Button 
                        onClick={togglePublish}
                        disabled={!isComplete || isUpdating}
                        variant={lesson.isPublished ? "secondary" : "destructive"}
                    >
                        {lesson.isPublished ? "Unpublish" : "Publish"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <Card className="border-2 border-purple-50 shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center gap-x-3 pb-2">
                            <div className="rounded-xl p-2.5 bg-purple-100/50">
                                <LayoutDashboard className="h-5 w-5 text-purple-700" />
                            </div>
                            <CardTitle className="text-xl text-purple-950 font-black tracking-tight uppercase">Lesson information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-purple-900 ml-1">Lesson Title</Label>
                                <Input 
                                    className="h-11 rounded-xl border-2 border-purple-50 bg-purple-50/20 focus-visible:ring-purple-500 transition-all font-medium"
                                    placeholder="e.g. 'Introduction to React Hooks'"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onBlur={() => onUpdate({ title })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-purple-900 ml-1">Description</Label>
                                <Textarea 
                                    className="min-h-[120px] rounded-xl border-2 border-purple-50 bg-purple-50/20 focus-visible:ring-purple-500 transition-all"
                                    placeholder="Explain what students will learn..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    onBlur={() => onUpdate({ description })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-sky-50 shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center gap-x-3 pb-2">
                            <div className="rounded-xl p-2.5 bg-sky-100/50">
                                <Video className="h-5 w-5 text-sky-700" />
                            </div>
                            <CardTitle className="text-xl text-sky-950 font-black tracking-tight uppercase">Lesson video</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-sky-900 ml-1">Video URL (Direct link)</Label>
                                <Input 
                                    className="h-11 rounded-xl border-2 border-sky-50 bg-sky-50/20 focus-visible:ring-sky-500 transition-all"
                                    placeholder="e.g. 'https://example.com/video.mp4'"
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    onBlur={() => onUpdate({ videoUrl })}
                                />
                            </div>
                            {videoUrl && (
                                <div className="aspect-video mt-4 rounded-2xl overflow-hidden border-2 border-sky-100 bg-black shadow-lg">
                                    <video src={videoUrl} controls className="w-full h-full" />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-2 border-rose-50 shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-x-3">
                                <div className="rounded-xl p-2.5 bg-rose-100/50">
                                    <HelpCircle className="h-5 w-5 text-rose-700" />
                                </div>
                                <CardTitle className="text-xl text-rose-950 font-black tracking-tight uppercase">Assessment Quiz</CardTitle>
                            </div>
                            <Button onClick={addQuizQuestion} variant="outline" size="sm" className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl font-bold px-4">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Question
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-8 pt-4">
                            {quiz.length === 0 ? (
                                <div className="italic text-sm text-zinc-500 py-16 text-center border-2 border-dashed border-rose-100 rounded-2xl bg-rose-50/10">
                                    No quiz questions yet. Create an assessment for your students.
                                </div>
                            ) : (
                                <div className="space-y-10">
                                    {quiz.map((q, qIndex) => (
                                        <div key={qIndex} className="p-6 bg-rose-50/20 rounded-3xl border-2 border-rose-50 space-y-6 relative group hover:border-rose-100 transition-all">
                                            <Button 
                                                onClick={() => removeQuizQuestion(qIndex)}
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-4 right-4 text-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                            
                                            <div className="space-y-3">
                                                <Label className="text-xs font-black text-rose-900 ml-1 uppercase tracking-[0.2em] opacity-60">Question {qIndex + 1}</Label>
                                                <Input 
                                                    className="h-11 rounded-xl border-2 border-rose-100 bg-white focus-visible:ring-rose-500 font-bold"
                                                    value={q.question}
                                                    onChange={(e) => updateQuizQuestion(qIndex, "question", e.target.value)}
                                                    onBlur={() => onUpdate({ quiz })}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                {q.options.map((option: string, oIndex: number) => (
                                                    <div key={oIndex} className="space-y-2">
                                                        <Label className="text-[10px] font-black text-rose-700 ml-1 uppercase opacity-60">Option {String.fromCharCode(65 + oIndex)}</Label>
                                                        <Input 
                                                            className="h-10 rounded-xl border-2 border-rose-50 bg-white focus-visible:ring-rose-500 text-xs font-medium"
                                                            value={option}
                                                            onChange={(e) => updateQuizOption(qIndex, oIndex, e.target.value)}
                                                            onBlur={() => onUpdate({ quiz })}
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black text-emerald-700 ml-1 uppercase opacity-60">Correct Answer</Label>
                                                    <Select 
                                                        value={q.correctAnswer} 
                                                        onValueChange={(val) => {
                                                            updateQuizQuestion(qIndex, "correctAnswer", val);
                                                            onUpdate({ quiz });
                                                        }}
                                                    >
                                                        <SelectTrigger className="h-10 rounded-xl border-2 border-emerald-100 bg-emerald-50/50 text-emerald-900 font-bold text-xs ring-0 focus:ring-emerald-500">
                                                            <SelectValue placeholder="Pick correct answer" />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl border-2 border-emerald-100">
                                                            {q.options.map((o: string) => (
                                                                <SelectItem key={o} value={o} className="text-xs font-bold text-emerald-900">{o}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black text-rose-700 ml-1 uppercase opacity-60">Topic Tag</Label>
                                                    <Input 
                                                        className="h-10 rounded-xl border-2 border-rose-50 bg-white focus-visible:ring-rose-500 text-xs font-bold italic"
                                                        value={q.topic}
                                                        onChange={(e) => updateQuizQuestion(qIndex, "topic", e.target.value)}
                                                        onBlur={() => onUpdate({ quiz })}
                                                        placeholder="e.g. Hooks"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
