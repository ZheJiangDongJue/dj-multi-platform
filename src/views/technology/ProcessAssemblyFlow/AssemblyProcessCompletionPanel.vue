<template>
  <div>
    <div class="container">
      <van-field type="textarea" label="规格型号" v-model="data.MaterialSpecType" rows="2" autosize autofocus maxlength="50"
        show-word-limit class="message" readonly v-long-press-tooltip="data.MaterialSpecType" />
      <van-field type="textarea" label="规格型号说明" v-model="data.MaterialSpecTypeExplain" rows="2" autosize autofocus
        maxlength="50" show-word-limit class="message" readonly v-long-press-tooltip="data.MaterialSpecTypeExplain" />

      <!-- 两列布局 -->
      <div class="field-container">
        <van-field v-model="data.InnerKey" label="制令单号" readonly v-long-press-tooltip="data.InnerKey" />
        <van-field v-model="data.ApprovalTime" label="接收日期" readonly clickable required right-icon="calendar-o"
          @click="showCalendar = true" v-long-press-tooltip="data.ApprovalTime" />
        <van-popup v-model="showCalendar" get-container="body" position="bottom" :style="{ height: 'auto' }">
          <van-calendar v-model="showCalendar" :show-confirm="false" @confirm="onSelectDate" />
        </van-popup>
        <van-field v-model="data.Code" label="单据编号" readonly v-long-press-tooltip="data.Code" />
        <van-field v-model="data.ClientName" label="客户名称" readonly v-long-press-tooltip="data.ClientName" />
        <van-field v-model="data.MaterialTuHao" label="图号" readonly v-long-press-tooltip="data.MaterialTuHao" />

        <van-field v-model="data.ReceiveEmployeeName" label="计件人员" required clearable
          v-long-press-tooltip="data.ReceiveEmployeeName" />
        <van-field v-model="data.MaterialCode" label="物料编码" readonly v-long-press-tooltip="data.MaterialCode" />
        <van-field v-model="data.PassBQty" label="接收数量" v-long-press-tooltip="data.PassBQty" />
      </div>

      <!-- 新增的对话框底部组件 -->
      <div class="dialog-footer">
        <div class="qualification-wrapper">
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
      qualificationValue: 1, // 合格性状态值: 1=合格, 2=让步接收, 4=不合格
      qualificationOptions: [
        { text: '未选择', value: 0 },
        { text: '合格', value: 1 },
        { text: '让步接收', value: 2 },
        { text: '不合格', value: 4 }
      ],
    };
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

          // 设置合格性值
          if (this.data && typeof this.data.CheckResult !== 'undefined') {
            this.qualificationValue = this.data.CheckResult;
          } else {
            // 默认设置为合格
            this.qualificationValue = 1;
          }
        }
      }
    },
    'data.ReceiveEmployeeName': {
      async handler(newVal,) {
        if (newVal == null) return;
        if (newVal == '') return;
        let query = new Query();
        query.TableName = "Employee";
        query.ShortName = "e";
        query.Select = 'e.id';
        query.AddWhere(`e.DeletedTag=0`);
        query.AddWhere(`e.Name='${newVal}' OR e.CodeForScan='${newVal}'`);
        let pack = await generalapi.getDataEx(query);
        console.log(pack);
        if (pack.Status == 200) {
          /**@type {any[]} */
          var employees = pack.Data;
          if (employees.length > 0) {
            let employee = employees[0];
            this.data.Employeeid = employee.id;
          }
          else {
            // this.$dialog.alert({
            //     title: '提示',
            //     message: `该单据的物料无法找到`,
            // })
            this.data.Employeeid = 0;
          }
        }
        else {
          this.$dialog.alert({
            title: '提示',
            message: `该计件人员无法找到`,
          })
        }
      },
    },
  },
  methods: {
    onSelectDate(date) {
      this.showCalendar = false;
      if (date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        this.$set(this.data, 'ApprovalTime', `${year}-${month}-${day}`);
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
      if (!this.data.ReceiveEmployeeName || this.data.ReceiveEmployeeName.trim() === '') {
        this.$dialog.alert({
          title: '提示',
          message: '请填写计件人员',
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

          // 触发父组件的刷新
          this.$emit('operation-complete');
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
        this.$emit('operation-complete');
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
          // 通知父组件操作完成
          this.$emit('operation-complete');
        }
        else {
          this.$toast(pack.ErrorMessage || '删除失败');
        }
      }).catch(() => {
        // 用户点击取消，不做任何操作
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  background-color: rgb(245, 247, 250);
  padding-bottom: 20px;
}

/* 两列布局 */
.field-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

/* 让每个输入框占 50% 宽度 */
.van-field {
  flex: 1 1 calc(50% - 6px);
}

.van-cell {
  background-color: transparent;
}

::v-deep .van-field__body {
  border: 1px solid #000;
  border-radius: 4px;
}

/* 对话框底部样式 */
.dialog-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 0;
  border-top: 1px solid #ebedf0;
  margin-top: 20px;
  position: relative;

  /* 审批按钮样式 */
  .approve-button {
    min-width: 120px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    /* 非反审批状态样式 */
    &:not(.reverse-approve) {
      background: linear-gradient(135deg, #4CAF50, #45a049);
      color: white;

      /* 悬停状态样式 */
      &:hover {
        background: linear-gradient(135deg, #45a049, #3d8b40);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    }

    /* 反审批状态样式 */
    &.reverse-approve {
      background: linear-gradient(135deg, #FF9800, #F57C00);
      color: white;

      /* 悬停状态样式 */
      &:hover {
        background: linear-gradient(135deg, #F57C00, #EF6C00);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    }
  }

  /* 删除按钮样式 */
  .delete-button {
    position: absolute;
    right: 20px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #ff4d4d, #e33333);
    color: white;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;

    /* 悬停状态样式 */
    &:hover {
      background: linear-gradient(135deg, #e33333, #cc0000);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    /* 图标样式 */
    .van-icon {
      font-size: 20px;
    }
  }

  /* 合格性下拉框样式 */
  .qualification-wrapper {
    position: absolute;
    left: 20px;
    width: 100px;
  }

  .qualification-dropdown {
    ::v-deep .el-input__inner {
      border-radius: 18px;
      height: 36px;
      border: 1px solid #ebedf0;
      background: #f7f8fa;
      color: #323233;
      transition: all 0.3s ease;
    }

    ::v-deep .el-input__inner:hover {
      background: #f2f3f5;
      border-color: #dcdee0;
    }

    ::v-deep .el-input__suffix {
      right: 8px;
    }

    ::v-deep .el-select__caret {
      color: #969799;
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
</style>