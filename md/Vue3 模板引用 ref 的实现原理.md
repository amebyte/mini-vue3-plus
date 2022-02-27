# Vue3 模板引用 ref 的实现原理

### 什么是模板引用 `ref` ？

有时候我们可以使用 `ref` attribute 为子组件或 HTML 元素指定引用 ID。

```html
<template>
<input ref="input" />
</template>
<script>
import { defineComponent, ref } from 'vue'
export default defineComponent({
  setup() {
      const input = ref(null)
      const focusInput = () => {
      	input.value.focus()
      }
      return {
          input,
      }
  }
 })
</script>
```

