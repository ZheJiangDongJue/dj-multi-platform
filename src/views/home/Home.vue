<template>
    <div>
        <h3 class="title">测试</h3>
        <div class="grid-container">
            <div class="grid-item left">
                <van-sidebar v-model="navigatorActiveKey">
                    <van-sidebar-item :title="item.name" v-for="item in navigatorItems" :key="item.id" />
                </van-sidebar>
            </div>
            <div class="grid-item right">
                <div class="flex-s-w">
                    <Card :header="item.name" v-for="item in currentModule" :key="item.name">
                        <template v-slot:icon>
                            <!-- <img src="../../assets/logo.png" alt="User Icon"> -->
                        </template>
                    </Card>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Card from '@/components/CardComponent.vue';


export default {
    name: 'HomePage',
    components: {
        Card,
    },
    data: function () {
        return {
            navigatorActiveKey: 0,
            navigatorItems: [],
            currentModule:[],
            moduleItems: {},
        }
    },
    watch: {
        navigatorActiveKey: function (newValue, oldValue) {
            console.log('navigatorActiveKey changed from ' + oldValue + ' to ' + newValue);
            this.refreshCurrentModule();
        }
    },
    created() {
        this.navigatorItems.push({
            name: '生产系统',
        })
        this.navigatorItems.push({
            name: '工艺系统',
        })
        for (let i = 0; i < this.navigatorItems.length; i++) {
            const element = this.navigatorItems[i];
            element.id = i + 1;
        }
        this.moduleItems = {
            '生产系统':[
                {
                    name:'测试1',
                    router: '/login',
                },
                {
                    name:'测试2',
                },
            ],
            '工艺系统':[
                {
                    name:'测试1',
                },
                {
                    name:'测试2',
                },
                {
                    name:'测试3',
                },
            ],
        }
        this.refreshCurrentModule();
    },
    mounted() { },
    methods:{
        refreshCurrentModule(){
            let key = this.navigatorItems[this.navigatorActiveKey].name;
            this.currentModule = this.moduleItems[key]
        }
    }

}
</script>

<style lang="scss" scoped>
.title {
    text-align: left;
    margin-left: ps(15);
}

.grid-container {
    display: flex;
    /* 使用flex布局 */
    width: 100%;
    height: 100%;
    /* 占据父容器的全部宽高 */
}

.grid-item {
    height: 100%;
}

.grid-item.left {
    flex: 0 0 auto;
    /* 左侧宽度自适应内容 */
}

.grid-item.right {
    flex: 1 1 auto;
    /* 右侧填充剩余空间 */
    /*  或者 flex-grow: 1;  flex-shrink: 1; flex-basis: auto; */
}

.card {
    margin: ps(10) ps(10);
}
</style>