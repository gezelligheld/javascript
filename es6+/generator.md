#### 生成器函数

通过 function\*可以声明一个生成器函数，返回一个 Generator 对象，是一个迭代器对象。调用一个生成器函数并不会马上执行它里面的语句，关键字 yield 将生成器函数内部代码分割成 n 段，通过调用 next 方法一段一段执行

next 方法返回一个含有 value 和 done 属性的对象，next 方法如果传入了参数会传给上一条执行的 yield 语句左边的变量

- value：表示本次 yield 表达式的返回值

- done：表示生成器后续是否还有 yield 语句

当在生成器函数中显式 return 时，会导致生成器立即变为完成状态，如果 return 后面跟了一个值，那么这个值会作为当前调用 next() 方法返回的 value 值

```ts
function* gen(): Generator<Promise<string>> {
  const result = yield Promise.resolve('123');
  return result;
}
const f = gen();
console.log(f.next()); // {done: false, value: Promise{<fulfiled>: '123'}}
console.log(f.next()); // {done: true, value: undefined}
```

如果存在多个异步任务，需要不停的链式调用下去

```ts
function* gen(): Generator<Promise<any>> {
  const result = yield Promise.resolve('123');
  const result1 = yield Promise.resolve(result);
  const result2 = yield Promise.resolve(result1);
  return result2;
}
const f = gen();
const res = f.next();

res.value
  .then(() => f.next().value)
  .then(() => f.next().value)
  .then(() => f.next().value)
  .then(() => {
    const data = f.next();
    console.log(data); // {done: true, value: undefined}
  });
```

生成器对象既是迭代器，也是可迭代对象

```js
let aGeneratorObject = (function* () {
  yield 1;
  yield 2;
  yield 3;
})();

typeof aGeneratorObject.next;
// 返回"function", 因为有一个next方法，所以这是一个迭代器

typeof aGeneratorObject[Symbol.iterator];
// 返回"function", 因为有一个@@iterator方法，所以这是一个可迭代对象
```

yield\*表示将执行权移交给另一个生成器函数，当前生成器暂停执行

```js
function* anotherGenerator(i) {
  yield i + 1;
  yield i + 2;
  yield i + 3;
}
function* generator(i) {
  yield i;
  yield* anotherGenerator(i); // 移交执行权
  yield i + 10;
}
var gen = generator(10);
console.log(gen.next().value); // 10
console.log(gen.next().value); // 11
console.log(gen.next().value); // 12
console.log(gen.next().value); // 13
console.log(gen.next().value); // 20
```

#### co 模块

co 模块用于生成器函数的自执行，大概实现如下

```ts
function isPromise(fn): boolean {
  return typeof fn.then === 'function';
}

function toPromise(fn): Promise {
  if (isPromise(fn)) {
    return fn;
  }
  if (typeof fn === 'function') {
    return new Promise((resolve, reject) => {
      // 非promise的函数注入参数callback，并接收两个参数
      fn((err, res) => {
        if (err) {
          return reject(err);
        }
        return resolve(res);
      });
    });
  }
  return fn;
}

function run(gen: Generator): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof gen === 'function') {
      gen = gen();
    }

    if (!gen || typeof gen.next !== 'function') {
      return resolve(gen);
    }

    onFulfilled();

    function onFulfilled(res) {
      let r;
      try {
        r = gen.next(res);
      } catch (e) {
        // 一旦有错误就reject
        reject(e);
      }
      next(r);
    }

    function onRejected(res) {
      let r;
      try {
        r = gen.throw(res);
      } catch (e) {
        // 一旦有错误就reject
        reject(e);
      }
      next(r);
    }

    function next(res) {
      // 整个生成器函数执行完成后resolve
      if (res.done) {
        return resolve(res.value);
      }
      // 如果不是promise而是个回调函数，转为promise
      const value = toPromise(res.value);
      if (value && isPromise(value)) {
        return value.then(onFulfilled, onRejected);
      }
      return onRejected('type error');
    }
  });
}
```
