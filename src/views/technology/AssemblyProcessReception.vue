<template>
  <van-dialog 
    v-model="show" 
    title="组装工序接收" 
    show-cancel-button 
    :lazy-render="false" 
    :style="{ width: '60%' }"
    confirm-button-text="确认审批"
  >
    <!-- 两列布局 -->
    <div class="field-container">
      <van-field v-model="orderNumber.Code" label="物料编码" disabled />
      <van-field v-model="orderNumber.Code" label="单据编号" disabled />
      <van-field v-model="materialCode2" label="接收数量" required clearable />
    </div>
    <van-field v-model="materialCode2" label="规格型号" disabled />
    <van-field v-model="materialCode2" label="规格型号说明" disabled />
    
    <div class="field-container">
      <van-field v-model="materialCode1" label="制令单号" disabled />
      <van-field v-model="orderNumber.ApprovalTime" label="接收日期" required clearable />
      <van-field v-model="customerName" label="客户名称" disabled />
      <van-field v-model="customerName" label="图号" disabled />
      <van-field v-model="receiveDate" label="计件人员" required clearable />
    </div>
  </van-dialog>
</template>

<script>
import technology from '@/api/technology'
import  get from '@/api/base';  // 正确的命名导入方式

export default {
  name: "TestPageComponent",
  data() {
    return {
      show: false, // 默认隐藏对话框
      message: "",
      receiveDate: "", // 接收日期
      orderNumber: { // Ensure orderNumber is an object
        ApprovalTime: '',
        Materialid: '' // Define Materialid to avoid undefined errors
      },
      Material: "",
      customerName: "", // 客户名称
      materialCode1: "", // 物料编码1
      materialCode2: "", // 物料编码2
    };
  },
  async mounted() {
    this.show = true; // 组件加载时显示对话框
    var response = await technology.getDbNames('AssemblyProcessReceiveDocument', 8)
    
    if (response && response.Data) {
      this.orderNumber = response.Data; // Update orderNumber with response data
      console.log(response);
      
    }

    // If Material data is necessary, you can use it like this
    if (this.orderNumber.Materialid) {
      var geigoods = await get.getc(this.orderNumber.Materialid,this.dbName);
      this.orderNumber = response.Data; // Update orderNumber with response data
      console.log("Material", geigoods); // Handle the Material data as needed
    }
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
