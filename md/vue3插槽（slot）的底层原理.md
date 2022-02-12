# vue3插槽（slot）的底层原理

### Vue官方对插槽的定义

Vue 实现了一套内容分发的 API，这套 API 的设计灵感源自 [Web Components 规范草案](https://github.com/w3c/webcomponents/blob/gh-pages/proposals/Slots-Proposal.md)，将 `<slot>` 元素作为承载分发内容的出口。 

那么slot到底是什么呢？slot其实是一个接受父组件传过来的插槽内容，然后生成VNode并返回的函数。

我们一般是使用 `<slot></slot>` 这对标签进行接受父组件传过来的内容，那么这对标签最终编译之后是一个创建VNode的函数，我们可以叫做创建插槽VNode的函数。

```javascript
export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return _renderSlot(_ctx.$slots, "default")
}
```

### 如何使用插槽

要使用插槽那就必须存在父子组件。 

```html
<todo-button>
  Add todo
</todo-button>
```

然后在 `<todo-button>` 的组件中，你可能有： 

```html
<!-- todo-button 组件模板 -->
<button class="btn-primary">
  <slot></slot>
</button>
```

当组件渲染的时候，`<slot></slot>` 将会被替换为“Add todo”。 



下面这段模版模板内容

```html
<todo-button>
  Add todo
</todo-button>
```

编译之后的代码

```javascript
export function render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_todo_button = _resolveComponent("todo-button")
  return (_openBlock(), _createBlock(_component_todo_button, null, {
    default: _withCtx(() => [
      _createTextVNode(" Add todo ")
    ], undefined, true),
    _: 1 /* STABLE */
  }))
}
```

todo-button组件模版内容

```html
<button class="btn-primary">
  <slot></slot>
</button>
```

编译之后的代码如下：

```javascript
export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createElementBlock("button", { class: "btn-primary" }, [
    _renderSlot(_ctx.$slots, "default")
  ]))
}
```

