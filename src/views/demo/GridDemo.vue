<template>
    <div class="demo-container">
        <!-- Grid容器定义 -->
        <grid-container :rows="['auto', '2*', '*', 80]" :columns="[150, '1*', '2*']"
            style="height: 500px; border: 2px solid #444;">
            <!-- 跨列示例 (顶部导航) -->
            <grid-item :row="0" :column="0" :column-span="3" margin="10" horizontal-alignment="center"
                vertical-alignment="center" style="background: #ffcccc;">
                <h2>Header (跨3列)</h2>
            </grid-item>

            <!-- 跨行示例 (侧边栏) -->
            <grid-item :row="1" :column="0" :row-span="2" margin="15" horizontal-alignment="left"
                style="background: #ccffcc;">
                <p>侧边栏 (跨2行)</p>
                <p>Margin: 15px</p>
            </grid-item>

            <!-- 内容区域 -->
            <grid-item :row="1" :column="1" :column-span="2" margin="20 10" horizontal-alignment="right"
                style="background: #cce5ff;">
                <div style="width: 80%; border: 1px dashed blue;">
                    右对齐内容 (跨2列)
                </div>
            </grid-item>

            <!-- 底部区域 -->
            <grid-item :row="2" :column="1" margin="10" :horizontal-alignment="'center'" :vertical-alignment="'bottom'"
                style="background: #ffffcc; height: 120px;">
                <p>底部对齐</p>
                <p>行高自适应</p>
            </grid-item>

            <!-- 默认堆叠示例 -->
            <grid-item style="background: rgba(255,0,0,0.3); z-index: 2;" margin="30" :horizontal-alignment="'center'"
                :vertical-alignment="'center'">
                <p>未指定位置的元素</p>
                <p>（所有元素默认在0,0位置堆叠）</p>
            </grid-item>

            <!-- 浮动元素 -->
            <grid-item :row="3" :column="0" :column-span="3" margin="5" style="background: #e0e0e0;">
                页脚 (固定高度80px)
            </grid-item>
        </grid-container>
    </div>
</template>

<script>
import GridContainer from '@/components/grid/GridContainer.vue'
import GridItem from '@/components/grid/GridItem.vue'

export default {
    components: {
        GridContainer,
        GridItem
    }
}
</script>

<style scoped>
.demo-container {
    margin: 20px;
    padding: 20px;
    background: #f5f5f5;
}

.grid-item {
    border: 1px solid #666;
    padding: 10px;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
}
</style>