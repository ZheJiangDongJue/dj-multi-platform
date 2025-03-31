# pageStateMixin 页面状态持久化混入使用说明

## 介绍

`pageStateMixin` 是一个 Vue 混入，用于在页面刷新时保持页面状态。它通过在浏览器刷新前将状态保存到 localStorage，然后在页面重新加载时恢复这些状态。

主要解决的问题：

- 页面刷新后丢失表单内容、滚动位置等状态
- 浏览器意外关闭后再次打开能恢复之前的工作状态

## 使用方法

### 1. 基本用法

在组件中引入并使用混入：

```javascript
import { pageStateMixin } from '@/mixins';

export default {
  mixins: [pageStateMixin],
  // 其他组件配置...
}
```

### 2. 配置存储键

默认情况下，混入会自动根据路由路径生成存储键名。如果需要自定义存储键，可以使用常量或重写方法：

```javascript
export default {
  mixins: [pageStateMixin],
  
  // 方法一：使用常量
  STORAGE_KEY: 'myCustomStorageKey',
  
  // 方法二：重写方法
  methods: {
    _generateStorageKey() {
      this.$options.stateStorageKey = `customKey_${this.$route.params.id}`;
    }
  }
}
```

### 3. 自定义收集和恢复状态

要想控制保存哪些状态及如何恢复，需要覆盖两个关键方法：

```javascript
export default {
  mixins: [pageStateMixin],
  
  methods: {
    // 收集需要保存的状态
    collectState() {
      return {
        formData: this.form, // 表单数据
        selectedId: this.selectedId, // 当前选中的ID
        scrollPosition: this.$refs.scrollContainer.scrollTop, // 滚动位置
        timestamp: new Date().getTime() // 必须包含时间戳
      };
    },
  
    // 应用保存的状态
    async applyState(storedState) {
      try {
        // 恢复表单数据
        this.form = storedState.formData;
      
        // 恢复选中ID
        this.selectedId = storedState.selectedId;
      
        // 恢复滚动位置
        this.$nextTick(() => {
          if (this.$refs.scrollContainer) {
            this.$refs.scrollContainer.scrollTop = storedState.scrollPosition;
          }
        });
      
        return true; // 返回true表示成功恢复
      } catch (error) {
        console.error('恢复状态失败', error);
        return false;
      }
    }
  }
}
```

### 4. 状态保存时机

本混入**只在页面刷新前（beforeunload事件）** 自动保存状态，其他情况（如路由跳转、表单提交等）不会触发状态保存。

这种设计确保了：

- 只有当用户真正刷新页面或关闭浏览器时才会保存状态
- 避免在路由切换时保存状态，减少不必要的存储操作
- 一旦状态被恢复后，会自动清除存储的状态，确保只恢复一次

### 5. 状态过期配置

默认状态会在30分钟后过期，可以在组件中修改过期时间：

```javascript
export default {
  mixins: [pageStateMixin],
  
  data() {
    return {
      // 设置为2小时过期 
      stateExpirationTime: 2 * 60 * 60 * 1000 
    }
  }
}
```

## 完整示例

```javascript
import { pageStateMixin } from '@/mixins';

export default {
  name: 'UserForm',
  mixins: [pageStateMixin],
  STORAGE_KEY: 'userFormState',
  
  data() {
    return {
      form: {
        name: '',
        age: '',
        email: ''
      },
      scrollPosition: 0
    }
  },
  
  async mounted() {
    // 在挂载后尝试恢复状态，如果没有恢复则初始化
    if (!(await this.tryRestorePageState())) {
      this.initializeForm();
    }
  },
  
  methods: {
    // 自定义状态收集
    collectState() {
      return {
        form: this.form,
        scrollPosition: this.scrollPosition,
        timestamp: new Date().getTime()
      };
    },
  
    // 自定义状态恢复
    async applyState(storedState) {
      this.form = storedState.form;
      this.scrollPosition = storedState.scrollPosition;
    
      this.$nextTick(() => {
        if (this.$refs.container) {
          this.$refs.container.scrollTop = this.scrollPosition;
        }
      });
    
      return true;
    },
  
    // 处理滚动事件
    handleScroll(e) {
      this.scrollPosition = e.target.scrollTop;
    },
  
    // 初始化表单
    initializeForm() {
      // 默认初始化逻辑...
    }
  }
}
```

## 注意事项

1. 确保 `collectState()` 方法返回的对象包含 `timestamp` 字段，用于判断状态是否过期。
2. 在恢复DOM相关状态时（如滚动位置），使用 `this.$nextTick()` 确保DOM已更新。
3. 不要存储过大的数据，避免影响性能。
4. 状态只会在页面刷新前自动保存。
5. 状态恢复后会自动清除，这意味着每个保存的状态只会被恢复一次。
6. 如果组件有嵌套路由或共享路由，考虑使用自定义存储键以避免冲突。
