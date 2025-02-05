<template>
    <div class="card" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
        <div class="card-icon">
            <slot name="icon"></slot>
        </div>
        <div class="card-name">
            <slot>{{ header }}</slot>
        </div>
    </div>
</template>

<script>
export default {
    name: 'CardComponent',
    data() {
        return {
            isTouched: false,
        }
    },
    methods: {
        handleTouchStart() {
            this.isTouched = true;
        },
        handleTouchEnd() {
            this.isTouched = false;
        }
    },
    props: {
        header: {
            type: String,
            default: 'NAME',
        }
    }
};
</script>

<style scoped>
.card {
    display: flex;
    flex-direction: column;
    /* 垂直排列 */
    align-items: center;
    /* 水平居中 */
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: 100px;
    /* 根据需要调整宽度 */
    box-sizing: border-box;
    /* 包含padding和border */
    transition: transform 0.1s ease, box-shadow 0.1s ease, background-color 0.1s ease;
    /* 添加背景颜色过渡 */
}

.card-icon {
    width: 50px;
    /* 根据需要调整图标大小 */
    height: 50px;
    margin-bottom: 5px;
    /* 图标和名称之间的间距 */
}

.card-name {
    text-align: center;
}

.card:active,
/*  为了兼容非触摸屏设备，保留 :active 样式 */
.card.touched {
    /* 添加 touched 类 */
    background-color: #f0f0f0;
    /* 按下时的背景颜色 */
    transform: scale(0.95);
    /* 按下时的缩放效果 */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    /* 按下时的阴影效果 */
}
</style>