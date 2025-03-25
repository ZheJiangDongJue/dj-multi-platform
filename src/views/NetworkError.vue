<template>
  <div class="network-error-container">
    <div class="network-error-box">
      <!-- <img alt="网络错误" src="../assets/network-error.svg" class="error-image" /> -->
      <h1>哎呀！网络开小差了</h1>
      <p>我们无法连接到服务器，请检查您的网络连接或稍后再试</p>
      <button @click="retryConnection" class="retry-button">
        <span class="button-icon">↻</span>
        <span>重新连接</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NetworkError',
  methods: {
    retryConnection() {
      // 检查网络连接
      if (navigator.onLine) {
        // 如果已经恢复连接，返回上一页或首页
        if (this.$route.query.from) {
          this.$router.push(this.$route.query.from);
        } else {
          this.$router.push('/home');
        }
      } else {
        // 仍然离线，显示提示
        this.$message.error('网络仍然未连接，请检查您的网络设置');
      }
    }
  }
}
</script>

<style scoped>
.network-error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(120deg, #f0f2f5, #e6f7ff);
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

.network-error-box {
  padding: 50px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  text-align: center;
  max-width: 500px;
  width: 90%;
  transition: all 0.3s ease;
}

.network-error-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
}

.error-image {
  width: 180px;
  margin-bottom: 30px;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
  100% {
    transform: translateY(0px);
  }
}

h1 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 28px;
  font-weight: 600;
}

p {
  color: #5e6d82;
  margin-bottom: 40px;
  font-size: 18px;
  line-height: 1.6;
}

.retry-button {
  padding: 14px 32px;
  background: linear-gradient(135deg, #42b983, #2c3e50);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.3);
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(66, 185, 131, 0.4);
  background: linear-gradient(135deg, #3eac7a, #243342);
}

.button-icon {
  font-size: 22px;
  margin-right: 10px;
  animation: spin 2s linear infinite paused;
}

.retry-button:hover .button-icon {
  animation-play-state: running;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 600px) {
  .network-error-box {
    padding: 30px 20px;
  }
  
  .error-image {
    width: 140px;
  }
  
  h1 {
    font-size: 24px;
  }
  
  p {
    font-size: 16px;
    margin-bottom: 30px;
  }
  
  .retry-button {
    padding: 12px 24px;
    font-size: 16px;
  }
}
</style> 