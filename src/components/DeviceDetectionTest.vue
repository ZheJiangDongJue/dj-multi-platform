<template>
  <div class="device-detection-test">
    <h2>设备检测测试</h2>
    
    <div class="info-card">
      <h3>检测结果</h3>
      <div class="result-box" :class="deviceType">
        <span class="device-type">{{ deviceTypeText }}</span>
      </div>
      
      <div class="details">
        <h4>设备详细信息</h4>
        <div class="detail-item">
          <span class="label">屏幕宽度:</span>
          <span class="value">{{ deviceInfo.screenWidth }}px</span>
        </div>
        <div class="detail-item">
          <span class="label">屏幕高度:</span>
          <span class="value">{{ deviceInfo.screenHeight }}px</span>
        </div>
        <div class="detail-item">
          <span class="label">设备像素比:</span>
          <span class="value">{{ deviceInfo.pixelRatio }}</span>
        </div>
        <div class="detail-item">
          <span class="label">是否安卓:</span>
          <span class="value">{{ deviceInfo.isAndroid ? '是' : '否' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">是否iOS:</span>
          <span class="value">{{ deviceInfo.isIOS ? '是' : '否' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">明确标识为移动设备:</span>
          <span class="value">{{ deviceInfo.isMobileExplicit ? '是' : '否' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">明确标识为平板:</span>
          <span class="value">{{ deviceInfo.isTabletExplicit ? '是' : '否' }}</span>
        </div>
      </div>
      
      <div class="user-agent">
        <h4>User Agent</h4>
        <div class="ua-text">{{ deviceInfo.userAgent }}</div>
      </div>
    </div>
    
    <div class="actions">
      <button @click="refreshInfo" class="refresh-btn">刷新信息</button>
    </div>
  </div>
</template>

<script>
import detectDeviceHelper from '@/utils/multi-platform';

export default {
  name: 'DeviceDetectionTest',
  
  data() {
    return {
      deviceType: '',
      deviceInfo: {}
    };
  },
  
  computed: {
    deviceTypeText() {
      switch(this.deviceType) {
        case 'mobile':
          return '手机';
        case 'tablet':
          return '平板';
        case 'desktop':
          return '桌面';
        default:
          return '未知';
      }
    }
  },
  
  created() {
    this.updateDeviceInfo();
    
    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize);
  },
  
  beforeDestroy() {
    // 移除事件监听器
    window.removeEventListener('resize', this.handleResize);
  },
  
  methods: {
    updateDeviceInfo() {
      this.deviceType = detectDeviceHelper.detectDeviceType();
      this.deviceInfo = detectDeviceHelper.getDeviceInfo();
    },
    
    handleResize() {
      this.updateDeviceInfo();
    },
    
    refreshInfo() {
      this.updateDeviceInfo();
    }
  }
};
</script>

<style scoped>
.device-detection-test {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.info-card {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.result-box {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
  border-radius: 8px;
  margin: 20px 0;
  font-size: 24px;
  font-weight: bold;
}

.result-box.mobile {
  background-color: #ffecb3;
  color: #ff6f00;
}

.result-box.tablet {
  background-color: #b3e5fc;
  color: #0277bd;
}

.result-box.desktop {
  background-color: #c8e6c9;
  color: #2e7d32;
}

.details {
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  margin-bottom: 8px;
}

.label {
  flex: 0 0 200px;
  font-weight: bold;
}

.user-agent {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ddd;
}

.ua-text {
  word-break: break-all;
  background-color: #eee;
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
}

.actions {
  display: flex;
  justify-content: center;
}

.refresh-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.refresh-btn:hover {
  background-color: #388e3c;
}
</style>
