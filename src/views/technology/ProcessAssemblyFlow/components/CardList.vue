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
                    :rows="['auto', 'auto', 'auto']" :columns="['40px', '1*', '1*', '1*', 'auto']">
                    <!-- 新增行号显示 -->
                    <GridItem :row="0" :column="0" :row-span="3" class="row-number-container">
                        <div class="row-number">{{ getIndex(index) }}</div>
                    </GridItem>
                    
                    <!-- 第一行：工种和计划数 -->
                    <GridItem :row="0" :column="1" :column-span="2">
                        <van-field v-model="item.TypeofWorkName" label="工种"
                            :label-width="getLabelWidth(2)" :readonly="isReadOnly"
                            v-click-tooltip="item.TypeofWorkName" />
                    </GridItem>
                    <GridItem :row="0" :column="3" :column-span="1">
                        <van-field v-model="item.BQty" label="计划数" :label-width="getLabelWidth(3)"
                            :readonly="isReadOnly" class="qty-field"
                            v-click-tooltip="item.BQty" />
                    </GridItem>
                    <!-- 位置索引显示 -->
                    <GridItem :row="0" :column="4" :column-span="1" class="location-index-container">
                        <div class="location-index" v-if="item.LocationIndex">位置: {{ item.LocationIndex }}</div>
                    </GridItem>
                    
                    <!-- 第二行：工艺内容、生产数、接收按钮 -->
                    <GridItem :row="1" :column="1" :column-span="2">
                        <van-field v-model="item.Content" label="工艺内容"
                            :label-width="getLabelWidth(4)" :readonly="isReadOnly"
                            v-click-tooltip="item.Content" />
                    </GridItem>
                    <GridItem :row="1" :column="3" :column-span="1">
                        <van-field v-model="item.PreCmpBQty" label="生产数"
                            :label-width="getLabelWidth(3)" :readonly="isReadOnly" class="qty-field"
                            v-click-tooltip="item.PreCmpBQty" />
                    </GridItem>
                    <GridItem :row="1" :column="4" :column-span="1" class="button-cell">
                        <van-button :class="getReceiveStatusClass(item.ReceiveStatus)"
                            class="small-button" @click="handleReceive(item)"
                            :disabled="isReceiveButtonDisabled(item)">
                            {{ getReceiveStatusText(item.ReceiveStatus) }}
                        </van-button>
                    </GridItem>
                    
                    <!-- 第三行：工艺要求、合格数、完工按钮 -->
                    <GridItem :row="2" :column="1" :column-span="2">
                        <van-field v-model="item.WorkRequirements" label="工艺要求"
                            :label-width="getLabelWidth(4)" :readonly="isReadOnly"
                            v-click-tooltip="item.WorkRequirements" />
                    </GridItem>
                    <GridItem :row="2" :column="3" :column-span="1">
                        <van-field v-model="item.CmpBQty" label="合格数"
                            :label-width="getLabelWidth(3)" :readonly="isReadOnly" class="qty-field"
                            v-click-tooltip="item.CmpBQty" />
                    </GridItem>
                    <GridItem :row="2" :column="4" :column-span="1" class="button-cell">
                        <van-button :class="getCompleteStatusClass(item.CompleteStatus)"
                            class="small-button" @click="handleComplete(item)"
                            :disabled="isCompleteButtonDisabled(item)">
                            {{ getCompleteStatusText(item.CompleteStatus) }}
                        </van-button>
                    </GridItem>
                </GridContainer>
            </div>
            <div v-else>
                <div class="card-item" v-for="(item, index) in details"
                    :key="index">
                    <van-form class="compact-form">
                        <van-cell-group :title="'序号:' + getIndex(index)" :border="false"
                            :class="getClassForRowStatus(item)">
                            <!-- 添加位置索引显示 - 窄屏模式 -->
                            <div class="location-index-mobile" v-if="item.LocationIndex">位置: {{ item.LocationIndex }}</div>
                            
                            <!-- 第一行：工种和计划数 -->
                            <div class="mobile-row">
                                <van-field v-model="item.TypeofWorkName" label="工种"
                                    :readonly="isReadOnly" class="field-grow"
                                    v-click-tooltip="item.TypeofWorkName" />
                                <van-field v-model="item.BQty" label="计划数"
                                    :readonly="isReadOnly" class="qty-field"
                                    v-click-tooltip="item.BQty" />
                            </div>
                            
                            <!-- 第二行：工艺内容、生产数、接收按钮 -->
                            <div class="mobile-row">
                                <van-field v-model="item.Content" label="工艺内容"
                                    :readonly="isReadOnly" class="field-grow"
                                    v-click-tooltip="item.Content" />
                                <van-field v-model="item.PreCmpBQty" label="生产数"
                                    :readonly="isReadOnly" class="qty-field"
                                    v-click-tooltip="item.PreCmpBQty" />
                                <van-button :class="getReceiveStatusClass(item.ReceiveStatus)"
                                    class="small-button mobile-button" @click="handleReceive(item)"
                                    :disabled="isReceiveButtonDisabled(item)">
                                    {{ getReceiveStatusText(item.ReceiveStatus) }}
                                </van-button>
                            </div>
                            
                            <!-- 第三行：工艺要求、合格数、完工按钮 -->
                            <div class="mobile-row">
                                <van-field v-model="item.WorkRequirements" label="工艺要求"
                                    :readonly="isReadOnly" class="field-grow"
                                    v-click-tooltip="item.WorkRequirements" />
                                <van-field v-model="item.CmpBQty" label="合格数"
                                    :readonly="isReadOnly" class="qty-field"
                                    v-click-tooltip="item.CmpBQty" />
                                <van-button :class="getCompleteStatusClass(item.CompleteStatus)"
                                    class="small-button mobile-button" @click="handleComplete(item)"
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
        /**
         * 根据屏幕大小动态计算标签宽度
         * @param {Number} charCount - 标签内容的字符数量
         * @returns {String|Number} - 返回计算好的标签宽度，小屏幕返回'auto'，大屏幕返回像素值
         */
        getLabelWidth(charCount) {
            // 确保输入参数有效
            if (typeof charCount !== 'number' || charCount <= 0) {
                charCount = 2; // 默认最小字符数
            }
            
            // 大屏幕时根据字符数和字体大小计算标签宽度
            if (this.isWideScreen) {
                // 计算标签宽度，每个字符的宽度大约为字体大小，再加上一些内边距
                const padding = 10; // 假设内边距为10px
                let labelWidth = (this.fontSize * charCount) + padding;
                
                // 设置最小宽度以确保标签不会太窄
                return Math.max(labelWidth, 50) + 'px';
            } else {
                // 小屏幕时使用auto自动适应，避免挤压
                return 'auto';
            }
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
    gap: 1.56vh; /* 12px -> 1.56vh (12/768*100) - 缩小间距 */
    overflow-y: auto;
    flex: 1;
}

