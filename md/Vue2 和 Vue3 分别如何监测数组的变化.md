# Vue2 和 Vue3 分别如何监测数组的变化
Vue2中是通过改写数组的那个七个方法来来实现的

为什么 Object.defineProperty 明明能监听到数组值的变化，而 Vue 却没有实现？

拦截器

```javascript
const arrayProto = Array.prototype
const arrayMethods = Object.create(arrayProto)
;[
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
].forEach(function (method) {
    // 缓存原始方法
    const original = arrayProto[method]
    Object.defineProperty(arrayMethods, method, {
        value: function mutator(...args) {
            return original.apply(this, args)
        },
        eumerable: false,
        writable: false,
        configurable: true
    })
})
```

使用拦截器覆盖 Array 原型

将拦截器方法挂载到数组的属性上

如何收集依赖
收集依赖



实际上，在 JavaScript 中，数组只是一个特殊的对象而已，因此想要更好地实现对数组的代理，就有必要了解相比普通对象，数组到底有何特殊之处。首先对数组的读取操作要比普通对象丰富得多了，

数组的原型方法： contat、join、every、some、find、findIndex、includes