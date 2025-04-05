"use client"

import { Usable, use, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useQueryEachExecution } from "@/hooks/use-query"
import { Execution } from "@/types"
import { getDate } from "date-fns"
import { getCustomDate } from "@/utils"

interface ExecutionDetailPageProps {
  params: Usable<{
    id: string
  }>
}

export default  function ExecutionDetailPage({ params }: ExecutionDetailPageProps) {
  const { id } =  use(params)
  const {data,isLoading} = useQueryEachExecution(id);
  const [execution, setExecution] = useState<Execution>()
  useEffect(() => {
    if (data) {
      setExecution(data)
    }
  }, [data])  

  return (
    <div className="container mx-auto py-6">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <p>Loading...</p>
        </div>
      ) : execution === undefined ? (
        <div className="flex items-center justify-center h-full">
          <p>Execution not found</p>
        </div>
      ) : null}
      {execution && (
      <>
      <div className="mb-6 flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/executions">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Execution Details</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Execution Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge
                  variant={execution.status === "success" ? "outline" : "destructive"}
                  className={execution.status === "success" ? "bg-green-500/10 text-green-500" : ""}
                >
                  {execution.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Function:</span>
                <Link href={`/functions/${execution.functionId}`} className="font-medium hover:underline">
                  {execution.functionName}
                </Link>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Execution ID:</span>
                <code className="rounded bg-muted px-1 py-0.5 text-xs">{execution.id}</code>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Start Time:</span>
                <span>{getCustomDate(execution.startTime)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">End Time:</span>
                <span>{getCustomDate(execution.endTime)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span>{execution.duration}ms</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Execution Result</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="output">
              <TabsList>
                <TabsTrigger value="output">Output</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
              </TabsList>
              <TabsContent value="output" className="mt-4">
                <pre className="max-h-[400px] overflow-auto rounded-md bg-muted p-4 text-xs">
                  {JSON.stringify(execution.output, null, 2)}
                </pre>
              </TabsContent>
              <TabsContent value="logs" className="mt-4">
                <pre className="max-h-[400px] overflow-auto rounded-md bg-muted p-4 text-xs whitespace-pre-line">
                  {execution.logs}
                </pre>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      </>
      )}
    </div>
  )
}

