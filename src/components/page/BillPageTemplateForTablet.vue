<!-- 单据页面模板组件(平板) -->

<template>
  <div class="bill-page__container">
    <DockPanel>
      <DockItem dock="top">
        <DockPanel>
          <DockItem>
            <div class="bill-page__toolbar-container">
              <!-- 返回按钮 -->
              <div class="back-button" @click="goBack">
                <i class="el-icon-arrow-left"></i>
                <span>返回</span>
              </div>
              <!-- 工具栏插槽 - 添加横向滚动能力 -->
              <div class="bill-page__toolbar-scroll">
                <slot name="toolbar"></slot>
              </div>
            </div>
          </DockItem>
        </DockPanel>
      </DockItem>

      <!-- 页面标题和审批状态 -->
      <DockItem dock="top" class="header-panel-container">
        <div class="bill-page__title-row">
          <div class="bill-page__title-section">
            <!-- 页面名称插槽 -->
            <slot name="page-title"></slot>
          </div>
          <div class="bill-page__status-section">
            <!-- 审批状态插槽 -->
            <slot name="approval-status"></slot>
          </div>
        </div>
      </DockItem>

      <DockItem dock="fill">
        <div class="bill-page__page-content" ref="pageContent" @scroll="handlePageScroll">
          <div class="bill-page__full-content">
            <!-- 控件面板区域 -->
            <div class="bill-page__control-panel">
              <slot name="control-panel"></slot>
            </div>

            <!-- 卡片列表区域 -->
            <div class="bill-page__card-list">
              <slot name="card-list"></slot>
            </div>
          </div>

          <!-- 回到顶部按钮 -->
          <div v-if="showBackToTop" class="back-to-top" @click="scrollToTop">
            <van-icon name="arrow-up" />
          </div>
        </div>
      </DockItem>
    </DockPanel>
  </div>
</template>

<script>
import DockItem from '@/components/dock/DockItem.vue';
import DockPanel from '@/components/dock/DockPanel.vue';

