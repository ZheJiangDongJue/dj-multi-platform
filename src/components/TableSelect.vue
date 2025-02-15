<template>
    <div class="custom-select" v-click-outside="closeDropdown">
        <div class="select-header" @click="toggleDropdown">
            <input type="text" v-model="displayText" :placeholder="placeholder" @input="handleInput" />
            <span class="arrow" :class="{ 'arrow-up': isOpen }">▼</span>
        </div>

        <transition name="slide-fade">
            <div v-show="isOpen" class="dropdown-content">
                <!-- 列表类型内容 -->
                <ul v-if="contentType === 'list'" class="option-list">
                    <li v-for="option in filteredOptions" :key="option.value"
                        @click="handleItemClick($event, () => toggleOptionSelection(option))"
                        :class="{ 'selected': isSelected(option) }">
                        <input v-if="multiple" type="checkbox" :checked="isSelected(option)" @change="toggleTableSelection(option)"
                            class="checkbox" />
                        {{ option[displayName] }}
                    </li>
                </ul>

                <!-- 表格类型内容 -->
                <table v-else-if="contentType === 'table'" class="option-table">
                    <thead>
                        <tr>
                            <th v-if="multiple" style="width: 30px;"></th>
                            <th v-for="header in tableData.headers" :key="header">
                                {{ header }}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(row, index) in filteredTableData" :key="index"
                            @click="handleItemClick($event, () => toggleOptionSelection(row))"
                            :class="{ 'selected': isTableSelected(row) }">
                            <td v-if="multiple">
                                <input type="checkbox" :checked="isTableSelected(row)"
                                    @change="toggleTableSelection(row)" class="checkbox" />
                            </td>
                            <td v-for="header in tableData.headers" :key="header">
                                {{ row[header] }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </transition>
    </div>
</template>

<script>
export default {
    name: 'TableSelect',
    props: {
        value: [Array, String, Number, Object],
        placeholder: {
            type: String,
            default: '请选择'
        },
        contentType: {
            type: String,
            default: 'list',
            validator: value => ['list', 'table'].includes(value)
        },
        options: {
            type: Array,
            default: () => []
        },
        tableData: {
            type: Object,
            default: () => ({ headers: [], rows: [] })
        },
        filterable: {
            type: Boolean,
            default: true
        },
        fieldName: {
            type: String,
            default: ''
        },
        displayName: {
            type: String,
            default: ''
        },
        multiple: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            isOpen: false,
            searchQuery: '',// 用于过滤的文本
            displayText: '',// 输入框显示文本
        };
    },
    created() {
        // 初始化显示文本
        this.initDisplayText();
    },
    watch: {
        value() {
            // 值变化时更新显示文本
            this.initDisplayText();
        }
    },
    computed: {
        selectedValues() {
            return this.multiple
                ? (Array.isArray(this.value) ? this.value : [])
                : [this.value].filter(v => v !== undefined)
        },
        filteredOptions() {
            if (!this.filterable) return this.options;
            const query = this.searchQuery.toLowerCase();
            return this.options.filter(option =>
                option[this.displayName]?.toLowerCase().includes(query) ?? true
            );
        },
        filteredTableData() {
            if (!this.filterable) return this.tableData.rows;
            const query = this.searchQuery.toLowerCase();
            return this.tableData.rows.filter(row =>
                Object.values(row).some(value =>
                    String(value).toLowerCase().includes(query)
                )
            );
        }
    },
    directives: {
        'click-outside': {
            bind(el, binding) {
                el.clickOutsideEvent = function (event) {
                    if (!el.contains(event.target)) {
                        binding.value();
                    }
                };
                document.addEventListener('click', el.clickOutsideEvent);
            },
            unbind(el) {
                document.removeEventListener('click', el.clickOutsideEvent);
            }
        }
    },
    methods: {
        initDisplayText() {
            if (!this.value || (this.multiple && this.value.length === 0)) {
                this.displayText = '';
                return;
            }

            if (this.multiple) {
                const selectedItems = this.getSelectedItems();
                if (selectedItems.length > 0) {
                    const first = this.getItemDisplayText(selectedItems[0]);
                    this.displayText = selectedItems.length > 1
                        ? `${first} +${selectedItems.length - 1}`
                        : first;
                }
            } else {
                // 保持原来的单选逻辑
                if (this.contentType === 'list') {
                    const option = this.options.find(opt =>
                        this.getValue(opt) === this.value
                    );
                    this.displayText = option ? this.getDisplayText(option) : '';
                } else {
                    const row = this.tableData.rows.find(row =>
                        this.getRowValue(row) === this.value
                    );
                    this.displayText = row ? this.getRowDisplayText(row) : '';
                }
            }
        },

        getSelectedItems() {
            if (this.contentType === 'list') {
                return this.options.filter(opt =>
                    this.selectedValues.includes(this.getValue(opt))
                );
            }
            return this.tableData.rows.filter(row =>
                this.selectedValues.includes(this.getRowValue(row))
            );
        },

        getItemDisplayText(item) {
            return this.contentType === 'list'
                ? this.getDisplayText(item)
                : this.getRowDisplayText(item);
        },

        toggleOptionSelection(option) {
            if (!this.multiple) {
                this.selectOption(option);
                return;
            }

            const value = this.getValue(option);
            const newValues = this.selectedValues.includes(value)
                ? this.selectedValues.filter(v => v !== value)
                : [...this.selectedValues, value];

            this.$emit('input', newValues);
        },

        toggleTableSelection(row) {
            if (!this.multiple) {
                this.selectTableRow(row);
                return;
            }

            const value = this.getRowValue(row);
            const newValues = this.selectedValues.includes(value)
                ? this.selectedValues.filter(v => v !== value)
                : [...this.selectedValues, value];

            this.$emit('input', newValues);
        },

        // 获取实际值
        getValue(option) {
            return this.fieldName ? option[this.fieldName] : option.value;
        },

        // 获取显示文本
        getDisplayText(option) {
            if (this.displayName) return option[this.displayName];
            return option.label || String(this.getValue(option));
        },

        // 表格行值获取
        getRowValue(row) {
            return this.fieldName ? row[this.fieldName] : row;
        },

        // 表格行显示文本
        getRowDisplayText(row) {
            if (this.displayName) return row[this.displayName];
            return Object.values(row).join(' ');
        },

        handleInput() {
            // 输入时同时更新过滤条件和显示文本
            this.searchQuery = this.displayText;
            if (!this.isOpen) this.isOpen = true;
        },
        toggleDropdown() {
            this.isOpen = !this.isOpen;
        },
        closeDropdown() {
            this.isOpen = false;
        },
        selectOption(option) {
            if (this.multiple) {
                const value = this.getValue(option);
                this.$emit('input', value);
            }
            else {
                const value = this.getValue(option);
                this.$emit('input', value);
                this.displayText = this.getDisplayText(option); // 只更新显示文本
                this.closeDropdown();
            }
        },
        selectTableRow(row) {
            if (this.multiple) {
                const value = this.getRowValue(row);
                this.$emit('input', value);
            }
            else {
                const value = this.getRowValue(row);
                this.$emit('input', value);
                this.displayText = this.getRowDisplayText(row); // 只更新显示文本
                this.closeDropdown();
            }
        },
        isSelected(option) {
            return this.selectedValues.includes(this.getValue(option));
        },
        isTableSelected(row) {
            return this.selectedValues.includes(this.getRowValue(row));
        },
        handleItemClick(event, callback) {
            // 如果点击的是checkbox本身，则交给@change处理
            if (event.target.tagName === 'INPUT' && event.target.type === 'checkbox') {
                return;
            }
            callback();
        },
    }
};
</script>

