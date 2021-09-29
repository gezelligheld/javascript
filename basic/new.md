new 运算符创建一个用户定义的对象类型的实例或具有构造函数的内置对象类型之一

```js
class Box {
    constructor() {
        this.a = 1;
    }

    b() {
        return 'b';
    }
}

const b = new Box();
```

new操作之后，实例可以访问到Box.prototype，返回一个新对象，并将Box类中的this指向实例，尝试用一个函数去模拟new操作

```js
function myNew(Constructor, ...args) {
    const obj = {};
    obj.__proto__ = Constructor.prototype;
    Constructor.apply(obj, args);
    return obj;
}
```

