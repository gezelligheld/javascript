以下这种形式被称为组合（compose），f、g 都是函数，x 是它们之间通过'管道'传递的值，g 先于 f 执行，创建了一个从右向左的数据流

```js
var compose = function (f, g) {
  return function (x) {
    return f(g(x));
  };
};
```

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/9/5/16d00f438a16ebfe~tplv-t2oaga2asx-watermark.awebp)

使用组合可以让代码变得简洁，如下

```js
var toUpperCase = function (x) {
  return x.toUpperCase();
};
var exclaim = function (x) {
  return x + '!';
};

// 不使用compose
var shout = function (x) {
  return exclaim(toUpperCase(x));
};

// compose，从右向左运行
var shout = compose(exclaim, toUpperCase);

shout('send in the clowns'); // SEND IN THE CLOWNS!
```

实现一个通用的 compose 函数

```js
function compose(...fns) {
  if (!fns?.length) {
    return;
  }
  return fns.reduce(
    (pre, cur) =>
      (...args) =>
        pre(cur(...args))
  );
}
```

#### 结合律

结合律意味着不管你是把 g 和 h 分到一组，还是把 f 和 g 分到一组都不重要

```js
(compose(f, compose(g, h)) === compose(compose(f, g), h)) === f(g(h(x))); // true
```

结合律的一大好处是任何一个函数分组都可以被拆开来，然后再以它们自己的组合方式打包在一起

```js
var toUpperCase = function (x) {
  return x.toUpperCase();
};
var exclaim = function (x) {
  return x + '!';
};
var head = function (x) {
  return x[0];
};
var reverse = reduce(function (acc, x) {
  return [x].concat(acc);
}, []);

// 命令式
exclaim(toUpperCase(head(reverse())));

// 面向对象
arr.reverse().head().toUpperCase().log();

// compose
var loudLastUpper = compose(exclaim, toUpperCase, head, reverse);
// 或
var last = compose(head, reverse);
var loudLastUpper = compose(exclaim, toUpperCase, last);
// 或
var last = compose(head, reverse);
var angry = compose(exclaim, toUpperCase);
var loudLastUpper = compose(angry, last);
```

#### pointfree 模式

指的是函数无须提及将要操作的数据是什么样的，一等公民的函数、柯里化（curry）以及组合协作起来非常有助于实现这种模式

如下，这里所做的事情就是通过管道把数据在接受单个参数的函数间传递，利用柯里化可以让函数先接受数据，再操作数据，最后将数据传递给下一个函数

```js
// 非 pointfree，因为提到了数据：word
var snakeCase = function (word) {
  return word.toLowerCase().replace(/\s+/gi, '_');
};

// pointfree
var snakeCase = compose(replace(/\s+/gi, '_'), toLowerCase);
```

此外 pointfree 模式也可以帮忙减少不必要的变量命名，让代码保持简洁和通用

```js
var toUpperCase = function (x) {
  return x.toUpperCase();
};
var head = function (x) {
  return x[0];
};

// 非 pointfree，因为提到了数据：name
var initials = function (name) {
  return name.split(' ').map(compose(toUpperCase, head)).join('. ');
};

// pointfree
var initials = compose(join('. '), map(compose(toUpperCase, head)), split(' '));
initials('hunter stockton thompson');
```

#### debug

如下，一个长长的组合中保错了

```js
var dasherize = compose(
  join('-'),
  toLower,
  split(' '),
  replace(/\s{2,}/gi, ' ')
);

dasherize('The world is a vampire'); // TypeError: Cannot read property 'apply' of undefined
```

利用如下的 trace 函数来追踪，允许我们在某个特定的点观察数据以便 debug

```js
var trace = curry(function (tag, x) {
  console.log(tag, x);
  return x;
});

var dasherize = compose(
  join('-'),
  toLower,
  trace('after split'),
  split(' '),
  replace(/\s{2,}/gi, ' ')
);
// after split [ 'The', 'world', 'is', 'a', 'vampire' ]
```

由此得知传递给下一个要执行的函数 toLower 的是一个数组，以此来进行 debug

#### Hindly Milner 类型签名

可以明确函数的行为和目的，示例如下

```js
//  replace :: Regex -> String -> String -> String
const replace = (reg) => (sub) => (str) => str.replace(reg, sub);

//  map :: (a -> b) -> [a] -> [b]
var map = curry(function (f, xs) {
  return xs.map(f);
});

//  head :: [a] -> a
var head = function (xs) {
  return xs[0];
};
```
