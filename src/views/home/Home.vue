<template>
    <div class="home-container">
        <!-- Left Navigation Bar -->
        <div class="nav-sidebar">
            <el-menu
                default-active="1"
                class="nav-menu"
                background-color="#545c64"
                text-color="#fff"
                active-text-color="#ffd04b">
                <el-menu-item index="1">
                    <i class="el-icon-menu"></i>
                    <span>功能-没想好1</span>
                </el-menu-item>
                <el-menu-item index="2">
                    <i class="el-icon-document"></i>
                    <span>功能-没想好2</span>
                </el-menu-item>
                <el-menu-item index="3">
                    <i class="el-icon-setting"></i>
                    <span>功能-没想好3</span>
                </el-menu-item>
            </el-menu>
        </div>

        <!-- Main Content Area -->
        <div class="main-content">
            <!-- Top Tabs -->
            <el-tabs v-model="activeTab" type="card">
                <el-tab-pane label="Tab 1" name="tab1">Tab 1 Content</el-tab-pane>
                <!-- <el-tab-pane label="Tab 2" name="tab2">Tab 2 Content</el-tab-pane>
                <el-tab-pane label="Tab 3" name="tab3">Tab 3 Content</el-tab-pane> -->
            </el-tabs>
        </div>
    </div>
</template>

<script>
export default {
    name: 'HomePage',
    data: function () {
        return {
            activeTab: 'tab1'
        }
    }
}
</script>

<style scoped>
.home-container {
    display: flex;
    height: 100vh;
}

.nav-sidebar {
    width: 200px;
    height: 100%;
    background-color: #545c64;
}

.nav-menu {
    height: 100%;
}

.main-content {
    flex: 1;
    padding: 20px;
    display: flex;
    flex-direction: column;
}

.page-content {
    flex: 1;
    margin-top: 20px;
    background-color: #fff;
    padding: 20px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
}
</style>