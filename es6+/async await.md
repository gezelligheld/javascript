使用 async 关键字可以声明一个 async 函数，async 函数是 AsyncFunction 构造函数的实例，并且其中允许使用 await 关键字，返回一个 promise。await 表达式会暂停整个 async 函数的执行进程并出让其控制权，只有当其等待的基于 promise 的异步操作被兑现或被拒绝之后才会恢复进程

async await 可以以同步的方式执行异步操作，更为简洁，相比于 Promise 的处理异步的方式，而无需链式调用

```js
async function getProcessedData(url) {
  let v;
  try {
    v = await downloadData(url);
  } catch (e) {
    v = await downloadFallbackData(url);
  }
  // async function 的返回值将被隐式地传递给 Promise.resolve
  return processDataInWorker(v);
}
```

#### 实现 async await

async/await 实际上是对 Generator（生成器）的封装，是一个语法糖。相比于 Generator 有以下不同

- async/await 自带执行器，不需要手动调用 next()就能自动执行下一步
- async 函数返回值是 Promise 对象，而 Generator 返回的是生成器对象
- await 能够返回 Promise 的 resolve/reject 的值

基于以上几点封装 Generator

```js
function async(generator) {
  return new Promise((resolve, reject) => {
    let g;
    if (typeof generator === 'function') {
      g = generator();
    }
    if (!g || typeof g.next !== 'function') {
      resolve(generator);
      return;
    }

    function next(val) {
      try {
        const res = g.next(val);
        if (res.done) {
          resolve(res.value);
          return;
        }
        Promise.resolve(res.value).then(next, reject);
      } catch (e) {
        reject(e);
      }
    }

    next();
  });
}
```
