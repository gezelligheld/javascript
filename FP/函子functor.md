#### 引入

如下

```js
const finalPrice = (number) => {
  const doublePrice = number * 2;
  const discount = doublePrice * 0.8;
  const price = discount - 50;
  return price;
};

const result = finalPrice(100);
console.log(result); // => 110
```

使用函数组合提高可读性，消除中间变量，保持 point free 风格

```js
const compose =
  (...fns) =>
  (x) =>
    fns.reduceRight((v, f) => f(v), x);

const double = (x) => x * 2;
const discount = (x) => x * 0.8;
const coupon = (x) => x - 50;

const finalPrice = compose(coupon, discount, double);

const result = finalPrice(100);
console.log(result); // => 110
```

可以发现参数 100 先后被 double、discount、coupon 调用，像在管道中流动，用数组包装一下改写成以下形式

```js
const finalPrice = (number) =>
  [number]
    .map((x) => x * 2)
    .map((x) => x * 0.8)
    .map((x) => x - 50);

const result = finalPrice(100);
console.log(result); // => 110
```

可以看到数组只是一个容器而已，我们只是想用数组的 map 方法，可以创建一个带有 map 方法的容器，改进如下

```js
const Box = (x) => ({
  map: (f) => Box(f(x)),
  log: (x) => console.log(x),
});

const finalPrice = (number) =>
  Box(number)
    .map((x) => x * 2)
    .map((x) => x * 0.8)
    .map((x) => x - 50);

const result = finalPrice(100);
console.log(result); // => 110
```

当我们调用容器 Box 时，将某个值通过函数映射给另一个值，再将结果包裹到一个新的同类型的容器中

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/12/30/16f54757e20082da~tplv-t2oaga2asx-watermark.awebp)

添加 fold 方法可以获取执行的结果，而且意味着整个函数的结果被 return 了出来

```js
const Box = (x) => ({
  map: (f) => Box(f(x)),
  fold: (f) => f(x),
});

Box(2)
  .map((x) => x + 2)
  .fold((x) => x); // => 4
```

#### 什么是函子

上述容器 Box 中的 map 操作，本质上是通过一个函数 a -> b 将 Box(a)映射成了 Box(b)。函数在数学上的定义是，假设 A 和 B 是两个集合，若按照某种对应法则，使得 A 的任一元素在 B 中都有唯一的元素和它对应，则称这种对应为从集合 A 到集合 B 的函数

在程序中，boolean 类型可以看作是 true、false 的集合，number 是所有实数的集合，所有的集合，以集合为对象，集合之间的映射作为箭头，则构成了一个范畴。范畴是指对象集合及它们之间的态射，在编程中数据类型作为对象，函数作为态射，范畴遵循几个原则

- 必有一个同一态射将一个对象映射到它自身，即当 a 是范畴里的一个对象时，必有一个函数使 a -> a
- 态射是可组合的。a，b，c 是范畴里的对象，f 是态射 a -> b，g 是 b -> c 态射。g(f(x)) 一定与 (g • f)(x) 是等价的
- 组合满足结合律。f • (g • h) 与 (f • g) • h 是等价的

如下图，a、b、c 表示三个范畴，假定 a 为 string 的集合，b 为 number 的集合，c 为 boolean 的集合，可以通过函数 g 为 str => str.length 完成字符串范畴到实数范畴的映射，可以通过函数 f 为 number => number >=0 ? true : false 完成实数范畴到布尔值范畴的映射

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/12/30/16f54757e2add93e~tplv-t2oaga2asx-watermark.awebp)

函子（functor）是实现了 map 函数并遵守一些特定规则的容器类型，对函数运用进行了抽象，map 函数会遍历对象中的每个值并生成一个新的对象。函子表示范畴间的映射

#### 函子的种类

##### MayBe 函子

对外部的空值情况做处理

```js
class MayBe {
  static of(value) {
    return new MayBe(value);
  }
  constructor(value) {
    this._value = value;
  }
  isNothing() {
    return this._value === null || this._value === undefined;
  }
  map(fn) {
    return this.isNothing() ? MayBe.of(null) : MayBe.of(fn(this._value));
  }
}
const r = MayBe.of('hello world')
  .map((x) => x.toUppercase())
  .map((x) => null)
  .map((x) => x.split(''));
```

