<template>
  <div>
    <div class="container">
      <!-- 两列布局 -->
      <div class="field-container">
        <van-field v-model="data.MaterialCode" label="物料编码" readonly v-click-tooltip="data.MaterialCode"
          class="material-code-field" />
        <van-field v-model="data.Code" label="单据编号" readonly v-click-tooltip="data.Code" class="document-code-field" />
      </div>

      <!-- 将接收数量、合格状态、计件人员作为一个3列布局 -->
      <div class="field-container three-columns">
        <van-field v-model="data.PassBQty" label="接收数量" required clearable v-click-tooltip="data.PassBQty"
          :disabled="data?.Status > 0" class="qty-field" />

        <!-- 将合格状态从底部移到这里 -->
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

        <!-- 将计件人员从下面移到这里 -->
        <div class="employee-select-wrapper">
          <van-field v-model="data.ReceiveEmployeeName" label="计件人员" required :disabled="data?.Status > 0"
            right-icon="arrow-down" @click-right-icon="handleScanEmployee" @input="handleEmployeeInput"
            @keyup.enter.native="handleEmployeeInputEnter" @click="handleEmployeeFieldClick"
            @focus="selectAllText($event)" v-click-tooltip="data.ReceiveEmployeeName"
            v-close-keyboard />
          <van-popup v-model="showEmployeeSelector" position="bottom" round get-container="body">
            <div class="employee-search">
              <van-search v-model="employeeSearchText" placeholder="请输入或扫描员工条码" @input="filterEmployees"
                ref="employeeSearch" :disabled="searchDisabled" v-focus-no-keyboard="showEmployeeSelector" @focus="selectAllText($event)" @click="selectAllInSearch" />
            </div>
            <van-picker show-toolbar :columns="filteredEmployeeList" @confirm="onEmployeeSelected"
              @cancel="showEmployeeSelector = false" value-key="Name" @change="handlePickerChange" />
          </van-popup>
        </div>
      </div>

      <van-field v-model="data.MaterialSpecType" label="规格型号" readonly v-click-tooltip="data.MaterialSpecType" />
      <van-field v-model="data.MaterialSpecTypeExplain" label="规格型号说明" readonly
        v-click-tooltip="data.MaterialSpecTypeExplain" />

      <div class="field-container">
        <van-field v-model="data.InnerKey" label="制令单号" readonly v-click-tooltip="data.InnerKey" />
        <van-field v-model="formattedApprovalTime" label="接收日期" readonly clickable required right-icon="calendar-o"
          @click="handleDateFieldClick" v-click-tooltip="formattedApprovalTime" :disabled="data?.Status > 0" />
        <van-calendar v-model="showCalendar" get-container="body" :show-confirm="false" @confirm="onSelectDate" />
        <van-field v-model="data.ClientName" label="客户名称" readonly v-click-tooltip="data.ClientName" />
        <van-field v-model="data.MaterialTuHao" label="图号" readonly v-click-tooltip="data.MaterialTuHao" />
      </div>

      <!-- 新增的对话框底部组件 -->
      <div class="dialog-footer">
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
import { initScanListener, removeScanListener, onScanResult } from '@/utils/scan-code-handler';

