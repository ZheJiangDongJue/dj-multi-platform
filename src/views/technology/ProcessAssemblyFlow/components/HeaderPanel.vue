<!-- 头部面板组件 -->
<template>
    <div class="header-panel">
        <!-- 宽屏布局 -->
        <div v-if="isWideScreen" class="header-content">
            <div class="header-row">
                <van-field :value="billData.data.MaterialCode" label="物料编码"
                    placeholder="请输入完整编码" :readonly="isReadOnly" label-width="6vw"
                    v-click-tooltip="billData.data.MaterialCode" 
                    @input="updateField('MaterialCode', $event)" />
                <van-field :value="billData.data.MaterialName" label="物料名称"
                    label-width="6vw" :readonly="isReadOnly"
                    v-click-tooltip="billData.data.MaterialName" 
                    @input="updateField('MaterialName', $event)" />
                <van-field :value="billData.data.MaterialSpecType" label="规格型号"
                    label-width="6vw" :readonly="isReadOnly"
                    v-click-tooltip="billData.data.MaterialSpecType" 
                    @input="updateField('MaterialSpecType', $event)" />
            </div>
            <div class="header-row">
                <van-field :value="billData.data.InnerKey" label="制令单号" label-width="6vw"
                    :readonly="isReadOnly"
                    v-click-tooltip="billData.data.InnerKey" 
                    @input="updateField('InnerKey', $event)" />
                <van-field :value="billData.data.MaterialTuHao" label="物料图号"
                    label-width="6vw" :readonly="isReadOnly"
                    v-click-tooltip="billData.data.MaterialTuHao" 
                    @input="updateField('MaterialTuHao', $event)" />
                <van-field :value="billData.data.MaterialSpecTypeExplain" label="规格型号说明"
                    label-width="9vw" :readonly="isReadOnly"
                    v-click-tooltip="billData.data.MaterialSpecTypeExplain" 
                    @input="updateField('MaterialSpecTypeExplain', $event)" />
            </div>
            <div class="header-row">
                <van-field :value="billData.data.BQty" label="计划数" label-width="6vw"
                    :readonly="isReadOnly"
                    v-click-tooltip="billData.data.BQty" 
                    @input="updateField('BQty', $event)" />
                <van-field :value="billData.data.PreCmpBQty" label="生产数" label-width="6vw"
                    :readonly="isReadOnly"
                    v-click-tooltip="billData.data.PreCmpBQty" 
                    @input="updateField('PreCmpBQty', $event)" />
                <van-field :value="billData.data.CmpBQty" label="合格数" label-width="9vw"
                    :readonly="isReadOnly"
                    v-click-tooltip="billData.data.CmpBQty" 
                    @input="updateField('CmpBQty', $event)" />
            </div>
            <div class="header-row">
                <van-field :value="formatDate(billData.data.DocumentTime)" label="单据日期"
                    label-width="6vw" :readonly="isReadOnly"
                    v-click-tooltip="formatDate(billData.data.DocumentTime)" 
                    @input="updateField('DocumentTime', $event)" />
                <van-field :value="billData.data.Code" label="单据编号" label-width="6vw"
                    :readonly="isReadOnly"
                    v-click-tooltip="billData.data.Code" 
                    @input="updateField('Code', $event)" />
            </div>
        </div>

        <!-- 窄屏布局 -->
        <div v-else class="header-content mobile-header-content">
            <div class="mobile-header-section">
                <van-field :value="billData.data.MaterialName" label="物料名称"
                    label-width="70px" :readonly="isReadOnly"
                    v-click-tooltip="billData.data.MaterialName" 
                    @input="updateField('MaterialName', $event)" />
                <van-field :value="billData.data.MaterialSpecType" label="规格型号"
                    label-width="70px" :readonly="isReadOnly"
                    v-click-tooltip="billData.data.MaterialSpecType" 
                    @input="updateField('MaterialSpecType', $event)" />
                <van-field :value="billData.data.InnerKey" label="制令单号" label-width="70px"
                    :readonly="isReadOnly"
                    v-click-tooltip="billData.data.InnerKey" 
                    @input="updateField('InnerKey', $event)" />
                <van-field :value="billData.data.MaterialTuHao" label="物料图号"
                    label-width="70px" :readonly="isReadOnly"
                    v-click-tooltip="billData.data.MaterialTuHao" 
                    @input="updateField('MaterialTuHao', $event)" />
                <van-field :value="billData.data.MaterialSpecTypeExplain" label="规格型号说明"
                    label-width="70px" :readonly="isReadOnly"
                    v-click-tooltip="billData.data.MaterialSpecTypeExplain" 
                    @input="updateField('MaterialSpecTypeExplain', $event)" />
                <van-field :value="billData.data.PreCmpBQty" label="生产数" label-width="70px"
                    :readonly="isReadOnly"
                    v-click-tooltip="billData.data.PreCmpBQty" 
                    @input="updateField('PreCmpBQty', $event)" />
                <van-field :value="billData.data.CmpBQty" label="合格数" label-width="70px"
                    :readonly="isReadOnly"
                    v-click-tooltip="billData.data.CmpBQty" 
                    @input="updateField('CmpBQty', $event)" />
                <van-field :value="formatDate(billData.data.DocumentTime)" label="单据日期"
                    label-width="70px" :readonly="isReadOnly"
                    v-click-tooltip="formatDate(billData.data.DocumentTime)" 
                    @input="updateField('DocumentTime', $event)" />
                <van-field :value="billData.data.Code" label="单据编号" label-width="70px"
                    :readonly="isReadOnly"
                    v-click-tooltip="billData.data.Code" 
                    @input="updateField('Code', $event)" />
            </div>
        </div>
    </div>
