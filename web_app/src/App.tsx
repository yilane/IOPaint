import { useEffect } from "react"

import useInputImage from "@/hooks/useInputImage"
import { keepGUIAlive, hasCachedImage, cleanupDuplicateRecentImages } from "@/lib/utils"
import { getServerConfig } from "@/lib/api"
import { MainLayout } from "@/components/layout/MainLayout"
import { Toaster } from "./components/ui/toaster"
import { useStore } from "./lib/states"
import { useWindowSize } from "react-use"
import { useProgressSocket } from "@/hooks/useProgressSocket"
import { useEnhancedHotkeys } from "@/hooks/useEnhancedHotkeys"

// 支持的文件类型现在在 DragDropZone 中定义
function Home() {
  const [file, updateAppState, setServerConfig, setFile, loadCachedImage, setHasCachedData, isLoadingCache] = useStore((state) => [
    state.file,
    state.updateAppState,
    state.setServerConfig,
    state.setFile,
    state.loadCachedImage,
    state.setHasCachedData,
    state.isLoadingCache,
  ])

  const userInputImage = useInputImage()
  const windowSize = useWindowSize()
  
  // 使用新的Hook
  useProgressSocket()
  useEnhancedHotkeys()

  useEffect(() => {
    if (userInputImage) {
      setFile(userInputImage)
    }
  }, [userInputImage, setFile])

  useEffect(() => {
    updateAppState({ windowSize })
  }, [windowSize])

  useEffect(() => {
    const fetchServerConfig = async () => {
      const serverConfig = await getServerConfig()
      setServerConfig(serverConfig)
      if (serverConfig.isDesktop) {
        // Keeping GUI Window Open
        keepGUIAlive()
      }
    }
    fetchServerConfig()
  }, [])

  // 检查是否有缓存的图片数据，如果有则自动加载
  useEffect(() => {
    const checkCachedImage = async () => {
      // 首先清理重复的最近使用图片
      const cleanedCount = cleanupDuplicateRecentImages()
      if (cleanedCount > 0) {
        console.log(`已清理 ${cleanedCount} 张重复图片`)
      }
      
      // 然后检查并加载缓存图片
      if (!file && hasCachedImage()) {
        console.log('检测到缓存的图片，正在加载...')
        setHasCachedData(true)
        await loadCachedImage()
      }
    }
    
    checkCachedImage()
  }, [file, loadCachedImage, setHasCachedData])

  return (
    <main className="w-full h-screen overflow-hidden">
      <Toaster />
      <MainLayout isLoadingCache={isLoadingCache} />
    </main>
  )
}

export default Home
