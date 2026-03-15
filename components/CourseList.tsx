"use client";

import { useQuery } from "@tanstack/react-query";
import { CourseCard } from "./CourseCard";

export function CourseList() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["courses"],
        queryFn: async () => {
            const res = await fetch("/api/courses");
            if (!res.ok) throw new Error("Failed to fetch courses");
            return res.json();
        }
    });

    const courses = data?.courses || [];

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
                ))}
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500">Error loading courses.</div>;
    }

    if (courses.length === 0) {
        return (
            <div className="text-center p-8 border border-dashed rounded-lg bg-muted/50 text-muted-foreground">
                No courses available at the moment. Please check back later!
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {courses.map((course: any) => (
                <CourseCard 
                    key={course._id} 
                    id={course._id} 
                    title={course.title} 
                    description={course.description || "Learn about this topic in depth."} 
                    imageUrl={course.imageUrl} 
                    price={course.price}
                />
            ))}
        </div>
    );
}
