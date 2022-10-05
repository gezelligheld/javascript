柯里化（curry）的概念是，只传递给函数一部分参数来调用它，它将返回一个处理剩余参数的函数，如下

```js
var add = function (x) {
  return function (y) {
    return x + y;
  };
};

var increment = add(1);
var addTen = add(10);

increment(2); // 3

addTen(2); // 12
```

柯里化会将一个多元函数转换为一个逐步调用的单元函数

```js
f(a,b,c) → f(a)(b)(c)
```

封装一个较为通用的柯里化函数，返回一个函数接受剩余参数，当参数总数超过 len 时执行原函数

```js
function curry(fn, ...args) {
  // 获取传入的函数的参数长度
  const fnArgLength = fn.length;
  return (...rest) => {
    const allArgs = [...(args || []), ...(rest || [])];
    // 参数不够继续柯里化
    if (fnArgLength < allArgs.length) {
      return curry(fn, ...allArgs);
    } else {
      // 参数够了就执行
      return fn(...allArgs);
    }
  };
}
```

#### 用途

柯里化有点将简单问题复杂化了，降低了通用型，但增加了适用性，如下

```js
function checkByRegExp(regExp, string) {
  return regExp.test(string);
}

checkByRegExp(/^1\d{10}$/, '18642838455'); // 校验电话号码
checkByRegExp(/^1\d{10}$/, '18642838456'); // 校验电话号码

checkByRegExp(/^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/, 'test@163.com'); // 校验邮箱
checkByRegExp(/^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/, 'test@qq.com'); // 校验邮箱
```

使用相同的正则校验了多次，使用起来效率比较低下，可以通过柯里化来不再重复传递固定的正则参数

```js
function checkByRegExp(regExp, string) {
  return regExp.test(string);
}

const fn = curry(checkByRegExp);
const checkPhone = fn(/^1\d{10}$/);
const checkEmail = fn(/^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/);

checkPhone('18642838455');
checkEmail('test@qq.com');
```

再如，获取 list 的 name，正常情况下一个 map 就 ok

```js
let list = [
  {
    name: 'lucy',
    value: 1,
  },
  {
    name: 'jack',
    value: 2,
  },
];
let names = list.map(function (item) {
  return item.name;
});
```

可以通过柯里化使这一过程变得通用，prop 可以反复使用

```js
let prop = curry(function (key, obj) {
  return obj[key];
});
let names = list.map(prop('name'));
```

再如，从一个 replace 中产生新函数，应用于其他场合

```js
const replace = curry((a, b, str) => str.replace(a, b));
const replaceSpaceWith = replace(/\s*/);
const replaceSpaceWithComma = replaceSpaceWith(',');
const replaceSpaceWithDash = replaceSpaceWith('-');
```

总结一下，如果一个函数接收了部分参数具有一定的业务含义需要抽离出来，或者单纯的想要复用这一部分，就可以利用柯里化来实现
