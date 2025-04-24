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
                    <DockItem>
                        <ToolbarPanel @command="raiseCommand" />
                    </DockItem>
                </DockPanel>
            </DockItem>

            <!-- 宽屏状态下，头部面板放在滚动区域外部 -->
            <DockItem v-if="vm.isReady && isWideScreen()" dock="top" class="header-panel-container">
                <HeaderPanel :billData="vm.billData" :isReadOnly="isBillApproved()" :screenWidth="screenWidth"
                    @update:field="handleUpdateField" @material-code-enter="handleMaterialCodeEnter" 
                    @inner-key-enter="handleInnerKeyEnter" class="fixed-header-panel" />
            </DockItem>

            <DockItem dock="fill">
                <div class="assembly-flow__page-content" ref="pageContent" @scroll="handlePageScroll">
                    <div v-if="vm.isReady" class="assembly-flow__full-content">
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

                        <!-- 全部内容区域 -->
                        <div class="assembly-flow__content-wrapper">
                            <!-- 头部面板区域 - 仅在窄屏时显示 -->
                            <HeaderPanel v-if="!isWideScreen()" :billData="vm.billData" :isReadOnly="isBillApproved()"
                                :screenWidth="screenWidth" @update:field="handleUpdateField"
                                @material-code-enter="handleMaterialCodeEnter"
                                @inner-key-enter="handleInnerKeyEnter"
                                class="scrollable-header-panel" />

                            <!-- 卡片列表区域 -->
                            <CardList :details="vm.detail_vm.details" :isReadOnly="isBillApproved()"
                                :screenWidth="screenWidth" :fontSize="fontSize" @receive="handleReceive"
                                @complete="handleComplete" />
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
import generalapi from '@/api/general';
import DockItem from '@/components/dock/DockItem.vue';
import DockPanel from '@/components/dock/DockPanel.vue';
import { BillPageViewModel } from '@/core/temporary/bill-page-vm';
import { Query } from '@/core/query';
import AssemblyProcessReceivePanel from './AssemblyProcessReceivePanel.vue';
import AssemblyProcessCompletionPanel from './AssemblyProcessCompletionPanel.vue';
import craftapi from '@/api/craft';
import { pageStateMixin } from '@/mixins';

// 引入拆分后的组件
import HeaderPanel from './components/HeaderPanel.vue';
import ToolbarPanel from './components/ToolbarPanel.vue';
import CardList from './components/CardList.vue';

