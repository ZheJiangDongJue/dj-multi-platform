<template>
  <div class="batch-complete">
    <!-- 页面标题 -->
    <div class="batch-complete__title">
      <div class="back-button" @click="goBack">
        <van-icon name="arrow-left" />
        <span>返回</span>
      </div>
      <h2>批量完工组装流程卡</h2>
    </div>

    <!-- 头部扫码输入区域 - 修改为左右两部分 -->
    <div class="batch-complete__scan-container">
      <div class="batch-complete__scan-section">
        <div class="batch-complete__scan-title">制令单号扫码区</div>
        <div class="batch-complete__scan-area">
          <input ref="flowScanInput" v-model="flowScanCode" class="batch-complete__scan-input" placeholder="在这扫描制令单号"
            @keyup.enter="handleFlowScanCodeConfirm" autofocus />
        </div>
      </div>
      <div class="batch-complete__scan-section">
        <div class="batch-complete__scan-title">员工扫码区</div>
        <div class="batch-complete__scan-area">
          <input ref="employeeScanInput" v-model="employeeScanCode" class="batch-complete__scan-input"
            placeholder="请在这里扫描员工编码" @keyup.enter="handleEmployeeScanCodeConfirm" />
        </div>
      </div>
    </div>

    <!-- 操作按钮区域 -->
    <div class="batch-complete__operation">
      <el-button type="primary" class="operation-button" @click="selectAll">全选</el-button>
      <el-button type="primary" class="operation-button" @click="invertSelection">反选</el-button>
      <el-button type="danger" class="operation-button" @click="clearAll">全清</el-button>
    </div>

    <!-- 卡片列表区域 -->
    <div class="batch-complete__card-list">
      <div v-if="itemList.length === 0" class="batch-complete__empty-tip">暂无数据，请扫码添加</div>
      <div v-else class="batch-complete__card-grid">
        <div v-for="(item, index) in itemList" :key="index" class="card" :class="{ 'card--selected': item.selected }"
          @contextmenu.prevent>
          <div class="card__header" @click.stop="toggleSelection(index)" title="点击此处切换选择状态">
            <div class="card__title">{{ item.innerKey }}</div>
            <div class="card__checkbox">
              <van-icon :name="item.selected ? 'success' : 'circle'"
                :class="['card__selection-icon', { 'card__selection-icon--selected': item.selected }]" />
            </div>
          </div>
          <!-- 卡片内容区 -->
          <div class="card__content">
            <!-- 添加只读信息显示 -->
            <div class="card__info-row">
              <label class="card__label">工序:</label>
              <div class="card__readonly-text">{{ item.typeofWorkName }}</div>
            </div>
            <div class="card__info-row">
              <label class="card__label">内容:</label>
              <div class="card__readonly-text">{{ item.content }}</div>
            </div>
            <div class="card__info-row">
              <label class="card__label">要求:</label>
              <div class="card__readonly-text">{{ item.workRequirements }}</div>
            </div>
            <div class="card__input-row">
              <label class="card__label"><span class="required-field">*</span>计件人员:</label>
              <div class="employee-select-wrapper">
                <div class="card__employee-field" @click="handleEmployeeFieldClick(item)">
                  <span>{{ item.employeeName }}</span>
                  <van-icon name="arrow-down" class="employee-field-icon" />
                </div>
              </div>
            </div>
            <div class="card__input-row">
              <label class="card__label"><span class="required-field">*</span>完工数量:</label>
              <input type="number" v-model.number="item.qty" min="1" :max="item.data?.CanCompleteQty || 999999"
                class="card__input" />
            </div>
          </div>
          <!-- 卡片底部，显示额外信息 -->
          <div v-if="item.data" class="card__footer">
            <!-- <div class="card__info">
              <span class="card__info-label">可完工数量:</span>
              <span class="card__info-value">{{ item.data.CanCompleteQty || 0 }}</span>
            </div> -->
            <!-- 添加合格性下拉框 -->
            <div class="card__qualification">
              <el-select v-model="item.checkResult" size="small" class="qualification-dropdown" popper-append-to-body
                popper-class="high-priority-dropdown" :popper-options="{ gpuAcceleration: false }"
                @visible-change="handleSelectVisibleChange">
                <el-option v-for="option in qualificationOptions" :key="option.value" :label="option.text"
                  :value="option.value"></el-option>
              </el-select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作按钮区域 -->
    <div class="batch-complete__submit">
      <div class="batch-complete__button-wrapper">
        <el-button type="danger" @click="handleDelete" :disabled="selectedItems.length === 0">
          删除 ({{ selectedItems.length }})
        </el-button>
        <el-button type="primary" @click="handleSubmit" :disabled="selectedItems.length === 0">
          提交 ({{ selectedItems.length }})
        </el-button>
      </div>
    </div>

    <!-- 员工选择弹出层 -->
    <van-popup v-model="showEmployeeSelector" position="bottom" round :overlay-style="{ position: 'fixed' }" :style="{ position: 'fixed' }" @closed="onPopupClosed">
      <div class="employee-search">
        <van-search v-model="employeeSearchText" placeholder="搜索员工姓名" @input="filterEmployees" />
      </div>
      <van-picker show-toolbar :columns="filteredEmployeeList" @confirm="onEmployeeSelected"
        @cancel="cancelEmployeeSelection" value-key="Name" />
    </van-popup>
  </div>
</template>

<script>
import generalApi from '@/api/general';
import craftApi from '@/api/craft';
import { Query } from '@/core/query';

