"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [wrongTopics, setWrongTopics] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

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
            await submitResult(newScore, newWrongTopics);
        }
    };

    const submitResult = async (finalScore: number, finalWrongTopics: string[]) => {
        setSubmitting(true);
        try {
            await fetch(`/api/courses/${courseId}/lessons/${lessonId}/quiz`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    score: finalScore,
                    totalQuestions: questions.length,
                    weakTopics: finalWrongTopics,
                }),
            });
        } catch (error) {
            console.error("Failed to submit quiz result:", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (completed) {
        return (
            <Card className="max-w-xl mx-auto mt-10 shadow-lg border-2 border-emerald-100">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-emerald-700">Quiz Completed!</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-4xl font-bold">
                        {score} / {questions.length}
                    </p>
                    <p className="text-zinc-500">
                        {score === questions.length ? "Perfect score! You mastered this lesson." : "Good effort! Keep learning to improve."}
                    </p>
                    {wrongTopics.length > 0 && (
                        <div className="pt-4">
                            <p className="text-sm font-medium text-zinc-700 mb-2">Topics to review:</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {wrongTopics.map(topic => (
                                    <Badge key={topic} variant="secondary">{topic}</Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="justify-center pt-6">
                    <Button onClick={() => window.location.reload()} disabled={submitting}>
                        {submitting ? "Saving..." : "Retake Quiz"}
                    </Button>
                </CardFooter>
            </Card>
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
