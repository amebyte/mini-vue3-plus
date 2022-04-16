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

这里我们在渲染上下文中暴露 `input`，并通过 `ref="input"`，将其绑定到 input 作为其 ref。在虚拟 DOM 补丁算法中，如果 VNode 的 `ref` 键对应于渲染上下文中的 ref，则 VNode 的相应元素或组件实例将被分配给该 ref 的值。这是在虚拟 DOM 挂载/打补丁过程中执行的，因此模板引用只会在初始渲染之后获得赋值。

### 设置当前渲染的实例对象

我们知道我们写的这个组件在运行的时候，先会创建一个组件实例对象`instance`，再通过运行这个组件实例对象的`render`方法获取这个组件的虚拟DOM，然后再进行`patch`，渲染出真实DOM。

在运行组件实例对象的render方法之前，会先设置保存正在渲染的组件实例对象`currentRenderingInstance` 

renderComponentRoot方法

```javascript
import { setCurrentRenderingInstance } from "./componentRenderContext";

export function renderComponentRoot(
    instance
  ) {
    const { proxy, render } = instance
    let result
    // 返回上一个实例对象
    const prev = setCurrentRenderingInstance(instance)
    result = render.call(proxy)
    // 再设置当前的渲染对象上一个，具体场景是嵌套循环渲染的时候，渲染完子组件，再去渲染父组件
    setCurrentRenderingInstance(prev)
    return result
}
```

setCurrentRenderingInstance方法

```javascript
export let currentRenderingInstance = null

export function setCurrentRenderingInstance(instance) {
    const prev = currentRenderingInstance
    currentRenderingInstance = instance
    return prev
}
```

### 设置元素或者组件的props中的ref

在获取组件的虚拟DOM的时候，其实是通过createVNode来创建的虚拟DOM，在创建的虚拟DOM的时候会保存当前前渲染的实例对象到当前元素或者组件的props中的ref中。

```javascript
export function createVNode(type, props?, children?) {
    const vnode = {
        type,
        props,
        ref: props && normalizeRef(props), // 创建虚拟DOM的时候设置ref
        children,
        component: null,
        key: props && props.key,
        shapeFlag: getShapeFlag(type),
        el: null
    }
    return vnode
}
```

我们来看看normalizeRef函数做了什么

```javascript
import { currentRenderingInstance } from "./componentRenderContext"
const normalizeRef = ({
    ref
  }) => {
    return (
      ref != null
        ? isString(ref) || isRef(ref) || isFunction(ref)
          ? { i: currentRenderingInstance, r: ref}
          : ref
        : null
    ) as any
}
```

我们可以看到normalizeRef函数最主要是把当前的渲染实例对象`currentRenderingInstance`保存起来了。