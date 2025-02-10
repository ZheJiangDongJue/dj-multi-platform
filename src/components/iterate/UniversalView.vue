<template>
    <DynamicPanel >
        <DynamicControl :type="item.ControlType" :control="item" v-for="item in controls" :key="item.Uid">
        </DynamicControl>
    </DynamicPanel>
</template>

<script>
import DynamicPanel from './DynamicPanel.vue';
import DynamicControl from './DynamicControl.vue';

export default {
    components: {
        DynamicPanel,
        DynamicControl,
    },
    props: {
        view: Object,
        controls: Array,
    },
    data() {
        return {
        };
    },
    mounted() {
        console.log("this.view is ", this.view);
        console.log("this.controls is ", this.controls);
    },
    methods: {
    },
}
</script>


<style></style>