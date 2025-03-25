<template>
  <div class="batch-receive">
    <!-- 页面标题 -->
    <div class="batch-receive__title">
      <div class="back-button" @click="goBack">
        <van-icon name="arrow-left" />
        <span>返回</span>
      </div>
      <h2>批量接收组装流程卡</h2>
    </div>

    <!-- 头部扫码输入区域 -->
    <div class="batch-receive__scan-area">
      <input ref="scanInput" v-model="scanCode" class="batch-receive__scan-input" placeholder="请使用扫码枪输入"
        @keyup.enter="handleScanCodeConfirm" autofocus />
    </div>

    <!-- 操作按钮区域 -->
    <div class="batch-receive__operation">
      <el-button type="primary" size="small" @click="selectAll">全选</el-button>
      <el-button type="primary" size="small" @click="invertSelection">反选</el-button>
      <el-button type="danger" size="small" @click="clearAll">全清</el-button>
    </div>

    <!-- 卡片列表区域 -->
    <div class="batch-receive__card-list">
      <div v-if="itemList.length === 0" class="batch-receive__empty-tip">暂无数据，请扫码添加</div>
      <div v-else class="batch-receive__card-grid">
        <div v-for="(item, index) in itemList" :key="index" class="card"
          :class="{ 'card--selected': item.selected }"
          @contextmenu.prevent>
          <div class="card__header" @click.stop="toggleSelection(index)" title="点击此处切换选择状态">
            <div class="card__title">{{ item.innerKey }}</div>
            <div class="card__checkbox">
              <el-checkbox v-model="item.selected" @change="onCheckboxChange(index)"></el-checkbox>
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
              <label class="card__label">计件人员:</label>
              <div class="employee-select-wrapper">
                <div 
                  class="card__employee-field"
                  @click="handleEmployeeFieldClick(item)"
                >
                  <span>{{ item.employeeName || '请选择计件人员' }}</span>
                  <van-icon name="arrow-down" class="employee-field-icon" />
                </div>
              </div>
            </div>
            <div class="card__input-row">
              <label class="card__label">接收数量:</label>
              <input type="number" v-model.number="item.qty" min="1" :max="item.data?.CanReceiveQty || 999"
                class="card__input" />
            </div>
          </div>
          <!-- 卡片底部，可以添加额外状态或按钮 -->
          <div v-if="item.data" class="card__footer">
            <!-- <div class="card__info">
              <span class="card__info-label">可接收数量:</span>
              <span class="card__info-value">{{ item.data.CanReceiveQty || 0 }}</span>
            </div> -->
            <!-- 添加合格性下拉框 -->
            <div class="card__qualification">
              <el-select v-model="item.checkResult" size="small" class="qualification-dropdown" popper-append-to-body
                popper-class="high-priority-dropdown" :popper-options="{ gpuAcceleration: false }"
                @visible-change="handleSelectVisibleChange">
                <el-option v-for="option in qualificationOptions" :key="option.value" :label="option.text" :value="option.value"></el-option>
              </el-select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作按钮区域 -->
    <div class="batch-receive__submit">
      <el-button type="danger" @click="handleDelete" :disabled="selectedItems.length === 0">
        删除 ({{ selectedItems.length }})
      </el-button>
      <el-button type="primary" @click="handleSubmit" :disabled="selectedItems.length === 0">
        提交 ({{ selectedItems.length }})
      </el-button>
    </div>

    <!-- 员工选择弹出层 -->
    <van-popup v-model="showEmployeeSelector" position="bottom" round>
      <div class="employee-search">
        <van-search v-model="employeeSearchText" placeholder="搜索员工姓名" @input="filterEmployees" />
      </div>
      <van-picker
        show-toolbar
        :columns="filteredEmployeeList"
        @confirm="onEmployeeSelected"
        @cancel="cancelEmployeeSelection"
        value-key="Name"
      />
    </van-popup>
  </div>
</template>

<script>
import generalApi from '@/api/general';
import craftApi from '@/api/craft';
import { Query } from '@/core/query';