##### Either 函子

Either 函子用来处理异常，类似于 if ··· else ··· 的处理。当发生 js 错误，尤其是与服务端进行通信时，往往会通过 try-catch 进行兜底

```js
const getUser = (id) =>
  [
    { id: 1, name: 'Loren' },
    { id: 2, name: 'Zora' },
  ].filter((x) => x.id === id)[0];

try {
  const result = getUser(4).name;
  console.log(result);
} catch (e) {
  console.log('error', e.message); // => 'TypeError: Cannot read property 'name' of undefined'
}
```

一旦发生了错误，JavaScript 会立即终止执行，并创建导致该问题的函数的调用堆栈跟踪，并保存到 Error 对象中，但是存在以下缺点

- 违反了引用透明原则，抛出异常意味着函数输出有了另一个出口，不能保证单一的返回值
- 有副作用
- 难以和其他函数组合或链接

于是我们要做的是，尽可能错误处理的过程在 try 中走完，catch 只做兜底，类似上述的 Box 容器，创建 Left 和 Right，Left 会跳过 map 传递的函数，类似 Promise 的 reject 和 resolve

```js
const Left = (x) => ({
  map: (f) => Left(x),
  fold: (f, g) => f(x),
  inspect: () => `Left(${x})`,
});

const Right = (x) => ({
  map: (f) => Right(f(x)),
  fold: (f, g) => g(x),
  inspect: () => `Right(${x})`,
});

const resultLeft = Left(4)
  .map((x) => x + 1)
  .map((x) => x / 2);
console.log(resultLeft); // => Left(4)

const resultRight = Right(4)
  .map((x) => x + 1)
  .map((x) => x / 2);
console.log(resultRight); // => Right(2.5)
```

改进如下

```js
const getUser = (id) => {
  const user = [
    { id: 1, name: 'Loren' },
    { id: 2, name: 'Zora' },
  ].filter((x) => x.id === id)[0];
  return user ? Right(user) : Left(null);
};

const result = getUser(4)
  .map((x) => x.name)
  .fold(
    () => 'not found',
    (x) => x
  );

console.log(result); // => not found
```

try-catch 也可以用这样的容器包装一下，这样即使 catch 了也不会打断函数组合

```js
const tryCatch = (f) => {
  try {
    return Right(f());
  } catch (e) {
    return Left(e);
  }
};

const jsonFormat = (str) => JSON.parse(str);

const app = (str) =>
  tryCatch(() => jsonFormat(str))
    .map((x) => x.path)
    .fold(
      () => 'default path',
      (x) => x
    );

const result = app('{"path":"some path..."}');
console.log(result); // => 'some path...'
```

上述的 Either 函子也可以用类来表述

```js
class Left {
  static of(value) {
    return new Left(value);
  }
  constructor(value) {
    this._value = value;
  }
  map() {
    return this;
  }
}
class Right {
  static of(value) {
    return new Right(value);
  }
  constructor(value) {
    this._value = value;
  }
  map(fn) {
    return Right.of(fn(this._value));
  }
}
function parseJSON(str) {
  try {
    return Right.of(JSON.parse(str));
  } catch (e) {
    return Left.of({ error: e.message });
  }
}
```

##### IO 函子

IO 函子延迟执行不纯的操作

```js
class IO {
  static of(value) {
    return new IO(() => {
      return value;
    });
  }
  constructor(fn) {
    this._value = fn;
  }
  map(fn) {
    return IO.of(fp.flowRight(fn, this._value));
  }
}
const r = IO.of(process).map((p) => p.execPath);
```

##### Task 函子

用来处理异步操作

##### Pointed 函子

即指向函子，拥有一个 of 函数，可以将一个任何值放入它自身

参考

1. [函数式编程进阶：杰克船长的黑珍珠号](https://juejin.cn/post/6844904034260910094)
2. [函数式编程高阶概念-函子](https://juejin.cn/post/6881967363747971086)
