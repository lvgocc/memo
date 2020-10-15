console.log('this info show of chrome-extension-memo override override.js , follow me https://github.com/lvgocc');


// layer.msg('越来越懂你');


/**
 * 翻译
 */
$("#translate-query").on('change keyup paste', () => {
    var queryDom = document.getElementById('translate-query');
    autoGrow(queryDom);
    if (!$("#translate-query").val()) {
        clearTranslateArea();
        queryDom.style.height = "auto";
    }
    setTimeout(() => {
        translate($("#translate-query").val())
    }, 1000)
});

function autoGrow(element) {
    element.style.height = (element.scrollHeight) + "px";
}

/**
 * 清空内容，同时停止搜索
 */
$("#translate_clear").on('click', () => {
    clearTranslateArea()
});

function clearTranslateArea() {
    $("#translate-query").val('');
    $("#translate-result").text('');
}

$("#translate-button").on('click', () => {
    var query = $("#translate-query").val();
    if (query) {
        translate(query);
    } else {
        $("#translate-result").text('')
    }
});


/**
 * 百度翻译 appid
 * @type {string}
 */
var appid = '20201011000586079';
var key = 'Ht5OfmNznN7lLgEBo6OM';

function translate(query) {
    var salt = (new Date).getTime();
// 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
    var from = 'auto';
    var to = 'auto';
    var str1 = appid + query + salt + key;
    var sign = MD5(str1);
    $.ajax({
        url: 'https://api.fanyi.baidu.com/api/trans/vip/translate',
        type: 'post',
        dataType: 'jsonp',
        data: {
            q: query,
            appid: appid,
            salt: salt,
            from: from,
            to: to,
            sign: sign
        },
        success: function (data) {
            var result = data.trans_result;
            if (result && result.length === 1) {
                var resultElement = result[0];
                var $translateResult = $("#translate-result");
                $translateResult.text(resultElement.dst);
                // 更多翻译
                $translateResult.append(`<br><a style="font-size: 14px" target="_blank" href="https://fanyi.baidu.com/#zh/en/${query}">百度翻译 >>></a>`);
            }
        }
    });
}

function memoList(memos) {
    var table = layui.table;
    //第一个实例
    table.render({
        elem: '#memo_table'
        , height: 320
        , cols: [[ //表头
            {field: 'id', title: 'ID', width: 80, hide: true, fixed: 'left'}
            , {field: 'date', title: '添加日期', width: 180, sort: true}
            // , {field: 'title', title: '站点名称', width: 300, sort: true}
            , {field: 'memo', title: '备忘内容', style: 'cursor: pointer;', event: 'jump'}
            // , {field: 'url', title: '站点地址', style: 'cursor: pointer;', width: 400, event: 'jump', sort: true}
            , {
                fixed: 'right',
                title: '操作',
                align: 'center',
                toolbar: '<div><a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="del">删除</a></div>',
                width: 100
            }
        ]],
        data: memos
    });

    //监听工具条
    table.on('tool', function (obj) { // 注：tool 是工具条事件名，test 是 table 原始容器的属性 lay-filter="对应的值"
        var data = obj.data; // 获得当前行数据
        var layEvent = obj.event; // 获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）
        var tr = obj.tr; // 获得当前行 tr 的 DOM 对象（如果有的话）

        if (layEvent === 'detail') { // 查看
            //do somehing
        } else if (layEvent === 'del') { // 删除
            // 删除对应行（tr）的DOM结构，并更新缓存
            obj.del();

            // 向服务端发送删除指令
            deleteMemo(obj.data);
        } else if (layEvent === 'edit') { //编辑
            //do something

            // 同步更新缓存对应的值
            obj.update({
                username: '123'
                , title: 'xxx'
            });
        } else if (layEvent === 'LAYTABLE_TIPS') {
            layer.alert('Hi，头部工具栏扩展的右侧图标。');
        } else if (layEvent === 'jump') {
            chrome.tabs.create(
                {url: obj.data.url}
            );
        }
    });
}

function deleteMemo(m) {
    chrome.storage.sync.get('memo', (result) => {
        if (result.memo) {
            result.memo.splice(jQuery.inArray(m, result.memo), 1);
            chrome.storage.sync.set(result);
        }
    });
}

chrome.storage.sync.onChanged.addListener(ev => {
    $("#lvgo_memo_table tbody").html('');
    var memos = ev.memo.newValue;
    memoList(memos);
});

chrome.storage.sync.get('memo', function (result) {
    if (!result.memo) return;
    memoList(result.memo);
});

chrome.storage.sync.get('firstTime', (result) => {
    if (result.firstTime) {
        console.log(result.firstTime)
    }
});

// 访问历史分析
// chrome.history.search({'text': '', 'maxResults': 200}, (e) => {
//     e.forEach((e, index) => {
//         console.log(index + '- ' + e.visitCount + ':' + e.url)
//     })
// });


function setMemoBg(data) {
    console.dir(data);
    var wallpaper = data.images[0];
    let bingImage = 'https://cn.bing.com' + wallpaper.url;
    var memoBg = document.getElementById('memo-bg');
    memoBg.style.height = $(window).height() + 'px';
    memoBg.style.backgroundImage = "url(" + bingImage + ")";

    let $bingWallpaper = $('#bing-wallpaper-copyright');
    $bingWallpaper.attr('href',wallpaper.copyrightlink);
    $bingWallpaper.text(wallpaper.copyright);

}

// 扩展使用 bing 壁纸 https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1
$.ajax(
    {
        type: 'get',
        url: 'https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1',
        dataType: 'json',
        success: data => {
            setMemoBg(data);
        }
    }
);