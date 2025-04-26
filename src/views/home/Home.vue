<template>
    <div class="app-container">
        <div class="navbar">
            <div v-if="deviceType === 'mobile'" class="menu-button" @click="toggleSidebar" :class="{ 'active': !sidebarVisible }">
                <i class="el-icon-menu"></i>
                <div class="menu-ripple" v-show="menuRipple"></div>
            </div>
            <div class="title">东爵ERP系统</div>
            <div class="user-info" @click="showUserDropdown = !showUserDropdown" ref="userInfo">
                <span v-if="userInfo">{{ userInfo.name || userInfo.username }}</span>
                <span v-else>未登录</span>
                <i class="el-icon-caret-bottom ml-5" :class="{ 'dropdown-active': showUserDropdown }"></i>
            </div>
        </div>

        <!-- 手机端弹出侧边栏 -->
        <van-popup v-if="deviceType === 'mobile'" v-model="sidebarVisible" position="left" :style="{ 
            width: '30%', minWidth: '200px',
         height: '100%' }" :overlay="true"
            :overlay-class="'sidebar-overlay'" class="mobile-sidebar-popup" :duration="0.3">
            <div class="sidebar-content">
                <div class="sidebar-header">
                    <div class="company-logo">DJ</div>
                    <div class="company-name">东爵ERP系统</div>
                </div>
                <div v-if="navigateMode == 0">
                    <div class="nav-container">
                        <van-collapse v-model="navigatorActiveKey" accordion class="custom-collapse">
                            <van-collapse-item :title="item.Name" :name="item.Name" v-for="item in navigatorItems"
                                :key="item.id" :is-link="item.Children.length > 0" class="custom-collapse-item">
                                <div class="tree-container" v-if="item.Children.length > 0">
                                    <el-tree :data="item.Children" :props="defaultProps" @node-click="handleNodeClick"
                                        :highlight-current="true" node-key="id">
                                    </el-tree>
                                </div>
                            </van-collapse-item>
                        </van-collapse>
                    </div>
                </div>
                <div v-if="navigateMode == 1" class="sidebar-menu">
                    <van-sidebar v-model="navigatorActiveKey" class="custom-sidebar">
                        <van-sidebar-item v-for="item in navigatorItems" :key="item.id" :title="item.Name"
                            :name="item.Name" class="sidebar-item" @click="handleMobileSidebarItemClick(item)" />
                    </van-sidebar>
                </div>
            </div>
        </van-popup>

        <div class="content-wrapper">
            <!-- 常驻侧边栏 (平板/PC) -->
            <div v-if="deviceType !== 'mobile'" class="sidebar" :class="{ 'sidebar-collapsed': !sidebarVisible }">
                <div class="sidebar-header">
                    <div class="company-logo">DJ</div>
                    <div class="company-name" v-show="sidebarVisible">东爵ERP系统</div>
                </div>
                <div class="sidebar-content">
                    <div v-if="navigateMode == 0">
                        <div class="nav-container">
                            <van-collapse v-model="navigatorActiveKey" accordion class="custom-collapse">
                                <van-collapse-item :title="item.Name" :name="item.Name" v-for="item in navigatorItems"
                                    :key="item.id" :is-link="item.Children.length > 0" class="custom-collapse-item">
                                    <div class="tree-container" v-if="item.Children.length > 0">
                                        <el-tree :data="item.Children" :props="defaultProps" @node-click="handleNodeClick"
                                            :highlight-current="true" node-key="id">
                                        </el-tree>
                                    </div>
                                </van-collapse-item>
                            </van-collapse>
                        </div>
                    </div>
                    <div v-if="navigateMode == 1" class="sidebar-menu">
                        <van-sidebar v-model="navigatorActiveKey" class="custom-sidebar">
                            <van-sidebar-item v-for="item in navigatorItems" :key="item.id" :title="item.Name"
                                :name="item.Name" class="sidebar-item" @click="handleSidebarItemClick(item)">
                                <template #title>
                                    <div class="sidebar-item-title" v-if="sidebarVisible">{{ item.Name }}</div>
                                    <div class="sidebar-item-icon" v-else>{{ item.Name.charAt(0) }}</div>
                                </template>
                            </van-sidebar-item>
                        </van-sidebar>
                    </div>
                </div>
            </div>

            <div class="main-content" :class="{ 'sidebar-open': sidebarVisible && !isMobile }">
                <transition name="fade" mode="out-in">
                    <div v-if="!isChildRouteActive" class="dashboard-container">
                        <h2 class="module-title" v-if="currentModuleItems.length > 0">
                            {{ navigatorItems[navigatorActiveKey] ? navigatorItems[navigatorActiveKey].Name : '欢迎使用' }}
                        </h2>
                        <div class="flex-s-w card-grid">
                            <Card :header="item.Name" v-for="item in currentModuleItems" :key="item.id" :bind="item"
                                @card-click="onCardClick">
                                <template v-slot:icon>
                                    <div class="text-icon">{{ item.Name ? item.Name.charAt(0) : '' }}</div>
                                </template>
                            </Card>
                        </div>
                    </div>
                </transition>
            </div>
        </div>

        <!-- 功能页面路由视图 - 移到外层确保不会被其他元素遮挡 -->
        <div v-if="isChildRouteActive" class="function-page-wrapper">
            <div class="function-page-container">
                <!-- <div class="function-page-header">
                    <div class="back-button" @click="handleBackToModule">
                        <i class="el-icon-arrow-left"></i>
                        <span>返回</span>
                    </div>
                    <div class="function-page-title">{{ getCurrentFunctionTitle() }}</div>
                </div> -->
                <router-view class="nested-router-view"></router-view>
            </div>
        </div>

        <!-- 用户下拉菜单 - 移到外层以避免被嵌套路由遮挡 -->
        <div class="global-dropdown-container">
            <div class="user-dropdown" v-show="showUserDropdown" @click.stop ref="userDropdown">
                <div class="dropdown-arrow"></div>
                <div class="dropdown-content">
                    <div class="user-avatar">
                        <div class="avatar-circle">{{ userInfo && (userInfo.name || userInfo.username) ? (userInfo.name
                            ||
                            userInfo.username).charAt(0) : 'U' }}</div>
                        <div class="user-details">
                            <div class="user-name">{{ userInfo && (userInfo.name || userInfo.username) ? (userInfo.name
                                ||
                                userInfo.username) : '游客' }}</div>
                            <div class="user-role">{{ userInfo && userInfo.role ? userInfo.role : '普通用户' }}</div>
                        </div>
                    </div>
                    <div class="dropdown-divider"></div>
                    <div class="dropdown-item" @click="$router.push('/home/user-settings')">
                        <i class="el-icon-user"></i>
                        <span>个人设置</span>
                    </div>
                    <!-- <div class="dropdown-item" @click="$router.push('/home/notifications')">
                        <i class="el-icon-bell"></i>
                        <span>消息通知</span>
                        <div class="notify-badge" v-if="notificationCount > 0">{{ notificationCount }}</div>
                    </div> -->
                    <div class="dropdown-divider"></div>
                    <div class="dropdown-item" @click="handleCommand('logout')">
                        <i class="el-icon-switch-button"></i>
                        <span>退出登录</span>
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
import detectDeviceHelper from '@/utils/multi-platform';

