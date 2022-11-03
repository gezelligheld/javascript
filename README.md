# javascript 总结

- basic 基础
- deep 深入
- es6+ es6+特性
- regexp 正则
- example 例子
- OOP 面向对象编程
- FP 函数式编程
- DP 设计模式

#### 知识点

##### 数据类型（number、string、boolean、object、symbol、bigInt、null、undefined）

- number：64 位二进制存储，其中有 52 位表示精度，最大安全整数 2^53 - 1，会存在精度缺失的问题，可以将小数转为整数计算
- string：每个字符 16 位二进制存储
- boolean
- null
- undefined
- symbol：唯一标识
- object
- bigInt：提供了一种表示大于 2^53 - 1 的整数的方式

##### 类型检测

- typeof：无法区分 null 以及数组、RegExp、Date 等对象
- instanceof：判断对象是否为某个类的实例，或者描述为，构造函数的原型属性能否在对象的原型链中找到
- Object.prototype.toString.call
- ===

##### 变量声明（let、const、var）

- var：会将声明提升到当前作用域顶部，初始为 undefined；var 声明的全局变量会绑定到 window 上
- let：具有块级作用域，不会变量提升，也不会绑定到 window 上
- const：用于声明常量，其他特点类似于 let

##### 隐式转换

- 隐式转换类型主要分为三种：引用值转换为原始值（ToPrimitive）、转换为数字（ToNumber）、转换为字符串（ToString）
- 隐式转换主要发生在+和==两种运算符，其他运算符会转为 number 运算。其中==作隐式转换时，类型相同时不作转换，NaN 不与任何值相等；类型不同时，string 和 number 比较时会转换为 number，boolean 会转换为 number，对象会先转换为原始值再比较，特殊的 null == undefined

##### 原型和原型链（构造函数、prototype、\_\_proto\_\_、constructor）

函数拥有原型属性 prototype，经过 new 操作符后变成了构造函数，其实例对象的\_\_proto\_\_属性上就有了构造函数原型属性上的方法和属性，实现继承。当存在多种继承关系时，实例对象就会有多个\_\_proto\_\_属性相连，形成一条原型链

new 操作符做了以下操作：创建一个新对象，将对象的\_\_proto\_\_属性指向构造函数的原型属性，并将构造函数中的 this 指向了这个对象

##### 数组（数组方法、类数组、类型化数组，遍历数组 for、for of、for in、扁平化、去重）

- 遍历方式：for 按下标遍历，空元素也遍历；for in 按属性和下标遍历，空元素不遍历，会遍历原型上所有可枚举属性；for of 遍历含有 Symbol.iterator 属性的对象自身的属性，即可迭代对象

##### this（默认绑定，隐式绑定，显式绑定，new，绑定例外）

- 默认绑定：全局或独立函数中，浏览器环境下 this 指向 window，严格模式下 指向 undefined；node 环境指向空对象
- 隐式绑定：如果调用位置有上下文对象，就绑定到上下文对象。如果上下文中的对象作为参数传递或命名了别名再调用，隐式绑定丢失，应用默认绑定
- 显式绑定：使用 call、apply、bind 绑定
- 其他：new 操作符将构造函数中的 this 指向实例对象；事件回调中的 this 指向事件侦听的对象；箭头函数中的 this 指向由上一层作用域决定

##### 作用域

作用域用来确定当前变量的作用范围，js 采用的是词法作用域（静态作用域），在定义的时候作用域已经决定了

##### 闭包

闭包是指外部函数执行完后，内部函数依然保持对外部函数中某个变量的引用，一般用于创建一个私有变量。实际上，外部函数执行完其执行上下文也随之销毁，但内部函数执行时作用域链上保持了对外部函数活动对象的引用，所以仍然可以访问到这个变量

##### 继承（类式继承、构造函数继承、组合继承、原型继承、寄生继承）

- 类式继承：将子类原型属性指向父类的实例对象，问题在于，如果子类实例修改了原型属性会影响其他子类实例，而且父类过早实例化无法动态传参
- 构造函数继承：实例化子类时执行父类构造函数，将父类构造函数中的 this 指向子类实例，并传递参数，问题在于无法共享子类原型的属性和方法
- 组合继承：将类式继承和构造函数继承相结合，兼具了这两者的优点，但问题在于父类构造函数被调用了两次，而且类式继承的缺点仍然存在
- 原型继承：将一个空的中间类的原型属性指向父类原型属性，然后子类原型属性指向中间类的实例对象，这样每次实例化子类时，都会重新实例化一个中间类，解决了子类实例修改了原型属性还是会影响其他子类实例的问题
- 寄生继承：原型继承与工厂模式的结合。首先通过 Object.create 基于父类原型创建一个对象，类似空的中间类，然后将其与子类原型通过 Object.assign 合并再赋值给子类原型，同时结合了构造函数继承。需要注意的是，Object.assign 只能合并可枚举属性，可借助 Reflect 实现

##### 执行上下文（执行上下文栈、变量对象、this、作用域链、全局上下文、函数上下文、临时上下文）

当 js 执行一段可执行的代码时，会创建执行上下文，其中包括了变量对象、this、作用域链，并创建一个执行上下文栈来管理执行上下文

- 执行一段代码时，进入全局首先创建全局执行上下文，压入执行上下文栈，全局上下文的变量对象就是全局对象 window

- 遇到函数时创建函数执行上下文栈并压入执行上下文栈，创建活动对象，未执行函数前的变量对象是不能访问其内部的属性的；创建作用域链，当前作用域链的最前端就是正在执行的这个函数的变量对象，当查找变量时，会先从当前执行上下文的变量对象查找，如果没有就从上一层执行上下文的变量对象中查找，直到全局；创建了 this，也就是说 this 指向是在函数调用创建执行上下文的时候确定的

