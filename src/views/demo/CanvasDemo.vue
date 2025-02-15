<template>
    <canvas-container :width="800" :height="600">
        <!-- 正常显示的子元素 -->
        <canvas-item :x="50" :y="30">
            <h3>第一个元素</h3>
            <p>坐标 (50, 30)</p>
        </canvas-item>

        <!-- 溢出会被裁剪的元素 -->
        <canvas-item :x="700" :y="580">
            <div style="width: 150px; height: 100px; background: pink">
                这个元素部分溢出
            </div>
        </canvas-item>
    </canvas-container>
</template>

<script>
import CanvasContainer from '@/components/canvas/CanvasContainer.vue'
import CanvasItem from '@/components/canvas/CanvasItem.vue'

export default {
    components: { CanvasContainer, CanvasItem }
}
</script>