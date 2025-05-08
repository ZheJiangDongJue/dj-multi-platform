<template>
  <div class="viewport-demo">
    <h2 class="title">输入法弹出高度测试</h2>
    
    <div class="height-test-controls">
      <input 
        type="text" 
        placeholder="点击此处，测试输入法弹出效果" 
        v-model="inputText"
        @focus="onInputFocus"
        @blur="onInputBlur"
      />
      <div class="status-panel">
        <p>输入框状态: <span>{{ inputFocused ? '获得焦点' : '失去焦点' }}</span></p>
        <p>原始视窗高度: <span>{{ initialHeight }}px</span></p>
        <p>当前视窗高度: <span>{{ currentHeight }}px</span></p>
        <p>视窗高度变化: <span>{{ heightDifference }}px</span></p>
      </div>
    </div>
    
    <div class="height-test-containers">
      <div class="test-row">
        <div class="test-item">
          <div ref="standardVhBox" class="box standard-vh-box">
            <p>标准vh高度</p>
            <p>10vh</p>
            <p class="measure">实际: {{ measures.standardVh }}px</p>
          </div>
        </div>
        
        <div class="test-item">
          <div ref="customVhBox" class="box custom-vh-box">
            <p>自定义vh函数</p>
            <p>vh(10)</p>
            <p class="measure">实际: {{ measures.customVh }}px</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="measurements-panel">
      <h4>高度测量数据</h4>
      <div class="data-grid">
        <div class="data-row header">
          <div class="data-cell">元素类型</div>
          <div class="data-cell">初始高度</div>
          <div class="data-cell">当前高度</div>
          <div class="data-cell">变化</div>
          <div class="data-cell">变化率</div>
        </div>
        <div class="data-row">
          <div class="data-cell">标准vh (10vh)</div>
          <div class="data-cell">{{ initialMeasures.standardVh }}px</div>
          <div class="data-cell">{{ measures.standardVh }}px</div>
          <div class="data-cell">{{ (measures.standardVh - initialMeasures.standardVh).toFixed(2) }}px</div>
          <div class="data-cell">{{ calculateChangePercentage(measures.standardVh, initialMeasures.standardVh) }}%</div>
        </div>
        <div class="data-row">
          <div class="data-cell">自定义vh函数</div>
          <div class="data-cell">{{ initialMeasures.customVh }}px</div>
          <div class="data-cell">{{ measures.customVh }}px</div>
          <div class="data-cell">{{ (measures.customVh - initialMeasures.customVh).toFixed(2) }}px</div>
          <div class="data-cell">{{ calculateChangePercentage(measures.customVh, initialMeasures.customVh) }}%</div>
        </div>
      </div>
    </div>
    
    <div class="conclusion">
      <h4>结论</h4>
      <p v-if="inputFocused">请在输入法弹出后观察上方数据对比</p>
      <p v-else>点击输入框，等待输入法弹出后观察各元素高度变化</p>
      <p>标准vh会受输入法影响变小，而我们的自定义单位将保持不变</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ViewportDemo',
  data() {
    return {
      // 当前实时值
      currentWidth: 0,
      currentHeight: 0,
      initialHeight: 0,
      
      // 输入法测试相关
      inputText: '',
      inputFocused: false,
      
      // 元素高度测量
      measures: {
        standardVh: 0,
        customVh: 0
      },
      
      // 初始测量值
      initialMeasures: {
        standardVh: 0,
        customVh: 0
      },
      
      measureInterval: null
    }
  },
  computed: {
    // 计算高度变化
    heightDifference() {
      if (!this.initialHeight) return 0;
      return this.initialHeight - this.currentHeight;
    }
  },
  mounted() {
    // 同步初始的当前尺寸
    this.currentWidth = window.innerWidth;
    this.currentHeight = window.innerHeight;
    this.initialHeight = window.innerHeight;
    
    // 进行初始测量
    this.$nextTick(() => {
      this.measureElements();
      // 保存初始测量值
      this.initialMeasures = { ...this.measures };
    });
    
    // 窗口大小改变时更新
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    if (this.measureInterval) {
      clearInterval(this.measureInterval);
    }
  },
  methods: {
    handleResize() {
      this.updateCurrentSize();
      this.measureElements();
    },
    updateCurrentSize() {
      this.currentWidth = window.innerWidth;
      this.currentHeight = window.innerHeight;
    },
    measureElements() {
      // 测量所有元素的实际像素高度
      if (this.$refs.standardVhBox) {
        this.measures.standardVh = this.$refs.standardVhBox.offsetHeight;
      }
      if (this.$refs.customVhBox) {
        this.measures.customVh = this.$refs.customVhBox.offsetHeight;
      }
    },
    onInputFocus() {
      this.inputFocused = true;
      
      // 创建一个定时器持续监控高度变化和测量元素
      this.measureInterval = setInterval(() => {
        this.updateCurrentSize();
        this.measureElements();
      }, 100);
    },
    onInputBlur() {
      this.inputFocused = false;
      
      // 停止监控
      if (this.measureInterval) {
        clearInterval(this.measureInterval);
        this.measureInterval = null;
      }
    },
    calculateChangePercentage(current, initial) {
      if (!initial) return '0.00';
      const percentage = ((current - initial) / initial) * 100;
      return percentage.toFixed(2);
    }
  }
}
</script>