export default {
    name: 'HomePage',
    components: {
        Card,
    },
    data: function () {
        return {
            sidebarVisible: true, // 侧边栏是否可见，默认为可见
            isMobile: false, // 是否是手机设备
            deviceType: 'desktop', // 设备类型：mobile, tablet, desktop
            navigateMode: 1,//0: 左侧导航模式,1: 桌面图标模式
            navigatorActiveKey: 0,
            navigatorItems: [],
            currentModuleItems: [],
            defaultProps: {
                children: 'Children',
                label: 'Name'
            },
            menuRipple: false,
            showUserDropdown: false,
            userInfo: {
                name: '测试用户',
                username: 'testuser',
                role: '用户'
            },
            notificationCount: 3,
            dropdownPosition: {
                top: 0,
                left: 0
            }
        }
    },
    computed: {
        // 判断是否有子路由激活
        isChildRouteActive() {
            // 检查当前路由是否为home的直接子路由（不包含模块子路由）
            const path = this.$route.path;
            const isHomePath = path === '/home';
            const isModulePath = /^\/home\/[^/]+$/.test(path); // 匹配/home/模块名 格式
            
            // 如果是/home或/home/模块名，则显示聚合页面
            return !(isHomePath || isModulePath);
        }
    },
    watch: {
        navigatorActiveKey: function (newValue, oldValue) {
            console.log('navigatorActiveKey changed from ' + oldValue + ' to ' + newValue);
            this.refreshCurrentModule();
        },
        showUserDropdown: function (newVal) {
            if (newVal) {
                this.$nextTick(() => {
                    this.updateDropdownPosition();
                });
            }
        },
        $route: {
            handler: function(to) {
                // 当路由发生变化时，更新显示的模块
                const path = to.path;
                // 如果路径是/home/模块名格式
                const moduleMatch = path.match(/^\/home\/([^/]+)$/);
                if (moduleMatch) {
                    const moduleRoute = moduleMatch[1];
                    // 根据路由路径查找模块名称
                    for (let i = 0; i < this.navigatorItems.length; i++) {
                        const moduleInfo = this.getModuleRouteInfo(this.navigatorItems[i]);
                        if (moduleInfo && moduleInfo.moduleRoute === moduleRoute) {
                            // 更新选中的导航项
                            this.navigatorActiveKey = i;
                            break;
                        }
                    }
                }
            },
            immediate: true
        }
    },
    mounted() {
        // 点击页面其他区域时关闭用户下拉菜单
        document.addEventListener('click', this.closeUserDropdown);
        window.addEventListener('resize', this.handleResize);
        this.handleResize(); // 初始判断是否为移动设备
    },
    beforeDestroy() {
        document.removeEventListener('click', this.closeUserDropdown);
        window.removeEventListener('resize', this.handleResize);
    },
    async created() {
        this.navigatorItems.push({
            Name: '工艺系统',
            Children: [
                {
                    Name: '组装流程卡',
                    PageName: "ProcessAssemblyFlowBill",
                },
                {
                    Name: '组装批量接收',
                    PageName: "BatchReceiveProcessAssemblyFlow",
                },
                {
                    Name: '组装批量完工',
                    PageName: "BatchCompleteProcessAssemblyFlow",
                },
                {
                    Name: '输入法高度挤压测试',
                    PageName: "ViewportDemo",
                },
            ]
        })
        
        // 添加示例模块
        this.navigatorItems.push({
            Name: '示例',
            Children: [
                {
                    Name: '单据页面模板',
                    PageName: "BillPageTemplateDemo",
                },
                {
                    Name: '输入法高度挤压测试',
                    PageName: "ViewportDemo",
                },
            ]
        })
        
        for (let i = 0; i < this.navigatorItems.length; i++) {
            const element = this.navigatorItems[i];
            element.id = i + 1;
        }
        this.refreshCurrentModule();
    },
    methods: {
        toggleSidebar() {
            // 仅在移动设备上需要展开/收起侧边栏
            if (this.deviceType === 'mobile') {
                // 添加水波纹效果
                this.menuRipple = true;
                setTimeout(() => {
                    this.menuRipple = false;
                }, 600);

                this.sidebarVisible = !this.sidebarVisible;
            }
        },
        handleResize() {
            // 判断设备类型
            this.deviceType = detectDeviceHelper.detectDeviceType();
            
            // 判断是否为移动设备（小于768px视为移动设备）
            this.isMobile = window.innerWidth < 768;
            
            // 根据设备类型设置侧边栏默认状态
            if (this.deviceType === 'mobile') {
                this.sidebarVisible = false; // 手机上默认隐藏侧边栏
            } else if (this.deviceType === 'tablet') {
                this.sidebarVisible = true; // 平板上默认显示侧边栏
            } else {
                this.sidebarVisible = true; // 桌面端默认显示侧边栏
            }
        },
        updateDropdownPosition() {
            if (this.$refs.userInfo && this.$refs.userDropdown) {
                const userInfoRect = this.$refs.userInfo.getBoundingClientRect();
                const dropdown = this.$refs.userDropdown;

                // 设置下拉菜单位置
                dropdown.style.position = 'fixed';
                dropdown.style.top = userInfoRect.bottom + 'px';
                dropdown.style.right = (window.innerWidth - userInfoRect.right) + 'px';
            }
        },
        closeUserDropdown(event) {
            // 如果点击的不是用户信息区域和下拉菜单，关闭下拉菜单
            const userInfoEl = this.$refs.userInfo;
            const dropdownEl = this.$refs.userDropdown;

            if (this.showUserDropdown &&
                userInfoEl &&
                dropdownEl &&
                !userInfoEl.contains(event.target) &&
                !dropdownEl.contains(event.target)) {
                this.showUserDropdown = false;
            }
        },
        refreshCurrentModule() {
            let key = this.navigatorActiveKey;
            this.currentModuleItems = this.navigatorItems[key].Children;
        },
        handleSidebarItemClick(item) {
            // 平板/PC上点击模块菜单项，跳转到对应模块的聚合页面
            // 获取模块对应的路由路径
            const moduleInfo = this.getModuleRouteInfo(item);
            if (moduleInfo) {
                // 检查当前路由是否已经是目标路由，避免重复导航
                const targetPath = `/home/${moduleInfo.moduleRoute}`;
                if (this.$route.path !== targetPath) {
                    this.$router.push(targetPath).catch(err => {
                        // 忽略重复导航错误
                        if (err.name !== 'NavigationDuplicated') {
                            console.error('导航错误:', err);
                        }
                    });
                }
            }
        },
        handleMobileSidebarItemClick(item) {
            // 获取模块对应的路由路径
            const moduleInfo = this.getModuleRouteInfo(item);
            if (moduleInfo) {
                // 检查当前路由是否已经是目标路由，避免重复导航
                const targetPath = `/home/${moduleInfo.moduleRoute}`;
                if (this.$route.path !== targetPath) {
                    this.$router.push(targetPath).catch(err => {
                        // 忽略重复导航错误
                        if (err.name !== 'NavigationDuplicated') {
                            console.error('导航错误:', err);
                        }
                    });
                }
            }
            // 只在移动设备上关闭侧边栏
            if (this.deviceType === 'mobile') {
                this.sidebarVisible = false;
            }
        },
        // 获取模块对应的路由信息
        getModuleRouteInfo(item) {
            // 模块名称到路由路径的映射
            const moduleNameToRoute = {
                '工艺系统': 'technology',
                '示例': 'example'
                // 可以添加更多模块...
            };
            return item && item.Name ? { 
                moduleName: item.Name,
                moduleRoute: moduleNameToRoute[item.Name] || item.Name.toLowerCase()
            } : null;
        },
        onCardClick(data) {
            this.currentModuleItems.forEach(element => {
                if (element === data) {
                    console.log("点击了" + data.PageName);
                    if (data.PageName != undefined) {
                        // 使用新的嵌套路由转换方法
                        let nestedRouter = PageNameToRouterConverter.ConvertNested(data.PageName);
                        if (nestedRouter === undefined) {
                            return;
                        }
                        
                        // 构建目标路径
                        const targetPath = '/home/' + nestedRouter;
                        console.log('页面名称:"' + data.PageName + '" ->转换为-> 子路由:"' + targetPath + '"');
                        
                        // 检查当前路径，避免重复导航
                        if (this.$route.path !== targetPath) {
                            this.$router.push(targetPath).catch(err => {
                                // 忽略重复导航错误
                                if (err.name !== 'NavigationDuplicated') {
                                    console.error('导航错误:', err);
                                }
                            });
                        }
                    }
                }
            });
        },
        handleNodeClick(data) {
            this.onCardClick(data);
            
            // 只在移动设备上关闭侧边栏
            if (this.deviceType === 'mobile') {
                this.sidebarVisible = false;
            }
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
                this.$router.push('/home/user-settings');
                if (this.deviceType === 'mobile') {
                    this.sidebarVisible = false;
                }
            }
        },
        handleBackToModule() {
            // 返回模块聚合页面的逻辑
            const path = this.$route.path;
            // 从路径中提取模块部分 /home/模块/功能 -> /home/模块
            const matches = path.match(/^(\/home\/[^/]+)/);
            if (matches && matches[1]) {
                const modulePath = matches[1];
                this.$router.push(modulePath).catch(err => {
                    // 忽略重复导航错误
                    if (err.name !== 'NavigationDuplicated') {
                        console.error('导航错误:', err);
                    }
                });
            } else {
                // 回退到首页
                this.$router.push('/home').catch(err => {
                    // 忽略重复导航错误
                    if (err.name !== 'NavigationDuplicated') {
                        console.error('导航错误:', err);
                    }
                });
            }
        },
        getCurrentFunctionTitle() {
            // 获取当前功能页面的标题
            const path = this.$route.path;
            // 尝试从路径中提取功能名称
            const matches = path.match(/\/([^/]+)$/);
            if (!matches || !matches[1]) return '功能页面';
            
            const funcPathName = matches[1];
            
            // 遍历所有模块下的功能，寻找匹配的路由
            for (const module of this.navigatorItems) {
                for (const func of module.Children) {
                    if (func.PageName) {
                        const convertedPath = PageNameToRouterConverter.Convert(func.PageName);
                        if (convertedPath && convertedPath.replace('/', '') === funcPathName) {
                            return func.Name || '功能页面';
                        }
                    }
                }
            }
            
            return '功能页面';
        }
    }
}
</script>

