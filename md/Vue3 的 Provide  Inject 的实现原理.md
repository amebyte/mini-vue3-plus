# Vue3 的 Provide / Inject 的实现原理

Vue3 的 Provide / Inject 的实现原理其实就是利用了原型和原型链的知识，所以在了解Vue3 的 Provide / Inject 的实现原理之前，我们先复习一下原型和原型链的知识。

### 原型和原型链的知识回顾

-  prototype 与 `__proto__`


prototype 一般称为显式原型，`__proto__`一般称为隐式原型。 每一个函数在创建之后，在默认情况下，会拥有一个名为 prototype 的属性，这个属 性表示函数的原型对象。

- 原型链 

当我们访问一个JS对象属性的时候，JS先会在这个对象定义的属性里找，找不到就会沿着这个对象的`__proto__`这个隐式原型关联起来的链条向上一个对象查找，这个链条就叫原型链。

```javascript
function Fn() {}
Fn.prototype.name = 'coboy'
let fn1 = new Fn()
fn1.age = 18
console.log(fn1.name) // coboy
console.log(fn1.age) // 18
```

fn1是Fn函数new出来的实例对象，fn1.age是这个实例对象上属性，fn1.name则从Fn.prototype原型对象而来，因为fn1的`__proto__`隐式原型就是指向Fn这个函数的原型对象Fn.prototype。原型链某种意义上是让一个引用类型继承另一个引用类型的属性和方法。

```javascript
function Fn() {}
Fn.prototype.name = 'coboy'
let fn1 = new Fn()
fn1.name = 'cobyte'
console.log(fn1.name) // cobyte
```

当访问fn1这个实例对象的属性name的时候，JS先会在fn1这个实例对象的属性里查找，刚好fn1定义了一个name属性，所以就直接返回自身属性的值cobyte，否则就会继续沿着原型链向Fn.prototype上去找，那么就会返回coboy。

### 使用 Provide

在 `setup()` 中使用 `provide` 时，我们首先从 `vue` 显式导入 `provide` 方法。这使我们能够调用 `provide` 来定义每个 property。

`provide` 函数允许你通过两个参数定义 property

1. name (`<String>` 类型)
2. value

```javascript
import { provide } from 'vue'

export default {
  setup() {
    provide('name', 'coboy')
  }
}
```

### provide API实现原理

那么这个provide API实现原理是什么呢？

provide 函数可以简化为

```javascript
export function provide(key, value) {
    // 获取当前组件实例
    const currentInstance: any = getCurrentInstance()
    if(currentInstance) {
        // 获取当前组件实例上provides属性
        let { provides } = currentInstance
        // 获取当前父级组件的provides属性
        const parentProvides = currentInstance.parent.provides
        // 如果当前的provides和父级的provides相同则说明还没赋值
        if(provides === parentProvides) {
            // Object.create() es6创建对象的另一种方式，可以理解为继承一个对象, 添加的属性是在原型下。
            provides = currentInstance.provides = Object.create(parentProvides)
        }
        provides[key] = value
    }
}
```

综上所述provide API就是通过获取当前组件的实例对象，传进来的数据存储在当前的组件实例对象上的provides上，并且通过ES6的新API Object.create把父组件的provides属性设置到当前的组件实例对象的provides属性的原型对象上。

### 实例对象初始化时provides属性的处理

源码位置：runtime-core/src/component.ts

 ![](./images/provide-inject01.png)

我们通过查看instance对象的源码，可以看到，在instance组件实例对象上，存在parent和provides两个属性。在初始化的时候如果存在父组件则把父组件的provides赋值给当前的组件实例对象的provides，如果没有就创建一个新的对象，并且把应用上下文的provides属性设置为新对象的原型对象上的属性。

### 使用 inject

在 `setup()` 中使用 `inject` 时，也需要从 `vue` 显式导入。导入以后，我们就可以调用它来定义暴露给我们的组件方式。

`inject` 函数有两个参数：

1. 要 inject 的 property 的 name
2. 默认值 (**可选**)

```javascript
import { inject } from 'vue'

export default {
  setup() {
    const name = inject('name', 'cobyte')
    return {
      name
    }
  }
}
```

### inject API实现原理

