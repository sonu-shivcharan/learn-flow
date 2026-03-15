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
            <div key={i} className="h-80 bg-zinc-50 border-2 border-zinc-100 animate-pulse rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border-2 border-zinc-50">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight uppercase">Instructor Hub</h1>
          <p className="text-sm text-zinc-500 font-medium">Manage and monitor your course portfolio</p>
        </div>
        <Link href="/teacher/create">
          <Button className="h-12 px-6 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Create New Course
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-3 bg-zinc-50/50 p-2 rounded-2xl border-2 border-zinc-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Search your courses..." 
            className="pl-10 h-10 bg-white border-none rounded-xl text-sm focus-visible:ring-zinc-200"
          />
        </div>
        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl bg-white border-zinc-200">
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-zinc-400">
          <List className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-32 border-4 border-dashed border-zinc-50 rounded-[3rem] bg-zinc-50/20 text-zinc-400 text-center">
            <div className="p-6 bg-white rounded-3xl shadow-xl mb-6">
               <PlusCircle className="h-12 w-12 opacity-10" />
            </div>
            <p className="text-xl font-bold tracking-tight mb-2">Your portfolio is empty</p>
            <p className="text-sm font-medium mb-8">Start your teaching journey today by creating your first course.</p>
            <Link href="/teacher/create">
              <Button variant="outline" className="border-2 border-zinc-200 rounded-xl font-bold h-11 px-8">
                Initialize Course
              </Button>
            </Link>
          </div>
        ) : (
          courses.map((course) => (
            <Card key={course._id} className="group overflow-hidden rounded-[2.5rem] border-2 border-zinc-50 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
              <div className="aspect-video relative overflow-hidden bg-zinc-100">
                {course.imageUrl ? (
                  <img src={course.imageUrl} alt={course.title} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 font-black text-xs uppercase tracking-[0.2em] italic">
                    Placeholder Preview
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <Badge variant={course.isPublished ? "default" : "secondary"} className={`rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-wider ${course.isPublished ? "bg-emerald-500 text-white" : "bg-amber-100 text-amber-700"} border-none shadow-sm`}>
                    {course.isPublished ? "Published" : "Draft Mode"}
                  </Badge>
                </div>
              </div>
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-xl font-black text-zinc-900 line-clamp-1 group-hover:text-zinc-600 transition-colors tracking-tight mb-1">{course.title}</CardTitle>
                <CardDescription className="text-xs font-medium text-zinc-400 line-clamp-2 leading-relaxed h-8">
                  {course.description || "Synthesize your knowledge and impact your students."}
                </CardDescription>
              </CardHeader>
              <CardFooter className="p-6 pt-2">
                <Link href={`/teacher/courses/${course._id}`} className="w-full">
                  <Button className="w-full h-11 bg-zinc-50 hover:bg-zinc-100 text-zinc-900 border-2 border-zinc-100/50 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
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
