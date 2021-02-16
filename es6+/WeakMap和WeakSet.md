弱映射和弱集合涉及到垃圾回收机制，如果我们使用对象作为常规 Map 的键或者Set的成员时，那么当 Map 存在时，该对象也将存在。它会占用内存，并不会被回收

#### WeakMap

和 Map 相比， WeakMap 的键必须是对象，不能是原始值

```javascript
let people = { name: "coolFish" };

let weakMap = new WeakMap();

weakMap.set(people, "ok"); // 正常工作（以对象作为键）
weakMap.set("test", "Whoops"); // Error，因为 "test" 不是一个对象
people = null;
```

如果people 只是作为 WeakMap 的键而存在，他们会被从 Map 中自动删除，由于可能存在延迟回收，所以WeakMap不支持迭代以及 keys()，values() 和 entries() 方法

WeakMap用作额外的数据存储，例如我们在处理一个属于另外一个代码的一个对象，并且想存储一些相关的数据，那么这些数据就应该和这个对象共存亡，此时就应该用WeakMap

```javascript
let cache = new Map();
//计算并且记住结果
function process(obj) {
  if (!cache.has(obj)) {
    let result = obj;
    cache.set(obj, result);
  }
  return cache.get(obj);
}

//我们在其他文件使用他时
let obj = {a: 1};
let result1 = process(obj);
let result2 = process(obj);
obj = null;
alert(cache.size); // 1（啊！该对象依然在 cache 中，并占据着内存！）
```

#### WeakSet

- 和Set相比，我们只能向 WeakSet 添加对象而不能是原始值
- 如果某个对象只是作为WeakSet的成员存在，它们会被从Set中自动删除，同样地WeakSet也不支持迭代以及keys()、size()

```javascript
let visitedSet = new WeakSet();

let john = { name: "John" };
let pete = { name: "Pete" };
let mary = { name: "Mary" };

visitedSet.add(john); // John 访问了我们
visitedSet.add(pete); // 然后是 Pete
visitedSet.add(john); // John 再次访问

// visitedSet 现在有两个用户了

// 检查 John 是否来访过？
alert(visitedSet.has(john)); // true

// 检查 Mary 是否来访过？
alert(visitedSet.has(mary)); // false

john = null;

// visitedSet 里将只有pete
```
