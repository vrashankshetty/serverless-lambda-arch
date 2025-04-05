"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { Code, Copy, MoreVertical, Play, Check } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Function } from "@/types"
import { toast } from "@/hooks/use-toast"
import { API_BASE_URL } from "@/api"


interface FunctionsListProps {
  type?: "python" | "javascript" | "all"
  data:Function[]
}

export function FunctionsList({ type,data }: FunctionsListProps) {
  const [functions,setFunctions] = useState<Function[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null);
  useEffect(()=>{
    setFunctions(type!="all" ? data?.filter((f) => f.language === type) : data);
  },[data])

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      toast({
        title: "Copied to clipboard",
        description: "The endpoint URL has been copied to your clipboard.",
      })
      setTimeout(() => {
        setCopiedId(null)
      }, 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy the URL to clipboard.",
        variant: "destructive",
      })
    }
  }

  console.log("functions: ",functions)
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {functions?.map((func) => (
        <Card key={func.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{func.name}</CardTitle>
            
            </div>
            <CardDescription className="flex items-center gap-1">
              <Badge variant="outline" className="capitalize">
                {func.language}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {func.virtualizationType}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Route:</span>
                <code className="rounded bg-muted px-1 py-0.5 text-xs">{func.route}</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Timeout:</span>
                <span>{func.timeout / 1000}s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Updated:</span>
                <span>{formatDistanceToNow(func.updatedAt as Date, { addSuffix: true })}</span>
              </div>
      
              <div className="flex items-center justify-between">
                  <code className="rounded bg-muted px-1 py-0.5 text-xs truncate max-w-[80%]">
                   {`${API_BASE_URL}/executions/run${func.route}`}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(`${API_BASE_URL}/executions/run${func.route}`, func.id as string)}
                    aria-label="Copy endpoint URL"
                  >
                    {copiedId === func.id ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span className="sr-only">Copy endpoint URL</span>
                  </Button>
                </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/functions/${func.id}`}>
                <Code className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/functions/${func.id}/run`}>
                <Play className="mr-2 h-4 w-4" />
                Run
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