/* 卡片项目默认样式 */
.card-item {
    background: linear-gradient(145deg, #ffffff, #f8f9fa);
    border-radius: 1.3vh; /* 10px -> 1.3vh (10/768*100) */
    box-shadow: 0 0.26vh 1.04vh rgba(0, 0, 0, 0.05); /* 2px 8px -> 0.26vh 1.04vh (2/768*100, 8/768*100) */
    border: 0.13vh solid rgba(0, 0, 0, 0.05); /* 1px -> 0.13vh (1/768*100) */
    padding: 1.3vh; /* 10px -> 1.3vh (10/768*100) - 缩小内边距 */
    margin-bottom: 1.56vh; /* 12px -> 1.56vh (12/768*100) - 缩小间距 */
    transition: all 0.3s ease;

    /* 悬停状态样式 */
    &:hover {
        box-shadow: 0 0.52vh 1.95vh rgba(0, 0, 0, 0.1); /* 4px 15px -> 0.52vh 1.95vh (4/768*100, 15/768*100) */
        transform: translateY(-0.26vh); /* -2px -> -0.26vh (2/768*100) */
    }
}

/* 减小行内元素间的间距 */
:deep(.van-grid-item) {
    padding: 0.65vh 0.49vw; /* 5px 5px -> 0.65vh 0.49vw (5/768*100, 5/1024*100) */
}

/* 减小表单域的内边距 */
:deep(.van-field) {
    padding: 0.65vh 0.49vw; /* 5px 5px -> 0.65vh 0.49vw (5/768*100, 5/1024*100) */
}

/* 确保大屏幕下label始终横向显示 */
:deep(.van-field__label) {
    width: auto !important; /* 防止宽度被挤压 */
    white-space: nowrap !important; /* 防止换行 */
    overflow: visible !important; /* 防止内容被截断 */
    flex: 0 0 auto !important; /* 防止被flex布局压缩 */
    min-width: 4.88vw; /* 50px -> 4.88vw (50/1024*100) - 设置最小宽度 */
    margin-right: 0.98vw; /* 10px -> 0.98vw (10/1024*100) - 增加右侧间距 */
}

/* 确保字段内容占据剩余空间 */
:deep(.van-field__value) {
    flex: 1 !important;
    overflow: hidden !important;
    display: flex !important; /* 确保内部元素也是flex布局 */
}

/* 确保输入框内容正确显示 */
:deep(.van-field__body) {
    min-width: 0 !important; /* 允许宽度收缩 */
    flex: 1 !important; /* 占据所有可用空间 */
}

:deep(.van-field__control) {
    width: 100% !important; /* 确保输入控件占据全部可用宽度 */
    text-overflow: ellipsis !important; /* 文本溢出时显示省略号 */
    overflow: hidden !important; /* 隐藏溢出内容 */
}

/* 大屏幕特定样式 */
@media screen and (min-width: 800px) {
    :deep(.van-field) {
        display: flex !important;
        flex-direction: row !important; /* 确保大屏幕模式是横向的 */
        align-items: center !important;
    }
}

/* 小屏幕特定样式 */
@media screen and (max-width: 799px) {
    .mobile-row {
        :deep(.van-field) {
            padding: 0.39vh 0.49vw !important; /* 3px 5px -> 0.39vh 0.49vw (3/768*100, 5/1024*100) */
        }
        
        :deep(.van-field__label) {
            min-width: auto !important; /* 移动端下不设置最小宽度 */
            margin-right: 0.49vw !important; /* 5px -> 0.49vw (5/1024*100) - 减小右侧间距 */
            font-size: 1.69vh !important; /* 13px -> 1.69vh (13/768*100) - 稍微缩小字体 */
        }
    }
}

/* 数量字段统一宽度 */
.qty-field {
    width: 100%;

    :deep(.van-field__control) {
        text-align: left;
    }
}

/* 按钮单元格样式 */
.button-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 0.78vw; /* 0 8px -> 0 0.78vw (0, 8/1024*100) */
}

