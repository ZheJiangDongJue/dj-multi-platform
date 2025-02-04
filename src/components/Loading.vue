<template>
    <div v-if="isLoading" id="loading">
      <div id="loading-content">
        <img id="loading-content-img" src="@/assets/gif/loading.gif" alt="" />
        <!--<p id="loading-content-text">加载中...</p>-->
      </div>
    </div>
  </template>
  
  <script>
  import { mapGetters } from 'vuex'
  export default {
    name:'Loading',
    data() {
      return {}
    },
    computed: {
      ...mapGetters(['isLoading'])
    }
  }
  </script>
  
  <style lang="scss">
  #loading {
    position: fixed;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    background: rgba(#fff, 0.5);
    z-index: 9999;
    &-content {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      align-items: center;
      flex-direction: column;
      &-img {
        width: 50px;
        height: auto;
      }
      &-text {
        color: white;
        font-size: 24px;
        margin-top: 20px;
      }
    }
  }
  // .loading-fade-enter-active {
  //   animation: loading-fade-in .3s ease;
  // }
  
  // .loading-fade-leave-active {
  //   animation: loading-fade-out .3s ease;
  // }
  // @keyframes loading-fade-in {
  //   0% {
  //     opacity: 0;
  //   }
  //   100% {
  //     opacity: 1;
  //   }
  // }
  
  // @keyframes loading-fade-out {
  //   0% {
  //     opacity: 1;
  //   }
  //   100% {
  //     opacity: 0;
  //   }
  // }
  </style>
  