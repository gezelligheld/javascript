#### 映射 Map

一个 Map 对象就是一个简单的键值对映射集合，可以按照数据插入时的顺序遍历所有的元素

```js
var sayings = new Map();
sayings.set('dog', 'woof');
sayings.set('cat', 'meow');
sayings.set('elephant', 'toot');
sayings.size; // 3
sayings.get('fox'); // undefined
sayings.has('bird'); // false
sayings.delete('dog');
sayings.has('dog'); // false

// NaN也可以作为键
let myMap = new Map();
myMap.set(NaN, 'not a number');
myMap.get(NaN);

// 迭代
for (let key of myMap.keys()) {
  console.log(key);
}
myMap.forEach(function (value, key) {
  console.log(key + ' = ' + value);
});
```

相比于 object，Map 具有更多的优势

- Object 的键均为 string 类型，在 Map 里键可以是任意类型

- Object 的尺寸需要计算，Map 的尺寸通过 size 属性可以得知

- Map 中的 key 是有序的（插入的顺序），而 Object 的键是无序的

- Map 可以用 for of 或 forEach 遍历，而 Object 要以某种方式获取它的键然后才能迭代

- Map 在频繁增删键值对的场景下性能更好

#### 集合 Set

一组不重复的值的集合，按添加的顺序遍历

```js
var mySet = new Set();
mySet.add(1);
mySet.add('some text');
mySet.add('foo');
mySet.has(1); // true
mySet.delete('foo');
mySet.size; // 2

// 迭代
for (let item of mySet) {
  console.log(item);
}
```

数组和集合可以相互转换，但 Set 对象中的值不重复，所以数组转换为集合时，所有重复值将会被删除

```js
// Set -> Array
Array.from(mySet);
[...mySet2];

// Array -> Set
mySet2 = new Set([1, 2, 3, 4]);
```

相比于数组，Set 有以下优势

- 数组中用于判断元素是否存在的 indexOf 函数效率低下，集合可以使用 has 方法判断

- Set 对象允许根据值删除元素，而数组中必须使用基于下标的 splice 方法

- 数组的 indexOf 方法无法找到 NaN 值

- Set 对象可以去重

#### Map 的键和 Set 的值的等值判断

Map 的键和 Set 的值的等值判断有以下几个原则

- 判断使用与===相似的规则

- -0 和+0 相等

- NaN 与 NaN 是相等的，这一点和===不同
