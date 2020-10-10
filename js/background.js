console.log("this info show of chrome-extension-memo background.js");

// 记录用户第一次使用的时间，当然，这个如果你想，随时可以删除这个信息
chrome.storage.sync.get('firstTime', (result) => {
    if (!result.firstTime) {
        chrome.storage.sync.set({'firstTime': new Date().toLocaleString()});
    }
});

function addMemo(onClickData) {
    getCurrentTabId(function (tabId) {
        chrome.tabs.get(tabId, function (tabInfo) {
            const tab = tabInfo;
            const memo = [];
            const memoItem = {
                "title": tab.title,
                "date": new Date().toLocaleDateString(),
                "url": tab.url,
                "memo": onClickData.selectionText
            };
            chrome.storage.sync.get('memo', (result) => {
                if (!result.memo) result.memo = memo;
                result.memo.push(memoItem);
                chrome.storage.sync.set(result);
            });
            alert('ok');
        });
    });
}

/**
 * memo 右键菜单
 */
chrome.contextMenus.create({
    title: "新增备忘录",
    onclick: function (onClickData) {
        onClickData.selectionText = '从页面输入框获取';
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

chrome.contextMenus.create({
    title: "新增选中内容至备忘录",
    contexts: ['selection'],
    onclick: function (onClickData) {
        addMemo(onClickData);
    }
});


/**
 * 获取活动的选项卡（当前）
 * @param callback 回调函数
 */
function getCurrentTabId(callback) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        if (callback) callback(tabs.length ? tabs[0].id : null);
    });
}