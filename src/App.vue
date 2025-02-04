<template>
  <div id="app_root">
    <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <router-view />
    <!-- <loading /> -->
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
// import loading from '@/components/loading'

export default {
  name: 'App',
  components: {
    // HelloWorld,
    // loading,
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
  /* margin-top: 60px; */
}
</style>
