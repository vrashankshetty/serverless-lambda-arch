"use client"

import { Usable, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeEditor } from "@/components/code-editor"
import { ArrowLeft, Play, Loader2 } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { use } from "react"
import functionApi from "@/api"
import { useQueryEachFunction } from "@/hooks/use-query"
import { Function } from "@/types"
import { useToast } from "@/hooks/use-toast"

interface RunFunctionPageProps {
  params:Usable<{
      id: string
  }>
}

export default function RunFunctionPage({ params }: RunFunctionPageProps) {
  const { id } = use(params)
  const { toast } = useToast();
  const { data, isLoading: isFunctionLoading } = useQueryEachFunction(id)
  
  const [function_, setFunction] = useState<Function | null>(null)
  const [paramsText, setParamsText] = useState<string>(`{
  "amount": 100,
  "currency": "USD",
  "customerId": "cust_123456"
}`)

  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<{
    status: "success" | "error"
    duration: number
    output?: any
    error?: string
    logs?: string
  } | null>(null)

  // Set function data when it's loaded
  useEffect(() => {
    if (data) {
      setFunction(data)
        setParamsText(`{
        "name": "User",
        "action": "purchase",
        "details": {
          "amount": 100,
          "currency": "USD"
        }
      }`)
    }
  }, [data])


  const handleRun = async () => {
    console.log("Running function with params:", paramsText)
    if (!function_) return
    let parsedParams: any

    try {
      console.log("Parsing parameters:", paramsText)
      parsedParams = JSON.parse(paramsText)
    } catch (error) {
      console.error("Error parsing parameters:", error)
      toast({
        title: "Invalid JSON",
        description: "Please provide valid JSON as parameters",
        variant: "destructive"
      })
      return
    }
    
    setIsRunning(true)
    setResult(null)
    const startTime = Date.now()
    try {  
      // Execute function with API
      const response = await functionApi.execute(function_.route, parsedParams)
      console.log("Function executed successfully:", response)
      const duration = Date.now() - startTime
      
      setResult({
        status: "success",
        duration,
        output: response,
        logs: `Function executed successfully in ${duration}ms`
      })
      
      toast({
        title: "Function executed",
        description: `Function ${function_.name} executed successfully in ${duration}ms`
      })
    } catch (error: any) {
      const duration = Date.now() - startTime
      
      setResult({
        status: "error",
        duration,
        error: error.message || "Function execution failed",
        logs: error.message || "Error: Function execution failed"
      })
      
      toast({
        title: "Execution failed",
        description: error.message || "Function execution failed",
        variant: "destructive"
      })
    } finally {
      setIsRunning(false)
    }
  }

  if (isFunctionLoading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center h-40">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        <p>Loading function details...</p>
      </div>
    )
  }
  
  if (!function_) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6 flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/functions">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Function not found</h1>
        </div>
        <div className="flex items-center justify-center h-40">
          <p>The requested function was not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/functions/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Run Function: {function_.name}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Function Parameters</CardTitle>
            <CardDescription>
              Enter the parameters to pass to your {function_.language === "javascript" ? "JavaScript" : "Python"} function
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeEditor
              language="json"
              defaultValue={paramsText}
              onChange={(value) => setParamsText(value || "")}
              height="200px"
            />
          </CardContent>
          <CardFooter>
            <div className="text-xs text-muted-foreground mr-auto">
              Route: <code className="bg-muted px-1 py-0.5 rounded">{function_.route}</code>
            </div>
            <Button onClick={handleRun} disabled={isRunning} className="ml-auto">
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Function
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Execution Result</CardTitle>
            <CardDescription>View the result of your function execution</CardDescription>
          </CardHeader>
          <CardContent>
            {isRunning ? (
              <div className="flex h-[300px] items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p>Executing function...</p>
                </div>
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={result.status === "success" ? "outline" : "destructive"}
                      className={result.status === "success" ? "bg-green-500/10 text-green-500" : ""}
                    >
                      {result.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">Duration: {result.duration}ms</span>
                  </div>
                </div>

                <Tabs defaultValue="output">
                  <TabsList>
                    <TabsTrigger value="output">Output</TabsTrigger>
                    <TabsTrigger value="logs">Logs</TabsTrigger>
                  </TabsList>
                  <TabsContent value="output" className="mt-2">
                    {result.status === "success" ? (
                      <pre className="max-h-[300px] overflow-auto rounded-md bg-muted p-4 text-xs">
                        {JSON.stringify(result.output, null, 2)}
                      </pre>
                    ) : (
                      <div className="rounded-md bg-red-500/10 p-4 text-sm text-red-500">{result.error}</div>
                    )}
                  </TabsContent>
                  <TabsContent value="logs" className="mt-2">
                    <pre className="max-h-[300px] overflow-auto rounded-md bg-muted p-4 text-xs whitespace-pre-line">
                      {result.logs}
                    </pre>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                Run the function to see results
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

