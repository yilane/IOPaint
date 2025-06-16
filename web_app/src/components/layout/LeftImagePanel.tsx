import React, { useState, useRef, useEffect } from 'react'
import { Plus, Upload, X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/states'
import { clearImageCache } from '@/lib/utils'

interface ImageItem {
  id: string
  name: string
  dataUrl: string  // base64数据URL，用于持久化存储
  size: number
  lastModified: number
  type: string
}

export const LeftImagePanel: React.FC = () => {
  const [file, setFile, setHasCachedData, updateAppState] = useStore((state) => [state.file, state.setFile, state.setHasCachedData, state.updateAppState])
  const [recentImages, setRecentImages] = useState<ImageItem[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 从本地存储加载最近使用的图片
  useEffect(() => {
    const savedImages = localStorage.getItem('iopaint-recent-images')
    if (savedImages) {
      try {
        const parsed = JSON.parse(savedImages)
        setRecentImages(parsed.filter((img: any) => img.dataUrl && img.name))
      } catch (error) {
        console.error('Failed to load recent images from localStorage:', error)
      }
    }
  }, [])

  // 将文件转换为base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // 监听文件变化，自动添加到最近使用列表
  useEffect(() => {
    if (file && file instanceof File) {
      console.log(`[LeftImagePanel] 检测到文件变化: ${file.name}, size: ${file.size}, lastModified: ${file.lastModified}`)
      
      // 使用函数式更新来避免依赖recentImages
      setRecentImages(prev => {
        // 检查是否已经在最近使用列表中（精确的重复检查）
        const exists = prev.some(img => 
          img.name === file.name && 
          img.size === file.size && 
          img.lastModified === file.lastModified // 精确匹配lastModified
        )
        
        console.log(`[LeftImagePanel] 文件 ${file.name} ${exists ? '已存在' : '不存在'} 于最近使用列表`)
        
        if (!exists) {
          // 创建唯一ID，基于文件属性而不是时间戳
          const uniqueId = `${file.name}-${file.size}-${file.lastModified}`
          
          // 检查是否已有相同ID的项目
          const hasId = prev.some(img => img.id === uniqueId)
          if (hasId) {
            console.log(`[LeftImagePanel] ID ${uniqueId} 已存在，跳过添加`)
            return prev
          }
          
          // 异步转换文件为base64
          fileToBase64(file).then(dataUrl => {
            const newImage: ImageItem = {
              id: uniqueId,
              name: file.name,
              dataUrl: dataUrl,
              size: file.size,
              lastModified: file.lastModified,
              type: file.type
            }
            
            console.log(`[LeftImagePanel] 添加新图片到列表: ${newImage.name}`)
            
            // 添加到最近使用列表的最前面，并去重
            setRecentImages(current => {
              // 再次检查重复（防止异步竞态）
              const stillExists = current.some(img => img.id === uniqueId)
              if (stillExists) {
                console.log(`[LeftImagePanel] 异步添加时发现重复，跳过: ${uniqueId}`)
                return current
              }
              
              // 移除可能的重复项（基于文件属性）
              const filtered = current.filter(img => 
                !(img.name === newImage.name && 
                  img.size === newImage.size &&
                  img.lastModified === newImage.lastModified)
              )
              return [newImage, ...filtered.slice(0, 9)]
            })
          }).catch(error => {
            console.error('Failed to convert file to base64:', error)
          })
        }
        
        return prev
      })
    }
  }, [file])

  // 保存最近使用的图片到本地存储
  useEffect(() => {
    if (recentImages.length > 0) {
      try {
        localStorage.setItem('iopaint-recent-images', JSON.stringify(recentImages))
      } catch (error) {
        console.error('Failed to save recent images to localStorage:', error)
      }
    }
  }, [recentImages])



  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      // 只设置为当前文件，添加到最近使用列表的逻辑由useEffect处理
      setFile(selectedFile)
    }
  }



  const handleRecentImageClick = async (image: ImageItem) => {
    try {
      console.log(`[LeftImagePanel] 点击最近使用图片: ${image.name}`)
      
      // 检查是否与当前文件相同，避免不必要的状态更新
      if (file && file.name === image.name && file.size === image.size && file.lastModified === image.lastModified) {
        console.log(`[LeftImagePanel] 选择的图片与当前文件相同，跳过设置`)
        return
      }
      
      // 从base64数据URL创建File对象，确保属性一致
      const response = await fetch(image.dataUrl)
      const blob = await response.blob()
      const newFile = new File([blob], image.name, { 
        type: image.type,
        lastModified: image.lastModified 
      })
      
      console.log(`[LeftImagePanel] 设置新文件: ${newFile.name}`)
      setFile(newFile)
    } catch (error) {
      console.error('Failed to recreate file from base64:', error)
    }
  }

  const removeRecentImage = (imageId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    
    console.log(`[LeftImagePanel] 删除图片ID: ${imageId}`)
    
    // 找到要删除的图片
    const imageToDelete = recentImages.find(img => img.id === imageId)
    if (!imageToDelete) {
      console.log(`[LeftImagePanel] 未找到要删除的图片: ${imageId}`)
      return
    }
    
    // 检查是否是当前选中的图片
    const isCurrentImage = file && 
      file.name === imageToDelete.name && 
      file.size === imageToDelete.size && 
      file.lastModified === imageToDelete.lastModified
    
    console.log(`[LeftImagePanel] 删除的是否为当前图片: ${isCurrentImage}`)
    
    // 从列表中移除图片
    setRecentImages(prev => {
      const newImages = prev.filter(img => img.id !== imageId)
      
      // 如果删除的是当前选中的图片
      if (isCurrentImage) {
        if (newImages.length > 0) {
          // 情况1：还有其他图片，选择下一张图片
          console.log(`[LeftImagePanel] 还有其他图片，切换到下一张`)
          
          // 找到被删除图片在原列表中的位置
          const deletedIndex = prev.findIndex(img => img.id === imageId)
          let nextImageIndex = deletedIndex
          
          // 如果删除的是最后一张，选择前一张；否则选择当前位置的图片（即原来的下一张）
          if (nextImageIndex >= newImages.length) {
            nextImageIndex = newImages.length - 1
          }
          
          const nextImage = newImages[nextImageIndex]
          console.log(`[LeftImagePanel] 选择下一张图片: ${nextImage.name}`)
          
          // 异步设置下一张图片
          setTimeout(async () => {
            try {
              const response = await fetch(nextImage.dataUrl)
              const blob = await response.blob()
              const newFile = new File([blob], nextImage.name, { 
                type: nextImage.type,
                lastModified: nextImage.lastModified 
              })
              
              console.log(`[LeftImagePanel] 设置下一张图片: ${newFile.name}`)
              setFile(newFile)
            } catch (error) {
              console.error('Failed to set next image:', error)
            }
          }, 100)
          
        } else {
          // 情况2：没有其他图片了，清除缓存并跳转到首页
          console.log(`[LeftImagePanel] 没有其他图片，清除缓存并跳转首页`)
          
          // 清除当前文件状态
          updateAppState({ file: null })
          
          // 清除图片缓存
          clearImageCache()
          
          // 设置没有缓存数据状态
          setHasCachedData(false)
          
          console.log(`[LeftImagePanel] 已清除所有缓存，将跳转到首页`)
        }
      }
      
      return newImages
    })
  }

  const clearAllRecent = () => {
    console.log(`[LeftImagePanel] 清空全部最近使用图片`)
    
    // 清空最近使用图片列表
    setRecentImages([])
    localStorage.removeItem('iopaint-recent-images')
    
    // 清除当前文件状态
    updateAppState({ file: null })
    
    // 清除图片缓存
    clearImageCache()
    
    // 设置没有缓存数据状态，触发跳转到首页
    setHasCachedData(false)
    
    console.log(`[LeftImagePanel] 已清空全部图片和缓存，将跳转到首页`)
  }

  return (
    <div className="w-20 bg-gray-800 border-r border-gray-700 flex flex-col h-full shadow-lg">
      {/* 上传按钮 */}
      <div className="p-2 border-b border-gray-700">
        <Button
          onClick={handleFileUpload}
          variant="ghost"
          size="sm"
          className="w-full h-16 flex flex-col items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg group"
          title="上传图片"
        >
          <Plus className="w-6 h-6 mb-1" />
          <span className="text-xs">上传</span>
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* 最近使用图片区域 */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {/* 最近使用图片 */}
        {recentImages.length > 0 ? (
          <>
            <div className="p-2 text-xs text-gray-400 text-center border-b border-gray-700 flex items-center justify-between">
              <span>最近使用</span>
              <Button
                onClick={clearAllRecent}
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 text-gray-500 hover:text-red-400"
                title="清空全部"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
            
            <div className="space-y-2 p-2">
              {recentImages.map((image) => (
                <div
                  key={image.id}
                  onClick={() => handleRecentImageClick(image)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-200 group ${
                    file && file.name === image.name && file.size === image.size && file.lastModified === image.lastModified
                      ? 'border-yellow-400 shadow-lg shadow-yellow-400/20' 
                      : 'border-transparent hover:border-yellow-400'
                  }`}
                  title={image.name}
                >
                  <img
                    src={image.dataUrl}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
                  
                  {/* 删除按钮 */}
                  <Button
                    onClick={(e) => removeRecentImage(image.id, e)}
                    variant="ghost"
                    size="sm"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    title="删除"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm text-center p-4">
            <div>
              <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>暂无图片</p>
              <p className="text-xs mt-1">上传图片后会显示在这里</p>
            </div>
          </div>
        )}
      </div>

      {/* 文件计数显示 */}
      {recentImages.length > 0 && (
        <div className="p-2 border-t border-gray-700 text-center">
          <span className="text-xs text-gray-500">
            文件{recentImages.length}/10
          </span>
        </div>
      )}
    </div>
  )
} 