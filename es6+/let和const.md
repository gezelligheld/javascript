#### let

let声明会产生块作用域

```js
//for语句重复声明的i互不影响
for(let i=0;i<10;i++){
    //...
}
console.log(i)//undefined
for(let i=4;i<20;i++){
    //...
}
```

不存在变量提升，导致暂时性死区

```js
//let的块作用域将全局的同名变量遮蔽，又存在暂时性死区，所以会报错
var temp=12;
if(true){
    temp = 13; // error!
    let temp
}
```

#### const

声明常量，不能修改，无法被垃圾回收

```js
const obj={a: 1,b: 2};
obj = null; // 报错
```

#### var、let和const的区别

- var存在提升，我们能在声明之前使用，函数提升优先于变量提升，函数提升会把整个函数挪到作用域顶部，变量提升只会把声明挪到作用域顶部，let、const因为暂时性死区的原因，不能在声明前使用

- var在全局作用域下声明变量会导致变量挂载在window上，其他两者不会

- let和const作用基本一致，但是后者声明的变量不能再次赋值