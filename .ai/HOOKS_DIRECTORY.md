# hooks目录说明

本文档提供了项目hooks目录中自定义React Hooks的详细说明。

## 目录结构

```
hooks/
└── use-mobile.ts    # 移动设备检测Hook
```

## Hooks说明

### useIsMobile

**文件**: `use-mobile.ts`

**功能**: 检测当前视口是否为移动设备尺寸

**使用方法**:
```tsx
import { useIsMobile } from '@/hooks/use-mobile';

function MyComponent() {
  const isMobile = useIsMobile();
  
  return (
    <div>
      {isMobile ? (
        <MobileView />
      ) : (
        <DesktopView />
      )}
    </div>
  );
}
```

**实现细节**:
- 使用媒体查询API检测视口宽度
- 移动设备断点设置为768像素
- 监听视口大小变化，动态更新状态
- 适配服务器端渲染，初始状态为undefined

**注意事项**:
- 此Hook仅在客户端执行，服务器端渲染时返回false
- 如果需要更精确的设备检测，可能需要考虑更多因素，如用户代理字符串
