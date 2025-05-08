<template>
    <div v-if="isLoading" id="loading">
      <div id="loading-content" class="animate-fix">
        <img id="loading-content-img" src="@/assets/gif/loading.gif" alt="" />
        <!--<p id="loading-content-text">加载中...</p>-->
      </div>
    </div>
  </template>
  
  <script>
  import { mapGetters } from 'vuex'
  export default {
    name:'LoadingComponent',
    data() {
      return {}
    },
    computed: {
      ...mapGetters(['isLoading'])
    }
  }
  </script>
  
  <style lang="scss">
  @import '@/assets/style/custom-viewport.scss';
  
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
      transform: translate3d(-50%, -50%, 0);
      -webkit-transform: translate3d(-50%, -50%, 0);
      display: flex;
      align-items: center;
      flex-direction: column;
      &-img {
        width: vh(6.5); /* 50px -> 6.5vh (50/768*100) */
        height: auto;
      }
      &-text {
        color: white;
        font-size: vh(3.13); /* 24px -> 3.13vh (24/768*100) */
        margin-top: vh(2.6); /* 20px -> 2.6vh (20/768*100) */
      }
    }
  }
  /* 启用注释部分，优化动画效果 */
  .loading-fade-enter-active {
    animation: loading-fade-in 0.3s ease-out;
    -webkit-animation: loading-fade-in 0.3s ease-out;
  }
  
  .loading-fade-leave-active {
    animation: loading-fade-out 0.3s ease-out;
    -webkit-animation: loading-fade-out 0.3s ease-out;
  }
  
  @keyframes loading-fade-in {
    0% {
      opacity: 0;
      transform: translateY(vh(1.3));
      -webkit-transform: translateY(vh(1.3));
    }
    100% {
      opacity: 1;
      transform: translateY(0);
      -webkit-transform: translateY(0);
    }
  }
  
  @keyframes loading-fade-out {
    0% {
      opacity: 1;
      transform: translateY(0);
      -webkit-transform: translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateY(vh(1.3));
      -webkit-transform: translateY(vh(1.3));
    }
  }
  
  /* 添加webkit前缀的动画 */
  @-webkit-keyframes loading-fade-in {
    0% {
      opacity: 0;
      transform: translateY(vh(1.3));
      -webkit-transform: translateY(vh(1.3));
    }
    100% {
      opacity: 1;
      transform: translateY(0);
      -webkit-transform: translateY(0);
    }
  }
  
  @-webkit-keyframes loading-fade-out {
    0% {
      opacity: 1;
      transform: translateY(0);
      -webkit-transform: translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateY(vh(1.3));
      -webkit-transform: translateY(vh(1.3));
    }
  }
  </style>
  