<style scoped>
.custom-select {
    position: relative;
    width: 300px;
}

.select-header {
    display: flex;
    align-items: center;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 8px;
    cursor: pointer;
}

.select-header input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
}

.arrow {
    transition: transform 0.3s;
    margin-left: 8px;
}

.arrow-up {
    transform: rotate(180deg);
}

.dropdown-content {
    position: absolute;
    width: 100%;
    max-height: 400px;
    overflow-y: auto;
    margin-top: 4px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    background: white;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    z-index: 1000;
    position: absolute;
    overflow-y: auto;    /* 确保容器可滚动 */
}

.option-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.option-list li {
    padding: 8px;
    cursor: pointer;
}

.option-list li:hover {
    background: #f5f7fa;
    color: black;
}

.option-list .selected {
    background: #409eff;
    color: white;
}

.option-table {
    width: 100%;
    border-collapse: collapse;
    /* 保证表头对齐 */
    table-layout: fixed;
}

/* 表格头部固定样式 */
.option-table thead th {
    position: sticky;
    top: 0;
    background: white;  /* 需要指定背景色防止透明 */
    z-index: 1;         /* 确保表头在滚动时覆盖内容 */
}

/* 保证表头底部线在滚动时可见 */
.option-table thead {
    box-shadow: 0 2px 0 #ebeef5;
}

.option-table th,
.option-table td {
    padding: 8px;
    border-bottom: 1px solid #ebeef5;
}

.option-table tr:hover {
    background: #f5f7fa;
    color: black;
}

.option-table .selected {
    background: #409eff;
    color: white;
}

.slide-fade-enter-active {
    transition: all 0.3s ease;
}

.slide-fade-leave-active {
    transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter,
.slide-fade-leave-to {
    transform: translateY(-10px);
    opacity: 0;
}
</style>