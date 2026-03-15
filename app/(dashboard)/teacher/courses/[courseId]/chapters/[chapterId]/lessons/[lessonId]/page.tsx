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

const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

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

    const updateQuizQuestion = (index: number, field: string, value: any, shouldSave = false) => {
        const updatedQuiz = [...quiz];
        updatedQuiz[index] = { ...updatedQuiz[index], [field]: value };
        setQuiz(updatedQuiz);
        if (shouldSave) {
            onUpdate({ quiz: updatedQuiz });
        }
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

    if (isLoading) return <div className="p-6">Loading lesson editor...</div>;
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
                        className="flex items-center text-sm font-medium hover:underline transition"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to chapter setup
                    </Link>
                    <div className="flex flex-col gap-y-1 mt-4">
                        <h1 className="text-2xl font-bold">Lesson setup</h1>
                        <span className="text-sm text-muted-foreground">{completionText}</span>
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
                    <Card className="border shadow-sm">
                        <CardHeader className="flex flex-row items-center gap-x-3 pb-2">
                            <LayoutDashboard className="h-5 w-5 text-zinc-700" />
                            <CardTitle className="text-xl">Lesson information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Lesson Title</Label>
                                <Input 
                                    className="h-10"
                                    placeholder="e.g. 'Introduction to React Hooks'"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onBlur={() => onUpdate({ title })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Description</Label>
                                <Textarea 
                                    className="min-h-[120px]"
                                    placeholder="Explain what students will learn..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    onBlur={() => onUpdate({ description })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center gap-x-3 pb-2">
                            <Video className="h-5 w-5" />
                            <CardTitle className="text-xl">Lesson video</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Video URL (Direct link)</Label>
                                <Input 
                                    className="h-10"
                                    placeholder="e.g. 'https://example.com/video.mp4'"
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    onBlur={() => onUpdate({ videoUrl })}
                                />
                            </div>
                            {videoUrl && (
                                <div className="aspect-video mt-4 rounded-md overflow-hidden border bg-black">
                                    {getYouTubeId(videoUrl) ? (
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={`https://www.youtube.com/embed/${getYouTubeId(videoUrl)}`}
                                            title="YouTube video player"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="w-full h-full"
                                        />
                                    ) : (
                                        <video src={videoUrl} controls className="w-full h-full" />
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-x-3">
                                <HelpCircle className="h-5 w-5 text-zinc-700" />
                                <CardTitle className="text-xl">Assessment Quiz</CardTitle>
                            </div>
                            <Button onClick={addQuizQuestion} variant="outline" size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Question
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-8 pt-4">
                            {quiz.length === 0 ? (
                                <div className="italic text-sm text-muted-foreground py-12 text-center border-2 border-dashed rounded-lg bg-zinc-50/50">
                                    No quiz questions yet. Create an assessment for your students.
                                </div>
                            ) : (
                                <div className="space-y-10">
                                    {quiz.map((q, qIndex) => (
                                        <div key={qIndex} className="p-4 bg-zinc-50/50 rounded-lg border space-y-4 relative group">
                                            <Button 
                                                onClick={() => removeQuizQuestion(qIndex)}
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                            
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold">Question {qIndex + 1}</Label>
                                                <Input 
                                                    className="h-10"
                                                    value={q.question}
                                                    onChange={(e) => updateQuizQuestion(qIndex, "question", e.target.value)}
                                                    onBlur={() => onUpdate({ quiz })}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                {q.options.map((option: string, oIndex: number) => (
                                                    <div key={oIndex} className="space-y-2">
                                                        <Label className="text-[10px] font-semibold text-muted-foreground">Option {String.fromCharCode(65 + oIndex)}</Label>
                                                        <Input 
                                                            className="h-9"
                                                            value={option}
                                                            onChange={(e) => updateQuizOption(qIndex, oIndex, e.target.value)}
                                                            onBlur={() => onUpdate({ quiz })}
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-semibold text-muted-foreground">Correct Answer</Label>
                                                    <Select 
                                                        value={q.correctAnswer} 
                                                        onValueChange={(val) => updateQuizQuestion(qIndex, "correctAnswer", val, true)}
                                                    >
                                                        <SelectTrigger className="h-9">
                                                            <SelectValue placeholder="Pick correct answer" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {q.options.map((o: string) => (
                                                                <SelectItem key={o} value={o}>{o}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-semibold text-muted-foreground">Topic Tag</Label>
                                                    <Input 
                                                        className="h-9"
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
