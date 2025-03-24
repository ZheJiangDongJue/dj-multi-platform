<!-- 卡片列表组件 -->
<template>
    <div class="card-list">
        <div v-if="isEmpty">
            <van-empty description="暂无数据" />
        </div>
        <div v-if="!isEmpty">
            <div v-if="isWideScreen">
                <GridContainer class="card-item" v-for="(item, index) in details"
                    :key="index" :class="getClassForRowStatus(item)"
                    :rows="['auto', 'auto', 'auto']" :columns="['*', '*', '*', '*', '*', '*']">
                    <GridItem :row="0" :column="0" :column-span="2">
                        <van-field v-model="item.TypeofWorkName" label="工种"
                            :label-width="fontSize * 2" :readonly="isReadOnly"
                            v-long-press-tooltip="item.TypeofWorkName" />
                    </GridItem>
                    <GridItem :row="0" :column="2" :column-span="2">
                        <van-field v-model="item.VestInName" label="操作工"
                            :label-width="fontSize * 3" :readonly="isReadOnly"
                            v-long-press-tooltip="item.VestInName" />
                    </GridItem>
                    <GridItem :row="1" :column="0" :column-span="6">
                        <van-field v-model="item.Content" label="工艺内容"
                            :label-width="fontSize * 4" :readonly="isReadOnly"
                            v-long-press-tooltip="item.Content" />
                    </GridItem>
                    <GridItem :row="2" :column="0" :column-span="6">
                        <van-field v-model="item.WorkRequirements" label="工艺要求"
                            :label-width="fontSize * 4" :readonly="isReadOnly"
                            v-long-press-tooltip="item.WorkRequirements" />
                    </GridItem>
                    <GridItem :row="3" :column="0" :column-span="2">
                        <van-field v-model="item.BQty" label="计划数" :label-width="fontSize * 3"
                            :readonly="isReadOnly"
                            v-long-press-tooltip="item.BQty" />
                    </GridItem>
                    <GridItem :row="3" :column="2" :column-span="2">
                        <van-field v-model="item.PreCmpBQty" label="生产数"
                            :label-width="fontSize * 3" :readonly="isReadOnly"
                            v-long-press-tooltip="item.PreCmpBQty" />
                    </GridItem>
                    <GridItem :row="3" :column="4" :column-span="2">
                        <van-field v-model="item.CmpBQty" label="合格数"
                            :label-width="fontSize * 3" :readonly="isReadOnly"
                            v-long-press-tooltip="item.CmpBQty" />
                    </GridItem>
                    <GridItem :row="4" :column="0" :column-span="3" :style="{ padding: '5px' }">
                        <van-button :class="getReceiveStatusClass(item.ReceiveStatus)"
                            style="width: 100%" @click="handleReceive(item)"
                            :disabled="isReceiveButtonDisabled(item)">
                            {{ getReceiveStatusText(item.ReceiveStatus) }}
                        </van-button>
                    </GridItem>
                    <GridItem :row="4" :column="3" :column-span="3" :style="{ padding: '5px' }">
                        <van-button :class="getCompleteStatusClass(item.CompleteStatus)"
                            style="width: 100%" @click="handleComplete(item)"
                            :disabled="isCompleteButtonDisabled(item)">
                            {{ getCompleteStatusText(item.CompleteStatus) }}
                        </van-button>
                    </GridItem>
                </GridContainer>
            </div>
            <div v-else>
                <div class="card-item" v-for="(item, index) in details"
                    :key="index">
                    <van-form>
                        <van-cell-group :title="'序号:' + getIndex(index)" :border="false"
                            :class="getClassForRowStatus(item)">
                            <van-field v-model="item.TypeofWorkName" label="工种"
                                :readonly="isReadOnly"
                                v-long-press-tooltip="item.TypeofWorkName" />
                            <van-field v-model="item.VestInName" label="操作工"
                                :readonly="isReadOnly"
                                v-long-press-tooltip="item.VestInName" />
                            <van-field v-model="item.Content" label="工艺内容"
                                :readonly="isReadOnly"
                                v-long-press-tooltip="item.Content" />
                            <van-field v-model="item.WorkRequirements" label="工艺要求"
                                :readonly="isReadOnly"
                                v-long-press-tooltip="item.WorkRequirements" />
                            <van-field v-model="item.BQty" label="计划数"
                                :readonly="isReadOnly"
                                v-long-press-tooltip="item.BQty" />
                            <van-field v-model="item.PreCmpBQty" label="生产数"
                                :readonly="isReadOnly"
                                v-long-press-tooltip="item.PreCmpBQty" />
                            <van-field v-model="item.CmpBQty" label="合格数"
                                :readonly="isReadOnly"
                                v-long-press-tooltip="item.CmpBQty" />
                            <div style="display: flex; margin-top: 10px;">
                                <van-button :class="getReceiveStatusClass(item.ReceiveStatus)"
                                    style="flex: 1; margin: 5px;" @click="handleReceive(item)"
                                    :disabled="isReceiveButtonDisabled(item)">
                                    {{ getReceiveStatusText(item.ReceiveStatus) }}
                                </van-button>
                                <van-button :class="getCompleteStatusClass(item.CompleteStatus)"
                                    style="flex: 1; margin: 5px;" @click="handleComplete(item)"
                                    :disabled="isCompleteButtonDisabled(item)">
                                    {{ getCompleteStatusText(item.CompleteStatus) }}
                                </van-button>
                            </div>
                        </van-cell-group>
                    </van-form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import GridContainer from '@/components/grid/GridContainer.vue';
