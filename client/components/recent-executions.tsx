"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Execution } from "@/types"



export function RecentExecutions(data: { executions: Execution[] }) {
  return (
    <ScrollArea className="h-[350px]">
      <div className="space-y-4">
        {data?.executions?.map((execution) => (
          <div key={execution?.id} className="flex items-center justify-between space-x-4 rounded-md border p-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {execution.status === "success" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <Link href={`/functions/${execution.functionId}`} className="font-medium hover:underline">
                  {execution.functionName}
                </Link>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatDistanceToNow(execution.startTime, { addSuffix: true })}</span>
                <span>•</span>
                <span>{execution.duration}ms</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={execution.status === "success" ? "outline" : "destructive"}>{execution.status}</Badge>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/executions/${execution.id}`}>View</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

