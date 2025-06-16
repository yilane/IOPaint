import React, { createContext, useContext } from 'react'
import { useCanvasZoom } from '@/hooks/useCanvasZoom'

interface CanvasContextType {
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

const CanvasContext = createContext<CanvasContextType | null>(null)

export const useCanvasContext = () => {
  const context = useContext(CanvasContext)
  if (!context) {
    throw new Error('useCanvasContext must be used within a CanvasProvider')
  }
  return context
}

interface CanvasProviderProps {
  children: React.ReactNode
}

export const CanvasProvider: React.FC<CanvasProviderProps> = ({ children }) => {
  const zoomControls = useCanvasZoom()

  return (
    <CanvasContext.Provider value={zoomControls}>
      {children}
    </CanvasContext.Provider>
  )
} 