export default {
    components: {
        DockPanel,
        DockItem,
        AssemblyProcessReceivePanel,
        AssemblyProcessCompletionPanel,
        HeaderPanel,
        ToolbarPanel,
        CardList,
    },
    // 使用页面状态混入
    mixins: [pageStateMixin],
    // 定义常量
    STORAGE_KEY: 'assemblyFlowPageState',
    // 路由离开前钩子不再需要保存状态
    beforeRouteLeave(to, from, next) {
        next();
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
            showBackToTop: false,
            // 当前页面的滚动位置
            scrollPosition: 0,
            // 标记是否正在处理回车事件
            isHandlingMaterialCodeEnter: false,
            isHandlingInnerKeyEnter: false
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
                    // this.$dialog.alert({
                    //     title: '提示',
                    //     message: `该单据的物料无法找到`,
                    // })
                    this.$toast({
                        message: `该单据的物料无法找到`,
                        position: 'bottom',
                        duration: 2000
                    })
                }
            },
        },
        // 'vm.billData.data.MaterialCode': {
        //     async handler(newVal, oldVal) {
        //         // 跳过空值或与输入事件相同的值
        //         if (newVal == null || newVal == '' || this.isHandlingMaterialCodeEnter) {
        //             this.isHandlingMaterialCodeEnter = false;
        //             return;
        //         }
        //         // 避免重复处理相同值
        //         if (newVal === oldVal) return;
                
        //         await this.handleMaterialCodeQuery(newVal);
        //     },
        // },
        // 'vm.billData.data.InnerKey': {
        //     async handler(newVal, oldVal) {
        //         // 输入验证与边界条件处理
        //         if (newVal == null || newVal === '' || this.isHandlingInnerKeyEnter) {
        //             this.isHandlingInnerKeyEnter = false;
        //             return;
        //         }

        //         // 避免重复处理同一个值
        //         if (newVal === oldVal) return;

        //         // 如果正在打开单据或正在恢复状态，则不执行查询
        //         if (this.vm.isOpeningBill || this.isRestoringState) return;

        //         await this.handleInnerKeyQuery(newVal);
        //     },
        // },
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

        // 初始化视图模型
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

        // 尝试恢复页面状态，如果没有恢复成功则创建新单据
        if (!(await this.tryRestorePageState())) {
            await this.vm.tryRaiseCommandAsync('NewBill');
        }
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
        /**
         * 自定义键名生成策略
         * 使用常量STORAGE_KEY作为键名
         */
        _generateStorageKey() {
            this.$options.stateStorageKey = this.$options.STORAGE_KEY;
        },

        /**
         * 扫码打开单据后检查并自动审批
         * 如果单据未审批则自动执行审批操作
         * @returns {Promise<boolean>} 返回是否成功执行审批
         */
        async checkAndAutoApprove() {
            // 确保单据数据已加载且VM准备就绪
            if (!this.vm.isReady || !this.vm.billData?.data) {
                console.warn('单据数据未加载完成，无法执行自动审批');
                return false;
            }

            // 检查单据是否有ID（未保存的单据无法审批）
            if (!this.vm.billData.data.id) {
                console.warn('单据未保存，无法执行自动审批');
                return false;
            }

            // 如果单据未审批，则自动审批
            if (!this.isBillApproved()) {
                try {
                    // 先保存单据，以确保所有数据都已更新
                    console.log('正在自动保存单据...');
                    await this.vm.tryRaiseCommandAsync('SaveBill');

                    // 等待短暂延时，确保保存操作完成
                    await new Promise(resolve => setTimeout(resolve, 300));

                    // 执行审批操作
                    console.log('正在自动审批单据...');
                    await this.vm.tryRaiseCommandAsync('ApprovalBill');

                    // 显示成功通知
                    this.$notify({
                        type: 'success',
                        message: '单据已自动审批',
                        duration: 2000
                    });

                    return true;
                } catch (error) {
                    console.error('自动审批失败:', error);

                    // 显示错误提示
                    this.$dialog.alert({
                        title: '提示',
                        message: `自动审批失败: ${error.message || '未知错误'}`,
                    });

                    return false;
                }
            } else {
                console.log('单据已审批，无需重复审批');
                return false;
            }
        },

        /**
         * 收集需要保存的状态
         * 为当前组件收集特定的状态数据
         */
        collectState() {
            console.log('collectState', this.vm.billData?.data?.id);
            // 只有当有单据ID才保存状态
            if (this.vm.billData?.data?.id) {
                return {
                    billId: this.vm.billData.data.id, // 当前单据ID
                    scrollPosition: this.$refs.pageContent ? this.$refs.pageContent.scrollTop : 0, // 滚动位置
                    timestamp: new Date().getTime() // 添加时间戳方便判断状态是否过期
                };
            }
            return null;
        },

        /**
         * 应用保存的状态
         * 恢复组件特定的状态
         */
        async applyState(storedState) {
            console.log('applyState', storedState);
            try {
                // 如果有保存的单据ID，则打开该单据
                if (storedState.billId) {
                    // 打开单据
                    await this.vm.openBill(storedState.billId);

                    // 恢复滚动位置（在下一个事件循环中执行，确保DOM已更新）
                    this.$nextTick(() => {
                        if (this.$refs.pageContent && storedState.scrollPosition) {
                            this.$refs.pageContent.scrollTop = storedState.scrollPosition;
                            this.scrollPosition = storedState.scrollPosition;
                        }
                    });

                    // 在恢复状态后，也检查是否需要自动审批
                    // 这里不是通过扫码打开的，所以我们不进行自动审批
                    // this.checkAndAutoApprove();

                    return true;
                }

                return false;
            } catch (error) {
                console.error('恢复单据状态失败:', error);
                return false;
            }
        },
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
                    // z-index: 9999 !important;
                }
                .van-dialog {
                    overflow: visible !important;
                }
                .van-overlay {
                    overflow: visible !important;
                }
                .el-select-dropdown.el-popper {
                    position: absolute !important;
                    // z-index: 9999 !important;
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
            // 不再需要在命令执行后保存状态
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
        /**
         * 处理接收按钮点击
         * 接收工序前进行多重检查，确保操作的有效性和安全性
         * 
         * @param {Object} item - 工序对象
         * @param {number} item.id - 工序ID
         * @param {number} item.ReceiveStatus - 接收状态(0:未开始, 1:进行中, 2:已接收, 3:禁用)
         * @returns {Promise<void>}
         */
        async handleReceive(item) {
            // 健壮性检查：确保item参数存在且有效
            if (!item || typeof item !== 'object') {
                console.error('handleReceive方法接收到无效参数');
                return;
            }
            
            // 健壮性检查：确保工序状态属性存在
            if (typeof item.ReceiveStatus === 'undefined') {
                console.error('工序缺少ReceiveStatus属性');
                this.$toast({
                    message: "无法获取工序状态信息",
                    position: 'bottom',
                    duration: 2000
                });
                return;
            }
            
            // 检查工序状态，如果是未开始(0)或禁用(3)，则不允许点击
            if (item.ReceiveStatus === 0 || item.ReceiveStatus === 3) {
                console.log('当前工序状态不允许接收操作', item.ReceiveStatus);
                
                // 根据状态显示不同的提示信息
                let message = item.ReceiveStatus === 0 
                    ? "该工序尚未开始，无法进行接收操作" 
                    : "该工序已被禁用，无法进行接收操作";
                
                this.$toast({
                    message: message,
                    position: 'bottom',
                    duration: 2000
                });
                return;
            }
            
            // 健壮性检查：确保工序ID存在
            if (!item.id) {
                console.error('工序缺少ID');
                this.$toast({
                    message: "无法获取工序ID",
                    position: 'bottom',
                    duration: 2000
                });
                return;
            }
            
            try {
                // 显示加载状态
                this.$toast.loading({
                    message: '加载中...',
                    forbidClick: true,
                    duration: 0
                });
                
                // 调用API处理接收操作
                var pack = await craftapi.receiveProcessAssemblyFlowDocument(item.id);
                
                // 关闭加载状态
                this.$toast.clear();
                
                if (pack.Status == 200) {
                    // 处理成功响应
                    var tableName = pack.Data.Objects["OpenDocumentTableName"] ?? pack.Data.Objects["TemporaryDocumentTableName"];
                    if (tableName) {
                        if (tableName == "AssemblyProcessReceiveDocument") {
                            // 设置对话框数据并显示
                            this.dialogDataContext = { ...(pack.Data.Objects["OpenDocument"] ?? pack.Data.Objects["TemporaryDocument"]) };
                            this.dialogDataContextTableName = tableName; // 保存表名
                            this.showReceiveDialog = true;
                        }
                        else {
                            // 处理特殊单据类型
                            this.$dialog.alert({
                                title: '提示',
                                message: "该接收工序是特殊单据,暂时没有支持特殊单据",
                            })
                        }
                    }
                }
                else {
                    // 处理错误响应
                    this.$dialog.alert({
                        title: '提示',
                        message: pack.Message,
                    })
                }
            } catch (error) {
                // 关闭加载状态
                this.$toast.clear();
                
                // 错误处理和日志记录
                console.error('接收工序操作失败:', error);
                this.$dialog.alert({
                    title: '提示',
                    message: `接收工序失败: ${error.message || '未知错误'}`,
                });
            }
        },
        
        /**
         * 处理完工按钮点击
         * 完工工序前进行多重检查，确保操作的有效性和安全性
         * 
         * @param {Object} item - 工序对象
         * @param {number} item.id - 工序ID
         * @param {number} item.CompleteStatus - 完工状态(0:未开始, 1:进行中, 2:已完工, 3:禁用)
         * @param {number|null} item.StepDocumentid - 步骤文档ID
         * @returns {Promise<void>}
         */
        async handleComplete(item) {
            // 健壮性检查：确保item参数存在且有效
            if (!item || typeof item !== 'object') {
                console.error('handleComplete方法接收到无效参数');
                return;
            }
            
            // 健壮性检查：确保工序状态属性存在
            if (typeof item.CompleteStatus === 'undefined') {
                console.error('工序缺少CompleteStatus属性');
                this.$toast({
                    message: "无法获取工序状态信息",
                    position: 'bottom',
                    duration: 2000
                });
                return;
            }
            
            // 检查工序状态，如果是未开始(0)或禁用(3)，则不允许点击
            if (item.CompleteStatus === 0 || item.CompleteStatus === 3) {
                console.log('当前工序状态不允许完工操作', item.CompleteStatus);
                
                // 根据状态显示不同的提示信息
                let message = item.CompleteStatus === 0 
                    ? "该工序尚未开始，无法进行完工操作" 
                    : "该工序已被禁用，无法进行完工操作";
                
                this.$toast({
                    message: message,
                    position: 'bottom',
                    duration: 2000
                });
                return;
            }
            
            // 健壮性检查：确保工序ID存在
            if (!item.id) {
                console.error('工序缺少ID');
                this.$toast({
                    message: "无法获取工序ID",
                    position: 'bottom',
                    duration: 2000
                });
                return;
            }
            
            try {
                // 显示加载状态
                this.$toast.loading({
                    message: '加载中...',
                    forbidClick: true,
                    duration: 0
                });
                
                // 调用API处理完工操作
                var pack = await craftapi.completeProcessAssemblyFlowDocument(item.id);
                
                // 关闭加载状态
                this.$toast.clear();
                
                if (pack.Status == 200) {
                    // 处理成功响应
                    var tableName = pack.Data.Objects["OpenDocumentTableName"] ?? pack.Data.Objects["TemporaryDocumentTableName"];
                    if (tableName) {
                        if (tableName == "AssemblyProcessCompletionDocument" && item.StepDocumentid == null) {
                            // 设置对话框数据并显示
                            this.dialogDataContext = { ...(pack.Data.Objects["OpenDocument"] ?? pack.Data.Objects["TemporaryDocument"]) };
                            this.dialogDataContextTableName = tableName; // 保存表名
                            this.showCompleteDialog = true;
                        }
                        else {
                            // 处理特殊单据类型
                            this.$dialog.alert({
                                title: '提示',
                                message: "该完工工序是特殊单据,暂时没有支持特殊单据",
                            })
                        }
                    }
                }
                else {
                    // 处理错误响应
                    this.$dialog.alert({
                        title: '提示',
                        message: pack.Message,
                    })
                }
            } catch (error) {
                // 关闭加载状态
                this.$toast.clear();
                
                // 错误处理和日志记录
                console.error('完工工序操作失败:', error);
                this.$dialog.alert({
                    title: '提示',
                    message: `完工工序失败: ${error.message || '未知错误'}`,
                });
            }
        },
        // 处理页面滚动并保存滚动位置
        handlePageScroll(e) {
            // 如果滚动距离超过50px，显示回到顶部按钮
            if (e.target.scrollTop > 100) {
                this.showBackToTop = true;
            } else {
                this.showBackToTop = false;
            }

            // 保存当前滚动位置
            this.scrollPosition = e.target.scrollTop;

            // 不再需要在滚动时保存状态
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
        // 处理子组件操作完成事件
        async handleOperationComplete(options = { preserveScroll: true }) {
            // 记录当前滚动位置
            const currentScrollPosition = this.$refs.pageContent ? this.$refs.pageContent.scrollTop : 0;
            console.log('操作完成前记录滚动位置:', currentScrollPosition);

            // 关闭对话框
            this.showReceiveDialog = false;
            this.showCompleteDialog = false;
            // 重置表名
            this.dialogDataContextTableName = '';

            try {
                // 刷新数据
                await this.vm.reopenBill();

                // 在下一个渲染周期恢复滚动位置
                if (options.preserveScroll) {
                    // 使用多个nextTick和setTimeout组合，确保在DOM完全更新后设置滚动位置
                    this.$nextTick(() => {
                        setTimeout(() => {
                            if (this.$refs.pageContent) {
                                this.$refs.pageContent.scrollTop = currentScrollPosition;
                                console.log('刷新后恢复滚动位置:', currentScrollPosition);

                                // 再次检查滚动位置是否设置成功
                                setTimeout(() => {
                                    if (this.$refs.pageContent &&
                                        Math.abs(this.$refs.pageContent.scrollTop - currentScrollPosition) > 5) {
                                        console.log('滚动位置设置可能未成功，再次尝试:', this.$refs.pageContent.scrollTop);
                                        this.$refs.pageContent.scrollTop = currentScrollPosition;
                                    }
                                }, 100);
                            }
                        }, 50);
                    });
                }
            } catch (error) {
                console.error('刷新数据时出错:', error);
                // 即使刷新失败，也尝试恢复滚动位置
                if (options.preserveScroll && this.$refs.pageContent) {
                    this.$refs.pageContent.scrollTop = currentScrollPosition;
                }

                // 显示错误提示
                this.$dialog.alert({
                    title: '提示',
                    message: `刷新数据时出错: ${error.message || '未知错误'}`,
                });
            }
        },
        handleUpdateField({ field, value }) {
            // 处理子组件发出的字段更新事件
            this.vm.billData.setValue(field, value);
            // 不再需要在字段更新后保存状态
        },
        /**
         * 处理扫码查询结果
         * @param {number} billId 单据ID
         * @returns {Promise<void>}
         */
        async processScanResult(billId) {
            if (!billId) {
                console.error('处理扫码结果失败: 单据ID为空');
                return;
            }

            try {
                // 打开单据
                console.log('正在打开单据ID:', billId);
                await this.vm.openBill(billId);

                // 检查单据是否已打开
                if (!this.vm.billData?.data?.id) {
                    throw new Error('单据打开失败');
                }

                // 扫码打开单据后，检查是否需要自动审批
                await this.checkAndAutoApprove();

                // 滚动到页面顶部
                this.$nextTick(() => {
                    this.scrollToTop();
                });
            } catch (error) {
                console.error('处理扫码结果失败:', error);
                this.$dialog.alert({
                    title: '提示',
                    message: `打开单据失败: ${error.message || '未知错误'}`,
                });
            }
        },
        /**
         * 处理扫码查询结果 - 通过日计划明细
         * @param {string} code 扫描的编码
         * @returns {Promise<void>}
         */
        async processScanByDailyPlanDetail(code) {
            if (!code) {
                console.error('处理扫码结果失败: 扫描编码为空');
                return;
            }

            try {
                // 创建查询对象
                const query = new Query();
                query.TableName = 'DailyPlanDetail';
                query.ShortName = 'dpd';
                query.Select = 'dpd.id';
                query.AddWhere(`dpd.CodeForScan = '${code}'`);
                query.AddWhere('dpd.DeletedTag = 0');

                // 执行查询
                const response = await generalapi.getDataEx(query);

                if (response.Status === 200 && response.Data && response.Data.length > 0) {
                    // 找到了日计划明细记录
                    let id = response.Data[0].id;

                    // 调用prepareAssemblyFlowCardReceive API
                    let pack = await craftapi.prepareAssemblyFlowCardReceive(id);
                    if (pack.Status === 200) {
                        let data = pack.Data;

                        // 如果返回了ProcessAssemblyFlowDocument，则打开该单据
                        if (data && data.ProcessAssemblyFlowDocument && data.ProcessAssemblyFlowDocument.id) {
                            await this.processScanResult(data.ProcessAssemblyFlowDocument.id);
                        } else {
                            // 清理输入框内容
                            this.vm.billData.setValue('InnerKey', '');
                            throw new Error('未找到有效的流程卡单据');
                        }
                    } else {
                        // 清理输入框内容
                        this.vm.billData.setValue('InnerKey', '');
                        throw new Error(pack.Message || '准备流程卡接收失败,未知错误');
                    }
                } else {
                    // 清理输入框内容
                    this.vm.billData.setValue('InnerKey', '');
                    // 未找到对应的日计划明细记录，尝试直接通过单号查询
                    await this.processScanByInnerKey(code);
                }
            } catch (error) {
                // 清理输入框内容
                this.vm.billData.setValue('InnerKey', '');
                console.error('通过日计划处理扫码结果失败:', error);
                this.$dialog.alert({
                    title: '提示',
                    message: `处理扫码结果失败: ${error.message || '未知错误'}`,
                });
            }
        },
        /**
         * 通过内部编号直接查询流程卡
         * @param {string} code 扫描的编码
         * @returns {Promise<void>}
         */
        async processScanByInnerKey(code) {
            try {
                // 直接查询流程卡单据
                const query = new Query();
                query.TableName = "ProcessAssemblyFlowDocument";
                query.ShortName = "p";
                query.Select = 'p.id';
                query.AddWhere(`p.DeletedTag=0`);
                query.AddWhere(`p.InnerKey='${code}' or p.Code='${code}'`);

                const pack = await generalapi.getDataEx(query);

                if (pack.Status != 200) {
                    throw new Error(`查询单据失败: ${pack.Message || '未知错误'}`);
                }

                if (pack.Data.length > 0) {
                    let processAssemblyFlow = pack.Data[0];
                    await this.processScanResult(processAssemblyFlow.id);
                } else {
                    this.$dialog.alert({
                        title: '提示',
                        message: `未找到对应的流程卡单据，请检查扫描的编码是否正确`,
                    });
                }
            } catch (error) {
                console.error('通过内部编号处理扫码结果失败:', error);
                throw error; // 将错误向上传递
            }
        },
        /**
         * 处理物料编码回车事件
         * @param {string} value 物料编码
         */
        async handleMaterialCodeEnter(value) {
            // 标记正在处理回车事件
            this.isHandlingMaterialCodeEnter = true;
            await this.handleMaterialCodeQuery(value);
        },

        /**
         * 处理物料编码查询
         * @param {string} newVal 物料编码
         */
        async handleMaterialCodeQuery(newVal) {
            if (newVal == null || newVal == '') return;
            
            try {
                // 显示加载状态
                this.$toast.loading({
                    message: '正在查询物料...',
                    forbidClick: true,
                    duration: 0
                });
                
                let query = new Query();
                query.TableName = "Material";
                query.ShortName = "m";
                query.Select = 'm.id';
                query.AddWhere(`m.DeletedTag=0`);
                query.AddWhere(`m.Code='${newVal}'`);
                let pack = await generalapi.getDataEx(query);
                
                // 关闭加载状态
                this.$toast.clear();
                
                if (pack.Status == 200) {
                    /**@type {any[]} */
                    var materials = pack.Data;
                    if (materials.length > 0) {
                        let material = pack.Data[0];
                        this.vm.billData.setValue('Materialid', material.id);
                    }
                    else {
                        // 清理输入框内容
                        this.vm.billData.setValue('MaterialCode', '');
                        this.setMaterialInBill(null);
                        this.$toast({
                            message: `未找到编码为 ${newVal} 的物料`,
                            position: 'bottom',
                            duration: 2000
                        });
                    }
                }
                else {
                    // 清理输入框内容
                    this.vm.billData.setValue('MaterialCode', '');
                    this.$toast({
                        message: `查询物料失败: ${pack.Message || '未知错误'}`,
                        position: 'bottom',
                        duration: 2000
                    });
                }
            } catch (error) {
                // 清理标记
                this.isHandlingMaterialCodeEnter = false;
                // 清理输入框内容
                this.vm.billData.setValue('MaterialCode', '');

                // 关闭加载状态
                this.$toast.clear();
                
                console.error('查询物料失败:', error);
                this.$toast({
                    message: `查询物料失败: ${error.message || '未知错误'}`,
                    position: 'bottom',
                    duration: 2000
                });
            }
        },

        /**
         * 处理制令单号回车事件
         * @param {string} value 制令单号
         */
        async handleInnerKeyEnter(value) {
            console.log(value);
            // 标记正在处理回车事件
            this.isHandlingInnerKeyEnter = true;
            await this.handleInnerKeyQuery(this.vm.billData.data.InnerKey);
        },

        /**
         * 处理制令单号查询
         * @param {string} newVal 制令单号
         */
        async handleInnerKeyQuery(newVal) {
            // 输入验证与边界条件处理
            if (newVal == null || newVal === '') return;

            try {
                console.log('扫码或输入单号:', newVal);
                
                // 显示加载状态
                this.$toast.loading({
                    message: '正在查询...',
                    forbidClick: true,
                    duration: 0
                });

                // 使用processScanByDailyPlanDetail方法处理扫码结果
                await this.processScanByDailyPlanDetail(newVal);
                
                // 关闭加载状态
                this.$toast.clear();
            } catch (error) {
                // 清理标记
                this.isHandlingInnerKeyEnter = false;
                // 清理输入框内容
                this.vm.billData.setValue('InnerKey', '');

                // 关闭加载状态
                this.$toast.clear();
                
                console.error('扫码处理失败:', error);
                this.$toast({
                    message: `扫码查询失败: ${error.message || '未知错误'}`,
                    position: 'bottom',
                    duration: 2000
                });
            }
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
    padding: 0 1.46vw;
    /* 15px -> 1.46vw (15/1024*100) */
    cursor: pointer;
    height: 100%;
    transition: all 0.2s ease;
    user-select: none;

    &:hover {
        background-color: rgba(0, 0, 0, 0.05);
    }

    .van-icon {
        font-size: 2.08vh;
        /* 16px -> 2.08vh (16/768*100) */
        margin-right: 0.49vw;
        /* 5px -> 0.49vw (5/1024*100) */
    }

    span {
        font-size: 1.82vh;
        /* 14px -> 1.82vh (14/768*100) */
    }
}

/* 固定头部面板容器样式 */
.header-panel-container {
    background-color: #f9f9f9;
    border-bottom: 0.13vh solid rgba(0, 0, 0, 0.1);
    /* 1px -> 0.13vh (1/768*100) */
    box-shadow: 0 0.26vh 0.52vh rgba(0, 0, 0, 0.05);
    /* 2px 4px -> 0.26vh 0.52vh (2/768*100, 4/768*100) */
    z-index: 10;
}

/* 固定头部面板样式 */
.fixed-header-panel {
    margin-bottom: 0 !important;
    border-bottom: none !important;
    box-shadow: none !important;
}

/* 滚动区域内头部面板样式 */
.scrollable-header-panel {
    /* 特定针对滚动区域内的样式，如有需要 */
}

/* 窄屏下固定顶部区域样式 */
.assembly-flow__sticky-header {
    .mobile-header-section {
        .van-field {
            padding: 0.65vh 0.98vw;  /* 减少padding，5px -> 0.65vh (5/768*100), 10px -> 0.98vw (10/1024*100) */
            margin-bottom: 0.26vh;   /* 减少间距，2px -> 0.26vh (2/768*100) */

            .van-cell__title {
                margin-right: 0.49vw;  /* 减少标签右边距，5px -> 0.49vw (5/1024*100) */
            }

            .van-field__control {
                height: 2.60vh;  /* 减少输入框高度，20px -> 2.60vh (20/768*100) */
                min-height: 2.60vh;  /* 确保最小高度一致 */
                line-height: 2.60vh;  /* 行高与高度一致 */
            }
        }

        /* 移除最后一个字段的底部间距 */
        .van-field:last-child {
            margin-bottom: 0;
        }
    }
}

/* 宽屏模式下内容区域调整 */
@media screen and (min-width: 800px) {
    .assembly-flow__page-content {
        padding-top: 1.04vh;
        /* 8px -> 1.04vh (8/768*100) */
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
    /* 确认对话框层级 */
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
    border-radius: 1.04vh !important;
    /* 8px -> 1.04vh (8/768*100) */
    /* 确保四个角都有相同的圆角 */
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
    border-radius: 1.04vh !important;
    /* 8px -> 1.04vh (8/768*100) */
    /* 确保四个角都有相同的圆角 */
}

/* 修复Vant对话框底部圆角丢失问题 */
.van-dialog__content,
.van-dialog__footer {
    border-bottom-left-radius: 1.04vh !important;
    /* 8px -> 1.04vh (8/768*100) */
    border-bottom-right-radius: 1.04vh !important;
    /* 8px -> 1.04vh (8/768*100) */
    overflow: hidden;
}

/* 修复系统对话框圆角问题 */
body .van-dialog,
body .van-popup {
    border-radius: 1.04vh !important;
    /* 8px -> 1.04vh (8/768*100) */
}

/* 确保对话框内内容和底部都有圆角 */
body .van-dialog__content,
body .van-dialog__footer {
    border-bottom-left-radius: 1.04vh !important;
    /* 8px -> 1.04vh (8/768*100) */
    border-bottom-right-radius: 1.04vh !important;
    /* 8px -> 1.04vh (8/768*100) */
    overflow: hidden;
}

/* 对话框遮罩层 */
.van-overlay.van-dialog__overlay {
    z-index: var(--z-index-overlay);
}

/* 窄屏下的对话框样式调整 */
@media screen and (max-width: 799px) {
    .assembly-flow-popup {
        margin: 0 !important;
        max-height: 90vh !important;
        overflow-y: auto !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        
        /* 确保内容可以滚动 */
        .van-dialog__content {
            max-height: calc(90vh - 108px);
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
        }
        
        /* 优化对话框标题栏 */
        .dialog-title {
            position: sticky;
            top: 0;
            background: #fff;
            z-index: 1;
            padding: 16px;
            border-bottom: 1px solid #eee;
        }
        
        /* 调整内容区域的padding */
        .van-dialog__content {
            padding: 10px;
        }
        
        /* 确保对话框内的label宽度足够显示2个汉字 */
        .van-field__label {
            min-width: 70px !important;
            width: auto !important;
            flex: 0 0 70px !important;
        }
        
        /* 对van-field应用紧凑布局 */
        .van-field {
            padding: 8px 10px !important;
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