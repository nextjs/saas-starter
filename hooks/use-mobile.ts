/**
 * 移动设备检测Hook
 * 用于检测当前视口是否为移动设备尺寸
 */
import * as React from "react"

/**
 * 移动设备断点（像素）
 * 小于此宽度的视口被视为移动设备
 */
const MOBILE_BREAKPOINT = 768

/**
 * 检测当前视口是否为移动设备尺寸的Hook
 *
 * @returns 如果当前视口宽度小于移动设备断点，则返回true，否则返回false
 */
export function useIsMobile() {
  // 状态初始值为undefined，避免服务器端渲染与客户端不匹配
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // 创建媒体查询
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    // 媒体查询变化时的处理函数
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // 添加媒体查询变化监听器
    mql.addEventListener("change", onChange)

    // 设置初始状态
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    // 清理函数：移除监听器
    return () => mql.removeEventListener("change", onChange)
  }, []) // 空依赖数组，仅在组件挂载时执行一次

  // 将undefined转换为false，确保返回布尔值
  return !!isMobile
}
