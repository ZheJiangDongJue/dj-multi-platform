<template>
  <component :is="currentComponent" />
</template>

<script>
import detectDeviceHelper from '@/utils/multi-platform';
import TabletProcessAssemblyFlowBill from '@/views/tablet/technology/ProcessAssemblyFlow/ProcessAssemblyFlowBill.vue';

export default {
  name: 'ProcessAssemblyFlowBillWrapper',
  data() {
    return {
      currentComponent: null,
      deviceType: '',
      lastWidth: 0,
      lastHeight: 0,
      resizeTimeout: null,
      initialOrientation: window.orientation
    };
  },
  async created() {
    // 检测设备类型
    this.deviceType = detectDeviceHelper.detectDeviceType();
    console.log('当前设备类型:', this.deviceType);
    this.currentComponent = TabletProcessAssemblyFlowBill;
    
    // 记录初始尺寸
    this.lastWidth = window.innerWidth;
    this.lastHeight = window.innerHeight;
    
    // 根据设备类型动态加载对应组件
    if (this.deviceType === 'mobile') {
      // 动态导入移动端组件
      const MobileComponent = await import('@/views/mobile/technology/ProcessAssemblyFlow/ProcessAssemblyFlowBill.vue');
      this.currentComponent = MobileComponent.default;
    } else {
      // 平板或桌面端使用平板组件
      this.currentComponent = TabletProcessAssemblyFlowBill;
    }
  },
  mounted() {
    // 监听窗口大小变化，重新检测设备类型
    window.addEventListener('resize', this.debouncedHandleResize);
    
    // 监听设备旋转事件
    window.addEventListener('orientationchange', this.handleOrientationChange);
  },
  beforeDestroy() {
    // 移除事件监听器
    window.removeEventListener('resize', this.debouncedHandleResize);
    window.removeEventListener('orientationchange', this.handleOrientationChange);
    
    // 清除可能存在的定时器
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
  },
  methods: {
    // 防抖处理，避免频繁触发重新检测
    debouncedHandleResize() {
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }
      
      this.resizeTimeout = setTimeout(() => {
        this.handleResize();
      }, 300); // 300ms防抖时间
    },
    
    // 处理屏幕旋转事件
    handleOrientationChange() {
      console.log('设备旋转事件触发');
      // 旋转事件发生后，需要重新检测设备类型
      // 通常需要等待旋转动画完成
      setTimeout(() => {
        this.lastWidth = window.innerWidth;
        this.lastHeight = window.innerHeight;
        this.handleDeviceTypeChange();
      }, 300);
    },
    
    // 处理窗口大小变化
    handleResize() {
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;
      
      // 判断是否为输入法弹出引起的大小变化
      // 输入法弹出通常只改变高度，且宽度几乎不变
      const isKeyboardChange = Math.abs(currentWidth - this.lastWidth) < 10 && 
                               Math.abs(currentHeight - this.lastHeight) > 100;
      
      if (isKeyboardChange) {
        console.log('检测到输入法弹出/收起，不触发设备类型检测');
        return; // 如果是输入法弹出，不重新检测设备类型
      }
      
      // 更新记录的尺寸
      this.lastWidth = currentWidth;
      this.lastHeight = currentHeight;
      
      // 处理设备类型变化
      this.handleDeviceTypeChange();
    },
    
    // 处理设备类型变化
    async handleDeviceTypeChange() {
      // 重新检测设备类型
      const newDeviceType = detectDeviceHelper.detectDeviceType();
      
      // 如果设备类型发生变化，重新加载对应组件
      if (newDeviceType !== this.deviceType) {
        this.deviceType = newDeviceType;
        console.log('设备类型已变更为:', this.deviceType);
        
        if (this.deviceType === 'mobile') {
          // 动态导入移动端组件
          const MobileComponent = await import('@/views/mobile/technology/ProcessAssemblyFlow/ProcessAssemblyFlowBill.vue');
          this.currentComponent = MobileComponent.default;
        } else {
          // 平板或桌面端使用平板组件
          this.currentComponent = TabletProcessAssemblyFlowBill;
        }
      }
    }
  }
};
</script>