export default {
  name: 'BatchCompleteProcessAssemblyFlow',
  components: {
  },
  data() {
    return {
      flowScanCode: '', // 流程卡扫码输入框的值
      employeeScanCode: '', // 员工扫码输入框的值
      itemList: [], // 存储所有扫码添加的项目
      flowScanQueue: [], // 流程卡扫码队列
      employeeScanQueue: [], // 员工扫码队列
      isProcessingFlow: false, // 是否正在处理流程卡队列
      isProcessingEmployee: false, // 是否正在处理员工队列
      flowProcessingTimer: null, // 处理流程卡队列的定时器引用
      employeeProcessingTimer: null, // 处理员工队列的定时器引用
      // 新增合格性选项
      qualificationOptions: [
        { text: '未选择', value: 0 },
        { text: '合格', value: 1 },
        { text: '让步接收', value: 2 },
        { text: '不合格', value: 4 }
      ],
      // 员工选择相关数据
      showEmployeeSelector: false,
      currentSelectingItem: null, // 当前正在选择员工的项目
      employeeList: [], // 所有员工列表
      employeeSearchText: '', // 员工搜索文本
      filteredEmployeeList: [], // 过滤后的员工列表
    };
  },
  computed: {
    // 计算已选中的项目列表
    selectedItems() {
      return this.itemList.filter(item => item.selected);
    }
  },
  methods: {
    /**
     * 处理流程卡扫码确认事件
     * 当用户在流程卡输入框中按下回车键时触发
     */
    handleFlowScanCodeConfirm() {
      // 验证输入是否为空
      if (!this.flowScanCode.trim()) return;

      // 将扫码数据加入队列等待处理
      this.flowScanQueue.push(this.flowScanCode);
      // 立即清空输入框并聚焦，使用户可以继续扫码
      this.flowScanCode = '';
      this.$refs.flowScanInput.focus();

      // 开始处理队列
      this.startProcessingFlowQueue();
    },

    /**
     * 处理员工扫码确认事件
     * 当用户在员工输入框中按下回车键时触发
     */
    handleEmployeeScanCodeConfirm() {
      // 验证输入是否为空
      if (!this.employeeScanCode.trim()) return;

      // 将扫码数据加入队列等待处理
      this.employeeScanQueue.push(this.employeeScanCode);
      // 立即清空输入框并聚焦，使用户可以继续扫码
      this.employeeScanCode = '';
      this.$refs.employeeScanInput.focus();

      // 开始处理队列
      this.startProcessingEmployeeQueue();
    },

    /**
     * 开始处理流程卡扫码队列
     * 如果队列已在处理中，则不重复启动处理过程
     */
    startProcessingFlowQueue() {
      if (this.isProcessingFlow) return; // 防止重复处理
      this.isProcessingFlow = true;
      this.processFlowQueue();
    },

    /**
     * 开始处理员工扫码队列
     * 如果队列已在处理中，则不重复启动处理过程
     */
    startProcessingEmployeeQueue() {
      if (this.isProcessingEmployee) return; // 防止重复处理
      this.isProcessingEmployee = true;
      this.processEmployeeQueue();
    },

    /**
     * 处理流程卡扫码队列中的所有数据
     * 异步处理以避免阻塞UI
     */
    async processFlowQueue() {
      // 循环处理队列中的每个扫码数据
      while (this.flowScanQueue.length > 0) {
        const code = this.flowScanQueue.shift(); // 取出队列中的第一个项目
        await this.checkAndAddFlowRecord(code); // 异步检查并添加流程记录
      }

      // 队列处理完成后，延迟一段时间再重置状态
      if (this.flowProcessingTimer) {
        clearTimeout(this.flowProcessingTimer); // 清除之前的定时器
      }

      // 设置新的定时器
      this.flowProcessingTimer = setTimeout(() => {
        this.isProcessingFlow = false; // 重置处理状态
      }, 500); // 500ms的延迟，可以根据实际需求调整
    },

    /**
     * 处理员工扫码队列中的所有数据
     * 异步处理以避免阻塞UI
     */
    async processEmployeeQueue() {
      // 循环处理队列中的每个扫码数据
      while (this.employeeScanQueue.length > 0) {
        const code = this.employeeScanQueue.shift(); // 取出队列中的第一个项目
        await this.checkAndAddEmployeeRecord(code); // 异步检查并添加员工记录
      }

      // 队列处理完成后，延迟一段时间再重置状态
      if (this.employeeProcessingTimer) {
        clearTimeout(this.employeeProcessingTimer); // 清除之前的定时器
      }

      // 设置新的定时器
      this.employeeProcessingTimer = setTimeout(() => {
        this.isProcessingEmployee = false; // 重置处理状态
      }, 500); // 500ms的延迟，可以根据实际需求调整
    },

    /**
     * 检查流程记录是否存在并添加到列表
     * @param {string} code - 需要检查的流程卡扫码值
     */
    async checkAndAddFlowRecord(code) {
      try {
        // 检查是否已经存在该编码，避免重复添加流程项目
        const existingIndex = this.itemList.findIndex(item => item.code === code);
        if (existingIndex >= 0) {
          this.$message.warning('该流程编码已添加');
          return;
        }

        // 创建查询对象
        const query = new Query();
        query.TableName = 'DailyPlanDetail'; // 根据实际情况可能需要修改表名
        query.ShortName = 'dpd';
        query.Select = 'dpd.id';
        query.AddWhere(`dpd.CodeForScan = '${code}'`); // 使用扫码值查询对应记录
        query.AddWhere('dpd.DeletedTag = 0'); // 只查询未删除的记录

        // 执行查询
        const response = await generalApi.getDataEx(query);

        if (response.Status === 200 && response.Data && response.Data.length > 0) {
          // 找到了流程记录
          let id = response.Data[0].id;

          let pack = await craftApi.prepareAssemblyFlowCardCompletion(id);
          if (pack.Status === 200) {
            let data = pack.Data;

            // 检查工序是否添加过了
            for (let i = 0; i < this.itemList.length; i++) {
              if (this.itemList[i].typeofWorkid != data.ProcessAssemblyFlowDetail.TypeofWorkid) {
                this.$message.warning('添加的工序必须一致');
                return;
              }
            }

            let processAssemblyFlowDetail = data.ProcessAssemblyFlowDetail;
            let processAssemblyFlowDocument = data.ProcessAssemblyFlowDocument;

            console.log(data);

            // 记录存在，添加到列表中
            // 查询TypeofWork的Name
            const typeofWorkQuery = new Query();
            typeofWorkQuery.TableName = 'TypeofWork';
            typeofWorkQuery.ShortName = 'tw';
            typeofWorkQuery.Select = 'tw.Name';
            typeofWorkQuery.AddWhere(`tw.id = '${processAssemblyFlowDetail.TypeofWorkid}'`);

            const typeofWorkResponse = await generalApi.getDataEx(typeofWorkQuery);
            let typeofWorkName = '';
            if (typeofWorkResponse.Status === 200 && typeofWorkResponse.Data && typeofWorkResponse.Data.length > 0) {
              typeofWorkName = typeofWorkResponse.Data[0].Name;
            }

            // 如果VestInName为空但有VestInid，查询员工名称
            let employeeName = processAssemblyFlowDetail.VestInName || '';
            if (!employeeName && processAssemblyFlowDetail.VestInid) {
              try {
                const employeeQuery = new Query();
                employeeQuery.TableName = 'Employee';
                employeeQuery.ShortName = 'e';
                employeeQuery.Select = 'e.Name';
                employeeQuery.AddWhere(`e.id = '${processAssemblyFlowDetail.VestInid}'`);
                employeeQuery.AddWhere(`e.DeletedTag = 0`);
                
                const employeeResponse = await generalApi.getDataEx(employeeQuery);
                if (employeeResponse.Status === 200 && employeeResponse.Data && employeeResponse.Data.length > 0) {
                  employeeName = employeeResponse.Data[0].Name;
                }
              } catch (error) {
                console.error('查询员工名称失败:', error);
                // 错误时不阻止继续执行，使用空字符串
              }
            }

            // 记录存在，添加到列表中
            this.itemList.push({
              content: processAssemblyFlowDetail.Content || '',
              workRequirements: processAssemblyFlowDetail.WorkRequirements || '',
              typeofWorkid: processAssemblyFlowDetail.TypeofWorkid || '',
              typeofWorkName: typeofWorkName || '', // 添加TypeofWork的Name
              innerKey: processAssemblyFlowDocument.InnerKey || '',
              id: id, // 保存查找到的记录ID
              selected: false, // 默认不选中
              employeeId: processAssemblyFlowDetail.VestInid || '', // 初始化计件人ID
              employeeName: employeeName, // 使用查询到的或原有的员工名称
              qty: processAssemblyFlowDetail.CanCompleteQty || 1, // 初始化完工数量
              code: code, // 保存扫码值
              checkResult: 1, // 默认合格
              data: data // 保存数据对象
            });
          }
          else {
            this.$dialog.alert({
              title: '错误',
              message: `${pack.Message}`
            }).then(() => {
              this.$refs.flowScanInput.focus();
            });
          }
        } else {
          // 未找到匹配的记录，显示警告信息
          this.$dialog.alert({
            title: '提示',
            message: `未找到流程编码 ${code} 的匹配记录，请确认是否为有效的流程编码`
          }).then(() => {
            this.$refs.flowScanInput.focus();
          });
        }
      } catch (error) {
        // 处理请求错误
        console.error('检查流程记录失败:', error);
        this.$dialog.alert({
          title: '错误',
          message: `检查流程编码 ${code} 失败，请重试\n错误内容: ${error.message}`
        }).then(() => {
          this.$refs.flowScanInput.focus();
        });
      }
    },

    /**
     * 检查职员记录是否存在并设置到所有未设置计件人的项目
     * @param {string} code - 职员的扫码值
     */
    async checkAndAddEmployeeRecord(code) {
      try {
        // 查询职员表
        const query = new Query();
        query.TableName = 'Employee'; // 员工表名
        query.ShortName = 'e';
        query.Select = 'e.id, e.Name, e.UserName';
        query.AddWhere(`e.DeletedTag = 0`);
        query.AddWhere(`(e.EmployeeState = '合同期' or e.EmployeeState = '试用期' or e.EmployeeState = '离职期')`);
        query.AddWhere(`e.CodeForScan = '${code}' or e.Name = '${code}'`); // 使用扫码值查询职员记录

        const response = await generalApi.getDataEx(query);

        if (response.Status === 200 && response.Data && response.Data.length > 0) {
          // 找到匹配的员工
          const employee = response.Data[0];

          // 判断是否有项目需要设置计件人
          if (this.itemList.length > 0) {
            // 检查是否有选中的项目
            const hasSelectedItems = this.selectedItems.length > 0;

            if (hasSelectedItems) {
              // 有选中项目，询问是否只替换选中的项目
              this.$confirm(`是否将选中的 ${this.selectedItems.length} 个项目的计件人更改为 ${employee.Name}？`, '确认操作', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }).then(() => {
                // 用户确认，更新选中项目的计件人
                this.selectedItems.forEach(item => {
                  item.employeeId = employee.id;
                  item.employeeName = employee.Name;
                });
                this.$message.success(`已将选中的 ${this.selectedItems.length} 个项目的计件人设置为: ${employee.Name}`);
              }).catch(() => {
                this.$message.info('已取消操作');
              });
            } else {
              // 没有选中项目，询问是否替换所有项目
              this.$confirm(`是否将所有 ${this.itemList.length} 个项目的计件人更改为 ${employee.Name}？`, '确认操作', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }).then(() => {
                // 用户确认，更新所有项目的计件人
                this.itemList.forEach(item => {
                  item.employeeId = employee.id;
                  item.employeeName = employee.Name;
                });
                this.$message.success(`已将所有 ${this.itemList.length} 个项目的计件人更改为: ${employee.Name}`);
              }).catch(() => {
                this.$message.info('已取消操作');
              });
            }
          } else {
            // 项目列表为空，提示用户先添加项目
            this.$message.info(`找到职员: ${employee.Name}，请先扫描流程项目`);
          }
        } else {
          // 未找到匹配的员工记录，显示警告信息
          this.$dialog.alert({
            title: '提示',
            message: `未找到员工编码 ${code} 的匹配记录，请确认是否为有效的员工编码`
          }).then(() => {
            this.$refs.employeeScanInput.focus();
          });
        }
      } catch (error) {
        console.error('查询职员记录失败:', error);
        this.$dialog.alert({
          title: '错误',
          message: `查询职员记录失败: ${error.message || '未知错误'}`
        }).then(() => {
          this.$refs.employeeScanInput.focus();
        });
      }
    },

    /**
     * 切换项目的选中状态
     * @param {number} index - 要切换选中状态的项目索引
     */
    toggleSelection(index) {
      console.log('toggleSelection', index);
      if (index >= 0 && index < this.itemList.length) {
        this.itemList[index].selected = !this.itemList[index].selected;
      }
    },

    /**
     * 处理复选框变更事件
     * @param {number} index - 复选框对应项目的索引
     */
    onCheckboxChange(index) {
      // 避免重复触发，因为v-model已经修改了selected值
      console.log('复选框状态已变更，索引:', index);
    },

    /**
     * 全选所有项目
     */
    selectAll() {
      this.itemList.forEach(item => {
        item.selected = true;
      });
    },

    /**
     * 反选所有项目
     */
    invertSelection() {
      this.itemList.forEach(item => {
        item.selected = !item.selected;
      });
    },

    /**
     * 清除所有项目的选中状态
     */
    clearAll() {
      this.itemList.forEach(item => {
        item.selected = false;
      });
    },

    /**
     * 处理提交事件
     * 提交所有选中的项目
     */
    handleSubmit() {
      // 验证是否有选中的项目
      if (this.selectedItems.length === 0) {
        this.$message.warning('请至少选择一项');
        return;
      }

      // 验证选中项目数据是否完整
      const invalidItems = this.selectedItems.filter(item =>
        !item.employeeId || !item.employeeName || !item.qty || item.qty <= 0);

      if (invalidItems.length > 0) {
        this.$message.warning('请为选中项目填写完整的计件人和有效的完工数量');
        return;
      }

      // 获取选中的项目数据
      const selectedItems = this.selectedItems;

      // 显示确认对话框
      this.$confirm(`确定要批量完工选中的 ${selectedItems.length} 个流程记录吗？`, '确认操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          // 构建提交数据
          const submitItems = selectedItems.map(item => ({
            Dailyplanid: item.id,
            Employeeid: item.employeeId,
            Qty: item.qty,
            CheckResult: item.checkResult, // 添加合格性结果
          }));

          console.log('提交数据:', submitItems);

          // 调用批量完工API
          const result = await craftApi.batchCompletion(submitItems);

          if (result.Status === 200) {
            // 成功后显示消息并清空列表
            this.$message.success(`已成功完工 ${selectedItems.length} 个流程记录`);
            this.itemList = this.itemList.filter(item => !item.selected);

            // 如果所有项目都已提交，显示空提示
            if (this.itemList.length === 0) {
              this.$message.info('所有记录已处理完成');
            }
          } else {
            this.$dialog.alert({
              title: '错误',
              message: `批量完工失败: ${result.Message || '未知错误'}`
            }).then(() => {
              this.$refs.flowScanInput.focus();
            });
          }
        } catch (error) {
          console.error('批量完工失败:', error);
          this.$dialog.alert({
            title: '错误',
            message: `批量完工失败，请重试\n错误内容: ${error.message}`
          }).then(() => {
            this.$refs.flowScanInput.focus();
          });
        }
      }).catch(() => {
        // 用户取消操作
        this.$message.info('已取消操作');
      });
    },

    /**
     * 处理删除事件
     * 删除所有选中的项目
     */
    handleDelete() {
      let length = this.selectedItems.length;
      // 验证是否有选中的项目
      if (length === 0) {
        this.$message.warning('请至少选择一项');
        return;
      }

      // 显示确认对话框
      this.$confirm(`确定要删除选中的 ${length} 个流程记录吗？`, '确认删除', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 用户确认删除
        // 从列表中移除所有选中项
        this.itemList = this.itemList.filter(item => !item.selected);
        this.$message.success(`已删除 ${length} 个流程记录`);
      }).catch(() => {
        // 用户取消删除
        this.$message.info('已取消删除');
      });
    },

    goBack() {
      // 返回上一页
      this.$router.go(-1);
    },

    /**
     * 处理下拉框可见性变化
     * @param {boolean} visible - 下拉框是否可见
     */
    handleSelectVisibleChange(visible) {
      // 当下拉菜单显示时，确保它在其他元素之上
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

    /**
     * 加载所有员工列表
     */
    async loadEmployeeList() {
      try {
        // 如果员工列表已加载，则不重复加载
        if (this.employeeList.length > 0) {
          return;
        }

        let query = new Query();
        query.TableName = "Employee";
        query.ShortName = "e";
        query.Select = 'e.id, e.Name, e.CodeForScan';
        query.AddWhere(`e.DeletedTag=0`);
        query.AddWhere(`(e.EmployeeState = '合同期' or e.EmployeeState = '试用期' or e.EmployeeState = '离职期')`);
        query.OrderBy = 'e.Name ASC'; // 按姓名排序

        const pack = await generalApi.getDataEx(query);

        if (pack.Status == 200) {
          this.employeeList = pack.Data || [];
          // 初始设置过滤后的列表为完整列表
          this.filteredEmployeeList = [...this.employeeList];
          console.log("加载员工列表成功，共", this.employeeList.length, "条数据");
        } else {
          console.error("加载员工列表失败:", pack.Message);
          this.$message.warning(`加载员工列表失败: ${pack.Message}`);
        }
      } catch (error) {
        console.error("加载员工列表出错:", error);
        this.$message.error(`加载员工列表出错: ${error.message || '未知错误'}`);
      }
    },

    /**
     * 过滤员工列表
     */
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
    },

    /**
     * 处理员工字段点击
     * @param {Object} item - 当前项目
     */
    async handleEmployeeFieldClick(item) {
      // 先加载员工列表
      await this.loadEmployeeList();

      // 设置当前正在选择员工的项目
      this.currentSelectingItem = item;
      // 显示员工选择弹窗
      this.showEmployeeSelector = true;
      // 清空搜索文本
      this.employeeSearchText = '';
      // 重置过滤的员工列表
      this.filteredEmployeeList = [...this.employeeList];
      // 锁定背景滚动
      document.body.style.overflow = 'hidden';

      // 在下一个事件循环中让搜索框获取焦点
      this.$nextTick(() => {
        // 查找搜索框元素并设置焦点
        const searchInput = document.querySelector('.employee-search .van-field__control');
        if (searchInput) {
          searchInput.focus();
        }
      });
    },

    /**
     * 处理员工选择确认
     * @param {Object} employee - 选中的员工对象
     */
    onEmployeeSelected(employee) {
      if (this.currentSelectingItem && employee && employee.id) {
        // 更新员工ID和名称
        this.currentSelectingItem.employeeId = employee.id;
        this.currentSelectingItem.employeeName = employee.Name;
        console.log("已选择员工:", employee.Name, "ID:", employee.id);
      }
      // 隐藏选择器
      this.showEmployeeSelector = false;
      // 清空当前选择项目
      this.currentSelectingItem = null;
      // 清空搜索文本
      this.employeeSearchText = '';
      // 重置过滤的员工列表
      this.filteredEmployeeList = [...this.employeeList];
      // 恢复背景滚动
      document.body.style.overflow = '';
    },

    /**
     * 取消员工选择
     */
    cancelEmployeeSelection() {
      this.showEmployeeSelector = false;
      this.currentSelectingItem = null;
      this.employeeSearchText = '';
      this.filteredEmployeeList = [...this.employeeList];
      // 恢复背景滚动
      document.body.style.overflow = '';
    },

    /**
     * 弹窗关闭后的回调
     * 确保任何情况下弹窗关闭都恢复页面滚动
     */
    onPopupClosed() {
      // 恢复背景滚动
      document.body.style.overflow = '';
      // 重置相关状态
      if (this.currentSelectingItem) {
        this.currentSelectingItem = null;
        this.employeeSearchText = '';
        this.filteredEmployeeList = [...this.employeeList];
      }
    },
  },
  /**
   * 组件挂载后执行的钩子函数
   */
  async mounted() {
    // 页面加载后聚焦流程卡输入框，便于立即扫码
    this.$refs.flowScanInput.focus();
    // 预加载员工列表
    this.loadEmployeeList();
  },
  /**
   * 组件销毁前执行的钩子函数
   * 用于清理资源，防止内存泄漏
   */
  beforeDestroy() {
    // 组件销毁前清理定时器
    if (this.flowProcessingTimer) {
      clearTimeout(this.flowProcessingTimer);
    }
    if (this.employeeProcessingTimer) {
      clearTimeout(this.employeeProcessingTimer);
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/style/universal/cards";

.batch-complete {
  padding: vh(2.08) vw(1.56);
  /* 16px -> vh(2.08) vw(1.56) (16/768*100, 16/1024*100) */
  height: vh(100);
  /* 确保占满整个视口高度 */
  max-height: vh(100);
  /* 最大高度限制为视口高度 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* 防止整体溢出 */
  box-sizing: border-box;
  /* 确保padding不会增加元素总大小 */
  padding-bottom: calc(vh(2.08) + env(safe-area-inset-bottom, 0));
  /* 支持安全区域 (16px -> vh(2.08)) */

  &__title {
    margin-bottom: vh(2.08);
    /* 16px -> vh(2.08) (16/768*100) */
    display: flex;
    align-items: center;

    h2 {
      font-size: vh(2.34);
      /* 18px -> vh(2.34) (18/768*100) */
      color: #303133;
      margin: 0;
      padding: 0;
    }

    .back-button {
      display: flex;
      align-items: center;
      padding: 0 vw(0.98);
      /* 10px -> vw(0.98) (10/1024*100) */
      margin-right: vw(0.98);
      /* 10px -> vw(0.98) (10/1024*100) */
      cursor: pointer;
      height: vh(4.17);
      /* 32px -> vh(4.17) (32/768*100) */
      transition: all 0.2s ease;
      user-select: none;
      border-radius: vh(0.52);
      /* 4px -> vh(0.52) (4/768*100) */

      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }

      .van-icon {
        font-size: vh(2.08);
        /* 16px -> vh(2.08) (16/768*100) */
        margin-right: vw(0.49);
        /* 5px -> vw(0.49) (5/1024*100) */
      }

      span {
        font-size: vh(1.82);
        /* 14px -> vh(1.82) (14/768*100) */
      }
    }
  }

  /* 新增扫码容器样式 */
  &__scan-container {
    display: flex;
    gap: vh(2.08);
    /* 16px -> vh(2.08) (16/768*100) */
    margin-bottom: vh(2.08);
    /* 16px -> vh(2.08) (16/768*100) */
  }

  &__scan-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    border: vh(0.13) solid #ebeef5;
    /* 1px -> vh(0.13) (1/768*100) */
    border-radius: vh(0.52);
    /* 4px -> vh(0.52) (4/768*100) */
    padding: vh(1.3);
    /* 10px -> vh(1.3) (10/768*100) */
    background-color: #f5f7fa;
  }

  &__scan-title {
    font-size: vh(1.82);
    /* 14px -> vh(1.82) (14/768*100) */
    font-weight: 600;
    color: #303133;
    margin-bottom: vh(1.3);
    /* 10px -> vh(1.3) (10/768*100) */
    text-align: center;
  }

  &__scan-area {
    display: flex;
    align-items: center;
  }

  &__scan-input {
    flex: 1;
    height: vh(4.17);
    /* 32px -> vh(4.17) (32/768*100) */
    padding: 0 vw(0.98);
    /* 10px -> vw(0.98) (10/1024*100) */
    border: vh(0.13) solid #dcdfe6;
    /* 1px -> vh(0.13) (1/768*100) */
    border-radius: vh(0.52);
    /* 4px -> vh(0.52) (4/768*100) */
    font-size: vh(1.56);
    /* 添加字体大小 12px -> vh(1.56) (12/768*100) */

    &:focus {
      outline: none;
      border-color: #409eff;
    }

    &::placeholder {
      color: #909399;
      font-size: vh(1.56);
      /* 设置placeholder字体大小 12px -> vh(1.56) (12/768*100) */
      opacity: 0.8;
    }
  }

  &__operation {
    flex-wrap: wrap;
    justify-content: center;
    margin-bottom: vh(2.08);
    /* 16px -> vh(2.08) (16/768*100) */
    display: flex;
    gap: vw(0.98);
    /* 10px -> vw(0.98) (10/1024*100) */
    padding: 0 vw(1.56);
    /* 16px -> vw(1.56) (16/1024*100) */

    .operation-button {
      min-width: vw(15.63);
      /* 120px -> vw(15.63) (120/768*100) */
      flex: 0 0 auto;
      margin-bottom: vh(1.04);
      /* 8px -> vh(1.04) (8/768*100) */
      height: vh(3.65);
      /* 28px -> vh(3.65) (28/768*100) */
      padding: 0 vw(1.46);
      /* 0 15px -> 0 vw(1.46) (15/1024*100) */
      font-size: vh(1.69);
      /* 13px -> vh(1.69) (13/768*100) */
      border-radius: vh(0.39);
      /* 3px -> vh(0.39) (3/768*100) */
      line-height: vh(1.82);
      /* 14px -> vh(1.82) (14/768*100) */
      font-weight: 500;
    }
  }

  &__card-list {
    flex: 1;
    min-height: 0;
    /* 重要：确保flex子元素在flex容器中可以正确滚动 */
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    /* 增加iOS设备的滚动惯性 */
    position: relative;
    /* 添加相对定位作为子元素的定位上下文 */
    margin-bottom: vh(1.3);
    /* 10px -> vh(1.3) (10/768*100) */
  }

  &__card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(22vw, 1fr));
    /* 减小最小宽度从27.34vw到22vw */
    gap: vh(1.3) vw(1.04);
    /* 减小间距 */
    padding: 0 vw(1.56);
  }

  &__empty-tip {
    height: vh(13.02);
    /* 100px -> vh(13.02) (100/768*100) */
    display: flex;
    justify-content: center;
    align-items: center;
    color: #909399;
  }

  &__submit {
    display: flex;
    justify-content: center;
    /* 将右对齐改为居中对齐 */
    margin-top: vh(2.08);
    /* 16px -> vh(2.08) (16/768*100) */
    padding: 0 vw(1.56);
    /* 16px -> vw(1.56) (16/1024*100) */
    position: sticky;
    /* 使底部按钮区域保持可见 */
    bottom: 0;
    background-color: #fff;
    /* 确保背景色与页面一致 */
    z-index: 5;
    /* 保持在一定层级上，避免被卡片遮挡 */
    padding-bottom: max(vh(1.3), env(safe-area-inset-bottom, vh(1.3)));
    /* 支持安全区域 (10px -> vh(1.3)) */
    box-shadow: 0 -vh(0.26) vh(1.3) rgba(0, 0, 0, 0.05);
    /* 轻微阴影区分内容区 (2px 10px -> vh(0.26) vh(1.3)) */

    .batch-complete__button-wrapper {
      display: flex;
      justify-content: center;
      /* 确保按钮在容器中居中 */
      gap: vw(2.93);
      /* 增加按钮间距为30px -> vw(2.93) (30/1024*100) */
      padding: vh(0.65) 0;
      /* 增加上下内边距，5px -> vh(0.65) (5/768*100) */
    }

    .el-button {
      padding: vh(1.3) vw(1.95);
      /* 10px 20px -> vh(1.3) vw(1.95) (10/768*100, 20/1024*100) */
      font-size: vh(1.82);
      /* 14px -> vh(1.82) (14/768*100) */
      border-radius: vh(0.52);
      /* 4px -> vh(0.52) (4/768*100) */
      min-width: vw(9.77);
      /* 设置最小宽度 100px -> vw(9.77) (100/1024*100) */

      &:hover {
        transform: translateY(-vh(0.13));
        /* -1px -> -vh(0.13) (1/768*100) */
        box-shadow: 0 vh(0.26) vh(1.04) rgba(0, 0, 0, 0.15);
        /* 2px 8px -> vh(0.26) vh(1.04) (2/768*100, 8/768*100) */
      }
    }
  }
}

