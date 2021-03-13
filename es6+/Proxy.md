用来代理某些操作

- target：所要拦截的目标对象
- handle：用来定制拦截行为

```js
const proxy = new Proxy(target, handle);
```

拦截get和set操作

```js
var proxy = new Proxy({}, {
    get: function(obj, prop) {
        console.log('设置 get 操作')
        return obj[prop];
    },
    set: function(obj, prop, value) {
        console.log('设置 set 操作')
        obj[prop] = value;
    }
});

proxy.time = 35; // 设置 set 操作

console.log(proxy.time); // 设置 get 操作

```

拦截propKey in proxy 操作

```js
var proxy = new Proxy({ _prop: 'foo', prop: 'foo' }, {
    has: function(target, key) {
        if (key[0] === '_') {
            return false;
        }
        return key in target;
    }
});

console.log('_prop' in proxy); // false
```

拦截函数的调用、call 和 apply 操作

```js
const proxy = new Proxy(
    () => '123',
    {
        apply: () => 'apply'
    }
);

proxy(); // 'apply'
```

拦截对象自身属性的读取操作，如Object.getOwnPropertyNames、Object.getOwnPropertySymbols、Object.keys

```js
const target = {
    _bar: 'foo',
    _prop: 'bar',
    prop: 'baz'
};

const proxy = new Proxy(
    target,
    {
        ownKeys: function(target) {
            return Reflect.ownKeys(target).filter(key => !/^_/.test(key));
        }
    }
);

for (let key of Object.keys(target)) {
    console.log(target[key]); // 只输出'baz'
}
```