
chrome.runtime.onInstalled.addListener(function(){
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
            //checkTimeout();
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
        checkTimeout();
    },3*3600*1000)
}
/*
 * 检查是否过期
 */
function checkTimeout(){
    var outNum = 0;
    getHistory();
    var now = new Date().getTime();
    console.log(now);
    noteList.forEach(function(item,i){
        if(item.endTime<now && item.state == 0){
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
            type: 'image',
            iconUrl: '/images/notebook-48.png',
            imageUrl: chrome.runtime.getURL('/images/image.jpg'),
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

