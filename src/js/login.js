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

  var randomUserId;
  // console.log('randomUserId: ', typeof randomUserId);

  var locale = RongSeal.locale[common.lang],
    localeData = locale.data;

  var roomDom = getDomById('roomId'),
    // userDom = getDomById('userId'),
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
      for (var i = 0; i < list.length; i++) {
        if (list[i].value === resolution) {
          list[i].checked = true;
        }
      }
    }
  };

  var checkRTCValue = function () {
    var isRoomIdEmpty = !roomDom.value;
    var isValid = true;
    var prompt = '';
    if (isRoomIdEmpty) {
      prompt = localeData.roomIdEmpty;
      isValid = false;
    }
    if (!utils.isNumberAndLetter(roomDom.value)) {
      prompt = localeData.roomIdIllegal;
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
      // userId = userDom.value,
      userId = randomUserId,
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
    var clear = function () {
      common.UI.backLoginPage();
      RongSeal.videoTimer.stop();
      RongSeal.userStreams.clearUsers();
      RongSeal.destroyRongRTCPage();
    };
    //30s前网络嗅探并重新连接
    var total = 30, count = 0, isRTCError = false;
    var EventName = RongSeal.EventName;
    RongSeal.eventEmitter.on(EventName.NETWORK_ERROR, function () {
      isRTCError = true;
      clear();
    });
    var reconnect = function () {
      RongSeal.im.reconnect({
        success: function () {
          var isRTCShow = getDomById('RongRTC').style.display === 'block' ? true : false;
          if (!isRTCShow) {
            getDomById('RongRTC').style.display = 'block';
          }
        },
        error: function () {
          count++;
          console.log('count: ', count);
          if (count >= total || isRTCError) {
            console.log('back login');
            clear();
            return;
          }
          reconnect();
        }
      })
    };
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
        option.token = user.token;
        console.log('user', user);
        RongSeal.startRTC(option);
        Cache.set(StorageKeys.RoomId, option.roomId);
        Cache.set(StorageKeys.Resolution, common.reFormatResolution(resolution))
      },
      backLoginPage: function () {
        reconnectionMechanism();
        // 隐藏 rtc, 展示 login
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
    randomUserId = new Date().getTime().toString();
    common.getIMToken({
      id: randomUserId
    }).then(function (user) {
      connect(user);
    }, function (error) {
      console.log(error)
      sealAlert(localeData.networkError);
      Dom.hideByClass('rong-btn-loading');
      Dom.showByClass('rong-btn-start');
      RongSeal.im.instance().logout();
    });
  };

  var checkRoomIdValue = function () {
    var roomId = roomDom.value;
    if (roomId) {
      startBtnDom.style.background = '#28d6f6';
      startBtnDom.style.border = '#28d6f6';
      startBtnDom.onclick = startRTC;
    } else {
      startBtnDom.style.background = '#475163';
      startBtnDom.style.border = '#475163';
      startBtnDom.onclick = function () { };
      return;
    }
  }

  var pressInput = function (e) {
    if ((e.keyCode || e.which) == 13) {
      startRTC();
    }
  };

  (function init() {
    setDefaultRTCInfo();
    checkRoomIdValue();
    roomDom.onkeyup = checkRoomIdValue;
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