<style lang="scss">
@import '@/assets/style/custom-viewport.scss';

.viewport-demo {
  padding: 15px;
  max-width: 100%;
  margin: 0 auto;
  
  h3, h4 {
    margin: 15px 0 5px;
    text-align: center;
  }
  
  p {
    margin: 5px 0;
    text-align: center;
  }
  
  .title {
    font-size: 20px;
    margin-bottom: 15px;
    text-align: center;
  }
  
  .height-test-controls {
    margin: 15px 0;
    
    input {
      display: block;
      width: 100%;
      padding: 12px;
      font-size: 16px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
      margin-bottom: 10px;
    }
    
    .status-panel {
      background-color: #f9f4e8;
      border-left: 4px solid #f39c12;
      padding: 10px;
      
      p {
        margin: 5px 0;
        text-align: left;
        font-family: monospace;
        
        span {
          font-weight: bold;
        }
      }
    }
  }
  
  .height-test-containers {
    .test-row {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-around;
      margin-bottom: 15px;
      
      .test-item {
        flex: 1;
        min-width: 30%;
        margin: 5px;
        
        .box {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          border-radius: 8px;
          padding: 5px;
          color: white;
          font-weight: bold;
          
          p {
            margin: 2px 0;
            
            &.measure {
              font-size: 0.8em;
              opacity: 0.8;
            }
          }
        }
        
        .standard-vh-box {
          background-color: #e74c3c;
          height: 10vh;
        }
        
        .custom-vh-box {
          background-color: #3498db;
          height: vh(10);
        }
      }
    }
  }
  
  .measurements-panel {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 10px;
    margin: 15px 0;
    
    .data-grid {
      width: 100%;
      overflow-x: auto;
      
      .data-row {
        display: flex;
        border-bottom: 1px solid #eee;
        
        &.header {
          font-weight: bold;
          background-color: #f0f0f0;
          
          .data-cell {
            padding: 8px 5px;
          }
        }
        
        .data-cell {
          flex: 1;
          padding: 6px 5px;
          min-width: 70px;
          text-align: center;
          font-family: monospace;
          
          &:first-child {
            flex: 1.5;
            text-align: left;
            font-family: inherit;
          }
        }
      }
    }
  }
  
  .conclusion {
    background-color: #e8f8ef;
    border-left: 4px solid #27ae60;
    padding: 10px;
    margin: 15px 0;
    
    h4 {
      margin-top: 0;
      text-align: left;
    }
    
    p {
      text-align: left;
    }
  }
  
  @media (max-width: 767px) {
    .height-test-containers {
      .test-row {
        flex-direction: column;
        
        .test-item {
          margin: 5px 0;
        }
      }
    }
  }
}
</style> 