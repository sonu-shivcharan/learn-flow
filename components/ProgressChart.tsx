"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen } from "lucide-react";

export function ProgressChart() {
    const { data: progressData = [], isLoading } = useQuery({
        queryKey: ["dashboard-progress"],
        queryFn: async () => {
            const res = await fetch("/api/dashboard/progress");
            if (!res.ok) throw new Error("Failed to fetch progress data");
            return res.json();
        }
    });

    if (isLoading) {
        return (
            <Card className="w-full h-[400px] border-2 border-zinc-50 shadow-sm rounded-3xl">
                <CardHeader>
                    <Skeleton className="h-8 w-[250px] bg-zinc-100" />
                    <Skeleton className="h-4 w-[200px] bg-zinc-50" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[250px] w-full bg-zinc-50 rounded-xl" />
                </CardContent>
            </Card>
        );
    }

    if (progressData.length === 0) {
        return (
            <Card className="w-full border-2 border-dashed border-zinc-200 bg-zinc-50/50 shadow-none rounded-3xl">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-zinc-100">
                        <BookOpen className="h-8 w-8 text-zinc-400" />
                    </div>
                    <h3 className="text-xl font-black text-zinc-900 mb-2 tracking-tight">No Courses Yet</h3>
                    <p className="text-zinc-500 font-medium max-w-sm">
                        You aren't enrolled in any courses. Check out the available courses below to start your learning journey!
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Custom tooltip for the chart
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-zinc-950 border-none p-4 rounded-xl shadow-xl text-white">
                    <p className="font-bold text-sm mb-2">{label}</p>
                    <div className="flex items-center gap-x-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500" />
                        <p className="text-sm font-medium text-zinc-300">
                            Completed: <span className="text-white font-bold">{data.progressPercentage}%</span>
                        </p>
                    </div>
                    <p className="text-xs text-zinc-500 font-medium mt-1">
                        {data.completedLessons} of {data.totalLessons} lessons completed
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="w-full border-2 border-zinc-100 shadow-md rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 pb-8 pt-8 px-8">
                <div className="flex items-center gap-x-3 mb-2">
                    <div className="h-10 w-2 bg-blue-600 rounded-full" />
                    <CardTitle className="text-3xl text-zinc-900 font-black tracking-tight select-none">
                        Your Learning Progress
                    </CardTitle>
                </div>
                <CardDescription className="text-sm font-medium text-zinc-500 ml-5 select-none">
                    Track your completion status across all active enrollments.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-8 px-2 sm:px-8 pb-8">
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={progressData}
                            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                            barSize={40}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                            <XAxis 
                                dataKey="courseTitle" 
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#71717a', fontSize: 12, fontWeight: 600 }}
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 500 }}
                                dx={-10}
                                domain={[0, 100]}
                                tickFormatter={(value) => `${value}%`}
                            />
                            <Tooltip 
                                content={<CustomTooltip />} 
                                cursor={{ fill: '#f4f4f5', opacity: 0.5, radius: 8 }} 
                            />
                            <Bar 
                                dataKey="progressPercentage" 
                                radius={[8, 8, 8, 8]}
                                animationDuration={1500}
                                animationEasing="ease-out"
                            >
                                {
                                    progressData.map((entry: any, index: number) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={entry.progressPercentage === 100 ? '#10b981' : '#3b82f6'} 
                                        />
                                    ))
                                }
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
