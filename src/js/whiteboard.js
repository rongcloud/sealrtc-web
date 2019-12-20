(function(win){
  var common = win.RongSeal.common;
  var sealAlert = common.sealAlert;
  var whiteBoardEnum = {
    wbKey: 'rongRTCWhite',
    msgName: 'SealRTC:WhiteBoardInfo'
  }
  var rongWhiteBoard,rongStorage;
  
  function setWBRoomInfo(whiteRoomInfo) {
    var info = JSON.stringify(whiteRoomInfo);
    var key = whiteBoardEnum.wbKey;
    var msg = {
      name: whiteBoardEnum.msgName,
      content: info
    }
    rongStorage.set(key,info,msg).then(function(val){
      console.log('set wb info sss', val);
    }).catch(function(err) {
      console.log('set wb info fff', err)
    });
  }

  function createRongWB() {
    var iframeWin=document.getElementById('rongWhiteboard').contentWindow;
    iframeWin.RongWB.getWhite(true,null,function() {
      setWBRoomInfo(iframeWin.RongWB.whiteRoomInfo);
    });
    console.log(iframeWin.RongWB);
  }

  function joinWBRoom(value,isBystander) {
    var key = whiteBoardEnum.wbKey;
    var iframeWin=document.getElementById('rongWhiteboard').contentWindow;
    var roomInfo = JSON.parse(value[key]);
    iframeWin.RongWB.getWhite(false,roomInfo,function(){},isBystander)
  }
  function destroyWBRoom(){
    rongStorage = win.RongSeal.rongStorage;
    //判断是否最后一人
    return new Promise(function(resolve, reject) {
      rongStorage.get([]).then(function (infos){
        delete infos[whiteBoardEnum.wbKey];
        var rtcPerNum = Object.getOwnPropertyNames(infos);
        if (rtcPerNum.length === 1) {
          //若是 清房间属性
          rongStorage.remove(whiteBoardEnum.wbKey).then(function(val){
            console.log('remove whiteBoard sss',val)
            resolve();
          }).catch(function(err){
            console.log('remove whiteBoard fff',err)
            resolve();
          })
        } else {
          resolve();
        }
      }).catch(function(err){
        console.log('get wb room info fail',err)
        reject();
      })
    })
  }
  function whiteBoardLogic(isBystander) {
    rongStorage = win.RongSeal.rongStorage;
    var key = whiteBoardEnum.wbKey;
    rongWhiteBoard = new common.UI.WhiteBoard();
    var url = './whiteboard/whiteboard.html';
    //获取
    if (isBystander) { 
      rongStorage.get(key).then(function(value){
        if (!value.hasOwnProperty(key)) {
          sealAlert('房间内未创建白板');
        }else {
          rongWhiteBoard.show(url);
          document.getElementById('rongWhiteboard').onload=function(){
            joinWBRoom(value,isBystander);
          }
        }
      })
      return ;
    }
    rongWhiteBoard.show(url);
    document.getElementById('rongWhiteboard').onload=function(){
      rongStorage.get(key).then(function(value){
        if (value.hasOwnProperty(key)) {
          //加入房间
          joinWBRoom(value)
        }else {
          //新建
          createRongWB();
        }
      }).catch(function(err){
        console.log('get wbRoomInfo err',err);
      })
    }
  }

  win.RongSeal.whiteBoard = {
    whiteBoardLogic: whiteBoardLogic,
    destroyWBRoom: destroyWBRoom
  }
})(window)