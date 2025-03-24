<!-- 状态标志组件 -->
<template>
    <div :class="getStatusBorderClass()">
        {{ getStatusText() }}
    </div>
</template>

<script>
export default {
    name: 'StatusBadge',
    props: {
        status: {
            type: Number,
            default: 0,
        },
    },
    methods: {
        getStatusBorderClass() {
            var billStatus = this.status;
            return {
                'bill-status-unapproved': billStatus == 0 || billStatus == undefined,
                'bill-status-approval': (billStatus & 1) != 0,
            };
        },
        getStatusText() {
            var billStatus = this.status;
            if (billStatus == 0 || billStatus == undefined) {
                return '未审批';
            } else if ((billStatus & 1) != 0) {
                return '已审批';
            }
            return '未审批';
        },
    },
}
</script>

<style lang="scss" scoped>
/* 未审批状态样式 */
.bill-status-unapproved {
    color: #FF0000;
    /* 添加边框 */
    border: 3px solid #FF0000;
    border-radius: 5px;
    padding: 5px 10px;
    margin: 5px;
    font-weight: bold;
}

/* 已审批状态样式 */
.bill-status-approval {
    color: #90EE90;
    /* 添加边框 */
    border: 3px solid #90EE90;
    border-radius: 5px;
    padding: 5px 10px;
    margin: 5px;
    font-weight: bold;
}
</style> 