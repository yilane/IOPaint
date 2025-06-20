import { type ClassValue, clsx } from "clsx"
import { SyntheticEvent } from "react"
import { twMerge } from "tailwind-merge"
import { LineGroup } from "./types"
import { BRUSH_COLOR } from "./const"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function keepGUIAlive() {
  async function getRequest(url = "") {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-cache",
    })
    return response.json()
  }

  const keepAliveServer = () => {
    const url = document.location
    const route = "/flaskwebgui-keep-server-alive"
    getRequest(url + route).then((data) => {
      return data
    })
  }

  const intervalRequest = 3 * 1000
  keepAliveServer()
  setInterval(keepAliveServer, intervalRequest)
}

export function dataURItoBlob(dataURI: string) {
  const mime = dataURI.split(",")[0].split(":")[1].split(";")[0]
  const binary = atob(dataURI.split(",")[1])
  const array = []
  for (let i = 0; i < binary.length; i += 1) {
    array.push(binary.charCodeAt(i))
  }
  return new Blob([new Uint8Array(array)], { type: mime })
}

export function loadImage(image: HTMLImageElement, src: string) {
  return new Promise((resolve, reject) => {
    const initSRC = image.src
    const img = image
    img.onload = resolve
    img.onerror = (err) => {
      img.src = initSRC
      reject(err)
    }
    img.src = src
  })
}

export async function blobToImage(blob: Blob) {
  const dataURL = URL.createObjectURL(blob)
  const newImage = new Image()
  await loadImage(newImage, dataURL)
  return newImage
}

export function canvasToImage(
  canvas: HTMLCanvasElement
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()

    image.addEventListener("load", () => {
      resolve(image)
    })

    image.addEventListener("error", (error) => {
      reject(error)
    })

    image.src = canvas.toDataURL()
  })
}

export function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const image = new Image()
      image.onload = () => {
        resolve(image)
      }
      image.onerror = () => {
        reject("无法加载图像。")
      }
      image.src = reader.result as string
    }
    reader.onerror = () => {
      reject("无法读取文件。")
    }
    reader.readAsDataURL(file)
  })
}

export function srcToFile(src: string, fileName: string, mimeType: string) {
  return fetch(src)
    .then(function (res) {
      return res.arrayBuffer()
    })
    .then(function (buf) {
      return new File([buf], fileName, { type: mimeType })
    })
}

export async function askWritePermission() {
  try {
    // The clipboard-write permission is granted automatically to pages
    // when they are the active tab. So it's not required, but it's more safe.
    const { state } = await navigator.permissions.query({
      name: "clipboard-write" as PermissionName,
    })
    return state === "granted"
  } catch (error) {
    // Browser compatibility / Security error (ONLY HTTPS) ...
    return false
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string): Promise<any> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(async (d) => {
      if (d) {
        resolve(d)
      } else {
        reject(new Error("Expected toBlob() to be defined"))
      }
    }, mime)
  )
}

const setToClipboard = async (blob: any) => {
  const data = [new ClipboardItem({ [blob.type]: blob })]
  await navigator.clipboard.write(data)
}

export function isRightClick(ev: SyntheticEvent) {
  const mouseEvent = ev.nativeEvent as MouseEvent
  return mouseEvent.button === 2
}

export function isMidClick(ev: SyntheticEvent) {
  const mouseEvent = ev.nativeEvent as MouseEvent
  return mouseEvent.button === 1
}

export async function copyCanvasImage(canvas: HTMLCanvasElement) {
  const blob = await canvasToBlob(canvas, "image/png")
  try {
    await setToClipboard(blob)
  } catch {
    console.log("Copy image failed!")
  }
}

export function downloadImage(uri: string, name: string) {
  const link = document.createElement("a")
  link.href = uri
  link.download = name

  // this is necessary as link.click() does not work on the latest firefox
  link.dispatchEvent(
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    })
  )

  setTimeout(() => {
    // For Firefox it is necessary to delay revoking the ObjectURL
    // window.URL.revokeObjectURL(base64)
    link.remove()
  }, 100)
}

export function mouseXY(ev: SyntheticEvent) {
    const mouseEvent = ev.nativeEvent as MouseEvent
    // Handle mask drawing coordinate on mobile/tablet devices
    if ('touches' in ev) {
        const rect = (ev.target as HTMLCanvasElement).getBoundingClientRect();
        const touches = ev.touches as (Touch & { target: HTMLCanvasElement })[]
        const touch = touches[0]
        return {
            x: (touch.clientX - rect.x) / rect.width * touch.target.offsetWidth,
            y: (touch.clientY - rect.y) / rect.height * touch.target.offsetHeight,
        }
    }
    return {x: mouseEvent.offsetX, y: mouseEvent.offsetY}
}

export function drawLines(
  ctx: CanvasRenderingContext2D,
  lines: LineGroup,
  color = BRUSH_COLOR
) {
  ctx.strokeStyle = color
  ctx.lineCap = "round"
  ctx.lineJoin = "round"

  lines.forEach((line) => {
    if (!line?.pts.length || !line.size) {
      return
    }
    ctx.lineWidth = line.size
    ctx.beginPath()
    ctx.moveTo(line.pts[0].x, line.pts[0].y)
    line.pts.forEach((pt) => ctx.lineTo(pt.x, pt.y))
    ctx.stroke()
  })
}

