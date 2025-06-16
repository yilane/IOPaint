import React from 'react'
import { TopNavigation } from './TopNavigation'
import { Canvas } from '../canvas/Canvas'
import { BottomToolbar } from './BottomToolbar'
import { DragDropZone } from '../DragDropZone'
import { WelcomeScreen } from '../WelcomeScreen'
import { LeftImagePanel } from './LeftImagePanel'
import { useStore } from '@/lib/states'
import { CanvasProvider } from '@/context/CanvasContext'

interface MainLayoutProps {
  isLoadingCache?: boolean
}

export const MainLayout: React.FC<MainLayoutProps> = ({ isLoadingCache = false }) => {
  const [file, setFile] = useStore((state) => [state.file, state.setFile])

  return (
    <CanvasProvider>
      <DragDropZone 
        onFileSelect={setFile}
        className="h-screen bg-gray-900 flex flex-col overflow-hidden"
      >
        {/* 顶部导航栏 */}
        <TopNavigation />
        
        {/* 主要内容区域 */}
        <div className="flex-1 flex relative">
          {/* 左侧图片选择栏 - 只在有文件时显示 */}
          <div className={`transition-all duration-300 ease-in-out ${file ? 'w-20' : 'w-0 overflow-hidden'}`}>
            {file && <LeftImagePanel />}
          </div>
          
          {/* 中央画布区域 */}
          <div className="flex-1 relative">
            {file ? (
              <Canvas />
            ) : isLoadingCache ? (
              <div className="flex items-center justify-center h-full bg-gray-850">
                <div className="text-center space-y-4">
                  <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-400 text-lg">正在加载缓存图片...</p>
                </div>
              </div>
            ) : (
              <WelcomeScreen onFileSelect={setFile} />
            )}
          </div>
          
          {/* 右侧面板已移除，画笔控制已迁移到底部工具栏 */}
        </div>

        {/* 底部工具栏 - 只在有文件时显示 */}
        {file && <BottomToolbar />}
      </DragDropZone>
    </CanvasProvider>
  )
} 