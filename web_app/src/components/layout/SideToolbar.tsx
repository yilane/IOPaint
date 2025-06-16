import React, { useState } from 'react'
import { 
  Brush, 
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useStore } from '@/lib/states'
import { useCanvasContext } from '@/context/CanvasContext'

type Tool = 'brush'

interface ToolButtonProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick: () => void
  disabled?: boolean
}

const ToolButton: React.FC<ToolButtonProps> = ({ 
  icon, 
  label, 
  active = false, 
  onClick, 
  disabled = false 
}) => (
  <Button
    variant="ghost"
    size="icon"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "w-12 h-12 rounded-lg transition-all duration-200 relative group",
      active 
        ? "bg-blue-600 text-white shadow-lg" 
        : "text-gray-400 hover:text-white hover:bg-gray-700",
      disabled && "opacity-50 cursor-not-allowed"
    )}
    title={label}
  >
    {icon}
    
    {/* 工具提示 */}
    <div className="absolute left-16 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
      {label}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800 rotate-45"></div>
    </div>
  </Button>
)

export const SideToolbar: React.FC = () => {
  const [activeTool, setActiveTool] = useState<Tool>('brush')
  const file = useStore((state) => state.file)
  const { zoomIn, zoomOut, resetZoom } = useCanvasContext()
  
  const hasFile = !!file

  return (
    <div className="flex flex-col h-full py-4">
      {/* 画笔工具 */}
      <div className="space-y-2 px-2">
        <ToolButton
          icon={<Brush className="w-5 h-5" />}
          label="画笔工具 (B)"
          active={activeTool === 'brush'}
          onClick={() => setActiveTool('brush')}
          disabled={!hasFile}
        />
      </div>

      {/* 分隔线 */}
      <div className="my-4 mx-3 border-t border-gray-700"></div>

      {/* 缩放工具 */}
      <div className="space-y-2 px-2">
        <ToolButton
          icon={<ZoomIn className="w-5 h-5" />}
          label="放大 (+)"
          onClick={zoomIn}
          disabled={!hasFile}
        />
        
        <ToolButton
          icon={<ZoomOut className="w-5 h-5" />}
          label="缩小 (-)"
          onClick={zoomOut}
          disabled={!hasFile}
        />
      </div>

      {/* 底部工具 */}
      <div className="mt-auto space-y-2 px-2">
        <ToolButton
          icon={<RotateCcw className="w-5 h-5" />}
          label="重置视图"
          onClick={resetZoom}
          disabled={!hasFile}
        />
      </div>

      {/* 工具状态指示器 */}
      {hasFile && (
        <div className="px-2 mt-4">
          <div className="text-xs text-gray-500 text-center">
            画笔工具
          </div>
        </div>
      )}
    </div>
  )
} 