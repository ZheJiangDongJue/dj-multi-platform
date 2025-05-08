<template>
  <BillPageTemplateForTablet>
    <!-- 工具栏插槽 -->
    <template #toolbar>
      <div class="toolbar-container">
        <van-button type="primary" size="small" icon="plus" @click="handleNew">新建</van-button>
        <van-button type="primary" size="small" icon="save" @click="handleSave">保存</van-button>
        <van-button type="info" size="small" icon="delete" @click="handleDelete">删除</van-button>
        <van-button type="success" size="small" icon="checked" @click="handleApprove">审批</van-button>
      </div>
    </template>

    <!-- 页面标题插槽 -->
    <template #page-title>
      <div class="page-title">
        <h2>单据模板</h2>
      </div>
    </template>

    <!-- 审批状态插槽 -->
    <template #approval-status>
      <div class="approval-status" :class="isApproved ? 'approved' : 'unapproved'">
        {{ isApproved ? '已审批' : '未审批' }}
      </div>
    </template>

    <!-- 控件面板插槽 -->
    <template #control-panel>
      <div class="form-container">
        <van-field label="单据编号" v-model="billData.code" readonly />
        <van-field label="创建日期" v-model="billData.createDate" readonly />
        <van-field label="物料编码" v-model="billData.materialCode" :readonly="isApproved" />
        <van-field label="物料名称" v-model="billData.materialName" :readonly="isApproved" />
        <van-field label="计划数量" v-model="billData.qty" type="number" :readonly="isApproved" />
        <van-field label="单位" v-model="billData.unit" :readonly="isApproved" />
        <van-field label="备注" v-model="billData.remark" type="textarea" rows="2" :readonly="isApproved" />
      </div>
    </template>

    <!-- 卡片列表插槽 -->
    <template #card-list>
      <div v-for="(item, index) in cardItems" :key="index" class="card-item">
        <div class="card-header">
          <div class="card-title">{{item.title}}</div>
          <div class="card-status">{{item.statusText}}</div>
        </div>
        <div class="card-content">
          <div class="card-info-row">
            <div class="card-info-item">
              <span class="label">物料编码:</span>
              <span class="value">{{item.materialCode}}</span>
            </div>
            <div class="card-info-item">
              <span class="label">物料名称:</span>
              <span class="value">{{item.materialName}}</span>
            </div>
          </div>
          <div class="card-info-row">
            <div class="card-info-item">
              <span class="label">数量:</span>
              <span class="value">{{item.qty}} {{item.unit}}</span>
            </div>
            <div class="card-info-item">
              <span class="label">状态:</span>
              <span class="value">{{item.statusDescription}}</span>
            </div>
          </div>
        </div>
        <div class="card-footer">
          <van-button type="primary" size="small" :disabled="isApproved" @click="handleCardAction(item, 'receive')">接收</van-button>
          <van-button type="success" size="small" :disabled="isApproved" @click="handleCardAction(item, 'complete')">完工</van-button>
        </div>
      </div>
    </template>
  </BillPageTemplateForTablet>
</template>

<script>
import BillPageTemplateForTablet from '@/components/page/BillPageTemplateForTablet.vue';

export default {
  name: 'BillPageTemplateDemo',
  components: {
    BillPageTemplateForTablet
  },
  data() {
    return {
      isApproved: false,
      billData: {
        code: 'DEMO-20230901-001',
        createDate: '2023-09-01',
        materialCode: 'M001',
        materialName: '示例物料',
        qty: 100,
        unit: '个',
        remark: '这是一个示例单据'
      },
      cardItems: [
        {
          id: 1,
          title: '工序1: 装配',
          materialCode: 'M001-A',
          materialName: '部件A',
          qty: 2,
          unit: '个',
          status: 1,
          statusText: '进行中',
          statusDescription: '等待接收'
        },
        {
          id: 2,
          title: '工序2: 焊接',
          materialCode: 'M001-B',
          materialName: '部件B',
          qty: 5,
          unit: '个',
          status: 0,
          statusText: '未开始',
          statusDescription: '未开始'
        },
        {
          id: 3,
          title: '工序3: 检验',
          materialCode: 'M001-C',
          materialName: '部件C',
          qty: 1,
          unit: '台',
          status: 2,
          statusText: '已完成',
          statusDescription: '已完成'
        }
      ]
    };
  },
  methods: {
    handleNew() {
      this.$toast('点击了新建按钮');
    },
    handleSave() {
      this.$toast('点击了保存按钮');
    },
    handleDelete() {
      this.$toast('点击了删除按钮');
    },
    handleApprove() {
      this.isApproved = !this.isApproved;
      this.$toast(this.isApproved ? '单据已审批' : '单据审批已取消');
    },
    handleCardAction(item, action) {
      this.$toast(`点击了工序${item.id}的${action === 'receive' ? '接收' : '完工'}按钮`);
    }
  }
};
</script>

<style lang="scss" scoped>
/* 工具栏样式 */
.toolbar-container {
  display: flex;
  gap: vw(1.46);
  padding: vh(0.65) vw(1.46);
  
  .van-button {
    height: vh(3.39);
    font-size: vh(1.56);
  }
}

/* 页面标题样式 */
.page-title {
  h2 {
    font-size: vh(2.86);
    margin: 0;
    padding: 0;
    color: #333;
    font-weight: 600;
  }
  
  .page-subtitle {
    font-size: vh(1.56);
    color: #666;
    margin-top: vh(0.52);
    display: block;
  }
}

/* 审批状态样式 */
.approval-status {
  display: inline-block;
  padding: vh(0.65) vw(1.30);
  border-radius: vh(2.08);
  font-size: vh(1.56);
  font-weight: 500;
  
  &.approved {
    background-color: rgba(82, 196, 26, 0.1);
    color: #52c41a;
  }
  
  &.unapproved {
    background-color: rgba(250, 173, 20, 0.1);
    color: #faad14;
  }
}

/* 表单容器样式 */
.form-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: vh(1.3);
  
  .van-field {
    margin-bottom: 0;
  }
  
  /* 让备注占据整行 */
  .van-field:last-child {
    grid-column: 1 / -1;
  }
}

/* 卡片样式 */
.card-item {
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: vh(2.08);
  overflow: hidden;
  box-shadow: 0 vh(0.39) vh(1.3) rgba(0, 0, 0, 0.08);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-vh(0.26));
    box-shadow: 0 vh(0.78) vh(1.56) rgba(0, 0, 0, 0.12);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: vh(1.56) vw(1.95);
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
}

.card-title {
  font-size: vh(2.08);
  font-weight: 600;
}

.card-status {
  background-color: rgba(255, 255, 255, 0.2);
  padding: vh(0.39) vw(0.98);
  border-radius: vh(1.04);
  font-size: vh(1.56);
}

.card-content {
  padding: vh(1.56) vw(1.95);
}

.card-info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: vh(1.3);
  
  &:last-child {
    margin-bottom: 0;
  }
}

.card-info-item {
  .label {
    color: #666;
    margin-right: vw(0.49);
  }
  
  .value {
    color: #333;
    font-weight: 500;
  }
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: vw(1.46);
  padding: vh(1.3) vw(1.95);
  border-top: vh(0.13) solid #f0f0f0;
  background-color: rgba(0, 0, 0, 0.02);
}

/* 响应式调整 */
@media screen and (max-width: 799px) {
  .form-container {
    grid-template-columns: 1fr;
  }
  
  .card-info-row {
    flex-direction: column;
    
    .card-info-item {
      margin-bottom: vh(0.78);
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style> 