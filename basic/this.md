1. 全局下的this

全局或独立函数中，this指向window

```
var a = 5;
let b = 6;

// let定义的变量在window下找不到
this.a; // 5
this.b; // undefined
```

2. 事件函数中，this指向被侦听的对象

```
document.addEventListener('click', e => {
    console.log(this); // document 
});
```

3. 对象中，this指向上下文，即该对象

```
let obj = {
    a: 1,
    b: () => this.a + 1
};
```

4. 类中，this指向该类的实例化对象

5. setInterval、setTimeout、数组的foreach、map等通过桥接模式完成的方法中，this指向window

6. 箭头函数中，this指向与箭头函数外层作用域中的this相同的指向

7. call和apply

修改方法中的this指向，apply与call不同的是可以通过数组传参，会立刻执行该方法

```
let obj1 = {
    a: 1,
    play: function(x, y) {
        this.a += x + y;
        console.log(this.a);
    }
};
let obj2 = {a: 10};

obj1.play.call(obj2, 10, 10); // 30
obj1.play.apply(obj2, [10, 10]); // 30
```

8. bind

修改方法中的this指向，返回一个新函数，不会立刻执行
