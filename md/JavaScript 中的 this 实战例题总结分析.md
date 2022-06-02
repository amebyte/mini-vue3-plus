# JavaScript 中的 this 实战例题总结分析

### 前言

是否能够深刻理解 this，是前端 JavaScript 进阶的重要一环。

面向对象语言中 this 表示当前对象的一个引用，但在 JavaScript 中 this 不是固定不变的，它会随着执行环境的改变而改变。

有一种广为流传的说法是：“谁调用它，this 就指向谁”。也就是说普通函数在定义的时候无法确定 this 引用取值，因为函数没有被调用，也就没有运行的上下文环境，因此在函数中 this 的引用取值，是在函数被调用的时候确定的。

函数在不同的情况下被调用，就会产生多种不同的运行上下文环境，所以 this 的引用取值也就是随着执 行环境的改变而改变了。

下面就根据具体环境来逐一分析。

### 普通函数中的 this

我们来看例题：请给出下面代码的运行结果。

例题1

```javascript
function f1 () {
   console.log(this)
}
f1() // window
```

普通函数在非严格的全局环境下调用时，其中的 this 指向的是 window。

例题2

```javascript
"use strict"
function f1 () {
   console.log(this)
}
f1() // undefined
```

用了严格模式 "use strict"，严格模式下无法再意外创建全局变量，所以 this 不为 window 而为 undefined。

注意：babel 转成 ES6 的，babel 会自动给 js 文件上加上严格模式。

### 箭头函数中的 this

在箭头函数中，this 的指向是由外层(函数或全局)作用域来决定的。

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

此时 this 指向 window。

如果要让 this 指向 Animal 这个对象，则可以巧用箭头函数来解决。

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

我们都知道箭头函数体内的 this 对象，就是定义时所在的对象，而不是使用时所在的对象。普通函数使用了严格模式 this 会指向 undefined 但箭头函数依然指向了 window。



### 函数作为对象的方法中的 this

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

在对象方法中，作为对象的一个方法被调用时，this 指向调用它所在方法的对象。也就是开头我们所说的那句：“谁调用了它，它就指向谁”，在这里很明显是 obj 调用了它。

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

这个时候 this 则仍然指向 window。obj 对象方法 add 赋值给 fn 之后，fn 仍然在 window 的全局环境中执行，所以 this 仍然指向 window。

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

如果在对象方法内部声明一个函数，这个函数的 this 在对象方法执行的时候指向就不是这个对象了，而是指向 window 了。

同样想要 this 指向 obj 可以通过箭头函数来实现：

```javascript
const obj = {
    name: "coboy", 
    age: 18, 
    add: function() {
        const fn = () => {
            console.log(this)
        }
        fn()
    }
};
obj.add() // obj
```

再次说明箭头函数的 this 是由外层函数作用域或者全局作用域决定的。

### 上下文对象调用中的 this

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

参考上文我们很容易知道 this 就是指向 obj 对象本身，所以返回 true。

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

如果函数中的 this 是被上一级的对象所调用的，那么 this 指向的就是上一级的对象，也就是开头所说的：“谁调用了它，它就指向谁”。

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

执行 obj3.getName 里面返回的是 obj2.getName 里面返回的结果，obj2.getName 里面返回的是 obj1.getName 的结果，obj1.getName 返回的结果就是 'coboy1'。

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

这个时候输出了 coboy1, coboy1, undefined。

最后一个其实在上面例题5中已经有说明了。通过 const fn = obj1.getName 的赋值进行了“裸奔”调用，因此这里的 this 指向了 window,运行结果当然是 undefined。

例题13

上述的例题10中的 obj2.getName() 如果要它输出‘coboy2’，如果不使用 bind、call、apply 方法该怎么做？

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

上述方法同样说明了那个重要的结论：this 指向最后调用它的对象。

我们将函数 obj1 的 getName 函数挂载到了 obj2 的对象上，getName 最终作为 obj2 对象的方法被调用。

### 在构造函数中的 this

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

在构造函数中出现显式 return 的情况。

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

此时 a1 返回的是空对象 obj。

例题16

```javascript
function Animal(){
    this.txt = 'coboy'
    return 1
}

const a1 = new Animal();
console.log(a1.txt) // 'coboy'
```

由此可以看出，如果构造函数中显式返回一个值，且返回的是一个对象，那么 this 就指向返回的对象，如果返回的不是一个对象，而是基本类型，那么 this 仍然指向实例。

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

call 方法和 apply 方法的区别

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

可见 call 和 apply 主要区别是在传参上。apply 方法与 call 方法用法基本相同，不同点主要是 call() 方法的第二个参数和之后的参数可以是任意数据类型，而 apply 的第二个参数是数组类型或者 arguments 参数集合。

bind 方法

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

bind() 方法也能修改 this 指向，不过调用 bind() 方法不会执行 getName()函数，也不会改变 getName() 函数本身，只会返回一个已经修改了 this 指向的新函数，这个新函数可以赋值给一个变量，调用这个变量新函数才能执行 getName()。

