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
                <Card className="max-w-xl mx-auto mt-10 shadow-lg border-primary/20 overflow-hidden rounded-3xl">
                    <CardHeader className="text-center bg-muted/50 pb-8">
                        <CardTitle className="text-3xl font-black text-foreground uppercase tracking-tight">Quiz Results</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-6 pt-10">
                        <div className="relative inline-block">
                            <div className="text-6xl font-black text-foreground mb-2">
                                {score}<span className="text-2xl text-muted-foreground">/{questions.length}</span>
                            </div>
                            <div className={`h-2 w-full rounded-full ${score === questions.length ? "bg-primary" : "bg-orange-500"}`} />
                        </div>
                        <p className="text-lg font-bold text-muted-foreground px-6 leading-tight uppercase tracking-tight italic">
                            {score === questions.length ? "Legendary! You've mastered this lesson." : "Strategic effort! Focus on your weak spots to grow."}
                        </p>
                        {wrongTopics.length > 0 && (
                            <div className="pt-6 space-y-4">
                                <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.25em]">Focus areas to review</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {wrongTopics.map(topic => (
                                        <Badge key={topic} variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 font-bold px-4 py-1.5 rounded-full shadow-sm">{topic}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="justify-center border-t bg-muted/20 p-8">
                        <Button 
                            onClick={() => window.location.reload()} 
                            disabled={submitMutation.isPending}
                            className="h-12 px-10 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95"
                        >
                            {submitMutation.isPending ? "Syncing..." : "Retake Training"}
                        </Button>
                    </CardFooter>
                </Card>

                <div className="max-w-5xl mx-auto border-t pt-12">
                    <Recommendations topics={wrongTopics} courseId={courseId} />
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentStep];

    return (
        <Card className="max-w-2xl mx-auto mt-10 shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                        Question {currentStep + 1} of {questions.length}
                    </span>
                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-bold">
                        {currentQuestion.topic}
                    </Badge>
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">
                    {currentQuestion.question}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
                {currentQuestion.options.map(option => (
                    <button
                        key={option}
                        onClick={() => setSelectedOption(option)}
                        className={`w-full p-4 text-left border rounded-xl transition-all font-medium ${
                            selectedOption === option 
                                ? "bg-accent border-primary ring-1 ring-primary shadow-sm" 
                                : "bg-card border-input hover:bg-accent hover:border-accent"
                        }`}
                    >
                        {option}
                    </button>
                ))}
            </CardContent>
            <CardFooter className="pt-8 pb-8 flex flex-col items-center">
                <Button 
                    className="w-full h-14 text-base font-semibold rounded-xl transition-all"
                    disabled={!selectedOption} 
                    onClick={handleNext}
                >
                    {currentStep === questions.length - 1 ? "Finish Quiz" : "Next Question"}
                </Button>
            </CardFooter>
        </Card>
    );
}
