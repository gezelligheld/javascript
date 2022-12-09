# javascript 总结

##### 数据类型

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

##### 变量声明

- var：会将声明提升到当前作用域顶部，初始为 undefined；var 声明的全局变量会绑定到 window 上
- let：具有块级作用域，不会变量提升，也不会绑定到 window 上
- const：用于声明常量，其他特点类似于 let

##### 隐式转换

- 隐式转换类型主要分为三种：引用值转换为原始值（ToPrimitive）、转换为数字（ToNumber）、转换为字符串（ToString）
- 隐式转换复杂的情况主要发生在+和==两种运算符，其他运算符会转为 number 运算。其中==作隐式转换时，类型相同时不作转换，NaN 不与任何值相等；类型不同时，string 和 number 比较时会转换为 number，boolean 会转换为 number，对象会先转换为原始值再比较，特殊的 null == undefined

##### 原型和原型链

函数拥有原型属性 prototype，经过 new 操作符后变成了构造函数，其实例对象的\_\_proto\_\_属性上就有了构造函数原型属性上的方法和属性，实现继承。当存在多种继承关系时，实例对象就会有多个\_\_proto\_\_属性相连，形成一条原型链

new 操作符做了以下操作：创建一个新对象，将对象的\_\_proto\_\_属性指向构造函数的原型属性，并将构造函数中的 this 指向了这个对象

- 相关代码题：实现 new、实现 instanceof

##### 数组

- 类数组：具有 length 属性的普通对象，不能直接使用数组方法，通过 Array.from、扩展运算符、Array.prototype.slice.call 可以将其转换为数组
- 遍历方式：for 按下标遍历，空元素也遍历；for in 按属性和下标遍历，空元素不遍历，会遍历原型上所有可枚举属性；for of 遍历含有 Symbol.iterator 属性的对象自身的属性，即可迭代对象
- 字节数组
  - ArrayBuffer：固定长度的二进制数据缓冲区，只读
  - TypedArray：操作 ArrayBuffer，每个元素对应固定的字节数
  - DataView：操作 ArrayBuffer，相比于 TypedArray 更加灵活
- 相关代码题：数组去重、数组扁平化、乱序、各种数组方法实现

##### this

- 默认绑定：全局或独立函数中，浏览器环境下 this 指向 window，严格模式下 指向 undefined；node 环境指向空对象
- 隐式绑定：如果调用位置有上下文对象，就绑定到上下文对象。如果上下文中的对象作为参数传递或命名了别名再调用，隐式绑定丢失，应用默认绑定
- 显式绑定：使用 call、apply、bind 绑定
- 其他：new 操作符将构造函数中的 this 指向实例对象；事件回调中的 this 指向事件侦听的对象；箭头函数中的 this 指向由上一层作用域决定

##### 作用域

作用域用来确定当前变量的作用范围，js 采用的是词法作用域（静态作用域），在定义的时候作用域已经决定了

##### 闭包

闭包是指外部函数执行完后，内部函数依然保持对外部函数中某个变量的引用，一般用于创建一个私有变量。实际上，外部函数执行完其执行上下文也随之销毁，但内部函数执行时作用域链上保持了对外部函数活动对象的引用，所以仍然可以访问到这个变量

##### 继承

- 类式继承：将子类原型属性指向父类的实例对象，问题在于，如果子类实例修改了原型属性会影响其他子类实例，而且父类过早实例化无法动态传参
- 构造函数继承：实例化子类时执行父类构造函数，将父类构造函数中的 this 指向子类实例，并传递参数，问题在于无法共享子类原型的属性和方法
- 组合继承：将类式继承和构造函数继承相结合，兼具了这两者的优点，但问题在于父类构造函数被调用了两次，而且类式继承的缺点仍然存在
- 原型继承：将一个空的中间类的原型属性指向父类原型属性，然后子类原型属性指向中间类的实例对象，这样每次实例化子类时，都会重新实例化一个中间类，解决了子类实例修改了原型属性还是会影响其他子类实例的问题
- 寄生继承：原型继承与工厂模式的结合。首先通过 Object.create 基于父类原型创建一个对象，类似空的中间类，然后将其与子类原型通过 Object.assign 合并再赋值给子类原型，同时结合了构造函数继承。需要注意的是，Object.assign 只能合并可枚举属性，可借助 Reflect 实现
- 相关代码题：实现寄生继承

##### 执行上下文

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

- 流程

  1. 解析器将 js 代码通过词法分析解析为词法单元，再通过语法分析将词法单元解析为抽象语法树 ast
  2. 解释器将 ast 解析为字节码并执行
  3. 执行过程中如果遇到出现频次较高的代码，编译器会将其直接转为机器码，当再次遇到相同的代码时直接执行机器码，用来提高执行效率

