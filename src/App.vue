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

export default {
  name: 'App',
  components: {
    // HelloWorld,
    loading,
  },
  mounted() {
    console.log('App mounted');
    this.commitIsLoading(false);
  }
}
</script>

<style>
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
}
</style>
