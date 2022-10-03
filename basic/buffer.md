#### ArrayBuffer

ArrayBuffer 对象用来表示通用的、固定长度的原始二进制数据缓冲区，是一个字节数组；只读，不能直接操作 ArrayBuffer 的内容，而是要通过 TypedArray 和 DataView 来操作

> 类似 NodeJs 中的 Buffer

```js
// 创建一个长度为 8 的 ArrayBuffer ，开辟一个8 个字节的缓冲区，也就是 64 位二进制
const buffer = new ArrayBuffer(8);

console.log(buffer.byteLength); // 8
```

#### TypedArray

通过 TypedArray 来操作 ArrayBuffer 的实例，有很多[具体实现](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)，如 Int8Array、Unint8Array 等

```js
// 创建8个字节长度的缓存冲
const buffer = new ArrayBuffer(8);
// 将buffer转化为Uint8Array，Uint8Array中每一个元素表示一个字节（8位）
const uint8Array = new Uint8Array(buffer);
console.log(uint8Array); // [0, 0, 0, 0,0, 0, 0, 0]
console.log(uint8Array.length); // 8

// 将buffer转化为Uint16Array，Uint16Array中每一个元素表示两个字节（16位）
const uint16Array = new Uint16Array(buffer);
console.log(uint16Array); // [0, 0, 0, 0]
console.log(uint16Array.length); // 4
```

#### DataView

相较于 TypedArray，DataView 对于 ArrayBuffer 的操作更加灵活。使用 TypedArray 操作 ArrayBuffer 时每个元素都对应固定的字节数，而 DataView 可以从 ArrayBuffer 中自由读取

```js
// 创建8个字节长度的缓存冲
const buffer = new ArrayBuffer(8);

// 根据传入的buffer 从第一个字节开始，并且字节长度为匹配buffer的长度
const dataView = new DataView(buffer);
// 将DataView中第一个字节设置为十进制的1
dataView.setUint8(0, 1);
dataView.getUint8(0); // 1
dataView.getUint16(0); // 258
// 偏移量为2个字节，设置后16位大小为256（也就是设置第三个字节和第四个字节大小和为256）
dataView.setUint16(2, 256);
```

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d8e1e9ba6df444ff9af293d7e307eb25~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp?)

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/61af256498f64f2fb168ca3b2bb9bfaf~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp?)

#### Blob

表示一个不可变、原始数据的类文件对象，可以按文本或二进制的格式进行读取，通过 FileReader 可以读取 Blob 内容

```js
const buffer = new ArrayBuffer(8);
// 传入ArrayBuffer创建blob
const bufferToBlob = new Blob([buffer]);
```

File 继承于 Blob，拥有 Blob 的所有功能的同时扩展了一系列关于文件的属性

#### Object URL

将 Blob 和 File 对象用作图像、二进制数据下载链接等的 URL 源，使用 URL.createObjectURL 创建，返回一个格式为 blob:\<origin>/\<uuid>的 DOMString

```js
const name = JSON.stringify({
  name: '19QIngfeng',
});
// 传入DOMString创建blob
const blob = new Blob([name], {
  type: 'application/json',
});
// 创建 Object Url
const url = URL.createObjectURL(blob);
const aLink = document.createElement('a');
aLink.href = url;
aLink.download = 'name.json';
aLink.dispatchEvent(new MouseEvent('click'));
// 下载完成后，释放 URL.createObjectURL() 创建的 URL 对象。
URL.revokeObjectURL(url);
```

#### 总结

相互关系如下

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/11022bad363a4473bc303c3aaf5b01ed~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp?)
