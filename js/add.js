
(function(){
    var $title,
        $endTime,
        $content,
        $submit;
    
    
    var noteList = [];

    document.addEventListener('DOMContentLoaded', function(){
        main()
    })

    function main(){
        getElem();
        getHistory();
        submitFn();
    }
    
    function getElem(){
        $title = $.query('#title')[0];
        $endTime = $.query('#time')[0];
        $content = $.query('#content')[0];
        $submit = $.query('.submit')[0];
        jQuery('#time').datetimepicker({format: 'yyyy-mm-dd hh:ii'})

    }

    function submitFn(){
        $submit.addEventListener('click', function(){
            
            var title = $title.value;
            console.log($title)
            var endTime = $endTime.value;
            var content = $content.value;
            var pass = valiFormData(title, endTime);
            if(!pass) return;
            
            noteList.push({
                id: new Date().getTime(),
                title: title,
                state: 0,
                content: content,
                endTime: new Date(endTime).getTime()
            });
            console.log(noteList);
            setHistory(function(){
                alert('添加备忘录成功');
                window.close();
            });

        },false)
    }

    function valiFormData(title, endTime){
        var pass = true;
        if(!title){
           pass = false; 
           alert('标题不能为空');
        }else if(!endTime){
            pass = false;
            alert('结束时间不能为空');
        }
        return pass;

    }
    

    /*
     *获取chrome本地存储
     */
    function getHistory(){
        chrome.storage.local.get(['noteList'], function(result){
            console.log(result)
            if(result.noteList){
                noteList = JSON.parse(result.noteList);
                
            }
        })
    }
    /*
     * 记录备忘录
     */
    function setHistory(cb){
        chrome.storage.local.set({
            noteList: JSON.stringify(noteList)
        }, function(){
            console.log('保存备忘录')
            cb&&cb();
        })
    }
})()
