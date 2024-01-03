Promise 是 js 对于异步方法的实现，解决了回调地狱的问题

一个 Promise 必然处于以下几种状态之一，待定状态的 promise 要么通过一个值被兑现，要么通过一个原因被拒绝。如果一个 promise 已经被兑现（fulfilled）或被拒绝（rejected），那么也可以说它处于已敲定（settled）状态

- 待定（pending）: 初始状态

- 已兑现（fulfilled）: 意味着操作成功完成

- 已拒绝（rejected）: 意味着操作失败

需要注意的是，promise 代表的是已经正在发生的进程，并不是惰性的，换言之 promise 创建后就会立刻执行其中的任务

#### 基本用法

Promise 构造函数接受一个函数作为参数，这个函数有两个参数：resolve 函数和 reject 函数。需要注意的是，Promise 创建的时候就已经开始执行其中的代码了，如果想要惰性求值，可以借助箭头函数() => Promise<any>这样的形式

- resolve 函数：将状态从 pending 变为 fulfilled，异步操作成功时调用
- reject 函数：将状态从 pending 变为 rejected，异步操作失败时调用

使用 then 方法可以指定 resolved 状态和 rejected 状态的回调函数

```js
new Promise(function (resolve, reject) {
  // 成功时执行
  resolve();
  // 失败时执行
  reject();
}).then(
  function () {
    // resolve函数实现
  },
  function () {
    // reject函数实现
  }
);
```

实现 Promise 类

```js
const PROMISE_STATUS = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected',
};

class Promise {
  constructor(fn) {
    this.status = PROMISE_STATUS.PENDING;
    this.value = null;
    this.resolvedCallbacks = [];
    this.rejectedCallbacks = [];

    try {
      fn(this.resolve, this.reject);
    } catch (e) {
      this.reject(e);
    }
  }

  resolve = (value) => {
    if (this.status === PROMISE_STATUS.PENDING) {
      this.status = PROMISE_STATUS.FULFILLED;
      this.value = value;
      this.resolvedCallbacks.each((cb) => {
        cb(value);
      });
    }
  };

  reject = (value) => {
    if (this.status === PROMISE_STATUS.PENDING) {
      this.status = PROMISE_STATUS.REJECTED;
      this.value = value;
      this.rejectedCallbacks.each((cb) => {
        cb(value);
      });
    }
  };

  then = (resolveCallback, rejectCallback) => {
    if (this.status === PROMISE_STATUS.PENDING) {
      this.resolvedCallbacks.push(resolveCallback);
      this.rejectedCallbacks.push(rejectCallback);
    }
    if (this.status === PROMISE_STATUS.FULFILLED) {
      resolveCallback(this.value);
    }
    if (this.status === PROMISE_STATUS.REJECTED) {
      rejectCallback(this.value);
    }
  };
}
```

#### Promise.resolve

转化为 Promise 对象，状态为 fulfilled

```js
Promise.resolve('test');
// 等价于
new Promise((resolve) => resolve('test'));
```

当参数为 Promise 实例，该方法直接返回这个实例；当参数为 thenable（具有 then 方法的对象），该方法会将这个对象转为 Promise 对象， 并执行其中的 then 方法

```js
let thenable = {
  then: (resolve, reject) => {
    console.log(123);
    resolve(40);
  },
};
Promise.resolve(thenable); // 打印输出123
```

#### Promise.reject

转化为 Promise 对象，状态为 rejected

与 Promise.resolve 不同的是，Promise.reject 方法的参数会直接变成 catch 中的参数，具体如下

```js
let thenable = {
  then: (resolve, reject) => {
    resolve('error');
  },
};
Promise.reject(thenable).catch((e) => {
  console.log(e); // 打印输出thenable对象
});
```

#### Promise.finally

实现如下

```js
Promise.finally = callback => {
    return this
        .then(value => Promise.resolve(callback()).then(() => value))
        .catch(e => Promise.resolve(callback()).then(() => {
            throw e;
        });
};
```

#### Promise.all(iterable)

使用 Promise.all 收集多个异步结果，同时发起这些 Promise，返回一个 Promise 对象；如果又一个 Promise 失败，进入 catch，并捕捉第一个失败的 Promise 的结果。参数支持迭代器，如数组、Map、Set、含有 Symbol.iterator 属性的对象等

```js
Promise.all([Promise.resolve(2), Promise.resolve(3)]).then((arr) => {
  console.log(arr); // [2, 3]
});
Promise.all([
  Promise.resolve(2),
  Promise.reject('error'),
  Promise.resolve(3),
]).catch((e) => {
  console.log(e); // 'error'
});
```

