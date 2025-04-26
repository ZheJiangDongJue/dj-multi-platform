<!-- 头部面板组件 -->
<template>
    <div class="header-panel">
        <!-- 宽屏布局 -->
        <div v-if="isWideScreen" class="header-content">
            <div class="header-row">
                <div class="field-column">
                    <van-field :value="billData.data.MaterialCode" label="物料编码" placeholder="请输入完整编码"
                        :readonly="isReadOnly" v-click-tooltip="billData.data.MaterialCode"
                        @input="updateField('MaterialCode', $event)" 
                        @keyup.enter.native="handleMaterialCodeEnter(billData.data.MaterialCode)" 
                        v-close-keyboard />
                </div>
                <div class="field-column">
                    <van-field :value="billData.data.MaterialName" label="物料名称" :readonly="true"
                        v-click-tooltip="billData.data.MaterialName" @input="updateField('MaterialName', $event)" />
                </div>
                <div class="field-column">
                    <van-field :value="billData.data.MaterialTuHao" label="物料图号" :readonly="true"
                        v-click-tooltip="billData.data.MaterialTuHao" @input="updateField('MaterialTuHao', $event)" />
                </div>
                <div class="quantity-column">
                    <van-field :value="billData.data.BQty" label="计划数" :readonly="isReadOnly"
                        v-click-tooltip="billData.data.BQty" @input="updateField('BQty', $event)" />
                </div>
            </div>
            <div class="header-row">
                <div class="field-column spec-type-field">
                    <van-field :value="billData.data.MaterialSpecType" label="规格型号" :readonly="true"
                        v-click-tooltip="billData.data.MaterialSpecType"
                        @input="updateField('MaterialSpecType', $event)" />
                </div>
                <div class="field-column spec-type-explain-field">
                    <van-field :value="billData.data.MaterialSpecTypeExplain" label="规格型号说明" :readonly="true"
                        v-click-tooltip="billData.data.MaterialSpecTypeExplain"
                        @input="updateField('MaterialSpecTypeExplain', $event)" class="long-label-field" />
                </div>
                <div class="quantity-column">
                    <van-field :value="billData.data.PreCmpBQty" label="生产数" :readonly="isReadOnly"
                        v-click-tooltip="billData.data.PreCmpBQty" @input="updateField('PreCmpBQty', $event)" />
                </div>
            </div>
            <div class="header-row">
                <div class="field-column">
                    <van-field :value="billData.data.Code" label="单据编号" :readonly="true"
                        v-click-tooltip="billData.data.Code" @input="updateField('Code', $event)" />
                </div>
                <div class="field-column">
                    <van-field :value="formatDate(billData.data.DocumentTime)" label="单据日期" :readonly="true"
                        v-click-tooltip="formatDate(billData.data.DocumentTime)"
                        @input="updateField('DocumentTime', $event)" />
                </div>
                <div class="field-column">
                    <van-field :value="billData.data.InnerKey" label="制令单号" :readonly="isReadOnly"
                        placeholder="请在此扫描制令单"
                        v-click-tooltip="billData.data.InnerKey" @input="updateField('InnerKey', $event)" 
                        @keyup.enter.native="handleInnerKeyEnter(billData.data.InnerKey)" 
                        v-close-keyboard />
                </div>
                <div class="quantity-column">
                    <van-field :value="billData.data.CmpBQty" label="合格数" :readonly="isReadOnly"
                        v-click-tooltip="billData.data.CmpBQty" @input="updateField('CmpBQty', $event)" />
                </div>
            </div>
        </div>

        <!-- 窄屏布局 -->
        <div v-else class="header-content mobile-header-content">
            <div class="mobile-header-section">
                <van-field :value="billData.data.MaterialCode" label="物料编码" placeholder="请输入完整编码" :readonly="isReadOnly"
                    v-click-tooltip="billData.data.MaterialCode" @input="updateField('MaterialCode', $event)" 
                    @keyup.enter.native="handleMaterialCodeEnter(billData.data.MaterialCode)" 
                    v-close-keyboard />
                <van-field :value="billData.data.MaterialName" label="物料名称" :readonly="true"
                    v-click-tooltip="billData.data.MaterialName" @input="updateField('MaterialName', $event)" />
                <van-field :value="billData.data.MaterialTuHao" label="物料图号" :readonly="true"
                    v-click-tooltip="billData.data.MaterialTuHao" @input="updateField('MaterialTuHao', $event)" />
                <van-field :value="billData.data.MaterialSpecType" label="规格型号" :readonly="true"
                    v-click-tooltip="billData.data.MaterialSpecType" @input="updateField('MaterialSpecType', $event)" />
                <van-field :value="billData.data.MaterialSpecTypeExplain" label="规格型号说明" :readonly="true"
                    v-click-tooltip="billData.data.MaterialSpecTypeExplain"
                    @input="updateField('MaterialSpecTypeExplain', $event)" />
                <van-field :value="billData.data.InnerKey" label="制令单号" :readonly="true"
                    v-click-tooltip="billData.data.InnerKey" @input="updateField('InnerKey', $event)" 
                    @keyup.enter.native="handleInnerKeyEnter(billData.data.InnerKey)" 
                    v-close-keyboard />
                <van-field :value="billData.data.BQty" label="计划数" :readonly="isReadOnly"
                    v-click-tooltip="billData.data.BQty" @input="updateField('BQty', $event)" />
                <van-field :value="billData.data.PreCmpBQty" label="生产数" :readonly="isReadOnly"
                    v-click-tooltip="billData.data.PreCmpBQty" @input="updateField('PreCmpBQty', $event)" />
                <van-field :value="billData.data.CmpBQty" label="合格数" :readonly="isReadOnly"
                    v-click-tooltip="billData.data.CmpBQty" @input="updateField('CmpBQty', $event)" />
                <van-field :value="formatDate(billData.data.DocumentTime)" label="单据日期" :readonly="isReadOnly"
                    v-click-tooltip="formatDate(billData.data.DocumentTime)"
                    @input="updateField('DocumentTime', $event)" />
                <van-field :value="billData.data.Code" label="单据编号" :readonly="true"
                    v-click-tooltip="billData.data.Code" @input="updateField('Code', $event)" />
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
        formatDate,
        handleMaterialCodeEnter(value) {
            this.$emit('material-code-enter', value);
        },
        handleInnerKeyEnter(value) {
            this.$emit('inner-key-enter', value);
        }
    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/style/function";
