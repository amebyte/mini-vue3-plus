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
const r = Reflect.set(obj, 'address', '广东')
console.log(obj.address) // '广东'
```

