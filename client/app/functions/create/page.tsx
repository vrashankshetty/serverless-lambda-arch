"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CodeEditor } from "@/components/code-editor"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import functionApi from "@/api"
import { useToast } from "@/hooks/use-toast"

export default function CreateFunctionPage() {
  const router = useRouter()
  const { toast } = useToast();
  
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    route: "",
    language: "python" as "javascript" | "python",
    virtualizationType: "docker",
    timeout: 30,
    code: getDefaultCode("python")
  })

  // Generate default code template based on language
  function getDefaultCode(language: "javascript" | "python") {
    return language === "javascript"
      ? `// Request handler function
function handler(event) {
  try {
    // Your function logic here
    const result = { message: \`Hello from serverless \${event.name || ""} \` };
    return { 
      statusCode: 200, 
      body: JSON.stringify(result) 
    };
  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
}
  
module.exports = { 
handler 
}
`

      : `# Request handler function
def handler(event):
    try:
        # Your function logic here
        result = {"message": "Hello from serverless " + event.get("name", "")}
        return {
            "statusCode": 200,
            "body": result
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": {"error": str(e)}
        }
`
  }

  // Handle form field changes
  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle language change - update code template when language changes
  const handleLanguageChange = (value: "javascript" | "python") => {
    setFormData(prev => ({
      ...prev,
      language: value,
      code: getDefaultCode(value)
    }))
  }

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)
      
      // Format route to ensure it starts with "/"
      const formattedRoute = formData.route.startsWith("/") 
        ? formData.route 
        : `/${formData.route}`
      
      // Prepare data for API
      const functionData = {
        name: formData.name,
        route: formattedRoute,
        language: formData.language,
        virtualizationType: formData.virtualizationType,
        timeout: Number(formData.timeout) * 1000, // Convert to milliseconds
        code: formData.code
      }
      
      // Submit to API
      await functionApi.create(functionData)
      
      toast({
        title: "Function created",
        description: `Function ${formData.name} has been created successfully.`,
      })
      
      // Navigate back to functions list
      router.push("/functions")
    } catch (error: any) {
      console.log("Error creating function:", error)
      toast({
        title: "Error creating function",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/functions">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Create New Function</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Function Details</CardTitle>
              <CardDescription>Basic information about your serverless function</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Function Name</Label>
                <Input 
                  id="name" 
                  name="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g., processPayment" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="route">Route Path</Label>
                <Input 
                  id="route" 
                  name="route"
                  value={formData.route}
                  onChange={(e) => handleChange("route", e.target.value)}
                  placeholder="e.g., /api/payment" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  name="language"
                  value={formData.language}
                  onValueChange={(value) => handleLanguageChange(value as "javascript" | "python")}
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
                  name="virtualizationType"
                  value={formData.virtualizationType}
                  onValueChange={(value) => handleChange("virtualizationType", value)}
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
                  name="timeout"
                  type="number" 
                  min="1" 
                  max="300" 
                  value={formData.timeout}
                  onChange={(e) => handleChange("timeout", parseInt(e.target.value))}
                  required 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Function Code</CardTitle>
              <CardDescription>
                Write your function code in {formData.language === "javascript" ? "JavaScript" : "Python"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <CodeEditor
                key={formData.language}
                language={formData.language}
                defaultValue={getDefaultCode(formData.language)}
                onChange={(value) => handleChange("code", value || "")}
              />
            </CardContent>
            <CardFooter className="mt-auto">
              <Button type="submit" className="ml-auto" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Function"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}

