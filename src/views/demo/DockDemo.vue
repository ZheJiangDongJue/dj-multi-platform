<template>
    <div class="container">
        <DockPanel :lastChildFill="true">
            <DockItem dock="top" class="header">顶部</DockItem>
            <DockItem dock="top" class="header">顶部2</DockItem>
            <DockItem dock="left" class="sidebar">左侧</DockItem>
            <DockItem dock="left" class="sidebar">左侧2</DockItem>
            <DockItem dock="right" class="tools">右侧</DockItem>
            <DockItem dock="right" class="tools">右侧2</DockItem>
            <DockItem dock="bottom" class="btm">下方</DockItem>
            <DockItem dock="bottom" class="btm">下方2</DockItem>
            <DockItem class="content">自动填充剩余区域（最后一个元素）</DockItem>
        </DockPanel>
    </div>
</template>

<script>
import DockPanel from '@/components/dock/DockPanel.vue';
import DockItem from '@/components/dock/DockItem.vue';

export default {
    components: { DockPanel, DockItem }
};
</script>

<style scoped>
.container {
    width: 100vw;
    height: 100vh;
}

.header {
    background: #ffe0b2;
    height: 60px;
}

.sidebar {
    background: #c8e6c9;
    width: 200px;
}

.tools {
    background: #bbdefb;
    width: 150px;
}

.btm {
    background: #bbdefb;
    height: 150px;
}

.content {
    background: #f5f5f5;
}
</style>