/* 小型按钮样式 */
.small-button {
    min-width: 7.81vw; /* 80px -> 7.81vw (80/1024*100) */
    max-width: 10.74vw; /* 110px -> 10.74vw (110/1024*100) */
    height: 4.17vh; /* 32px -> 4.17vh (32/768*100) */
    padding: 0 0.98vw; /* 0 10px -> 0 0.98vw (0, 10/1024*100) */
    font-size: 1.56vh; /* 12px -> 1.56vh (12/768*100) */
    line-height: 1;
    border-radius: 0.65vh; /* 5px -> 0.65vh (5/768*100) */
}

/* 紧凑型表单样式 */
.compact-form {
    :deep(.van-cell) {
        padding: 0.65vh 0.98vw; /* 5px 10px -> 0.65vh 0.98vw (5/768*100, 10/1024*100) */
    }
}

/* 移动端行样式 */
.mobile-row {
    display: flex;
    align-items: center;
    margin-bottom: 0.65vh; /* 5px -> 0.65vh (5/768*100) */
    gap: 0.65vh; /* 5px -> 0.65vh (5/768*100) */
}

/* 移动端按钮样式 */
.mobile-button {
    min-width: 0;
    max-width: 8.79vw; /* 90px -> 8.79vw (90/1024*100) */
    margin: 0 0 0 0.49vw; /* 0 0 0 5px -> 0 0 0 0.49vw (0, 0, 0, 5/1024*100) */
    flex-shrink: 0;
}

/* 字段自动伸缩 */
.field-grow {
    flex-grow: 1;
    flex-shrink: 1;
    min-width: 0;
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
    padding-top: 0.65vh; /* 5px -> 0.65vh (5/768*100) */
}

/* 位置索引样式 */
.location-index {
    font-size: 1.56vh; /* 12px -> 1.56vh (12/768*100) - 缩小字体 */
    color: #606266;
    background-color: rgba(0, 0, 0, 0.03);
    padding: 0.26vh 0.78vw; /* 2px 8px -> 0.26vh 0.78vw (2/768*100, 8/1024*100) */
    border-radius: 1.3vh; /* 10px -> 1.3vh (10/768*100) */
    border: 0.13vh solid rgba(0, 0, 0, 0.05); /* 1px -> 0.13vh (1/768*100) */
}

/* 移动端位置索引样式 */
.location-index-mobile {
    font-size: 1.56vh; /* 12px -> 1.56vh (12/768*100) - 缩小字体 */
    color: #606266;
    background-color: rgba(0, 0, 0, 0.03);
    padding: 0.26vh 0.78vw; /* 2px 8px -> 0.26vh 0.78vw (2/768*100, 8/1024*100) */
    border-radius: 1.3vh; /* 10px -> 1.3vh (10/768*100) */
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
    padding: 0.39vh 0; /* 3px 0 -> 0.39vh 0 (3/768*100, 0) - 减小内边距 */
    gap: 0.98vh; /* 7.5px -> 0.98vh (7.5/768*100) - 减小间距 */
}
</style> 