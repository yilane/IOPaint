import React from 'react'
import { Activity, Wifi, WifiOff, Clock, Cpu } from 'lucide-react'
import { useStore } from '@/lib/states'
import { useProgressSocket } from '@/hooks/useProgressSocket'

export const StatusBar: React.FC = () => {
  const [
    file,
    isInpainting,
    isPluginRunning,
    isAdjustingMask,
    imageWidth,
    imageHeight
  ] = useStore((state) => [
    state.file,
    state.isInpainting,
    state.isPluginRunning,
    state.isAdjustingMask,
    state.imageWidth,
    state.imageHeight
  ])

  const { isConnected } = useProgressSocket()
  const isProcessing = isInpainting || isPluginRunning || isAdjustingMask

  const formatFileSize = (file: File) => {
    const bytes = file.size
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div className="h-8 bg-gray-900 border-t border-gray-700 flex items-center justify-between px-4 text-xs">
      {/* 左侧：文件信息 */}
      <div className="flex items-center space-x-6">
        {file ? (
          <>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">文件:</span>
              <span className="text-gray-200">{file.name}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">尺寸:</span>
              <span className="text-gray-200">
                {imageWidth} × {imageHeight}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">大小:</span>
              <span className="text-gray-200">{formatFileSize(file)}</span>
            </div>
          </>
        ) : (
          <span className="text-gray-500">未选择文件</span>
        )}
      </div>

      {/* 中央：处理状态 */}
      <div className="flex items-center space-x-4">
        {isProcessing && (
          <div className="flex items-center space-x-2">
            <Activity className="w-3 h-3 text-blue-400 animate-pulse" />
            <span className="text-blue-400">
              {isInpainting && '正在修复...'}
              {isPluginRunning && '插件运行中...'}
              {isAdjustingMask && '调整蒙版...'}
            </span>
          </div>
        )}
      </div>

      {/* 右侧：系统状态 */}
      <div className="flex items-center space-x-6">
        {/* 连接状态 */}
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <>
              <Wifi className="w-3 h-3 text-green-400" />
              <span className="text-green-400">已连接</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-red-400" />
              <span className="text-red-400">连接断开</span>
            </>
          )}
        </div>

        {/* 系统信息 */}
        <div className="flex items-center space-x-2">
          <Cpu className="w-3 h-3 text-gray-400" />
          <span className="text-gray-400">CPU</span>
        </div>

        {/* 时间戳 */}
        <div className="flex items-center space-x-2">
          <Clock className="w-3 h-3 text-gray-400" />
          <span className="text-gray-400">
            {new Date().toLocaleTimeString('zh-CN', { 
              hour12: false,
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>
    </div>
  )
} 