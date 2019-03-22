
/*
 * 辅助方法
 */
var $ = {
    query: function(str){
        return document.querySelectorAll(str)
    },
    confirm: function(title,cb){
        var result = window.confirm(title);
        if(result) cb&&cb()
    }
}
