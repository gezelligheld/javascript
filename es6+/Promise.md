Promise是js对于异步方法的实现，解决了回调地狱的问题

#### 基本用法

Promise构造函数接受一个函数作为参数，这个函数有两个参数：resolve函数和reject函数

- resolve函数：将状态从pending变为resolved，异步操作成功时调用
- reject函数：将状态从pending变为rejected，异步操作失败时调用

使用then方法可以指定resolved状态和rejected状态的回调函数

```js
new Promise(function(resolve,reject){
    // 成功时执行
    resolve();
    // 失败时执行
    reject();
}).then(function(){
    // resolve函数实现
},function(){
    // reject函数实现
});
```

实现Promise类

```js
const PROMISE_STATUS = {
    PENDING: 'pending',
    RESOLVED: 'resolved',
    REJECTED: 'rejected'
};

class Promise {
    constructor(fn) {
        this.status = PROMISE_STATUS.PENDING;
        this.value = null;
        this.resolvedCallbacks = [];
        this.rejectedCallbacks = [];

        try {
            fn(this.resolve, this.reject);
        }
        catch (e) {
            this.reject(e);
        }
    }

    resolve = value => {
        if (this.status === PROMISE_STATUS.PENDING) {
            this.status = PROMISE_STATUS.RESOLVED;
            this.value = value;
            this.resolvedCallbacks.each(cb => {
                cb(value);
            });
        }
    }

    reject = value => {
        if (this.status === PROMISE_STATUS.REJECTED) {
            this.status = PROMISE_STATUS.REJECTED;
            this.value = value;
            this.resolvedCallbacks.each(cb => {
                cb(value);
            });
        }
    }

    then = (resolveCallback, rejectCallback) => {
        if (this.status === PROMISE_STATUS.PENDING) {
            this.resolvedCallbacks.push(resolveCallback);
            this.rejectedCallbacks.push(rejectCallback);
        }
        if (this.status === PROMISE_STATUS.RESOLVED) {
            resolveCallback(this.value);
        }
        if (this.status === PROMISE_STATUS.REJECTED) {
            rejectCallback(this.value);
        }
    }
}
```

#### Promise.resolve

转化为Promise对象，状态为resolved

```js
Promise.resolve('test');
// 等价于
new Promise(resolve => resolve('test'));
```

- 当参数为Promise实例，该方法直接返回这个实例
- 当参数为thenable（具有then方法的对象），该方法会将这个对象转为Promise对象， 并执行其中的then方法

```js
let thenable = {
    then: (resolve, reject) => {
        console.log(123);
        resolve(40);
    }
};
Promise.resolve(thenable); // 打印输出123
```

#### Promise.reject

转化为Promise对象，状态为rejected

与Promise.resolve不同的是，Promise.reject方法的参数会直接变成catch中的参数，具体如下

```js
let thenable = {
    then: (resolve, reject) => {
        resolve('error');
    }
};
Promise.reject(thenable).catch(e => {
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

#### Promise.all

使用Promise.all收集多个异步结果，同时发起这些Promise，返回一个Promise对象；如果又一个Promise失败，进入catch，并捕捉第一个失败的Promise的结果

```js
Promise.all([Promise.resolve(2), Promise.resolve(3)]).then(arr => {
    console.log(arr); // [2, 3]
});
Promise.all([Promise.resolve(2), Promise.reject('error'), Promise.resolve(3)]).catch(e => {
    console.log(e); // 'error'
});
```

实现Promise.all

```js
Promise.all = promises => {
    return new Promise((resolve, reject) => {
        let index = 0;
        const res = [];
        if (!promises.length) {
            return res;
        }
        else {
            function processVal(i, data) {
                res[i] = data;
                if (++ index === promises.length) {
                    // 全部Promise执行完成
                    resolve(res);
                }
            }

            for (let i = 0; i < promises.length; i ++) {
                if (!(promises[i] instanceof Promise)) {
                    processVal(i, promises[i]);
                }
                else {
                    promises[i]
                        .then(data => {
                            processVal(i, data);
                        })
                        .catch(e => {
                            // 抛出第一个错误的Promise结果
                            reject(e);
                        });
                }
            }
        }
    });
};
```

#### Promise.race

哪个异步操作先返回了结果就先输出哪个

```js
Promise.race([Promise.resolve(2), Promise.resolve(3)]).then(param => {
    console.log(param); // 2
});
Promise.race([Promise.resolve(2), Promise.reject('error'), Promise.resolve(3)]).then(arr => {
    console.log(arr); // 2，并不会进到catch
}).catch(e => {
    console.log(e);
});
```

实现Promise.race

```js
Promise.race = promises => {
    return new Promise((resolve, reject) => {
        for (let i = i; i < promises.length; i ++) {
            // 一旦有一个Promise返回结果，立刻执行resolve或reject
            if (!(promises[i] instanceof Promise)) {
                resolve(promises[i]).then(resolve, reject);
            }
            else {
                promises[i].then(resolve, reject);
            }
        }
    });
}
```