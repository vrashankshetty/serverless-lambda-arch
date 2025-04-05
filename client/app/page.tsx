"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecentExecutions } from "@/components/recent-executions"
import { FunctionStats } from "@/components/function-stats"
import { ExecutionChart } from "@/components/execution-chart"
import { useQueryDashboard } from "@/hooks/use-query";
import { Execution } from "@/types";

export default function Dashboard() {
  const { data,isLoading } = useQueryDashboard();
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <FunctionStats 
              totalFunctions={data?.totalFunctions as number}
              totalExecutions={data?.totalExecutions as number}
              avgExecutionTime={data?.avgExecutionTime as number}
              successfulExecutions={data?.successfulExecutions as number}
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Execution Performance</CardTitle>
                <CardDescription>Function execution duration over time</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ExecutionChart data={data?.recentExecutions as Execution[]} />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Executions</CardTitle>
                <CardDescription>Latest function executions across all functions</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentExecutions executions={data?.recentExecutions as Execution[]} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Success Rate</CardTitle>
                <CardDescription>Percentage of successful executions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.successfulExecutions} %</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Average Duration</CardTitle>
                <CardDescription>Average execution time in milliseconds</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.avgExecutionTime} ms</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Executions</CardTitle>
                <CardDescription>Number of executions in the last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.totalExecutions}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

