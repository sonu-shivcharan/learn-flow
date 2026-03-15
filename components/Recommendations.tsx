"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Recommendations() {
    const { data: courses = [], isLoading } = useQuery({
        queryKey: ["recommendations"],
        queryFn: async () => {
            const res = await fetch("/api/recommendations");
            if (!res.ok) throw new Error("Failed to fetch recommendations");
            return res.json();
        }
    });

    if (isLoading) return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-48 rounded-3xl bg-zinc-100 animate-pulse" />
            ))}
        </div>
    );

    if (courses.length === 0) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-x-3">
                <div className="p-2 bg-amber-100 rounded-xl">
                    <Sparkles className="h-5 w-5 text-amber-600" />
                </div>
                <h2 className="text-2xl font-black text-zinc-900 tracking-tight">AI Personalized Recommendations</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course: any) => (
                    <Card key={course._id} className="group overflow-hidden rounded-3xl border-2 border-zinc-50 hover:border-amber-100 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1">
                        <div className="aspect-video relative overflow-hidden">
                            {course.imageUrl ? (
                                <img src={course.imageUrl} alt={course.title} className="object-cover w-full h-full transition-transform group-hover:scale-110" />
                            ) : (
                                <div className="w-full h-full bg-zinc-50 flex items-center justify-center text-zinc-400 font-bold">No Image</div>
                            )}
                            <div className="absolute top-4 right-4">
                                <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none font-black px-3 py-1 scale-110 shadow-lg">AI PICK</Badge>
                            </div>
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-black text-zinc-800 line-clamp-1 group-hover:text-amber-600 transition-colors uppercase tracking-tight">{course.title}</CardTitle>
                        </CardHeader>
                        <CardFooter className="pt-0">
                            <Link href={`/courses/${course._id}`} className="w-full">
                                <button className="w-full flex items-center justify-between p-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-amber-600 transition-colors group-hover:shadow-lg">
                                    <span>View Recommendation</span>
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