call() 方法和 bind() 方法的区别在于 

1. bind 的返回值是函数，并且不会自动调用执行。
2. 两者后面的参数的使用也不同。call 是 把第二个及以后的参数作为原函数的实参传进去， 而 bind 实参在其传入参数的基础上往后获取参数执行。

例题21

```javascript
function fn(a, b, c){ 
    console.log(a, b, c); 
}
const fn1 = fn.bind({abc : 123},600);
fn(100,200,300) // 100,200,300 
fn1(100,200,300) // 600,100,200 
fn1(200,300) // 600,200,300 
fn.call({abc : 123},600) // 600,undefined,undefined
fn.call({abc : 123},600,100,200) // 600,100,200
```

### this 优先级

我们通常把通过 call、apply、bind、new 对 this 进行绑定的情况称为显式绑定，而把根据调用关系确定 this 指向的情况称为隐式绑定。那么显示绑定和隐式绑定谁的优先级更高呢？

例题22

```javascript
function getName() {
    console.log(this.txt)
}

const obj1 = {
    txt: 'coboy1',
    getName: getName
}

const obj2 = {
    txt: 'coboy2',
    getName: getName
}

obj1.getName.call(obj2) // 'coboy2'
obj2.getName.apply(obj1) // 'coboy1'
```

可以看出 call、apply 的显示绑定比隐式绑定优先级更高些。

例题23

```javascript
function getName(name) {
   this.txt = name
}

const obj1 = {}

const newGetName = getName.bind(obj1)
newGetName('coboy')
console.log(obj1) // {txt: "coboy"}
```

当再使用 newGetName 作为构造函数时。

```javascript
const obj2 = new newGetName('cobyte')
console.log(obj2.txt) // 'cobyte'
```

这个时候新对象中的 txt 属性值为 'cobyte'。

newGetName 函数本身是通过 bind 方法构造的函数，其内部已经将this绑定为 obj1,当它再次作为构造函数通过 new 被调用时，返回的实例就已经和 obj1 解绑了。也就是说，new 绑定修改了 bind 绑定中的 this 指向，所以 new 绑定的优先级比显式 bind 绑定的更高。

例题24

```javascript
function getName() {
   return name => {
      return this.txt
   }
}

const obj1 = { txt: 'coboy1' }
const obj2 = { txt: 'coboy2' }

const newGetName = getName.call(obj1)
console.log(newGetName.call(obj2)) // 'coboy1'
```

由于 getName 中的 this 绑定到了 obj1 上，所以 newGetName(引用箭头函数) 中的 this 也会绑到 obj1 上，箭头函数的绑定无法被修改。

例题25

```javascript
var txt = 'good boy'
const getName = () => name => {
    return this.txt
}

const obj1 = { txt: 'coboy1' }
const obj2 = { txt: 'coboy2' }

const newGetName = getName.call(obj1)
console.log(newGetName.call(obj2)) // 'good boy'
```

例题26

```javascript
const txt = 'good boy'
const getName = () => name => {
    return this.txt
}

const obj1 = { txt: 'coboy1' }
const obj2 = { txt: 'coboy2' }

const newGetName = getName.call(obj1)
console.log(newGetName.call(obj2)) // undefined
```

const 声明的变量不会挂到 window 全局对象上，所以 this 指向 window 时，自然也找不到 txt 变量了。

### 箭头函数的 this 绑定无法修改

例题27

```javascript
function Fn() {
    return txt => {
        return this.txt
    }
}

const obj1 = {
    txt: 'coboy'
}
const obj2 = {
    txt: 'cobyte'
}

const f = Fn.call(obj1)
console.log(f.call(obj2)) // 'coboy'
```

由于 Fn 中的 this 绑定到了 obj1 上，所以 f 中的 this 也会绑定到 obj1 上， 箭头函数的绑定无法被修改。

例题28

```javascript
var txt = '意外不'
const Fn = () => txt => {
   return this.txt
}

const obj1 = {
    txt: 'coboy'
}
const obj2 = {
    txt: 'cobyte'
}

const f = Fn.call(obj1)
console.log(f.call(obj2)) // '意外不'
```

如果将 var 声明方式改成 const 或 let 则最后输出为 undefined，原因是使用 const 或 let 声明的变量不会挂载到 window 全局对象上。因此，this 指向 window 时，自然也找不到 txt 变量了。

### 从手写 new 操作符中去理解 this 
有一道经典的面试题，JS 的 new 操作符到底做了什么？

1. 创建一个新的空对象
2. 把这个新的空对象的隐式原型（`__proto__`）指向构造函数的原型对象（`prototype`）
3. 把构造函数中的 this 指向新创建的空对象并且执行构造函数返回执行结果
4. 判断返回的执行结果是否是引用类型，如果是引用类型则返回执行结果，new 操作失败，否则返回创建的新对象