- 优化

  - 引入字节码：直接将 js 编译成机器码执行虽然执行速度快，但是占用空间大、编译时间长。字节码是一种类汇编语言，不和 CPU 关联，可以节省空间和减少编译时间
  - 隐藏类：v8 会对对象创建一个隐藏类，隐藏类记录了对象属性相对于对象在内存中的偏移量，查找对象时就可以直接读取，提高了查找效率
  - 延迟解析：只有立刻执行的函数被解析生成 AST 和字节码，其他函数等到执行的时候才会被解析
  - 快慢属性：当对象属性过多或多次删除添加对象属性时，V8 就会将线性的存储模式（快属性）降级为非线性的字典存储模式（慢属性），提高修改对象属性的速度
  - 内联缓存：当函数反复执行时，v8 会为函数维护一个反馈向量，记录了对象的隐藏类等信息，提升查找效率

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
- 相关代码题：generator 自执行、基于 generator 封装 async await

##### Promise

- 对异步链式调用处理，避免回调地狱问题，Promise 包含 3 种状态：初始状态（pending）、已兑现（fulfilled）、已拒绝（rejected）。Promise 并不是惰性的，创建后就会执行
- 常用 api
  - Promise.resolve：转换为状态是 fulfilled 的 Promise 对象
  - Promise.reject：转换为状态是 rejected 的 Promise 对象
  - Promise.finally：无论 fulfilled 还是 rejected 状态都会触发
  - Promise.all：同时发起多个 Promise，只要有一个 Promise 失败就会进入 catch
  - Promise.any：同时发起多个 Promise，只要有一个 Promise 成功就会进入 then
  - Promise.allSettled：同时发起多个 Promise，无论是 fulfilled 还是 rejected 状态，返回所有 Promise 的结果
  - Promise.race：同时发起多个 Promise，哪个先处理完成就返回哪个
- 相关代码题：实现 Promise 类、Promise.all、Promise.race

##### 模块加载方案

- amd：require.js 对模块定义的规范化产出，依赖的模块先引入并执行，再执行其他代码，用于浏览器端
- cmd：sea.js 对模块定义的规范化产出，依赖的模块就近异步引入并执行，用于浏览器端
- cjs：依赖的模块就近同步引入并执行，用于服务端。服务端的模块一般都存在本地磁盘，同步加载是比较快的
- esm：依赖的模块先引入并执行，再执行其他代码，用于浏览器端。相比于 cjs，cjs 输出的是值的拷贝，会缓存值，运行时才能生成；而 esm 输出的是值的引用，并不会缓存值，在代码未运行之前就可以生成，可以用来 tree shaking

##### 其他

- 防抖节流：防抖是指事件触发的 n 秒后执行回调，如果 n 秒内再次触发了事件，则重新计时；节流是指事件触发的 n 秒后执行回调，如果 n 秒内再次触发了事件，则只执行一次
- 深浅拷贝
- MV\* 模式
  - MVC：通过 Controller 接收 View 操作，传递给 Model，再由 Model 驱动 View 更新，缺点在于 Model 和 View 存在较大的耦合
  - MVP：Presenter 接受 View 操作并调用 Model，Model 只处理与业务无关的逻辑，View 需要抽象出 View Inferface 方便 Presenter 和 View 解耦。View 是被动视图，不再主动监听数据变化
  - MVVM：ViewModel 靠数据绑定将 View 和 Model 关联起来，相当于简化了 Presenter 的功能，View 是被动视图，Model 处理与业务无关的数据。Vue 就是典型的 MVVM 框架，内部实现了 ViewModel 的功能

##### 面向对象编程

面向对象编程将问题抽象成具体的对象，通过将不同对象组合来构建系统

- 特点
  - 封装：隐藏对象内部实现的复杂性，只公开简单的接口方便调用
  - 继承：便于功能扩展，提高复用性
  - 多态：子类可以重写父类方法，提高通用性
- 原则
  - 单一职责：一个类只负责一种工作
  - 开放封闭：对拓展开放，对修改封闭
  - 里氏替换：子类可以替换父类出现的地方，替换后不存在行为上的改变，可以用来检验是否满足继承关系
  - 依赖倒置：高层次的模块不依赖低层次的模块，依赖于抽象而不是具体
  - 接口隔离：不强迫调用方实现一个用不到的接口，保持接口的单一独立

##### 函数式编程

函数式编程通过函数将值转换为抽象单元来构建系统，主要有以下几个概念

- 纯函数：相同的输入会得到相同的输出，无副作用，且不依赖外部状态。副作用是指完成函数主要功能外的其他功能，如发出请求、修改全局变量等
- 柯里化：只接受一部分参数、返回一个接收剩余参数的函数，会将一个多元函数转换为逐步调用的一元函数
- 组合：以管道的形式调用函数，创建一个从右向左的数据流
- 函子：实现了 map 方法的容器类型，map 方法会将值应用到传入的函数中并返回容器类型，方便链式调用和抽象函数运用。函子表示范畴间的映射，范畴在程序中表示对象集合和它们之间的映射关系，映射关系可以用函数来表述
- 应用函子：实现了 apply 方法的容器类型，apply 方法接受一个容器类型并应用当前容器传入的函数，是对函子的拓展。如果传入的函数是一个多元函数，每次 apply 执行后就会降元一次，实现了柯里化的效果
- 单子：实现了 chain 方法的容器类型，chain 方法接受一个函数直接调用，区别于 map 不会嵌套一层容器。如果函数返回的是一个容器类型，使用 map 就会造成容器嵌套，chain 可以展平嵌套的容器

##### 设计模式

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
