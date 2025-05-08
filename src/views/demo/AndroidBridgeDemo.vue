<template>
  <div class="android-bridge-demo">
    <h3>Android 桥接示例</h3>
    
    <div class="debug-panel">
      <h4>调试信息</h4>
      <div class="debug-info">
        <p>桥接状态: <span :class="bridgeStatus ? 'success' : 'error'">{{ bridgeStatus ? '正常' : '未连接' }}</span></p>
        <p>Android环境: <span :class="isAndroid ? 'success' : 'error'">{{ isAndroid ? '是' : '否' }}</span></p>
        <p>用户代理: <small>{{ userAgent }}</small></p>
      </div>
      <div class="debug-buttons">
        <van-button size="small" type="primary" @click="checkBridge">检测桥接</van-button>
        <van-button size="small" type="primary" @click="testBridge">测试桥接</van-button>
      </div>
    </div>
    
    <div class="action-buttons">
      <van-button type="primary" @click="takePhoto">拍照</van-button>
      <van-button type="primary" @click="pickImage">选择图片</van-button>
      <van-button type="primary" @click="scanQRCode">扫描二维码</van-button>
      <van-button type="primary" @click="getDeviceInfo">获取设备信息</van-button>
      <van-button type="primary" @click="showToast">显示Toast</van-button>
      <van-button type="primary" @click="setTitle">设置标题</van-button>
      <van-button type="primary" @click="goBack">返回</van-button>
    </div>
    
    <div class="result-area" v-if="result">
      <h4>操作结果：</h4>
      <pre>{{ JSON.stringify(result, null, 2) }}</pre>
    </div>
    
    <h4>Android通知事件：</h4>
    <ul class="notification-list">
      <li v-for="(notification, index) in notifications" :key="index">
        <p>类型: {{ notification.type }}</p>
        <p>数据: {{ JSON.stringify(notification.data) }}</p>
        <p class="time">时间: {{ notification.time }}</p>
      </li>
    </ul>
  </div>
</template>

<script>
import androidBridgeDebug from '@/utils/android-bridge-debug';

