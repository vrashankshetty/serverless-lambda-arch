"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"
import { AlertCircle, CheckCircle2, ChevronDown, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useQueryExecutions, useQueryFunctionExecution } from "@/hooks/use-query"
import { Execution } from "@/types"



interface FunctionExecutionsProps {
  functionId: string
}

export function FunctionExecutions({ functionId }: FunctionExecutionsProps) {
  const { data,isLoading } = useQueryFunctionExecution(functionId);
  const [executions,setExecutions] = useState<Execution[]>([])

  const [expandedExecution, setExpandedExecution] = useState<string | null>(null)

  const toggleExpand = (executionId: string) => {
    setExpandedExecution(expandedExecution === executionId ? null : executionId)
  }


  useEffect(() => {
    if (data) {
      setExecutions(data)
    }
  }, [data])

  
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {executions.map((execution) => (
            <TableRow key={execution.id}>
              <TableCell>
                {execution.status === "success" ? (
                  <Badge
                    variant="outline"
                    className="bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-500"
                  >
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Success
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-500"
                  >
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Error
                  </Badge>
                )}
              </TableCell>
              
              <TableCell>{formatDistanceToNow(execution.startTime, { addSuffix: true })}</TableCell>
              <TableCell>{execution.duration}ms</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => toggleExpand(execution.id as string)}>
                  Details
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/executions/${execution.id}`}>
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {expandedExecution && (
        <Card className="p-4">
          {executions
            .filter((execution) => execution.id === expandedExecution)
            .map((execution) => (
              <div key={execution.id} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="mb-2 font-medium">Execution Details</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ID:</span>
                        <span className="font-mono">{execution.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Start Time:</span>
                        <span>{execution.startTime.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">End Time:</span>
                        <span>{execution.endTime.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span>{execution.duration}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className={execution.status === "success" ? "text-green-500" : "text-red-500"}>
                          {execution.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {execution.errorMessage && (
                    <div>
                      <h3 className="mb-2 font-medium text-red-500">Error</h3>
                      <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500">{execution.errorMessage}</div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="mb-2 font-medium">Logs</h3>
                  <pre className="max-h-40 overflow-auto rounded-md bg-muted p-3 text-xs">{execution.logs}</pre>
                </div>

                {execution.output && (
                  <div>
                    <h3 className="mb-2 font-medium">Output</h3>
                    <pre className="max-h-40 overflow-auto rounded-md bg-muted p-3 text-xs">
                      {JSON.stringify(execution.output, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
        </Card>
      )}
    </div>
  )
}

