# JavaScript中的this实战例题总结分析

### 前言

是否能够深刻理解this，是前端JavaScript进阶的重要一环。

面向对象语言中 this 表示当前对象的一个引用，但在 JavaScript 中 this 不是固定不变的，它会随着执行环境的改变而改变。

有一种广为流传的说法是：“谁调用它，this就指向谁”。也就是说普通函数在定义的时候无法确定 this 引用取值，因为函数没有被调用，也就没有运行的上下文环境，因此在函数中 this 的引用取值，是在函数被调用的时候确定的。

函数在不同的情况下被调用，就会产生多种不同的运行上下文环境，所以 this 的引用取值也就是随着执 行环境的改变而改变了。

下面就根据具体环境来逐一分析。

### 普通函数中的this

我们来看例题：请给出下面代码的运行结果。

例题1

```javascript
function f1 () {
   console.log(this)
}
f1() // window
```

普通函数在非严格的全局环境下调用时，其中的this指向的是window。

例题2

```javascript
"use strict"
function f1 () {
   console.log(this)
}
f1() // undefined
```

用了严格模式"use strict"，严格模式下无法再意外创建全局变量，所以this不为window而为undefined。

注意：babel转成ES6的，babel会自动给js文件上加上严格模式。

### 箭头函数中的this

在箭头函数中，this的指向是由外层(函数或全局)作用域来决定的。

例题3

```javascript
const Animal = {
    getName: function() {
        setTimeout(function() {
            console.log(this)
        })
    }
}
Animal.getName() // window
```

此时this指向window。

如果要让this指向Animal这个对象，则可以巧用箭头函数来解决。

例题4

```javascript
const Animal = {
    getName: function() {
        setTimeout(() => {
            console.log(this)
        })
    }
}
Animal.getName() // {getName: ƒ}
```

严格模式对箭头函数没有效果

例题5

```javascript
"use strict";
const f1 = () => {
   console.log(this)
}
f1() // window
```

我们都知道箭头函数体内的this对象，就是定义时所在的对象，而不是使用时所在的对象。普通函数使用了严格模式this会指向undefined但箭头函数依然指向了window。



### 函数作为对象的方法中的this

例题6

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

例题7

```javascript
const obj = {
    name: "coboy", 
    age: 18, 
    add: function() {
        console.log(this, this.name, this.age)
    }
};
const fn = obj.add
fn() // window
```

这个时候this则仍然指向window。obj对象方法add赋值给fn之后，fn仍然在window的全局环境中执行，所以this仍然指向window。

例题8

```javascript
const obj = {
    name: "coboy", 
    age: 18, 
    add: function() {
        function fn() {
            console.log(this)
        }
        fn()
    }
};
obj.add() // window
```

如果在对象方法内部声明一个函数，这个函数的 this 在对象方法执行的时候指向就不是这个对象了，而是指向window 了。

### 上下文对象调用中的this

例题9

```javascript
const obj = {
    name: "coboy", 
    age: 18, 
    add: function() {
        return this
    }
};
console.log(obj.add() === obj) // true
```

参考上文我们很容易知道this就是指向obj对象本身，所以返回true。

例题10

```javascript
const animal = {
    name: "coboy", 
    age: 18, 
    dog: {
        name: 'cobyte',
        getName: function() {
            console.log(this.name)
        }
    }
};
animal.dog.getName() // 'cobyte'
```

如果函数中的this是被上一级的对象所调用的，那么this指向的就是上一级的对象，也就是开头所说的：“谁调用了它，它就指向谁”。

例题11

```javascript
const obj1 = {
    txt: 'coboy1',
    getName: function() {
        return this.txt
    }
}
const obj2 = {
    txt: 'coboy2',
    getName: function() {
        return obj1.getName()
    }
}
const obj3 = {
    txt: 'coboy3',
    getName: function() {
        return obj2.getName()
    }
}
console.log(obj1.getName()) 
console.log(obj2.getName())
console.log(obj3.getName())
```

三个最终都打印了coboy1。

执行obj3.getName里面返回的是obj2.getName里面返回的结果，obj2.getName里面返回的是obj1.getName的结果，obj1.getName返回的结果就是'coboy1'。

如果上面的题改一下：

例题12

```javascript
const obj1 = {
    txt: 'coboy1',
    getName: function() {
        return this.txt
    }
}
const obj2 = {
    txt: 'coboy2',
    getName: function() {
        return obj1.getName()
    }
}
const obj3 = {
    txt: 'coboy3',
    getName: function() {
        const fn = obj1.getName
        return fn()
    }
}
console.log(obj1.getName()) 
console.log(obj2.getName())
console.log(obj3.getName())
```

这个时候输出了 coboy1,coboy1,undefined。

最后一个其实在上面例题5中已经有说明了。通过const fn = obj1.getName的赋值进行了“裸奔”调用，因此这里的this指向了window,运行结果当然是undefined。

