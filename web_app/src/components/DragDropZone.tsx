import { useState, useCallback, useRef, useEffect } from "react"
import { Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"

interface DragDropZoneProps {
  onFileSelect: (file: File) => void
  className?: string
  disabled?: boolean
  supportedTypes?: string[]
  maxSize?: number // in bytes
  children?: React.ReactNode
}

const SUPPORTED_FILE_TYPES = [
  "image/jpeg",
  "image/png", 
  "image/webp",
  "image/bmp",
  "image/tiff",
]

export const DragDropZone: React.FC<DragDropZoneProps> = ({
  onFileSelect,
  className,
  disabled = false,
  supportedTypes = SUPPORTED_FILE_TYPES,
  maxSize = 50 * 1024 * 1024, // 50MB default
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [_dragCounter, setDragCounter] = useState(0)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  


  const validateFile = (file: File): string | null => {
    if (!supportedTypes.includes(file.type)) {
      return `不支持的文件类型。支持的格式: ${supportedTypes.map(type => type.split('/')[1]).join(', ')}`
    }
    
    if (file.size > maxSize) {
      return `文件太大。最大支持 ${Math.round(maxSize / 1024 / 1024)}MB`
    }
    
    return null
  }

  const handleFileSelect = (file: File) => {
    const error = validateFile(file)
    if (error) {
      toast({
        variant: "destructive",
        title: "文件错误",
        description: error,
      })
      return
    }
    
    onFileSelect(file)
    toast({
      title: "文件上传成功",
      description: `已选择文件: ${file.name}`,
    })
  }

  const handleDrag = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragIn = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (disabled) return
    
    setDragCounter(prev => prev + 1)
    
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }, [disabled])

  const handleDragOut = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (disabled) return
    
    setDragCounter(prev => {
      const newCounter = prev - 1
      if (newCounter === 0) {
        setIsDragging(false)
      }
      return newCounter
    })
  }, [disabled])

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (disabled) return
    
    setIsDragging(false)
    setDragCounter(0)
    
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      if (e.dataTransfer.files.length > 1) {
        toast({
          variant: "destructive", 
          title: "多文件错误",
          description: "请一次只拖拽一个文件",
        })
        return
      }
      
      const file = e.dataTransfer.files[0]
      handleFileSelect(file)
      e.dataTransfer.clearData()
    }
  }, [disabled, onFileSelect])

  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (disabled) return
    
    const items = e.clipboardData?.items
    if (!items) return
    
    const imageItems = Array.from(items).filter(item => 
      item.type.indexOf('image') !== -1
    )
    
    if (imageItems.length === 0) return
    
    e.preventDefault()
    e.stopPropagation()
    
    const item = imageItems[0]
    const blob = item.getAsFile()
    
    if (blob) {
      handleFileSelect(blob)
    }
  }, [disabled, onFileSelect])

  useEffect(() => {
    const element = dropZoneRef.current
    if (!element) return

    element.addEventListener('dragenter', handleDragIn)
    element.addEventListener('dragleave', handleDragOut)
    element.addEventListener('dragover', handleDrag)
    element.addEventListener('drop', handleDrop)
    
    // Global paste handler
    window.addEventListener('paste', handlePaste)

    return () => {
      element.removeEventListener('dragenter', handleDragIn)
      element.removeEventListener('dragleave', handleDragOut)
      element.removeEventListener('dragover', handleDrag)
      element.removeEventListener('drop', handleDrop)
      window.removeEventListener('paste', handlePaste)
    }
  }, [handleDragIn, handleDragOut, handleDrag, handleDrop, handlePaste])

  return (
    <div
      ref={dropZoneRef}
      className={cn(
        "relative transition-all duration-200 ease-in-out",
        className
      )}
    >
      {children}
      
      {/* Drag overlay */}
      {isDragging && !disabled && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm">
          <div className="flex items-center justify-center h-full">
            <div className="bg-background/95 backdrop-blur-sm border-2 border-dashed border-primary rounded-lg p-8 mx-4 max-w-md text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">拖拽图片到此处</h3>
              <p className="text-sm text-muted-foreground mb-2">
                支持 JPG, PNG, WebP, BMP, TIFF 格式
              </p>
              <p className="text-xs text-muted-foreground">
                最大 {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 