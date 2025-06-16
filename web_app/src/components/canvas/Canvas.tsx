import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from '@/lib/states'
import { useCanvasContext } from '@/context/CanvasContext'
import { useImage } from '@/hooks/useImage'
import { drawLines, mouseXY, isMidClick, isRightClick } from '@/lib/utils'
import { BRUSH_COLOR } from '@/lib/const'

export const Canvas: React.FC = () => {
  const [
    file,
    imageWidth,
    imageHeight,
    isInpainting,
    handleCanvasMouseMove,
    getBrushSize,
    runInpainting,
    getIsProcessing,
    updateEditorState,
    runMannually
  ] = useStore((state) => [
    state.file,
    state.imageWidth,
    state.imageHeight,
    state.isInpainting,
    state.handleCanvasMouseMove,
    state.getBrushSize,
    state.runInpainting,
    state.getIsProcessing,
    state.updateEditorState,
    state.runMannually
  ])

  const renders = useStore((state) => state.editorState.renders)
  const extraMasks = useStore((state) => state.editorState.extraMasks)
  const temporaryMasks = useStore((state) => state.editorState.temporaryMasks)
  const curLineGroup = useStore((state) => state.editorState.curLineGroup)

  const { scale, panOffset, setPanOffset, isPanning, setIsPanning, setScale } = useCanvasContext()
  
  // Canvas refs
  const imageCanvasRef = useRef<HTMLCanvasElement>(null)
  const maskCanvasRef = useRef<HTMLCanvasElement>(null)
  
  // Local state
  const [original, isOriginalLoaded] = useImage(file!)
  const [context, setContext] = useState<CanvasRenderingContext2D>()
  const [imageContext, setImageContext] = useState<CanvasRenderingContext2D>()
  const [{ x, y }, setCoords] = useState({ x: -1, y: -1 })
  const [showBrush, setShowBrush] = useState(false)
  const [isDraging, setIsDraging] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)
  const [autoInpaintTimer, _setAutoInpaintTimer] = useState<NodeJS.Timeout | null>(null)
  const [_countdown, setCountdown] = useState(0)
  const [countdownTimer, setCountdownTimer] = useState<NodeJS.Timeout | null>(null)
  const [dragStart, setDragStart] = useState<{ 
    x: number; 
    y: number; 
    screenX: number; 
    screenY: number; 
    initialPanX: number; 
    initialPanY: number 
  } | null>(null)
  
  const setImageSize = useStore((state) => state.setImageSize)

  const brushSize = getBrushSize()

  // Initialize canvas contexts
  useEffect(() => {
    if (imageCanvasRef.current && !imageContext) {
      const ctx = imageCanvasRef.current.getContext('2d')
      if (ctx) {
        setImageContext(ctx)
      }
    }
    if (maskCanvasRef.current && !context) {
      const ctx = maskCanvasRef.current.getContext('2d')
      if (ctx) {
        setContext(ctx)
      }
    }
  }, [imageContext, context])

  // Set image size when original is loaded
  useEffect(() => {
    if (isOriginalLoaded && original) {
      console.log(`[Canvas] Image loaded: ${original.naturalWidth} × ${original.naturalHeight}`)
      console.log(`[Canvas] Current stored size: ${imageWidth} × ${imageHeight}`)
      // 强制更新图片尺寸，确保每次加载新图片时都重新设置
      setImageSize(original.naturalWidth, original.naturalHeight)
    }
  }, [isOriginalLoaded, original, setImageSize, file])

  // Update image canvas
  useEffect(() => {
    if (!imageContext || !isOriginalLoaded || imageWidth === 0 || imageHeight === 0) {
      return
    }
    // 根据showOriginal状态决定显示原图还是修复后的图片
    const render = showOriginal ? original : (renders.length === 0 ? original : renders[renders.length - 1])
    imageContext.canvas.width = imageWidth
    imageContext.canvas.height = imageHeight
    imageContext.clearRect(0, 0, imageContext.canvas.width, imageContext.canvas.height)
    imageContext.drawImage(render, 0, 0, imageWidth, imageHeight)
  }, [renders, original, isOriginalLoaded, imageContext, imageHeight, imageWidth, showOriginal])

  // Update mask canvas
  useEffect(() => {
    if (!context || !isOriginalLoaded || imageWidth === 0 || imageHeight === 0) {
      return
    }
    context.canvas.width = imageWidth
    context.canvas.height = imageHeight
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)
    
    temporaryMasks.forEach((maskImage) => {
      context.drawImage(maskImage, 0, 0, imageWidth, imageHeight)
    })
    extraMasks.forEach((maskImage) => {
      context.drawImage(maskImage, 0, 0, imageWidth, imageHeight)
    })
    
    drawLines(context, curLineGroup, BRUSH_COLOR)
  }, [temporaryMasks, extraMasks, curLineGroup, context, isOriginalLoaded, imageWidth, imageHeight])

  // 监听查看原图事件
  useEffect(() => {
    const handleShowOriginal = (event: CustomEvent) => {
      setShowOriginal(event.detail)
    }

    const canvas = imageCanvasRef.current
    if (canvas) {
      canvas.addEventListener('showOriginal', handleShowOriginal as EventListener)
      return () => {
        canvas.removeEventListener('showOriginal', handleShowOriginal as EventListener)
      }
    }
  }, [])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (autoInpaintTimer) {
        clearTimeout(autoInpaintTimer)
      }
      if (countdownTimer) {
        clearTimeout(countdownTimer)
      }
    }
  }, [autoInpaintTimer, countdownTimer])

  // 空格键拖动功能
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && file) {
        e.preventDefault()
        setIsPanning(true)
        setShowBrush(false)
        document.body.style.cursor = 'grab'
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && file) {
        e.preventDefault()
        setIsPanning(false)
        setShowBrush(true)
        setDragStart(null)
        document.body.style.cursor = 'default'
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [file, setIsPanning])

  // 全局鼠标事件处理，防止拖动卡住
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isPanning && dragStart) {
        setDragStart(null)
        document.body.style.cursor = 'grab'
      }
      if (isDraging) {
        setIsDraging(false)
      }
    }

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isPanning && dragStart) {
        const deltaX = e.clientX - dragStart.screenX
        const deltaY = e.clientY - dragStart.screenY
        
        const newPanX = dragStart.initialPanX + deltaX / scale
        const newPanY = dragStart.initialPanY + deltaY / scale
        
        // 添加边界限制
        const maxOffset = Math.max(imageWidth, imageHeight) / 2
        const boundedPanX = Math.max(-maxOffset, Math.min(maxOffset, newPanX))
        const boundedPanY = Math.max(-maxOffset, Math.min(maxOffset, newPanY))
        
        setPanOffset({
          x: boundedPanX,
          y: boundedPanY
        })
      }
    }

    if (isPanning || isDraging) {
      document.addEventListener('mouseup', handleGlobalMouseUp)
      document.addEventListener('mousemove', handleGlobalMouseMove)
      
      return () => {
        document.removeEventListener('mouseup', handleGlobalMouseUp)
        document.removeEventListener('mousemove', handleGlobalMouseMove)
      }
    }
  }, [isPanning, isDraging, dragStart, scale, imageWidth, imageHeight, setPanOffset])

  // 鼠标滚轮缩放功能
  const onWheel = useCallback((ev: React.WheelEvent) => {
    if (!file) return
    
    ev.preventDefault()
    
    // 获取鼠标在画布上的位置
    const rect = ev.currentTarget.getBoundingClientRect()
    const mouseX = ev.clientX - rect.left - rect.width / 2
    const mouseY = ev.clientY - rect.top - rect.height / 2
    
    // 计算缩放前鼠标在图片上的相对位置
    const beforeX = (mouseX - panOffset.x * scale) / scale
    const beforeY = (mouseY - panOffset.y * scale) / scale
    
    // 执行缩放 - 使用更平滑的缩放算法
    const delta = ev.deltaY
    const zoomStep = delta > 0 ? 0.9 : 1.1 // 固定缩放步长，更平滑
    const newScale = Math.max(0.1, Math.min(5, scale * zoomStep))
    
    if (newScale !== scale) {
      console.log(`[Canvas] 滚轮缩放: ${scale.toFixed(2)} → ${newScale.toFixed(2)}`)
      setScale(newScale)
      
      // 计算缩放后的偏移量，使鼠标位置保持不变
      const afterX = beforeX * newScale
      const afterY = beforeY * newScale
      const newPanX = (mouseX - afterX) / newScale
      const newPanY = (mouseY - afterY) / newScale
      
      setPanOffset({ x: newPanX, y: newPanY })
    }
  }, [file, scale, panOffset, setScale, setPanOffset])

  const onMouseMove = useCallback((ev: React.MouseEvent) => {
    const mousePos = mouseXY(ev)
    setCoords(mousePos)
    
    if (isPanning && dragStart) {
      // 拖动模式 - 改进计算方式以避免反弹
      const screenX = ev.clientX
      const screenY = ev.clientY
      
      // 使用更稳定的计算方式
      const deltaX = screenX - dragStart.screenX
      const deltaY = screenY - dragStart.screenY
      
      // 计算新的偏移量
      const newPanX = dragStart.initialPanX + deltaX / scale
      const newPanY = dragStart.initialPanY + deltaY / scale
      
      // 添加边界限制，防止图片拖动过远
      const maxOffset = Math.max(imageWidth, imageHeight) / 2
      const boundedPanX = Math.max(-maxOffset, Math.min(maxOffset, newPanX))
      const boundedPanY = Math.max(-maxOffset, Math.min(maxOffset, newPanY))
      
      setPanOffset({
        x: boundedPanX,
        y: boundedPanY
      })
      
      document.body.style.cursor = 'grabbing'
    } else if (isDraging && !isPanning && !getIsProcessing()) {
      // 绘制模式 - 修复中时禁止绘制，使用原始的handleCanvasMouseMove保持拖动效果
      handleCanvasMouseMove(mousePos)
    }
  }, [isPanning, dragStart, scale, setPanOffset, isDraging, getIsProcessing, handleCanvasMouseMove])

  const onMouseDown = useCallback((ev: React.MouseEvent) => {
    if (isMidClick(ev) || isRightClick(ev) || isInpainting) {
      return
    }
    
    // 修复中时禁止新的绘制操作
    if (getIsProcessing()) {
      return
    }
    
    const mousePos = mouseXY(ev)
    
    if (isPanning) {
      // 拖动模式 - 记录屏幕坐标和初始偏移量
      console.log(`[Canvas] 开始拖动，初始偏移: (${panOffset.x.toFixed(2)}, ${panOffset.y.toFixed(2)})`)
      setDragStart({
        x: mousePos.x,
        y: mousePos.y,
        screenX: ev.clientX,
        screenY: ev.clientY,
        initialPanX: panOffset.x,
        initialPanY: panOffset.y
      })
      document.body.style.cursor = 'grabbing'
      return
    }
    
    // 如果用户开始新的绘制，取消之前的倒计时
    if (countdownTimer) {
      clearTimeout(countdownTimer)
      setCountdownTimer(null)
      setCountdown(0)
    }
    
    setIsDraging(true)
    
    // 创建一个临时的handleCanvasMouseDown函数，传入缩放调整后的大小
    const handleScaledMouseDown = (point: typeof mousePos) => {
      const scaledBrushSize = brushSize / scale
      let lineGroup: typeof curLineGroup = []
      
      // 如果是手动模式，保留当前线条组
      if (runMannually()) {
        lineGroup = [...curLineGroup]
      }
      
      lineGroup.push({ size: scaledBrushSize, pts: [point] })
      updateEditorState({ curLineGroup: lineGroup })
    }
    
    handleScaledMouseDown(mousePos)
  }, [isInpainting, getIsProcessing, isPanning, panOffset, countdownTimer, setCountdownTimer, setCountdown, brushSize, scale, curLineGroup, runMannually, updateEditorState])

  const onMouseUp = useCallback(() => {
    if (isPanning) {
      // 拖动模式结束
      setDragStart(null)
      document.body.style.cursor = isPanning ? 'grab' : 'default'
      return
    }
    
    if (isDraging) {
      setIsDraging(false)
      
      // 清除之前的定时器
      if (autoInpaintTimer) {
        clearTimeout(autoInpaintTimer)
      }
      if (countdownTimer) {
        clearTimeout(countdownTimer)
      }
      
      // 立即开始修复，不再倒计时
      runInpainting()
    }
  }, [isPanning, isDraging, autoInpaintTimer, countdownTimer, runInpainting])

  const onMouseEnter = () => {
    setShowBrush(true)
  }

  const onMouseLeave = () => {
    setShowBrush(false)
    setIsDraging(false)
  }

  const getBrushStyle = useCallback((x: number, y: number) => {
    return {
      width: `${brushSize}px`,
      height: `${brushSize}px`,
      left: `${x - brushSize / 2}px`,
      top: `${y - brushSize / 2}px`,
      position: 'absolute' as const,
      borderRadius: '50%',
      backgroundColor: '#ffcc00',
      pointerEvents: 'none' as const,
      zIndex: 10,
      transform: `scale(${1 / scale})`,
      transformOrigin: 'center'
    }
  }, [brushSize, scale])

  const renderBrush = () => {
    if (!showBrush || !file) {
      return null
    }
    return <div style={getBrushStyle(x, y)} />
  }

  if (!file) {
    return (
      <div className="w-full h-full bg-gray-850 relative overflow-hidden flex items-center justify-center">
        <div className="text-gray-500">请选择图片开始AI智能修复</div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-gray-850 relative overflow-hidden">
      {/* 画布网格背景 */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'%3e%3cpath d='m 40 0 l 0 40 m -40 0 l 40 0' fill='none' stroke='%23ffffff' stroke-width='1'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23grid)' /%3e%3c/svg%3e")`,
        }}
      />
      
      {/* 画布内容区域 */}
      <div 
        className="absolute inset-0 flex items-center justify-center overflow-auto"
        onWheel={onWheel}
      >
        <div 
          className="relative" 
          style={{ 
            transform: `scale(${scale}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            cursor: getIsProcessing() ? 'wait' : 
                   isPanning ? (dragStart ? 'grabbing' : 'grab') : 'none'
          }}
          onMouseMove={onMouseMove}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden relative">
            {/* 图像画布 */}
            <canvas
              ref={imageCanvasRef}
              style={{
                width: imageWidth,
                height: imageHeight,
                display: 'block'
              }}
            />
            
            {/* 蒙版画布 - 查看原图时隐藏 */}
            {!showOriginal && (
              <canvas
                ref={maskCanvasRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: imageWidth,
                  height: imageHeight,
                  mixBlendMode: 'multiply',
                  opacity: 0.9
                }}
              />
            )}
            
            {/* 画笔光标 */}
            {renderBrush()}
          </div>
        </div>
      </div>

      {/* 右下角进度条显示 - 无遮罩效果 */}
      {getIsProcessing() && (
        <div className="absolute bottom-4 right-4 z-50">
          <div className="bg-gray-800/90 rounded-xl px-4 py-3 text-center border border-gray-600 w-64">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8">
                <div className="w-8 h-8 border-2 border-gray-600 border-t-yellow-400 rounded-full animate-spin"></div>
              </div>
              <div className="text-left">
                <p className="text-gray-300 text-sm font-medium">AI 修复中...</p>
                <p className="text-gray-400 text-xs">
                  正在智能填补选中区域
                </p>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  )
} 