<style lang="scss">
/* 全局样式规则，防止横向滚动 */
* {
    box-sizing: border-box;
    max-width: 100%;
}
</style>

<style lang="scss" scoped>
@import '@/assets/style/custom-viewport.scss';

.app-container {
    height: 100vh;
    overflow: hidden;
    background-color: #f8f9fa;
    position: relative;
    display: flex;
    flex-direction: column;
    max-width: 100vw; /* 确保不超过视口宽度 */
    box-sizing: border-box; /* 确保padding不会增加宽度 */
}

.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 vw(1.95);
    height: vh(6);
    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    color: white;
    box-shadow: 0 vh(0.26) vh(1.04) rgba(0, 0, 0, 0.15);
    position: relative;
    z-index: 1000;
    /* 提高导航栏的z-index */
}

.menu-button {
    position: relative;
    font-size: vh(2.6);
    cursor: pointer;
    margin-right: vw(1.95);
    display: flex;
    align-items: center;
    justify-content: center;
    width: vh(4.17);
    height: vh(4.17);
    border-radius: 50%;
    transition: background-color 0.3s ease, transform 0.3s ease;
    overflow: hidden;

    &:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    &.active {
        transform: rotate(180deg);
    }

    .menu-ripple {
        position: absolute;
        width: vh(1.3);
        height: vh(1.3);
        background-color: rgba(255, 255, 255, 0.6);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
    }
}