@import "@/assets/style/custom-viewport.scss";

/* 头部面板样式 */
.header-panel {
    background: linear-gradient(145deg, #ffffff, #f8f9fa);
    border-bottom: vh(0.13) solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 vh(0.26) vh(1.04) rgba(0, 0, 0, 0.05);
    padding: vh(1.95) 1.95vw;
    margin-bottom: vh(1.95);
    position: relative;
    width: 100%;
    box-sizing: border-box;
    flex-shrink: 0;

    /* 添加底部分隔线效果 */
    &::after {
        content: '';
        position: absolute;
        bottom: vh(-0.13);
        left: 0;
        right: 0;
        height: vh(0.13);
        background: linear-gradient(90deg,
                rgba(0, 0, 0, 0) 0%,
                rgba(0, 0, 0, 0.1) 50%,
                rgba(0, 0, 0, 0) 100%);
    }
}

/* 头部内容样式 */
.header-content {
    max-width: 117.19vw;
    margin: 0 auto;
    padding: 0 1.46vw;
}

/* 头部行样式 */
.header-row {
    display: flex;
    gap: 1.46vw;
    margin-bottom: vh(1.3);
    align-items: center;

    /* 最后一行无底部边距 */
    &:last-child {
        margin-bottom: 0;
    }

    /* 字段列通用样式 */
    .field-column {
        flex: 1;
        min-width: 0;
    }

    /* 规格型号字段 */
    .spec-type-field {
        flex: 1;
        min-width: 14vw;
    }

    /* 规格型号说明字段 - 给予更多空间 */
    .spec-type-explain-field {
        flex: 2;
        min-width: 32vw;

        /* 规格型号说明字段特定样式 */
        ::v-deep .van-field__value,
        ::v-deep .van-field__body,
        ::v-deep .van-cell__value,
        ::v-deep .van-field__control {
            width: 100%;
            min-width: 0;
            text-overflow: ellipsis;
        }
    }

    /* 数量列样式 */
    .quantity-column {
        flex: 0.6;
        min-width: 9vw;
    }

    /* 头部行中的输入框样式 */
    .van-field {
        width: 100%;
        background: transparent;
        border-radius: vh(1.04);
        transition: all 0.3s ease;
        padding: 0;

        /* 统一标签宽度 */
        ::v-deep .van-field__label {
            width: 8vw;
            min-width: 8vw;
            flex: 0 0 8vw;
            justify-content: flex-end;
            padding-right: 1vw;
        }

        /* 确保字段值对齐 */
        ::v-deep .van-field__value {
            display: flex;
            flex: 1;
        }

        /* 确保输入值充分利用可用空间 */
        ::v-deep .van-field__control {
            width: 100%;
            text-overflow: ellipsis;
        }

        /* 悬停状态样式 */
        &:hover {
            background: transparent;
        }

        /* 只读状态样式 */
        &.van-field--readonly {
            background: transparent;
        }

        /* 规格型号说明专用更宽标签 */
        &.long-label-field {
            ::v-deep .van-field__label {
                width: 10vw;
                min-width: 10vw;
                flex: 0 0 10vw;
            }
        }
    }
}

/* 移动端头部部分样式 */
.mobile-header-section {
    display: flex;
    flex-direction: column;
    gap: vh(0.8);

    /* 移动端输入框样式 */
    .van-field {
        width: 100%;
        margin-bottom: 0;
        padding: vh(0.3) 0;

        /* 确保标签宽度固定，不会导致输入框变高 */
        ::v-deep .van-field__label {
            width: 25vw;
            min-width: 25vw;
            flex: 0 0 25vw;
            justify-content: flex-start;
            text-align: left;
            white-space: nowrap;
        }
    }
}

/* 媒体查询 - 小屏幕样式 */
@include ps {
    .header-panel {
        padding: vh(0.8);
        margin-bottom: vh(1);
    }
}
</style>