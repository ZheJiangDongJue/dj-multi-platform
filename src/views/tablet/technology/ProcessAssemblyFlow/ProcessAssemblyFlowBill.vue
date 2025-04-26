<template>
    <div>
        <BillPageTemplateForTablet
            :isWideScreenMode="isWideScreen()"
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

            <!-- 控件面板插槽 -->
            <template #control-panel>
                <div v-if="vm.isReady">
                    <!-- 固定顶部区域 - 仅在窄屏时显示 -->
                    <div class="assembly-flow__sticky-header" v-if="!isWideScreen()">
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

                    <!-- 头部面板区域 -->
                    <HeaderPanel
                        :billData="vm.billData"
                        :isReadOnly="isBillApproved()"
                        :screenWidth="screenWidth"
                        @update:field="handleUpdateField"
                        @material-code-enter="handleMaterialCodeEnter"
                        @inner-key-enter="handleInnerKeyEnter"
                        ref="headerPanel"
                        :class="isWideScreen() ? 'fixed-header-panel' : 'scrollable-header-panel'" />
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
        </BillPageTemplateForTablet>

        <!-- 接收对话框 -->
        <van-dialog v-model="showReceiveDialog" title="组装工序接收" :show-cancel-button="false" :lazy-render="false"
            class="assembly-flow-popup" :style="{ width: isWideScreen() ? '60%' : '90%' }" :show-confirm-button="false" get-container="body"
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
            class="assembly-flow-popup" :style="{ width: isWideScreen() ? '60%' : '90%' }" :show-confirm-button="false" get-container="body"
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
import ProcessAssemblyFlowBillMixin from '@/views/shared/technology/mixins/ProcessAssemblyFlowBillMixin';
import BillPageTemplateForTablet from '@/components/page/BillPageTemplateForTablet.vue';

export default {
    name: 'ProcessAssemblyFlowBill',
    components: {
        BillPageTemplateForTablet
    },
    mixins: [ProcessAssemblyFlowBillMixin]
}
</script>

<style lang="scss" scoped>
@import "~@/views/tablet/technology/styles/assembly-flow-module";

/* 页面标题样式 */
.page-title {
    font-size: vh(2.08);
    font-weight: 600;
    color: #333;
    margin: 0;
    padding: vh(0.65) 0;
}

/* 审批状态样式 */
.approval-status {
    font-size: vh(1.56);
    font-weight: 500;
    padding: vh(0.39) vh(1.04);
    border-radius: vh(0.52);
    background-color: #f56c6c;
    color: white;

    &.approved {
        background-color: #67c23a;
    }
}

/* 固定头部面板样式 */
.fixed-header-panel {
    margin-bottom: 0 !important;
    border-bottom: none !important;
    box-shadow: none !important;
}

/* 滚动区域内头部面板样式 */
.scrollable-header-panel {
    margin-bottom: vh(2.6);
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: vh(2.08);
    box-shadow: 0 vh(0.39) vh(1.3) rgba(0, 0, 0, 0.08);
    overflow: hidden;
}

/* 窄屏下固定顶部区域样式 */
.assembly-flow__sticky-header {
    // background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    padding: vh(1.3) vw(1.46);
    border-radius: 0 0 vh(1.04) vh(1.04);
    color: white;
    box-shadow: 0 vh(0.39) vh(1.3) rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 20;

    .mobile-header-section {
        .van-field {
            padding: vh(0.65) vw(0.98);
            margin-bottom: vh(0.65);
            background-color: rgba(255, 255, 255, 0.9);
            border-radius: vh(0.52);
            box-shadow: 0 vh(0.26) vh(0.52) rgba(0, 0, 0, 0.05);
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;

            &:focus-within {
                transform: translateY(-vh(0.13));
                box-shadow: 0 vh(0.52) vh(1.3) rgba(0, 0, 0, 0.1);
            }

            .van-cell__title {
                margin-right: vw(0.49);
                color: #333;
                font-weight: 500;
            }

            .van-field__control {
                height: vh(2.60);
                min-height: vh(2.60);
                line-height: vh(2.60);
                color: #333;
            }
        }

        /* 移除最后一个字段的底部间距 */
        .van-field:last-child {
            margin-bottom: 0;
        }
    }
}
</style>

<!-- 使用CSS变量管理z-index层级 -->
<style>
:root {
    /* z-index层级管理 */
    --z-index-base: 1000;
    --z-index-overlay: 9960;
    --z-index-dialog: 9970;
    --z-index-dropdown: 9990;
    --z-index-popup: 9980;
    --z-index-confirm: 10000;
    --z-index-toast: 10010;

    /* 颜色变量 */
    --primary-gradient: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    --secondary-gradient: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
    --background-color: #f8f9fa;
    --card-background: rgba(255, 255, 255, 0.8);
    --border-color: #f0f0f0;
    --text-primary: #333;
    --text-secondary: #666;
    --text-tertiary: #999;
    --warning-color: #f56c6c;
}

