<!--
Grid网格布局容器使用说明

● 组件功能：
  仿WPF Grid布局的Vue实现，提供：
  - ✅ 行列自动分配
  - ✅ 单元格合并
  - ✅ 多种对齐方式
  - ✅ 响应式布局
  - ✅ 可视化调试

● 使用示例：
  <grid-container :rows="['auto','*']" :columns="[100,'1*']">
    <grid-item row=0 column=0>标题</grid-item>
    <grid-item row=1 column-span=2>内容区</grid-item>
  </grid-container>

-->
<template>
    <div class="grid-container" :style="gridStyle">
        <slot></slot>
    </div>
</template>

<script>
export default {
    props: {
        width: { type: [Number, String], },
        height: { type: [Number, String], },
        /**
         * 行高配置（支持3种格式）：
         * - 字符串："auto, 100, 2*" （自动高度, 100像素, 比例2份）
         * - 数组：[100, 'auto', '3*'] （推荐写法）
         * - 数字：3 → 创建3个等分行
         * 
         * ● 比例换算：'*' = 1fr，'3*' = 3fr
         * ● auto表示内容自适应高度
         */
        rows: { type: [Array, String], default: () => [] },
        /**
         * 列宽配置（用法同行配置）：
         * 示例：:columns="['200px', '1*']" 
         * → 第一列固定200px，剩余空间按1份分配
         */
        columns: { type: [Array, String], default: () => [] }
    },
    computed: {
        containerWidth() {
            return typeof this.width === 'number' ? `${this.width}px` : this.width
        },
        containerHeight() {
            return typeof this.height === 'number' ? `${this.height}px` : this.height
        },
        parsedRows() {
            return this.parseGridDefinition(this.rows)
        },
        parsedColumns() {
            return this.parseGridDefinition(this.columns)
        },
        // 生成CSS Grid所需的行列模板
        gridStyle() {
            return {
                display: 'grid',
                // 示例输出：gridTemplateRows: "auto 100px 1fr"
                gridTemplateRows: this.parsedRows.join(' '),
                gridTemplateColumns: this.parsedColumns.join(' '),
                width: this.width != 0 ? this.containerWidth : '100%',
                height: this.height != 0 ? this.containerHeight : '100%',
            }
        }
    },
    methods: {
        parseGridDefinition(input) {
            if (typeof input === 'string') return this.parseStringDefinition(input)
            if (Array.isArray(input)) return this.parseArrayDefinition(input)
            return ['1fr'] // 默认值
        },
        parseStringDefinition(str) {
            return str.split(',').map(s => {
                if (s === 'auto') return 'auto'
                if (s.includes('*')) {
                    const parts = s.split('*')
                    return parts[0] ? `${parts[0]}fr` : '1fr'
                }
                return s
            })
        },
        // parseArrayDefinition(arr) {
        //     return arr.map(item => {
        //         if (typeof item === 'number') return `${item}px`
        //         return item
        //     })
        // },
        parseArrayDefinition(arr) {
            return arr.map(item => {
                if (typeof item === 'number') return `${item}px`
                if (item === 'auto') return 'minmax(auto, max-content)'
                if (item.includes('*')) {
                    const ratio = item.replace('*', '') || 1
                    return `minmax(0, ${ratio}fr)`
                }
                return item
            })
        },
    }
}
</script>

<style scoped>
/* 基础样式确保容器撑满父元素 */
.grid-container {
    width: 100%;
    height: 100%;
    position: relative;
    /* 调试时可添加背景辅助线 */
    /* background: repeating-linear-gradient(
    180deg,
    rgba(0,255,0,0.1) 0 1px,
    transparent 1px 20px
  ); */
}
</style>