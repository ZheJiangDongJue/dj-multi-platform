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
                        @keyup.enter.native="handleMaterialCodeEnter(billData.data.MaterialCode)" v-close-keyboard
                        ref="materialCodeInput" />
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
                    <van-field :value="billData.data.BQty" label="计划数" :readonly="isReadOnly" type="number"
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
                    <van-field :value="billData.data.PreCmpBQty" label="生产数" :readonly="isReadOnly" type="number"
                        v-click-tooltip="billData.data.PreCmpBQty" @input="updateField('PreCmpBQty', $event)" />
                </div>
            </div>
            <div class="header-row">
                <div class="field-column">
                    <van-field :value="billData.data.Code" label="单据编号" :readonly="true"
                        v-click-tooltip="billData.data.Code" @input="updateField('Code', $event)" />
                </div>
                <div class="field-column">
                    <van-field :value="formatDate(billData.data.DocumentTime)" label="单据日期" readonly clickable 
                        required right-icon="calendar-o" v-click-tooltip="formatDate(billData.data.DocumentTime)"
                        @click="handleDateFieldClick" :disabled="isReadOnly" />
                </div>
                <div class="field-column">
                    <van-field :value="billData.data.InnerKey" label="制令单号" :readonly="isReadOnly"
                        placeholder="请在这里扫描制令单" v-click-tooltip="billData.data.InnerKey"
                        @input="updateField('InnerKey', $event)"
                        @keyup.enter.native="handleInnerKeyEnter(billData.data.InnerKey)" ref="innerKeyInput"
                        v-close-keyboard v-focus-no-keyboard="!isReadOnly" />
                </div>
                <div class="quantity-column">
                    <van-field :value="billData.data.CmpBQty" label="合格数" :readonly="isReadOnly" type="number"
                        v-click-tooltip="billData.data.CmpBQty" @input="updateField('CmpBQty', $event)" />
                </div>
            </div>
        </div>

        <!-- 窄屏布局 -->
        <div v-else class="header-content mobile-header-content">
            <div class="mobile-header-section">
                <van-field :value="billData.data.MaterialCode" label="物料编码" placeholder="请输入完整编码" :readonly="isReadOnly"
                    v-click-tooltip="billData.data.MaterialCode" @input="updateField('MaterialCode', $event)"
                    @keyup.enter.native="handleMaterialCodeEnter(billData.data.MaterialCode)" v-close-keyboard
                    ref="materialCodeInput" />
                <van-field :value="billData.data.MaterialName" label="物料名称" :readonly="true"
                    v-click-tooltip="billData.data.MaterialName" @input="updateField('MaterialName', $event)" />
                <van-field :value="billData.data.MaterialTuHao" label="物料图号" :readonly="true"
                    v-click-tooltip="billData.data.MaterialTuHao" @input="updateField('MaterialTuHao', $event)" />
                <van-field :value="billData.data.MaterialSpecType" label="规格型号" :readonly="true"
                    v-click-tooltip="billData.data.MaterialSpecType" @input="updateField('MaterialSpecType', $event)" />
                <van-field :value="billData.data.MaterialSpecTypeExplain" label="规格型号说明" :readonly="true"
                    v-click-tooltip="billData.data.MaterialSpecTypeExplain"
                    @input="updateField('MaterialSpecTypeExplain', $event)" />
                <van-field :value="billData.data.InnerKey" label="制令单号" :readonly="isReadOnly"
                    v-click-tooltip="billData.data.InnerKey" @input="updateField('InnerKey', $event)"
                    @keyup.enter.native="handleInnerKeyEnter(billData.data.InnerKey)" ref="innerKeyInput"
                    v-close-keyboard v-focus-no-keyboard="!isReadOnly" />
                <van-field :value="billData.data.BQty" label="计划数" :readonly="isReadOnly" type="number"
                    v-click-tooltip="billData.data.BQty" @input="updateField('BQty', $event)" />
                <van-field :value="billData.data.PreCmpBQty" label="生产数" :readonly="isReadOnly" type="number"
                    v-click-tooltip="billData.data.PreCmpBQty" @input="updateField('PreCmpBQty', $event)" />
                <van-field :value="billData.data.CmpBQty" label="合格数" :readonly="isReadOnly" type="number"
                    v-click-tooltip="billData.data.CmpBQty" @input="updateField('CmpBQty', $event)" />
                <van-field :value="formatDate(billData.data.DocumentTime)" label="单据日期" readonly clickable
                    required right-icon="calendar-o" v-click-tooltip="formatDate(billData.data.DocumentTime)"
                    @click="handleDateFieldClick" :disabled="isReadOnly" />
                <van-field :value="billData.data.Code" label="单据编号" :readonly="true"
                    v-click-tooltip="billData.data.Code" @input="updateField('Code', $event)" />
            </div>
        </div>

        <!-- 添加日历组件 -->
        <van-calendar v-model="showCalendar" get-container="body" :show-confirm="false" @confirm="onSelectDate" />
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
    data() {
        return {
            showCalendar: false,
        };
    },
    mounted() {
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
        },
        handleDateFieldClick() {
            // 如果只读，不允许修改
            if (this.isReadOnly) {
                return;
            }
            this.showCalendar = true;
        },
        onSelectDate(date) {
            this.showCalendar = false;
            if (this.isReadOnly) {
                return;
            }
            if (date) {
                this.updateField('DocumentTime', formatDate(date));
            }
        },
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

    /* 调整必填字段星号位置 */
    ::v-deep .van-cell--required::before {
        left: 0px;
    }
}

