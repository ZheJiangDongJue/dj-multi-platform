<!-- 工具栏组件 -->
<template>
    <HorizontalStackPanel class="toolbar">
        <van-button class="toolbar-btn toolbar__btn" @click="handleCommand('OpenPreviousBill')" plain>前单</van-button>
        <van-button class="toolbar-btn toolbar__btn" @click="handleCommand('OpenNextBill')" plain>后单</van-button>
        <van-button class="toolbar-btn toolbar__btn" @click="handleCommand('NewBill')" plain>新建单据</van-button>
        <van-button class="toolbar-btn toolbar__btn" @click="handleCommand('RefreshBill')" plain>刷新</van-button>
        <van-button class="toolbar-btn toolbar__btn" @click="handleCommand('SaveBill')" plain>保存</van-button>
        <van-button class="toolbar-btn toolbar__btn" @click="handleCommand('DeleteBill')" plain>删除单据</van-button>
        <van-button class="toolbar-btn toolbar__btn" @click="handleCommand('ApprovalBill')" plain>审批</van-button>
        <van-button class="toolbar-btn toolbar__btn" @click="handleCommand('ReverseApprovalBill')"
            plain>反审批</van-button>

        <!-- 触发按钮 -->
        <!-- <van-button class="btn" @click="showMenu = true" plain>单据操作</van-button> -->

        <!-- 下拉菜单 -->
        <van-popup v-model="showMenu" position="bottom" :style="{ width: '200px', top: '50px' }" get-container="body">
            <van-cell v-for="item in menuItems" :key="item.command" :title="item.label" class="toolbar__menu-item"
                @click="handleSelect(item)" />
        </van-popup>
    </HorizontalStackPanel>
</template>

<script>
import HorizontalStackPanel from '@/components/stack_panel/HorizontalStackPanel.vue';

export default {
    name: 'ToolbarPanel',
    components: {
        HorizontalStackPanel,
    },
    data() {
        return {
            showMenu: false,
            menuItems: [
                { label: '反审批', command: 'ReverseApprovalBill' },
                { label: '结案', command: 'FinishBill' },
                { label: '反结案', command: 'ReverseFinishBill' }
            ],
        }
    },
    methods: {
        handleCommand(command) {
            this.$emit('command', command);
        },
        handleSelect(item) {
            this.showMenu = false;
            this.$emit('command', item.command);
        },
    }
}
</script>

<style lang="scss" scoped>
@import "~@/assets/style/function.scss";
@import "~@/views/technology/ProcessAssemblyFlow/styles/assembly-flow-module.scss";

/* 工具栏组件样式 - 使用BEM命名法 */
.toolbar {
    height: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 0.65vh 0;
    /* 5px 0 -> 0.65vh 0 (5/768*100, 0) */
    align-items: center;

    &__btn {
        margin-right: 0.49vw;
        /* 5px -> 0.49vw (5/1024*100) */
        white-space: nowrap;
    }

    &__menu-item {
        padding: 1.56vh 1.46vw;
        /* 12px 15px -> 1.56vh 1.46vw (12/768*100, 15/1024*100) */
        transition: all 0.3s ease;

        &:hover {
            background-color: #f5f7fa;
            color: #409EFF;
        }
    }
}

/* 媒体查询 - 小屏幕样式调整 */
@include ps {
    .toolbar {
        padding: 0.39vh 0;
        /* 3px 0 -> 0.39vh 0 (3/768*100, 0) */

        &__btn {
            font-size: 1.56vh;
            /* 12px -> 1.56vh (12/768*100) */
            padding: 0 1.56vw;
            /* 修改内边距，从0.78vw增加到1.56vw */
            min-width: 12vw;
            /* 添加最小宽度，确保4个字的按钮有足够空间 */
            overflow: hidden;
            /* 防止文本溢出 */
            text-overflow: ellipsis;
            /* 如果文本仍然溢出，显示省略号 */
        }
    }
}
</style>