/* 内容包装器 */
.content-wrapper {
    display: flex;
    flex: 1;
    overflow: hidden;
}

@keyframes ripple {
    to {
        transform: scale(6);
        opacity: 0;
    }
}

/* 常驻侧边栏 */
.sidebar {
    width: 20%;
    height: calc(100vh - vh(6));
    background-color: #fff;
    box-shadow: vw(0.29) 0 vw(1.95) rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    transition: width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    overflow: hidden;
    z-index: 900;
    
    &.sidebar-collapsed {
        width: vh(6);
    }
    
    @media (max-width: 768px) {
        width: 30%;
        
        &.sidebar-collapsed {
            width: vh(6);
        }
    }
}

.sidebar-header {
    display: flex;
    align-items: center;
    padding: vh(2.08) vw(1.46);
    border-bottom: vh(0.13) solid #f0f0f0;
    margin-bottom: vh(2.08);
    
    .company-logo {
        min-width: vh(5.21);
        height: vh(5.21);
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        font-weight: bold;
        font-size: vh(2.34);
        margin-right: vw(0.98);
    }
}

.sidebar-item-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.sidebar-item-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: vh(3.39);
    height: vh(3.39);
    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    color: white;
    border-radius: 50%;
    font-weight: 500;
}

.settings-gear {
    margin-top: auto;
    padding: vh(2.08) vw(1.46);
    display: flex;
    border-top: vh(0.13) solid #f0f0f0;
    box-shadow: 0 vh(-0.26) vh(1.04) rgba(0, 0, 0, 0.05);
    
    .el-dropdown-link {
        display: flex;
        align-items: center;
        cursor: pointer;
        
        i {
            font-size: vh(2.08);
            color: #666;
        }
        
        span {
            margin-left: vw(0.98);
            font-size: vh(1.56);
            color: #333;
            white-space: nowrap;
        }
    }
}

