import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react"
import { useStore } from "@/lib/states"
import { cn } from "@/lib/utils"

interface ProgressState {
  value: number
  message: string
  status: 'idle' | 'processing' | 'complete' | 'error'
  estimatedTime?: number
}

export const EnhancedProgress = () => {
  const [progressState, setProgressState] = useState<ProgressState>({
    value: 0,
    message: '',
    status: 'idle'
  })

  const [isInpainting, isPluginRunning, isAdjustingMask] = useStore((state) => [
    state.isInpainting,
    state.isPluginRunning,
    state.isAdjustingMask,
  ])

  const isProcessing = isInpainting || isPluginRunning || isAdjustingMask

  // 模拟进度更新 - 在实际实现中，这将通过WebSocket接收
  useEffect(() => {
    if (!isProcessing) {
      if (progressState.status === 'processing') {
        setProgressState(prev => ({
          ...prev,
          value: 100,
          status: 'complete',
          message: '处理完成'
        }))
        
        // 3秒后重置状态
        setTimeout(() => {
          setProgressState({
            value: 0,
            message: '',
            status: 'idle'
          })
        }, 3000)
      }
      return
    }

    setProgressState({
      value: 0,
      message: '开始处理...',
      status: 'processing'
    })

    // 模拟进度增长
    const interval = setInterval(() => {
      setProgressState(prev => {
        if (prev.value >= 90) {
          return prev // 停在90%等待实际完成
        }
        
        const increment = Math.random() * 10
        const newValue = Math.min(prev.value + increment, 90)
        
        let message = '正在处理...'
        if (newValue > 20) message = '分析图像...'
        if (newValue > 40) message = '生成修复内容...'
        if (newValue > 70) message = '优化结果...'
        
        return {
          ...prev,
          value: newValue,
          message
        }
      })
    }, 500)

    return () => clearInterval(interval)
  }, [isProcessing])

  if (progressState.status === 'idle') {
    return null
  }

  const getStatusIcon = () => {
    switch (progressState.status) {
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }



  return (
    <div 
      className={cn(
        "fixed bottom-4 right-4 w-72 z-50 transition-all duration-300 ease-in-out",
        "bg-gray-800/90 border border-gray-600 rounded-lg shadow-lg",
        progressState.status === 'processing' && "shadow-blue-500/20"
      )}
    >
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm font-medium text-white">
              {progressState.status === 'processing' && '处理中'}
              {progressState.status === 'complete' && '完成'}
              {progressState.status === 'error' && '错误'}
            </span>
          </div>
          <span className="text-xs text-gray-300">
            {Math.round(progressState.value)}%
          </span>
        </div>
        
        <Progress 
          value={progressState.value} 
          className="mb-2 h-2"
        />
        
        <p className="text-xs text-gray-400">
          {progressState.message}
        </p>
        
        {progressState.estimatedTime && (
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span>预计剩余: {progressState.estimatedTime}秒</span>
          </div>
        )}
      </div>
    </div>
  )
} 