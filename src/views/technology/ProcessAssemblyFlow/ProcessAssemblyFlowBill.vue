<template>
    <div class="assembly-flow__container">
        <DockPanel>
            <DockItem dock="top">
                <DockPanel>
                    <DockItem dock="left">
                        <div class="back-button" @click="goBack">
                            <van-icon name="arrow-left" />
                            <span>返回</span>
                        </div>
                    </DockItem>
                    <DockItem dock="right">
                        <StatusBadge :status="vm.billData?.data?.Status" />
                    </DockItem>
                    <DockItem dock="right">
                        <div :style="{ width: '1px', height: '100%', backgroundColor: '#ccc', margin: '0 10px' }"></div>
                    </DockItem>
                    <DockItem>
                        <ToolbarPanel @command="raiseCommand" />
                    </DockItem>
                </DockPanel>
            </DockItem>
            <DockItem dock="fill">
                <div class="assembly-flow__page-content" ref="pageContent" @scroll="handlePageScroll">
                    <div v-if="vm.isReady" class="assembly-flow__full-content">
                        <!-- 固定顶部区域 - 仅在窄屏时显示 -->
                        <div class="assembly-flow__sticky-header" v-if="!isWideScreen()">
                            <div class="mobile-header-section">
                                <van-field :value="vm.billData.data.MaterialCode" label="物料编码" placeholder="请输入完整编码"
                                    :readonly="isBillApproved()" label-width="70px"
                                    v-long-press-tooltip="vm.billData.data.MaterialCode" 
                                    @input="value => vm.billData.setValue('MaterialCode', value)" />
                                <van-field :value="vm.billData.data.BQty" label="计划数" label-width="70px"
                                    :readonly="isBillApproved()"
                                    v-long-press-tooltip="vm.billData.data.BQty" 
                                    @input="value => vm.billData.setValue('BQty', value)" />
                            </div>
                        </div>

                        <!-- 全部内容区域 -->
                        <div class="assembly-flow__content-wrapper">
                            <!-- 头部面板区域 -->
                            <HeaderPanel 
                                :billData="vm.billData" 
                                :isReadOnly="isBillApproved()" 
                                :screenWidth="screenWidth" 
                                @update:field="handleUpdateField"
                            />

                            <!-- 卡片列表区域 -->
                            <CardList
                                :details="vm.detail_vm.details"
                                :isReadOnly="isBillApproved()"
                                :screenWidth="screenWidth"
                                :fontSize="fontSize"
                                @receive="handleReceive"
                                @complete="handleComplete"
                            />
                        </div>
                    </div>

                    <!-- 回到顶部按钮 -->
                    <div v-if="showBackToTop" class="back-to-top" @click="scrollToTop">
                        <van-icon name="arrow-up" />
                    </div>
                </div>
            </DockItem>
        </DockPanel>
        
        <!-- 接收对话框 -->
        <van-dialog v-model="showReceiveDialog" title="组装工序接收" :show-cancel-button="false" :lazy-render="false"
            class="assembly-flow-popup" :style="{ width: '60%' }" :show-confirm-button="false"
            get-container="body" @closed="handleDialogClosed">
            <template #title>
                <div class="dialog-title">
                    <span>组装工序接收</span>
                    <van-icon name="cross" class="close-icon" @click="showReceiveDialog = false" />
                </div>
            </template>
            <AssemblyProcessReceivePanel :dataContext="showReceiveDialog ? dialogDataContext : {}" @operation-complete="handleOperationComplete" />
        </van-dialog>
        
        <!-- 完工对话框 -->
        <van-dialog v-model="showCompleteDialog" title="组装工序完工" :show-cancel-button="false" :lazy-render="false"
            class="assembly-flow-popup" :style="{ width: '60%' }" :show-confirm-button="false"
            get-container="body" @closed="handleDialogClosed">
            <template #title>
                <div class="dialog-title">
                    <span>组装工序完工</span>
                    <van-icon name="cross" class="close-icon" @click="showCompleteDialog = false" />
                </div>
            </template>
            <AssemblyProcessCompletionPanel :dataContext="showCompleteDialog ? dialogDataContext : {}" @operation-complete="handleOperationComplete" />
        </van-dialog>
    </div>
</template>

<script>
import generalapi from '@/api/general';
import DockItem from '@/components/dock/DockItem.vue';
import DockPanel from '@/components/dock/DockPanel.vue';
import { BillPageViewModel } from '@/core/temporary/bill-page-vm';
import { Query } from '@/core/query';
import AssemblyProcessReceivePanel from './AssemblyProcessReceivePanel.vue';
import AssemblyProcessCompletionPanel from './AssemblyProcessCompletionPanel.vue';
import craftapi from '@/api/craft';