实现 Promise.all

```js
Promise.all = (promises) => {
  return new Promise((resolve, reject) => {
    if (!promises.length) {
      return resolve([]);
    }
    let index = 0;
    const res = [];
    function processVal(i, data) {
      res[i] = data;
      if (++index === promises.length) {
        // 全部Promise执行完成
        resolve(res);
      }
    }

    for (let i = 0; i < promises.length; i++) {
      if (!(promises[i] instanceof Promise)) {
        processVal(i, promises[i]);
      } else {
        promises[i]
          .then((data) => {
            processVal(i, data);
          })
          .catch((e) => {
            // 抛出第一个错误的Promise结果
            reject(e);
          });
      }
    }
  });
};
```

#### Promise.allSettled(iterable)

无论是已兑现的还是已拒绝的 promise 都会被看作是已敲定(settled)，在所有 promise 完成后进入 then，返回一个带有成功或失败结果的数组

```js
Promise.allSettled([
  Promise.resolve(3),
  new Promise((resolve, reject) => setTimeout(reject, 100, 'foo')),
]).then((results) => console.log(results)); // [{ status: "fulfilled", value: 3 }, { status: "rejected", reason: "foo" }]
```

#### Promise.race(iterable)

哪个异步操作先返回了结果就先输出哪个

```js
Promise.race([Promise.resolve(2), Promise.resolve(3)]).then((param) => {
  console.log(param); // 2
});
Promise.race([Promise.resolve(2), Promise.reject('error'), Promise.resolve(3)])
  .then((arr) => {
    console.log(arr); // 2，并不会进到catch
  })
  .catch((e) => {
    console.log(e);
  });
```

实现 Promise.race

```js
Promise.race = (promises) => {
  return new Promise((resolve, reject) => {
    for (let i = i; i < promises.length; i++) {
      // 一旦有一个Promise返回结果，立刻执行resolve或reject
      if (!(promises[i] instanceof Promise)) {
        Promise.resolve(promises[i]).then(resolve, reject);
      } else {
        promises[i].then(resolve, reject);
      }
    }
  });
};
```

#### Promise.any(iterable)

与 Promise.all 相反，如果有一个 promise 成功，就进入 then；如果所有 promise 都失败，就进入 catch

```js
const pErr = new Promise((resolve, reject) => {
  reject('总是失败');
});

const pSlow = new Promise((resolve, reject) => {
  setTimeout(resolve, 500, '最终完成');
});

const pFast = new Promise((resolve, reject) => {
  setTimeout(resolve, 100, '很快完成');
});

Promise.any([pErr, pSlow, pFast]).then((value) => {
  console.log(value); // '很快完成'
});
```

#### then

Promise 实例的 then 方法用于 Promise 兑现和拒绝情况的回调函数，返回一个新的 Promise 对象

```js
then(onFulfilled, onRejected);
```

- onFulfilled：Promise 被兑现时调用，返回值作为 then 方法返回的 Promise 对象的兑现值
- onRejected：Promise 被拒绝时调用，返回值作为 then 方法返回的 Promise 对象的拒绝值

> 如果 onFulfilled 和 onRejected 不是一个函数，则内部会被替换为一个恒等函数(x) => x，将值向前传递

总之 onFulfilled 和 onRejected 处理函数之一将被执行，返回的 Promise 状态也可能有三种

- 返回一个值：p 以该返回值作为其兑现值

```js
Promise.resolve().then(() => 2); // Promise {<fulfilled>: 2}
```

- 没有返回任何值：p 以 undefined 作为其兑现值

```js
Promise.resolve().then(() => {}); // Promise {<fulfilled>: undefined}
```

- 抛出一个错误：p 抛出的错误作为其拒绝值

```js
Promise.resolve().then(() => throw 123); // Promise {<rejected>: 123}
```

- 返回一个已兑现的 Promise 对象：p 以该 Promise 的值作为其兑现值

```js
Promise.resolve().then(() => Promise.resolve(123)); // Promise {<fulfilled>: 123}
```

- 返回一个已拒绝的 Promise 对象：p 以该 Promise 的值作为其拒绝值

```js
Promise.resolve().then(() => Promise.reject(123)); // Promise {<rejected>: 123}
```

- 返回另一个待定的 Promise 对象：p 保持待定状态，并在该 Promise 对象被兑现/拒绝后立即以该 Promise 的值作为其兑现/拒绝值

```js
Promise.resolve().then(() => new Promise(() => {})); // Promise {<pending>}
```
