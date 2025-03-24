<!--
GridItem子项配置说明

● 核心属性：
  - row        : 行位置（从0开始计数）
  - column     : 列位置（从0开始计数）
  - row-span   : 纵向合并行数（默认1）
  - column-span: 横向合并列数（默认1）
  
  - margin     : 边距（支持CSS简写格式）
  - horizontal-alignment: 水平对齐（left/center/right/stretch）
  - vertical-alignment  : 垂直对齐（top/center/bottom/stretch）

● 使用技巧：
  1. 快速定位：开发时添加临时样式
     style="border: 1px dashed red; background: rgba(0,0,255,0.1)"

  2. 内容溢出：在grid-item内部元素设置
     style="width:100%; height:100%; overflow: auto"

● 注意事项：
  - 行列索引从0开始！第1行是row=0
  - 多个元素重叠时，后渲染的在上层（可通过z-index控制）
  - 当容器高度未设置时，可能出现布局异常
  - 合并行列时注意不要超过容器边界
-->

<template>
    <div class="grid-item" :style="itemStyle">
        <slot></slot>
    </div>
</template>

<script>
export default {
    props: {
        row: { type: Number, default: 0 },
        column: { type: Number, default: 0 },
        margin: { type: [String, Number], default: 0 },
        horizontalAlignment: {
            type: String,
            default: 'stretch',
            validator: v => ['start', 'center', 'end', 'stretch'].includes(v)
        },
        verticalAlignment: {
            type: String,
            default: 'stretch',
            validator: v => ['start', 'center', 'end', 'stretch'].includes(v)
        },
        rowSpan: {
            type: Number,
            default: 1,
            validator: v => v >= 1
        },
        columnSpan: {
            type: Number,
            default: 1,
            validator: v => v >= 1
        }
    },
    computed: {
        itemStyle() {
            const margin = typeof this.margin === 'number' ?
                `${this.margin}px` : this.margin

            return {
                // 添加padding以支持内容与边界的间距
                padding: margin,
                // 调整对齐映射逻辑
                justifySelf: this.shouldStretchHorizontal() ? 'stretch' : this.mapHorizontalAlignment(),
                alignSelf: this.shouldStretchVertical() ? 'stretch' : this.mapVerticalAlignment(),
                gridRow: this.getGridRow(),
                gridColumn: this.getGridColumn(),
                // 添加尺寸限制
                maxWidth: '100%',
                maxHeight: '100%',
                // ...this.baseStyle,
                ...this.absolutePosition
            }
        },
        absolutePosition() {
            return this.$attrs.style?.position === 'absolute' ? {
                position: 'absolute',
                zIndex: 10,
                transform: `translate(${this.$attrs.style.left || 0}, ${this.$attrs.style.top || 0})`
            } : {}
        }
    },
    methods: {
        getGridRow() {
            const start = this.row + 1
            // const end = start + this.rowSpan
            return `${start} / span ${this.rowSpan}`
        },
        getGridColumn() {
            const start = this.column + 1
            // const end = start + this.columnSpan
            return `${start} / span ${this.columnSpan}`
        },
        mapHorizontalAlignment() {
            const map = {
                start: 'start',
                center: 'center',
                end: 'end',
                stretch: 'stretch'
            }
            return map[this.horizontalAlignment]
        },
        mapVerticalAlignment() {
            const map = {
                start: 'start',
                center: 'center',
                end: 'end',
                stretch: 'stretch'
            }
            return map[this.verticalAlignment]
        },
        // 新增拉伸判断逻辑
        shouldStretchHorizontal() {
            return this.horizontalAlignment === 'stretch' &&
                !(this.$parent.parsedColumns[this.column]?.includes('auto'))
        },
        shouldStretchVertical() {
            return this.verticalAlignment === 'stretch' &&
                !(this.$parent.parsedRows[this.row]?.includes('auto'))
        }
    }
}
</script>

<style scoped>
.grid-item {
    box-sizing: border-box;
    position: relative;
    /* 防止内容溢出破坏布局 */
    overflow: hidden;

    /* 调试辅助线 */
    /* background: rgba(255,0,0,0.1);
  border: 1px dashed rgba(0,0,0,0.3); */
}
</style>