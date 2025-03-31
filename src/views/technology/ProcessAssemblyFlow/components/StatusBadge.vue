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
    border: 0.39vh solid #FF0000; /* 3px -> 0.39vh (3/768*100) */
    border-radius: 0.65vh; /* 5px -> 0.65vh (5/768*100) */
    padding: 0.65vh 0.98vw; /* 5px 10px -> 0.65vh 0.98vw (5/768*100, 10/1024*100) */
    margin: 0.65vh; /* 5px -> 0.65vh (5/768*100) */
    font-weight: bold;
}

/* 已审批状态样式 */
.bill-status-approval {
    color: #90EE90;
    /* 添加边框 */
    border: 0.39vh solid #90EE90; /* 3px -> 0.39vh (3/768*100) */
    border-radius: 0.65vh; /* 5px -> 0.65vh (5/768*100) */
    padding: 0.65vh 0.98vw; /* 5px 10px -> 0.65vh 0.98vw (5/768*100, 10/1024*100) */
    margin: 0.65vh; /* 5px -> 0.65vh (5/768*100) */
    font-weight: bold;
}
</style> 