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
                <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
        </div>
    );

    if (courses.length === 0) return null;

    return (
        <div className="space-y-8 mt-12">
            <div className="flex items-center gap-x-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <div>
                    <h2 className="text-2xl font-semibold">Recommended for You</h2>
                    <p className="text-sm text-muted-foreground">Based on your learning history</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course: any) => (
                    <Card key={course._id} className="overflow-hidden border shadow-sm">
                        <div className="aspect-video relative overflow-hidden bg-muted">
                            {course.imageUrl ? (
                                <img src={course.imageUrl} alt={course.title} className="object-cover w-full h-full" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold text-xs uppercase tracking-widest">No Image</div>
                            )}
                            <div className="absolute top-2 right-2">
                                <Badge variant="secondary" className="flex items-center gap-1.5 rounded-full">
                                    <Sparkles className="h-3 w-3" />
                                    AI PICK
                                </Badge>
                            </div>
                        </div>
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-lg font-semibold line-clamp-1">{course.title}</CardTitle>
                            {course.aiReason && (
                                <p className="text-xs text-muted-foreground italic line-clamp-2 mt-2">
                                    "{course.aiReason}"
                                </p>
                            )}
                        </CardHeader>
                        <CardFooter className="p-4 pt-2">
                            <Link href={`/courses/${course._id}`} className="w-full">
                                <Button className="w-full flex items-center justify-between" variant="default">
                                    <span>View Course</span>
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
