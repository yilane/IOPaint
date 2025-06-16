import React, { useState } from 'react'
import { X, Download, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ExampleGalleryProps {
  isOpen: boolean
  onClose: () => void
  onSelectExample?: (url: string) => void
}

// 示例图片数据
const exampleImages = [
  {
    id: 1,
    title: '人物背景移除',
    description: '移除复杂背景，保留主要人物',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
    before: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
    category: 'portrait'
  },
  {
    id: 2,
    title: '物体移除',
    description: '移除不需要的物体，AI智能填充',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
    before: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
    category: 'object'
  },
  {
    id: 3,
    title: '风景修复',
    description: '移除游客或多余元素，还原自然风景',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
    before: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
    category: 'landscape'
  },
  {
    id: 4,
    title: '文字移除',
    description: '移除图片中的文字水印',
    thumbnail: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=300&h=200&fit=crop',
    before: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=400&fit=crop',
    category: 'text'
  }
]

const categories = [
  { id: 'all', name: '全部', count: exampleImages.length },
  { id: 'portrait', name: '人物', count: exampleImages.filter(img => img.category === 'portrait').length },
  { id: 'object', name: '物体', count: exampleImages.filter(img => img.category === 'object').length },
  { id: 'landscape', name: '风景', count: exampleImages.filter(img => img.category === 'landscape').length },
  { id: 'text', name: '文字', count: exampleImages.filter(img => img.category === 'text').length },
]

export const ExampleGallery: React.FC<ExampleGalleryProps> = ({ 
  isOpen, 
  onClose, 
  onSelectExample 
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedImage, setSelectedImage] = useState<typeof exampleImages[0] | null>(null)

  const filteredImages = selectedCategory === 'all' 
    ? exampleImages 
    : exampleImages.filter(img => img.category === selectedCategory)

  const handleUseExample = (imageUrl: string) => {
    onSelectExample?.(imageUrl)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-6xl h-full max-h-[90vh] bg-gray-900 rounded-xl border border-gray-700 overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">示例图片</h2>
            <p className="text-gray-400 mt-1">选择一张示例图片来体验AI修复功能</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* 分类标签 */}
        <div className="flex items-center space-x-1 p-6 border-b border-gray-700/50">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                selectedCategory === category.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>

        {/* 图片网格 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="group bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500/50 transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={image.thumbnail}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-1">{image.title}</h3>
                  <p className="text-sm text-gray-400">{image.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 图片详情模态框 */}
        {selectedImage && (
          <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-6">
            <div className="max-w-4xl w-full bg-gray-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h3 className="text-xl font-semibold text-white">{selectedImage.title}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedImage(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-6">
                <div className="aspect-video mb-6">
                  <img
                    src={selectedImage.before}
                    alt={selectedImage.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 mb-2">{selectedImage.description}</p>
                    <p className="text-sm text-gray-500">点击"使用此图片"开始体验AI修复功能</p>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => window.open(selectedImage.before, '_blank')}
                      className="border-gray-600 text-gray-300 hover:text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      下载原图
                    </Button>
                    <Button
                      onClick={() => handleUseExample(selectedImage.before)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      使用此图片
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 