# 面试官的步步紧逼：Vue2 和 Vue3 分别如何监测数组的变化
### 前言

技术栈是 Vue 的同学，在面试中难免会被问到 Vue2 和 Vue3 的相关知识点的实现原理和比较，而且面试官是步步紧逼，一环扣一环。

Vue2 的响应式原理是怎么样的？

Vue3 的响应式原理又是怎么样的？

Vue2 中是怎么监测数组的变化的？

Vue3 中又是怎么监测数组的变化的？

在问完你 Vue2 的数组的响应式原理之后，接着可能会补上一句，为什么要通过重写数组原型的 7 个方法来对数组进行监测？是因为 defineProperty 真的不能监测数组变化吗？

普通对象的响应式原理，估计大家都比较清楚，相对而已，数组的响应式原理则可能不太清楚，故本文主要讲解 Vue2 和 Vue3 分别如何监测数组的变化。

### 问题1：Vue2 的响应式原理是怎么样的？

所谓响应式就是首先建立响应式数据和依赖之间的关系，当这些响应式数据发生变化的时候，可以通知那些绑定这些数据的依赖进行相关操作，可以是 DOM 更新，也可以是执行一个回调函数。

我们知道 Vue2 的对象数据是通过 Object.defineProperty 对每个属性进行监听，当对属性进行读取的时候，就会触发 getter，对属性进行设置的时候，就会触发 setter。

那么是什么地方进行属性读取呢？就是在 Watcher 里面，Watcher 也就是所谓的依赖。在 Watcher 里面读取数据的时候，会把自己设置到一个全局的变量中。

在 Watcher 读取数据的时候也就触发了这个属性的监听 getter，在 getter 里面就需要进行依赖收集，这些依赖存储的地方就叫 Dep，在 Dep 里面就可以把全局变量中的依赖进行收集，收集完毕就会把全局依赖变量设置为空。将来数据发生变化的时候，就去 Dep 中把相关的 Watcher 拿出来执行一遍。

```javascript
function defineReactive(data, key, val) {
   let dep = new Dep()
   Object.defineProperty(data, key, {
       enumerable: true,
       configurable: true,
       get: function () {
           dep.depend()
           return val
       },
       set: function(newVal) {
           val = newVal
           dep.notify()
       }
   }) 
}

class Dep{
    constructor() {
        this.subs = []
    }
    
    addSub(sub) {
        this.subs.push(sub)
    }
    
    removeSub(sub) {
        remove(this.subs, sub)
    }

    depend() {
        if(Dep.target){
            this.addSub(Dep.target)
        }
    }

    notify() {
        const subs = this.subs.slice()
        for(let i = 0, l = subs.length; i < l; i++) {
            subs[i].update()
        }
    }
}

function remove(arr, item) {
    if(arr.length) {
        const index = arr.indexOf(item)
        if(index > -1){
            return arr.splice(index, 1)
        } 
    }
}

class Watcher{
    constructor() {
        
    }
}
```



### 问题2：Vue2 中是怎么监测数组的变化的？





### 问题3：Vue3 的响应式原理又是怎么样的？



### 问题4：Vue3 中又是怎么监测数组的变化的？



Vue2.x 监测数组变更的两条限制：不能监听利用索引直接设置一个数组项，不能监听直接修改数组的长度，是因为 defineProperty 的限制么？

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
在拦截器中获取 Observer 实例



实际上，在 JavaScript 中，数组只是一个特殊的对象而已，因此想要更好地实现对数组的代理，就有必要了解相比普通对象，数组到底有何特殊之处。首先对数组的读取操作要比普通对象丰富得多了，

数组的原型方法： contat、join、every、some、find、findIndex、includes