export default {
  name: 'BatchReceiveProcessAssemblyFlow',
  components: {
  },
  data() {
    return {
      scanCode: '', // 扫码输入框的值
      itemList: [], // 存储所有扫码添加的项目
      scanQueue: [], // 扫码队列，存储待处理的扫码数据
      isProcessing: false, // 是否正在处理队列的标志
      processingTimer: null, // 处理队列的定时器引用
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
     * 处理扫码确认事件
     * 当用户在输入框中按下回车键时触发
     */
    handleScanCodeConfirm() {
      // 验证输入是否为空
      if (!this.scanCode.trim()) return;

      // 我们不再在这里检查编码是否已存在，因为扫描职员编码可以重复进行
      // 如果是流程项目编码，在处理过程中会检查并避免重复添加

      // 将扫码数据加入队列等待处理
      this.scanQueue.push(this.scanCode);
      // 立即清空输入框并聚焦，使用户可以继续扫码
      this.scanCode = '';
      this.$refs.scanInput.focus();

      // 开始处理队列
      this.startProcessingQueue();
    },

    /**
     * 开始处理扫码队列
     * 如果队列已在处理中，则不重复启动处理过程
     */
    startProcessingQueue() {
      if (this.isProcessing) return; // 防止重复处理
      this.isProcessing = true;
      this.processQueue();
    },

    /**
     * 处理扫码队列中的所有数据
     * 异步处理以避免阻塞UI
     */
    async processQueue() {
      // 循环处理队列中的每个扫码数据
      while (this.scanQueue.length > 0) {
        const code = this.scanQueue.shift(); // 取出队列中的第一个项目
        await this.checkAndAddRecord(code); // 异步检查并添加记录
      }

      // 队列处理完成后，延迟一段时间再重置状态
      // 这样可以避免频繁的扫码导致重复处理
      if (this.processingTimer) {
        clearTimeout(this.processingTimer); // 清除之前的定时器
      }

      // 设置新的定时器
      this.processingTimer = setTimeout(() => {
        this.isProcessing = false; // 重置处理状态
      }, 500); // 500ms的延迟，可以根据实际需求调整
    },

    /**
     * 检查记录是否存在并添加到列表
     * @param {string} code - 需要检查的扫码值
     */
    async checkAndAddRecord(code) {
      try {
        // 检查是否已经存在该编码，避免重复添加流程项目(职员不会受此限制)
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

          let pack = await craftApi.prepareAssemblyFlowCardReceive(id);
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

            this.itemList.push({
              content: processAssemblyFlowDetail.Content || '',
              workRequirements: processAssemblyFlowDetail.WorkRequirements || '',
              typeofWorkid: processAssemblyFlowDetail.TypeofWorkid || '',
              typeofWorkName: typeofWorkName || '', // 添加TypeofWork的Name
              innerKey: processAssemblyFlowDocument.InnerKey || '',
              id: id, // 保存查找到的记录ID
              selected: false, // 默认不选中
              employeeId: processAssemblyFlowDetail.VestInid || '', // 初始化接收人ID
              employeeName: processAssemblyFlowDetail.VestInName || '', // 初始化接收人名称
              qty: processAssemblyFlowDetail.CanReceiveQty || 1, // 初始化接收数量
              code: code, // 保存扫码值
              checkResult: 1, // 默认合格
              data: data
            });
          }
          else {
            this.$dialog.alert({
              title: '错误',
              message: `${pack.Message}`
            }).then(() => {
              this.$refs.scanInput.focus();
            });
          }
        } else {
          // 尝试查找职员记录
          await this.checkAndAddEmployeeRecord(code);
        }
      } catch (error) {
        // 处理请求错误
        console.error('检查记录失败:', error);
        this.$dialog.alert({
          title: '错误',
          message: `检查扫码内容 ${code} 失败，请重试\n错误内容: ${error.message}`
        }).then(() => {
          this.$refs.scanInput.focus();
        });
      }
    },

    /**
     * 检查职员记录是否存在并设置到所有未设置接收人的项目
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

          // 判断是否有项目需要设置接收人
          if (this.itemList.length > 0) {
            // 找到所有未设置接收人的项目
            const itemsToUpdate = this.itemList.filter(item => !item.employeeId || !item.employeeName);

            if (itemsToUpdate.length > 0) {
              // 更新这些项目的接收人信息
              itemsToUpdate.forEach(item => {
                item.employeeId = employee.id;
                item.employeeName = employee.Name;
                item.selected = true; // 自动选中已设置接收人的项目
              });

              this.$message.success(`已将${itemsToUpdate.length}项的接收人设置为: ${employee.Name}，并自动选中`);
            } else {
              // 如果所有项目都已设置接收人，则询问是否要覆盖
              this.$confirm(`所有项目已有接收人，是否将所有项目的接收人更改为${employee.Name}？`, '确认操作', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }).then(() => {
                // 用户确认，更新所有项目的接收人
                this.itemList.forEach(item => {
                  item.employeeId = employee.id;
                  item.employeeName = employee.Name;
                  item.selected = true; // 自动选中所有项目
                });
                this.$message.success(`已将所有项目的接收人更改为: ${employee.Name}，并全部选中`);
              }).catch(() => {
                this.$message.info('已取消操作');
              });
            }
          } else {
            // 项目列表为空，提示用户先添加项目
            this.$message.info(`找到职员: ${employee.Name}，请先扫描流程项目`);
          }
        } else {
          // 未找到匹配的记录，显示警告信息
          this.$dialog.alert({
            title: '提示',
            message: `未找到扫码内容 ${code} 的匹配记录，请确认是否为有效的流程编码或职员编码`
          }).then(() => {
            this.$refs.scanInput.focus();
          });
        }
      } catch (error) {
        console.error('查询职员记录失败:', error);
        this.$dialog.alert({
          title: '错误',
          message: `查询职员记录失败: ${error.message || '未知错误'}`
        }).then(() => {
          this.$refs.scanInput.focus();
        });
      }
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
     * 处理接收人输入事件
     * @param {Object} item - 当前项目
     * @param {string} value - 输入的接收人名称
     */
    async handleEmployeeNameInput(item, value) {
      if (value === null || value === '') return;

      item.employeeName = value;

      // 检查输入中是否包含单引号，如果包含则不触发请求
      if (value.includes("'")) {
        console.log('接收人名称包含单引号，不触发请求');
        return;
      }

      try {
        // 根据员工名称查询对应的ID
        const query = new Query();
        query.TableName = 'Employee'; // 员工表名
        query.ShortName = 'e';
        query.Select = 'e.id, e.Name, e.UserName';
        query.AddWhere(`e.DeletedTag = 0`);
        query.AddWhere(`(e.EmployeeState = '合同期' or e.EmployeeState = '试用期' or e.EmployeeState = '离职期')`);
        query.AddWhere(`e.Name = '${value}'`);

        const response = await generalApi.getDataEx(query);

        if (response.Status === 200 && response.Data) {
          const employees = response.Data;
          if (employees.length > 0) {
            // 找到匹配的员工
            const employee = employees[0];
            item.employeeId = employee.id;
            this.$message.success(`接收人 ${employee.Name} 对应用户名: ${employee.UserName}`);
          } else {
            // 未找到匹配的员工
            item.employeeId = null;
            // this.$message.warning(`未找到接收人: ${value}`);
          }
        }
      } catch (error) {
        console.error('查询接收人失败:', error);
        this.$message.error(`查询接收人失败: ${error.message || '未知错误'}`);
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
    },

    /**
     * 取消员工选择
     */
    cancelEmployeeSelection() {
      this.showEmployeeSelector = false;
      this.currentSelectingItem = null;
      this.employeeSearchText = '';
      this.filteredEmployeeList = [...this.employeeList];
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
        this.$message.warning('请为选中项目填写完整的接收人和有效的接收数量');
        return;
      }

      // 获取选中的项目数据
      const selectedItems = this.selectedItems;

      // 显示确认对话框
      this.$confirm(`确定要批量接收选中的 ${selectedItems.length} 个流程记录吗？`, '确认操作', {
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

          // 调用批量接收API
          const result = await craftApi.batchReceive(submitItems);

          if (result.Status === 200) {
            // 成功后显示消息并清空列表
            this.$message.success(`已成功接收 ${selectedItems.length} 个流程记录`);
            this.itemList = this.itemList.filter(item => !item.selected);

            // 如果所有项目都已提交，显示空提示
            if (this.itemList.length === 0) {
              this.$message.info('所有记录已处理完成');
            }
          } else {
            this.$dialog.alert({
              title: '错误',
              message: `批量接收失败: ${result.Message || '未知错误'}`
            }).then(() => {
              this.$refs.scanInput.focus();
            });
          }
        } catch (error) {
          console.error('批量接收失败:', error);
          this.$dialog.alert({
            title: '错误',
            message: `批量接收失败，请重试\n错误内容: ${error.message}`
          }).then(() => {
            this.$refs.scanInput.focus();
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
  },
  /**
   * 组件挂载后执行的钩子函数
   */
  async mounted() {
    // 页面加载后聚焦输入框，便于立即扫码
    this.$refs.scanInput.focus();
    // 预加载员工列表
    this.loadEmployeeList();
  },
  /**
   * 组件销毁前执行的钩子函数
   * 用于清理资源，防止内存泄漏
   */
  beforeDestroy() {
    // 组件销毁前清理定时器
    if (this.processingTimer) {
      clearTimeout(this.processingTimer);
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/style/universal/cards.scss";

.batch-receive {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;

  &__title {
    margin-bottom: 16px;
    display: flex;
    align-items: center;

    h2 {
      font-size: 18px;
      color: #303133;
      margin: 0;
      padding: 0;
    }

    .back-button {
      display: flex;
      align-items: center;
      padding: 0 10px;
      margin-right: 10px;
      cursor: pointer;
      height: 32px;
      transition: all 0.2s ease;
      user-select: none;
      border-radius: 4px;

      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }

      .van-icon {
        font-size: 16px;
        margin-right: 5px;
      }

      span {
        font-size: 14px;
      }
    }
  }

  &__scan-area {
    margin-bottom: 16px;
    display: flex;
    align-items: center;
  }

  &__scan-input {
    flex: 1;
    height: 32px;
    padding: 0 10px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    margin-right: 10px;

    &:focus {
      outline: none;
      border-color: #409eff;
    }
  }

  &__operation {
    margin-bottom: 16px;
    display: flex;
    gap: 10px;
  }

  &__card-list {
    flex: 1;
    overflow-y: auto;
  }

  &__card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    padding: 0 16px;
  }

  &__empty-tip {
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #909399;
  }

  &__submit {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
    padding: 0 16px;

    .el-button {
      padding: 10px 20px;
      font-size: 14px;
      border-radius: 4px;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }
    }
  }
}

/* 卡片组件样式 */
.card {
  display: flex;
  flex-direction: column;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  padding: 0;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
  --lable-width: 80px;

  &:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  /* 选中状态样式 */
  &--selected {
    background: linear-gradient(145deg, #ecf5ff, #e1f0ff);
    border: 1px solid rgba(64, 158, 255, 0.2);
    box-shadow:
      0 4px 15px rgba(64, 158, 255, 0.1),
      0 1px 3px rgba(64, 158, 255, 0.2),
      inset 0 1px 1px rgba(255, 255, 255, 0.9);

    .card__header {
      background: linear-gradient(145deg, #e1f0ff, #d0e8ff);
      border-bottom: 1px solid rgba(64, 158, 255, 0.2);
    }
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 15px;
    background: linear-gradient(145deg, #f8f9fa, #f2f3f5);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
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
    font-size: 16px;
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
    padding: 15px;
    flex: 1;
  }

  &__input-row {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    width: 100%;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__info-row {
    display: flex;
    margin-bottom: 12px;
    align-items: flex-start;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__label {
    width: var(--lable-width);
    font-size: 14px;
    color: #606266;
    font-weight: 500;
    flex-shrink: 0;
    align-self: center;
  }

  &__readonly-text {
    flex: 1;
    font-size: 14px;
    color: #606266;
    line-height: 1.5;
    background-color: #f5f7fa;
    border-radius: 4px;
    border: 1px solid #e4e7ed;
    min-height: 36px;
    word-break: break-all;
    padding: 0 10px;
    align-content: center;
    text-align: start;
    width: calc(100% - var(--lable-width)); // 减去label的宽度
  }

  &__input {
    flex: 1;
    height: 36px;
    line-height: 36px;
    padding: 0 10px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    background-color: #fff;
    width: calc(100% - var(--lable-width)); // 减去label的宽度

    &:focus {
      outline: none;
      border-color: #409eff;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
    }
  }

  &__footer {
    height: 20px;
    padding: 10px 15px;
    background-color: rgba(0, 0, 0, 0.02);
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    display: flex;
    justify-content: space-between;
    position: relative;
  }

  &__info {
    display: flex;
    align-items: center;
  }

  &__info-label {
    font-size: 12px;
    color: #909399;
    margin-right: 5px;
  }

  &__info-value {
    font-size: 12px;
    color: #303133;
    font-weight: 500;
  }

  &__qualification {
    display: flex;
    align-items: center;
    position: absolute;
    top: 3px;
    right: 15px;
    width: 100px;
  }

  /* 员工选择器样式 */
  &__employee-field {
    flex: 1;
    height: 36px;
    line-height: 36px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
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
    }

    .employee-field-icon {
      color: #909399;
      font-size: 16px;
      transition: transform 0.3s;
    }
  }
}

/* 添加合格性下拉框样式 */
.qualification-dropdown {
  ::v-deep .el-input__inner {
    border-radius: 18px;
    height: 30px;
    line-height: 30px;
    border: 1px solid #ebedf0;
    background: #f7f8fa;
    color: #323233;
    transition: all 0.3s ease;
    padding: 0 15px;
    font-size: 12px;
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
    line-height: 30px;
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
  .batch-receive {
    padding: 10px;

    &__card-grid {
      grid-template-columns: 1fr;
      padding: 0 8px;
    }

    &__operation {
      flex-wrap: wrap;
    }

    &__submit {
      padding: 0 8px;
      display: flex;
      gap: 10px;
    }
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
  font-size: 16px;
}

::v-deep .van-picker__toolbar {
  border-bottom: 1px solid #ebedf0;
}

/* 员工搜索框样式 */
.employee-search {
  padding: 8px 16px;
  border-bottom: 1px solid #ebedf0;
}

.employee-select-wrapper {
  flex: 1;
}
</style>
