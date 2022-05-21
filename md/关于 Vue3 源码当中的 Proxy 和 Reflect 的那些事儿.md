# 关于 Vue3 源码当中的 Proxy 和 Reflect 的那些事儿

什么是 Proxy 呢？ 简单来说，使用 Proxy 可以创建一个代理对象，它允许我们拦截并重新定义对一个对象的基本操作。
Proxy只能够拦截对一个对象的基本操作，不能拦截对一个对象的复合操作
任何在 Proxy 的拦截器中能够找到的方法，都能够在 Reflect 中找到同名函数。
Reflect.get 函数还能接收第三个参数，即指定接收者 receiver，你可以把它理解为函数调用过程中的 this

单纯 Reflect 很容易被原始的方法代替，目前也并不一定要使用 Reflect，但 Reflect + Proxy 则可以产生 1 + 1 > 2 的效果


Reflect 对象与 Proxy 对象一样，也是 ES6 为了操作对象而提供的新 API。

对象读取操作

普通读取方式

```javascript
const obj = { name: 'coboy', age: 25 }
console.log(obj.name) // 'coboy'
```

使用 Reflect.get 的读取方式

```javascript
console.log(Reflect.get(obj, 'name')) // coboy
```

对象设置操作

普通方式设置

```javascript
obj.sex = 'boy'
console.log(obj.sex) // 'boy'
```

使用 Reflect.set 的设置方式

```javascript
Reflect.set(obj, 'address', '广东')
console.log(obj.address) // '广东'
```

这么一看，Reflect 好像没什么特别，甚至有点画蛇添足，不急，这只是冰山一角。

有一些场景我们需要监测对象的属性的设置是否成功，我们在 Vue2 的源码中看到有这么一段代码：

```javascript
export let supportsPassive = false
if (inBrowser) {
  try {
    const opts = {}
    Object.defineProperty(opts, 'passive', ({
      get () {
        /* istanbul ignore next */
        supportsPassive = true
      }
    }: Object)) // https://github.com/facebook/flow/issues/285
    window.addEventListener('test-passive', null, opts)
  } catch (e) {}
}
```

这段代码是什么意思，我们可以不用管，我们只需要注意到它使用了 `try catch` 来监听代码是否运行正常，这里主要监测的是 Object.defineProperty 的设置是否成功。那么为什么要监测 Object.defineProperty 是否设置成功呢？

是因为 `Object.defineProperty(obj, name, desc)` 在无法定义属性时，会抛出一个错误，并且会阻塞后面的代码运行。

```javascript
Object.defineProperty(obj, 'like', {
    get() {
        return 'coboy'
    }
})

Object.defineProperty(obj, 'like', {
    get() {
        return 'cobyte'
    }
})
console.log('被阻塞了')
```

上面这段代码就会报错，并且后面的打印也不输出了，被阻塞了。

```javascript
VM103:8 Uncaught TypeError: Cannot redefine property: like
    at Function.defineProperty (<anonymous>)
    at <anonymous>:8:8
```

那么想要不被阻塞呢就要通过 `try catch` 来捕获异常。

```javascript
try {
    Object.defineProperty(obj, 'like', {
        get() {
            return 'coboy'
        }
    })
} catch (error) {
    console.log(error)
}

try {
    Object.defineProperty(obj, 'like', {
        get() {
            return 'cobyte'
        }
    })
} catch (error) {
    console.log(error)
}
```

很明显这样写太不雅观了，如果使用 Reflect 则不存在这个问题了。

```javascript
Reflect.defineProperty(obj, 'like', {
    get() {
        return '中国'
    }
})

Reflect.defineProperty(obj, 'like', {
    get() {
        return '中国'
    }
})

console.log('没有阻塞')
```

那么 Reflect 的这些到底有什么用呢？接下来我们看看 Reflect 跟 Proxy 结合的威力。

我们先来看看下面的例子：

```javascript
const obj = {}
Object.defineProperty(obj,"name",{
    value:"coboy",
    writable: false //当设置为 false 的时候当前对象的属性值不允许被修改
})

obj.name = 'cobyte'
console.log(obj.name) // 'coboy'
```

我们创建了一个对象，并且通过 Object.defineProperty 设置了它的**属性描述符** value 值为： coboy，并且该属性值设置不允许修改，然后我们尝试修改它的 name 属性值，发现并没有成功，最终还是打印了最初的定义的 `coboy`。

我们将上面的代码和 Proxy 结合一下：

```javascript
const proxy = new Proxy(obj, {
    get(target, key,) {
        return target[key]
    },
    set(target, key, value) {
        return target[key] = value
    }
})
proxy.name = '王五'
console.log('阻塞了')
```

我们通过 Proxy 代理了上面设置的对象 obj，然后通过代理对象去修改 name 的属性值发现报错了，并且后面的代码也不执行，被阻塞了。

```
VM258:10 Uncaught TypeError: 'set' on proxy: trap returned truish for property 'name' which exists in the proxy target as a non-configurable and non-writable data property with a different value
```

接下来我们使用 Reflect 对 Proxy 代理设置的代码进行改造一下：

```javascript
const proxy = new Proxy(obj, {
    get(target, key,) {
        return Reflect.get(target, key)
    },
    set(target, key, value) {
        return Reflect.set(target, key, value)
    }
})
proxy.name = '王五'
console.log('正常运行')
```

使用了 Reflect 进行设置之后，居然不报错了，代码正常运行了。是因为 Reflect.get()、Reflect.set() 具有返回值，并且 Proxy 的 handler 的 get、set 也要求有返回值，所以这时使用 Reflect 再合适不过了。

我们再看看上面的例子：

```javascript
const obj = {}
Object.defineProperty(obj,"name",{
    value:"coboy",
    writable: false //当设置为 false 的时候当前对象的属性值不允许被修改
})

console.log(Reflect.set(obj, 'name', 'cobyte')) // false
console.log('不阻塞了') // '不阻塞了'
```

我们发现通过 Object.defineProperty 设置了不可修改的属性之后，我们使用 Reflect.set() 去修改的时候，它是有返回值的，并且返回值是 false。