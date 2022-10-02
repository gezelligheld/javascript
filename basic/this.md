#### 常见的 this 指向问题

##### 默认绑定

全局或独立函数中，this 指向 undefined，非严格模式隐式转换为 window（浏览器环境下）

```js
var a = 5;
let b = 6;

// let定义的变量在window下找不到
this.a; // 5
this.b; // undefined

function foo() {
  return this.a; // 5
}
```

需要注意的是，决定 this 绑定对象的并不是调用位置是否处于严格模式，而是函数体是否处于严格模式

##### 隐式绑定

需要看调用位置是否有上下文对象，如果有会把函数调用中的 this 绑定到这个上下文对象中

```js
function b() {
  return this.a + 1;
}
let obj = {
  a: 1,
  b: b,
};

obj.b();
```

对象属性引用链只对调用位置中的最后一层起作用

```js
function foo() {
  console.log(this.a);
}
var obj2 = {
  a: 42,
  foo: foo,
};
var obj1 = {
  a: 2,
  obj2: obj2,
};
obj1.obj2.foo(); // 42
```

一些情况下被隐式绑定的函数会丢失绑定对象，应用默认绑定

1. 对对象中的函数定义了别名后，此时再调用其实是一个不带任何修饰的函数调用，故应用了默认绑定

```js
function foo() {
  console.log(this.a);
}
var obj = {
  a: 2,
  foo: foo,
};
var bar = obj.foo;
var a = 'global';
bar(); // 'global'
```

2. 对象中的函数作为参数传递后，应用了默认绑定，js 内置的 setInterval、setTimeout、数组方法等也是如此

```js
function foo() {
  console.log(this.a);
}
function dofoo(fn) {
  fn();
}
var obj = {
  a: 2,
  foo: foo,
};
var a = 'global';
dofoo(obj.foo); // 'global'
setTimeout(obj.foo, 0); // 'global'
```

##### 显式绑定

call、apply、bind 可以改变 this 指向，call 和 apply 会立刻执行该方法，而 bind 返回一个新函数，不会立刻执行

```js
let obj1 = {
  a: 1,
  play: function (x, y) {
    this.a += x + y;
    console.log(this.a);
  },
};
let obj2 = { a: 10 };

obj1.play.call(obj2, 10, 10); // 30
obj1.play.apply(obj2, [10, 10]); // 30
```

一些内置方法提供了一个可选参数，可以指定回调函数中的 this 指向，内部本质上也是通过 call、apply 等实现的

```js
var obj = {
  a: 1,
}[(1, 2)].forEach(() => {
  console.log(this.a);
}, obj);
```

实现 bind

```js
Function.prototype.bind = function (obj) {
  var self = this;
  var obj = obj || window;
  return function () {
    obj.fn = self;
    var result = obj.fn(...arguments);
    delete obj.fn;
    return result;
  };
};
```

实现 apply

```js
Function.prototype.apply = function (obj) {
  obj = obj || window;
  obj.fn = this;
  var result;
  if (arguments[1]) {
    result = obj.fn(...arguments[1]);
  } else {
    result = obj.fn();
  }
  delete obj.fn;
  return result;
};
```

实现 call

```js
Function.prototype.call = function (obj) {
  obj = obj || window;
  obj.fn = this;
  var arr = [...arguments].slice(1);
  var result = obj.fn(...arr);
  delete obj.fn;
  return result;
};
```

##### new 绑定

类中 this 指向该类的实例化对象，因为实例化时 new 操作符将类中的 this 指向了一个新的对象

```js
function myNew(Constructor, ...args) {
  const obj = {};
  obj.__proto__ = Constructor.prototype;
  Constructor.apply(obj, args);
  return obj;
}
```

以上是常见的几种 this 绑定规律，优先级 new 绑定 > 显式绑定 > 隐式绑定 > 默认绑定

##### 绑定例外

事件的回调函数中，this 指向被侦听的对象

```js
document.addEventListener('click', (e) => {
  console.log(this); // document
});
```

箭头函数不会创建自己的 this，而是根据外层作用域来决定 this

```js
function foo() {
  setTimeout(() => {
    console.log(this.a);
  });
}
var obj = { a: 3 };
foo.call(obj); // 3
```

创建了一个函数的间接引用时会应用默认绑定规则，间接引用容易在赋值时发生