.main-content {
    flex: 1;
    height: calc(100vh - vh(6));
    overflow: auto;
    transition: padding 0.3s ease;
    padding: vh(2.6) vw(2.93);

    &::-webkit-scrollbar {
        width: vh(0.52);
    }

    &::-webkit-scrollbar-track {
        background: #f8f9fa;
    }

    &::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: vh(0.26);
    }
}

.title {
    text-align: left;
    margin-left: vw(1.46);
    font-size: vh(2.6);
    font-weight: 600;
    letter-spacing: 0.05em;
    text-shadow: 0 vh(0.13) vh(0.26) rgba(0, 0, 0, 0.3);
    flex: 1;
}

.user-info {
    position: relative;
    display: flex;
    align-items: center;
    padding: vh(0.65) vw(0.98);
    border-radius: vh(2.08);
    transition: background-color 0.3s ease;

    &:hover {
        background-color: rgba(255, 255, 255, 0.1);
        cursor: pointer;
    }
}

.user-info span {
    margin-right: vw(0.5);
    font-weight: 500;
}

.el-icon-caret-bottom {
    transition: transform 0.3s ease;

    &.dropdown-active {
        transform: rotate(180deg);
    }
}

.sidebar-content {
    position: relative;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    /* 添加隐藏横向滚动条 */
    padding-bottom: vh(13);

    &::-webkit-scrollbar {
        width: vh(0.52);
    }

    &::-webkit-scrollbar-track {
        background: #f1f1f1;
    }

    &::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: vh(0.26);
    }
}

