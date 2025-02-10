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
            validator: v => ['left', 'center', 'right', 'stretch'].includes(v)
        },
        verticalAlignment: {
            type: String,
            default: 'stretch',
            validator: v => ['top', 'center', 'bottom', 'stretch'].includes(v)
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
                margin,
                justifySelf: this.mapHorizontalAlignment(),
                alignSelf: this.mapVerticalAlignment(),
                gridRow: this.getGridRow(),
                gridColumn: this.getGridColumn()
            }
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
                left: 'start',
                center: 'center',
                right: 'end',
                stretch: 'stretch'
            }
            return map[this.horizontalAlignment]
        },
        mapVerticalAlignment() {
            const map = {
                top: 'start',
                center: 'center',
                bottom: 'end',
                stretch: 'stretch'
            }
            return map[this.verticalAlignment]
        },
    }
}
</script>

<style scoped>
.grid-item {
    box-sizing: border-box;
}
</style>