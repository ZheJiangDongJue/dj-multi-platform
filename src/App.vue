<template>
  <div id="app_root" style="width:100%;height:100%">
    <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <router-view />
    <loading />
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
import loading from '@/components/Loading.vue'
import { initViewportUnits } from '@/utils/viewport-units'

export default {
  name: 'App',
  components: {
    // HelloWorld,
    loading,
  },
  mounted() {
    console.log('App mounted');
    
    // 初始化固定的viewport单位
    initViewportUnits();
    
    // 监听屏幕尺寸变化，重新计算视口单位
    window.addEventListener('resize', this.handleResize);
    
    this.commitIsLoading(false);
  },
  methods: {
    handleResize() {
      // 延迟执行以防止输入法弹出导致的频繁计算
      if (this.resizeTimer) clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        // 重新初始化视口单位
        initViewportUnits();
      }, 300);
    }
  },
  beforeDestroy() {
    // 移除事件监听器
    window.removeEventListener('resize', this.handleResize);
  }
}
</script>

<style>
@import '@/assets/style/custom-viewport.scss';

#app_root {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /* margin-top: 7.81vh; (60px -> 7.81vh) */
}

body {
  overflow: hidden;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

html {
  width: 100%;
  height: 100%;
  -webkit-text-size-adjust: none;
  -moz-text-size-adjust: none;
  -ms-text-size-adjust: none;
  text-size-adjust: none;
}

/* 全局应用硬件加速，修复安卓渲染问题 */
.animate-fix {
  -webkit-transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  -webkit-perspective: 1000;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000;
  will-change: transform;
}

/* 强制使用整数像素值和简化的动画曲线，修复抖动问题 */
* {
  /* 将所有过渡动画设置为更平滑的曲线 */
  -webkit-transition-timing-function: ease-out !important;
  transition-timing-function: ease-out !important;
}

/* 修复安卓动画抖动问题 */
* {
  /* 确保位置更新在整数像素上 */
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

/* 修复移动设备上的点击延迟 */
* {
  touch-action: manipulation;
}

/* 修复安卓上滚动卡顿问题 */
.smooth-scroll {
  -webkit-overflow-scrolling: touch;
  overflow-scrolling: touch;
}
</style>
