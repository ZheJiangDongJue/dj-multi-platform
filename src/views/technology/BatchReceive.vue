<template>
    <van-dialog
      v-model="show"
      title="批量接收"
      show-cancel-button
      :lazy-render="false"
      confirm-button-text="确认审批"
      class="custom-dialog"
    >
      <div class="dialog-content">
        <!-- 全选 & 批量删除 -->
        <div class="action-bar">
          <van-checkbox v-model="isAllSelected" @click="toggleSelectAll">全选</van-checkbox>
          <van-button type="danger" size="small" @click="batchRemove">批量删除</van-button>
        </div>
  
        <!-- 卡片列表 -->
        <van-checkbox-group v-model="selectedCards">
          <div class="card-list">
            <div v-for="(item, index) in cardList" :key="index" class="card-item">
              <van-checkbox :name="index" class="card-checkbox"></van-checkbox>
              <van-card
                :num="item.num"
                :tag="item.tag"
                :price="item.price"
                :desc="item.desc"
                :title="item.title"
                :thumb="item.thumb"
                :origin-price="item.originPrice"
                class="custom-card"
              >
                <template #footer>
                  <van-button 
                    type="danger" 
                    size="small" 
                    @click.stop="removeCard(index)"
                  >
                    删除
                  </van-button>
                </template>
              </van-card>
            </div>
          </div>
        </van-checkbox-group>
      </div>
    </van-dialog>
  </template>
  
  
  <script>
  export default {
    name: "TestPageComponent",
    data() {
      return {
        show: false, // 默认隐藏对话框
        selectedCards: [], // 选中的卡片索引
        cardList: [
          { num: "2", tag: "标签", price: "2.00", desc: "描述信息", title: "物料", },
          { num: "2", tag: "标签", price: "2.00", desc: "描述信息", title: "物料", },
          { num: "2", tag: "标签", price: "2.00", desc: "描述信息", title: "物料", },
          { num: "2", tag: "标签", price: "2.00", desc: "描述信息", title: "物料", },
        ],
      };
    },
    computed: {
      isAllSelected() {
        return this.selectedCards.length === this.cardList.length && this.cardList.length > 0;
      },
    },
    mounted() {
      this.show = true; // 组件加载时显示对话框
    },
    methods: {
      removeCard(index) {
        this.cardList.splice(index, 1);
        this.selectedCards = this.selectedCards.filter(i => i !== index);
      },
      toggleSelectAll() {
        if (this.isAllSelected) {
          this.selectedCards = [];
        } else {
          this.selectedCards = this.cardList.map((_, index) => index);
        }
      },
      batchRemove() {
        this.cardList = this.cardList.filter((_, index) => !this.selectedCards.includes(index));
        this.selectedCards = [];
      },
    },
  };
  </script>
  
  <style scoped>
  .custom-dialog {
    display: flex;
    flex-direction: column;
    justify-content: space-between; /* 让内容与按钮保持间隔 */
    width: 60%;
    height: 60%;
  }
  
  .dialog-content {
    flex: 1; /* 占据剩余空间 */
    display: flex;
    flex-direction: column;
  }
  
  .action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    box-sizing: border-box;
  }
  
  .card-list {
    flex: 1; /* 使列表占满可用空间 */
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 0 16px;
    box-sizing: border-box;
    max-height: 400px;
    overflow-y: auto;
  }
  
  .card-item {
    display: flex;
    align-items: center;
    width: 80%;
    background: #fff;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .card-checkbox {
    margin-right: 10px;
  }
  
  .custom-card {
    flex: 1;
    width: 100%;
    margin: 0;
    padding: 0;
    box-shadow: none;
  }
  
  .van-button {
    margin-left: auto;
  }
  </style>
  