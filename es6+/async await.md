使用 async 关键字可以声明一个 async 函数，async 函数是 AsyncFunction 构造函数的实例，并且其中允许使用 await 关键字，返回一个 promise。await 表达式会暂停整个 async 函数的执行进程并出让其控制权，只有当其等待的基于 promise 的异步操作被兑现或被拒绝之后才会恢复进程

优点在于可以用一种更简洁的方式写出基于 Promise 的异步行为，而无需刻意地链式调用 promise

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

利用生成器函数实现

```js
function async(generator) {
  return () => {};
}
```
