"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Recommendations } from "./Recommendations";

interface QuizProps {
    courseId: string;
    lessonId: string;
    questions: {
        question: string;
        options: string[];
        correctAnswer: string;
        topic: string;
    }[];
}

export function Quiz({ courseId, lessonId, questions }: QuizProps) {
    const queryClient = useQueryClient();
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [wrongTopics, setWrongTopics] = useState<string[]>([]);

    const submitMutation = useMutation({
        mutationFn: async ({ finalScore, finalWrongTopics }: { finalScore: number, finalWrongTopics: string[] }) => {
            const res = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/quiz`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    score: finalScore,
                    totalQuestions: questions.length,
                    weakTopics: finalWrongTopics,
                }),
            });
            if (!res.ok) throw new Error("Failed to submit quiz");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recommendations"] });
        }
    });

    const handleNext = async () => {
        const isCorrect = selectedOption === questions[currentStep].correctAnswer;
        const newScore = isCorrect ? score + 1 : score;
        const newWrongTopics = isCorrect 
            ? wrongTopics 
            : Array.from(new Set([...wrongTopics, questions[currentStep].topic]));

        if (currentStep < questions.length - 1) {
            setScore(newScore);
            setWrongTopics(newWrongTopics);
            setCurrentStep(currentStep + 1);
            setSelectedOption(null);
        } else {
            setScore(newScore);
            setWrongTopics(newWrongTopics);
            setCompleted(true);
            
            // Submit result
            submitMutation.mutate({ finalScore: newScore, finalWrongTopics: newWrongTopics });
        }
    };

    if (completed) {
        return (
            <div className="space-y-8">
                <Card className="max-w-xl mx-auto mt-10 shadow-lg border-2 border-emerald-100 overflow-hidden rounded-3xl">
                    <CardHeader className="text-center bg-emerald-50/50 pb-8">
                        <CardTitle className="text-3xl font-black text-emerald-900 uppercase tracking-tight">Quiz Results</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-6 pt-10">
                        <div className="relative inline-block">
                            <div className="text-6xl font-black text-zinc-900 mb-2">
                                {score}<span className="text-2xl text-zinc-400">/{questions.length}</span>
                            </div>
                            <div className={`h-2 w-full rounded-full ${score === questions.length ? "bg-emerald-500" : "bg-amber-400"}`} />
                        </div>
                        <p className="text-lg font-bold text-zinc-600 px-6 leading-tight uppercase tracking-tight italic">
                            {score === questions.length ? "Legendary! You've mastered this lesson." : "Strategic effort! Focus on your weak spots to grow."}
                        </p>
                        {wrongTopics.length > 0 && (
                            <div className="pt-6 space-y-4">
                                <p className="text-xs font-black text-zinc-400 uppercase tracking-[0.25em]">Focus areas to review</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {wrongTopics.map(topic => (
                                        <Badge key={topic} className="bg-rose-50 text-rose-700 border-rose-100 font-bold px-4 py-1.5 rounded-full shadow-sm">{topic}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="justify-center border-t border-zinc-50 bg-zinc-50/20 p-8">
                        <Button 
                            onClick={() => window.location.reload()} 
                            disabled={submitMutation.isPending}
                            className="h-12 px-10 rounded-2xl font-black text-xs uppercase tracking-widest bg-zinc-900 border-none hover:bg-emerald-600 transition-all shadow-lg active:scale-95"
                        >
                            {submitMutation.isPending ? "Syncing..." : "Retake Training"}
                        </Button>
                    </CardFooter>
                </Card>

                <div className="max-w-5xl mx-auto border-t border-zinc-100 pt-12">
                    <Recommendations topics={wrongTopics} courseId={courseId} />
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentStep];

    return (
        <Card className="max-w-xl mx-auto mt-10 shadow-md">
            <CardHeader>
                <div className="flex justify-between items-center mb-2">
                    <Badge variant="outline">Question {currentStep + 1} of {questions.length}</Badge>
                    <Badge variant="secondary">{currentQuestion.topic}</Badge>
                </div>
                <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {currentQuestion.options.map(option => (
                    <button
                        key={option}
                        onClick={() => setSelectedOption(option)}
                        className={`w-full p-4 text-left border rounded-lg transition-all ${
                            selectedOption === option 
                                ? "bg-blue-50 border-blue-400 ring-1 ring-blue-400 shadow-sm" 
                                : "hover:bg-zinc-50 hover:border-zinc-300"
                        }`}
                    >
                        {option}
                    </button>
                ))}
            </CardContent>
            <CardFooter className="pt-6">
                <Button 
                    className="w-full h-12 text-lg" 
                    disabled={!selectedOption} 
                    onClick={handleNext}
                >
                    {currentStep === questions.length - 1 ? "Finish Quiz" : "Next Question"}
                </Button>
            </CardFooter>
        </Card>
    );
}
