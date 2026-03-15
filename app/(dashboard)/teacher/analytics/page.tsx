"use client";

import { LayoutDashboard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold">Analytics</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <span className="text-xs text-muted-foreground">$0.00</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$0</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                        <span className="text-xs text-muted-foreground">0</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                    </CardContent>
                </Card>
            </div>
            <Card className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                <LayoutDashboard className="h-12 w-12 mb-4 opacity-10" />
                <p>Analytics coming soon. Start publishing courses to see data!</p>
            </Card>
        </div>
    );
}