// 引入拆分后的组件
import HeaderPanel from './components/HeaderPanel.vue';
import ToolbarPanel from './components/ToolbarPanel.vue';
import CardList from './components/CardList.vue';
import StatusBadge from './components/StatusBadge.vue';

export default {
    components: {
        DockPanel,
        DockItem,
        AssemblyProcessReceivePanel,
        AssemblyProcessCompletionPanel,
        HeaderPanel,
        ToolbarPanel,
        CardList,
        StatusBadge,
    },
    data() {
        return {
            screenWidth: 0,
            screenHeight: 0,
            fontSize: 14,
            showReceiveDialog: false,
            showCompleteDialog: false,
            dialogDataContext: {},
            dialogDataContextTableName: '',
            vm: new BillPageViewModel(),
            showBackToTop: false
        }
    },
    computed: {
        // qualificationValue会根据dialogDataContext的CheckResult属性自动更新
        qualificationValue: {
            get() {
                return this.dialogDataContext && this.dialogDataContext.CheckResult !== undefined 
                    ? this.dialogDataContext.CheckResult 
                    : 1; // 默认为合格
            },
            set(value) {
                if (this.dialogDataContext) {
                    this.$set(this.dialogDataContext, 'CheckResult', value);
                }
            }
        }
    },
    watch: {
        'vm.billData.data.Materialid': {
            async handler(newVal,) {
                if (newVal == null) return;
                if (newVal == 0) {
                    this.setMaterialInBill({});
                    return;
                }
                var pack = await generalapi.getDataUseid("Material", newVal);
                if (pack.Status == 200) {
                    let material = pack.Data;
                    this.setMaterialInBill(material);
                }
                else {
                    this.$dialog.alert({
                        title: '提示',
                        message: `该单据的物料无法找到`,
                    })
                }
            },
        },
        'vm.billData.data.MaterialCode': {
            async handler(newVal,) {
                if (newVal == null) return;
                if (newVal == '') return;
                let query = new Query();
                query.TableName = "Material";
                query.ShortName = "m";
                query.Select = 'm.id';
                query.AddWhere(`m.DeletedTag=0`);
                query.AddWhere(`m.Code='${newVal}'`);
                let pack = await generalapi.getDataEx(query);
                if (pack.Status == 200) {
                    /**@type {any[]} */
                    var materials = pack.Data;
                    if (materials.length > 0) {
                        let material = pack.Data[0];
                        this.vm.billData.setValue('Materialid', material.id);
                    }
                    else {
                        this.setMaterialInBill(null);
                    }
                }
                else {
                    this.$dialog.alert({
                        title: '提示',
                        message: `该单据的物料无法找到`,
                    })
                }
            },
        },
        // 监听对话框数据变化
        dialogDataContext: {
            handler(newVal) {
                // 如果对话框数据中包含CheckResult信息，则更新qualificationValue
                // CheckResult: 1=合格, 2=让步接收, 4=不合格
                if (newVal && typeof newVal.CheckResult !== 'undefined') {
                    this.qualificationValue = newVal.CheckResult;
                } else {
                    // 默认设置为合格
                    this.qualificationValue = 1;
                }
            },
            deep: true,
            immediate: true
        }
    },
    async mounted() {
        this.refreshScreenResolution();
        // 监听窗口变化（可选，适用于动态响应分辨率变化）
        window.addEventListener("resize", this.refreshScreenResolution);
        await this.vm.init(this);
        this.vm.setRequiredFields({
            Materialid: "物料",
        })
        await this.vm.setTableName('ProcessAssemblyFlowDocument', 'ProcessAssemblyFlowDetail');
        await this.vm.detail_vm.setDataView(52432881520645);
        this.vm.billData.tryAddColumn("MaterialCode", true);
        this.vm.billData.tryAddColumn("MaterialName", true);
        this.vm.billData.tryAddColumn("MaterialSpecType", true);
        this.vm.billData.tryAddColumn("MaterialSpecTypeExplain", true);
        this.vm.billData.tryAddColumn("MaterialTuHao", true);
        this.vm.registerEvent('BeforeOpenBill', (vm) => {
            console.log('BeforeOpenBill', vm);
        });
        this.vm.isReady = true;
        await this.vm.tryRaiseCommandAsync('NewBill');

        // // 确保Element下拉框正确显示
        // this.fixElementDropdownStyle();
        
        // // 添加全局样式以修复下拉框显示问题
        // this.addGlobalDropdownFix();
        
        // // 配置全局对话框的默认z-index
        // this.configureDialogZIndex();
    },
    updated() {
        // 在更新后重新确保Element下拉框正确显示
        this.$nextTick(() => {
            // this.fixElementDropdownStyle();
        });
    },
    beforeDestroy() {
        // 移除监听（避免内存泄漏）
        window.removeEventListener("resize", this.refreshScreenResolution);
    },
    methods: {
        // 添加返回按钮处理函数
        goBack() {
            this.$router.go(-1); // 返回上一页
        },
        // 添加全局样式修复Element UI下拉框在对话框中的层级问题
        addGlobalDropdownFix() {
            // 创建一个新的样式元素
            const style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = `
                .el-select-dropdown, .el-popper {
                    z-index: 9999 !important;
                }
                .van-dialog {
                    overflow: visible !important;
                }
                .van-overlay {
                    overflow: visible !important;
                }
                .el-select-dropdown.el-popper {
                    position: absolute !important;
                    z-index: 9999 !important;
                }
            `;
            
            // 将样式添加到文档头部
            document.head.appendChild(style);
            
            // 添加全局事件处理，确保每次打开下拉框时都能正确设置z-index
            document.addEventListener('mousedown', (e) => {
                if (e.target && e.target.closest('.el-select')) {
                    setTimeout(() => {
                        document.querySelectorAll('.el-select-dropdown').forEach(el => {
                            if (el && el.style) {
                                el.style.zIndex = '9999';
                                el.style.position = 'absolute';
                            }
                        });
                    }, 50);
                }
            });
        },
        // 修复Element UI下拉框在Vant对话框中的显示问题
        fixElementDropdownStyle() {
            document.querySelectorAll('.el-select-dropdown').forEach(el => {
                if (el && el.style) {
                    el.style.zIndex = '9999';
                }
            });

            // 确保对话框可以正确显示弹出层
            document.querySelectorAll('.van-dialog').forEach(el => {
                if (el && el.style) {
                    el.style.overflow = 'visible';
                }
            });

            document.querySelectorAll('.van-overlay').forEach(el => {
                if (el && el.style) {
                    el.style.overflow = 'visible';
                }
            });
        },
        async raiseCommand(command) {
            await this.vm.tryRaiseCommandAsync(command);
        },
        refreshScreenResolution() {
            this.screenWidth = window.innerWidth;
            this.screenHeight = window.innerHeight;
            console.log('Screen dimensions:', this.screenWidth, 'x', this.screenHeight);
        },
        /**
         * 判断是否宽屏
         */
        isWideScreen() {
            if (this.screenWidth >= 800) {
                return true;
            }
            return false;
        },
        setMaterialInBill(material) {
            if (material != null) {
                this.vm.billData.setValue('MaterialCode', material?.Code);
            }
            else {
                this.vm.billData.setValue('Materialid', material?.id);
            }
            this.vm.billData.setValue('MaterialName', material?.Name);
            this.vm.billData.setValue('MaterialSpecType', material?.SpecType);
            this.vm.billData.setValue('MaterialSpecTypeExplain', material?.SpecTypeExplain);
            this.vm.billData.setValue('MaterialTuHao', material?.TuHao);
        },
        //判断单据是否已审批
        isBillApproved() {
            if (this.vm.billData?.data) {
                var billStatus = this.vm.billData.data.Status;
                if ((billStatus & 1) != 0) {
                    return true;
                }
            }
            return false;
        },
        // 处理接收按钮点击
        async handleReceive(item) {
            var pack = await craftapi.receiveProcessAssemblyFlowDocument(item.id);
            if (pack.Status == 200) {
                var tableName = pack.Data.Objects["OpenDocumentTableName"] ?? pack.Data.Objects["TemporaryDocumentTableName"];
                if (tableName) {
                    if (tableName == "AssemblyProcessReceiveDocument") {
                        this.dialogDataContext = { ...(pack.Data.Objects["OpenDocument"] ?? pack.Data.Objects["TemporaryDocument"]) };
                        this.dialogDataContextTableName = tableName; // 保存表名
                        this.showReceiveDialog = true;
                    }
                    else {
                        this.$dialog.alert({
                            title: '提示',
                            message: "该接收工序是特殊单据,暂时没有支持特殊单据",
                        })
                    }
                }

            }
            else {
                this.$dialog.alert({
                    title: '提示',
                    message: pack.Message,
                })
            }
        },
        // 处理完工按钮点击
        async handleComplete(item) {
            var pack = await craftapi.completeProcessAssemblyFlowDocument(item.id);
            if (pack.Status == 200) {
                var tableName = pack.Data.Objects["OpenDocumentTableName"] ?? pack.Data.Objects["TemporaryDocumentTableName"];
                if (tableName) {
                    if (tableName == "AssemblyProcessCompletionDocument") {
                        this.dialogDataContext = { ...(pack.Data.Objects["OpenDocument"] ?? pack.Data.Objects["TemporaryDocument"]) };
                        this.dialogDataContextTableName = tableName; // 保存表名
                        this.showCompleteDialog = true;
                    }
                    else {
                        this.$dialog.alert({
                            title: '提示',
                            message: "该完工工序是特殊单据,暂时没有支持特殊单据",
                        })
                    }
                }
            }
            else {
                this.$dialog.alert({
                    title: '提示',
                    message: pack.Message,
                })
            }
        },
        // 处理页面滚动
        handlePageScroll(e) {
            // 如果滚动距离超过50px，显示回到顶部按钮
            if (e.target.scrollTop > 100) {
                this.showBackToTop = true;
            } else {
                this.showBackToTop = false;
            }
        },

        // 滚动到顶部
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

        // 处理对话框关闭事件
        handleDialogClosed() {
            // 在对话框关闭时重置相关数据
            this.dialogDataContextTableName = '';
        },
        // 配置全局对话框的默认z-index
        configureDialogZIndex() {
            // 设置Vant Dialog的默认z-index
            if (this.$dialog && this.$dialog.setDefaultOptions) {
                this.$dialog.setDefaultOptions({
                    overlay: {
                        zIndex: 9999,
                    },
                    zIndex: 10000
                });
            }
            
            // 添加一个全局样式，确保alert和confirm对话框显示在最上层
            const dialogStyle = document.createElement('style');
            dialogStyle.type = 'text/css';
            dialogStyle.innerHTML = `
                .van-dialog--confirm,
                .van-dialog--alert {
                    z-index: 10000 !important;
                    border-radius: 8px !important;
                }
                .van-overlay.van-dialog__overlay {
                    z-index: 9999 !important;
                }
                .van-dialog__content,
                .van-dialog__footer {
                    border-bottom-left-radius: 8px !important;
                    border-bottom-right-radius: 8px !important;
                    overflow: hidden;
                }
                body .van-dialog,
                body .van-popup {
                    border-radius: 8px !important;
                }
            `;
            document.head.appendChild(dialogStyle);
        },
        // 处理子组件操作完成事件
        async handleOperationComplete() {
            // 关闭对话框
            this.showReceiveDialog = false;
            this.showCompleteDialog = false;
            // 重置表名
            this.dialogDataContextTableName = '';
            // 刷新数据
            await this.vm.reopenBill();
        },
        handleUpdateField({ field, value }) {
            // 处理子组件发出的字段更新事件
            this.vm.billData.setValue(field, value);
        },
    }
}
</script>

