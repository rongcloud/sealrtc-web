(function(win){
  // var WhiteWebSdk;
  var whiteWebSdk = new WhiteWebSdk();
  var hereWhiteConfig = {
    URL: 'https://cloudcapiv4.herewhite.com/room?token=',
    miniToken: 'WHITEcGFydG5lcl9pZD02dFBKT1lzMG52MHFoQzN2Z1BRUXVmN0t0RnVOVGl0bzBhRFAmc2lnPTMyZTRiNTMwNjkyN2RhN2I3NzI4MjMwOTJlZTNmNDJhNWI3MGMyMjU6YWRtaW5JZD0yMTEmcm9sZT1taW5pJmV4cGlyZV90aW1lPTE1ODkzNzY1MjEmYWs9NnRQSk9ZczBudjBxaEMzdmdQUVF1ZjdLdEZ1TlRpdG8wYURQJmNyZWF0ZV90aW1lPTE1NTc4MTk1Njkmbm9uY2U9MTU1NzgxOTU2OTQyNTAw'
  }

  var Room,whiteRoomInfo={};
  var url = hereWhiteConfig.URL + hereWhiteConfig.miniToken;
  var requestInit = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      name: '融云 White Board 房间',
      limit: 100, // 房间人数限制
      mode: 'persistent'
    }),
  };

  var toolsBoxDom = document.getElementById('toolsBox');
  var wordDom = document.getElementById('toolsWord');
  var eraserDom = document.getElementById('toolsEraser');
  var pencilDom = document.getElementById('toolsPencil');
  var clearDom = document.getElementById('toolsClear');
  var newSceneDom = document.getElementById('toolsNewScene');
  var deleteDom = document.getElementById('toolsDelete')
  var pencilColorDom = document.getElementById('pencilColor');
  var colorBoxes = pencilColorDom.getElementsByTagName('span');
  var preSceneDom = document.getElementById('preScene');
  var nextSceneDom = document.getElementById('nextScene');
  var whiteEnum = {
    wbFolderName: '/rtc',
    sceneNamePrefix: 'rongRTCWB'
  }
  var callbacks = {
    onPhaseChanged: function(phase) {
      // 白板发生状态改变, 具体状态如下:
      // "connecting",
      // "connected",
      // "reconnecting",
      // "disconnecting",
      // "disconnected",
      console.log(phase);
    },
    onRoomStateChanged: function(modifyState) {
      if (modifyState.globalState) {
        // globalState 改变了
        var newGlobalState = modifyState.globalState;
        console.log('newGlobalState: ', newGlobalState);
      }
      if (modifyState.memberState) {
        // memberState 改变了
        var newMemberState = modifyState.memberState;
        console.log('newMemberState: ', newMemberState);
      }
      if (modifyState.sceneState) {
        // sceneState 改变了
        var newSceneState = modifyState.sceneState;
        console.log('newSceneState: ', newSceneState);
      }
      if (modifyState.broadcastState) {
        // broadcastState 改变了
        var broadcastState = modifyState.broadcastState;
        console.log('broadcastState: ', broadcastState);
      }
    },
    onDisconnectWithError: function (error) {
      // 出现连接失败后的具体错误
      console.log(error);
    },
  };
  function leaveWBRoom() {
    Room.disconnect();
  }
  function getWhite(isNewWhite,roomInfo,callback, isBystander) {
    if(isNewWhite){
      fetch(url, requestInit).then(function(response) {
        return response.json();
      }).then(function(json) {
        whiteRoomInfo.uuid = json.msg.room.uuid;
        whiteRoomInfo.roomToken = json.msg.roomToken;
        return whiteWebSdk.joinRoom({
          uuid: json.msg.room.uuid,
          roomToken: json.msg.roomToken,
        },callbacks);
      }).then(function(room) {
        room.bindHtmlElement(document.getElementById('whiteboard'));
        callback();
        var folderName = whiteEnum.wbFolderName;
        Room = room;
        var sceneName = createSceneName();
        switchNewScene(folderName, sceneName);
        Room.setMemberState({
          strokeColor: [255,0,0]
        });
      });
    }else {
      whiteWebSdk.joinRoom({
        uuid: roomInfo.uuid,
        roomToken: roomInfo.roomToken
      }).then(function(room){
        room.bindHtmlElement(document.getElementById('whiteboard'));
        Room = room;
        if(isBystander){
          room.disableOperations = true;
          toolsBoxDom.style.display = 'none';
          preSceneDom.style.display = 'none';
          nextSceneDom.style.display = 'none';
          room.setMemberState({
            currentApplianceName: 'selector'
          });
          return ;
        }
        Room.setMemberState({
          strokeColor: [255,0,0]
        });
      });
    }
  }
  pencilDom.onclick = function(e) {
    e.preventDefault();
    var isShow = pencilColorDom.style.display;
    if(isShow === 'block'){
      pencilColorDom.style.display = 'none';
      return;
    }
    pencilColorDom.style.display = 'block';
    Room.setMemberState({
      currentApplianceName: 'pencil'
    });
  }
  wordDom.onclick = function() {
    Room.setMemberState({
      currentApplianceName: 'text'
    });
  }
  eraserDom.onclick = function() {
    Room.setMemberState({
      currentApplianceName: 'eraser'
    });
  }
  clearDom.onclick = function() {
    Room.cleanCurrentScene();
  }
  newSceneDom.onclick = function() {
    var path = whiteEnum.wbFolderName;
    var sceneName = createSceneName();
    Room.putScenes(path,[{name: sceneName.toString()}]);
    var setCurrentPath = path + '/' + sceneName;
    Room.setScenePath(setCurrentPath);
  }
  deleteDom.onclick = function() {
    var scenes = Room.state.sceneState.scenes;
    if(scenes.length == 1){
      Room.cleanCurrentScene();
      return;
    }
    var delPath = Room.state.sceneState.scenePath;
    Room.removeScenes(delPath);
  }
  preSceneDom.onclick = function() {
    console.log(Room.state.sceneState.scenePath);
    var sceneState = Room.state.sceneState;
    var firstSceneName = sceneState.scenes[0].name;
    var currentSceneName = sceneState.scenePath.split('/')[2];
    if(firstSceneName == currentSceneName){
      return;
    }
    sceneState.scenes.forEach(function(item,index) {
      if(currentSceneName == item.name){
        var preSceneName = sceneState.scenes[index-1].name;
        console.log(index,item,preSceneName);
        Room.setScenePath(whiteEnum.wbFolderName+'/'+preSceneName);
      }
    });
  }
  nextSceneDom.onclick = function() {
    var sceneState = Room.state.sceneState;
    var lastSceneName = sceneState.scenes[sceneState.scenes.length-1].name;
    var currentSceneName = sceneState.scenePath.split('/')[2];
    if(lastSceneName == currentSceneName){
      return;
    }
    sceneState.scenes.forEach(function(item,index) {
      if(currentSceneName == item.name){
        var preSceneName = sceneState.scenes[index+1].name;
        console.log(index,item,preSceneName);
        Room.setScenePath(whiteEnum.wbFolderName+'/'+preSceneName);
      }
    });
  }
  function createSceneName() {
    return whiteEnum.sceneNamePrefix + new Date().getTime();
  }
  function setPencilColor(rgb) {
    Room.setMemberState({
      strokeColor: rgb
    });
  }
  function setBoxesColor() {
    for(var i=0;i<colorBoxes.length;i++){
      (function(i){
        colorBoxes[i].onclick = function(e) {
          var color = e.target.className;
          e.stopPropagation();
          pencilColorDom.style.display = 'none';
          switch (color) {
          case 'color-red' :
            return setPencilColor([255,0,0]);
          case 'color-orange' :
            return setPencilColor([255,165,0]);
          case 'color-yellow' :
            return setPencilColor([255,255,0]);
          case 'color-blue' :
            return setPencilColor([0,0,255])
          case 'color-cyan' :
            return setPencilColor([0,255,255])
          case 'color-green' :
            return setPencilColor([0,128,0])
          case 'color-black' :
            return setPencilColor([0,0,0])
          case 'color-purple' :
            return setPencilColor([128,0,128])
          case 'color-gray' :
            return setPencilColor([128,128,128])
          }
        }
      })(i)
    }
  }
  
  setBoxesColor();
  function switchNewScene(folderName,sceneName) {
    Room.putScenes(folderName,[{name: sceneName}]);
    Room.setScenePath(folderName+'/'+sceneName);
  }
  win.RongWB = {
    getWhite: getWhite,
    whiteWebSdk: whiteWebSdk,
    whiteRoomInfo: whiteRoomInfo,
    leaveWBRoom: leaveWBRoom
  };
})(window)

