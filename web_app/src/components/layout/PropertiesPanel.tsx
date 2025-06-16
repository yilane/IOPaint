import React, { useState } from 'react'
import { 
  Layers, 
  Settings, 
  Brush, 
  ChevronDown,
  ChevronRight,
  Eye
} from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStore } from '@/lib/states'

interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  title, 
  children, 
  defaultOpen = true 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-800 hover:bg-gray-750 transition-colors"
      >
        <span className="text-sm font-medium text-gray-200">{title}</span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="p-3 bg-gray-850">
          {children}
        </div>
      )}
    </div>
  )
}

export const PropertiesPanel: React.FC = () => {
  const [
    file,
    baseBrushSize,
    setBaseBrushSize,
    settings
  ] = useStore((state) => [
    state.file,
    state.editorState.baseBrushSize,
    state.setBaseBrushSize,
    state.settings
  ])

  const hasFile = !!file

  return (
    <div className="h-full flex flex-col bg-gray-800">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-gray-100">属性面板</h2>
      </div>

      {/* 标签页 */}
      <Tabs defaultValue="brush" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4 bg-gray-750">
          <TabsTrigger value="brush" className="flex items-center space-x-2">
            <Brush className="w-4 h-4" />
            <span>画笔</span>
          </TabsTrigger>
          <TabsTrigger value="layers" className="flex items-center space-x-2">
            <Layers className="w-4 h-4" />
            <span>图层</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>设置</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <TabsContent value="brush" className="space-y-4 mt-0">
            <CollapsibleSection title="画笔设置">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">画笔大小</label>
                  <div className="flex items-center space-x-3">
                    <Slider
                      value={[baseBrushSize]}
                      onValueChange={(value) => setBaseBrushSize(value[0])}
                      max={100}
                      min={1}
                      step={1}
                      className="flex-1"
                      disabled={!hasFile}
                    />
                    <span className="text-sm text-gray-400 w-8 text-right">
                      {baseBrushSize}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-300 mb-2 block">不透明度</label>
                  <div className="flex items-center space-x-3">
                    <Slider
                      value={[100]}
                      max={100}
                      min={0}
                      step={1}
                      className="flex-1"
                      disabled={!hasFile}
                    />
                    <span className="text-sm text-gray-400 w-8 text-right">100</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-300 mb-2 block">硬度</label>
                  <div className="flex items-center space-x-3">
                    <Slider
                      value={[80]}
                      max={100}
                      min={0}
                      step={1}
                      className="flex-1"
                      disabled={!hasFile}
                    />
                    <span className="text-sm text-gray-400 w-8 text-right">80</span>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="颜色设置">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">前景色</span>
                  <div className="w-8 h-8 bg-white border border-gray-600 rounded cursor-pointer"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">背景色</span>
                  <div className="w-8 h-8 bg-black border border-gray-600 rounded cursor-pointer"></div>
                </div>
              </div>
            </CollapsibleSection>
          </TabsContent>

          <TabsContent value="layers" className="space-y-4 mt-0">
            <CollapsibleSection title="图层">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-200">原始图像</span>
                  </div>
                  <span className="text-xs text-gray-500">100%</span>
                </div>
                
                {hasFile && (
                  <div className="flex items-center justify-between p-2 bg-blue-900/30 border border-blue-700 rounded">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-200">蒙版图层</span>
                    </div>
                    <span className="text-xs text-gray-500">100%</span>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 mt-0">
            <CollapsibleSection title="模型设置">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">当前模型</span>
                  <span className="text-sm text-blue-400">{settings.model.name}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">设备</span>
                  <span className="text-sm text-gray-400">CPU</span>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="导出设置">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">下载蒙版</span>
                  <Switch checked={settings.enableDownloadMask} />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">质量</span>
                  <span className="text-sm text-gray-400">100%</span>
                </div>
              </div>
            </CollapsibleSection>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
} 