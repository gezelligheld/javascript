#### DOM宽高
- clientHeight、clientWidth

对于元素：内容区+内填充-滚动条的宽高

```js
document.documentElement.clientWidth//可视窗口的宽度
document.documentElement.clientHeight//可视窗口的高度
document.body.clientWidth//body区域的宽度（默认有8px的margin）
document.body,clientHeight//实际内容的高度
```

- offsetWidth、offsetHeight

对于元素：内容区+内填充+边框的宽高（不排除滚动条）

```js
document.documentElement.offsetHeight//整个页面的高度，包括上下margin
document.body.offsetHeight//整个页面的高度，不包括margin
```

- scrollWidth、scrollHeight

对于元素：宽度是内容区+内填充-滚动条的宽度，高度是可能超出可视区域的实际内容+内填充的高度

```js
document.documentElement.scrollHeight//整个页面的高度，包括上下margin
document.body.scrollHeight//实际页面的高度+底部margin
```

#### DOM位置
- clientLeft、clientTop
元素的边框宽度

- offsetLeft、offsetTop
相对于有定位属性的父元素的距离，相当于position的top和left值

- scrollLeft、scrollTop
设置滚动条的位置

```js
document.documentElement.scrollTop//新版本浏览器针对html设置
document.body.scrollTop//老版本浏览器针对body设置
```

#### getBoundingClientRect()
方便获取目标元素的位置信息

```js
var rect=div.getBoundingClientRect()
console.log(rect)//{x:100,y:100,left:134,right:42,top:45,bottom:102,height:104,width:104}
```

其中
- x、y代表距可视窗口的距离
- height、width表示该元素的实际大小padding+margin+border
- left、right、top、bottom表示目标元素的左上顶点和右下顶点相对于可视窗口顶部和左侧的距离
