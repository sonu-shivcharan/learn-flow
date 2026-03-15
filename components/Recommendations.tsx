"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface RecommendationsProps {
    topics?: string[];
    courseId?: string;
}

export function Recommendations({ topics, courseId }: RecommendationsProps) {
    const { data: courses = [], isLoading } = useQuery({
        queryKey: ["recommendations", topics?.join(","), courseId],
        queryFn: async () => {
            const url = new URL("/api/recommendations", window.location.origin);
            if (topics && topics.length > 0) {
                url.searchParams.set("topics", topics.join(","));
            }
            if (courseId) {
                url.searchParams.set("courseId", courseId);
            }
            const res = await fetch(url.toString());
            if (!res.ok) throw new Error("Failed to fetch recommendations");
            return res.json();
        }
    });

    if (isLoading) return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-80 rounded-[2.5rem] bg-zinc-100/50 block" />
            ))}
        </div>
    );

    if (courses.length === 0) return null;

    return (
        <div className="space-y-8 mt-12">
            <div className="flex items-center gap-x-4">
                <div className="p-3 bg-amber-100 rounded-2xl shadow-inner">
                    <Sparkles className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-zinc-900 tracking-tight uppercase">AI Personalized Path</h2>
                    <p className="text-sm text-zinc-500 font-medium">Curated especially for your learning journey</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course: any) => (
                    <Card key={course._id} className="group overflow-hidden rounded-[2.5rem] border-2 border-zinc-50 hover:border-amber-100 transition-all shadow-sm hover:shadow-2xl hover:-translate-y-2 bg-white">
                        <div className="aspect-video relative overflow-hidden bg-zinc-50">
                            {course.imageUrl ? (
                                <img src={course.imageUrl} alt={course.title} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-300 font-bold text-xs uppercase tracking-widest">No Image</div>
                            )}
                            <div className="absolute top-4 right-4 animate-bounce-slow">
                                <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none font-black px-4 py-1.5 scale-110 shadow-xl flex items-center gap-1.5 rounded-full">
                                    <Sparkles className="h-3 w-3" />
                                    AI PICK
                                </Badge>
                            </div>
                        </div>
                        <CardHeader className="p-6 pb-2">
                            <CardTitle className="text-xl font-black text-zinc-900 line-clamp-1 group-hover:text-amber-600 transition-colors uppercase tracking-tight mb-3 leading-tight">{course.title}</CardTitle>
                            {course.aiReason && (
                                <div className="p-4 bg-amber-50/40 rounded-3xl border-2 border-amber-100/30 backdrop-blur-sm">
                                    <p className="text-xs font-bold text-amber-950 leading-relaxed italic opacity-80">
                                        "{course.aiReason}"
                                    </p>
                                </div>
                            )}
                        </CardHeader>
                        <CardFooter className="p-6 pt-2">
                            <Link href={`/courses/${course._id}`} className="w-full">
                                <Button className="w-full flex items-center justify-between h-14 bg-zinc-900 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all group-hover:shadow-lg active:scale-95 border-none">
                                    <span>Master This Path</span>
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
