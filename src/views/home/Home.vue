<template>
    <div>
        <h3 class="title">功能</h3>
        <div>
            <div v-if="navigateMode == 0" class="grid-container">
                <div class="grid-item left">
                    <van-collapse v-model="navigatorActiveKey" accordion>
                        <van-collapse-item :title="item.Name" :name="item.Name" v-for="item in navigatorItems"
                            :key="item.id" :is-link="item.Children.length > 0">
                            <el-tree v-if="item.Children.length > 0" :data="item.Children" :props="defaultProps"
                                @node-click="handleNodeClick"></el-tree>
                        </van-collapse-item>
                    </van-collapse>
                </div>
                <div class="grid-item right">
                    <div class="flex-s-w">
                        <Card :header="item.Name" v-for="item in currentModuleItems" :key="item.id" :bind="item"
                            @card-click="onCardClick">
                            <template v-slot:icon>
                                <!-- <img src="../../assets/logo.png" alt="User Icon"> -->
                            </template>
                        </Card>
                    </div>
                </div>
            </div>
            <div v-if="navigateMode == 1" class="grid-container">
                <div class="grid-item left">
                    <van-sidebar v-model="navigatorActiveKey">
                        <van-sidebar-item :title="item.Name" :name="item.Name" v-for="item in navigatorItems"
                            :key="item.id" />
                    </van-sidebar>
                </div>
                <div class="grid-item right">
                    <div class="flex-s-w">
                        <Card :header="item.Name" v-for="item in currentModuleItems" :key="item.id" :bind="item"
                            @card-click="onCardClick">
                            <template v-slot:icon>
                                <!-- <img src="../../assets/logo.png" alt="User Icon"> -->
                            </template>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import authApi from '@/api/auth';
import Card from '@/components/CardComponent.vue';
// 页面名称和路由的对应关系在这里配置
import PageNameToRouterConverter from '@/converter/PageNameToRouterConverter';


export default {
    name: 'HomePage',
    components: {
        Card,
    },
    data: function () {
        return {
            navigateMode: 1,//0: 左侧导航模式,1: 桌面图标模式
            navigatorActiveKey: 0,
            navigatorItems: [],
            currentModuleItems: [],
            moduleItems: {},
            defaultProps: {
                children: 'Children',
                label: 'Name'
            },
        }
    },
    watch: {
        navigatorActiveKey: function (newValue, oldValue) {
            console.log('navigatorActiveKey changed from ' + oldValue + ' to ' + newValue);
            this.refreshCurrentModule();
        }
    },
    async created() {
        // this.navigatorItems.push({
        //     name: '生产系统',
        // })
        // this.navigatorItems.push({
        //     name: '工艺系统',
        // })
        // for (let i = 0; i < this.navigatorItems.length; i++) {
        //     const element = this.navigatorItems[i];
        //     element.id = i + 1;
        // }
        // this.moduleItems = {
        //     '生产系统': [
        //         {
        //             name: '测试1',
        //             pageName: "LoginPage",
        //         },
        //         {
        //             name: '测试2',
        //             pageName: "MaterialPage",
        //         },
        //     ],
        //     '工艺系统': [
        //         {
        //             name: '测试1',
        //         },
        //         {
        //             name: '测试2',
        //         },
        //         {
        //             name: '测试3',
        //         },
        //     ],
        // }
        // this.refreshCurrentModule();
        var items = await authApi.getAllModuleItem(this.userInfo.id)
        console.log("从Api获取到功能", items);
        items.forEach(element => {
            this.navigatorItems.push(element);
        });
    },
    // computed() {

    // },
    mounted() { },
    methods: {
        refreshCurrentModule() {
            let key = this.navigatorActiveKey;
            this.currentModuleItems = this.navigatorItems[key].Children
        },
        onCardClick(data) {
            this.currentModuleItems.forEach(element => {
                if (element === data) {
                    console.log("点击了" + data.PageName);
                    if (data.PageName != undefined) {
                        let router = PageNameToRouterConverter.Convert(data.PageName);
                        if (router === undefined) {
                            return;
                        }
                        console.log('页面名称:"' + data.PageName + '" ->转换为-> 路由:"' + router + '"');
                        this.$router.push(router);
                    }
                }
            });
        },
        handleNodeClick(data) {
            this.onCardClick(data);
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