import GridItem from '@/components/grid/GridItem.vue';

export default {
    name: 'CardList',
    components: {
        GridContainer,
        GridItem,
    },
    props: {
        details: {
            type: Array,
            default: () => [],
        },
        isReadOnly: {
            type: Boolean, 
            default: false,
        },
        screenWidth: {
            type: Number,
            default: 0,
        },
        fontSize: {
            type: Number,
            default: 14,
        },
    },
    computed: {
        isWideScreen() {
            return this.screenWidth >= 800;
        },
        isEmpty() {
            return !this.details || this.details.length === 0;
        },
    },
    methods: {
        getIndex(index) {
            if (index) {
                return index + 1;
            }
            return '1';
        },
        getClassForRowStatus(rowItem) {
            if (rowItem == null) {
                return '';
            }
            return {
                'card-item-finished': this.isDetailFinished(rowItem),
            };
        },
        // 根据明细的值返回明细是否已完成
        isDetailFinished(rowItem) {
            let 接收状态 = rowItem.ReceiveStatus;
            let 完工状态 = rowItem.CompleteStatus;

            /**
             * 
             * 未开始 = 0,
             * 进行中 = 1,
             * 已完成 = 2,
             * 禁用 = 3,
             */

            //判断该行是否完成
            if ((接收状态 == 2 && 完工状态 == 3) || 完工状态 == 2) {
                return true;
            }
            return false;
        },
        // 获取接收状态的文本
        getReceiveStatusText(status) {
            switch (status) {
                case 0: return '未接收';
                case 1: return '接收中';
                case 2: return '已接收';
                case 3: return '禁用';
                default: return '未接收';
            }
        },
        // 获取完工状态的文本
        getCompleteStatusText(status) {
            switch (status) {
                case 0: return '未完工';
                case 1: return '完工中';
                case 2: return '已完工';
                case 3: return '禁用';
                default: return '未完工';
            }
        },
        // 获取接收状态的样式类
        getReceiveStatusClass(status) {
            return {
                'card-button': true,
                'status-not-started': status === 0,
                'status-in-progress': status === 1,
                'status-completed': status === 2,
                'status-disabled': status === 3
            };
        },
        // 获取完工状态的样式类
        getCompleteStatusClass(status) {
            return {
                'card-button': true,
                'status-not-started': status === 0,
                'status-in-progress': status === 1,
                'status-completed': status === 2,
                'status-disabled': status === 3
            };
        },
        // 判断接收按钮是否应该被禁用
        isReceiveButtonDisabled(item) {
            return item.ReceiveStatus === 3;
        },
        // 判断完工按钮是否应该被禁用
        isCompleteButtonDisabled(item) {
            return item.CompleteStatus === 3;
        },
        // 处理接收按钮点击
        handleReceive(item) {
            // 如果状态为禁用，则不执行任何操作
            if (this.isReceiveButtonDisabled(item)) {
                return;
            }
            this.$emit('receive', item);
        },
        // 处理完工按钮点击
        handleComplete(item) {
            // 如果状态为禁用，则不执行任何操作
            if (this.isCompleteButtonDisabled(item)) {
                return;
            }
            this.$emit('complete', item);
        },
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/style/function.scss";
@import "@/views/technology/ProcessAssemblyFlow/styles/assembly-flow-module.scss";

/* 卡片列表区域 */
.card-list {
    padding: 0 15px 30px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    overflow-y: auto;
    flex: 1;
}

/* 卡片项目默认样式 */
.card-item {
    background: linear-gradient(145deg, #ffffff, #f8f9fa);
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.05);
    padding: 15px;
    margin-bottom: 15px;
    transition: all 0.3s ease;

    /* 悬停状态样式 */
    &:hover {
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
    }
}

/* 已完成卡片项目样式 */
.card-item-finished {
    background: linear-gradient(145deg, #e8f5e9, #c8e6c9);
    border: 1px solid rgba(76, 175, 80, 0.2);
    box-shadow:
        0 4px 15px rgba(76, 175, 80, 0.1),
        0 1px 3px rgba(76, 175, 80, 0.2),
        inset 0 1px 1px rgba(255, 255, 255, 0.9);

    /* 悬停状态样式 */
    &:hover {
        box-shadow:
            0 8px 25px rgba(76, 175, 80, 0.15),
            0 2px 5px rgba(76, 175, 80, 0.25),
            inset 0 1px 1px rgba(255, 255, 255, 0.9);
    }
}

/* 未开始状态按钮样式 */
.status-not-started {
    background: linear-gradient(145deg, #ffffff, #f5f5f5);
    color: #909399;
    border: 1px solid rgba(144, 147, 153, 0.2);

    /* 悬停状态样式 */
    &:hover {
        background: linear-gradient(145deg, #f5f5f5, #e8e8e8);
        color: #606266;
    }
}

/* 进行中状态按钮样式 */
.status-in-progress {
    background: linear-gradient(145deg, #e1f3ff, #d0ecff);
    color: #1989fa;
    border: 1px solid rgba(25, 137, 250, 0.2);

    /* 悬停状态样式 */
    &:hover {
        background: linear-gradient(145deg, #d0ecff, #c0e5ff);
        color: #0d84f0;
    }
}

/* 已完成状态按钮样式 */
.status-completed {
    background: linear-gradient(145deg, #e1f3ea, #d0f0e0);
    color: #19be6b;
    border: 1px solid rgba(25, 190, 107, 0.2);

    /* 悬停状态样式 */
    &:hover {
        background: linear-gradient(145deg, #d0f0e0, #c0e8d0);
        color: #0da959;
    }
}

/* 禁用状态按钮样式 */
.status-disabled {
    background: linear-gradient(145deg, #fde2e2, #fad1d1);
    color: #fa5555;
    border: 1px solid rgba(250, 85, 85, 0.2);

    /* 悬停状态样式 */
    &:hover {
        background: linear-gradient(145deg, #fad1d1, #f7c0c0);
        color: #f53f3f;
    }
}

/* 媒体查询 - 小屏幕样式 */
@include ps {
    .card-list {
        padding: 0 5px 50px;
        /* 增加底部padding，确保内容完全可滚动 */
    }
}
</style> 