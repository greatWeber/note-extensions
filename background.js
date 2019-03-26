
chrome.runtime.onInstalled.addListener(function(){
    getHistory();

    openPolling();
})
/*
 *获取chrome本地存储
 */
var noteList= [];
var timer = null;
var id = 0;
function getHistory(){
    chrome.storage.local.get(['noteList'], function(result){
        console.log(result)
        if(result.noteList){
            noteList = JSON.parse(result.noteList);
            checkTimeout();
            //renderList(noteList);
        }
    })
}

/*
 * 每隔3小时查询一次，是否过期
 */
function openPolling(){
    console.log('openPolling')
    clearInterval(timer);
    timer = setInterval(function(){
        getHistory();
    },3*3600*1000)
}
/*
 * 检查是否过期
 */
function checkTimeout(){
    var outNum = 0;
    //getHistory();
    var now = new Date().getTime();
    console.log(now);
    noteList.forEach(function(item,i){
        if(parseInt(item.endTime)<now  ){
            //item.state = 2; //已过期
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
    id = new Date().getTime();
    let bgs = ['/images/bg/1.jpg',
                '/images/bg/2.png',
                '/images/bg/3.jpg',
                '/images/bg/4.jpg',
                '/images/bg/5.png',
        ];

    let index =parseInt( Math.random()*bgs.length);

    chrome.notifications.create('note-tip-'+id, {
            type: 'image',
            iconUrl: '/images/notebook-48.png',
            imageUrl: chrome.runtime.getURL(bgs[index]),
            title: title,
            message:des 
         }, function(notificationId) {});
    }