- 当函数执行完毕后，弹出执行上下文栈，活动对象也随之销毁；全局上下文始终存在，直到应用程序退出

##### 内存机制（栈内存，堆内存 老生代、新生代，内存生命周期，垃圾回收算法 引用计数、增量标记）

对象存储在堆内存中，其余简单数据类型存储在栈内存中，栈内存还承担了创建和切换执行上下文的工作，所以没有保存对象这样复杂的数据类型。

在声明变量时 js 会自动分配内存，栈内存中当前函数执行完成后栈顶的空间会自动释放，而堆内存分为了新生代内存和老生代内存

- 新生代内存是临时分配的内存，新生代又分为 from 和 to 两部分，from 是正在使用的内存，to 是闲置的内存，当垃圾回收时，将 from 部分存活的对象顺序放到 to 中，当检查完毕后 to 变成了正在使用的内存，from 闲置，这样是为了整理内存碎片

- 新生代内存中回收多次依然存在的内存进入老生代内存，老生代内存是常驻内存，当垃圾回收时分为标记和清除两个阶段，标记所有对象将被引用的对象取消标记，将其余的清除，清除会使得内存不连续（内存碎片），需要将存活的对象向一端靠拢清除内存碎片

垃圾回收是一个比较耗时的过程，会阻塞 js 引擎线程，这里将垃圾回收任务拆成一小部分一小部分地执行，类似 react 的调度机制

##### 编译原理

- 流程：首先将 js 代码通过词法分析解析为词法单元，再通过语法分析将词法单元解析为抽象语法树 ast，将 ast 解析为字节码，直接解析为机器码代码体积太大了，然后一边解释一边编译，由解释器逐行解析为字节码并执行。执行过程中，如果遇到出现频次较高的代码，编译器会将其直接转为机器码，当再次遇到相同的代码时直接执行机器码，用来提高执行效率

- 优化：v8 引擎从引入字节码、隐藏类、延迟解析、快慢属性、内联缓存等方式来提升执行效率

##### 正则（量词，匹配优先、忽略优先，修饰符，零宽断言，捕获）

- 匹配优先：在量词的作用下会尽可能多的匹配字符，如果没有匹配成功且后面还有其他正则表达式，会依次交还字符，直到匹配成功
- 忽略优先：在量词的作用下会尽可能少的匹配字符，如果没有匹配成功且后面还有其他正则表达式，会依次尝试匹配，直到匹配成功

##### 集合和映射（Set、Map、WeakSet、WeakMap，使用场景）

- Map：映射，相比于 object，它的键可以是任何类型的值，有序且有长度，在频繁增删键值对的情况下性能更好
- Set：集合，相比于 array，它在增删查的情况下性能更好
- WeakMap 和 WeakSet：键只能是对象，当这个对象仅作为它们的键使用时会被垃圾回收掉，由于垃圾回收的时机不确定，它们不支持被遍历

##### 迭代器和可迭代对象、generator、async await

- 迭代器是一个返回 next 方法的函数，next 方法每次执行会返回一个含有 value 和 done 属性的对象；可迭代对象是含有 Symbol.iterator 属性的对象，可以用 for of 遍历
- async await 是 generator 的语法糖，可以自执行并且返回 Promise

##### Promise（all、allSettled、race、any，实现）

##### 模块加载方案（amd、cmd、commonjs、esm，amd&cmd，commonjs&cmd，esm&commonjs）

- amd：require.js 对模块定义的规范化产出，依赖的模块先引入并执行，再执行其他代码，用于浏览器端
- cmd：sea.js 对模块定义的规范化产出，依赖的模块就近异步引入并执行，用于浏览器端
- cjs：依赖的模块就近同步引入并执行，用于服务端。服务端的模块一般都存在本地磁盘，同步加载是比较快的
- esm：依赖的模块先引入并执行，再执行其他代码，用于浏览器端。相比于 cjs，cjs 输出的是值的拷贝，会缓存值，运行时才能生成；而 esm 输出的是值的引用，并不会缓存值，在代码未运行之前就可以生成，可以用来 tree shaking

##### es6 其他（模板字符串、proxy、箭头函数等）

##### 其他（深浅拷贝、私有变量、乱序、防抖和节流、事件总线等）

- 防抖&节流：防抖是指事件触发的 n 秒后执行回调，如果 n 秒内再次触发了事件，则重新计时；节流是指事件触发的 n 秒后执行回调，如果 n 秒内再次触发了事件，则只执行一次

##### 函数式编程（柯里化、组合、函子、应用函子、单子）

- 柯里化：只传递一部分参数，返回一个接收剩余参数的函数
- 组合：以管道的形式调用函数，创建一个从右向左的数据流

##### 设计模式（单例、工厂、抽象工厂、原型、观察者等）

- 观察者模式：目标会维护多个观察者，当目标下的某个状态发生变更时，会通知观察者进行相应的操作。发布订阅模式下目标和观察者模式会解耦，存在一个调度中心去处理
- 单例模式：保证一个类只有一个实例
- 工厂模式：将创建对象的过程单独封装
- 抽象工厂模式：工厂抽象出来用于拓展不同的业务逻辑
- 原型模式：以某个对象作为原型创建另一个对象，从而共享属性和方法，js 就是以原型为基础的语言
- 策略模式：将行为单独封装，用来处理不同场景的逻辑
- 状态模式：将行为封装，行为往往与主体的状态相关联，用来处理不同场景的逻辑
- 代理模式：某些情况下由于种种限制，一个对象不能直接访问另一个对象，需要借助代理来间接访问
- 适配器模式：借助适配器将一个类的的接口转换成期望的接口，方便统一调用和兼容
- 装饰器模式：在不改变对象的基础上对其进行包装和拓展