/* 自定义侧边栏样式 */
.sidebar-menu {
    width: 100%;
    padding: 0;
    overflow-x: hidden;
    /* 添加隐藏横向滚动条 */
}

/* 自定义sidebar组件样式 */
.custom-sidebar {
    width: 100% !important;
    overflow-x: hidden;
    /* 添加隐藏横向滚动条 */

    /* 确保van-sidebar-item样式正确应用 */
    :deep(.van-sidebar-item) {
        width: 100%;
        padding: vh(2.08) vw(1.46);
        border-radius: 0;
        margin: 0;
        border-left: vh(0.26) solid transparent;
        transition: all 0.3s ease;
        box-sizing: border-box;
        /* 确保盒模型不会导致溢出 */

        /* &--select {
            color: #1e3c72;
            font-weight: 600;
            background: linear-gradient(90deg, rgba(30, 60, 114, 0.05), transparent);
            border-left-color: #1e3c72;
        } */

        &:after {
            display: none;
        }

        .van-sidebar-item__text {
            font-size: vh(1.82);
            white-space: nowrap;
            /* 防止文本换行 */
            overflow: hidden;
            /* 隐藏溢出内容 */
            text-overflow: ellipsis;
            /* 文本溢出显示省略号 */
        }
    }
}

/* 确保侧边栏项的样式 */
.sidebar-item {
    width: 100%;
    transition: background-color 0.3s ease;
    display: block;
    overflow: hidden;
    /* 隐藏溢出内容 */

    &:hover {
        background-color: #f5f7fa;
        /* 移除可能导致宽度变化的变换效果 */
    }
}

