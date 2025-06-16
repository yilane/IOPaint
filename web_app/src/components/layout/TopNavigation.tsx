import React from 'react'

export const TopNavigation: React.FC = () => {

  return (
    <div className="h-12 bg-gray-900 border-b border-gray-700 flex items-center px-4 justify-between">
      {/* 左侧：Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs">AI</span>
        </div>
        <h1 className="text-lg font-semibold text-gray-100">AI智能图片修复工具</h1>
      </div>

      {/* 中央：空白区域 */}
      <div className="flex items-center space-x-2">
        {/* 预留空间以保持布局平衡 */}
      </div>

      {/* 右侧：预留空间以保持布局平衡 */}
      <div className="flex items-center space-x-2">
        {/* 右侧操作区域 - 当前为空 */}
      </div>
    </div>
  )
} 