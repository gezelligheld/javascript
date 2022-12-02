#### 引入

如下，通过 compose 获取一个嵌套的对象中的值

```js
const compose =
  (...fns) =>
  (x) =>
    fns.reduceRight((v, f) => f(v), x);
const fn1 = (o) => o.a;
const fn2 = (o) => o.b;
const app = compose(fn1, fn2);

const obj = {
  a: {
    b: '123',
  },
};
const res = app(obj); // '123'
```

但是 obj 的 a 属性可能不存在，我们使用 Either 函子作错误处理，使其能够一直链式调用下去

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

const fromNullable = (x) => (x != null ? Right(x) : Left(null));
const fn1 = (o) => fromNullable(o).map((o) => o.a);
const fn2 = (a) => fromNullable(a).map((a) => a.b);

const obj = {
  a: {
    b: '123',
  },
};
const app = (o) =>
  fn1(o) // Left和Right容器这里用Either表示，这里输出Either(obj)
    .map(fn2); // Either(Either(obj))

const res = app(obj); // Right(Right('123'))
```

但是 Either 容器中的 map 会将之前的结果又套到一层盒子里，结果输出了 Right(Right('123'))而并不是'123'，改正如下，将结果从盒子中取出

```js
const app = (o) =>
  fn1(o)
    .map((a) =>
      fn2(a).fold(
        (b) => b,
        (b) => b
      )
    )
    .fold(
      () => '',
      (b) => b
    );

const res = app(obj); // '123'
```

这意味着包装了几次就需要拆几次，问题在于 map 会将计算的结果重新包装到容器中，有些多余，于是容器中添加一个 flatMap 方法，用途是把一个容器包裹 的函数应用到一个 容器 上，这样后面可以继续保持链式的调用

```js
const Left = (x) => ({
  map: (f) => Left(x),
  fold: (f, g) => f(x),
  inspect: () => `Left(${x})`,
  flatMap: (f) => Left(x),
});

const Right = (x) => ({
  map: (f) => Right(f(x)),
  fold: (f, g) => g(x),
  inspect: () => `Right(${x})`,
  flatMap: (f) => f(x),
});

const app = (o) =>
  fn1(o)
    .flatMap(fn2)
    .fold(
      () => '',
      (b) => b
    );
```

flatMap 与 map 都返回一个容器类型的函数，方便链式调用；区别在于 map 只变换容器内的值，flatMap 直接调用不作包装。flatMap 与 fold 看起来相似，意义却不同，fold 是将结果从容器中取出，无法再继续链式调用

如果一个函子存在 flatMap（一般写作 chain）方法，则这个函子被成为单子（Monad），解决了由 map 带来的嵌套容器的问题，可以展平嵌套数据

#### monad、应用函子、函子的区别

- 函子通过 map 方法应用一个函数到被容器包裹的值
- 应用函子通过 apply 方法应用一个被容器包裹的函数到包裹的值，适用于处理横向、并行的链路，如表单校验，各个字段的验证一般而言没有什么联系
- monad 通过 chain 方法应用一个返回被容器包裹的值的函数到包裹的值，适用于处理纵向、串行的链路，如一个异步函数依赖上一个异步函数的返回才能调用

#### 异步操作中 monad 的应用

如下，采用柯里化处理一个异步请求的成功与否

```js
const getUrl = (url) => (callback) => request(url, callback);
getUrl('/api/list')((err, data) => {
  // ...
});
```

这样一个函数中需要同时处理错误和成功的逻辑，比较混乱，做一下分离，其中(resolve, reject) => {}成为 fork 函数，有两个分支

```js
const getUrl = (url) => (resolve, reject) =>
  request(url, (err, data) => (err ? reject(err) : resolve(data)));
const handleError = (e) => console.log(e);
const handleData = (d) => console.log(JSON.parse(d));
getUrl('/api/list')(handleError, handleData);
```

然后希望将 JSON.parse 与 handleData 组合，handleData 是 fork 函数的一个分支，我们需要用 Task 函子包裹 fork 函数处理异步逻辑，其中 Task 函子中的 fork 类似上述的普通函子中的 fold，会直接执行出入的 callback，map 一直在做函数组合的工作并不实际调用

```js
const Task = fork => ({
    map: f => Task((reject, resolve) =>          // 返回一个新的Task函子，包含新的fork函数
            fork(reject, x => resolve(f(x)))),   // 新的fork会调用上一个fork，其中正确分支经f函数计算后再返回
    fork,
    inspect: () => 'Task(?)'
});

cosnt getRes = getUrl('/api/list');
const app = Task(getRes).map(JSON.parse);
app.fork((e) => console.log(e), json => console.log(json));
```

如果获取数据并 JSON.parse 后还有后续的操作，如下，执行了 writeConfig 函数，该函数返回 Task 函子

```js
const writeConfig = (filepath, contents) =>
  Task((reject, resolve) => {
    fs.writeFile(filepath, contents, (err, _) =>
      err ? reject(err) : resolve(contents)
    );
  });
```

需要借助 monad 将 writeConfig 应用到 app 上，向 Task 方法中添加 chain 方法，接受 Task 函子，并在返回的新的 fork 函数的成功的那个分支进行该函子的执行

```js
const Task = fork => ({
    // ...
    chain: f => Task((reject, resolve) =>
            fork(reject, x => f(x).fork(reject, resolve)));
});

const app = Task(getRes).map(JSON.parse).chain(c => writeConfig('/home', c));
app.fork((e) => console.log(e), () => console.log('write success'));
```

#### monad 与 promise

promise 的调用方式类似与 monad，但并不是 monad，如下，可以看到 promise.then 始终返回 promise，而 monad 可能会返回值、容器包裹的值、嵌套容器包裹的值

```js
const Box = (x) => ({
  map: (f) => Box(f(x)),
  chain: (f) => f(x),
});

const box1 = Box(1); // => Box(1)
const promise1 = Promise.resolve(1); // => Promise(1)

box1.map((x) => x + 1); // => Box(2)
promise1.then((x) => x + 1); // => Promise(2)

box1.chain((x) => Box(x + 1)); // => Box(2)
promise1.then((x) => Promise.resolve(x + 1)); // => Promise(2)

box1.map((x) => Box(x + 1)); // => Box(Box(2))
promise1.then((x) => Promise.resolve(x + 1)); // => Promise(2)

box1.chain((x) => x + 1); // => 2
promise1.then((x) => x + 1); // => Promise(2)
```

参考:

1. [monad 与异步函数](https://juejin.cn/post/6919289567564693518)
2. [图解 Monad](http://www.ruanyifeng.com/blog/2015/07/monad.html)