/* 头部内容样式 */
.header-content {
    max-width: 117.19vw;
    margin: 0 auto;
    // padding: 0 1.46vw;
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
        padding-left: vw(1);
        padding-right: vw(0.3);

        /* 统一标签宽度 */
        ::v-deep .van-field__label {
            width: 8vw;
            min-width: 8vw;
            flex: 0 0 8vw;
            // justify-content: flex-end;
            padding-right: 1vw;
        }

        /* 确保字段值对齐 */
        ::v-deep .van-field__value {
            display: flex;
            flex: 1;
        }

        /* 确保输入值充分利用可用空间 */
        ::v-deep .van-field__body,
        ::v-deep .van-cell__value,
        ::v-deep .van-field__control {
            width: 100%;
            min-width: 0;
            text-overflow: ellipsis;
            height: vh(3.5); /* 添加统一的高度 */
            line-height: vh(3.5); /* 添加统一的行高 */
        }

        /* 统一图标高度 */
        ::v-deep .van-field__right-icon {
            height: vh(3.5);
            line-height: vh(3.5);
            display: flex;
            align-items: center;
        }

        /* 悬停和活动状态 */
        &:hover {
            box-shadow: 0 vh(0.13) vh(0.52) rgba(74, 144, 226, 0.15);
            transform: translateY(-1px);
        }

        &:focus-within {
            box-shadow: 0 vh(0.13) vh(0.65) rgba(74, 144, 226, 0.25);
            transform: translateY(-2px);
        }
    }
}

/* 移动版布局特定样式 */
.mobile-header-content {
    padding: 0;

    .mobile-header-section {
        display: flex;
        flex-direction: column;
        gap: vh(0.65);

        /* 移动版中字段宽度调整 */
        .van-field {
            ::v-deep .van-field__label {
                width: 12vw;
                min-width: 12vw;
                flex: 0 0 12vw;
            }

            /* 确保移动版下输入框和图标高度一致 */
            ::v-deep .van-field__control,
            ::v-deep .van-field__body,
            ::v-deep .van-field__right-icon {
                height: vh(3.5);
                line-height: vh(3.5);
            }

            /* 确保移动版下图标垂直居中 */
            ::v-deep .van-field__right-icon {
                display: flex;
                align-items: center;
            }
        }
    }
}

/* 标签长的字段样式调整 */
.long-label-field {
    ::v-deep .van-field__label {
        width: 10.5vw !important;
        min-width: 10.5vw !important;
        flex: 0 0 10.5vw !important;
    }
}
</style>