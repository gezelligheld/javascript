Symbol是一种原始数据类型，表示独一无二的值

```js
const s = Symbol();
console.log(typeof s); // 'symbol'
// Symbol是个函数
console.log(s instanceof Symbol); // false
```

#### 用法

- 接收字符串作为参数

```js
const s1 = Symbol('foo');
console.log(s1); // Symbol(foo)
```

- 接受对象作为参数，会调用对象的toString方法，然后生成symbol

```js
const obj = {
  toString() {
    return 'abc';
  }
};
const sym = Symbol(obj);
console.log(sym); // Symbol(abc)
```

- Symbol的参数只是对当前Symbol值的描述，同样的入参其结果并不相等

```js
console.log(Symbol('a') === Symbol('a')); // false
```

-  Symbol 值不能与其他类型的值进行运算，会报错

```js
var sym = Symbol('My symbol');
console.log("your symbol is " + sym); // TypeError: can't convert symbol to string
```

- Symbol 值可以显式转为字符串

```js
var sym = Symbol('My symbol');

console.log(String(sym)); // 'Symbol(My symbol)'
console.log(sym.toString()); // 'Symbol(My symbol)'
```

- Symbol值可以作为标识符，用于对象的属性名，可以保证不会出现同名的属性

- Symbol值作为对象属性名，不会被遍历到，Object.getOwnPropertySymbols 方法可以获取该对象所有的Symbol属性名

```js
var obj = {};
var a = Symbol('a');
var b = Symbol('b');

obj[a] = 'Hello';
obj[b] = 'World';

var objectSymbols = Object.getOwnPropertySymbols(obj);

console.log(objectSymbols); // [Symbol(a), Symbol(b)]
```

#### 方法

- Symbol.for

要想使用同一个 Symbol 值，可以使用 Symbol.for，它接受一个字符串作为参数，然后搜索有没有以该参数作为名称的 Symbol 值。如果有，就返回这个 Symbol 值，否则就新建并返回一个以该字符串为名称的 Symbol 值

```js
var s1 = Symbol.for('foo');
var s2 = Symbol.for('foo');

console.log(s1 === s2); // true
```

- Symbol.keyFor

该方法返回一个已登记的 Symbol 类型值的 key

```js
var s1 = Symbol.for("foo");
console.log(Symbol.keyFor(s1)); // "foo"
```