```js
function foo() {
  console.log(this.a);
}
var a = 2;
var o = { a: 3, foo: foo };
var p = { a: 4 };
(p.foo = o.foo)(); // 2
```

#### 从 Reference 规范谈 this

##### Reference 规范

ECMAScript 的类型分为语言类型和规范类型，语言类型就是直接在 js 代码中操作的类型，如 Undefined, Null, Boolean, String, Number 和 Object，而规范类型是用来描述 ECMAScript 语言结构和语言类型的，是只存在于规范里的抽象类型，为了更好的描述语言的底层逻辑行为而存在的，这其中就包括 Reference 规范

Reference 主要由三部分组成

- base value：属性所在的对象或者就是 EnvironmentRecord，其值为 undefined, an Object, a Boolean, a String, a Number, or an environment record 其中的一种

- referenced name：属性名称

- strict reference

示例如下

```js
var foo = 1;

// 对应的Reference
var fooReference = {
  base: EnvironmentRecord,
  name: 'foo',
  strict: false,
};
```

范中还提供了获取 Reference 组成部分的方法

- GetBase：返回 Reference 的 base value

- IsPropertyReference：如果 base value 是一个对象，就返回 true

- GetValue：获取具体的值，而不是 Reference

```js
var foo = 1;

var fooReference = {
  base: EnvironmentRecord,
  name: 'foo',
  strict: false,
};

GetValue(fooReference); // 1;
```

##### 确定 this 的值

利用 Reference 规范确定 this 的步骤如下

1. 计算 MemberExpression 的结果赋值给 ref

MemberExpression 是（）左边的部分

```
MemberExpression[ Expression ] // 属性访问表达式
MemberExpression.IdentifierName // 属性访问表达式
new MemberExpression Arguments    // 对象创建表达式
```

```js
function foo() {
  return function () {
    console.log(this);
  };
}

foo()(); // MemberExpression 是 foo()
```

2. 判断 ref 是不是一个 Reference 类型

在于看规范是如何处理各种 MemberExpression

- 如果是且 IsPropertyReference(ref) 是 true，this = GetBase(ref)

- 如果是且 base value 值是 Environment Record，this = ImplicitThisValue(ref)，其中 ImplicitThisValue(ref)始终返回 undefined

- 如果不是，this = undefined，非严格模式下其值会被隐式转换为 window

举例如下

```js
var value = 1;

var foo = {
  value: 2,
  bar: function () {
    return this.value;
  },
};

//示例1
console.log(foo.bar()); // 2
//示例2
console.log(foo.bar()); // 2
//示例3
console.log((foo.bar = foo.bar)()); // 1
//示例4
console.log((false || foo.bar)()); // 1
//示例5
console.log((foo.bar, foo.bar)()); // 1
```

- foo.bar()

MemberExpression 是 foo.bar，根据规范可知 foo.bar 是一个 Reference 类型，其值为

```js
var Reference = {
  // 属性所在的对象
  base: foo,
  name: 'bar',
  strict: false,
};
```

foo 是一个对象，所以 IsPropertyReference(ref)为 true，所以 this = GetBase(ref) = foo，示例 1 输出 2

- (foo.bar)()

() 并没有对 MemberExpression 进行计算，和 foo.bar()结果相同

- (foo.bar = foo.bar)()

= 使用了 GetValue，所以返回的值不是 Reference 类型，this 为 undefined，示例为非严格模式，指向 window，示例 2 输出 1

- (false || foo.bar)()

|| 使用了 GetValue，所以返回的值不是 Reference 类型，this 为 undefined，输出结果同上

- (foo.bar, foo.bar)()

, 使用了 GetValue，所以返回的值不是 Reference 类型，this 为 undefined，输出结果同上

再看一个例子

```js
function foo() {
  console.log(this);
}

foo();
```

MemberExpression 是 foo，根据规范会返回 Reference 类型

```js
var fooReference = {
  base: EnvironmentRecord,
  name: 'foo',
  strict: false,
};
```

由于 base value 为 EnvironmentRecord，调用 ImplicitThisValue(ref)，this = undefined（严格模式）

相关文章

1. [ECMAScript 5.1 规范-英文](es5.github.io/#x15.1)
2. [ECMAScript 5.1 规范-中文](yanhaijing.com/es5/#115)
3. [JavaScript 深入之从 ECMAScript 规范解读 this](https://juejin.cn/post/6844903473872371725)
