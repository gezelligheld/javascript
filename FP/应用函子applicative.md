#### 引入

如下是一个函子

```js
const Box = (x) => ({
  map: (f) => Box(f(x)),
  fold: (f) => f(x),
});
```

由于 f(x)的执行可能会产生某种副作用，为了妥善处理副作用的前提下保证是纯函数，声明一个惰性盒子，延迟调用。使用时在没有调用 fold 之前，函数都是纯的

```js
const Box = (g) => ({
  map: (f) => Box(() => f(g())),
  fold: (f) => f(g()),
});

const finalPrice = (str) =>
  LazyBox(() => str)
    .map((x) => {
      console.log('str:', str);
      return x;
    }) // 副作用
    .map((x) => x * 2)
    .map((x) => x * 0.8)
    .map((x) => x - 50);

const res = finalPrice(100);
console.log(res); // => { map: [Function: map], fold: [Function: fold] }
const res1 = res.fold((x) => x); // 'str': 100
```

这样做的意义是，将代码中不纯的部分剥离出来统一交给 fold 处理，其余部分保持纯的，保证了核心逻辑是纯的

#### 应用函子（Applicative Functor）

如下，向 Box 容器中传入一个函数

```js
const Box = (x) => ({
  map: (f) => Box(f(x)),
});

const addOne = (x) => x + 1;
Box(addOne);
```

创建一个 apply 方法，可以向 addOne 传递参数

```js
const Box = (x) => ({
  map: (f) => Box(f(x)),
  apply: (o) => o.map(x),
});
Box(addOne).apply(Box(2)); // Box(3)

// 这两者结果是相同的
Box(2).map(addOne) == Box(addOne).apply(Box(2));
```

上述问题可以归结为，将一个函子应用到了另一个函子上，其中 Box(addOne) 就是应用函子

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7e7e69eaece849a1aa24163e3d50bb72~tplv-k3u1fbpfcp-watermark.awebp)

##### 应用函子与柯里化

如下，add 是一个柯里化的相加函数，我们期望将 Box(1)和 Box(2)相加得到 Box(3)，这样显然不行，值都在容器里，不能直接操作

```js
const add = (x) => (y) => x + y;

add(Box(1))(Box(2));
```

可以利用应用函子，然后再继续 apply 其他函子，每 apply 一个函子，相当于把应用函子中注入的柯里化函数降元一次

```js
Box(add).apply(Box(1)).apply(Box(2)); // => Box(3) (得到最终的结果)
```

示例如下

```js
Array.prototype.ap = function (xs) {
  return this.reduce((acc, f) => acc.concat(xs.map(f)), []);
};
const arg1 = [1, 3];
const arg2 = [4, 5];
const add = (x) => (y) => x + y;
const a = [add].ap(arg1); // 降元，[(y) => 1 + y, (y) => 3 + y]
a.ap(arg2); //输出结果， [ 5, 6, 7, 8 ]
```

##### 应用函子和函子的区别和联系

应用函子是函子的拓展

- 函子只能映射一个接收单个参数的函数，是应用了一个函数到被容器包裹的值，如 Box(1).map(x => x + 1)
- 应用函子可以映射一个接收多个参数的函数，是应用了一个被容器包裹的函数到包裹的值，如 Box(x => x + 1).apply(Box(1))

参考:

1. [函数式编程进阶：应用函子](https://juejin.cn/post/6891820537736069134)
