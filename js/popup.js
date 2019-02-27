//chrome.app.runtime.onLaunched.addListener(function(request){
//    console.log('launched')
//    //getHistory()
//})
(function(){ //立即执行函数
document.addEventListener('DOMContentLoaded', function(){
    main()
})

chrome.runtime.onInstalled.addListener(function(request){
    openPolling();
})

//全局变量
var noteList = [];
var editing = false; //是否编辑中
var $checkboxs ;
var $labels;
var id = 0;
var timer = null;
/*
 * 主函数入口
 */
function main(){
    //var $searchBtn;
    getHistory();
    addNote();
    search();
    opacitions();
}

/*
 *获取chrome本地存储
 */
function getHistory(){
    chrome.storage.local.get(['noteList'], function(result){
        console.log(result)
        if(result.noteList){
            noteList = JSON.parse(result.noteList);
            checkTimeout();
            renderList(noteList);
        }
    })
}

/*
 * 添加备忘录
 */
function addNote(){
    var $addBtn = $.query('.add-btn')[0];
    var $input = $.query('.search-input')[0];

    $addBtn.addEventListener('click', function(){
        var value = $input.value.trim();
        if(!value){
            alert('请输入内容');
            return;
        };
        var timeSpace = 1 * 24*3600*1000; //保存的时间(天)
        noteList.push({
            title: value,
            state: 0 ,  //-1:已删除; 0:未完成; 1:已完成; 2: 已过期
            endTime: new Date().getTime()+timeSpace
        }) 
        
        setHistory()
        renderList()

    })
}

/*
 * 记录备忘录
 */
function setHistory(){
    chrome.storage.local.set({
        noteList: JSON.stringify(noteList)
    }, function(){
        console.log('保存备忘录')
    })
}

/*
 * 搜索列表
 */
function search(){
    var $search = $.query('.search-icon')[0];
    $search.addEventListener('click', function(e){

        var $input = $.query('.search-input')[0];
        var value = $input.value.trim();
        if(!value){
            alert('请输入内容');
            return;
        };
        var searchList = [];
        var reg = new RegExp(value);
        noteList.forEach(function(item,i){
            var reg = new RegExp(value);
            if(item.title.match(reg)){
                searchList.push(item);
            }
        })
        renderList(searchList);

    })
}

/*
 * 每隔3小时查询一次，是否过期
 */
function openPolling(){
    clearInterval(timer);
    timer = setInterval(function(){
        checkTimeout();
    },3*3600*1000)
}
/*
 * 检查是否过期
 */
function checkTimeout(){
    var now = +new Date();
    console.log(now);
    var outNum = 0;
    noteList.forEach(function(item,i){
        if(item.endTime>now){
            item.state = 2; //已过期
            outNum++;
        }
    })
    if(outNum>0){

        notification('提示','你有'+outNum+'个任务过期了，请及时处理')
    }
}

/*
 * 桌面提示
 */
function notification (title,des){
    id++;
    chrome.notifications.create('note-tip-'+id, {
            type: 'basic',
            iconUrl: '/images/notebook-48.png',
            //imageUrl: chrome.runtime.getURL('/images/image.jpg'),
            title: title,
            message:des 
         }, function(notificationId) {});
    //var notification = webkitNotifications.createNotification(
     // '/images/notebook-48.png',  // icon url - can be relative
      //title,  // notification title
      //des  // notification body text
    //);

    //notification.show()
}

/*
 * 渲染列表
 */
function renderList(list){
    var html = '';
    var $List = $.query('.list')[0];
    var state = '';
    var stateClass = '';
    var isHide = editing? '': 'hide';
    list.forEach(function(item,i){
        switch(item.state){
            case 0 :
                state = '未完成';
                stateClass = 'state-unfinished';
            break;
            case 1 :
                state = '已完成';
                stateClass = 'state-finish';
            break;
            case 2 :
                state = '已过期';
                stateClass = 'state-timeout';
            break;
            //case -1 :
            //    state = '已删除';
            //break;
        }
        html+=' <li class="list-item">\
                    <label class="checkbox m-b '+isHide+'" for="checkbox-'+i+'">\
                        <input class="input" type="checkbox" id="checkbox-'+i+'">\
                        <span class="m-b"></span>\
                    </label>\
                    <p class="content ellipsis m-b">'+item.title+'</p>\
                    <span class="state '+stateClass+'">'+state+'</span>\
                </li>';
    });
    
   $List.innerHTML = html; 
   getNode()
}

function opacitions(){
    var $edit = $.query('.edit')[0];
    var $backBox = $.query('.back-box')[0];
    var $back = $.query('.back')[0];
    var $finish = $.query('.finish')[0];
    var $del = $.query('.del')[0];

    //编辑
    $edit.addEventListener('click', function(){
        editing = true;
        this.classList.add('hide');
        $backBox.classList.remove('hide');
        toggleCheckbox('show');
    })


    //返回
    $back.addEventListener('click', function(){
        editing = false;
        $backBox.classList.add('hide');
        $edit.classList.remove('hide');
        toggleCheckbox('hide');
    })

    //完成
    $finish.addEventListener('click', function(){
        $.confirm('是否完成?',function(){

           setListByChecked(1);
           renderList(noteList);
           setHistory();
        })
    })


    //删除
    $del.addEventListener('click', function(){
        $.confirm('是否删除?', function(){

           setListByChecked(-1);
           noteList.forEach(function(item,i){
                if(item.state == -1){
                    noteList.splice(i,1);
                }
           })
           renderList(noteList);
           setHistory();
        })
    })
}

/*
 * 获取节点
 */
function getNode(){
    
    $checkboxs = $.query('.list .input');
    $labels = $.query('.list .checkbox');
}

/*
 * 切换checkbox显示隐藏
 */
function toggleCheckbox(state){
   $labels.forEach(function(item,i){
       if(state==='hide'){

        item.classList.add('hide');
        $checkboxs[i].checked = false;
       }else{
           item.classList.remove('hide');
       }
   }) 
}

/*
 * 遍历列表查找选中的checkbox
 */
function setListByChecked(state){
    $checkboxs.forEach(function(item,i){
        if(item.checked){
            noteList[i].state = state;
        }else{
            noteList[i].state = 0; //默认值
        }
    })
}

})()

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