例题13

上述的例题10中的obj2.getName()如果要它输出‘coboy2’，如果不使用bind、call、apply方法该怎么做？

```javascript
const obj1 = {
    txt: 'coboy1',
    getName: function() {
        return this.txt
    }
}
const obj2 = {
    txt: 'coboy2',
    getName: obj1.getName
}

console.log(obj1.getName()) 
console.log(obj2.getName())
```

上述方法同样说明了那个重要的结论：this指向最后调用它的对象。

我们将函数obj1的getName函数挂载到了obj2的对象上，getName最终作为obj2对象的方法被调用。

### 在构造函数中的this

通过 new 操作符来构建一个构造函数的实例对象，这个构造函数中的 this 就指向这个新的实例对象。同时构造函数 prototype 属性下面方法中的 this 也指向这个新的实例对象。

例题14

```javascript
function Animal(){
    console.log(this) // Animal {}
}
const a1 = new Animal();
console.log(a1) // Animal {}
```



```javascript
function Animal(){
    this.txt = 'coboy';
    this.age = 100;
}
Animal.prototype.getNum = function(){
    return this.txt;
}
const a1 = new Animal();
console.log(a1.age) // 100
console.log(a1.getNum()) // 'coboy'
```

在构造函数中出现显式return的情况。

例题15

```javascript
function Animal(){
    this.txt = 'coboy'
    const obj = {txt: 'cobyte'}
    return obj
}

const a1 = new Animal();
console.log(a1.txt) // cobyte
```

此时a1返回的是空对象obj。

例题16

```javascript
function Animal(){
    this.txt = 'coboy'
    return 1
}

const a1 = new Animal();
console.log(a1.txt) // 'coboy'
```

由此可以看出，如果构造函数中显式返回一个值，且返回的是一个对象，那么this就指向返回的对象，如果返回的不是一个对象，而是基本类型，那么this仍然指向实例。

### call，apply，bind 显式修改 this 指向

call方法

例题17

```javascript
const obj = {
    txt: "coboy", 
    age: 18, 
    getName: function() {
        console.log(this, this.txt)
    }
};
const obj1 = {
    txt: 'cobyte'
}
obj.getName(); // this指向obj
obj.getName.call(obj1); // this指向obj1
obj.getName.call(); // this指向window
```

apply方法

例题18

```javascript
const obj = {
    txt: "coboy", 
    age: 18, 
    getName: function() {
        console.log(this, this.txt)
    }
};
const obj1 = {
    txt: 'cobyte'
}

obj.getName.apply(obj1) // this指向obj1
obj.getName.apply() // this指向window
```

call方法和apply方法的区别

例题19

```javascript
const obj = {
    txt: "coboy", 
    age: 18, 
    getName: function(name1, name2) {
        console.log(this, name1, name2)
    }
};
const obj1 = {
    txt: 'cobyte'
}

obj.getName.call(obj1, 'coboy1', 'coboy2')
obj.getName.apply(obj1, ['coboy1', 'coboy2'])
```

可见call和apply主要区别是在传参上。apply方法与 call 方法用法基本相同，不同点主要是 call()方法的第二个参数和之后的参数可以是任意数据类型，而 apply 的第二个参数是数组类型或者 arguments 参数集合。

bind方法

例题20

```javascript
const obj = {
    txt: "coboy", 
    age: 18, 
    getName: function() {
        console.log(this.txt)
    }
};
const obj2 = {
    txt: "cobyte"
}
const newGetName = obj.getName.bind(obj2)
newGetName() // this指向obj2
obj.getName() // this仍然指向obj
```

bind()方法也能修改 this 指向，不过调用 bind()方法不会执行 getName()函数，也不会改变getName()函数本身，只会返回一个已经修改了 this 指向的新函数，这个新函数可以赋值给一个变量，调用这个变量新函数才能执行 getName()。

call()方法和 bind()方法的区别在于 

1. bind 的返回值是函数，并且不会自动调用执行。
2. 两者后面的参数的使用也不同。call 是 把第二个及以后的参数作为原函数的实参传进去， 而 bind 实参在其传入参数的基础上往后获取参数执行。

例题21

```javascript
function fn(a,b,c){ console.log(a,b,c); }
const fn1 = fn.bind({abc : 123},600);
fn(100,200,300) // 100,200,300 
fn1(100,200,300) // 600,100,200 
fn1(200,300) // 600,200,300 
fn.call({abc : 123},600) // 600,undefined,undefined
fn.call({abc : 123},600,100,200) // 600,100,200
```

### this优先级

我们通常把通过call、apply、bind、new对this进行绑定的情况称为显式绑定，而把根据调用关系确定this指向的情况称为隐式绑定。那么显示绑定和隐式绑定谁的优先级更高呢？