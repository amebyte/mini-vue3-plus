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

```javascript
/**
* 这里的函数 defineReactive 用来对 Object.defineProperty 进行封装。
**/
function defineReactive(data, key, val) {
   // 依赖存储的地方
   const dep = new Dep()
   Object.defineProperty(data, key, {
       enumerable: true,
       configurable: true,
       get: function () {
           // 在 getter 中收集依赖
           dep.depend()
           return val
       },
       set: function(newVal) {
           val = newVal
           // 在 setter 中触发依赖
           dep.notify()
       }
   }) 
}
```

那么是什么地方进行属性读取呢？就是在 Watcher 里面，Watcher 也就是所谓的依赖。在 Watcher 里面读取数据的时候，会把自己设置到一个全局的变量中。

```javascript
/**
* 我们所讲的依赖其实就是 Watcher，我们要通知用到数据的地方，而使用这个数据的地方有很多，类型也不一样，有* 可能是组件的，有可能是用户写的 watch，我们就需要抽象出一个能集中处理这些情况的类。
**/
class Watcher {
    constructor(vm, exp, cb) {
        this.vm = vm
        this.getter = exp
        this.cb = cb
        this.value = this.get()
    }

    get() {
        Dep.target = this
        let value = this.getter.call(this.vm, this.vm)
        Dep.target = undefined
        return value
    }

    update() {
        const oldValue = this.value
        this.value = this.get()
        this.cb.call(this.vm, this.value, oldValue)
    }
}
```

在 Watcher 读取数据的时候也就触发了这个属性的监听 getter，在 getter 里面就需要进行依赖收集，这些依赖存储的地方就叫 Dep，在 Dep 里面就可以把全局变量中的依赖进行收集，收集完毕就会把全局依赖变量设置为空。将来数据发生变化的时候，就去 Dep 中把相关的 Watcher 拿出来执行一遍。

```javascript
/**
* 我们把依赖收集的代码封装成一个 Dep 类，它专门帮助我们管理依赖。
* 使用这个类，我们可以收集依赖、删除依赖或者向依赖发送通知等。
**/
class Dep {
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

// 删除依赖
function remove(arr, item) {
    if(arr.length) {
        const index = arr.indexOf(item)
        if(index > -1){
            return arr.splice(index, 1)
        } 
    }
}
```

### 问题2：为什么 Vue2 新增响应式属性要通过额外的 API？

这是因为 Object.defineProperty 只会对属性进行监测，而不会对对象进行监测，为了可以监测对象 Vue2 创建了一个 Observer 类。Observer 类的作用就是把一个对象全部转换成响应式对象，包括子属性数据，当对象新增或删除属性的时候负债通知对应的 Watcher 进行更新操作。

```javascript
// 定义一个属性
function def(obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
        value: val,
        enumerable: !!enumerable,
        writable: true,
        configurable: true
    })
}

class Observer {
    constructor(value) {
        this.value = value
        // 添加一个对象依赖收集的选项
        this.dep = new Dep()
        // 给响应式对象添加 __ob__ 属性，表明这是一个响应式对象
        def(value, '__ob__', this)
        if(Array.isArray(value)) {
           
        } else {
            this.walk(value)
        }
    }
    
    walk(obj) {
        const keys = Object.keys(obj)
        // 遍历对象的属性进行响应式设置
        for(let i = 0; i < keys.length; i ++) {
            defineReactive(obj, keys[i], obj[keys[i]])
        }
    }
}
```

**vm.$set 的实现原理**

```javascript
function set(target, key, val) {
    const ob = target.__ob__
    defineReactive(ob.value, key, val)
    ob.dep.notify()
    return val
}
```

当向一个响应式对象新增属性的时候，需要对这个属性重新进行响应式的设置，即使用 defineReactive 将新增的属性转换成 getter/setter。

我们在前面讲过每一个对象是会通过 Observer 类型进行包装的，并在 Observer 类里面创建一个属于这个对象的依赖收集存储对象 dep， 最后在新增属性的时候就通过这个依赖对象进行通知相关 Watcher 进行变化更新。

**vm.$delete 的实现原理**

```javascript
function del(target, key) {
    const ob = target.__ob__
    delete target[key]
    ob.dep.notify()
}
```

我们可以看到 `vm.$delete` 的实现原理和 `vm.$set` 的实现原理是非常相似的。

通过  `vm.$delete` 和 `vm.$set` 的实现原理，我们可以更加清晰地理解到 Observer 类的作用，Observer 类就是给一个对象也进行一个监测，因为 Object.defineProperty 是无法实现对对象的监测的，但这个监测是手动，不是自动的。

### 问题3：Object.defineProperty 真的不能监听数组的变化吗？

面试官一上来可能先问你 Vue2 中数组的响应式原理是怎么样的，这个问题你也许会觉得很容易回答，Vue2 对数组的监测是通过重写数组原型上的 7 个方法来实现，然后你会说具体的实现，接下来面试官可能会问你，为什么要改写数组原型上的 7 个方法，而不使用 Object.defineProperty，是因为 Object.defineProperty 真的不能监听数组的变化吗？

其实 Object.defineProperty 是可以监听数组的变化的。

```javascript
const arr = [1, 2, 3]
arr.forEach((val, index) => {
  Object.defineProperty(arr, index, {
    get() {
      console.log('监听到了')
      return val
    },
    set(newVal) {
      console.log('变化了：', val, newVal)
      val = newVal
    }
  })
})
```
其实数组就是一个特殊的对象，它的下标就可以看作是它的 key。

 ![](./images/vue2-arry-defineProperty-01.png)

所以 Object.defineProperty 也能监听数组变化，那么为什么 Vue2 弃用了这个方案呢？

首先这种直接通过下标获取数组元素的场景就比较少，其次即便通过了 Object.defineProperty 对数组进行监听，但也监听不了 push、pop、shift 等对数组进行操作的方法，所以还是需要通过对数组那 7 个方法进行重写监听。所以为了性能考虑 Vue2 直接弃用了使用 Object.defineProperty 对数组进行监听的方案。

### 问题4：Vue2 中是怎么监测数组的变化的？



### 问题5：Vue3 的响应式原理又是怎么样的？



### 问题6：Vue3 中又是怎么监测数组的变化的？



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