<style lang="scss" scoped>
@import "~@/views/technology/ProcessAssemblyFlow/styles/assembly-flow-module.scss";

/* 返回按钮样式 */
.back-button {
  display: flex;
  align-items: center;
  padding: 0 15px;
  cursor: pointer;
  height: 100%;
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  .van-icon {
    font-size: 16px;
    margin-right: 5px;
  }

  span {
    font-size: 14px;
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
  --z-index-confirm: 10000; /* 确认对话框层级 */
  --z-index-toast: 10010;
}

/* 下拉菜单相关样式 */
.assembly-flow-dropdown {
  /* 使用CSS变量控制z-index，避免硬编码 */
  z-index: var(--z-index-dropdown);
  position: absolute;
}

/* 弹出层样式 */
.assembly-flow-popup {
  overflow: visible;
  z-index: var(--z-index-popup);
}

/* 对话框样式 */
.van-dialog {
  overflow: visible;
  z-index: var(--z-index-dialog);
  border-radius: 8px !important; /* 确保四个角都有相同的圆角 */
}

.van-overlay {
  overflow: visible;
  z-index: var(--z-index-overlay);
}

/* 复写第三方UI库样式时添加注释说明原因 */

/* 
 * 以下样式是为了解决Vant Dialog与Element UI下拉框的层级冲突
 * 我们通过设置统一的z-index变量来管理层级关系
 */
.el-select-dropdown, 
.el-popper, 
.el-scrollbar {
  z-index: var(--z-index-dropdown);
}

/* 确保alert/confirm对话框显示在最上层，并且四个角都有统一的圆角 */
.van-dialog--confirm,
.van-dialog--alert {
  z-index: var(--z-index-toast);
  border-radius: 8px !important; /* 确保四个角都有相同的圆角 */
}

/* 修复Vant对话框底部圆角丢失问题 */
.van-dialog__content,
.van-dialog__footer {
  border-bottom-left-radius: 8px !important;
  border-bottom-right-radius: 8px !important;
  overflow: hidden;
}

/* 修复系统对话框圆角问题 */
body .van-dialog,
body .van-popup {
  border-radius: 8px !important;
}

/* 确保对话框内内容和底部都有圆角 */
body .van-dialog__content,
body .van-dialog__footer {
  border-bottom-left-radius: 8px !important;
  border-bottom-right-radius: 8px !important;
  overflow: hidden;
}

/* 对话框遮罩层 */
.van-overlay.van-dialog__overlay {
  z-index: var(--z-index-overlay);
}
</style>