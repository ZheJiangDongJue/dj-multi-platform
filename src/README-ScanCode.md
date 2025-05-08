# 优博讯PDA扫码功能使用说明

本文档介绍如何在应用中使用优博讯PDA的扫码功能。

## 功能概述

本应用已集成优博讯PDA的扫码广播接收功能，可以接收PDA扫码枪扫描的条码数据，并通过JavaScript桥接传递给Web页面。

## 扫码设置

在使用扫码功能前，需要确保PDA的扫码设置正确：

1. 打开PDA上的"扫描设置"应用
2. 选择"输出方式"为"Intent输出"
3. 根据设备型号，设置以下参数：

### 标准优博讯PDA设置
- "广播动作"设置为：`android.intent.ACTION_DECODE_DATA`
- "广播字符串数据标签"设置为：`barcode_string`

### 其他型号优博讯PDA可能的设置
本应用已适配多种优博讯PDA型号，支持以下广播动作和数据标签：

| 设备型号 | 广播动作 | 数据标签 |
|---------|---------|---------|
| 标准型号 | android.intent.ACTION_DECODE_DATA | barcode_string |
| 扫描服务型号 | com.android.server.scannerservice.broadcast | scannerdata |
| 老设备型号 | urovo.rcv.message | barcode |
| 条码广播型号 | com.barcode.sendBroadcast | BARCODE |

应用会自动检测并处理不同型号的广播格式，您只需确保PDA设置为"Intent输出"模式即可。

## 前端使用方法

### 1. 引入扫码处理工具

```javascript
import { initScanListener, removeScanListener, onScanResult } from '@/utils/scan-code-handler';
```

### 2. 初始化扫码监听

在组件挂载时初始化扫码监听：

```javascript
// 在Vue组件的mounted或setup中
onMounted(() => {
  // 初始化扫码监听
  initScanListener();

  // 注册扫码结果回调
  const unsubscribe = onScanResult((barcode, data) => {
    console.log('收到扫码结果:', barcode);
    // 处理扫码结果...
  });

  // 在组件卸载时清理
  onUnmounted(() => {
    // 取消扫码结果回调
    unsubscribe();

    // 移除扫码监听
    removeScanListener();
  });
});
```

### 3. 使用示例组件

项目中已包含一个示例组件 `ScanCodeDemo.vue`，可以直接导入使用：

```javascript
import ScanCodeDemo from '@/components/ScanCodeDemo.vue';

export default {
  components: {
    ScanCodeDemo
  }
}
```

然后在模板中使用：

```html
<template>
  <div>
    <scan-code-demo />
  </div>
</template>
```

## 扫码API

### initScanListener()

初始化扫码监听，应在应用启动或需要使用扫码功能的页面加载时调用。

### removeScanListener()

移除扫码监听，应在不再需要扫码功能时调用，以避免内存泄漏。

### onScanResult(callback)

注册扫码结果回调函数。

- `callback`: 回调函数，接收两个参数：
  - `barcode`: 扫码结果字符串
  - `data`: 包含扫码结果的完整数据对象，包括时间戳等信息

返回一个取消注册的函数，可在组件卸载时调用。

### mockScanResult(barcode)

模拟扫码结果，用于测试。

- `barcode`: 模拟的扫码结果字符串

## 故障排除

1. **扫码没有反应**
   - 检查PDA扫码设置是否正确，确保设置为"Intent输出"模式
   - 确认应用已正确注册广播接收器
   - 查看Logcat日志中是否有扫码相关的日志，特别是"ScanCode"标签的日志
   - 尝试使用不同的广播动作和数据标签，参考上面的表格

2. **扫码结果不正确**
   - 检查扫码结果是否包含特殊字符或换行符
   - 查看Logcat日志中的"ScanCode"标签，了解实际接收到的数据
   - 如果数据不完整，可能需要调整PDA的扫码设置

3. **Web页面没有收到扫码结果**
   - 确认WebViewBridge是否正常工作
   - 检查JavaScript控制台是否有错误信息
   - 确认已正确初始化扫码监听并注册回调函数
   - 尝试使用ScanCodeDemo组件测试扫码功能

4. **调试技巧**
   - 应用会自动记录所有接收到的广播和数据，可以通过Logcat查看
   - 过滤Logcat日志，使用"ScanCode"标签查看扫码相关的日志
   - 如果不确定PDA使用的广播格式，可以查看Logcat日志中记录的所有Extra数据

## 注意事项

1. 本应用已适配多种优博讯PDA型号，但如果您的设备使用了不同的广播格式，可能需要修改代码
2. 扫码功能仅在Android环境中有效，在Web浏览器中测试时可使用mockScanResult模拟扫码
3. 为避免内存泄漏，请确保在不需要扫码功能时移除监听
4. 如果您的PDA型号不在上述支持列表中，请查看设备文档或联系设备厂商获取正确的广播动作和数据标签
