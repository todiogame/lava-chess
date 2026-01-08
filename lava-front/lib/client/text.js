function format(srcString, lines) {
    var target = "";
    var arr = srcString.split(" ");
    var c = 0;
    var MAX = Math.ceil(srcString.length / lines);
    for (var i = 0, len = arr.length; i < len; i++) {
        var cur = arr[i];
        if (c + cur.length > MAX) {
            target += '\n' + cur;
            c = cur.length;
        }
        else {
            if (target.length > 0)
                target += " ";
            target += cur;
            c += cur.length;
        }
    }
    return target.split('\n');
}

module.exports = { format }