#### 迭代器

迭代器是一个具有 next 方法， 每次调用 next 都返回一个结果对象{value: any, done: boolean}

```js
function createIterator(items) {
  const i = 0;
  return {
    next: () => {
      const done = i >= items.length;
      const value = done ? undefined : items[i++];
      return {
        done,
        value,
      };
    },
  };
}

const iterator = createIterator([1, 2, 3]);
console.log(iterator.next()); // {done: false, value: 1}
console.log(iterator.next()); // {done: false, value: 2}
console.log(iterator.next()); // {done: false, value: 3}
console.log(iterator.next()); // {done: true, value: undefined}
```

使用以下方式判断是否为迭代器

```js
typeof obj.next === 'function';
```

#### for of

一个数据结构只要具有具有 Symbol.iterator 属性，就可以使用 for of 遍历，否则会报错，这个具有 Symbol.iterator 属性的对象称为可迭代对象

```js
const obj = {
  value: 1,
};

// let可省略
for (value of obj) {
  console.log(value); // error：obj is not iterable
}

obj[Symbol.iterator] = function () {
  return createIterator([1, 2, 3]);
};

// 实质上遍历的是Symbol.iterator这个属性
for (value of obj) {
  console.log(value); // 1，2，3
}
```

使用以下方式判断是否为可迭代对象

```js
typeof obj[Symbol.iterator] === 'function';
```

有一些数据结构默认内置了 Symbol.iterator 属性，如数组、Set、Map、类数组对象、Generator 对象、字符串等，可以使用 for of 遍历

##### 模拟实现

使用方法模拟 for of 的行为，对 Symbol.iterator 属性遍历

```js
function forOf(obj, cb) {
  if (typeof obj[Symbol.iterator] !== 'function') {
    throw 'obj is not iterable';
  }
  let res = obj[Symbol.iterator]().next();
  while (!res.done) {
    cb(res);
    res = res.next();
  }
}
```

##### for of 和 for in 的区别

- for of 只能遍历具有 Symbol.iterator 属性的数据结构

- for in 会遍历该数据结构原型链上所有可枚举的方法和属性，如果不想遍历，可以用 hasOwnProperty 判断

```js
for (let key in myObject) {
　　if（myObject.hasOwnProperty(key)){
　　　　console.log(key);
　　}
}
```

#### 内建迭代器

ES6 为数组、Map、Set 集合内建了以下三种迭代器

- entries() 返回一个遍历器对象，用来遍历[键名, 键值]组成的数组。对于数组，键名就是索引值

- keys() 返回一个遍历器对象，用来遍历所有的键名

- values() 返回一个遍历器对象，用来遍历所有的键值

```js
// 数组
const arr = ['red', 'green', 'black'];

for (let val of arr.values()) {
  console.log(val); // 依次输出red,green,black
}

for (let key of arr.keys()) {
  console.log(key); // 依次输出0,1,2
}

for (let item of arr.entries()) {
  console.log(item); // 依次输出[0, 'red'],[1, 'green'],[2, 'black']
}

// Set
const set = new Set(['red', 'green', 'black']);

for (let val of set.values()) {
  console.log(val); // 依次输出red,green,black
}

for (let key of set.keys()) {
  console.log(key); // 依次输出red,green,black
}

for (let item of set.entries()) {
  console.log(item); // 依次输出['red','red'],['green','green'],['black','black']
}

// Map
const map = new Map([
  ['key1', 'value1'],
  ['key2', 'value2'],
]);

for (let val of map.values()) {
  console.log(val); // 依次输出value1, value2
}

for (let key of map.keys()) {
  console.log(key); // 依次输出key1, key2
}

for (let item of map.entries()) {
  console.log(item); // 依次输出['key1', 'value1'], ['key2', 'value2']
}
```

> Set 这种数据类型键名和键值是相同的
