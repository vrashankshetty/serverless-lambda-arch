"use client";

import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AllExecutions } from "@/components/all-executions"
import { useQueryExecutions } from "@/hooks/use-query";

export default function ExecutionsPage() {
    const { data,isLoading } = useQueryExecutions();
    console.log("data",data)
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <p>Loading...</p>
        </div>
      ) : data === undefined ? (
        <div className="flex items-center justify-center h-full">
          <p>Executions not found</p>
        </div>
      ) : null}
      {data && (
      <>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Executions</h2>
      </div>
      <div className="flex items-center gap-2">
        <Input placeholder="Search executions..." className="max-w-sm" />
      </div>
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Executions</TabsTrigger>
          <TabsTrigger value="success">Success</TabsTrigger>
          <TabsTrigger value="error">Error</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <AllExecutions status="all" data={data??[]} />
        </TabsContent>
        <TabsContent value="success" className="space-y-4">
          <AllExecutions status="success" data={data??[]} />
        </TabsContent>
        <TabsContent value="error" className="space-y-4">
          <AllExecutions status="error" data={data??[]}/>
        </TabsContent>
      </Tabs>
      </>)}
    </div>
  )
}

