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
      <Card className="h-[350px] sm:h-[400px] w-full rounded-2xl sm:rounded-3xl border shadow-sm">
        <CardHeader className="p-4 sm:p-8">
          <Skeleton className="h-6 sm:h-8 w-[150px] sm:w-[250px]" />
          <Skeleton className="h-3 sm:h-4 w-[120px] sm:w-[200px]" />
        </CardHeader>
        <CardContent className="p-4 sm:p-8">
          <Skeleton className="h-[200px] sm:h-[250px] w-full rounded-xl" />
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
    <Card className="w-full overflow-hidden rounded-2xl sm:rounded-[2.5rem] border bg-card shadow-md">
      <CardHeader className="border-b bg-muted/50 p-4 sm:px-8 sm:pt-8 sm:pb-8">
        <div className="mb-1 sm:mb-2 flex items-center gap-x-2 sm:gap-x-3">
          <div className="h-8 sm:h-10 w-1.5 sm:w-2 rounded-full bg-primary" />
          <CardTitle className="text-xl sm:text-3xl font-black tracking-tight text-foreground select-none">
            Your Progress
          </CardTitle>
        </div>
        <CardDescription className="ml-3 sm:ml-5 text-xs sm:text-sm font-medium text-muted-foreground select-none">
          Track your completion across all enrollments.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2 sm:px-8 sm:pt-8 sm:pb-8">
        <div className="h-[300px] sm:h-[350px] w-full lowercase">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={progressData}
              margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
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
                tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: 600 }}
                dy={10}
                interval={0}
                tickFormatter={(value) => value.length > 10 ? `${value.slice(0, 10)}...` : value}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: 500 }}
                dx={0}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                width={40}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "var(--muted)", opacity: 0.4 }}
              />
              <Bar
                dataKey="progressPercentage"
                radius={[4, 4, 4, 4]}
                animationDuration={1500}
                animationEasing="ease-out"
                maxBarSize={45}
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
