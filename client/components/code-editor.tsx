"use client"

import { useEffect, useState } from "react"
import Editor from "@monaco-editor/react"

interface CodeEditorProps {
  language: "javascript" | "python" | "json"
  defaultValue?: string
  onChange?: (value: string | undefined) => void
  height?: string
}

export function CodeEditor({ language, defaultValue = "", onChange, height = "500px" }: CodeEditorProps) {
  const [mounted, setMounted] = useState(false)
  const [value, setValue] = useState(defaultValue)
 
  useEffect(() => {
    if (value !== undefined) {
      setValue(value)
    }
  }, [value])

  // Update when language changes (to handle template switching)
  useEffect(() => {
    setMounted(true)
  }, [])
  

  if (!mounted) {
    return (
      <div className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" style={{ height }}>
        <pre className="text-muted-foreground">{defaultValue}</pre>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Editor
        height={height}
        key={language}
        defaultLanguage={language}
        value={value}
        language={language}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          tabSize: 2,
          automaticLayout: true,
        }}
        onChange={(value) => {
          setValue(value || "")
          if (onChange) {
            onChange(value)
          }
        }}
      />
    </div>
  )
}