</template>

<script>
import { formatDate } from '@/utils/date-utils';

export default {
    name: 'HeaderPanel',
    props: {
        billData: {
            type: Object,
            required: true,
        },
        isReadOnly: {
            type: Boolean,
            default: false,
        },
        screenWidth: {
            type: Number,
            default: 0,
        },
    },
    computed: {
        isWideScreen() {
            return this.screenWidth >= 800;
        },
    },
    methods: {
        updateField(field, value) {
            this.$emit('update:field', { field, value });
        },
        formatDate
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/style/function.scss";

/* 头部面板样式 */
.header-panel {
    background: linear-gradient(145deg, #ffffff, #f8f9fa);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    padding: 15px 20px;
    margin-bottom: 15px;
    position: relative;
    width: 100%;
    box-sizing: border-box;
    flex-shrink: 0;

    /* 添加底部分隔线效果 */
    &::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg,
                rgba(0, 0, 0, 0) 0%,
                rgba(0, 0, 0, 0.1) 50%,
                rgba(0, 0, 0, 0) 100%);
    }
}

/* 头部内容样式 */
.header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 15px;
}

/* 头部行样式 */
.header-row {
    display: flex;
    gap: 15px;
    margin-bottom: 10px;

    /* 最后一行无底部边距 */
    &:last-child {
        margin-bottom: 0;
    }

    .van-cell{
        padding: 0;
    }

    /* 头部行中的输入框样式 */
    .van-field {
        flex: 1;
        min-width: 0;
        background: transparent;
        border-radius: 8px;
        transition: all 0.3s ease;

        /* 悬停状态样式 */
        &:hover {
            background: transparent;
        }

        /* 只读状态样式 */
        &.van-field--readonly {
            background: transparent;
        }
    }
}

/* 移动端头部部分样式 */
.mobile-header-section {
    display: flex;
    flex-direction: column;
    gap: 10px;

    /* 移动端输入框样式 */
    .van-field {
        width: 100%;
        margin-bottom: 0;

        /* 确保标签宽度固定，不会导致输入框变高 */
        ::v-deep .van-field__label {
            width: 70px !important;
            flex: 0 0 70px !important;
        }
    }
}

/* 媒体查询 - 小屏幕样式 */
@include ps {
    .header-panel {
        padding: 10px;
        margin-bottom: 10px;
    }
}
</style> 