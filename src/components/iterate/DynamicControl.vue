<template functional>
    <div>
        <van-button v-if="type == 2" @click="handleClick" plain>{{ control.Header }}</van-button>
        <DynamicPanel v-if="type == 14">
            <DynamicControl :type="item.ControlType" :control="item" v-for="item in control.Children" :key="item.Uid"/>
        </DynamicPanel>
    </div>
</template>

<script>
import DynamicPanel from './DynamicPanel.vue';


export default {
    name:'DynamicControl',
    components: {
        DynamicPanel
    },
    props: {
        type: {
            type: Number,
            required: true,
        },
        control: Object,
    },
    data() {
        return {
        };
    },
    methods: {
        handleClick() {
            // this.$emit('click');
            this.handleCommand();
        },
        handleCommand() {
            console.log(`调用了[${this.control.Setting.CommandKey}]`);
        },
    },
}
</script>

<style lang="scss" scoped></style>