export const generateMask = (
  imageWidth: number,
  imageHeight: number,
  lineGroups: LineGroup[],
  maskImages: HTMLImageElement[] = [],
  lineGroupsColor: string = "white"
): HTMLCanvasElement => {
  const maskCanvas = document.createElement("canvas")
  maskCanvas.width = imageWidth
  maskCanvas.height = imageHeight
  const ctx = maskCanvas.getContext("2d")
  if (!ctx) {
    throw new Error("could not retrieve mask canvas")
  }

  maskImages.forEach((maskImage) => {
    ctx.drawImage(maskImage, 0, 0, imageWidth, imageHeight)
  })

  lineGroups.forEach((lineGroup) => {
    drawLines(ctx, lineGroup, lineGroupsColor)
  })

  return maskCanvas
}

export const convertToBase64 = (fileOrBlob: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64String = event.target?.result as string
      resolve(base64String)
    }
    reader.onerror = (error) => {
      reject(error)
    }
    reader.readAsDataURL(fileOrBlob)
  })
}

// 图片缓存相关工具函数
export const CACHED_IMAGE_KEY = 'iopaint_cached_image'
export const CACHED_IMAGE_INFO_KEY = 'iopaint_cached_image_info'

export interface CachedImageInfo {
  fileName: string
  fileType: string
  width: number
  height: number
  timestamp: number
  lastModified: number // 添加原始文件的lastModified时间戳
}

/**
 * 将图片文件保存到localStorage
 */
export async function saveImageToCache(file: File): Promise<void> {
  try {
    // 将文件转换为base64
    const base64 = await convertToBase64(file)
    
    // 保存图片数据
    localStorage.setItem(CACHED_IMAGE_KEY, base64)
    
    // 保存图片信息
    const info: CachedImageInfo = {
      fileName: file.name,
      fileType: file.type,
      width: 0, // 将在加载图片后更新
      height: 0, // 将在加载图片后更新
      timestamp: Date.now(),
      lastModified: file.lastModified
    }
    localStorage.setItem(CACHED_IMAGE_INFO_KEY, JSON.stringify(info))
  } catch (error) {
    console.error('Failed to save image to cache:', error)
  }
}

/**
 * 从localStorage加载缓存的图片
 */
export async function loadImageFromCache(): Promise<File | null> {
  try {
    const base64 = localStorage.getItem(CACHED_IMAGE_KEY)
    const infoStr = localStorage.getItem(CACHED_IMAGE_INFO_KEY)
    
    if (!base64 || !infoStr) {
      return null
    }
    
    const info: CachedImageInfo = JSON.parse(infoStr)
    
    // 检查缓存是否过期（24小时）
    const isExpired = Date.now() - info.timestamp > 24 * 60 * 60 * 1000
    if (isExpired) {
      clearImageCache()
      return null
    }
    
    // 将base64转换回文件，保留原始的lastModified时间戳
    const blob = dataURItoBlob(base64)
    const file = new File([blob], info.fileName, { 
      type: info.fileType,
      lastModified: info.lastModified || info.timestamp // 兼容旧缓存数据
    })
    
    return file
  } catch (error) {
    console.error('Failed to load image from cache:', error)
    clearImageCache()
    return null
  }
}

/**
 * 获取缓存的图片信息
 */
export function getCachedImageInfo(): CachedImageInfo | null {
  try {
    const infoStr = localStorage.getItem(CACHED_IMAGE_INFO_KEY)
    if (!infoStr) return null
    
    const info: CachedImageInfo = JSON.parse(infoStr)
    
    // 检查缓存是否过期
    const isExpired = Date.now() - info.timestamp > 24 * 60 * 60 * 1000
    if (isExpired) {
      clearImageCache()
      return null
    }
    
    return info
  } catch (error) {
    console.error('Failed to get cached image info:', error)
    return null
  }
}

/**
 * 更新缓存图片的尺寸信息
 */
export function updateCachedImageSize(width: number, height: number): void {
  try {
    const infoStr = localStorage.getItem(CACHED_IMAGE_INFO_KEY)
    if (!infoStr) return
    
    const info: CachedImageInfo = JSON.parse(infoStr)
    info.width = width
    info.height = height
    
    localStorage.setItem(CACHED_IMAGE_INFO_KEY, JSON.stringify(info))
  } catch (error) {
    console.error('Failed to update cached image size:', error)
  }
}

/**
 * 清除图片缓存
 */
export function clearImageCache(): void {
  localStorage.removeItem(CACHED_IMAGE_KEY)
  localStorage.removeItem(CACHED_IMAGE_INFO_KEY)
}

/**
 * 检查是否有缓存的图片
 */
export function hasCachedImage(): boolean {
  const base64 = localStorage.getItem(CACHED_IMAGE_KEY)
  const info = getCachedImageInfo()
  return !!(base64 && info)
}

/**
 * 清理最近使用图片中的重复项
 */
export function cleanupDuplicateRecentImages(): number {
  const RECENT_IMAGES_KEY = 'iopaint-recent-images'
  
  try {
    const recentImagesStr = localStorage.getItem(RECENT_IMAGES_KEY)
    if (!recentImagesStr) return 0
    
    const recentImages = JSON.parse(recentImagesStr)
    if (!Array.isArray(recentImages)) return 0
    
    const originalCount = recentImages.length
    
    // 去重逻辑：基于文件名、大小和修改时间
    const uniqueImages = recentImages.filter((img, index, arr) => {
      return arr.findIndex(item => 
        item.name === img.name && 
        item.size === img.size &&
        Math.abs(item.lastModified - img.lastModified) < 1000
      ) === index
    })
    
    if (uniqueImages.length < originalCount) {
      localStorage.setItem(RECENT_IMAGES_KEY, JSON.stringify(uniqueImages))
      console.log(`清理重复图片: ${originalCount} -> ${uniqueImages.length}`)
      return originalCount - uniqueImages.length
    }
    
    return 0
  } catch (error) {
    console.error('清理重复图片失败:', error)
    return 0
  }
}