export default {
  name: 'BillPageTemplateForTablet',
  components: {
    DockPanel,
    DockItem
  },
  props: {
    isWideScreenMode: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      showBackToTop: false,
      scrollPosition: 0
    };
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    handlePageScroll(e) {
      // 如果滚动距离超过100px，显示回到顶部按钮
      if (e.target.scrollTop > 100) {
        this.showBackToTop = true;
      } else {
        this.showBackToTop = false;
      }

      // 保存当前滚动位置
      this.scrollPosition = e.target.scrollTop;

      // 触发滚动事件，让父组件可以响应
      this.$emit('page-scroll', this.scrollPosition);
    },
    scrollToTop() {
      const pageContent = this.$refs.pageContent;
      if (pageContent) {
        // 使用平滑滚动效果
        pageContent.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    },
    // 暴露给父组件的滚动方法
    scrollTo(position) {
      const pageContent = this.$refs.pageContent;
      if (pageContent) {
        pageContent.scrollTop = position;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/assets/style/custom-viewport.scss';

/* 页面容器样式 */
.bill-page__container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

/* 标题行样式 */
.bill-page__title-row {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: vh(0.5) vw(2.93);
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(vh(0.39));
  border-bottom: vh(0.13) solid #f0f0f0;
  position: relative;
}

/* 标题部分 */
.bill-page__title-section {
  text-align: center;
}

/* 审批状态部分 */
.bill-page__status-section {
  position: absolute;
  right: 35%;
}

/* 固定头部面板容器样式 */
.header-panel-container {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(vh(0.39));
  border-bottom: vh(0.13) solid #f0f0f0;
  box-shadow: 0 vh(0.39) vh(1.3) rgba(0, 0, 0, 0.08);
  z-index: 10;
}

/* 页面内容区域 */
.bill-page__page-content {
  background-color: #f8f9fa;
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain; /* 防止滚动穿透 */
  -webkit-overflow-scrolling: touch; /* 增强移动端滚动体验 */
  padding: vh(1) vw(1.5);

  &::-webkit-scrollbar {
    width: vh(0.52);
  }

  &::-webkit-scrollbar-track {
    background: #f8f9fa;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: vh(0.26);
  }
}

.bill-page__full-content {
  // max-width: 1200px;
  // margin: 0 auto;
  display: flex;
  flex-direction: column;
  // gap: vh(2.6);
  height: 100%; /* 确保高度填满父容器 */
}

/* 控件面板区域 */
.bill-page__control-panel {
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: vh(2.08);
  box-shadow: 0 vh(0.39) vh(1.3) rgba(0, 0, 0, 0.08);
  overflow: hidden;
  // padding: vh(1.56) vw(1.95);
}

/* 卡片列表区域 */
.bill-page__card-list {
  display: flex;
  flex-direction: column;
  gap: vh(2.6);
  flex: 1;
  min-height: 0; /* 确保flex子元素可以正确滚动 */
  overflow-y: auto;
  overscroll-behavior: contain; /* 防止滚动穿透 */
  -webkit-overflow-scrolling: touch; /* 增强移动端滚动体验 */
}

/* 回到顶部按钮 */
.back-to-top {
  position: fixed;
  bottom: vh(2.6);
  right: vw(2.93);
  width: vh(5.21);
  height: vh(5.21);
  border-radius: 50%;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 vh(0.52) vh(1.3) rgba(0, 0, 0, 0.15);
  cursor: pointer;
  z-index: 100;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-vh(0.52));
    box-shadow: 0 vh(0.78) vh(1.56) rgba(0, 0, 0, 0.2);
  }

  .van-icon {
    font-size: vh(2.08);
  }
}

/* 工具栏容器样式 */
.bill-page__toolbar-container {
  display: flex;
  align-items: center;
  width: 100%;
}

/* 工具栏滚动区域 */
.bill-page__toolbar-scroll {
  flex: 1;
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch; /* 增强iOS滚动体验 */
  scroll-behavior: smooth; /* 平滑滚动效果 */
  padding: vh(0.65) 0;
  
  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    height: vh(0.52); /* 4px -> 0.52vh (4/768*100) */
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(240, 240, 240, 0.6);
    border-radius: vh(0.26); /* 2px -> 0.26vh (2/768*100) */
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(180, 180, 180, 0.6);
    border-radius: vh(0.26); /* 2px -> 0.26vh (2/768*100) */
    transition: background 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    
    &:hover {
      background: rgba(150, 150, 150, 0.8);
    }
  }
}

/* 返回按钮样式 */
.back-button {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: vh(0.78) vw(0.98);
  border-radius: vh(0.52);
  transition: background-color 0.2s ease;
  margin-right: vw(1.46);

  &:hover {
    background-color: rgba(30, 60, 114, 0.05);
  }

  i {
    font-size: vh(1.82);
    color: #1e3c72;
    margin-right: vw(0.49);
  }

  span {
    font-size: vh(1.56);
    color: #1e3c72;
    font-weight: 500;
  }
}

/* 宽屏模式下内容区域调整 */
@media screen and (min-width: 800px) {
  .bill-page__page-content {
    padding-top: vh(1.04);
  }
}

/* 窄屏模式下内容区域调整 */
@media screen and (max-width: 799px) {
  .bill-page__page-content {
    height: 100% !important; /* 保持固定高度以支持滚动 */
    overflow-y: auto; /* 确保可以滚动 */
  }

  .bill-page__toolbar-scroll {
    padding: vh(0.39) 0;
    
    /* 在小屏幕上隐藏滚动条但保持功能 */
    &::-webkit-scrollbar {
      height: vh(0.26); /* 2px -> 0.26vh (2/768*100) */
    }
  }

  .bill-page__control-panel {
    flex-shrink: 0; /* 防止控件面板被压缩 */
  }

  .bill-page__card-list {
    flex: 1; /* 让卡片列表占据剩余空间 */
    overflow-y: auto; /* 确保可以滚动 */
  }
}
</style>