<template>
    <div>
        <BillPageTemplateForMobile
            @page-scroll="handlePageScroll"
            ref="billPageTemplate">

            <!-- 工具栏插槽 -->
            <template #toolbar>
                <ToolbarPanel @command="raiseCommand" />
            </template>

            <!-- 页面标题插槽 -->
            <template #page-title>
                <h2 class="page-title">组装工序流程卡</h2>
            </template>

            <!-- 审批状态插槽 -->
            <template #approval-status>
                <div v-if="vm.isReady" class="approval-status" :class="{ 'approved': isBillApproved() }">
                    {{ isBillApproved() ? '已审批' : '未审批' }}
                </div>
            </template>

            <!-- 固定控件面板插槽 - 移动端特有 -->
            <template #fix-control-panel>
                <div v-if="vm.isReady" class="assembly-flow__sticky-header">
                    <div class="mobile-header-section">
                        <van-field :value="vm.billData.data.MaterialCode" label="物料编码" placeholder="请输入完整编码"
                            :readonly="isBillApproved()" label-width="70px"
                            v-click-tooltip="vm.billData.data.MaterialCode"
                            @input="value => vm.billData.setValue('MaterialCode', value)" />
                        <van-field :value="vm.billData.data.BQty" label="计划数" label-width="70px"
                            :readonly="isBillApproved()" v-click-tooltip="vm.billData.data.BQty"
                            @input="value => vm.billData.setValue('BQty', value)" />
                    </div>
                </div>
            </template>

            <!-- 控件面板插槽 -->
            <template #control-panel>
                <div v-if="vm.isReady">
                    <!-- 头部面板区域 -->
                    <HeaderPanel
                        :billData="vm.billData"
                        :isReadOnly="isBillApproved()"
                        :screenWidth="screenWidth"
                        @update:field="handleUpdateField"
                        @material-code-enter="handleMaterialCodeEnter"
                        @inner-key-enter="handleInnerKeyEnter"
                        class="scrollable-header-panel" />
                </div>
            </template>

            <!-- 卡片列表插槽 -->
            <template #card-list>
                <div v-if="vm.isReady">
                    <CardList
                        :details="vm.detail_vm.details"
                        :isReadOnly="isBillApproved()"
                        :screenWidth="screenWidth"
                        :fontSize="fontSize"
                        @receive="handleReceive"
                        @complete="handleComplete" />
                </div>
            </template>
        </BillPageTemplateForMobile>

        <!-- 接收对话框 -->
        <van-dialog v-model="showReceiveDialog" title="组装工序接收" :show-cancel-button="false" :lazy-render="false"
            class="assembly-flow-popup" style="width: 90%" :show-confirm-button="false" get-container="body"
            @closed="handleDialogClosed">
            <template #title>
                <div class="dialog-title">
                    <span>组装工序接收</span>
                    <van-icon name="cross" class="close-icon" @click="showReceiveDialog = false" />
                </div>
            </template>
            <AssemblyProcessReceivePanel :dataContext="showReceiveDialog ? dialogDataContext : {}"
                @operation-complete="handleOperationComplete" />
        </van-dialog>

        <!-- 完工对话框 -->
        <van-dialog v-model="showCompleteDialog" title="组装工序完工" :show-cancel-button="false" :lazy-render="false"
            class="assembly-flow-popup" style="width: 90%" :show-confirm-button="false" get-container="body"
            @closed="handleDialogClosed">
            <template #title>
                <div class="dialog-title">
                    <span>组装工序完工</span>
                    <van-icon name="cross" class="close-icon" @click="showCompleteDialog = false" />
                </div>
            </template>
            <AssemblyProcessCompletionPanel :dataContext="showCompleteDialog ? dialogDataContext : {}"
                @operation-complete="handleOperationComplete" />
        </van-dialog>
    </div>
</template>

<script>
import ProcessAssemblyFlowBillMixin from '../../../shared/technology/mixins/ProcessAssemblyFlowBillMixin';
import BillPageTemplateForMobile from '@/components/page/BillPageTemplateForMobile.vue';

export default {
    name: 'ProcessAssemblyFlowBillMobile',
    components: {
        BillPageTemplateForMobile
    },
    mixins: [ProcessAssemblyFlowBillMixin]
}
</script>

<style lang="scss" scoped>
/* 移动端组装流程卡模块样式 */

/* 主容器样式 */
.assembly-flow {
  &__container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
  }

  &__sticky-header {
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: #fff;
    border-bottom: 1px solid #eee;
  }

  &__page-content {
    flex: 1;
    overflow-y: auto;
    padding: 0 10px;
  }

  &__dialog-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;

    .close-icon {
      cursor: pointer;
      font-size: 18px;
      color: #999;

      &:hover {
        color: #666;
      }
    }
  }
}

/* 组件样式定义 */
.van-cell-module {
  background-color: transparent;
}

/* 表单字段样式 */
.van-field {
  margin-bottom: 8px;
  background-color: #f9f9f9;
  border-radius: 4px;
  
  &__label {
    color: #666;
    font-size: 14px;
  }
  
  &__value {
    color: #333;
    font-size: 14px;
  }
}

/* 卡片样式 */
.card-item {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 12px;
  overflow: hidden;
  
  &__header {
    padding: 10px;
    background-color: #f5f7fa;
    border-bottom: 1px solid #ebeef5;
    font-weight: 500;
  }
  
  &__content {
    padding: 12px;
  }
  
  &__footer {
    padding: 8px 12px;
    border-top: 1px solid #ebeef5;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}

/* 按钮样式 */
.action-button {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  
  &--primary {
    background-color: #409eff;
    color: white;
    
    &:active {
      background-color: #3a8ee6;
    }
  }
  
  &--secondary {
    background-color: #f0f0f0;
    color: #606266;
    
    &:active {
      background-color: #e6e6e6;
    }
  }
}

/* 回到顶部按钮 */
.back-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.3);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 页面标题样式 */
.page-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0;
    padding: 6px 0;
}

/* 审批状态样式 */
.approval-status {
    font-size: 14px;
    font-weight: 500;
    padding: 4px 10px;
    border-radius: 4px;
    background-color: #f56c6c;
    color: white;

    &.approved {
        background-color: #67c23a;
    }
}

/* 移动端头部面板样式 */
.mobile-header-section {
    background-color: #f9f9f9;
    border-radius: 8px;
}

/* 对话框标题样式 */
.dialog-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0 10px;
}

.close-icon {
    font-size: 18px;
    color: #999;
}

/* 修复Vant对话框底部圆角丢失问题 */
.van-dialog__content,
.van-dialog__footer {
    border-bottom-left-radius: 8px !important;
    border-bottom-right-radius: 8px !important;
    overflow: hidden;
}

/* 按钮样式优化 */
.van-button--default {
    border-radius: 4px !important;
    font-size: 14px !important;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease !important;

    &:active {
        transform: scale(0.98) !important;
    }
}

.van-button--primary {
    background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%) !important;
    border: none !important;

    &:active {
        opacity: 0.9;
    }
}
</style>
