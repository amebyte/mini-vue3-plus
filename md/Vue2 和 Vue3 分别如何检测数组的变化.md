# Vue2 和 Vue3 分别如何检测数组的变化
Vue2中是通过改写数组的那个七个方法来来实现的

为什么 Object.defineProperty 明明能监听到数组值的变化，而 Vue 却没有实现？