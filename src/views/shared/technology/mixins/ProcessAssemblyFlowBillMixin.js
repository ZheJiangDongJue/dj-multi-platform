import generalapi from '@/api/general';
import { BillPageViewModel } from '@/core/temporary/bill-page-vm';
import { Query } from '@/core/query';
import craftapi from '@/api/craft';
import { pageStateMixin } from '@/mixins';

// 引入拆分后的组件
import HeaderPanel from '@/views/tablet/technology/components/HeaderPanel.vue';
import ToolbarPanel from '@/views/tablet/technology/components/ToolbarPanel.vue';
import CardList from '@/views/tablet/technology/components/CardList.vue';
import AssemblyProcessReceivePanel from '@/views/tablet/technology/ProcessAssemblyFlow/AssemblyProcessReceivePanel.vue';
import AssemblyProcessCompletionPanel from '@/views/tablet/technology/ProcessAssemblyFlow/AssemblyProcessCompletionPanel.vue';

export default {
    components: {
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
    beforeRouteLeave(_, __, next) {
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
                    this.$toast({
                        message: `该单据的物料无法找到`,
                        position: 'bottom',
                        duration: 2000
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
                    scrollPosition: this.scrollPosition, // 使用保存的滚动位置
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
                        if (this.$refs.billPageTemplate && storedState.scrollPosition) {
                            this.$refs.billPageTemplate.scrollTo(storedState.scrollPosition);
                            this.scrollPosition = storedState.scrollPosition;
                        }
                    });

                    return true;
                }

                return false;
            } catch (error) {
                console.error('恢复单据状态失败:', error);
                return false;
            }
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
        handlePageScroll(scrollPosition) {
            // 保存当前滚动位置
            this.scrollPosition = scrollPosition;

            // 如果滚动距离超过100px，显示回到顶部按钮
            if (scrollPosition > 100) {
                this.showBackToTop = true;
            } else {
                this.showBackToTop = false;
            }
        },

        // 滚动到顶部 - 使用BillPageTemplate的方法
        scrollToTop() {
            if (this.$refs.billPageTemplate) {
                this.$refs.billPageTemplate.scrollToTop();
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
            const currentScrollPosition = this.scrollPosition;
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
                            if (this.$refs.billPageTemplate) {
                                this.$refs.billPageTemplate.scrollTo(currentScrollPosition);
                                console.log('刷新后恢复滚动位置:', currentScrollPosition);

                                // 再次检查滚动位置是否设置成功
                                setTimeout(() => {
                                    // 由于无法直接访问内部滚动位置，我们只记录尝试
                                    console.log('再次尝试设置滚动位置:', currentScrollPosition);
                                    this.$refs.billPageTemplate.scrollTo(currentScrollPosition);
                                }, 100);
                            }
                        }, 50);
                    });
                }
            } catch (error) {
                console.error('刷新数据时出错:', error);
                // 即使刷新失败，也尝试恢复滚动位置
                if (options.preserveScroll && this.$refs.billPageTemplate) {
                    this.$refs.billPageTemplate.scrollTo(currentScrollPosition);
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