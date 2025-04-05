"use client";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FunctionsList } from "@/components/functions-list"
import Link from "next/link"
import { Plus } from "lucide-react"
import { useQueryFunctions } from "@/hooks/use-query"

export default function FunctionsPage() {
  const { data,isLoading } = useQueryFunctions();
  console.log("data",data)
  return (
    <div className="w-full flex flex-col space-y-4 p-4 md:p-8 pt-6">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <p>Loading...</p>
        </div>
      ) : data === undefined ? (
        <div className="flex items-center justify-center h-full">
          <p>Functions not found</p>
        </div>
      ) : null}
      {data && (
      <>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Functions</h2>
        <Button asChild>
          <Link href="/functions/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Function
          </Link>
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Input placeholder="Search functions..." className="max-w-sm" />
      </div>
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Functions</TabsTrigger>
          <TabsTrigger value="python">Python</TabsTrigger>
          <TabsTrigger value="javascript">JavaScript</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <FunctionsList data={data??[]} type="all"/>
        </TabsContent>
        <TabsContent value="python" className="space-y-4">
          <FunctionsList data={data??[]} type="python" />
        </TabsContent>
        <TabsContent value="javascript" className="space-y-4">
          <FunctionsList data={data??[]} type="javascript" />
        </TabsContent>
      </Tabs>
      </>)}
    </div>
  )
}

