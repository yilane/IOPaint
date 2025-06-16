import React from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WelcomeScreenProps {
  onFileSelect: (file: File) => void
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onFileSelect }) => {
  const handleFileUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) onFileSelect(file)
    }
    input.click()
  }

  return (
    <div className="flex items-center justify-center h-full bg-gray-850">
      <div className="text-center space-y-12 max-w-2xl mx-auto p-8">
        {/* 主标题 */}
        <div className="space-y-6">
          <h1 className="text-5xl font-bold text-gray-100 leading-tight">
            使用 AI 在线去除图片水印
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-xl mx-auto">
            在线去水印，帮助快速免费去除图片上的文字、水印和标志。
          </p>
        </div>
        
        {/* 上传按钮 */}
        <div className="space-y-4">
          <Button
            onClick={handleFileUpload}
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 text-white px-12 py-4 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <Upload className="w-6 h-6 mr-3" />
            上传图像
          </Button>
          
          <p className="text-gray-500 text-base">
            或直接拖放到这里 / Ctrl + V 粘贴图像
          </p>
        </div>




      </div>
    </div>
  )
} 