(function (dependencies) {
  var RongSeal = dependencies.RongSeal,
    utils = RongSeal.utils,
    common = RongSeal.common,
    sealAlert = common.sealAlert,
    Dom = utils.Dom,
    getDomListByName = Dom.getDomListByName,
    getSelectedByName = Dom.getSelectedByName,
    getDomById = Dom.getById,
    Cache = utils.Cache,
    Config = RongSeal.Config;

  var locale = RongSeal.locale[common.lang],
    localeData = locale.data;

  var roomDom = getDomById('roomId'),
    userDom = getDomById('userId'),
    startBtnDom = getDomById('start'),
    inputDomList = Dom.getList('.rong-login-input');
  
  var StorageKeys = {
    RoomId: 'rong-sealv2-roomid',
    Resolution: 'rong-sealv2-resolution'
  };

  var setDefaultRTCInfo = function () {
    var roomId = Cache.get(StorageKeys.RoomId);
    if (roomId) {
      roomDom.value = roomId;
    }
    var resolution = Cache.get(StorageKeys.Resolution);
    if (resolution) {
      var list = getDomListByName('resolution');
      for (var i=0; i< list.length; i++){
        if(list[i].value === resolution){
          list[i].checked = true;
        }
      }
    }
  };

  var checkRTCValue = function () {
    var isRoomIdEmpty = !roomDom.value;
    var isUserIdEmpty = !userDom.value;
    var isValid = true;
    var prompt = '';
    if (isRoomIdEmpty) {
      prompt = localeData.roomIdEmpty;
      isValid = false;
    }
    if (isUserIdEmpty) {
      prompt = localeData.userIdEmpty;
      isValid = false;
    }
    if (utils.isContainsChinese(userDom.value)) {
      prompt = localeData.userIdIllegal;
      isValid = false;
    }
    return {
      isValid: isValid,
      prompt: prompt
    };
  };

  var getRTCOption = function () {
    var resolutionDom = getSelectedByName('resolution'),
      closeVideoDom = getSelectedByName('isCloseVideo');
      // closeAudioDom = getSelectedByName('isCloseAudio');
    var roomId = roomDom.value,
      userId = userDom.value,
      resolution = common.formatResolution(resolutionDom.value), // 格式如: { width: 640, height: 320 }
      videoEnable = !closeVideoDom;
      // console.log(resolutionDom);
      // audioEnable = !closeAudioDom;
    return {
      userId: userId,
      roomId: roomId,
      resolution: resolution,
      videoEnable: videoEnable,
      audioEnable: true
    };
  };

  var reconnectionMechanism = function () {
    //30s前网络嗅探并重新连接
    var total = 30,count = 0;
    var url = RongSeal.Config.TOKEN_URL;
    var reconnect = function () {
      utils.ajax({
        url: url,
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          id: 34
        }),
        success: function () {
          // callback();
          console.log('reconnnect')
        },
        fail: function () {
          if(count >= total) {
            //30s后返回登录页
            console.log('login')
            //login
            return ;
          }
          count++;
          setTimeout(function() {
            reconnect();
          },1000)
        }
      });
    }
    reconnect();
  }

  var connect = function (user) {
    user.navi = Config.NAVI;
    user.appKey = Config.APP_ID;
    RongSeal.im.connect(user, {
      connected: function (/* userId */) {
        var option = getRTCOption();
        console.log(option);
        var resolution = option.resolution;
        option.userId = user.userId;
        console.log('user', user);
        RongSeal.startRTC(option);
        Cache.set(StorageKeys.RoomId, option.roomId);
        Cache.set(StorageKeys.Resolution,common.reFormatResolution(resolution))
      },
      backLoginPage: function(){
        reconnectionMechanism();
        // 隐藏 rtc, 展示 login
        // Dom.hideByClass('rong-rtc');
        // Dom.showByClass('rong-login');
        // Dom.hideByClass('rong-btn-loading');
        // Dom.showByClass('rong-btn-start');
      }
    });
  };

  var startRTC = function () {
    var checkContent = checkRTCValue();
    if (!checkContent.isValid) {
      return sealAlert(checkContent.prompt);
    }
    Dom.hideByClass('rong-btn-start');
    Dom.showByClass('rong-btn-loading');
    common.getIMToken({
      id: userDom.value
    }).then(function (user) {
      connect(user);
    }, function (error) {
      sealAlert(error);
    });
  };
  
  var pressInput = function (e) {
    if ((e.keyCode || e.which) == 13) {
      startRTC();
    }
  };

  (function init() {
    setDefaultRTCInfo();
    startBtnDom.onclick = startRTC;
    utils.forEach(inputDomList, function (dom) {
      dom.onkeydown = pressInput;
    });
    common.setLocale();
  })();
})({
  win: window,
  RongSeal: window.RongSeal,
  globalConfig: window.RongSeal.Config
});