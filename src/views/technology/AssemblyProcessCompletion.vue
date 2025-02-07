<template>
    <van-dialog 
      v-model="show" 
      title="组装工序完工" 
      show-cancel-button 
      :lazy-render="false" 
      :style="{ width: '60%',  }"
      confirm-button-text="确认审批"
    >
      <van-field
        type="textarea"
        label="规格型号"
        v-model="message"
        rows="2"
        autosize
        autofocus
        maxlength="50"
        show-word-limit
        class="message"
      />
      <van-field
        type="textarea"
        label="规格型号说明"
        v-model="message"
        rows="2"
        autosize
        autofocus
        maxlength="50"
        show-word-limit
        class="message"
      />
  
      <!-- 两列布局 -->
      <div class="field-container">
        <van-field v-model="code" label="制令单号" disabled />
        <van-field v-model="receiveDate" label="接收日期" required clearable />
  
        <van-field v-model="orderNumber" label="单据编号" disabled />
        <van-field v-model="customerName" label="客户名称" disabled />
        <van-field v-model="customerName" label="图号" disabled />
  
        <van-field v-model="receiveDate" label="计件人员" required clearable />
        <van-field v-model="materialCode1" label="物料编码" disabled />
        <van-field v-model="materialCode2" label="接收数量" disabled />
      </div>
    </van-dialog>
  </template>
  
  <script>
  export default {
    name: "TestPageComponent",
    data() {
      return {
        show: false, // 默认隐藏对话框
        message: "",
        code: "", // 制令单号
        receiveDate: "", // 接收日期
        orderNumber: "", // 单据编号
        customerName: "", // 客户名称
        materialCode1: "", // 物料编码1
        materialCode2: "", // 物料编码2
      };
    },
    mounted() {
      this.show = true; // 组件加载时显示对话框
    },
  };
  </script>
  
  <style scoped>
  /* 两列布局 */
  .field-container {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
  
  /* 让每个输入框占 50% 宽度 */
  .van-field {
    flex: 1 1 calc(50% - 6px); /* 减去 gap 的一半，保证对齐 */
    border: 1px solid #e2e2e2;
    background: #f6f6f6;
  }
  </style>
  