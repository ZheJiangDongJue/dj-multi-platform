<template>
    <div>
        <!-- 文本输入框 -->
        <dynamic-control type="input" v-model="username" name="username" placeholder="请输入用户名" :maxlength="20"
            custom-class="custom-input" />

        <!-- 日期选择 -->
        <dynamic-control type="date" v-model="birthday" name="birthday" />

        <!-- 多选复选框 -->
        <dynamic-control type="checkbox" v-model="selectedHobbies" name="hobbies" :options="[
            { value: 'reading', label: '阅读' },
            { value: 'sports', label: '运动' },
            { value: 'music', label: '音乐', disabled: true }
        ]" />

        <!-- 带样式的按钮 -->
        <dynamic-control type="button" button-text="提交" button-class="primary-btn" @click="handleSubmit" />
    </div>
</template>

<script>
import DynamicControl from '@/components/iterate/DynamicControl.vue';

export default {
    components: {
        DynamicControl
    },
    data() {
        return {
            username: '',
            birthday: null,
            selectedHobbies: []
        }
    },
    methods: {
        handleSubmit() {
            if (this.form.validate()) {
                // 提交逻辑
            }
        }
    }
}
</script>