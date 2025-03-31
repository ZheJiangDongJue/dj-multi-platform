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
                    :rows="['auto', 'auto', 'auto', 'auto', 'auto', 'auto']" :columns="['40px', '1*', '1*', '1*', '1*', '1*']">
                    <!-- 新增行号显示 -->
                    <GridItem :row="0" :column="0" :row-span="6" class="row-number-container">
                        <div class="row-number">{{ getIndex(index) }}</div>
                    </GridItem>
                    
                    <!-- 添加位置索引显示 -->
                    <GridItem :row="0" :column="5" :column-span="1" class="location-index-container">
                        <div class="location-index" v-if="item.LocationIndex">位置: {{ item.LocationIndex }}</div>
                    </GridItem>
                    
                    <GridItem :row="0" :column="1" :column-span="2">
                        <van-field v-model="item.TypeofWorkName" label="工种"
                            :label-width="fontSize * 2" :readonly="isReadOnly"
                            v-click-tooltip="item.TypeofWorkName" />
                    </GridItem>
                    <GridItem :row="0" :column="3" :column-span="2">
                        <van-field v-model="item.VestInName" label="操作工"
                            :label-width="fontSize * 3" :readonly="isReadOnly"
                            v-click-tooltip="item.VestInName" />
                    </GridItem>
                    <GridItem :row="1" :column="1" :column-span="5">
                        <van-field v-model="item.Content" label="工艺内容"
                            :label-width="fontSize * 4" :readonly="isReadOnly"
                            v-click-tooltip="item.Content" />
                    </GridItem>
                    <GridItem :row="2" :column="1" :column-span="5">
                        <van-field v-model="item.WorkRequirements" label="工艺要求"
                            :label-width="fontSize * 4" :readonly="isReadOnly"
                            v-click-tooltip="item.WorkRequirements" />
                    </GridItem>
                    <GridItem :row="3" :column="1" :column-span="1">
                        <van-field v-model="item.BQty" label="计划数" :label-width="fontSize * 3"
                            :readonly="isReadOnly"
                            v-click-tooltip="item.BQty" />
                    </GridItem>
                    <GridItem :row="3" :column="2" :column-span="2">
                        <van-field v-model="item.PreCmpBQty" label="生产数"
                            :label-width="fontSize * 3" :readonly="isReadOnly"
                            v-click-tooltip="item.PreCmpBQty" />
                    </GridItem>
                    <GridItem :row="3" :column="4" :column-span="2">
                        <van-field v-model="item.CmpBQty" label="合格数"
                            :label-width="fontSize * 3" :readonly="isReadOnly"
                            v-click-tooltip="item.CmpBQty" />
                    </GridItem>
                    <GridItem :row="4" :column="1" :column-span="5" :vertical-alignment="'center'" style="text-align: center; padding: 0 5px;">
                        <div class="button-container">
                            <van-button :class="getReceiveStatusClass(item.ReceiveStatus)"
                                style="flex: 1; margin: 0 5px;" @click="handleReceive(item)"
                                :disabled="isReceiveButtonDisabled(item)">
                                {{ getReceiveStatusText(item.ReceiveStatus) }}
                            </van-button>
                            <van-button :class="getCompleteStatusClass(item.CompleteStatus)"
                                style="flex: 1; margin: 0 5px;" @click="handleComplete(item)"
                                :disabled="isCompleteButtonDisabled(item)">
                                {{ getCompleteStatusText(item.CompleteStatus) }}
                            </van-button>
                        </div>
                    </GridItem>
                </GridContainer>
            </div>
            <div v-else>
                <div class="card-item" v-for="(item, index) in details"
                    :key="index">
                    <van-form>
                        <van-cell-group :title="'序号:' + getIndex(index)" :border="false"
                            :class="getClassForRowStatus(item)">
                            <!-- 添加位置索引显示 - 窄屏模式 -->
                            <div class="location-index-mobile" v-if="item.LocationIndex">位置: {{ item.LocationIndex }}</div>
                            
                            <van-field v-model="item.TypeofWorkName" label="工种"
                                :readonly="isReadOnly"
                                v-click-tooltip="item.TypeofWorkName" />
                            <van-field v-model="item.VestInName" label="操作工"
                                :readonly="isReadOnly"
                                v-click-tooltip="item.VestInName" />
                            <van-field v-model="item.Content" label="工艺内容"
                                :readonly="isReadOnly"
                                v-click-tooltip="item.Content" />
                            <van-field v-model="item.WorkRequirements" label="工艺要求"
                                :readonly="isReadOnly"
                                v-click-tooltip="item.WorkRequirements" />
                            <van-field v-model="item.BQty" label="计划数"
                                :readonly="isReadOnly"
                                v-click-tooltip="item.BQty" />
                            <van-field v-model="item.PreCmpBQty" label="生产数"
                                :readonly="isReadOnly"
                                v-click-tooltip="item.PreCmpBQty" />
                            <van-field v-model="item.CmpBQty" label="合格数"
                                :readonly="isReadOnly"
                                v-click-tooltip="item.CmpBQty" />
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
            if (index !== undefined) {
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
    padding: 0 1.46vw 3.91vh; /* 15px 30px -> 1.46vw 3.91vh (15/1024*100, 30/768*100) */
    display: flex;
    flex-direction: column;
    gap: 1.95vh; /* 15px -> 1.95vh (15/768*100) */
    overflow-y: auto;
    flex: 1;
}

