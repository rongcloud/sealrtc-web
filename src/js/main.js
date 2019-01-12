(function (dependencies) {
  var win = dependencies.win,
    RongRTC = dependencies.RongRTC,
    RongSeal = dependencies.RongSeal,
    RongScreenShare = dependencies.RongScreenShare,
    RongMedia = dependencies.RongMedia,
    globalConfig = dependencies.globalConfig;
  var common = RongSeal.common,
    utils = RongSeal.utils,
    // noop = utils.noop,
    Dom = utils.Dom,
    UI = common.UI,
    StreamBox = UI.StreamBox,
    getDom = Dom.get,
    sealAlert = common.sealAlert,
    getRTCToken = common.getRTCToken;

  var locale = RongSeal.locale[common.lang],
    localeData = locale.data;

  var rongRTC, // RongRTC 实例
    rongRTCRoom, // RongRTC Room 实例
    rongRTCStream, // RongRTC Stream 实例
    streamList, // SteramList(流列表 UI 操作) 实例
    loginUserId,
    whiteBoard = new UI.WhiteBoard(), // 操作白板 UI 的实例
    screenShare = {
      isOpened: false
    };

  var CustomizeMediaType = {
    ScreenShare: 'screen'
  };

  var alertScreenSharePlugin = function () {
    sealAlert(localeData.installPrompt, {
      isShowCancel: true,
      confirmText: localeData.downloadTitle,
      confirmCallback: function () {
        var downloadUrl = win.location.href + 'plugin/screenshare-addon.zip';
        utils.download(downloadUrl);
      }
    });
  };

  var getSelfMedia = function (opt) {
    opt = opt || {};
    var StreamType = rongRTC.StreamType;
    var constraints = {
      video: opt.videoEnable,
      audio: opt.audioEnable
    };
    var type = StreamType.NONE;
    if (opt.videoEnable && opt.audioEnable) {
      type = StreamType.VIDEO_AND_AUDIO
    } else if (opt.videoEnable) {
      type = StreamType.VIDEO;
    } else if (opt.audioEnable) {
      type = StreamType.AUDIO;
    }
    return new Promise(function (resolve, reject) {
      RongMedia.get(constraints).then(function (stream) {
        var user = {
          id: loginUserId,
          stream: {
            mediaStream: stream,
            type: type
          }
        };
        resolve(user);
      }, function (error) {
        reject(error);
      });
    });
  };

  var hangup = function () {
    win.onbeforeunload = utils.noop;
    rongRTCRoom.leave().then(function () {
      win.location.reload();
    }, function () {
      sealAlert(localeData.leftError);
      win.location.reload();
    });
  };

  /* 关闭屏幕共享 */
  var closeScreenShare = function (id) {
    var streamBox = StreamBox.get(id);
    var user = {
      id: id,
      stream: {
        type: CustomizeMediaType.ScreenShare
      }
    };
    rongRTCStream.get(user).then(function (result) {
      var mediaStream = result.stream.mediaStream;
      user.stream.mediaStream = mediaStream;
      return rongRTCStream.unpublish(user);
    }, function () {
      sealAlert('获取屏幕共享流失败');
    }).then(function () {
      streamBox.closeScreenShare();
      screenShare.isOpened = false;
    }, function () {
      sealAlert(localeData.closeScreenError);
    });
  };

  /* 展示屏幕共享 */
  var openScreenShare = function (id) {
    var streamBox = StreamBox.get(id);
    RongScreenShare.check().then(function () {
      return new RongScreenShare.get();
    }, function () {
      alertScreenSharePlugin();
    }).then(function (stream) {
      var user = {
        id: id,
        stream: {
          type: CustomizeMediaType.ScreenShare,
          mediaStream: stream
        }
      };
      stream.oninactive = function () {
        closeScreenShare(id);
      };
      return rongRTCStream.publish(user);
    }, function () {
      sealAlert('获取屏幕共享流失败');
    }).then(function () {
      screenShare.isOpened = true;
      streamBox.openScreenShare();
    }, function () {
      sealAlert('推送失败');
    });
  };

  /**
   * 屏幕共享开关
   * @param {string} id 
   */
  var switchScreenShare = function (id) {
    screenShare.isOpened ? closeScreenShare(id) : openScreenShare(id);
  };

  /* 展示白板 */
  var startWhiteboard = function () {
    var WhiteBoard = rongRTC.WhiteBoard;
    WhiteBoard.create().then(function (wb) {
      whiteBoard.show(wb.url);
    }, function () {
      sealAlert(localeData.getWhiteboardError);
    });
  };

  /**
   * 视频流开关(登录用户操作)
   * @param {string} id 用户id
   */
  var switchVideo = function (id) {
    var user = { id: id };
    var videoStream = rongRTCStream.video.videoStream;
    var streamBox = StreamBox.get(id);
    var isClosed = streamBox.isVideoCloseBySelf();
    if (isClosed) {
      videoStream.enable(user);
      streamBox.openVideoBySelf();
    } else {
      videoStream.disable(user);
      streamBox.closeVideoBySelf();
    }
  };

  /**
   * 音频流开关
   * @param {string} id 用户id
   */
  var switchAudio = function (id) {
    var user = { id: id };
    var audioStream = rongRTCStream.audio.audioStream;
    var streamBox = StreamBox.get(id);
    var isClosed = streamBox.isAudioCloseBySelf();
    if (isClosed) {
      audioStream.unmute(user);
      streamBox.openAudioBySelf()
    } else {
      audioStream.mute(user);
      streamBox.closeAudioBySelf()
    }
  };

  /**
   * 创建用户展示框, 包含绑定点击事件
   * @param {string} id 用户id
   */
  var createStreamBox = function (user) {
    var id = user.id;
    var streamBox = new StreamBox(id, {
      isSelf: id === loginUserId
    });
    var childDom = streamBox.childDom;
    childDom.videoOptBtn.onclick = function (e) {
      switchVideo(id);
      e.stopPropagation();
    };
    childDom.audioOptBtn.onclick = function (e) {
      switchAudio(id);
      e.stopPropagation();
    };
    streamList.add(streamBox);
  };

  /**
   * 删除用户的展示框
   * @param {string} id 用户id
   */
  var removeStreamBox = function (user) {
    var id = user.id;
    var streamBox = StreamBox.get(id);
    streamList.remove(streamBox);
  };

  /**
   * 改变用户资源展示
   * @param {string} id  用户 id
   * @param {int}  mediaType 资源类型
   */
  var changeStreamBox = function (user) {
    var id = user.id,
      mediaType = user.stream.type;
    var StreamType = rongRTC.StreamType;
    var streamBox = StreamBox.get(id);
    switch (mediaType) {
    case StreamType.AUDIO:
      streamBox.closeVideoByOther();
      streamBox.openAudioByOther();
      break;
    case StreamType.VIDEO:
      streamBox.openVideoByOther();
      streamBox.closeAudioByOther();
      break;
    case StreamType.VIDEO_AND_AUDIO:
      streamBox.openVideoByOther();
      streamBox.openAudioByOther();
      break;
    case StreamType.NONE:
      streamBox.closeVideoByOther();
      streamBox.closeAudioByOther();
      break;
    default:
      break;
    }
  };

  /**
   * 更新用户展示的流
   * @param {string} id 
   * @param {mediaStream} mediaStream 流
   * @param {int} mediaType 资源类型
   */
  var updateStreamBox = function (user) {
    var id = user.id,
      mediaType = user.stream.type,
      mediaStream = user.stream.mediaStream;
    var streamBox = StreamBox.get(id);
    streamBox.setStream(mediaStream);
    mediaType && changeStreamBox(user);
  };

  /* 设置房间号展示 */
  var setRoomTitle = function (roomId) {
    var roomDom = Dom.getById('RongRoomTitle');
    roomDom.textContent = localeData.room + ': ' + roomId;
  };

  /* 设置用户名展示 */
  var setUserTitle = function (userName) {
    var userDom = Dom.getById('RongUserTitle');
    userDom.textContent = localeData.user + ': ' + userName;
  };

  /**
   * 展示音视频交互主界面
   * @param {object} params
   * @param {string} params.roomId 房间号
   * @param {string} params.userId 用户id
   * @param {string} params.resolution 分辨率
   */
  var showRTCPage = function (params, events) {
    events = events || {};
    var hangupBtnDom = getDom('.rong-opt-hangup'),
      wbBtnDom = getDom('.rong-opt-wb'),
      shareBtnDom = getDom('.rong-opt-share'),
      wrapDom = getDom('.rong-stream-wrap');
    streamList = new UI.StreamList();
    wrapDom.appendChild(streamList.dom);
    Dom.hide('.rong-login');
    Dom.show('.rong-rtc');
    setRoomTitle(params.roomId);
    setUserTitle(params.userId);
    shareBtnDom.onclick = function () {
      events.switchScreenShare(params.userId);
    };
    wbBtnDom.onclick = events.startWhiteboard;
    hangupBtnDom.onclick = events.hangup;
    win.onbeforeunload = events.hangup;
  };

  var getTokenParams = function (userId) {
    return {
      tokenUrl: globalConfig.TOKEN_URL,
      userId: userId,
      appId: globalConfig.APP_ID
    };
  };

  /**
  * 开始实时音视频
  * @param {object} params
  * @param {string} params.roomId 房间号
  * @param {string} params.userId 用户id
  * @param {string} params.resolution 分辨率
  * @param {boolean} params.videoEnable 是否开启 video
  * @param {boolean} params.audioEnable 是否开启 audio
  */
  var startRTC = function (params) {
    loginUserId = params.userId;
    rongRTC = new RongRTC({
      url: globalConfig.WS_NAV_URL
    });
    rongRTCRoom = new rongRTC.Room({
      roomId: params.roomId,
      joined: createStreamBox,
      left: removeStreamBox
    });
    rongRTCStream = new rongRTC.Stream({
      autoOpen: true,
      // readied: updateStreamBox,
      opened: updateStreamBox,
      // closed: ,
      changed: changeStreamBox
    });
    showRTCPage(params, {
      startWhiteboard: startWhiteboard,
      hangup: hangup,
      switchScreenShare: switchScreenShare
    });

    createStreamBox(loginUserId);

    var tokenParams = getTokenParams(loginUserId);
    getRTCToken(tokenParams).then(function (token) {
      var user = {
        id: params.userId,
        token: token
      };
      return rongRTCRoom.join(user);
    }, function () {
      sealAlert(localeData.getTokenError);
    }).then(function () {
      return getSelfMedia(params);
    }, function () {
      sealAlert(localeData.joinError);
    }).then(function (user) {
      rongRTCStream.publish(user);
      updateStreamBox(user);
    }, function () {
      sealAlert('获取本地视频流失败');
    });
  };

  win.RongSeal = win.RongSeal || {};
  win.RongSeal.startRTC = startRTC;

})({
  win: window,
  RongRTC: window.RongRTC,
  RongSeal: window.RongSeal,
  RongScreenShare: window.RongScreenShare,
  globalConfig: window.global_config
});