```javascript
/*
  create函数要接受不定量的参数，第一个参数是构造函数（也就是new操作符的目标函数），其余参数被构造函数使用。
  new Create() 是一种js语法糖。我们可以用函数调用的方式模拟实现
*/
function create(Fn,...args){
    // 1、创建一个空的对象
    let obj = {}; // let obj = Object.create({});
    // 2、将空对象的原型prototype指向构造函数的原型
    Object.setPrototypeOf(obj,Fn.prototype); // obj.__proto__ = Fn.prototype 
    // 以上 1、2步还可以通过 const obj = Object.create(Fn.prototype) 实现
    // 3、改变构造函数的上下文（this）,并将参数传入
    let result = Fn.apply(obj,args);
    // 4、如果构造函数执行后，返回的结果是对象类型，则直接将该结果返回，否则返回 obj 对象
    return result instanceof Object ? result : obj;
    // return typeof result === 'object' && result != null ? result : obj
}
```

一般情况下构造函数没有返回值，但是作为函数，是可以有返回值的，这就解析了上面例题15和例题16的原因了。
在 new 的时候，会对构造函数的返回值做一些判断：如果返回值是基础数据类型，则忽略返回值，如果返回值是引用数据类型，则使用 return 的返回，也就是 new 操作符无效。

### 从手写 call、apply、bind 中去理解 this
手写 call 的实现

```javascript
Function.prototype.myCall = function (context, ...args) {
    context = context || window
    // 创建唯一的属性防止污染
    const key = Symbol()
    // this 就是绑定的那个函数
    context[key] = this
    const result = context[key](...args)
    delete context[key]
    return result
}
```
1. myCall 中的 this 指向谁？
myCall 已经设置在 Function 构造函数的原型对象（prototype）上了，所以每个函数都可以调用 myCall 方法，比如函数 Fn.myCall()，根据 this 的确定规律：“谁调用它，this 就指向谁”，所以myCall方法内的 this 就指向了调用的函数，也可以说是要绑定的那个函数。

2. Fn.myCall(obj) 本质就是把函数 Fn 赋值到 对象 obj 上，然后通过对象 obj.Fn() 来执行函数 Fn，那么最终又回到那个 this 的确定规律：“谁调用它，this 就指向谁”，因为对象 obj 调用了 Fn 所以 Fn 内部的 this 就指向了对象 obj。


手写 apply 的实现

apply 的实现跟 call 的实现基本是一样的，因为他们的使用方式也基本一样，只是传参的方式不一样。
```javascript
Function.prototype.myApply = function (context, args) {
    context = context || window
    // 创建唯一的属性防止污染
    const key = Symbol()
    // this 就是绑定的那个函数
    context[key] = this
    const result = context[key](...args)
    delete context[key]
    return result
}
```

手写 bind 的实现

```javascript
Function.prototype.myBind = function (ctx) {
  const self = this
  if (!Object.prototype.toString.call(self) === '[object Function]') {
    throw TypeError('myBind must be called on a function');
  }

  ctx = ctx || window;

  const args = Array.prototype.slice.call(arguments, 2);

  /**
   * 构造函数生成对象实例
   * @returns {Object|*}
   */
  const create = function () {
    const obj = {};

    /* 设置原型指向，确定继承关系 */
    obj.__proto__ = this.prototype;

    /**
     * 1、执行目标函数，绑定函数内部的属性
     * 2、如果目标函数有对象类型的返回值则取返回值，符合js new关键字的规范
     */
    const res = this.apply(obj, arguments);
    return typeof res === 'object' ? ret : obj;
  };

  const bound = function () {
    // new 操作符操作的时候
    if (this instanceof bound) {
      return create.apply(self, args.concat(Array.prototype.slice.call(arguments)));
    }
    return self.apply(ctx, args.concat(Array.prototype.slice.call(arguments)));
  };

  return bound;
};
```



### 为什么显式绑定的 this 要比隐式绑定的 this 优先级要高

通过上面的实现原理，我们就可以理解为什么上面的 this 优先级中通过 call、apply、bind 和 new 操作符的显式绑定的 this 要比隐式绑定的 this 优先级要高了。例如上面的 obj1.getName.call(obj2) 中的 getName 方法本来是通过 obj1 来调用的，但通过 call 方法之后，实际 getName 方法变成了 obj2.getName() 来执行了。


### 总结

通过本篇内容的学习，我们看到 this 的用法纷繁多样，确实不容易掌握。但总的来说可以总结为以下几条规则：

- 在函数体中，非显式或隐式地简单调用函数时，在严格模式下，函数内的 this 会绑定到 undefined 上，在非严格模式下则会被绑定到全局对象 window/global 上。
- 一般使用 new 方法调用构造函数时，构造函数内的 this 会被绑定到新创建的对象上，且优先级要比 bind 的高。
- 一般通过 call、apply、bind 方法显式调用函数时，函数体内的 this 会被绑定到指定参数的对象上，显式绑定的 this 要比隐式绑定的 this 优先级要高。
- 一般通过上下文对象调用函数时，函数体内的 this 会被绑定到该对象上。
- 在箭头函数中，this 的指向是由外层（函数或全局）作用域来决定的。