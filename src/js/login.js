(function (dependencies) {
  var RongSeal = dependencies.RongSeal,
    utils = RongSeal.utils,
    common = RongSeal.common,
    sealAlert = common.sealAlert,
    Dom = utils.Dom,
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
    RoomId: 'rong-sealv2-roomid'
  };

  var setDefaultRTCInfo = function () {
    var roomId = Cache.get(StorageKeys.RoomId);
    if (roomId) {
      roomDom.value = roomId;
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
      // audioEnable = !closeAudioDom;
    return {
      userId: userId,
      roomId: roomId,
      resolution: resolution,
      videoEnable: videoEnable,
      audioEnable: true
    };
  };

  var connect = function (user) {
    user.navi = Config.NAVI;
    user.appKey = Config.APP_ID;
    RongSeal.im.connect(user, {
      connected: function (/* userId */) {
        var option = getRTCOption();
        option.userId = user.userId;
        console.log('user', user);
        RongSeal.startRTC(option);
        Cache.set(StorageKeys.RoomId, option.roomId);
      }
    });
  };

  var startRTC = function () {
    var checkContent = checkRTCValue();
    if (!checkContent.isValid) {
      return sealAlert(checkContent.prompt);
    }
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