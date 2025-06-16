import React from 'react'
import { Button } from '@/components/ui/button'
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Undo,
  Redo,
  Upload,
  Eye,
  Download,
  Paintbrush
} from 'lucide-react'
import { useCanvasContext } from '@/context/CanvasContext'
import { useStore } from '@/lib/states'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { downloadImage } from '@/lib/utils'

export const BottomToolbar: React.FC = () => {
  const { scale, zoomIn, zoomOut, resetZoom } = useCanvasContext()
  const [
    imageWidth,
    imageHeight,
    undo,
    redo,
    undoDisabled,
    redoDisabled,
    clearMask,
    setFile,
    baseBrushSize,
    setBaseBrushSize,
    file,
    renders
  ] = useStore((state) => [
    state.imageWidth,
    state.imageHeight,
    state.undo,
    state.redo,
    state.undoDisabled(),
    state.redoDisabled(),
    state.clearMask,
    state.setFile,
    state.editorState.baseBrushSize,
    state.setBaseBrushSize,
    state.file,
    state.editorState.renders
  ])

  const handleFileUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) setFile(file)
    }
    input.click()
  }

  const handleDownload = () => {
    if (!file) return
    
    // 获取当前要下载的图片：如果有修复后的图片就下载修复后的，否则下载原图
    const targetImage = renders.length > 0 ? renders[renders.length - 1] : null
    
    if (targetImage) {
      // 如果有修复后的图片，下载修复后的
      const canvas = document.createElement('canvas')
      canvas.width = imageWidth
      canvas.height = imageHeight
      const ctx = canvas.getContext('2d')
      
      if (ctx) {
        ctx.drawImage(targetImage, 0, 0, imageWidth, imageHeight)
        const dataUrl = canvas.toDataURL('image/png')
        const fileName = file.name.replace(/\.[^/.]+$/, '_inpainted.png')
        downloadImage(dataUrl, fileName)
      }
    } else {
      // 如果没有修复后的图片，下载原图
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          const dataUrl = canvas.toDataURL('image/png')
          downloadImage(dataUrl, file.name)
        }
      }
      
      img.src = URL.createObjectURL(file)
    }
  }

  return (
    <div className="h-16 bg-gray-800 border-t border-gray-700 flex items-center justify-between px-6">
      {/* 左侧：缩放控制 */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomOut}
            className="text-gray-300 hover:text-white hover:bg-gray-700 relative group"
            title="缩小"
          >
            <ZoomOut className="w-4 h-4" />
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              缩小
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45 -mt-1"></div>
            </div>
          </Button>
          
          <div className="w-20 text-center">
            <span className="text-sm text-gray-300 font-mono">
              {Math.round(scale * 100)}%
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomIn}
            className="text-gray-300 hover:text-white hover:bg-gray-700 relative group"
            title="放大"
          >
            <ZoomIn className="w-4 h-4" />
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              放大
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45 -mt-1"></div>
            </div>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={resetZoom}
            className="text-gray-300 hover:text-white hover:bg-gray-700 relative group"
            title="重置缩放"
          >
            <RotateCcw className="w-4 h-4" />
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              重置缩放
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45 -mt-1"></div>
            </div>
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 bg-gray-600" />

        {/* 图片信息 */}
        <div className="text-sm text-gray-400">
          {imageWidth > 0 && imageHeight > 0 && (
            <span>{imageWidth} × {imageHeight}</span>
          )}
        </div>
      </div>

      {/* 中央：主要操作 */}
      <div className="flex items-center space-x-3">
        {/* 画笔大小滑块 */}
        <div className="flex items-center space-x-2 group">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white hover:bg-gray-700 relative"
            title={`画笔大小: ${baseBrushSize}px`}
          >
            <Paintbrush className="w-4 h-4" />
            {/* 工具提示 */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              画笔大小: {baseBrushSize}px
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45 -mt-1"></div>
            </div>
          </Button>
          <div className="w-32">
            <Slider
              value={[baseBrushSize]}
              onValueChange={(value) => setBaseBrushSize(value[0])}
              min={3}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        <Separator orientation="vertical" className="h-6 bg-gray-600" />

        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={undoDisabled}
          className="text-gray-300 hover:text-white hover:bg-gray-700 disabled:opacity-50 relative group"
          title="撤销"
        >
          <Undo className="w-4 h-4" />
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            撤销
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45 -mt-1"></div>
          </div>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={redoDisabled}
          className="text-gray-300 hover:text-white hover:bg-gray-700 disabled:opacity-50 relative group"
          title="重做"
        >
          <Redo className="w-4 h-4" />
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            重做
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45 -mt-1"></div>
          </div>
        </Button>

        <Separator orientation="vertical" className="h-6 bg-gray-600" />

        <Button
          variant="ghost"
          size="sm"
          onClick={clearMask}
          className="text-gray-300 hover:text-white hover:bg-gray-700 relative group"
          title="清除蒙版"
        >
          <RotateCcw className="w-4 h-4" />
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            清除蒙版
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45 -mt-1"></div>
          </div>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onMouseDown={() => {
            // 显示原图逻辑将在Canvas组件中实现
            const canvas = document.querySelector('canvas') as HTMLCanvasElement
            if (canvas) {
              canvas.dispatchEvent(new CustomEvent('showOriginal', { detail: true }))
            }
          }}
          onMouseUp={() => {
            // 显示修复后图片
            const canvas = document.querySelector('canvas') as HTMLCanvasElement
            if (canvas) {
              canvas.dispatchEvent(new CustomEvent('showOriginal', { detail: false }))
            }
          }}
          onMouseLeave={() => {
            // 鼠标离开也显示修复后图片
            const canvas = document.querySelector('canvas') as HTMLCanvasElement
            if (canvas) {
              canvas.dispatchEvent(new CustomEvent('showOriginal', { detail: false }))
            }
          }}
          className="text-gray-300 hover:text-white hover:bg-gray-700 relative group"
          title="按住查看原图"
        >
          <Eye className="w-4 h-4" />
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            按住查看原图
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45 -mt-1"></div>
          </div>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          disabled={!file}
          className="text-gray-300 hover:text-white hover:bg-gray-700 disabled:opacity-50 relative group"
          title="保存图片"
        >
          <Download className="w-4 h-4" />
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            保存图片
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45 -mt-1"></div>
          </div>
        </Button>
      </div>

      {/* 右侧：新图片 */}
      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handleFileUpload}
          className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 relative group"
          title="上传新图片"
        >
          <Upload className="w-4 h-4" />
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            上传新图片
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45 -mt-1"></div>
          </div>
        </Button>
      </div>
    </div>
  )
} 