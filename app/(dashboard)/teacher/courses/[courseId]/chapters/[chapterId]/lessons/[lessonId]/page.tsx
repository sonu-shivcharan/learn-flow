"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, LayoutDashboard, Video, HelpCircle, Plus, Trash } from "lucide-react";

interface LessonEditorProps {
    params: Promise<{ courseId: string; chapterId: string; lessonId: string }>;
}

export default function LessonEditorPage({ params }: LessonEditorProps) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [lesson, setLesson] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    // Form states
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [quiz, setQuiz] = useState<any[]>([]);

    useEffect(() => {
        fetch(`/api/courses/${resolvedParams.courseId}/lessons/${resolvedParams.lessonId}`)
            .then(res => res.json())
            .then(data => {
                setLesson(data.lesson);
                setTitle(data.lesson.title);
                setDescription(data.lesson.description || "");
                setVideoUrl(data.lesson.videoUrl || "");
                setQuiz(data.lesson.quiz || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [resolvedParams.courseId, resolvedParams.lessonId]);

    const onUpdate = async (values: any) => {
        try {
            setIsUpdating(true);
            const res = await fetch(`/api/courses/${resolvedParams.courseId}/lessons/${resolvedParams.lessonId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            if (res.ok) {
                const updated = await res.json();
                setLesson(updated);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsUpdating(false);
        }
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

    const togglePublish = async () => {
        await onUpdate({ isPublished: !lesson.isPublished });
    };

    if (loading) return <div className="p-6 text-purple-800">Loading lesson editor...</div>;
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
                        <h1 className="text-3xl font-bold text-purple-950">Lesson setup</h1>
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
                    <Card className="border-2 border-purple-50">
                        <CardHeader className="flex flex-row items-center gap-x-3 pb-2">
                            <div className="rounded-xl p-2.5 bg-purple-100/50">
                                <LayoutDashboard className="h-5 w-5 text-purple-700" />
                            </div>
                            <CardTitle className="text-xl text-purple-950">Lesson information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div>
                                <label className="text-sm font-bold text-purple-900 ml-1">Lesson Title</label>
                                <input 
                                    className="flex h-11 w-full rounded-xl border-2 border-purple-50 bg-purple-50/20 px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 transition-all mt-2"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onBlur={() => onUpdate({ title })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-purple-900 ml-1">Description</label>
                                <textarea 
                                    className="flex min-h-[120px] w-full rounded-xl border-2 border-purple-50 bg-purple-50/20 px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 transition-all mt-2"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    onBlur={() => onUpdate({ description })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-sky-50">
                        <CardHeader className="flex flex-row items-center gap-x-3 pb-2">
                            <div className="rounded-xl p-2.5 bg-sky-100/50">
                                <Video className="h-5 w-5 text-sky-700" />
                            </div>
                            <CardTitle className="text-xl text-sky-950">Lesson video</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div>
                                <label className="text-sm font-bold text-sky-900 ml-1">Video URL (Direct link)</label>
                                <input 
                                    className="flex h-11 w-full rounded-xl border-2 border-sky-50 bg-sky-50/20 px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 transition-all mt-2"
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    onBlur={() => onUpdate({ videoUrl })}
                                />
                            </div>
                            {videoUrl && (
                                <div className="aspect-video mt-4 rounded-xl overflow-hidden border-2 border-sky-100 bg-black">
                                    <video src={videoUrl} controls className="w-full h-full" />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-2 border-rose-50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-x-3">
                                <div className="rounded-xl p-2.5 bg-rose-100/50">
                                    <HelpCircle className="h-5 w-5 text-rose-700" />
                                </div>
                                <CardTitle className="text-xl text-rose-950">Assessment Quiz</CardTitle>
                            </div>
                            <Button onClick={addQuizQuestion} variant="outline" size="sm" className="border-rose-200 text-rose-700 hover:bg-rose-50">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Question
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            {quiz.length === 0 ? (
                                <div className="italic text-sm text-zinc-500 py-12 text-center border-2 border-dashed border-rose-100 rounded-2xl bg-rose-50/10">
                                    No quiz questions yet.
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {quiz.map((q, qIndex) => (
                                        <div key={qIndex} className="p-6 bg-rose-50/30 rounded-2xl border-2 border-rose-50 space-y-4 relative group">
                                            <button 
                                                onClick={() => removeQuizQuestion(qIndex)}
                                                className="absolute top-4 right-4 p-2 text-rose-300 hover:text-rose-600 transition-colors"
                                            >
                                                <Trash className="h-4 w-4" />
                                            </button>
                                            
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-rose-900 ml-1 uppercase tracking-wider">Question {qIndex + 1}</label>
                                                <input 
                                                    className="w-full bg-white border-2 border-rose-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                                                    value={q.question}
                                                    onChange={(e) => updateQuizQuestion(qIndex, "question", e.target.value)}
                                                    onBlur={() => onUpdate({ quiz })}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                {q.options.map((option: string, oIndex: number) => (
                                                    <div key={oIndex} className="space-y-1">
                                                        <label className="text-[10px] font-bold text-rose-700 ml-1">Option {String.fromCharCode(65 + oIndex)}</label>
                                                        <input 
                                                            className="w-full bg-white border-2 border-rose-50 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                                                            value={option}
                                                            onChange={(e) => updateQuizOption(qIndex, oIndex, e.target.value)}
                                                            onBlur={() => onUpdate({ quiz })}
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex gap-4">
                                                <div className="flex-1 space-y-1">
                                                    <label className="text-[10px] font-bold text-emerald-700 ml-1">Correct Answer</label>
                                                    <select 
                                                        className="w-full bg-emerald-50 border-2 border-emerald-100 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                                                        value={q.correctAnswer}
                                                        onChange={(e) => {
                                                            updateQuizQuestion(qIndex, "correctAnswer", e.target.value);
                                                            onUpdate({ quiz });
                                                        }}
                                                    >
                                                        {q.options.map((o: string) => <option key={o} value={o}>{o}</option>)}
                                                    </select>
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <label className="text-[10px] font-bold text-rose-700 ml-1">Topic Tag</label>
                                                    <input 
                                                        className="w-full bg-white border-2 border-rose-50 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
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