export default {
  name: "AssemblyProcessReceivePanel",
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
      showEmployeeSelector: false,
      employeeList: [],
      qualificationValue: 1, // 合格性状态值: 1=合格, 2=让步接收, 4=不合格
      qualificationOptions: [
        { text: '未选择', value: 0 },
        { text: '合格', value: 1 },
        { text: '让步接收', value: 2 },
        { text: '不合格', value: 4 }
      ],
      employeeSearchText: '', // 用于员工搜索
      filteredEmployeeList: [], // 过滤后的员工列表
      employeeInputText: '', // 用于员工输入框
      isHandlingEmployeeInput: false, // 是否正在处理员工输入
      searchDisabled: false, // 是否禁用搜索功能
      unsubscribe: null, // 扫码取消订阅函数
    };
  },
  mounted() {
    // 为van-search添加自动选中文本的功能
    this.setupSearchBoxSelectAll();
    
    // 初始化扫码监听
    initScanListener();

    // 注册扫码结果回调
    this.unsubscribe = onScanResult(this.handleScanResult);
  },
  beforeDestroy() {
    // 取消扫码结果回调
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    // 移除扫码监听
    removeScanListener();
  },
  computed: {
    // 计算属性，返回格式化的接收日期
    formattedApprovalTime() {
      return formatDate(this.data?.ApprovalTime || '');
    }
  },
  watch: {
    // isDisplay: {
    //   async handler(newVal) {
    //     if (newVal) {
    //     }
    //   },
    // },
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
    showEmployeeSelector(newVal) {
      if (newVal) {
        setTimeout(() => {
          const searchInput = document.querySelector('.van-popup--bottom .employee-search .van-field__control');
          if (searchInput) {
            searchInput.focus();
            // 增加选中所有文本的功能
            setTimeout(() => {
              if (searchInput.select) {
                searchInput.select();
              }
            }, 50);
          }
        }, 300);
      }
    }
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
    // 处理员工字段点击
    handleEmployeeFieldClick() {
      // 如果已审批，不允许修改
      if (this.data?.Status > 0) {
        return;
      }
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
    // 处理日期字段点击
    handleDateFieldClick() {
      // 如果已审批，不允许修改
      if (this.data?.Status > 0) {
        return;
      }
      this.showCalendar = true;
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
          // 检查合格性是否已选择（审批时必选）
          if (this.qualificationValue === 0) {
            this.$dialog.alert({
              title: '提示',
              message: '请选择左下角是否合格',
            });
            return;
          }

          // 检查必填项
          if (!this.validateRequiredFields()) {
            return;
          }

          // 更新当前对话框数据中的合格性值
          this.data.CheckResult = this.qualificationValue;
        }

        // 获取表名
        const tableName = this.data.TableName || 'AssemblyProcessReceiveDocument';
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

          if (isApproved) {
            // 反审批成功后，只更新当前状态，不关闭对话框
            this.$set(this.data, 'Status', 0);
          } else {
            // 审批成功后关闭对话框
            this.$emit('operation-complete', { preserveScroll: true });
          }
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
        const tableName = this.data.TableName || 'AssemblyProcessReceiveDocument';
        if (!tableName) {
          this.$toast('无法确定表名，删除失败');
          return;
        }
        if(this.data.id == 0){
          this.$emit('operation-complete', { preserveScroll: true });
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
    // 选择输入框中的所有文本
    selectAllText(event) {
      // 如果已审批，不允许修改
      if (this.data?.Status > 0) {
        return;
      }

      if (event && event.target) {
        // 选择所有文本
        setTimeout(() => {
          // 处理van-search组件
          if (event.target.classList.contains('van-search__field') || 
              event.target.classList.contains('van-search')) {
            const inputEl = event.target.querySelector('input') || 
                            event.target.closest('.van-search').querySelector('input');
            if (inputEl) {
              inputEl.select();
            }
          } else {
            // 处理普通输入框
            event.target.select();
          }
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
    // 阻止键盘弹出 - 此方法可以移除，已被v-focus-no-keyboard指令替代
    preventKeyboardPopup() {
      // 已被v-focus-no-keyboard指令替代，保留此方法避免其他地方的调用报错
      console.log('preventKeyboardPopup已被v-focus-no-keyboard指令替代');
    },
    // 为van-search组件设置自动选中文本的功能
    setupSearchBoxSelectAll() {
      this.$nextTick(() => {
        const searchBox = this.$refs.employeeSearch;
        if (searchBox && searchBox.$el) {
          const inputEl = searchBox.$el.querySelector('input');
          if (inputEl) {
            inputEl.addEventListener('focus', function() {
              setTimeout(() => {
                this.select();
              }, 10);
            });
          }
        }
      });
    },
    // 专门处理van-search点击时的全选
    selectAllInSearch() {
      this.$nextTick(() => {
        const inputEl = this.$refs.employeeSearch?.$el.querySelector('input');
        if (inputEl) {
          inputEl.select();
        }
      });
    },
    // 处理扫码结果
    handleScanResult(barcode) {
      console.log('收到扫码结果:', barcode);

      // 检查是否符合ZY-开头的格式
      const ZY_CODE_REGEX = /^ZY-.*$/;
      if (ZY_CODE_REGEX.test(barcode)) {
        this.searchEmployeeByInput(barcode);
      } else {
        // 对于不支持的条码格式，提供友好提示
        this.$toast({
          message: `未识别的条码格式: ${barcode}`,
          position: 'bottom',
          duration: 2000
        });
        console.log('不支持的条码格式:', barcode);
      }
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
  /* 添加底部边距 */
}

/* 两列布局 */
.field-container {
  display: flex;
  flex-wrap: wrap;
  // gap: 12px;
  background-color: transparent;
}

/* 三列布局样式 */
.three-columns {

  .van-field,
  .qualification-wrapper,
  .employee-select-wrapper {
    flex: 1.2 1 calc(35% - vw(0.6));
  }

  .qty-field {
    flex: 0.8 1 calc(30% - vw(0.6));
  }

  .qualification-wrapper {
    ::v-deep .van-field__body {
      border: vh(0.13) solid #000;
      border-radius: vh(0.52);
      height: vh(3.5);
    }

    ::v-deep .qualification-dropdown {
      width: 100%;
    }

    ::v-deep .el-input__inner {
      border: none;
      background: transparent;
      padding: 0;
      height: vh(3.5);
      font-size: vh(1.8);
    }

    ::v-deep .van-field__label {
      width: 2em;
      flex: 0 0 2em;
    }
  }
}

/* 让每个输入框占 50% 宽度 */
.van-field {
  flex: 1 1 calc(50% - vw(0.6));
  /* 减去 gap 的一半，保证对齐 */
  // border: 1px solid #e2e2e2;
  // background: #f6f6f6;
}

/* 调整物料编码和单据编号的宽度 */
.material-code-field {
  flex: 0.7 1 calc(40% - vw(0.6));
}

.document-code-field {
  flex: 1.3 1 calc(60% - vw(0.6));
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
}

::v-deep .van-field__label {
  font-size: vh(1.8);
  // width: 25%;
  // margin-right: vw(0.5);
}

::v-deep .van-field__control {
  font-size: vh(1.8);
}

::v-deep .van-field__right-icon {
  font-size: vh(1.8);
  line-height: vh(3.5);
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

/* 添加媒体查询，针对窄屏设备优化下拉框显示 */
@media screen and (max-width: 480px) {
  .qualification-wrapper {
    min-width: vw(18);
    width: auto;
  }

  .dialog-footer {
    .delete-button {
      right: vw(1);
      width: vh(3.5);
      /* 调整宽度 */
      height: vh(3.5);
      /* 调整高度 */
    }

    .qualification-wrapper {
      left: vw(1);
    }

    .approve-button {
      min-width: vw(8);
      font-size: vh(1.4);
      height: vh(3.5);
      /* 调整高度 */
      line-height: vh(3.5);
      /* 确保文本垂直居中 */
    }
  }
}

/* 员工选择器样式 */
.employee-select-wrapper {
  flex: 1 1 calc(50% - vw(0.6));
  /* 减去 gap 的一半，保证对齐 */

  ::v-deep .van-field__body {
    border: vh(0.13) solid #000;
    /* 1px -> 0.13vh (1/768*100) */
    border-radius: vh(0.52);
    /* 4px -> 0.52vh (4/768*100) */
  }

  ::v-deep .van-field__right-icon {
    font-size: vh(1.8);
  }

  ::v-deep .van-field__control {
    font-size: vh(1.8);
  }
}

/* 员工选择器弹出层样式 */
::v-deep .van-popup {
  max-height: 60%;
  overflow-y: auto;
  border-radius: vh(1.5) vh(1.5) 0 0;
}

::v-deep .van-picker {
  width: 100%;
}

::v-deep .van-picker-column {
  font-size: vh(2.08);
  /* 16px -> 2.08vh (16/768*100) */
}

::v-deep .van-picker-column__item {
  height: vh(4.5);
  line-height: vh(4.5);
  padding: 0 vw(1.5);
}

::v-deep .van-picker-column__item--selected {
  font-size: vh(2.2);
  font-weight: 500;
}

::v-deep .van-picker__toolbar {
  height: vh(5.5);
  line-height: vh(5.5);
  border-bottom: vh(0.13) solid #ebedf0;
  /* 1px -> 0.13vh (1/768*100) */
}

/* 员工搜索框样式 */
.employee-search {
  padding: vh(1.04) vw(1.56);
  /* 8px 16px -> 1.04vh 1.56vw (8/768*100, 16/1024*100) */
  border-bottom: vh(0.13) solid #ebedf0;
  /* 1px -> 0.13vh (1/768*100) */

  ::v-deep .van-search {
    padding: vh(0.8) vw(1.2);
  }

  ::v-deep .van-search__content {
    border-radius: vh(0.52);
  }

  ::v-deep .van-field__control {
    font-size: vh(1.8);
  }
}
</style>

<style lang="scss">
/* 全局样式 */
.high-priority-dropdown {
  z-index: 9999 !important;

  .el-select-dropdown__item {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 vw(2);
    font-size: vh(1.8);
    height: vh(3.5);
    line-height: vh(3.5);
  }

  .el-select-dropdown__list {
    padding: vh(0.6) 0;
  }

  .popper__arrow {
    border-width: vh(0.6);
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

/* 下拉框文字样式 */
.el-select .el-input__inner {
  font-size: vh(1.8) !important;
  height: vh(3.5) !important;
  line-height: vh(3.5) !important;
}

/* 下拉图标 */
.el-select .el-input__icon {
  line-height: vh(3.5) !important;
  font-size: vh(1.8) !important;
}

/* 修复下拉箭头展开收起动画中心点问题 */
.el-select__caret {
  transform-origin: center center !important;
  transition: transform 0.3s !important;
}

/* 统一字体大小 */
.van-field__label,
.van-field__control {
  font-size: vh(1.8);
}

/* 员工选择器弹出层按钮样式 */
.van-picker__confirm,
.van-picker__cancel {
  font-size: vh(1.8) !important;
  padding: vh(1) vw(1.5) !important;
}

/* 员工搜索框占位文本 */
.van-search__field .van-field__control::placeholder {
  font-size: vh(1.8);
}

/* 修复移动设备上picker框架位置偏移问题 */
.van-hairline-unset--top-bottom.van-picker__frame {
  position: absolute;
  top: 50%;
  right: 0;
  left: 0;
  z-index: 2;
  transform: translateY(-50%);
  pointer-events: none;
  width: 100%;
}

/* 调整picker在移动设备上的适配 */
@media screen and (max-width: 480px) {
  .van-picker {
    height: auto;
    max-height: 40vh;
  }

  .van-picker-column {
    height: auto;
  }

  .van-picker__columns {
    height: auto !important;
    min-height: 20vh;
  }
}
</style>
