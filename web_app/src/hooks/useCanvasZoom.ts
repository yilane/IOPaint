import { useState, useCallback } from 'react'

interface UseCanvasZoomReturn {
  scale: number
  zoomIn: () => void
  zoomOut: () => void
  resetZoom: () => void
  setScale: (scale: number) => void
  panOffset: { x: number; y: number }
  setPanOffset: (offset: { x: number; y: number }) => void
  isPanning: boolean
  setIsPanning: (isPanning: boolean) => void
}

export const useCanvasZoom = (initialScale = 1): UseCanvasZoomReturn => {
  const [scale, setScaleState] = useState(initialScale)
  const [panOffset, setPanOffsetState] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanningState] = useState(false)

  const zoomIn = useCallback(() => {
    setScaleState(prev => Math.min(prev * 1.2, 5)) // 最大5倍
  }, [])

  const zoomOut = useCallback(() => {
    setScaleState(prev => Math.max(prev / 1.2, 0.1)) // 最小0.1倍
  }, [])

  const resetZoom = useCallback(() => {
    setScaleState(1)
    setPanOffsetState({ x: 0, y: 0 })
  }, [])

  const setScale = useCallback((newScale: number) => {
    setScaleState(Math.max(0.1, Math.min(5, newScale)))
  }, [])

  const setPanOffset = useCallback((offset: { x: number; y: number }) => {
    setPanOffsetState(offset)
  }, [])

  const setIsPanning = useCallback((panning: boolean) => {
    setIsPanningState(panning)
  }, [])

  return {
    scale,
    zoomIn,
    zoomOut,
    resetZoom,
    setScale,
    panOffset,
    setPanOffset,
    isPanning,
    setIsPanning
  }
} 