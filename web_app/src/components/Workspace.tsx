import { useEffect } from "react"
import Editor from "./Editor"
import { currentModel } from "@/lib/api"
import { useStore } from "@/lib/states"
import { InteractiveSeg } from "./InteractiveSeg"
import SidePanel from "./SidePanel"
import { EnhancedProgress } from "./EnhancedProgress"

const Workspace = () => {
  const [file, updateSettings] = useStore((state) => [
    state.file,
    state.updateSettings,
  ])

  useEffect(() => {
    const fetchCurrentModel = async () => {
      const model = await currentModel()
      updateSettings({ model })
    }
    fetchCurrentModel()
  }, [])

  return (
    <>
      {/* 已移除多余的按钮：Plugins、ImageSize */}
      <InteractiveSeg />
      <EnhancedProgress />
      <SidePanel />
      {file ? <Editor file={file} /> : <></>}
    </>
  )
}

export default Workspace
