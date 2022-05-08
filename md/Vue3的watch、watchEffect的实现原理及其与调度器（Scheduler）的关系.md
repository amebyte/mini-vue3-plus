# Vue3的watch、watchEffect的实现原理及其与调度器（Scheduler）的关系 

所谓watch，就是观测一个响应式数据，当数据发生变化的时候通知并执行相应的回调函数。 watch的本质其实就是对effect的二次封装。所以在了解watch API之前，我们先要了解一下effect这个API。

effect函数

Vue3里面effect函数API是用于注册副作用函数的函数，也是Vue3响应式系统最重要的API之一。通过effect注册了一个副作用函数之后，当这个副作用函数当中的响应式数据发生了读取之后，通过Proxy的get,set拦截，从而在副作用函数与响应式数据之间建立了联系。

什么是副作用函数？
副作用函数指的是会产生副作用的函数，如下面的代码所示：

```javascript
function effect() {
    document.body.innerText = 'hello coboy ~'
}
```

当effect函数执行时，它会设置body的文本内容，但除了effect函数之外的任何函数都可以读取或者设置body的文本内容。也就是说，effect函数的执行会直接或间接影响其他函数的执行，这时我们说effect函数产生了副作用。副作用很容易产生，例如一个函数修改了全局变量，这其实也是一个副作用，如下面的代码所示：

```javascript
// 全局变量
let val = 1
function effect() {
    val = 2 // 修改全局变量，产生副作用
}
```

