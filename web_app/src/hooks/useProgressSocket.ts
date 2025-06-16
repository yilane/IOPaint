import { useEffect, useRef } from 'react'
import { useStore } from '@/lib/states'
import { toast } from '@/components/ui/use-toast'

interface ProgressMessage {
  type: 'progress' | 'complete' | 'error'
  progress?: number
  message?: string
  error?: string
}

export const useProgressSocket = () => {
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5
  
  const [serverConfig, updateAppState] = useStore((state) => [
    state.serverConfig,
    state.updateAppState,
  ])

  const connect = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws/progress`
    
    try {
      const socket = new WebSocket(wsUrl)
      socketRef.current = socket

      socket.onopen = () => {
        console.log('WebSocket connected for progress updates')
        reconnectAttemptsRef.current = 0
        // Reset any progress state when connected
        updateAppState({ 
          isInpainting: false,
          isPluginRunning: false,
          isAdjustingMask: false 
        })
      }

      socket.onmessage = (event) => {
        try {
          const data: ProgressMessage = JSON.parse(event.data)
          
          switch (data.type) {
            case 'progress':
              if (data.progress !== undefined) {
                // Update progress in the store
                // Note: You might need to add a progress field to your store
                console.log(`Progress: ${data.progress}%`)
                if (data.message) {
                  console.log(`Message: ${data.message}`)
                }
              }
              break
              
            case 'complete':
              updateAppState({ 
                isInpainting: false,
                isPluginRunning: false,
                isAdjustingMask: false 
              })
              if (data.message) {
                toast({
                  title: "任务完成",
                  description: data.message,
                })
              }
              break
              
            case 'error':
              updateAppState({ 
                isInpainting: false,
                isPluginRunning: false,
                isAdjustingMask: false 
              })
              toast({
                variant: "destructive",
                title: "处理错误",
                description: data.error || '处理过程中发生未知错误',
              })
              break
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      socket.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason)
        socketRef.current = null
        
        // Attempt to reconnect if not a clean close
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const timeout = Math.pow(2, reconnectAttemptsRef.current) * 1000 // Exponential backoff
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++
            console.log(`Attempting to reconnect... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`)
            connect()
          }, timeout)
        }
      }

      socket.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
    }
  }

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (socketRef.current) {
      socketRef.current.close(1000, 'Component unmounting')
      socketRef.current = null
    }
  }

  const sendMessage = (message: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  useEffect(() => {
    // Only connect if server supports WebSocket
    if (serverConfig && !serverConfig.isDesktop) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [serverConfig])

  return {
    isConnected: socketRef.current?.readyState === WebSocket.OPEN,
    connect,
    disconnect,
    sendMessage,
  }
} 