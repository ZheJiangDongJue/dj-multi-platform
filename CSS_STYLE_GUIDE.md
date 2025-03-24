# CSS 样式指南

## 关于样式污染问题的解决方案

本项目曾面临样式污染问题，主要表现为通用类名冲突、全局样式覆盖和深度选择器滥用等。本指南提供了解决这些问题的最佳实践。

## 样式命名规范

### 使用 BEM 命名约定

BEM 代表 Block（块）、Element（元素）和 Modifier（修饰符），是一种命名CSS类的方法论，旨在使CSS更具可维护性。

```scss
// 块：独立的组件
.toolbar {
  // ...
  
  // 元素：块的组成部分
  &__btn {
    // ...
  
    // 修饰符：改变元素的外观或状态
    &--primary {
      // ...
    }
  }
}
```

### 避免使用通用类名

不要使用如下通用类名，这些容易导致样式冲突：

- `.container`
- `.wrapper`
- `.content`
- `.header`
- `.footer`
- `.box`
- `.panel`

应该使用特定于组件的前缀，例如 `.toolbar__container` 而非 `.container`。

## 样式模块化

### 使用 Vue Scoped 样式

确保每个组件样式都使用 `scoped` 属性，避免样式泄漏：

```html
<style lang="scss" scoped>
  // 样式仅适用于当前组件
</style>
```

### 避免全局样式文件

全局样式应当被限制在极少数几个文件中，如：

- 重置样式（reset.scss）
- 主题变量（variables.scss）
- 工具类（utilities.scss）

### UI 组件主题定制

使用 `src/assets/style/theme/vant-element-theme.scss` 集中管理对第三方UI库的样式定制，避免在组件中直接覆盖。

## 减少 !important 的使用

### 使用正确的选择器优先级

通过更具体的选择器提高优先级，而不是依赖 `!important`：

```scss
// 不推荐
.button {
  color: red !important;
}

// 推荐
.specific-module .specific-component .button {
  color: red;
}
```

### 当必须使用 !important 时

如果必须使用 `!important`，应当添加详细注释说明原因：

```scss
.z-index-override {
  /* 
   * 使用 !important 是因为第三方库在内联样式中设置了z-index
   * 相关issue: #123
   */
  z-index: 9999 !important;
}
```

## 谨慎使用深度选择器

### 避免使用 ::v-deep 修改子组件样式

尊重组件的样式封装，避免使用深度选择器修改子组件样式：

```scss
// 不推荐
::v-deep .el-input {
  // 修改Element UI的样式
}

// 推荐：使用类替代
.element-theme__input {
  // 在这里定义样式
}
// 然后在模板中：<el-input class="element-theme__input" />
```

### 第三方组件样式定制

对于第三方组件，优先使用其提供的主题定制方案，而非直接覆盖样式。

## z-index 管理

使用变量管理 z-index 值，避免硬编码和竞争：

```scss
:root {
  --z-index-dropdown: 9990;
  --z-index-popup: 9980;
  --z-index-modal: 9970;
  --z-index-tooltip: 9960;
}

.dropdown {
  z-index: var(--z-index-dropdown);
}
```

## 迁移指南

从旧样式迁移到新规范的步骤：

1. 将 `assembly-flow.scss` 中的样式迁移到模块化的 `assembly-flow-module.scss`
2. 使用 BEM 命名规范重构组件样式
3. 移除对全局样式的依赖
4. 将与UI组件相关的样式移至 `vant-element-theme.scss`
5. 更新组件模板使用新的类名

## 样式审查清单

在代码审查中检查以下几点：

- [ ] 是否使用了BEM命名约定
- [ ] 是否避免了使用通用类名
- [ ] 组件样式是否使用了scoped
- [ ] 是否避免了使用!important
- [ ] 是否避免了使用深度选择器
- [ ] z-index是否合理管理
