console.log("this info show of chrome-extension-memo web_accessible_resources memo.js");


// 监听双击事件
// document.addEventListener("dblclick", doubleClick, true);

// 监听释放鼠标按钮事件
// document.addEventListener("mouseup", mouseUp, true);

// 这里只能做一些基本操作，结合原网站内容做一些基本操作


const host = location.host;

var hosts = localStorage.hosts;

if (hosts) {


    localStorage.pagecount = Number(localStorage.pagecount) + 1;
} else {
    localStorage.pagecount = 1;
}