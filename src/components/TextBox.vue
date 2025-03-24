<template>
    <div class="input-container">
        <!-- 固定Label宽度模式 -->
        <div class="fixed-layout" v-if="fixedMode">
            <label class="label" :style="{ width: labelWidth }">{{ label }}</label>
            <input class="input" :type="type" :value="value" @input="handleInput" />
        </div>

        <!-- 自适应Label宽度模式 -->
        <div class="auto-layout" v-else>
            <label class="label">{{ label }}</label>
            <input class="input" :type="type" :value="value" @input="handleInput" />
        </div>
    </div>
</template>

<script>
export default {
    props: {
        type: {
            type: String,
            default: 'text' // 默认文本类型
        },
        label: {
            type: String,
            default: 'Label'
        },
        fixedMode: {
            type: Boolean,
            default: false
        },
        labelWidth: {
            type: String,
            default: '120px' // 默认固定宽度
        },
        value: {  // 接收外部v-model的值
            type: [String, Number],
            default: ''
        }
    },
    data() {
        return {
        };
    },
    methods: {
        handleInput(event) {  // 添加类型声明
            const target = event.target
            if (target) {
                this.$emit('input', target.value)  // 触发父组件监听事件
            }
        }
    }
};
</script>

<style scoped>
.input-container {
    display: flex;
    flex-direction: column;
    /* gap: 1rem; */
    /* gap是两个控件之间的间距 */
}

/* 公共样式 */
.label,
.input {
    display: block;
    /* padding: 8px; */
    margin: 0;
}

/* 固定模式容器 */
.fixed-layout {
    display: flex;
    align-items: center;
    /* gap: 10px; */
    /* gap是两个控件之间的间距 */
}

.fixed-layout .label {
    width: v-bind(labelWidth);
    /* 动态绑定固定宽度 */
    flex: 0 0 auto;
}

.fixed-layout .input {
    flex: 1;
    width: 100%;
    /* 确保填满剩余空间 */
}

/* 自适应模式容器 */
.auto-layout {
    display: flex;
    align-items: center;
    /* gap: 10px; */
    /* gap是两个控件之间的间距 */
}

.auto-layout .label {
    flex: 0 0 auto;
    /* 禁止压缩 */
    white-space: nowrap;
    /* 防止换行 */
}

.auto-layout .input {
    flex: 1;
    width: 100%;
}

/* 可选样式 */
.input {
    border: 1px solid #ccc;
    border-radius: 4px;
}
</style>