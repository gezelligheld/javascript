#### 块级作用域

通过 var 声明的变量存在变量提升的特性

```js
if (condition) {
    var value = 1;
}
console.log(value);
```

相当于

```js
var value;
if (condition) {
    value = 1;
}
console.log(value);
```

var声明的变量不存在块作用域

```js
for (var i = 0; i < 10; i++) {
    ...
}
console.log(i); // 10
```

ES6引入了块级作用域来控制变量的生命周期，块级作用域存在于

- 函数内部

- 花括号之间

#### let和const的特点

1. 不会变量提升

```js
if (false) {
    let value = 1;
}
console.log(value); // Uncaught ReferenceError: value is not defined
```

2. 重复声明报错

```js
var value = 1;
let value = 2; // Uncaught SyntaxError: Identifier 'value' has already been declared
```

3. 不绑定全局作用域

```js
let value = 1;
console.log(window.value); // undefined
```

4. const相比于let用于声明常量

```js
const data = {
    value: 1
}

// 没有问题
data.value = 2;
data.num = 3;

// 报错
data = {}; // Uncaught TypeError: Assignment to constant variable.
```

5. 临时死区，声明之前访问变量会报错

```js
console.log(typeof value); // Uncaught ReferenceError: value is not defined
let value = 1;
```

js引擎扫描代码时，遇到var声明会提升到作用域顶部，遇到let和const声明会放到临时死区中，访问临时死区中的变量会触发运行时错误，只有执行过变量声明语句后，变量才从临时死区中移出，此时才能访问

```js
var value = "global";

// 例子1
(function() {
    console.log(value); // Uncaught ReferenceError: value is not defined

    let value = 'local';
}());
```

#### 循环中的块级作用域

```js
var funcs = [];
for (var i = 0; i < 3; i++) {
    funcs[i] = function () {
        console.log(i);
    };
}
funcs[0](); // 3

var funcs1 = [];
for (let i = 0; i < 3; i++) {
    funcs1[i] = function () {
        console.log(i);
    };
}
funcs1[0](); // 0
```

显然，用上文提到的特性并不能解释这一现象，实际上for循环中底层存在着特殊的处理逻辑

- 在 for (let i = 0; i < 3; i++) 中，即圆括号之内建立一个隐藏的作用域

- 每次迭代循环时都创建一个新变量，并以之前迭代中同名变量的值将其初始化

```js
var funcs = [];
for (let i = 0; i < 3; i++) {
    funcs[i] = function () {
        console.log(i);
    };
}
funcs[0](); // 0

// 相当于
(let i = 0) {
    funcs[0] = function() {
        console.log(i)
    };
}

(let i = 1) {
    funcs[1] = function() {
        console.log(i)
    };
}

(let i = 2) {
    funcs[2] = function() {
        console.log(i)
    };
};
```

#### 最佳实践

默认使用 const，只有当确实需要改变变量的值的时候才使用 let。这是因为大部分的变量的值在初始化后不应再改变，而预料之外的变量之的改变是很多 bug 的源头