/* 卡片组件样式 */
.card {
  display: flex;
  flex-direction: column;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border-radius: vh(0.78);
  /* 减小圆角 */
  box-shadow: 0 vh(0.26) vh(0.65) rgba(0, 0, 0, 0.05);
  /* 减小阴影 */
  border: vh(0.13) solid rgba(0, 0, 0, 0.05);
  padding: 0;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
  --lable-width: vw(6.25);
  /* 减小标签宽度 */

  &:hover {
    box-shadow: 0 vh(0.26) vh(1.3) rgba(0, 0, 0, 0.1);
    /* 减小悬停阴影 */
    transform: translateY(-vh(0.13));
    /* 减小悬停上移效果 */
  }

  /* 选中状态样式 */
  &--selected {
    background: linear-gradient(145deg, #ecf5ff, #e1f0ff);
    border: vh(0.13) solid rgba(64, 158, 255, 0.2);
    box-shadow:
      0 vh(0.26) vh(1.3) rgba(64, 158, 255, 0.1),
      0 vh(0.13) vh(0.26) rgba(64, 158, 255, 0.2),
      inset 0 vh(0.13) vh(0.13) rgba(255, 255, 255, 0.9);

    .card__header {
      background: linear-gradient(145deg, #e1f0ff, #d0e8ff);
      border-bottom: vh(0.13) solid rgba(64, 158, 255, 0.2);
    }
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: vh(0.78) vw(0.98);
    /* 减小内边距 */
    background: linear-gradient(145deg, #f8f9fa, #f2f3f5);
    border-bottom: vh(0.13) solid rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: linear-gradient(145deg, #f2f3f5, #e9eaec);
    }

    &:active {
      background: linear-gradient(145deg, #e9eaec, #dfe0e2);
    }
  }

  &__title {
    font-weight: 600;
    font-size: vh(1.69);
    /* 减小字体大小 */
    color: #303133;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__checkbox {
    display: flex;
    align-items: center;
  }

  &__content {
    padding: vh(1.04) vw(0.98);
    /* 减小内边距 */
    flex: 1;
  }

  &__input-row {
    display: flex;
    align-items: center;
    margin-bottom: vh(0.78);
    /* 减小间距 */
    width: 100%;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__info-row {
    display: flex;
    margin-bottom: vh(0.78);
    /* 减小间距 */
    align-items: center;
    width: 100%;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__label {
    width: var(--lable-width);
    font-size: vh(1.56);
    /* 减小字体大小 */
    color: #606266;
    font-weight: 500;
    flex-shrink: 0;
    align-self: center;
  }

  &__readonly-text {
    flex: 1;
    font-size: vh(1.56);
    /* 减小字体大小 */
    color: #606266;
    line-height: 1.3;
    /* 减小行高 */
    background-color: #f5f7fa;
    border-radius: vh(0.26);
    /* 减小圆角 */
    border: vh(0.13) solid #e4e7ed;
    min-height: vh(3.52);
    /* 减小高度 */
    word-break: break-all;
    padding: 0 vw(0.65);
    /* 减小内边距 */
    display: flex;
    align-items: center;
    text-align: start;
    width: calc(100% - var(--lable-width));
  }

  &__input {
    flex: 1;
    height: vh(3.52);
    /* 减小高度 */
    line-height: vh(3.52);
    /* 减小行高 */
    padding: 0 vw(0.65);
    /* 减小内边距 */
    border: vh(0.13) solid #dcdfe6;
    border-radius: vh(0.26);
    /* 减小圆角 */
    background-color: #fff;
    width: calc(100% - var(--lable-width));
    font-size: vh(1.56);
    /* 减小字体大小 */

    &:focus {
      outline: none;
      border-color: #409eff;
      box-shadow: 0 0 0 vh(0.13) rgba(64, 158, 255, 0.2);
      /* 减小阴影 */
    }
  }

  &__radio-group {
    flex: 1;
    display: flex;
    gap: vw(1.17);
    /* 减小间距 */
  }

  &__footer {
    height: vh(3.82);
    /* 减小高度 */
    padding: vh(0.78) vw(0.98);
    /* 减小内边距 */
    background-color: rgba(0, 0, 0, 0.02);
    border-top: vh(0.13) solid rgba(0, 0, 0, 0.05);
    display: flex;
    justify-content: space-between;
    position: relative;
  }

  &__info {
    display: flex;
    align-items: center;
  }

  &__info-label {
    font-size: vh(1.43);
    /* 减小字体大小 */
    color: #909399;
    margin-right: vw(0.39);
    /* 减小间距 */
  }

  &__info-value {
    font-size: vh(1.43);
    /* 减小字体大小 */
    color: #303133;
    font-weight: 500;
  }

  &__qualification {
    display: flex;
    align-items: center;
    position: absolute;
    top: vh(0.26);
    /* 减小位置 */
    right: vw(0.98);
    /* 减小右侧距离 */
    width: vw(8.79);
    /* 减小宽度 */
  }

  /* 员工选择器样式 */
  &__employee-field {
    flex: 1;
    height: vh(3.52);
    /* 减小高度 */
    line-height: vh(3.52);
    /* 减小行高 */
    border: vh(0.13) solid #dcdfe6;
    border-radius: vh(0.26);
    /* 减小圆角 */
    background-color: #fff;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: #c0c4cc;
      background-color: #f5f7fa;
    }

    span {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 0 vw(0.65);
      /* 减小内边距 */
      text-align: left;
      font-size: vh(1.56);
      /* 减小字体大小 */
    }

    .employee-field-icon {
      color: #909399;
      font-size: vh(1.69);
      /* 减小图标大小 */
      transition: transform 0.3s;
      margin-right: vw(0.65);
      /* 减小右侧距离 */
    }
  }

  &__selection-icon {
    font-size: vh(2.08);
    /* 减小图标大小 */
    color: #909399;
    transition: all 0.3s ease;
    border-radius: 50%;
    padding: vh(0.26);
    /* 减小内边距 */

    &--selected {
      color: #409eff;
      transform: scale(1.1);
    }
  }
}

/* 添加合格性下拉框样式 */
.qualification-dropdown {
  ::v-deep .el-input__inner {
    border-radius: vh(1.69);
    /* 减小圆角 */
    height: vh(3.13);
    /* 减小高度 */
    line-height: vh(3.13);
    /* 减小行高 */
    border: vh(0.13) solid #ebedf0;
    background: #f7f8fa;
    color: #323233;
    transition: all 0.3s ease;
    padding: 0 vw(0.98);
    /* 减小内边距 */
    font-size: vh(1.3);
    /* 减小字体大小 */
  }

  ::v-deep .el-input__inner:hover {
    background: #f2f3f5;
    border-color: #dcdee0;
  }

  ::v-deep .el-input__suffix {
    right: vw(0.49);
    /* 减小右侧距离 */
  }

  ::v-deep .el-select__caret {
    color: #969799;
    line-height: vh(3.13);
    /* 减小行高 */
  }
}

/* 禁用状态的下拉框样式 */
::v-deep .el-select.is-disabled .el-input__inner {
  background-color: #f5f5f5;
  border-color: #e4e7ed;
  color: #999;
  cursor: not-allowed;
}

/* 媒体查询 - 小屏幕适配 */
@media screen and (max-width: 768px) {
  .batch-complete {
    padding: vh(1.3);
    /* 10px -> vh(1.3) (10/768*100) */

    /* 窄屏下扫码区域改为上下布局 */
    &__scan-container {
      flex-direction: column;
      gap: vh(1.3);
      /* 减小垂直间距 */
    }

    &__scan-section {
      width: 100%;
      box-sizing: border-box;
      /* 确保宽度包含padding和border */
      padding: vh(1.3);
      /* 增加内边距 */
    }

    &__scan-area {
      width: 100%;
      box-sizing: border-box;
      /* 确保宽度包含padding和border */
    }

    &__scan-input {
      width: 100%;
      box-sizing: border-box;
      /* 确保宽度包含padding和border */
    }

    &__card-grid {
      grid-template-columns: 1fr;
      padding: 0 vh(1.04);
      /* 8px -> vh(1.04) (8/768*100) */
    }

    &__operation {
      flex-wrap: wrap;
      justify-content: center;
      padding: 0 vh(1.04);
      /* 8px -> vh(1.04) (8/768*100) */

      .operation-button {
        min-width: 20vw;
        /* 小屏幕下设置更合适的宽度 */
        margin: 0 vh(0.65) vh(1.04);
        /* 增加水平间距，0 5px 8px -> 0 vh(0.65) vh(1.04) (5/768*100, 8/768*100) */
      }
    }

    &__submit {
      padding: 0 vh(1.04) vh(1.04);
      /* 8px 8px -> vh(1.04) vh(1.04) (8/768*100, 8/768*100) */
      padding-bottom: max(vh(1.04), env(safe-area-inset-bottom, vh(1.04)));
      /* 支持安全区域 (8px -> vh(1.04)) */

      .batch-complete__button-wrapper {
        width: 100%;
        /* 在小屏幕上占满宽度 */
        gap: vw(1.95);
        /* 减小间距以适应小屏幕，20px -> vw(1.95) (20/1024*100) */
      }

      .el-button {
        flex: 1;
        /* 在小屏幕上让按钮平均分配空间 */
        min-width: unset;
        /* 取消最小宽度限制 */
        white-space: nowrap;
        /* 防止文本换行 */
        padding: vh(1.3) vw(1.17);
        /* 调整内边距 10px 12px -> vh(1.3) vw(1.17) (10/768*100, 12/1024*100) */
      }
    }
  }
}

/* 员工选择器弹出层样式 */
::v-deep .van-popup {
  max-height: 60%;
  overflow-y: auto;
  position: fixed !important;
  z-index: 2001 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100% !important;
  margin: 0 !important;
  transform: none !important;
}

::v-deep .van-popup--bottom {
  bottom: 0 !important;
  top: auto !important;
}

::v-deep .van-popup--round {
  border-radius: vh(1.56) vh(1.56) 0 0 !important;
}

::v-deep .van-overlay {
  position: fixed !important;
  z-index: 2000 !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100% !important;
  height: 100% !important;
}

::v-deep .van-picker {
  width: 100%;
}

::v-deep .van-picker-column {
  font-size: vh(2.08);
  /* 16px -> vh(2.08) (16/768*100) */
}

::v-deep .van-picker__toolbar {
  border-bottom: vh(0.13) solid #ebedf0;
  /* 1px -> vh(0.13) (1/768*100) */
}

/* 员工搜索框样式 */
.employee-search {
  padding: vh(1.04) vw(1.56);
  /* 8px 16px -> vh(1.04) vw(1.56) (8/768*100, 16/1024*100) */
  border-bottom: vh(0.13) solid #ebedf0;
  /* 1px -> vh(0.13) (1/768*100) */
}

.employee-select-wrapper {
  flex: 1;
}

/* 添加van-search的placeholder样式 */
::v-deep .van-search .van-field__control {
  font-size: vh(1.56);
  /* 添加字体大小 12px -> vh(1.56) (12/768*100) */
}

::v-deep .van-search .van-field__control::placeholder {
  color: #909399;
  font-size: vh(1.56);
  /* 设置placeholder字体大小 12px -> vh(1.56) (12/768*100) */
  opacity: 0.8;
}

/* 必填字段样式 */
.required-field {
  color: #f56c6c;
  margin-right: vh(0.26);
}
</style>