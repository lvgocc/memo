window.addEventListener("message", function (event) {
    if (event.data) {
        var keyword = event.data.keyword;
        window.document.body.innerHTML = 'Hello World'
        var patterns = hanldeKeyword(keyword);
        // 针对body内容进行高亮
        var bodyChildren = window.document.body.childNodes;
        for (var i = 0; i < bodyChildren.length; i++) {
            highlightKeyword(bodyChildren[i], patterns[0]);
        }

    }
}, false);