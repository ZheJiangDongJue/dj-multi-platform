<template>
  <div class="logout-container">
    <div class="logout-content">
      <div class="loading-icon"></div>
      <div class="logout-message">正在安全退出系统...</div>
    </div>
  </div>
</template>

<script>
import { logout } from '@/utils/session-manager';

export default {
  name: 'LogoutPage',
  created() {
    // 在组件创建时立即执行退出登录操作
    this.$nextTick(() => {
      // 使用setTimeout确保视觉上有一个短暂的过渡效果
      setTimeout(() => {
        // 调用logout函数进行登出操作
        logout();
        // 显示退出登录成功消息
        this.$message({
          type: 'success',
          message: '已安全退出登录'
        });
      }, 800);
    });
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/style/custom-viewport.scss';

.logout-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
}

.logout-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(vh(0.39));
  border-radius: vh(1.56);
  padding: vh(3.9) vw(5.86);
  box-shadow: 0 vh(0.78) vh(1.56) rgba(0, 0, 0, 0.15);
  animation: fade-in 0.5s ease-out;
}

.loading-icon {
  width: vh(5.21);
  height: vh(5.21);
  border: vh(0.52) solid rgba(30, 60, 114, 0.1);
  border-top: vh(0.52) solid #1e3c72;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: vh(2.08);
}

.logout-message {
  font-size: vh(2.08);
  color: #333;
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(vh(1.3)); }
  to { opacity: 1; transform: translateY(0); }
}
</style> 