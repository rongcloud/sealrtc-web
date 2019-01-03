(function (dependencies) {
  var win = dependencies.win,
    RongRTC = dependencies.RongRTC,
    RongSeal = dependencies.RongSeal,
    RongScreenShare = dependencies.RongScreenShare,
    globalConfig = dependencies.globalConfig;
  var common = RongSeal.common,
    utils = RongSeal.utils,
    noop = utils.noop,
    Dom = utils.Dom,
    UI = common.UI,
    StreamBox = UI.StreamBox,
    getDom = Dom.get,
    sealAlert = common.sealAlert,
    getRTCToken = common.getRTCToken;

  var rongRTC, // RongRTC 实例
    streamList, // SteramList(流列表 UI 操作) 实例
    loginUserId,
    whiteBoard = new UI.WhiteBoard(),
    screenShare = {
      isOpened: false
    };

  var CustomizeMediaType = {
    ScreenShare: 1001
  };

  /* 初始化失败提示 */
  var alertInitRTCError = function () {
    sealAlert('初始化 RTC 失败');
  };

  var alertScreenSharePlugin = function () {
    sealAlert('首次使用屏幕共享, 请下载并安装插件', {
      isShowCancel: true,
      confirmText: '下载插件',
      confirmCallback: function () {
        var downloadUrl = win.location.href + 'plugin/screenshare-addon.zip';
        utils.download(downloadUrl);
      }
    });
  };

  var hangup = function () {
    var Room = rongRTC.Room;
    win.onbeforeunload = utils.noop;
    Room.leave().then(function () {
      win.location.reload();
    }, function () {
      sealAlert('离开房间失败');
      win.location.reload();
    });
  };

  /* 关闭屏幕共享 */
  var closeScreenShare = function (id) {
    var streamBox = StreamBox.get(id);
    var Stream = rongRTC.Stream;
    var user = {
      id: id,
      stream: {
        type: CustomizeMediaType.ScreenShare
      }
    };
    Stream.get(user).then(function (result) {
      var mediaStream = result.stream.mediaStream;
      user.stream.mediaStream = mediaStream;
      Stream.remove(user).then(function () {
        streamBox.closeScreenShare();
        screenShare.isOpened = false;
      }, function () {
        sealAlert('关闭屏幕共享失败');
      });
    });
  };

  /* 展示屏幕共享 */
  var openScreenShare = function (id) {
    var Stream = rongRTC.Stream;
    var streamBox = StreamBox.get(id);
    RongScreenShare.check().then(function () {
      RongScreenShare.get().then(function (stream) {
        var user = {
          id: id,
          stream: {
            type: CustomizeMediaType.ScreenShare,
            mediaStream: stream
          }
        };
        Stream.add(user).then(function () {
          screenShare.isOpened = true;
          streamBox.openScreenShare();
        }, function () {
          sealAlert('加入屏幕共享流失败');
        });
      }, function () {
        sealAlert('获取屏幕共享流失败');
      });
    }, function () {
      alertScreenSharePlugin();
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
    whiteBoard.show();
  };

  /**
   * 视频流开关(登录用户操作)
   * @param {string} id 用户id
   */
  var switchVideo = function (id) {
    var user = { id: id };
    var Video = rongRTC.Stream.Video;
    var streamBox = StreamBox.get(id);
    var isClosed = streamBox.isVideoCloseBySelf();
    if (isClosed) {
      Video.enable(user);
      streamBox.openVideoBySelf();
    } else {
      Video.disable(user);
      streamBox.closeVideoBySelf();
    }
  };

  /**
   * 音频流开关
   * @param {string} id 用户id
   */
  var switchAudio = function (id) {
    var user = { id: id };
    var Audio = rongRTC.Stream.Audio;
    var streamBox = StreamBox.get(id);
    var isClosed = streamBox.isAudioCloseBySelf();
    if (isClosed) {
      Audio.unmute(user);
      streamBox.openAudioBySelf()
    } else {
      Audio.mute(user);
      streamBox.closeAudioBySelf()
    }
  };

  /**
   * 创建用户展示框, 包含绑定点击事件
   * @param {string} id 用户id
   */
  var createStreamBox = function (id) {
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
  var removeStreamBox = function (id) {
    var streamBox = StreamBox.get(id);
    streamList.remove(streamBox);
  };

  /**
   * 改变用户资源展示
   * @param {string} id  用户 id
   * @param {int}  mediaType 资源类型
   */
  var changeStreamBox = function (id, mediaType) {
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
    case StreamType.AUDIO_AND_VIDEO:
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
  var updateStreamBox = function (id, mediaStream, mediaType) {
    var streamBox = StreamBox.get(id);
    streamBox.setStream(mediaStream);
    mediaType && changeStreamBox(id, mediaType);
  };

  /**
   * 用户默认流设置
   * @param {object} params 
   * @param {object} params.userId 用户 id
   * @param {object} params.videoEnable 视频是否可用
   * @param {object} params.audioEnable 音频是否可用
   */
  var setDefaultStream = function (params) {
    var user = {
      id: params.userId
    };
    var streamBox = StreamBox.get(params.userId);
    if (!params.videoEnable) {
      var Video = rongRTC.Stream.Video;
      Video.disable(user);
      streamBox.closeVideoBySelf();
    }
    if (!params.audioEnable) {
      var Audio = rongRTC.Stream.Audio;
      Audio.mute(user);
      streamBox.closeAudioBySelf();
    }
  };

  /**
   * 加入房间
   * @param {object} params 
   * @param {object} params.userId 用户 id
   * @param {object} params.roomId 房间 id
   * @param {object} params.rtcToken token
   */
  var joinRoom = function (params) {
    var user = {
      id: params.userId,
      name: params.userId,
      token: params.rtcToken
    };
    var room = {
      id: params.roomId,
      user: user
    };
    var Room = rongRTC.Room;
    var Stream = rongRTC.Stream;
    return new Promise(function (resolve, reject) {
      Room.join(room).then(function () {
        Stream.get(user).then(function (result) {
          resolve(result);
        }, function (error) {
          reject(error);
        });
      }, function (error) {
        reject(error);
      });  
    });
  };

  /* 设置房间号展示 */
  var setRoomTitle = function (roomId) {
    var roomDom = Dom.getById('RongRoomTitle');
    roomDom.textContent = '会议 ID: ' + roomId;
  };

  /* 设置用户名展示 */
  var setUserTitle = function (userName) {
    var userDom = Dom.getById('RongUserTitle');
    userDom.textContent = '登录用户: ' + userName;
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

  /**
   * 监听 RTC
   * @param {object} events 
   * @param {Function} events.error 初始化错误事件
   */
  var observeRTC = function (events) {
    var errorEvents = events.error || noop;
    var Observer = rongRTC.Observer;
    var observer = new Observer(function (mutation) {
      if (mutation.type === 'error') {
        errorEvents(mutation);
      }
    });
    observer.observe(rongRTC, {
      error: true
    });
  };

  /**
   * 监听 Room 事件
   * @param {object} events
   * @param {Function} events.joined 用户加入房间事件
   * @param {Function} events.left 用户离开房间事件
   */
  var observeRoom = function (events) {
    var joinedEvents = events.joined || noop,
      leftEvents = events.left || noop;
    var Room = rongRTC.Room,
      Observer = rongRTC.Observer;
    var observer = new Observer(function (mutation) {
      var type = mutation.type,
        user = mutation.user;
      if (type === 'joined') {
        joinedEvents(user.id, type);
      }
      if (type === 'left') {
        leftEvents(user.id);
      }
    });
    observer.observe(Room, {
      joined: true,
      left: true
    });
  };

  /**
   * 监听 stream 事件
   * @param {Function} events.added 用户新增流事件
   * @param {Function} events.changed 用户流改变事件
   */
  var observeStream = function (events) {
    var addedEvents = events.added || noop,
      changedEvents = events.changed || noop;
    var Stream = rongRTC.Stream,
      Observer = rongRTC.Observer;
    var observer = new Observer(function (mutation) {
      var type = mutation.type,
        user = mutation.user,
        stream = mutation.stream,
        mediaType = stream.type,
        mediaStream = stream.mediaStream;
      if (type === 'added') {
        addedEvents(user.id, mediaStream, mediaType);
      }
      if (type === 'changed') {
        changedEvents(user.id, mediaType);
      }
    });
    observer.observe(Stream, {
      added: true,
      changed: true
    });
  };

  var getTokenParams = function (userId) {
    return {
      tokenUrl: globalConfig.TOKEN_URL,
      userId: userId,
      appId: globalConfig.APP_ID
    };
  };

  /**
   * 初始化 rtc 实例
   * @param {object} events
   * @param {Function} events.rtcError
   * @param {Function} events.joinRoom
   * @param {Function} events.leftRoom
   * @param {Function} events.addStream
   * @param {Function} events.changeStream
   */
  var initRTCInstance = function (events) {
    events = events || {};
    rongRTC = new RongRTC({
      url: globalConfig.WS_NAV_URL
    });
    observeRTC({
      error: events.rtcError
    });
    observeRoom({
      joined: events.joinRoom,
      left: events.leftRoom
    });
    observeStream({
      added: events.addStream,
      changed: events.changeStream
    });
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
    initRTCInstance({
      rtcError: alertInitRTCError,
      joinRoom: createStreamBox,
      leftRoom: removeStreamBox,
      addStream: updateStreamBox,
      changeStream: changeStreamBox
    });
    setDefaultStream(params);
    
    var tokenParams = getTokenParams(loginUserId);
    getRTCToken(tokenParams).then(function (token) {
      params.rtcToken = token;
      showRTCPage(params, {
        startWhiteboard: startWhiteboard,
        hangup: hangup,
        switchScreenShare: switchScreenShare
      });
      createStreamBox(loginUserId);
      joinRoom(params).then(function (result) {
        var stream = result.stream;
        var user = result.user;
        updateStreamBox(user.id, stream.mediaStream, stream.type);
      }, function () {
        sealAlert('加入房间失败');
      });
    }, function () {
      sealAlert('获取 token 失败');
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