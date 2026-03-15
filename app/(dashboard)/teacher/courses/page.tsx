"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, LayoutGrid, List } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function TeacherCoursesPage() {
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["teacher-courses"],
    queryFn: async () => {
      const res = await fetch("/api/teacher/courses");
      if (!res.ok) throw new Error("Failed to fetch teacher courses");
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-zinc-100 animate-pulse rounded-lg" />
          <div className="h-10 w-32 bg-zinc-100 animate-pulse rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 bg-zinc-50 border animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold">Instructor Hub</h1>
          <p className="text-sm text-muted-foreground">Manage and monitor your course portfolio</p>
        </div>
        <Link href="/teacher/create">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Create New Course
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search your courses..." 
            className="pl-10 h-10"
          />
        </div>
        <Button variant="outline" size="icon">
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <List className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-24 border border-dashed rounded-lg bg-zinc-50/50 text-center">
            <PlusCircle className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
            <p className="text-xl font-semibold mb-2">Your portfolio is empty</p>
            <p className="text-sm text-muted-foreground mb-6">Start your teaching journey today by creating your first course.</p>
            <Link href="/teacher/create">
              <Button variant="outline">
                Initialize Course
              </Button>
            </Link>
          </div>
        ) : (
          courses.map((course) => (
            <Card key={course._id} className="group overflow-hidden border shadow-sm hover:shadow-md transition-all">
              <div className="aspect-video relative overflow-hidden bg-zinc-100">
                {course.imageUrl ? (
                  <img src={course.imageUrl} alt={course.title} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground text-xs uppercase tracking-widest italic">
                    Placeholder Preview
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <Badge variant={course.isPublished ? "default" : "secondary"}>
                    {course.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
              </div>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xl font-semibold line-clamp-1">{course.title}</CardTitle>
                <CardDescription className="text-xs line-clamp-2 h-8">
                  {course.description || "Synthesize your knowledge and impact your students."}
                </CardDescription>
              </CardHeader>
              <CardFooter className="p-4 pt-2">
                <Link href={`/teacher/courses/${course._id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    Configure Course
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
