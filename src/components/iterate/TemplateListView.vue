<!-- CardList.vue 父组件 -->
<template>
    <div v-if="isLoad" class="card-list-container">
        <div v-if="checkType(1)" class="card-list">
            <UniversalView v-for="(item, index) in control_vm.core.data" :key="index" :view="getView(setting.ViewUid)"
                :page_vm="page_vm" :dataContext="item" :dontWatchMe="true" :controls="controls" class="card-item">
            </UniversalView>
        </div>
        <div v-if="checkType(2)" class="card-list">
            <!-- <card-item v-for="(card, index) in Items" :key="index" :title="card.title" :content="card.content"
            :image-url="card.imageUrl" @card-clicked="handleCardClick" /> -->
            <div>没有适配这个逻辑分支</div>
        </div>
    </div>
</template>

<script>
import { ControlViewModel } from '@/core/control-vm/control-view-model';
import sysapi from '@/api/system-data';

// import UniversalView from './UniversalView.vue';


export default {
    components: {
    },
    props: {
        control: Object,
        setting: Object,
        page_vm: Object,
        control_vm: ControlViewModel,
    },
    data() {
        return {
            isLoad: false,
            controls: [],
        }
    },
    computed: {
        DataSource() {
            return this.control_vm.core.data; // 解构出具体属性
        }
    },
    watch: {
        DataSource() {  // 监听props变化更新data
            // this.isLoad = false;
            // this.isLoad = true;
        }
    },
    created() {
    },
    async mounted() {
        // /**@type {UniversalPageViewModel} */
        // sysapi.GetSystemControlInViews([this.control.Uid])
        var pack = await sysapi.GetSystemControlInViews([this.setting.ViewUid]);
        this.controls = pack.Data;
        this.isLoad = true;
    },
    methods: {
        handleCardClick(card) {
            console.log('Card clicked:', card)
        },
        getView(systemViewUid) {
            /**@type {UniversalPageViewModel} */
            const page_vm = this.page_vm;
            return page_vm.rootDataGroup.Views[systemViewUid];
        },
        checkType(i) {
            return parseInt(this.setting.ListItemTemplateType) == i;
        },
        handleUpdate(payload) {
            console.log('更新数据:', payload)
        },
        get(v) {
            console.log(v);
            return v;
        }
    }
}
</script>

<style scoped>
.card-list-container {
    width: 100%;
    height: 100%;
}

.card-list {
    display: block;
    width: 100%;
    height: 100%;
    overflow-y: auto;
}

.card-item {
    display: block;
    width: 96%;
    margin: 10px 2%;
    /* 控制卡片间距 */
    box-sizing: border-box;
    /* 保留原有视觉效果 */
    padding: 10px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease-in-out;
}
</style>