/* 自定义树样式 */
.tree-container {
    padding: vh(1.3) vw(1.46);
    width: 100%;
    box-sizing: border-box;
    /* 确保padding不会导致宽度溢出 */
    overflow-x: hidden;
    /* 隐藏横向滚动条 */

    :deep(.el-tree) {
        background: transparent;
        width: 100%;
        overflow: hidden;
        /* 隐藏溢出内容 */
    }

    :deep(.el-tree-node) {
        width: 100%;
        overflow: hidden;
        /* 隐藏溢出内容 */
    }

    :deep(.el-tree-node__content) {
        height: vh(4.17);
        width: 100%;
        border-radius: vh(0.52);
        padding: 0 vw(0.98);
        margin: vh(0.52) 0;
        transition: background-color 0.2s ease;
        box-sizing: border-box;
        /* 确保padding不会导致宽度溢出 */

        &:hover {
            background-color: rgba(30, 60, 114, 0.05);
        }
    }

    :deep(.el-tree-node__label) {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    :deep(.el-tree-node.is-current > .el-tree-node__content) {
        background-color: rgba(30, 60, 114, 0.1);
        color: #1e3c72;
        font-weight: 500;
    }
}

/* 自定义折叠面板样式 */
.custom-collapse {
    width: 100%;
    border: none;
    background-color: transparent;
    overflow: hidden;
    /* 隐藏溢出内容 */

    :deep(.van-collapse-item) {
        margin-bottom: vh(0.52);
        overflow: hidden;
        /* 隐藏溢出内容 */
    }

    :deep(.van-collapse-item__title) {
        width: 100%;
        padding: vh(1.56) vw(1.46);
        font-size: vh(1.82);
        font-weight: 600;
        border-bottom: vh(0.13) solid #f0f0f0;
        background-color: white;
        box-sizing: border-box;
        /* 确保padding不会导致宽度溢出 */

        &:after {
            right: vw(1.46);
            transition: transform 0.3s ease;
        }
    }

    :deep(.van-collapse-item__content) {
        padding: 0;
        width: 100%;
        overflow: hidden;
        /* 隐藏溢出内容 */
    }
}

.ml-10 {
    margin-left: vw(0.98);
}

.ml-5 {
    margin-left: vw(0.49);
}

.dashboard-container {
    max-width: 100%;
    margin: 0 auto;
    
    /* 在手机上居中显示内容 */
    @media (max-width: 480px) {
        text-align: center;
        padding: 0 vh(1.3);
    }
}

.module-title {
    font-size: vh(2.86);
    font-weight: 600;
    color: #333;
    margin-bottom: vh(2.6);
    position: relative;
    display: inline-block;

    &::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: vh(-0.78);
        width: 30%;
        height: vh(0.26);
        background: linear-gradient(90deg, #1e3c72 0%, #2a5298 100%);
        border-radius: vh(0.13);
    }
}

.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(vh(13), 1fr));
    gap: vh(2.6) vw(1.95);
    padding: vh(1.3) 0;
    
    /* 平板和手机通用的居中样式 */
    @media (max-width: 768px) {
        justify-content: center;
        margin: 0 auto;
    }

    /* 手机特有样式 - 更小的卡片和固定2列布局确保居中 */
    @media (max-width: 480px) {
        grid-template-columns: repeat(2, minmax(vh(11), 1fr));
        gap: vh(1.3) vw(0.98);
        max-width: 95%;
        margin: 0 auto;
        justify-content: center;
    }
    
    /* 平板特有样式 */
    @media (min-width: 481px) and (max-width: 768px) {
        grid-template-columns: repeat(3, minmax(vh(11.72), 1fr));
        gap: vh(1.56) vw(0.98);
        max-width: 95%;
    }
}

/* 文本图标样式 */
.text-icon {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    color: white;
    font-size: vh(2.6);
    font-weight: bold;
    border-radius: vh(1.04);
    user-select: none;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    box-shadow: 0 vh(0.39) vh(0.78) rgba(30, 60, 114, 0.2);
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
    transform: translateY(vh(1.3));
}

.flex-s-w {
    display: flex;
    flex-wrap: wrap;
}

/* 媒体查询适配 */
@media (max-width: 768px) {
    .navbar {
        padding: 0 vw(0.98);
    }

    .title {
        font-size: vh(2.08);
    }

    .menu-button {
        margin-right: vw(0.98);
    }
}

/* 全局下拉菜单容器 */
.global-dropdown-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 0;
    pointer-events: none;
    z-index: 9999;
    /* 最高层级 */
}

.global-dropdown-container>* {
    pointer-events: auto;
}

/* 用户下拉菜单 */
.user-dropdown {
    position: fixed;
    /* 更改为fixed定位 */
    background-color: white;
    border-radius: vh(1.04);
    box-shadow: 0 vh(0.52) vh(2.08) rgba(0, 0, 0, 0.15);
    z-index: 9999;
    /* 确保最高层级 */
    animation: dropdown-appear 0.2s ease-out;
    transform-origin: top right;
    width: vw(20);
}