/* 卡片项目默认样式 */
.card-item {
    background: linear-gradient(145deg, #ffffff, #f8f9fa);
    border-radius: 1.3vh; /* 10px -> 1.3vh (10/768*100) */
    box-shadow: 0 0.26vh 1.04vh rgba(0, 0, 0, 0.05); /* 2px 8px -> 0.26vh 1.04vh (2/768*100, 8/768*100) */
    border: 0.13vh solid rgba(0, 0, 0, 0.05); /* 1px -> 0.13vh (1/768*100) */
    padding: 1.95vh; /* 15px -> 1.95vh (15/768*100) */
    margin-bottom: 1.95vh; /* 15px -> 1.95vh (15/768*100) */
    transition: all 0.3s ease;

    /* 悬停状态样式 */
    &:hover {
        box-shadow: 0 0.52vh 1.95vh rgba(0, 0, 0, 0.1); /* 4px 15px -> 0.52vh 1.95vh (4/768*100, 15/768*100) */
        transform: translateY(-0.26vh); /* -2px -> -0.26vh (2/768*100) */
    }
}

/* 已完成卡片项目样式 */
.card-item-finished {
    background: linear-gradient(145deg, #e8f5e9, #c8e6c9);
    border: 0.13vh solid rgba(76, 175, 80, 0.2); /* 1px -> 0.13vh (1/768*100) */
    box-shadow:
        0 0.52vh 1.95vh rgba(76, 175, 80, 0.1), /* 4px 15px -> 0.52vh 1.95vh (4/768*100, 15/768*100) */
        0 0.13vh 0.39vh rgba(76, 175, 80, 0.2), /* 1px 3px -> 0.13vh 0.39vh (1/768*100, 3/768*100) */
        inset 0 0.13vh 0.13vh rgba(255, 255, 255, 0.9); /* 1px 1px -> 0.13vh 0.13vh (1/768*100, 1/768*100) */

    /* 悬停状态样式 */
    &:hover {
        box-shadow:
            0 1.04vh 3.26vh rgba(76, 175, 80, 0.15), /* 8px 25px -> 1.04vh 3.26vh (8/768*100, 25/768*100) */
            0 0.26vh 0.65vh rgba(76, 175, 80, 0.25), /* 2px 5px -> 0.26vh 0.65vh (2/768*100, 5/768*100) */
            inset 0 0.13vh 0.13vh rgba(255, 255, 255, 0.9); /* 1px 1px -> 0.13vh 0.13vh (1/768*100, 1/768*100) */
    }
}

/* 未开始状态按钮样式 */
.status-not-started {
    background: linear-gradient(145deg, #ffffff, #f5f5f5);
    color: #909399;
    border: 0.13vh solid rgba(144, 147, 153, 0.2); /* 1px -> 0.13vh (1/768*100) */

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
    border: 0.13vh solid rgba(25, 137, 250, 0.2); /* 1px -> 0.13vh (1/768*100) */

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
    border: 0.13vh solid rgba(25, 190, 107, 0.2); /* 1px -> 0.13vh (1/768*100) */

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
    border: 0.13vh solid rgba(250, 85, 85, 0.2); /* 1px -> 0.13vh (1/768*100) */

    /* 悬停状态样式 */
    &:hover {
        background: linear-gradient(145deg, #fad1d1, #f7c0c0);
        color: #f53f3f;
    }
}

/* 媒体查询 - 小屏幕样式 */
@include ps {
    .card-list {
        padding: 0 0.49vw 6.51vh; /* 5px 50px -> 0.49vw 6.51vh (5/1024*100, 50/768*100) */
        /* 增加底部padding，确保内容完全可滚动 */
    }
}

/* 行号容器样式 */
.row-number-container {
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 0.13vh dashed rgba(0, 0, 0, 0.1); /* 1px -> 0.13vh (1/768*100) */
    background-color: rgba(0, 0, 0, 0.02);
}

/* 行号样式 */
.row-number {
    font-size: 2.08vh; /* 16px -> 2.08vh (16/768*100) */
    font-weight: bold;
    color: #909399;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
}

/* 完成卡片内的行号样式调整 */
.card-item-finished .row-number {
    color: #19be6b;
}

/* 位置索引容器样式 */
.location-index-container {
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    padding: 0.65vh 0.98vw 0 0; /* 5px 10px 0 0 -> 0.65vh 0.98vw 0 0 (5/768*100, 10/1024*100, 0, 0) */
}

/* 位置索引样式 */
.location-index {
    font-size: 1.82vh; /* 14px -> 1.82vh (14/768*100) */
    color: #606266;
    background-color: rgba(0, 0, 0, 0.03);
    padding: 0.26vh 0.78vw; /* 2px 8px -> 0.26vh 0.78vw (2/768*100, 8/1024*100) */
    border-radius: 1.56vh; /* 12px -> 1.56vh (12/768*100) */
    border: 0.13vh solid rgba(0, 0, 0, 0.05); /* 1px -> 0.13vh (1/768*100) */
}

/* 移动端位置索引样式 */
.location-index-mobile {
    font-size: 1.82vh; /* 14px -> 1.82vh (14/768*100) */
    color: #606266;
    background-color: rgba(0, 0, 0, 0.03);
    padding: 0.26vh 0.78vw; /* 2px 8px -> 0.26vh 0.78vw (2/768*100, 8/1024*100) */
    border-radius: 1.56vh; /* 12px -> 1.56vh (12/768*100) */
    border: 0.13vh solid rgba(0, 0, 0, 0.05); /* 1px -> 0.13vh (1/768*100) */
    display: inline-block;
    margin: 0.65vh 0 0.65vh auto; /* 5px 0 5px auto -> 0.65vh 0 0.65vh auto (5/768*100, 0, 5/768*100, auto) */
    float: right;
}

/* 完成卡片内的位置索引样式调整 */
.card-item-finished .location-index,
.card-item-finished .location-index-mobile {
    color: #19be6b;
    background-color: rgba(25, 190, 107, 0.05);
    border: 0.13vh solid rgba(25, 190, 107, 0.1); /* 1px -> 0.13vh (1/768*100) */
}

/* 按钮容器样式 */
.button-container {
    display: flex;
    width: 100%;
    justify-content: space-between;
    padding: 0.65vh 0; /* 5px 0 -> 0.65vh 0 (5/768*100, 0) */
    gap: 1.95vh; /* 15px -> 1.95vh (15/768*100) */
    /* 增加按钮之间的间距 */
}
</style> 