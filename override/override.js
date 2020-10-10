console.log("this info show of chrome-extension-memo override override.js");

layui.use(['layer', 'form'], function () {
    var layer = layui.layer
        , form = layui.form;
    layer.msg('越来越懂你');
});

chrome.storage.sync.get('memo', function (memo) {
    if (!memo.memo) return;
    memo.memo.forEach((e) => {
            $("#lvgo_memo_table tbody").append($(`
        <tr>
            <td>` + e.date + `</td>
            <td>` + e.title + `</td>
            <td>` + e.memo + `</td>
            <td><a target="_blank" href="`+e.url+`"> ` + e.url + `</a></td>
        </tr>
    `));
        })
});

chrome.storage.sync.get('firstTime', (result) => {
    if (result.firstTime) {
        console.log(result.firstTime)
    }
});