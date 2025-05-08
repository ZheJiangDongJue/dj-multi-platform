<template>
  <div class="scan-code-demo">
    <h2>扫码演示</h2>
    
    <div class="scan-result-container">
      <div class="scan-result-label">扫码结果:</div>
      <div class="scan-result-value">{{ scanResult || '等待扫码...' }}</div>
      <div v-if="scanTimestamp" class="scan-result-time">
        扫码时间: {{ formatTime(scanTimestamp) }}
      </div>
    </div>
    
    <div class="scan-history">
      <h3>扫码历史 (最近10条)</h3>
      <ul v-if="scanHistory.length > 0">
        <li v-for="(item, index) in scanHistory" :key="index">
          <span class="scan-history-code">{{ item.barcode }}</span>
          <span class="scan-history-time">{{ formatTime(item.timestamp) }}</span>
        </li>
      </ul>
      <div v-else class="scan-history-empty">
        暂无扫码记录
      </div>
    </div>
    
    <div class="scan-actions">
      <button @click="clearScanResult" class="scan-action-button">
        清除结果
      </button>
      <!-- <button @click="mockScan" class="scan-action-button"> -->
        <!-- 模拟扫码 -->
      <!-- </button> -->
    </div>
    
    <div class="scan-tips">
      <h3>使用说明</h3>
      <p>1. 使用优博讯PDA的扫码功能扫描条码</p>
      <p>2. 扫码结果将自动显示在上方</p>
      <p>3. 最近的10条扫码记录将保存在历史记录中</p>
    </div>
  </div>
</template>

<script>
import { onMounted, onUnmounted, ref } from 'vue';
import { initScanListener, removeScanListener, onScanResult, mockScanResult } from '@/utils/scan-code-handler';

export default {
  name: 'ScanCodeDemo',
  
  setup() {
    // 响应式数据
    const scanResult = ref('');
    const scanTimestamp = ref(null);
    const scanHistory = ref([]);
    
    // 取消扫码监听的函数
    let unsubscribe = null;
    
    // 处理扫码结果
    const handleScanResult = (barcode, data) => {
      scanResult.value = barcode;
      scanTimestamp.value = data.timestamp;
      
      // 添加到历史记录
      scanHistory.value.unshift({
        barcode,
        timestamp: data.timestamp,
        isMock: data.isMock || false
      });
      
      // 只保留最近10条记录
      if (scanHistory.value.length > 10) {
        scanHistory.value = scanHistory.value.slice(0, 10);
      }
    };
    
    // 清除扫码结果
    const clearScanResult = () => {
      scanResult.value = '';
      scanTimestamp.value = null;
    };
    
    // 模拟扫码
    const mockScan = () => {
      const mockCodes = [
        'MOCK123456789',
        'PRODUCT-A-123',
        'ITEM-B-456',
        'TEST-BARCODE-789',
        'QR-CODE-EXAMPLE'
      ];
      
      // 随机选择一个模拟码
      const randomCode = mockCodes[Math.floor(Math.random() * mockCodes.length)];
      mockScanResult(randomCode);
    };
    
    // 格式化时间戳
    const formatTime = (timestamp) => {
      if (!timestamp) return '';
      
      const date = new Date(timestamp);
      return date.toLocaleString();
    };
    
    // 组件挂载时初始化
    onMounted(() => {
      // 初始化扫码监听
      initScanListener();
      
      // 注册扫码结果回调
      unsubscribe = onScanResult(handleScanResult);
    });
    
    // 组件卸载时清理
    onUnmounted(() => {
      // 取消扫码结果回调
      if (unsubscribe) {
        unsubscribe();
      }
      
      // 移除扫码监听
      removeScanListener();
    });
    
    return {
      scanResult,
      scanTimestamp,
      scanHistory,
      clearScanResult,
      mockScan,
      formatTime
    };
  }
};
</script>

<style scoped>
.scan-code-demo {
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.scan-result-container {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.scan-result-label {
  font-weight: bold;
  margin-bottom: 8px;
}

.scan-result-value {
  font-size: 18px;
  word-break: break-all;
  padding: 8px;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #ddd;
  min-height: 24px;
}

.scan-result-time {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}

.scan-history {
  margin-bottom: 20px;
}

.scan-history h3 {
  margin-bottom: 8px;
}

.scan-history ul {
  list-style: none;
  padding: 0;
  margin: 0;
  background-color: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.scan-history li {
  padding: 8px 16px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
}

.scan-history li:last-child {
  border-bottom: none;
}

.scan-history-code {
  font-weight: bold;
}

.scan-history-time {
  font-size: 12px;
  color: #666;
}

.scan-history-empty {
  padding: 16px;
  text-align: center;
  color: #999;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.scan-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.scan-action-button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

.scan-action-button:hover {
  background-color: #0056b3;
}

.scan-tips {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.scan-tips h3 {
  margin-top: 0;
  margin-bottom: 8px;
}

.scan-tips p {
  margin: 4px 0;
}
</style>
