#### 生成器函数

声明一个生成器函数，关键字yield将生成器函数内部代码分割成n段，通过调用next方法一段一段执行；生成器函数返回一个迭代器

```ts
function* gen(): Generator<Promise<string>> {
  const result = yield Promise.resolve('123');
  return result;
}
const f = gen();
console.dir(f.next()); // {done: false, value: Promise{<fulfiled>: '123'}}
```

由于存在异步任务，代码到此并没有执行完成，还需要做如下操作

```ts
function* gen(): Generator<Promise<string>> {
  const result = yield Promise.resolve('123');
  return result;
}
const f = gen();
const res = f.next(); // {done: false, value: Promise{<fulfiled>: '123'}}

res.value.then(()  => {
  const subF = f.next();
  console.log(subF); // {done: true, value: undefined}
});
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
  
res.value.then(()  => f.next().value).then(() => f.next().value).then(() => f.next().value).then(() => {
  const data = f.next();
  console.log(data); // {done: true, value: undefined}
});
```

#### co模块

co模块用于生成器函数的自执行，大概实现如下

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
            }
            catch (e) {
                // 一旦有错误就reject
                reject(e);
            }
            next(r);
        }

        function onRejected(res) {
            let r;
            try {
                r = gen.throw(res);
            }
            catch (e) {
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