/* 下拉菜单相关样式 */
.assembly-flow-dropdown {
    z-index: var(--z-index-dropdown);
    position: absolute;
    background-color: var(--card-background);
    border-radius: vh(2.08);
    box-shadow: 0 vh(0.39) vh(1.3) rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(vh(0.39));
    overflow: hidden;
    animation: dropdown-appear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes dropdown-appear {
    from {
        opacity: 0;
        transform: translateY(-vh(1.3)) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* 弹出层样式 */
.assembly-flow-popup {
    overflow: visible;
    z-index: var(--z-index-popup);
    border-radius: vh(2.08) !important;
    background-color: var(--card-background);
    backdrop-filter: blur(vh(0.39));
    box-shadow: 0 vh(0.78) vh(2.08) rgba(0, 0, 0, 0.15);
}

/* 对话框样式 */
.van-dialog {
    overflow: visible;
    z-index: var(--z-index-dialog);
    border-radius: vh(2.08) !important;
    background-color: var(--card-background);
    backdrop-filter: blur(vh(0.39));
    box-shadow: 0 vh(0.78) vh(2.08) rgba(0, 0, 0, 0.15);
    animation: dialog-appear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes dialog-appear {
    from {
        opacity: 0;
        transform: translate(-50%, -45%) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
    }
}

.dialog-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: vh(1.56) vw(1.95);
    border-bottom: vh(0.13) solid var(--border-color);

    span {
        font-size: vh(2.08);
        font-weight: 600;
        color: var(--text-primary);
    }

    .close-icon {
        font-size: vh(2.08);
        color: var(--text-secondary);
        cursor: pointer;
        transition: transform 0.3s ease, color 0.3s ease;

        &:hover {
            color: var(--warning-color);
        }
    }
}

.van-overlay {
    overflow: visible;
    z-index: var(--z-index-overlay);
    backdrop-filter: blur(vh(0.39));
    transition: opacity 0.3s ease;
}

/* Element UI与Vant兼容样式 */
.el-select-dropdown,
.el-popper,
.el-scrollbar {
    z-index: var(--z-index-dropdown) !important;
    border-radius: vh(1.04) !important;
    box-shadow: 0 vh(0.52) vh(1.56) rgba(0, 0, 0, 0.12) !important;
    border: none !important;
    overflow: hidden;
}

.el-select-dropdown__item {
    font-size: vh(1.56) !important;
    height: vh(3.39) !important;
    line-height: vh(3.39) !important;
}

.el-select-dropdown__item.selected {
    color: #1e3c72 !important;
    font-weight: 600 !important;
}

/* 确保alert/confirm对话框显示在最上层 */
.van-dialog--confirm,
.van-dialog--alert {
    z-index: var(--z-index-toast) !important;
    border-radius: vh(2.08) !important;
}

/* 修复Vant对话框底部圆角丢失问题 */
.van-dialog__content,
.van-dialog__footer {
    border-bottom-left-radius: vh(2.08) !important;
    border-bottom-right-radius: vh(2.08) !important;
    overflow: hidden;
}

/* 按钮样式优化 */
.van-button--default {
    border-radius: vh(0.52) !important;
    font-size: vh(1.56) !important;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease !important;

    &:active {
        transform: scale(0.98) !important;
    }
}

.van-button--primary {
    background: var(--primary-gradient) !important;
    border: none !important;

    &:active {
        opacity: 0.9;
    }
}

/* 窄屏下的对话框样式调整 */
@media screen and (max-width: 799px) {
    /* 确保BillPageTemplate内容区域可以滚动 */
    .bill-page__page-content {
        height: auto !important;
        min-height: 100% !important;
    }

    .assembly-flow-popup {
        margin: 0 !important;
        max-height: 90vh !important;
        top: 50% !important;
        transform: translateY(-50%) !important;

        /* 确保内容可以滚动 */
        .van-dialog__content {
            max-height: calc(90vh - 108px);
        }

        /* 优化对话框标题栏 */
        .dialog-title {
            position: sticky;
            top: 0;
            background: white;
            z-index: 1;
            padding: vh(1.56) vw(1.46);
            border-bottom: vh(0.13) solid var(--border-color);
        }

        /* 调整内容区域的padding */
        .van-dialog__content {
            padding: vh(1.3) vw(1.46);
        }

        /* 确保对话框内的label宽度足够显示2个汉字 */
        .van-field__label {
            min-width: vh(9.11) !important;
            width: auto !important;
            flex: 0 0 vh(9.11) !important;
        }

        /* 对van-field应用紧凑布局 */
        .van-field {
            padding: vh(1.04) vw(1.3) !important;
            margin-bottom: vh(1.04) !important;
        }
    }

    /* 确保对话框不会超出屏幕 */
    .van-dialog {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        margin: 0 !important;
        max-height: 90vh !important;
    }
}
</style>