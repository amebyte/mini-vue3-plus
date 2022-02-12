# vue3插槽的底层原理

Vue 实现了一套内容分发的 API，这套 API 的设计灵感源自 [Web Components 规范草案](https://github.com/w3c/webcomponents/blob/gh-pages/proposals/Slots-Proposal.md)，将 `<slot>` 元素作为承载分发内容的出口。 

它允许你像这样合成组件： 

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

