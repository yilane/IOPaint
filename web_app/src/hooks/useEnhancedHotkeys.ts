import { useStore } from "@/lib/states"
import { useHotkeys } from "react-hotkeys-hook"
import { toast } from "@/components/ui/use-toast"

export const useEnhancedHotkeys = () => {
  const [
    disableShortCuts,
    file,
    isInpainting,
    undo,
    redo,
    undoDisabled,
    redoDisabled,
    decreaseBaseBrushSize,
    increaseBaseBrushSize,
    getBrushSize,
    runInpainting,
    clearMask,
  ] = useStore((state) => [
    state.disableShortCuts,
    state.file,
    state.isInpainting,
    state.undo,
    state.redo,
    state.undoDisabled(),
    state.redoDisabled(),
    state.decreaseBaseBrushSize,
    state.increaseBaseBrushSize,
    state.getBrushSize,
    state.runInpainting,
    state.clearMask,
  ])

  const isEnabled = !disableShortCuts && !!file && !isInpainting

  // 撤销 - Ctrl/Cmd + Z
  useHotkeys(
    'ctrl+z, cmd+z',
    (event) => {
      event.preventDefault()
      if (!undoDisabled) {
        undo()
        toast({
          description: "已撤销上一步操作",
          duration: 1000,
        })
      }
    },
    { enabled: isEnabled },
    [undoDisabled]
  )

  // 重做 - Ctrl/Cmd + Y 或 Ctrl/Cmd + Shift + Z
  useHotkeys(
    'ctrl+y, cmd+y, ctrl+shift+z, cmd+shift+z',
    (event) => {
      event.preventDefault()
      if (!redoDisabled) {
        redo()
        toast({
          description: "已重做操作",
          duration: 1000,
        })
      }
    },
    { enabled: isEnabled },
    [redoDisabled]
  )

  // 减小笔刷大小 - [ 键
  useHotkeys(
    '[',
    (event) => {
      event.preventDefault()
      decreaseBaseBrushSize()
      const newSize = getBrushSize()
      toast({
        description: `笔刷大小: ${newSize}px`,
        duration: 800,
      })
    },
    { enabled: isEnabled }
  )

  // 增大笔刷大小 - ] 键
  useHotkeys(
    ']',
    (event) => {
      event.preventDefault()
      increaseBaseBrushSize()
      const newSize = getBrushSize()
      toast({
        description: `笔刷大小: ${newSize}px`,
        duration: 800,
      })
    },
    { enabled: isEnabled }
  )

  // 执行修复 - Enter 键
  useHotkeys(
    'enter',
    (event) => {
      event.preventDefault()
      runInpainting()
      toast({
        description: "开始处理图像...",
        duration: 1000,
      })
    },
    { enabled: isEnabled }
  )

  // 清除蒙版 - Escape 键
  useHotkeys(
    'escape',
    (event) => {
      event.preventDefault()
      clearMask()
      toast({
        description: "已清除蒙版",
        duration: 1000,
      })
    },
    { enabled: isEnabled }
  )

  // 显示快捷键帮助 - ? 键
  useHotkeys(
    'shift+/',
    (event) => {
      event.preventDefault()
      toast({
        title: "键盘快捷键",
        description: `
Ctrl/Cmd + Z: 撤销
Ctrl/Cmd + Y: 重做
[: 减小笔刷
]: 增大笔刷
Enter: 执行修复
Esc: 清除蒙版
Shift + ?: 显示帮助
        `,
        duration: 5000,
      })
    },
    { enabled: !disableShortCuts }
  )
} 