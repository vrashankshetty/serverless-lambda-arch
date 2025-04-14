"use client"

import { useState } from "react"
import { Trash2, Box, Code, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import functionApi from "@/api"
import { toast } from "@/hooks/use-toast"

export default function AdminCleanupPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState<string | null>(null)

  // Handle cleanup action
  const handleCleanup = (action: string) => {
    try{
        if(action=='containers'){
            setIsLoading("containers")
            functionApi.cleanupContainers().then((res) => {
                toast({
                    title: "Success",
                    description: res.message,
                    variant: "default",
                })
                setIsLoading(null)
                setDialogOpen(null)
            }).catch((error) => {
                console.error(error)
                toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive",
                })
                setIsLoading(null)
            })
        }
        else if(action=='functions'){
            setIsLoading("functions")
            functionApi.deleteAll().then((res) => {
                toast({
                    title: "Success",
                    description: 'Deleted all functions',
                    variant: "default",
                })
                setIsLoading(null)
                setDialogOpen(null)
            }).catch((error) => {
                console.error(error)
                toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive",
                })
                setIsLoading(null)
            })
        }else if(action=='executions'){
            setIsLoading("executions")
            functionApi.deleteAllExecutions().then((res) => {
                toast({
                    title: "Success",
                    description: 'Deleted all executions',
                    variant: "default",
                })
                setIsLoading(null)
                setDialogOpen(null)
            }).catch((error) => {
                console.error(error)
                toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive",
                })
                setIsLoading(null)
            })
        }else{
            return;
        }
    }catch(e){
        console.error(e)
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-md">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Admin Controls</CardTitle>
          <CardDescription>Manage system resources</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button size="lg" className="h-16 text-lg justify-start" onClick={() => setDialogOpen("containers")}>
            <Box className="mr-4 h-5 w-5" />
            Clean Containers
          </Button>

          <Button size="lg" className="h-16 text-lg justify-start" onClick={() => setDialogOpen("functions")}>
            <Code className="mr-4 h-5 w-5" />
            Delete Functions
          </Button>

          <Button size="lg" className="h-16 text-lg justify-start" onClick={() => setDialogOpen("executions")}>
            <Activity className="mr-4 h-5 w-5" />
            Delete Executions
          </Button>
        </CardContent>
      </Card>

      {/* Confirmation Dialog for Containers */}
      <Dialog open={dialogOpen === "containers"} onOpenChange={(open) => !open && setDialogOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clean Containers</DialogTitle>
            <DialogDescription>
              Are you sure you want to clean all containers? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleCleanup("containers")}
              disabled={isLoading === "containers"}
            >
              {isLoading === "containers" ? (
                <>
                  <span className="mr-2">Cleaning...</span>
                  <span className="animate-spin">⟳</span>
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clean Containers
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Functions */}
      <Dialog open={dialogOpen === "functions"} onOpenChange={(open) => !open && setDialogOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Functions</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete all functions? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleCleanup("functions")}
              disabled={isLoading === "functions"}
            >
              {isLoading === "functions" ? (
                <>
                  <span className="mr-2">Deleting...</span>
                  <span className="animate-spin">⟳</span>
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Functions
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Executions */}
      <Dialog open={dialogOpen === "executions"} onOpenChange={(open) => !open && setDialogOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Executions</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete all executions? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleCleanup("executions")}
              disabled={isLoading === "executions"}
            >
              {isLoading === "executions" ? (
                <>
                  <span className="mr-2">Deleting...</span>
                  <span className="animate-spin">⟳</span>
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Executions
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
