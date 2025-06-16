import React from 'react'
import { Paintbrush } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { useStore } from '@/lib/states'

export const RightPanel: React.FC = () => {
  const [baseBrushSize, setBaseBrushSize] = useStore((state) => [
    state.editorState.baseBrushSize,
    state.setBaseBrushSize,
  ])

  return (
    <div className="h-full p-4 space-y-6">
      {/* 画笔设置 */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-gray-300">
          <Paintbrush className="w-4 h-4" />
          <h3 className="font-medium">画笔设置</h3>
        </div>
        
        <div className="space-y-4 pl-6">
          {/* 画笔大小 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-400">大小</label>
              <span className="text-sm text-gray-300 font-mono">
                {baseBrushSize}px
              </span>
            </div>
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
      </div>
    </div>
  )
} 