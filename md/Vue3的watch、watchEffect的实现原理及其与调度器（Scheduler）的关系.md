# Vue3的watch、watchEffect的实现原理及其与调度器（Scheduler）的关系 

所谓watch，就是观测一个响应式数据，当数据发生变化的时候通知并执行相应的回调函数。 watch的本质其实就是对effect的二次封装。所以在了解watch API之前，我们先要了解一下effect这个API。

什么是副作用函数？
副作用函数指的是会产生副作用的函数，如下面的代码所示：
