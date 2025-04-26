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
      deviceType: ''
    };
  },
  async created() {
    // 检测设备类型
    this.deviceType = detectDeviceHelper.detectDeviceType();
    console.log('当前设备类型:', this.deviceType);
    
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
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    // 移除事件监听器
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    async handleResize() {
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