export default {
  name: 'AndroidBridgeDemo',
  
  data() {
    return {
      result: null,
      notifications: [],
      isAndroid: false,
      bridgeStatus: false,
      userAgent: navigator.userAgent
    };
  },
  
  created() {
    // 监听Android通知事件
    this.$EventBus.$on('android-notification', this.handleAndroidNotification);
    
    // 检查是否在Android环境中
    this.isAndroid = navigator.userAgent.indexOf('Android') > -1 || window.android !== undefined;
    
    // 检查桥接状态
    this.bridgeStatus = typeof window.android !== 'undefined' && typeof window.android.receiveMessage === 'function';
  },
  
  mounted() {
    // 初始化调试工具
    androidBridgeDebug.init();
    
    // 在组件挂载后，自动检查桥接状态
    this.checkBridge();
  },
  
  beforeDestroy() {
    // 移除事件监听
    this.$EventBus.$off('android-notification', this.handleAndroidNotification);
  },
  
  methods: {
    /**
     * 检查桥接状态
     */
    async checkBridge() {
      try {
        // 使用新增的桥接检查方法
        const status = await this.$android.checkBridge();
        this.isAndroid = navigator.userAgent.indexOf('Android') > -1;
        this.bridgeStatus = status.success;
        
        if (status.success) {
          this.result = {
            message: '桥接检查成功',
            ...status
          };
        } else {
          this.result = {
            message: '桥接检查失败',
            ...status
          };
          
          // 如果在Android环境但桥接失败，尝试自动修复
          if (this.isAndroid && !this.bridgeStatus) {
            this.fixBridgeConnection();
          }
        }
      } catch (error) {
        console.error('检查桥接状态失败:', error);
        this.result = { error: error.message };
      }
    },
    
    /**
     * 测试桥接功能
     */
    testBridge() {
      try {
        androidBridgeDebug.test();
        this.showToast();
      } catch (error) {
        console.error('测试桥接失败:', error);
        this.result = { error: error.message };
      }
    },
    
    /**
     * 尝试修复桥接连接
     */
    fixBridgeConnection() {
      try {
        // 如果WebView没有正确注入android对象，尝试通过prompt机制与原生通信
        const testMessage = {
          action: 'bridgeCheck',
          data: { timestamp: Date.now() },
          callbackId: 'fix_bridge_' + Date.now()
        };
        
        // 注册回调函数
        window[testMessage.callbackId] = (result) => {
          delete window[testMessage.callbackId];
          this.bridgeStatus = true;
          this.result = { success: true, message: '桥接连接已修复', result };
        };
        
        // 尝试通过prompt调用原生方法
        const promptResult = prompt('AndroidBridge', JSON.stringify(testMessage));
        if (promptResult) {
          window[testMessage.callbackId](promptResult);
        }
      } catch (error) {
        console.error('修复桥接失败:', error);
      }
    },
    
    /**
     * 处理Android通知事件
     */
    handleAndroidNotification(data) {
      this.notifications.unshift({
        ...data,
        time: new Date().toLocaleTimeString()
      });
      
      // 保持通知列表不超过10条
      if (this.notifications.length > 10) {
        this.notifications.pop();
      }
    },
    
    /**
     * 调用Android相机拍照
     */
    async takePhoto() {
      try {
        if (!this.bridgeStatus) {
          throw new Error('Android桥接未连接');
        }
        this.result = await this.$android.takePhoto();
      } catch (error) {
        this.result = { error: error.message };
      }
    },
    
    /**
     * 调用Android相册选择图片
     */
    async pickImage() {
      try {
        if (!this.bridgeStatus) {
          throw new Error('Android桥接未连接');
        }
        this.result = await this.$android.pickImage();
      } catch (error) {
        this.result = { error: error.message };
      }
    },
    
    /**
     * 调用Android扫描二维码
     */
    async scanQRCode() {
      try {
        if (!this.bridgeStatus) {
          throw new Error('Android桥接未连接');
        }
        this.result = await this.$android.scanQRCode();
      } catch (error) {
        this.result = { error: error.message };
      }
    },
    
    /**
     * 获取Android设备信息
     */
    async getDeviceInfo() {
      try {
        if (!this.bridgeStatus) {
          throw new Error('Android桥接未连接');
        }
        this.result = await this.$android.getDeviceInfo();
      } catch (error) {
        this.result = { error: error.message };
      }
    },
    
    /**
     * 显示Android Toast消息
     */
    async showToast() {
      try {
        if (!this.bridgeStatus) {
          throw new Error('Android桥接未连接');
        }
        this.result = await this.$android.showToast('这是一条来自网页的消息', 'short');
      } catch (error) {
        this.result = { error: error.message };
      }
    },
    
    /**
     * 设置Android应用标题
     */
    async setTitle() {
      try {
        if (!this.bridgeStatus) {
          throw new Error('Android桥接未连接');
        }
        this.result = await this.$android.setTitle('Android桥接示例');
      } catch (error) {
        this.result = { error: error.message };
      }
    },
    
    /**
     * 返回上一级
     */
    async goBack() {
      try {
        if (!this.bridgeStatus) {
          throw new Error('Android桥接未连接');
        }
        this.result = await this.$android.goBack();
      } catch (error) {
        this.result = { error: error.message };
      }
    }
  }
};
</script>

<style scoped>
.android-bridge-demo {
  padding: 20px;
}

.debug-panel {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  border-left: 3px solid #2196F3;
}

.debug-info {
  margin-bottom: 10px;
}

.debug-info p {
  margin: 5px 0;
}

.debug-buttons {
  display: flex;
  gap: 10px;
}

.success {
  color: #4CAF50;
  font-weight: bold;
}

.error {
  color: #F44336;
  font-weight: bold;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.result-area {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.notification-list {
  list-style: none;
  padding: 0;
}

.notification-list li {
  background-color: #f9f9f9;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  border-left: 3px solid #2196F3;
}

.notification-list .time {
  color: #999;
  font-size: 12px;
  text-align: right;
}
</style> 