# JavaScript中的this实战例题总结分析

### 前言

是否能够深刻理解this，是前端JavaScript进阶的重要一环。

面向对象语言中 this 表示当前对象的一个引用，但在 JavaScript 中 this 不是固定不变的，它会随着执行环境的改变而改变。

有一种广为流传的说法是：“谁调用它，this就指向谁”。也就是说普通函数在定义的时候无法确定 this 引用取值，因为函数没有被调用，也就没有运行的上下文环境，因此在函数中 this 的引用取值，是在函数被调用的时候确定的。

函数在不同的情况下被调用，就会产生多种不同的运行上下文环境，所以 this 的引用取值也就是随着执 行环境的改变而改变了。

下面就根据具体环境来逐一分析。

### 全局环境中的this

我们来看例题：请给出下面代码的运行结果。

```javascript
function f1 () {
   console.log(this)
}
f1() // window
```

普通函数在非严格的全局下调用时，其中的this指向的是window。

```javascript
"use strict"
function f1 () {
   console.log(this)
}
f1() // undefined
```

用了严格模式"use strict"，严格模式下无法再意外创建全局变量，所以this不为window而为undefined。

注意：babel转成ES6的，babel会自动给js文件上加上严格模式。

#### 严格模式对箭头函数没有效果

```javascript
"use strict";
const f1 = () => {
   console.log(this)
}
f1() // window
```

我们都知道箭头函数体内的this对象，就是定义时所在的对象，而不是使用时所在的对象。普通函数使用了严格模式this会指向undefined但箭头函数依然指向了window。

### 函数作为对象的方法 

```javascript
const obj = {
    name: "coboy", 
    age: 18, 
    add: function() {
        console.log(this, this.name, this.age)
    }
};
obj.add(); // {name: "coboy", age: 18, add: ƒ} "coboy" 18
```

在对象方法中，作为对象的一个方法被调用时，this 指向调用它所在方法的对象。也就是开头我们所说的那句：“谁调用了它，它就指向谁”，在这里很明显是obj调用了它。