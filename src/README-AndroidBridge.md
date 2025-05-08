# Android WebView 桥接功能说明

## 概述

此桥接模块提供了Web页面与Android原生应用之间的双向通信功能。通过此桥接，Web页面可以调用Android的原生功能（如拍照、扫描二维码等），Android原生应用也可以向Web页面发送通知和调用Web方法。

## 工作原理

1. **JavaScript到Android**: 
   - Web页面通过`window.android.receiveMessage()`方法发送消息
   - 如果直接方法不可用，会使用`prompt()`作为备选方案
   - 传递JSON格式的消息，包含`action`、`data`和`callbackId`

2. **Android到JavaScript**:
   - Android通过`WebView.evaluateJavascript()`调用Web页面的方法
   - 主要调用`window.WebMethods`对象中的方法

## 自动修复功能

我们添加了自动修复功能来解决常见的桥接问题：

1. 页面加载时自动检查桥接状态
2. 如果`window.android`对象不存在，会创建模拟对象
3. 如果`window.WebMethods`对象不存在，会创建本地实现
4. 使用`prompt()`机制作为备选通信方案

## 调试功能

添加了调试工具来帮助诊断桥接问题：

1. 调试面板可在页面中显示桥接状态
2. 控制台日志会显示所有桥接相关的操作
3. 可手动触发桥接检查和测试

## 使用方法

### Web页面调用Android功能

```javascript
// 引入桥接模块
import AndroidBridge from '@/utils/android-bridge';

// 调用Android功能
AndroidBridge.takePhoto()
  .then(result => {
    console.log('拍照结果:', result);
  })
  .catch(error => {
    console.error('拍照失败:', error);
  });
```

### Android发送通知到Web页面

```javascript
// 在Android中
webViewBridge.notifyNetworkChange(true);

// 在Web页面中监听
window.addEventListener('android-notification', event => {
  const { type, data } = event.detail;
  console.log('收到Android通知:', type, data);
});
```

## 故障排除

如果桥接功能无法正常工作，请尝试以下步骤：

1. 确保AndroidBridgeDemo页面能正常加载
2. 使用调试面板检查桥接状态
3. 查看Android应用日志中的WebView相关日志
4. 清除WebView缓存并重新加载页面

## 注意事项

1. 在某些Android设备上，WebView可能存在缓存问题，需要强制清除缓存
2. 在Android应用中需启用WebView调试功能，便于问题排查
3. 确保AndroidManifest.xml中添加了正确的权限
4. 所有的JavaScript回调在Android端都应在UI线程中执行 