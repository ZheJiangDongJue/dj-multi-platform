<!--
 * @Author: 陈乾
 * @Date: 2021-10-26 15:36:54
 * @LastEditors: 陈乾
 * @LastEditTime: 2022-06-09 15:02:46
 * @Description: file content
 * @FilePath: /pad/src/components/icon/icon.vue
-->

<template>
  <div :class="`cq_icon ${_class}`" @click="$emit('onClick')" style="line-height: 0">
    <i :class="'risen cq-' + name" :style="{ color, width: _iconSize, height: _iconSize, fontSize: _iconSize }"></i>
  </div>
</template>

<script>
// import { mapGetters } from 'vuex'
export default {
  name: 'cqIcon',
  props: {
    _class: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: null
    },
    size: {
      type: [Number, String],
      default: 12
    },
    color: {
      type: String,
      default: 'red'
    }
  },
  computed: {
    // 通过计算属性，设置【图标】大小，如果是字符串则不做处理，否则加上rpx单位
    _iconSize() {
      return typeof this.size == 'string' ? this.size : `${this.size}px`
    }
  }
}
</script>

<style></style>
