<template>
  <div>
    <div class="container">
      <van-field label="规格型号" v-model="data.MaterialSpecType" rows="2" readonly v-click-tooltip="data.MaterialSpecType" />
      <van-field label="规格型号说明" v-model="data.MaterialSpecTypeExplain" rows="2" readonly v-click-tooltip="data.MaterialSpecTypeExplain" />

      <!-- 两列布局 -->
      <div class="field-container">
        <van-field v-model="data.InnerKey" label="制令单号" readonly v-click-tooltip="data.InnerKey" />
        <van-field v-model="formattedApprovalTime" label="接收日期" readonly clickable required right-icon="calendar-o"
          @click="handleDateFieldClick" v-click-tooltip="formattedApprovalTime" :disabled="data?.Status > 0" />
        <van-popup v-model="showCalendar" get-container="body" position="bottom" :style="{ height: 'auto' }">
          <van-calendar v-model="showCalendar" :show-confirm="false" @confirm="onSelectDate" />
        </van-popup>
        <van-field v-model="data.Code" label="单据编号" readonly v-click-tooltip="data.Code" />
        <van-field v-model="data.ClientName" label="客户名称" readonly v-click-tooltip="data.ClientName" />
        <van-field v-model="data.MaterialTuHao" label="图号" readonly v-click-tooltip="data.MaterialTuHao" />

        <!-- 将计件人员改为下拉框 -->
        <div class="employee-select-wrapper">
          <van-field v-model="data.ReceiveEmployeeName" label="计件人员" required
            :disabled="data?.Status > 0" right-icon="arrow-down" @click-right-icon="handleScanEmployee"
            @input="handleEmployeeInput" @keyup.enter.native="handleEmployeeInputEnter" 
            @click="handleEmployeeFieldClick" @focus="selectAllText($event)"
            v-click-tooltip="data.ReceiveEmployeeName" />
          <van-popup v-model="showEmployeeSelector" position="bottom" round get-container="body">
            <div class="employee-search">
              <van-search v-model="employeeSearchText" placeholder="搜索员工姓名" @input="filterEmployees"
                ref="employeeSearch" :disabled="searchDisabled" />
            </div>
            <van-picker show-toolbar :columns="filteredEmployeeList" @confirm="onEmployeeSelected"
              @cancel="showEmployeeSelector = false" value-key="Name" @change="handlePickerChange" />
          </van-popup>
        </div>
        <!-- 三列布局行 -->
        <div class="three-column-row">
          <van-field v-model="data.MaterialCode" label="物料编码" readonly v-click-tooltip="data.MaterialCode" />

          <div class="qualification-wrapper">
            <van-field label="判定" readonly required>
              <template #input>
                <el-select v-model="qualificationValue" size="small" class="qualification-dropdown" popper-append-to-body
                  popper-class="high-priority-dropdown" :popper-options="{ gpuAcceleration: false }"
                  @visible-change="handleSelectVisibleChange" :disabled="data?.Status > 0">
                  <el-option v-for="item in qualificationOptions" :key="item.value" :label="item.text"
                    :value="item.value"></el-option>
                </el-select>
              </template>
            </van-field>
          </div>

          <van-field v-model="data.PassBQty" label="接收数量" v-click-tooltip="data.PassBQty" required :disabled="data?.Status > 0" />
        </div>
      </div>

      <!-- 新增的对话框底部组件 -->
      <div class="dialog-footer">
        <div class="qualification-wrapper" style="visibility: hidden;">
          <el-select v-model="qualificationValue" size="small" class="qualification-dropdown" popper-append-to-body
            popper-class="high-priority-dropdown" :popper-options="{ gpuAcceleration: false }"
            @visible-change="handleSelectVisibleChange" :disabled="data?.Status > 0">
            <el-option v-for="item in qualificationOptions" :key="item.value" :label="item.text"
              :value="item.value"></el-option>
          </el-select>
        </div>
        <van-button :class="['approve-button', data?.Status > 0 ? 'reverse-approve' : '']" @click="handleDialogApprove">
          {{ data?.Status > 0 ? '反审批' : '审批' }}
        </van-button>
        <van-button class="delete-button" @click="handleDialogDelete" :disabled="data?.Status > 0">
          <van-icon name="delete" />
        </van-button>
      </div>
    </div>
  </div>
