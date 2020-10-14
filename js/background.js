console.log('this info show of chrome-extension-memo background.js \r\n  follow me https://github.com/lvgocc');

// 记录用户第一次使用的时间，当然，这个如果你想，随时可以删除这个信息
chrome.storage.sync.get('firstTime', (result) => {
    if (!result.firstTime) {
        chrome.storage.sync.set({'firstTime': new Date().toLocaleString()});
    }
});

/**
 * 后台请求前端数据
 * @param queryParam 请求参数
 * {type:0,data:{xx:sss}}
 *  type 0 获取当前浏览器滚动条高度
 * @param callback 对结果处理
 */
function connectExtension(queryParam, callback) {
    chrome.tabs.getSelected(null, function (tab) {
        chrome.tabs.sendRequest(tab.id, queryParam, function (response) {
            if (callback) callback(response);
        });
    });
}


function saveMemoToChromeStorage(memoItem) {
    const memo = [];
    chrome.storage.sync.get('memo', (result) => {
        if (!result.memo) result.memo = memo;
        result.memo.push(memoItem);
        chrome.storage.sync.set(result);
    });
    // 通知插件，新增完成。更新页面
    connectExtension({type: 1});
}

/**
 * 增加备忘录
 * @param onClickData 当前选中的内容信息
 */
function addMemo(onClickData) {
    if (!onClickData.pageUrl.startsWith('http')) {
        const memoItem = {
            "title": '新增备忘',
            "date": new Date().toLocaleString(),
            "url": '',
            "memo": onClickData.selectionText,
            "scrollTop": 0
        };
        saveMemoToChromeStorage(memoItem);
    } else {
        connectExtension({type: 0}, (response) => {
            // 通过 getSelected 选择当前活动的 tab 页面，获取 tab 页信息
            chrome.tabs.getSelected(null, (tab) => {
                chrome.tabs.get(tab.id, (tabInfo) => {
                    const memoItem = {
                        "date": new Date().toLocaleString(),
                        "url": tabInfo.url || '',
                        "memo": onClickData.selectionText,
                        "scrollTop": response || 0
                    };
                    saveMemoToChromeStorage(memoItem);
                });
            });
        });
    }
}

/**
 * memo 右键菜单
 */
chrome.contextMenus.create({
    title: "新增备忘内容",
    onclick: function (onClickData) {
        let memo = prompt('新增备忘内容', '输入要记录的内容');
        if (!memo) return;
        onClickData.selectionText = memo;
        addMemo(onClickData);
    }
});

/*
title: '使用Baidu搜索：“%s”',
    contexts: ['selection'],
    onclick: function (params) {
        chrome.tabs.create(
            {url: 'https://www.baidu.com/s?ie=utf-8&wd=' + encodeURI(params.selectionText)}
        );
    }
 */
//
// chrome.contextMenus.create({
//     title: "添加选中内容至备忘录",
//     contexts: ['selection'],
//     onclick: function (onClickData) {
//         addMemo(onClickData);
//     }
// });


/**
 * 监听扩展图标单击事件
 */
chrome.browserAction.onClicked.addListener(function (tab) {
    // 在該 chrome tabs 上執行 contentScript.js 這隻檔案
    // chrome.tabs.executeScript(null, { file: 'contentScript.bundle.js' });
    chrome.tabs.create(
        {url: 'chrome-extension://acikidmnacdkgfallhcflnbgkflefmdh/override/override.html'}
    );
});

/**
 * 长连接
 */
chrome.extension.onConnect.addListener(function (port) {
    // console.log('port.name = ' + port.name);
    port.onMessage.addListener(function (msg) {
        // console.log('msg = ' + msg);
        // 发送消息
        port.postMessage('连接成功。。。。');
    });
});