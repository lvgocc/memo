console.log("this info show of chrome-extension-memo content-script.js");

document.addEventListener('DOMContentLoaded', function () {
    // 注入 memo
    injectMemoJs();
    injectMemoCss();
    injectMemoBlock();
});

// memo js
function injectMemoJs(jsPath) {
    jsPath = jsPath || 'js/memo.js';
    var memoJs = document.createElement('script');
    memoJs.setAttribute('type', 'text/javascript');
    memoJs.src = chrome.extension.getURL(jsPath);
    document.body.appendChild(memoJs);
}

// memo css
function injectMemoCss() {
    if (document.getElementById('lvgo_memo_css')) return;
    var memoBlock = document.createElement('style');
    memoBlock.id = 'lvgo_memo_css';
    (document.head || document.body).appendChild(memoBlock);
}

// memo block
function injectMemoBlock() {
    var memoBlock = document.createElement('div');
    memoBlock.innerHTML = `
		<div id="lvgo_memo_block">
		` + location.host + `
</div>
	`;
    document.body.appendChild(memoBlock);
}