/**
 * 高亮关键字
 * @param node 节点
 * @param pattern 匹配的正则表达式
 * @param index - 可选。本项目中特定的需求，表示第几组关键词
 * @returns exposeCount - 露出次数
 */
function highlightKeyword(node, pattern, index) {
    var exposeCount = 0;
    if (node.nodeType === 3) {
        var matchResult = node.data.match(pattern);
        if (matchResult) {
            var memoEl = document.createElement('span');
            var highlightEl = document.createElement('span');
            highlightEl.className = 'lvgo-memo-highlight';
            highlightEl.dataset.highlight = 'yes';
            // highlightEl.dataset.highlightMatch = matchResult[0];
            if (index) {
                highlightEl.dataset.highlightIndex = index;
            }
            var matchNode = node.splitText(matchResult.index);
            matchNode.splitText(matchResult[0].length);
            var highlightTextNode = document.createTextNode(matchNode.data);
            highlightEl.appendChild(highlightTextNode);

            memoEl.appendChild(highlightEl);
            var byMemo = document.createElement('span');
            byMemo.className = 'lvgo-by-memo-highlight';
            byMemo.innerText = 'by lvgo memo';
            memoEl.appendChild(byMemo);

            matchNode.parentNode.replaceChild(memoEl, matchNode);
            exposeCount++;
        }
    }
    // 具体条件自己加，这里是基础条件
    else if ((node.nodeType === 1) && !(/script|style/.test(node.tagName.toLowerCase()))) {
        if (node.dataset.highlight === 'yes') {
            if (index == null) {
                return;
            }
            if (node.dataset.highlightIndex === index.toString()) {
                return;
            }
        }
        let childNodes = node.childNodes;
        for (var i = 0; i < childNodes.length; i++) {
            highlightKeyword(childNodes[i], pattern, index);
        }
    }
    return exposeCount;
}


/**
 * @param {String | Array} keywords - 要高亮的关键词或关键词数组
 * @returns {Array}
 */
function hanldeKeyword(keywords) {
    var wordMatchString = '';
    var words = [].concat(keywords);
    words.forEach(item => {
        let transformString = item.replace(/[.[*?+^$|()/]|]|\\/g, '\\$&');
        wordMatchString += `|(${transformString})`;
    });
    wordMatchString = wordMatchString.substring(1);
    // 用于再次高亮与关闭的关键字作为一个整体的匹配正则
    var wholePattern = new RegExp(`^${wordMatchString}$`, 'i');
    // 用于第一次高亮的关键字匹配正则
    var pattern = new RegExp(wordMatchString, 'i');
    return [pattern, wholePattern];
}


/**
 * @param pattern 匹配的正则表达式
 * @param index 关键词的组别，即第几组关键词
 */
function closeHighlight(pattern, index) {
    var highlightNodeList = document.querySelectorAll('[data-highlight=yes]');
    for (var n = 0; n < highlightNodeList.length; n++) {
        const dataset = highlightNodeList[n].dataset;
        // 如果不需要分组或分组了组别不对，则不需要取消
        if (index == null || dataset.highlightIndex !== index.toString()) {
            return;
        }
        if (pattern.test(dataset.highlightMatch)) {
            var parentNode = highlightNodeList[n].parentNode;
            var childNodes = highlightNodeList[n].childNodes;
            var childNodesLen = childNodes.length;
            var nextSibling = highlightNodeList[n].nextSibling;
            for (var k = 0; k < childNodesLen; k++) {
                parentNode.insertBefore(childNodes[0], nextSibling);
            }
            var flagNode = document.createTextNode('');
            parentNode.replaceChild(flagNode, highlightNodeList[n]);
            parentNode.normalize();
        }
    }
}