<template>
    <div>
        <div class="navbar">
            <div class="title">东爵ERP系统</div>
            <div class="user-info">
                <span v-if="userInfo">{{ userInfo.name || userInfo.username }}</span>
            </div>
        </div>
        <!-- <h3 class="title">功能</h3> -->
        <div>
            <div v-if="navigateMode == 0" class="grid-container">
                <div class="grid-item left">
                    <div class="nav-container">
                        <van-collapse v-model="navigatorActiveKey" accordion>
                            <van-collapse-item :title="item.Name" :name="item.Name" v-for="item in navigatorItems"
                                :key="item.id" :is-link="item.Children.length > 0">
                                <div class="tree-container" v-if="item.Children.length > 0">
                                    <el-tree :data="item.Children" :props="defaultProps" @node-click="handleNodeClick"
                                        :highlight-current="true" node-key="id">
                                    </el-tree>
                                </div>
                            </van-collapse-item>
                        </van-collapse>
                        <!-- 左下角设置按钮 -->
                        <div class="settings-gear">
                            <span class="el-dropdown-link" @click="$router.push('/user-settings')">
                                <i class="el-icon-user"></i>
                            </span>
                        </div>
                    </div>
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
                    <!-- 左下角设置按钮 -->
                    <div class="settings-gear">
                        <span class="el-dropdown-link" @click="$router.push('/user-settings')">
                            <i class="el-icon-user"></i>
                        </span>
                        <!-- <el-dropdown trigger="click" @command="handleCommand">
                            <span class="el-dropdown-link">
                                <i class="el-icon-setting"></i>
                            </span>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown> -->
                    </div>
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
// import authApi from '@/api/auth';
import Card from '@/components/CardComponent.vue';
// 页面名称和路由的对应关系在这里配置
import PageNameToRouterConverter from '@/converter/PageNameToRouterConverter';
import { logout } from '@/utils/session-manager';

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
        this.navigatorItems.push({
            Name: '工艺系统',
            Children: [
                {
                    Name: '组装流程卡',
                    PageName: "ProcessAssemblyFlowBill",
                },
                {
                    Name: '批量接收组装流程卡',
                    PageName: "BatchReceiveProcessAssemblyFlow",
                },
                {
                    Name: '批量完工组装工序完工单',
                    PageName: "BatchCompleteProcessAssemblyFlow",
                },
            ]
        })
        for (let i = 0; i < this.navigatorItems.length; i++) {
            const element = this.navigatorItems[i];
            element.id = i + 1;
        }
        this.refreshCurrentModule();
        // var items = await authApi.getAllModuleItem(this.userInfo.id)
        // console.log("从Api获取到功能", items);
        // items.forEach(element => {
        //     this.navigatorItems.push(element);
        // });
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
        },
        handleCommand(command) {
            if (command === 'logout') {
                this.$confirm('确定要退出登录吗?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    logout();
                    this.$message({
                        type: 'success',
                        message: '已安全退出登录'
                    });
                }).catch(() => { });
            } else if (command === 'userSettings') {
                this.$router.push('/user-settings');
            }
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
    height: 100vh;
    /* 占据父容器的全部宽高 */
}

.grid-item {
    height: 100%;
}

.grid-item.left {
    flex: 0 0 auto;
    /* 左侧宽度自适应内容 */
    position: relative;
    /* 为了定位settings-gear */
    display: flex;
    flex-direction: column;
    background-color: #fff;
}

.grid-item.left .van-collapse,
.grid-item.left .van-sidebar {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 60px;
    /* 为设置齿轮留出空间 */
}

.grid-item.right {
    flex: 1 1 auto;
    /* 右侧填充剩余空间 */
    /*  或者 flex-grow: 1;  flex-shrink: 1; flex-basis: auto; */
}

.card {
    margin: ps(10) ps(10);
}

.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    height: 60px;
    background-color: #545c64;
    color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
}

.title {
    font-size: 20px;
    font-weight: bold;
}

.user-info {
    display: flex;
    align-items: center;
}

.user-info span {
    margin-right: 15px;
}

.el-dropdown-link {
    cursor: pointer;
    color: white;
    font-size: 18px;
}

.el-dropdown-link:hover {
    color: #d0d0d0;
}

/* 左下角设置齿轮样式 */
.settings-gear {
    position: absolute;
    bottom: 60px;
    left: 15px;
    z-index: 10;
    background-color: transparent;
    padding: 8px;
    border-radius: 4px;
    display: flex;
    gap: 15px;
}

.settings-gear .el-dropdown-link {
    color: black;
    font-size: 28px;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.settings-gear .el-dropdown-link:hover {
    color: #242424;
}

.grid-item.left .van-collapse {
    flex: 1;
    overflow-y: auto;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    margin-bottom: 50px;
    /* 为设置按钮留出空间 */
}

.tree-container {
    padding: 10px;
}

.tree-container :deep(.el-tree) {
    background: transparent;
}

.tree-container :deep(.el-tree-node__content) {
    height: 32px;
}

.tree-container :deep(.el-tree-node.is-current > .el-tree-node__content) {
    background-color: #ecf5ff;
}

.tree-container :deep(.el-tree-node__content:hover) {
    background-color: #f5f7fa;
}

.nav-container {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
}
</style>