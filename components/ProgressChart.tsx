"use client"

import { useQuery } from "@tanstack/react-query"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen } from "lucide-react"

export function ProgressChart() {
  const { data: progressData = [], isLoading } = useQuery({
    queryKey: ["dashboard-progress"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/progress")
      if (!res.ok) throw new Error("Failed to fetch progress data")
      return res.json()
    },
  })

  if (isLoading) {
    return (
      <Card className="h-[400px] w-full rounded-3xl border shadow-sm">
        <CardHeader>
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  if (progressData.length === 0) {
    return (
      <Card className="w-full rounded-3xl border-2 border-dashed bg-muted/50 shadow-none">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border bg-card shadow-sm">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-xl font-black tracking-tight text-foreground">
            No Courses Yet
          </h3>
          <p className="max-w-sm font-medium text-muted-foreground">
            You aren't enrolled in any courses. Check out the available courses
            below to start your learning journey!
          </p>
        </CardContent>
      </Card>
    )
  }

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-xl">
          <p className="mb-2 text-sm font-bold">{label}</p>
          <div className="flex items-center gap-x-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <p className="text-sm font-medium text-muted-foreground">
              Completed:{" "}
              <span className="font-bold text-foreground">
                {data.progressPercentage}%
              </span>
            </p>
          </div>
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            {data.completedLessons} of {data.totalLessons} lessons completed
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="w-full overflow-hidden rounded-[2.5rem] border bg-card shadow-md">
      <CardHeader className="border-b bg-muted/50 px-8 pt-8 pb-8">
        <div className="mb-2 flex items-center gap-x-3">
          <div className="h-10 w-2 rounded-full bg-primary" />
          <CardTitle className="text-3xl font-black tracking-tight text-foreground select-none">
            Your Learning Progress
          </CardTitle>
        </div>
        <CardDescription className="ml-5 text-sm font-medium text-muted-foreground select-none">
          Track your completion status across all active enrollments.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-8 pb-8 sm:px-8">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={progressData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              barSize={40}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
              />
              <XAxis
                dataKey="courseTitle"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12, fontWeight: 600 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12, fontWeight: 500 }}
                dx={-10}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "var(--muted)", opacity: 0.4 }}
              />
              <Bar
                dataKey="progressPercentage"
                radius={[8, 8, 8, 8]}
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {progressData.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.progressPercentage === 100
                        ? "var(--chart-2)"
                        : "var(--chart-1)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
