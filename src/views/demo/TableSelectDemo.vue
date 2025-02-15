<template>
    <div class="container">
        <!-- 自定义字段示例 -->
        <div class="example-section">
            <h3>自定义字段选择器(单选)</h3>
            <configurable-select v-model="customSelected" :options="userOptions" content-type="list" field-name="id"
                display-name="fullName" placeholder="选择用户" />
            <div class="selected-result">
                当前选中值：{{ customSelected || '未选择' }}
                <button @click="customSelected = null">清除</button>
            </div>
        </div>

        <!-- 表格模式示例 -->
        <div class="example-section">
            <h3>表格模式选择器（带字段配置）(单选)</h3>
            <configurable-select v-model="selectedProduct" :table-data="productTable" content-type="table"
                field-name="ID" display-name="产品名称" placeholder="搜索商品" />
            <div class="selected-result">
                当前选中商品ID：{{ selectedProduct || '未选择' }}
                <button @click="selectedProduct = null">清除</button>
            </div>
        </div>

        <!-- 自定义字段示例 -->
        <div class="example-section">
            <h3>自定义字段选择器</h3>
            <configurable-select v-model="customSelected1" :options="userOptions1" content-type="list" field-name="id"
                :multiple="true" display-name="fullName" placeholder="选择用户" />
            <div class="selected-result">
                当前选中值：{{ customSelected1 || '未选择' }}
                <button @click="customSelected1 = null">清除</button>
            </div>
        </div>

        <!-- 表格模式示例 -->
        <div class="example-section">
            <h3>表格模式选择器（带字段配置）</h3>
            <configurable-select v-model="selectedProduct1" :table-data="productTable1" content-type="table"
                :multiple="true" field-name="ID" display-name="产品名称" placeholder="搜索商品" />
            <div class="selected-result">
                当前选中商品ID：{{ selectedProduct1 || '未选择' }}
                <button @click="selectedProduct1 = null">清除</button>
            </div>
        </div>
    </div>
</template>

<script>
import TableSelect from '@/components/TableSelect.vue'

export default {
    components: {
        ConfigurableSelect: TableSelect
    },
    data() {
        return {
            // 自定义字段数据示例
            customSelected: null,
            customSelected1: null,
            userOptions: [
                { id: 101, fullName: '张三', age: 25 },
                { id: 102, fullName: '李四', age: 30 },
                { id: 103, fullName: '王五', age: 28 }
            ],
            userOptions1: [
                { id: 101, fullName: '张三', age: 25 },
                { id: 102, fullName: '李四', age: 30 },
                { id: 103, fullName: '王五', age: 28 }
            ],

            // 表格数据示例
            selectedProduct: null,
            selectedProduct1: null,
            productTable: {
                headers: ['ID', '产品名称', '价格', '库存'],
                rows: [
                    { ID: 1001, 产品名称: '游戏笔记本', 价格: 8999, 库存: 20 },
                    { ID: 1002, 产品名称: '旗舰手机', 价格: 5999, 库存: 50 },
                    { ID: 1003, 产品名称: '4K显示器', 价格: 2999, 库存: 30 }
                ]
            },
            productTable1: {
                headers: ['ID', '产品名称', '价格', '库存'],
                rows: [
                    { ID: 1001, 产品名称: '游戏笔记本', 价格: 8999, 库存: 20 },
                    { ID: 1002, 产品名称: '旗舰手机', 价格: 5999, 库存: 50 },
                    { ID: 1003, 产品名称: '4K显示器', 价格: 2999, 库存: 30 },
                    { ID: 1002, 产品名称: '旗舰手机', 价格: 5999, 库存: 50 },
                    { ID: 1003, 产品名称: '4K显示器', 价格: 2999, 库存: 30 },
                    { ID: 1002, 产品名称: '旗舰手机', 价格: 5999, 库存: 50 },
                    { ID: 1003, 产品名称: '4K显示器', 价格: 2999, 库存: 30 },
                    { ID: 1002, 产品名称: '旗舰手机', 价格: 5999, 库存: 50 },
                    { ID: 1003, 产品名称: '4K显示器', 价格: 2999, 库存: 30 },
                ]
            }
        }
    }
}
</script>

<style scoped>
.container {
    max-width: 800px;
    height: 90vh;
    margin: 20px auto;
    padding: 20px;
    font-family: Arial, sans-serif;
    overflow: scroll; /* 或 overflow: scroll; */
}

.example-section {
    margin: 40px 0;
    padding: 20px;
    border: 1px solid #eee;
    border-radius: 8px;
}

h3 {
    color: #333;
    margin-bottom: 15px;
}

.selected-result {
    margin-top: 15px;
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 4px;
}

button {
    margin-left: 10px;
    padding: 5px 10px;
    background-color: #409eff;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
}

button:hover {
    background-color: #66b1ff;
}

pre {
    background-color: #f4f4f4;
    padding: 10px;
    border-radius: 4px;
    white-space: pre-wrap;
}
</style>