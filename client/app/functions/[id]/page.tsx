"use client"

import type React from "react"
import { Usable, use, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeEditor } from "@/components/code-editor"
import { FunctionExecutions } from "@/components/function-executions"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { useQueryEachFunction } from "@/hooks/use-query"
import { Function } from "@/types"
import functionApi from "@/api"
import { useToast } from "@/components/ui/use-toast"

interface FunctionDetailPageProps {
  params: Usable<{
    id: string
  }>
}

export default function FunctionDetailPage({ params }: FunctionDetailPageProps) {
  const router = useRouter()
  const { id } = use(params) as { id: string }
  const { data, isLoading, refetch } = useQueryEachFunction(id);
  const { toast } = useToast();

  const [function_, setFunction] = useState<Function|undefined>();
  const [originalFunction, setOriginalFunction] = useState<Function|undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (data) {
      setFunction(data);
      setOriginalFunction(data); // Store original data for comparison
    }
  }, [data]);

  // Check if form has any changes
  const hasChanges = () => {
    if (!function_ || !originalFunction) return false;
    
    return (
      function_.name !== originalFunction.name ||
      function_.route !== originalFunction.route ||
      function_.language !== originalFunction.language ||
      function_.virtualizationType !== originalFunction.virtualizationType ||
      function_.timeout !== originalFunction.timeout ||
      function_.code !== originalFunction.code
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!function_) return;
    
    try {
      setIsSubmitting(true);
      
      // Call API to update function
      await functionApi.update(id, {
        name: function_.name,
        route: function_.route,
        language: function_.language,
        virtualizationType: function_.virtualizationType,
        timeout: function_.timeout,
        code: function_.code
      });
      
      // Refresh data
      await refetch();
      
      toast({
        title: "Function updated",
        description: `${function_.name} was updated successfully.`,
      });
      
      // Update original function to match current state
      setOriginalFunction(function_);
    } catch (error: any) {
      console.error("Error updating function:", error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update function. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle code editor change with value prop
  const handleCodeChange = (value: string | undefined) => {
    if (function_) {
      setFunction({ ...function_, code: value || "" });
    }
  };

  return (
    <div className="container mx-auto py-6">
      {
        isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <p>Loading function details...</p>
          </div>
        ) : function_ === undefined ? (
          <div className="flex items-center justify-center h-full">
            <p>Function not found</p>
          </div>
        ) : null
      }
      {function_ && (
      <>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/functions">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Edit Function: {function_.name}</h1>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Function Details</TabsTrigger>
          <TabsTrigger value="executions">Executions</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Function Details</CardTitle>
                  <CardDescription>Update your serverless function configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Function Name</Label>
                    <Input
                      id="name"
                      value={function_.name}
                      onChange={(e) => setFunction({ ...function_, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="route">Route Path</Label>
                    <Input
                      id="route"
                      value={function_.route}
                      onChange={(e) => setFunction({ ...function_, route: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={function_.language}
                      onValueChange={(value) =>
                        setFunction({ ...function_, language: value as "javascript" | "python" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="virtualization">Virtualization Type</Label>
                    <Select
                      value={function_.virtualizationType}
                      onValueChange={(value) => setFunction({ ...function_, virtualizationType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select virtualization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="docker">Docker</SelectItem>
                        <SelectItem value="microvm">MicroVM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeout">Timeout (seconds)</Label>
                    <Input
                      id="timeout"
                      type="number"
                      min="1"
                      max="300"
                      value={function_.timeout / 1000}
                      onChange={(e) => setFunction({ 
                        ...function_, 
                        timeout: Number.parseInt(e.target.value) * 1000 
                      })}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Function Code</CardTitle>
                  <CardDescription>
                    Edit your function code in {function_.language === "javascript" ? "JavaScript" : "Python"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <CodeEditor
                    key={function_.id + function_.language} // Ensure re-render on language change
                    language={function_.language}
                    defaultValue={function_.code}
                    onChange={handleCodeChange}
                  />
                </CardContent>
                <CardFooter className="mt-auto">
                  <Button 
                    type="submit" 
                    className="ml-auto"
                    disabled={isSubmitting || !hasChanges()}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="executions">
          <Card>
            <CardHeader>
              <CardTitle>Function Executions</CardTitle>
              <CardDescription>View all executions of this function</CardDescription>
            </CardHeader>
            <CardContent>
              <FunctionExecutions functionId={id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </>)}
    </div>
  )
}