@keyframes dropdown-appear {
    from {
        opacity: 0;
        transform: scale(0.9);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.dropdown-arrow {
    position: absolute;
    top: vh(-0.65);
    right: vw(1.46);
    width: vh(1.3);
    height: vh(1.3);
    background-color: white;
    transform: rotate(45deg);
    box-shadow: vh(-0.13) vh(-0.13) vh(0.39) rgba(0, 0, 0, 0.05);
}

.dropdown-content {
    position: relative;
    z-index: 1;
    background-color: white;
    border-radius: vh(1.04);
    overflow: hidden;
}

.user-avatar {
    display: flex;
    align-items: center;
    padding: vh(1.56) vw(1.46);
}

.avatar-circle {
    width: vh(4.69);
    height: vh(4.69);
    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: vh(2.08);
    margin-right: vw(0.98);
}

.user-details {
    flex: 1;
}

.user-name {
    font-weight: 600;
    font-size: vh(1.69);
    color: #333;
    margin-bottom: vh(0.39);
}

.user-role {
    font-size: vh(1.3);
    color: #999;
}

.dropdown-divider {
    height: vh(0.13);
    background-color: #f0f0f0;
    margin: vh(0.52) 0;
}

.dropdown-item {
    display: flex;
    align-items: center;
    padding: vh(1.3) vw(1.46);
    transition: background-color 0.2s ease;
    position: relative;

    &:hover {
        background-color: #f8f9fa;
    }

    i {
        font-size: vh(2.08);
        color: #666;
        margin-right: vw(0.98);
        width: vh(2.08);
        text-align: center;
    }

    span {
        font-size: vh(1.56);
        color: #333;
    }
}

.notify-badge {
    position: absolute;
    right: vw(1.46);
    background-color: #f56c6c;
    color: white;
    font-size: vh(1.3);
    height: vh(2.08);
    min-width: vh(2.08);
    border-radius: vh(1.04);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 vh(0.52);
}

.mobile-sidebar-popup {
    display: flex;
    flex-direction: column;
    background-color: #fff;
    box-shadow: vw(0.29) 0 vw(1.95) rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.sidebar-overlay {
    background-color: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(vh(0.39));
}

/* 功能页面外层包装器 */
.function-page-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2000; /* 超高层级确保在所有元素之上 */
    background-color: rgba(248, 249, 250, 0.98);
    display: flex;
    flex-direction: column;
    animation: page-wrapper-enter 0.3s ease-out;
    overflow: hidden; /* 防止产生滚动条 */
}

@keyframes page-wrapper-enter {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

/* 嵌套路由功能页面容器 */
.function-page-container {
    position: relative; /* 改为相对定位 */
    background-color: #fff;
    z-index: 999; /* 提高z-index确保不被其他元素遮挡 */
    overflow: auto;
    display: flex;
    flex-direction: column;
    animation: page-enter 0.3s ease-out;
    box-shadow: 0 0 vh(1.3) rgba(0, 0, 0, 0.08);
    border-radius: vh(0.52);
    // margin: vh(6.5) auto vh(1.3) auto; /* 顶部留出导航栏的高度 */
    // width: 95%; /* 减小宽度以避免产生滚动条 */
    // max-width: 1280px;
    height: vh(100); /* 高度减去导航栏和边距 */
}

@keyframes page-enter {
    from {
        opacity: 0;
        transform: translateY(vh(0.65));
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.function-page-header {
    display: flex;
    align-items: center;
    padding: vh(1.3) vw(1.46);
    border-bottom: vh(0.13) solid #f0f0f0;
    // margin-bottom: vh(1.3);
    background-color: white;
    border-radius: vh(0.52) vh(0.52) 0 0;
    max-width: 100%;
    box-sizing: border-box;
    flex-wrap: wrap; /* 在小屏幕上允许换行 */
}

.back-button {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: vh(0.78) vw(0.98);
    border-radius: vh(0.52);
    transition: background-color 0.2s ease;
    margin-right: vw(1.46);
    
    &:hover {
        background-color: rgba(30, 60, 114, 0.05);
    }
    
    i {
        font-size: vh(1.82);
        color: #1e3c72;
        margin-right: vw(0.49);
    }
    
    span {
        font-size: vh(1.56);
        color: #1e3c72;
        font-weight: 500;
    }
}

.function-page-title {
    font-size: vh(1.82);
    font-weight: 600;
    color: #333;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.nested-router-view {
    flex: 1;
    display: flex;
    flex-direction: column;
    // padding: vh(1.56) vw(1.46);
    overflow: auto;
    max-width: 100%;
    box-sizing: border-box;
}

/* 移动端适配 */
@media (max-width: 768px) {
    .function-page-container {
        // margin: vh(6.5) auto vh(0.65) auto; 
        // width: 98%;
        // height: calc(100vh - vh(7.5)); 
        border-radius: 0;
    }
    
    .nested-router-view {
        // padding: vh(1.3) vw(0.98);
    }
    
    .function-page-header {
        padding: vh(1) vw(1);
    }
}
</style>