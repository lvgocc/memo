/**
 * 此处内容在对应打开网页内执行，原则是不破坏原网页内容进行插件扩展。
 *
 * 同时注入内容需要在 manifest 中声明 web_accessible_resources 否则不起作用。
 * 注：如果注入的是 css ，需要放置在 content_scripts - css 下随页面直接加载。否则不生效
 */

console.log('this info show of chrome-extension-memo content-script.js , follow me https://github.com/lvgocc');


function loadScript(scriptUrl, callback) {
    let script = chrome.runtime.getURL(scriptUrl);
    fetch(script).then(function (response) {
        return response.text();
    }).then(function (responseText) {
        // Optional: Set sourceURL so that the debugger can correctly
        // map the source code back to the original script URL.
        responseText += '\n//# sourceURL=' + scriptUrl;
        // eval is normally frowned upon, but we are executing static
        // extension scripts, so that is safe.
        window.eval(responseText);
        callback();
    });
}


function highlightByMemo(e) {
    // Usage:
    loadScript('js/highlight.js', function () {
        console.log(e.memo)
        var patterns = hanldeKeyword(e.memo);
        // 针对body内容进行高亮
        var bodyChildren = window.document.body.childNodes;
        for (var i = 0; i < bodyChildren.length; i++) {
            highlightKeyword(bodyChildren[i], patterns[0]);
        }
    });
}

/**
 * dom 加载完成事件监听
 */
document.addEventListener('DOMContentLoaded', () => {
    // google 的超链接问题
    if (location.host === 'www.google.com') {
        let aHrefs = document.querySelectorAll('.g .rc .yuRUbf a');
        for (let i = 0; i < aHrefs.length; i++) {
            aHrefs[i].setAttribute('target', '_blank');
        }
        console.log('google aHrefs is processed by lvgo memo , follow me https://github.com/lvgocc');
    }
    // 插入 memo 块
    // injectMemoBlock();

    // 通过备忘录点击之后，跳转到备忘位置
    jumpTargetPosition();
});

// memo js
function injectMemoJs(jsPath) {
    var memoJs = document.createElement('script');
    memoJs.setAttribute('type', 'text/javascript');
    memoJs.src = chrome.extension.getURL(jsPath);
    memoJs.onload = function () {
        this.parentNode.removeChild(this);
    };
    (document.head || document.documentElement).appendChild(memoJs);
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


var tipCount = 0;

function showTip(info) {
    info = info || '';
    info += ' 添加成功';
    var ele = document.createElement('div');
    ele.className = 'lvgo-memo-add-success';
    ele.style.top = tipCount * 70 + 20 + 'px';
    ele.innerHTML = `<div>${info}</div>`;
    document.body.appendChild(ele);
    ele.classList.add('animated');
    tipCount++;
    setTimeout(() => {
        ele.style.left = '20px';
        setTimeout(() => {
            ele.style.left = '-800px';
            setTimeout(() => {
                ele.remove();
                tipCount--;
            }, 1000);
        }, 2000)
    }, 0);
}

chrome.extension.onRequest.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        let result;
        if (request) {
            switch (request.type) {
                case 0:
                    result = document.body.scrollTop || document.documentElement.scrollTop;
                    break;
                case 1:
                    showTip();
                    break
            }
        }
        if (sendResponse) sendResponse(result);
    });

/**
 * 通过备忘录点击之后，跳转到备忘位置
 */
function jumpTargetPosition() {
    chrome.storage.sync.get('memo', (result) => {
        if (!result.memo) return;
        result.memo.forEach((e) => {
            if (location.href === e.url) {
                window.scrollTo(0, e.scrollTop);
                // 高亮处理
                highlightByMemo(e);
            }
        })
    });
}


/**
 * 长连接
 */
var port = chrome.extension.connect({name: "knockknock"});
port.postMessage('connection to background');
port.onMessage.addListener(function (msg) {
    // console.log('msg = ' + msg);
});

/**
 * 监听选择内容，增加到备忘录
 */
document.addEventListener('mouseup', (e) => {
    var text;
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection) {
        text = document.selection.createRange().text;
    }
    var element = document.getElementById('selected_memo');
    if (text && text.length > 2) {
        if (element) element.remove();

        var memoBlock = document.createElement('div');
        memoBlock.id = 'selected_memo';
        memoBlock.style.left = e.x + 5 + 'px';
        memoBlock.style.top = e.y + 15 + 'px';
        memoBlock.innerHTML = '添加到备忘录';
        document.body.appendChild(memoBlock);

        memoBlock.addEventListener("click", function () {
            const memoItem = {
                "date": new Date().toLocaleString(),
                "url": location.href,
                "memo": text,
                "scrollTop": document.body.scrollTop || document.documentElement.scrollTop || 0
            };
            saveMemoToChromeStorage(memoItem);
            memoBlock.remove()
        });
    } else {
        setTimeout(() => {
            if (element) element.remove()
        }, 10)
    }
});

function saveMemoToChromeStorage(memoItem) {
    const memo = [];
    chrome.storage.sync.get('memo', (result) => {
        if (!result.memo) result.memo = memo;
        result.memo.push(memoItem);
        chrome.storage.sync.set(result);
    });
    showTip(memoItem.memo)
}
