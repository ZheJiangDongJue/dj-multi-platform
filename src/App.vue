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
    
    this.commitIsLoading(false);
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
}
</style>