</template>

<script>
import generalapi from '@/api/general';
import billapi from '@/api/bill';
import Vue from 'vue';
import { Query } from '@/core/query';
import { formatDate } from '@/utils/date-utils';

export default {
  name: "AssemblyProcessCompletionPanel",
  props: {
    dataContext: {
      type: Object,
      required: true
    },
  },
  data() {
    return {
      data: null,
      showCalendar: false,
      showEmployeeSelector: false, // 控制员工选择器弹窗
      employeeList: [], // 员工列表
      employeeSearchText: '', // 用于员工搜索
      filteredEmployeeList: [], // 过滤后的员工列表
      qualificationValue: 1, // 合格性状态值: 1=合格, 2=让步接收, 4=不合格
      qualificationOptions: [
        { text: '未选择', value: 0 },
        { text: '合格', value: 1 },
        { text: '让步接收', value: 2 },
        { text: '不合格', value: 4 }
      ],
      showQualificationSelector: false,
      qualificationOptionsList: [
        { text: '合格', value: 1 },
        { text: '让步接收', value: 2 },
        { text: '不合格', value: 4 }
      ],
      employeeInputText: '', // 用于员工输入框
      isHandlingEmployeeInput: false, // 是否正在处理员工输入
      searchDisabled: false, // 是否禁用搜索功能
    };
  },
  computed: {
    // 计算属性，返回格式化的接收日期
    formattedApprovalTime() {
      return formatDate(this.data?.ApprovalTime || '');
    },
    qualificationText() {
      const selectedOption = this.qualificationOptions.find(option => option.value === this.qualificationValue);
      return selectedOption ? selectedOption.text : '';
    }
  },
  watch: {
    dataContext: {
      immediate: true,
      async handler(newVal) {
        if (newVal) {
          // 直接将 dataContext 复制到 data，避免引用关系
          this.data = JSON.parse(JSON.stringify(newVal));
          // 初始化后立即加载数据，但不再触发更多循环
          await this.refreshData();

          // 如果没有设置接收日期，则设置为当前日期
          if (!this.data.ApprovalTime) {
            this.data.ApprovalTime = formatDate(new Date());
          }

          // 加载员工列表
          await this.loadEmployeeList();

          // 默认设置为合格
          this.qualificationValue = 1;
          // // 设置合格性值
          // if (this.data && typeof this.data.CheckResult !== 'undefined') {
          //   this.qualificationValue = this.data.CheckResult;
          // } else {
          //   // 默认设置为合格
          //   this.qualificationValue = 1;
          // }
        }
      }
    },
    // 监听员工选择器显示状态
    showEmployeeSelector(newVal) {
      if (newVal) {
        setTimeout(() => {
          const searchInput = document.querySelector('.van-popup--bottom .employee-search .van-field__control');
          if (searchInput) {
            searchInput.focus();
          }
        }, 300);
      }
    },
  },
  methods: {
    // 过滤员工列表
    filterEmployees() {
      if (!this.employeeSearchText) {
        this.filteredEmployeeList = [...this.employeeList];
        return;
      }

      const searchText = this.employeeSearchText.toLowerCase();
      this.filteredEmployeeList = this.employeeList.filter(employee => {
        return (
          (employee.Name && employee.Name.toLowerCase().includes(searchText)) ||
          (employee.CodeForScan && employee.CodeForScan.toLowerCase().includes(searchText))
        );
      });

      if (this.filteredEmployeeList.length == 1) {
        this.onEmployeeSelected(this.filteredEmployeeList[0]);
      }
    },

    // 加载所有员工列表
    async loadEmployeeList() {
      try {
        let query = new Query();
        query.TableName = "Employee";
        query.ShortName = "e";
        query.Select = 'e.id, e.Name, e.CodeForScan';
        query.AddWhere(`e.DeletedTag=0`);
        query.AddWhere(`(e.EmployeeState = '合同期' or e.EmployeeState = '试用期' or e.EmployeeState = '离职期')`);
        query.Order = 'e.Name ASC'; // 按姓名排序

        const pack = await generalapi.getDataEx(query);

        if (pack.Status == 200) {
          this.employeeList = pack.Data || [];
          // 初始设置过滤后的列表为完整列表
          this.filteredEmployeeList = [...this.employeeList];
          console.log("加载员工列表成功，共", this.employeeList.length, "条数据");
        } else {
          console.error("加载员工列表失败:", pack.Message);
          this.$dialog.alert({
            title: '提示',
            message: `加载员工列表失败: ${pack.Message}`,
          });
        }
      } catch (error) {
        console.error("加载员工列表出错:", error);
        this.$dialog.alert({
          title: '提示',
          message: `加载员工列表出错: ${error.message || '未知错误'}`,
        });
      }
    },

    // 处理员工字段点击
    handleEmployeeFieldClick() {
      // 如果已审批，不允许修改
      if (this.data?.Status > 0) {
        return;
      }
      // 不再打开选择器，交由focus事件处理选中文本
    },

    // 处理员工选择
    onEmployeeSelected(employee) {
      if (employee && employee.id) {
        // 更新员工ID和名称
        this.$set(this.data, 'Employeeid', employee.id);
        this.$set(this.data, 'ReceiveEmployeeName', employee.Name);
        console.log("已选择员工:", employee.Name, "ID:", employee.id);
      }
      this.showEmployeeSelector = false;
      // 清空搜索文本
      this.employeeSearchText = '';
      // 重置过滤的员工列表
      this.filteredEmployeeList = [...this.employeeList];
    },

    // 处理日期字段点击
    handleDateFieldClick() {
      // 如果已审批，不允许修改
      if (this.data?.Status > 0) {
        return;
      }
      this.showCalendar = true;
    },

    onSelectDate(date) {
      this.showCalendar = false;
      // 已审批状态下不允许修改日期
      if (this.data?.Status > 0) {
        return;
      }
      if (date) {
        this.$set(this.data, 'ApprovalTime', formatDate(date));
      }
    },
    async refreshData() {
      if (!this.data) {
        return;
      }
      //获取物料信息
      var materialPack = await generalapi.getDataUseid('Material', this.data.Materialid);
      if (materialPack.Status == 200) {
        let material = materialPack.Data;
        this.$set(this.data, 'MaterialCode', material.Code);
        this.$set(this.data, 'MaterialSpecType', material.SpecType);
        this.$set(this.data, 'MaterialSpecTypeExplain', material.SpecTypeExplain);
        this.$set(this.data, 'MaterialTuHao', material.TuHao);
        this.$set(this.data, 'MaterialClientid', material.Clientid);
      }
      var clientPack = await generalapi.getDataUseid('Client', this.data.MaterialClientid);
      if (clientPack.Status == 200) {
        let client = clientPack.Data;
        this.$set(this.data, 'ClientName', client.Name);
      }
      var employeePack = await generalapi.getDataUseid('Employee', this.data.Employeeid);
      if (employeePack.Status == 200) {
        let employee = employeePack.Data;
        this.$set(this.data, 'ReceiveEmployeeName', employee.Name);
      }
    },
    // 处理下拉框可见性变化
    handleSelectVisibleChange(visible) {
      // 当下拉菜单显示时，确保它在对话框之上
      if (visible) {
        setTimeout(() => {
          const dropdowns = document.querySelectorAll('.el-select-dropdown');
          dropdowns.forEach(dropdown => {
            if (dropdown && dropdown.style) {
              dropdown.style.zIndex = '9999';
              dropdown.style.position = 'absolute';
              dropdown.classList.add('high-priority-dropdown');

              if (dropdown.parentElement !== document.body) {
                document.body.appendChild(dropdown);
              }
            }
          });

          const dialogs = document.querySelectorAll('.van-dialog');
          dialogs.forEach(dialog => {
            if (dialog && dialog.style) {
              dialog.style.overflow = 'visible';
              dialog.style.zIndex = '2000';
            }
          });

          const overlays = document.querySelectorAll('.van-overlay');
          overlays.forEach(overlay => {
            if (overlay && overlay.style) {
              overlay.style.overflow = 'visible';
              overlay.style.zIndex = '1999';
            }
          });

          const poppers = document.querySelectorAll('.el-popper');
          poppers.forEach(popper => {
            if (popper && popper.style) {
              popper.style.zIndex = '9999';
            }
          });
        }, 50);
      }
    },
    // 验证必填字段
    validateRequiredFields() {
      // 检查接收数量
      if (!this.data.PassBQty || this.data.PassBQty.toString().trim() === '') {
        this.$dialog.alert({
          title: '提示',
          message: '请填写接收数量',
        });
        return false;
      }

      // 检查计件人员
      if (!this.data.Employeeid || this.data.Employeeid <= 0) {
        this.$dialog.alert({
          title: '提示',
          message: '请选择计件人员',
        });
        return false;
      }

      // 检查接收日期
      if (!this.data.ApprovalTime || this.data.ApprovalTime.trim() === '') {
        this.$dialog.alert({
          title: '提示',
          message: '请选择接收日期',
        });
        return false;
      }
      
      // 检查合格性判定
      if (!this.qualificationValue || this.qualificationValue === 0) {
        this.$dialog.alert({
          title: '提示',
          message: '请选择判定结果',
        });
        return false;
      }

      // 所有必填项都已填写
      return true;
    },
    // 审批方法
    async handleDialogApprove() {
      try {
        const isApproved = this.data.Status > 0;
        const action = isApproved ? '反审批' : '审批';

        // 在审批前更新合格性状态（如果未审批状态）
        if (!isApproved) {
          // 检查必填项
          if (!this.validateRequiredFields()) {
            return;
          }

          // 更新当前对话框数据中的合格性值
          this.data.CheckResult = this.qualificationValue;
        }

        // 获取表名
        const tableName = this.data.TableName || 'AssemblyProcessCompletionDocument';
        if (!tableName) {
          this.$dialog.alert({
            title: '提示',
            message: '无法确定表名，操作失败',
          });
          return;
        }

        // 先保存单据
        try {
          const saveResult = await billapi.generalBillSave(
            tableName,
            this.data,
            [] // 对话框中的数据没有明细数据，所以传空数组
          );

          if (!saveResult.IsSuccess) {
            this.$dialog.alert({
              title: '提示',
              message: saveResult.ErrorMessage || '保存失败，无法继续审批',
            });
            return;
          }

          // 获取id（如果是新建的单据）
          let id = this.data.id;
          if (!id) {
            id = await generalapi.getIdByUid(tableName, this.data.Uid);
            Vue.set(this.data, "id", id);
            console.log("保存成功，id为：" + id);
          }
        } catch (saveError) {
          this.$dialog.alert({
            title: '提示',
            message: '保存失败：' + (saveError.message || '未知错误'),
          });
          return;
        }

        // 执行审批/反审批
        const result = await billapi.generalBillApproval(
          tableName,
          this.data.id,
          !isApproved
        );

        if (result.Status === 200) {
          this.$dialog.alert({
            title: '提示',
            message: `${action}成功`,
          });

          // 触发父组件的刷新，并设置需要保持滚动位置
          this.$emit('operation-complete', { preserveScroll: true });
        } else {
          this.$dialog.alert({
            title: '提示',
            message: result.Message || `${action}失败`,
          });
        }
      } catch (error) {
        this.$dialog.alert({
          title: '提示',
          message: '操作失败：' + error.message,
        });
      }
    },
    // 处理删除
    handleDialogDelete() {
      // 如果已经审批，则不允许删除
      if (this.data?.Status > 0) {
        this.$toast('已审批状态下不能删除');
        return;
      }

      if (this.data.id == null) {
        this.$emit('operation-complete', { preserveScroll: true });
        return;
      }

      // 显示确认对话框
      this.$dialog.confirm({
        title: '确认删除',
        message: '确定要删除该单据吗？',
      }).then(async () => {
        // 用户点击确认，执行删除逻辑
        const tableName = this.data.TableName || 'AssemblyProcessCompletionDocument';
        if (!tableName) {
          this.$toast('无法确定表名，删除失败');
          return;
        }
        var pack = await billapi.generalBillDelete(tableName, this.data.id);
        if (pack.IsSuccess) {
          this.$toast('删除成功');
          // 通知父组件操作完成，并保持滚动位置
          this.$emit('operation-complete', { preserveScroll: true });
        }
        else {
          this.$toast(pack.ErrorMessage || '删除失败');
        }
      }).catch(() => {
        // 用户点击取消，不做任何操作
      });
    },
    handleQualificationClick() {
      if (this.data?.Status > 0) {
        return;
      }
      this.showQualificationSelector = true;
    },
    onQualificationSelected(option) {
      if (option && option.value) {
        this.qualificationValue = option.value;
      }
      this.showQualificationSelector = false;
    },
    // 处理员工扫码
    handleScanEmployee() {
      // 如果已审批，不允许修改
      if (this.data?.Status > 0) {
        return;
      }
      // 这里可以调用扫码API或组件，示例仅打开选择器
      this.showEmployeeSelector = true;
    },
    
    // 处理员工输入变化
    handleEmployeeInput(value) {
      // 如果已审批，不允许修改
      if (this.data?.Status > 0) {
        return;
      }
      this.employeeInputText = value;
    },
    
    // 处理员工输入回车事件
    async handleEmployeeInputEnter() {
      if (this.data?.Status > 0 || !this.employeeInputText) {
        return;
      }
      this.isHandlingEmployeeInput = true;
      await this.searchEmployeeByInput(this.employeeInputText);
      this.isHandlingEmployeeInput = false;
    },
    
    // 根据输入搜索员工
    async searchEmployeeByInput(inputText) {
      try {
        // 显示加载状态
        this.$toast.loading({
          message: '正在查询员工...',
          forbidClick: true,
          duration: 0
        });
        
        let query = new Query();
        query.TableName = "Employee";
        query.ShortName = "e";
        query.Select = 'e.id, e.Name, e.CodeForScan';
        query.AddWhere(`e.DeletedTag=0`);
        query.AddWhere(`(e.EmployeeState = '合同期' or e.EmployeeState = '试用期' or e.EmployeeState = '离职期')`);
        query.AddWhere(`(e.Name LIKE '%${inputText}%' OR e.CodeForScan LIKE '%${inputText}%')`);
        query.Order = 'e.Name ASC';
        
        const pack = await generalapi.getDataEx(query);
        
        // 关闭加载状态
        this.$toast.clear();
        
        if (pack.Status == 200) {
          const employees = pack.Data || [];
          
          if (employees.length === 0) {
            this.$toast({
              message: `未找到匹配 "${inputText}" 的员工`,
              position: 'bottom',
              duration: 2000
            });
            // 清空输入
            this.$set(this.data, 'ReceiveEmployeeName', '');
            this.$set(this.data, 'Employeeid', null);
          } 
          else if (employees.length === 1) {
            // 直接选择唯一匹配的员工
            const employee = employees[0];
            this.$set(this.data, 'Employeeid', employee.id);
            this.$set(this.data, 'ReceiveEmployeeName', employee.Name);
            this.$toast({
              message: `已选择员工: ${employee.Name}`,
              position: 'bottom',
              duration: 1000
            });
          } 
          else {
            // 多个匹配结果，显示选择器
            this.filteredEmployeeList = employees;
            this.showEmployeeSelector = true;
          }
        } else {
          console.error("查询员工失败:", pack.Message);
          this.$toast({
            message: `查询员工失败: ${pack.Message || '未知错误'}`,
            position: 'bottom',
            duration: 2000
          });
        }
      } catch (error) {
        // 关闭加载状态
        this.$toast.clear();
        
        console.error("查询员工出错:", error);
        this.$toast({
          message: `查询员工出错: ${error.message || '未知错误'}`,
          position: 'bottom',
          duration: 2000
        });
      }
    },
    // 选择输入框中的所有文本
    selectAllText(event) {
      // 如果已审批，不允许修改
      if (this.data?.Status > 0) {
        return;
      }
      
      if (event && event.target) {
        // 选择所有文本
        setTimeout(() => {
          event.target.select();
        }, 10);
      }
    },
    // 处理选择器值变化
    handlePickerChange(picker, values) {
      // 暂时禁用搜索功能
      this.searchDisabled = true;
      
      // 获取当前选中的员工并更新搜索框文本
      if (values && values.Name) {
        this.employeeSearchText = values.Name;
      }
      
      // 使用setTimeout等待当前事件循环结束后恢复搜索功能
      setTimeout(() => {
        // 恢复搜索功能，但不触发搜索
        this.searchDisabled = false;
      }, 100);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/style/custom-viewport.scss';

.container {
  background-color: rgb(245, 247, 250);
  padding-bottom: vh(2.6);
  /* 20px -> 2.6vh (20/768*100) */
}

/* 两列布局 */
.field-container {
  display: flex;
  flex-wrap: wrap;
  // gap: 12px;
}

/* 让每个输入框占 50% 宽度 */
.van-field {
  flex: 1 1 calc(50% - vw(0.6));
  /* 6px -> 0.6vw (6/1024*100) */
}

.van-cell {
  padding: vh(0.4) vw(1.56);
  /* 3px 16px -> 0.4vh 1.56vw (3/768*100, 16/1024*100) */
  background-color: transparent;
}

::v-deep .van-field__body {
  border: vh(0.13) solid #000;
  /* 1px -> 0.13vh (1/768*100) */
  border-radius: vh(0.52);
  /* 4px -> 0.52vh (4/768*100) */
  height: vh(3.5);
}

/* 对话框底部样式 */
.dialog-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: vh(1) 0;
  /* 调整内边距 */
  border-top: vh(0.13) solid #ebedf0;
  margin-top: vh(1);
  /* 适当增加顶部边距 */
  position: relative;

  /* 审批按钮样式 */
  .approve-button {
    min-width: vw(9);
    height: vh(3.8);
    /* 增加按钮高度 */
    line-height: vh(3.8);
    /* 确保文本垂直居中 */
    border-radius: vh(1.8);
    /* 增加圆角 */
    font-size: vh(1.5);
    /* 增加字体 */
    font-weight: 500;
    transition: all 0.3s ease;
    border: none;
    box-shadow: 0 vh(0.2) vh(0.5) rgba(0, 0, 0, 0.1);
    /* 调整阴影 */
    padding: 0 vh(1.5);
    /* 增加左右内边距 */

    /* 非反审批状态样式 */
    &:not(.reverse-approve) {
      background: linear-gradient(135deg, #4CAF50, #45a049);
      color: white;

      /* 悬停状态样式 */
      &:hover {
        background: linear-gradient(135deg, #45a049, #3d8b40);
        transform: translateY(vh(-0.13));
        box-shadow: 0 vh(0.26) vh(0.78) rgba(0, 0, 0, 0.15);
      }
    }

    /* 反审批状态样式 */
    &.reverse-approve {
      background: linear-gradient(135deg, #FF9800, #F57C00);
      color: white;

      /* 悬停状态样式 */
      &:hover {
        background: linear-gradient(135deg, #F57C00, #EF6C00);
        transform: translateY(vh(-0.13));
        box-shadow: 0 vh(0.26) vh(0.78) rgba(0, 0, 0, 0.15);
      }
    }
  }

  /* 删除按钮样式 */
  .delete-button {
    position: absolute;
    right: vw(1.95);
    width: vh(3.8);
    /* 增加宽度 */
    height: vh(3.8);
    /* 增加高度 */
    border-radius: 50%;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #ff4d4d, #e33333);
    color: white;
    border: none;
    box-shadow: 0 vh(0.2) vh(0.5) rgba(0, 0, 0, 0.1);
    /* 调整阴影 */
    transition: all 0.3s ease;

    /* 图标样式 */
    .van-icon {
      font-size: vh(1.8);
      /* 增加图标 */
    }
  }

  /* 合格性下拉框样式 */
  .qualification-wrapper {
    position: absolute;
    left: vw(1.95);
    width: vw(10);
  }

  .qualification-dropdown {
    width: 100%;

    ::v-deep .el-input__inner {
      border-radius: vh(1.8);
      /* 增加圆角 */
      height: vh(3.8);
      /* 增加高度 */
      line-height: vh(3.8);
      /* 确保文本垂直居中 */
      border: vh(0.13) solid #ebedf0;
      background: #f7f8fa;
      color: #323233;
      transition: all 0.3s ease;
      padding: 0 vh(1.2);
      /* 调整左右内边距 */
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: vh(1.5);
      /* 增加字体大小 */
    }

    ::v-deep .el-input__inner:hover {
      background: #f2f3f5;
      border-color: #dcdee0;
    }

    ::v-deep .el-input__suffix {
      right: vw(0.6);
      /* 调整右侧图标间距 */
    }

    ::v-deep .el-select__caret {
      color: #969799;
      font-size: vh(1.5);
      /* 增加图标大小 */
    }
  }

  /* 添加必填标志 */
  .qualification-wrapper::before {
    content: "*";
    color: #f56c6c;
    margin-right: 4px;
    position: absolute;
    left: -10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: vh(1.8);
  }
}

/* 禁用状态的删除按钮样式 */
::v-deep .delete-button[disabled] {
  background: linear-gradient(135deg, #cccccc, #999999);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  opacity: 0.6;
}

/* 禁用状态的下拉框样式 */
::v-deep .el-select.is-disabled .el-input__inner {
  background-color: #f5f5f5;
  border-color: #e4e7ed;
  color: #999;
  cursor: not-allowed;
}

/* 员工选择器样式 */
.employee-select-wrapper {
  flex: 1 1 calc(50% - vw(0.6));
  /* 6px -> 0.6vw (6/1024*100) */

  ::v-deep .van-field__body {
    border: vh(0.13) solid #000;
    /* 1px -> 0.13vh (1/768*100) */
    border-radius: vh(0.52);
    /* 4px -> 0.52vh (4/768*100) */
  }
}

/* 员工选择器弹出层样式 */
::v-deep .van-popup {
  max-height: 60%;
  overflow-y: auto;
}

::v-deep .van-picker {
  width: 100%;
}

::v-deep .van-picker-column {
  font-size: vh(2.08);
  /* 16px -> 2.08vh (16/768*100) */
}

::v-deep .van-picker__toolbar {
  border-bottom: vh(0.13) solid #ebedf0;
  /* 1px -> 0.13vh (1/768*100) */
}

/* 员工搜索框样式 */
.employee-search {
  padding: vh(1.04) vw(1.56);
  /* 8px 16px -> 1.04vh 1.56vw (8/768*100, 16/1024*100) */
  border-bottom: vh(0.13) solid #ebedf0;
  /* 1px -> 0.13vh (1/768*100) */
}

/* 三列布局行 */
.three-column-row {
  display: flex;
  width: 100%;
  margin-bottom: vh(0.5);

  .van-field {
    flex: 1 1 31%;
    margin-right: 1%;
  }

  .qualification-wrapper {
    flex: 1 1 31%;
    position: relative;
    margin-right: 1%;

    .van-field {
      width: 100%;
      margin-right: 0;

      ::v-deep .van-field__label {
        width: vw(6);
        flex: none;
      }

      ::v-deep .van-field__value {
        flex: 1;
      }
    }
    
    ::v-deep .qualification-dropdown {
      width: 100%;
    }
    
    ::v-deep .el-input__inner {
      border: none;
      background: transparent;
      padding: 0;
      height: vh(3.5);
    }
  }
}
</style>

<style lang="scss">
@import '@/assets/style/custom-viewport.scss';

/* 全局样式 */
.high-priority-dropdown {
  z-index: 9999 !important;

  .el-select-dropdown__item {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 vw(2);
  }

  /* 窄屏适配 */
  @media screen and (max-width: 480px) {
    min-width: vw(20) !important;
    width: auto !important;

    .el-select-dropdown__item {
      font-size: vh(1.8);
    }
  }
}
</style>