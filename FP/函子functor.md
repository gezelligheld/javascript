#### 引入

如下

```js
const finalPrice = number => {
    const doublePrice = number * 2
    const discount = doublePrice * .8
    const price = discount - 50
    return price
}

const result = finalPrice(100)
console.log(result) // => 110
```

使用函数组合提高可读性，消除中间变量，保持point free风格

```js
const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x)

const double = x => x * 2
const discount = x => x * 0.8
const coupon = x => x - 50

const finalPrice = compose(coupon, discount, double)

const result = finalPrice(100)
console.log(result) // => 110
```

可以发现参数100先后被double、discount、coupon调用，像在管道中流动，用数组包装一下改写成以下形式

```js
const finalPrice = number =>
    [number]
        .map(x => x * 2)
        .map(x => x * 0.8)
        .map(x => x - 50);

const result = finalPrice(100)
console.log(result) // => 110
```

可以看到数组只是一个容器而已，我们只是想用数组的map方法，可以创建一个带有map方法的容器，改进如下

```js
const Box = x => ({
    map: f => Box(f(x)),
    log: x => console.log(x)
});

const finalPrice = number =>
    Box(number)
        .map(x => x * 2)
        .map(x => x * 0.8)
        .map(x => x - 50);

const result = finalPrice(100)
console.log(result) // => 110
```

当我们调用容器Box时，将某个值通过函数映射给另一个值，再将结果包裹到一个新的同类型的容器中

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/12/30/16f54757e20082da~tplv-t2oaga2asx-watermark.awebp)

添加fold方法可以获取执行的结果，而且意味着整个函数的结果被return了出来

```js
const Box = x => ({
    map: f => Box(f(x)),
    fold: f => f(x),
});

Box(2)
    .map(x => x + 2)
    .fold(x => x)  // => 4
```

#### 什么是函子

上述容器Box中的map操作，本质上是通过一个函数a -> b将Box(a)映射成了Box(b)

函数在数学上的定义是，假设 A 和 B 是两个集合，若按照某种对应法则，使得 A 的任一元素在 B 中都有唯一的元素和它对应，则称这种对应为从集合 A 到集合 B 的函数

在程序中，boolean类型可以看作是true、false的集合，number是所有实数的集合，所有的集合，以集合为对象，集合之间的映射作为箭头，则构成了一个范畴

如下图，a、b、c表示三个范畴，假定a为string的集合，b为number的集合，c为boolean的集合，可以通过函数g为str => str.length完成字符串范畴到实数范畴的映射，可以通过函数f为number => number >=0 ? true : false完成实数范畴到布尔值范畴的映射

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/12/30/16f54757e2add93e~tplv-t2oaga2asx-watermark.awebp)

函子（functor）是实现了 map 函数并遵守一些特定规则的容器类型，对函数运用进行了抽象

#### 函子的种类

// todo

#### 如何使用函子

函子其实很常见，只是没有意识到而已，示例如下，因为都返回了同样类型的函子，所以可以一直链式调用下去

```js
[1, 2, 3].map(x => x + 1).filter(x => x > 2)

$("#mybtn").css("width","100px").css("height","100px").css("background","red");

Promise.resolve(1).then(x => x + 1).then(x => x.toString())
```

再举一个例子，当发生js错误，尤其是与服务端进行通信时，往往会通过try-catch进行兜底

```js
const getUser = id =>
    [{ id: 1, name: 'Loren' }, { id: 2, name: 'Zora' }]
        .filter(x => x.id === id)[0];

try {
    const result = getUser(4).name;
    console.log(result)
} catch (e) {
    console.log('error', e.message) // => 'TypeError: Cannot read property 'name' of undefined'
}
```

一旦发生了错误，JavaScript 会立即终止执行，并创建导致该问题的函数的调用堆栈跟踪，并保存到 Error 对象中，但是存在以下缺点

- 违反了引用透明原则，抛出异常意味着函数输出有了另一个出口，不能保证单一的返回值

- 有副作用

- 难以和其他函数组合或链接

于是我们要做的是，尽可能错误处理的过程在try中走完，catch只做兜底，类似上述的Box容器，创建Left和Right，Left会跳过map传递的函数，类似Promise的reject和resolve

```js
const Left = x => ({
    map: f => Left(x),
    fold: (f, g) => f(x),
    inspect: () => `Left(${x})`
})

const Right = x => ({
    map: f => Right(f(x)),
    fold: (f, g) => g(x),
    inspect: () => `Right(${x})`
})

const resultLeft = Left(4).map(x => x + 1).map(x => x / 2)
console.log(resultLeft)  // => Left(4)

const resultRight = Right(4).map(x => x + 1).map(x => x / 2)
console.log(resultRight)  // => Right(2.5)
```

改进如下

```js
const getUser = id => {
    const user = [{ id: 1, name: 'Loren' }, { id: 2, name: 'Zora' }]
        .filter(x => x.id === id)[0]
    return user ? Right(user) : Left(null)
}

const result = getUser(4)
    .map(x => x.name)
    .fold(() => 'not found', x => x)

console.log(result) // => not found
```

try-catch也可以用这样的容器包装一下，这样即使catch了也不会打断函数组合

```js
const tryCatch = (f) => {
    try {
        return Right(f())
    } catch (e) {
        return Left(e)
    }
}

const jsonFormat = str => JSON.parse(str)

const app = (str) =>
    tryCatch(() => jsonFormat(str))
        .map(x => x.path)
        .fold(() => 'default path', x => x)

const result = app('{"path":"some path..."}')
console.log(result) // => 'some path...'
```

参考
1. [函数式编程进阶：杰克船长的黑珍珠号](https://juejin.cn/post/6844904034260910094)