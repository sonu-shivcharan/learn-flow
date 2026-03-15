"use client";

import { useEffect, useState } from "react";
import { CourseCard } from "./CourseCard";

export function CourseList() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/courses")
            .then(res => res.json())
            .then(data => {
                setCourses(data.courses || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch courses:", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-64 rounded-xl bg-zinc-100 animate-pulse" />
                ))}
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="text-center p-8 border border-dashed rounded-lg bg-zinc-50 text-zinc-500">
                No courses available at the moment. Please check back later!
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {courses.map(course => (
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
