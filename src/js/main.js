(function (dependencies) {
  var win = dependencies.win,
    RongRTC = dependencies.RongRTC,
    RongSeal = dependencies.RongSeal,
    globalConfig = dependencies.globalConfig;
    
  var utils = RongSeal.utils,
    common = RongSeal.common,
    getDom = utils.getDom,
    sealAlert = common.sealAlert;

  var rongRTC, loginUserId, isOpenScreenShare;

  /**
   * 音频流开关
   * @param {object} user
   */
  var switchAudioBySelf = function (user) {
    var userId = user.id;
    var Stream = rongRTC.Stream;
    var Audio = Stream.Audio;
    var isAudioOpened = common.isOpenedAudioBySelf(userId);
    isAudioOpened ? Audio.mute(user) : Audio.unmute(user);
    common.switchAudioBySelf(userId);  // ui 层修改
  };

  /**
   * 视频流开关
   * @param {object} user
   */
  var switchVideoBySelf = function (user) {
    var userId = user.id;
    var Stream = rongRTC.Stream;
    var Video = Stream.Video;
    var isVideoOpened = common.isOpenedVideoBySelf(userId);
    isVideoOpened ? Video.disable(user) : Video.enable(user);
    common.switchVideoBySelf(userId);  // ui 层修改
  };

  /**
   * 绑定视频点击事件
   * @param {array<Element>} streamDoms 
   * @param {object} user 
   */
  var bindStreamEvent = function (streamDoms, user) {
    var boxDom = streamDoms.boxDom,
      audioOptDom = streamDoms.audioOptDom,
      videoOptDom = streamDoms.videoOptDom;
    boxDom.onclick = function() {
      // 放大展示视频流
      common.zoomStream(user.id);
    };
    audioOptDom.onclick = function(e) {
      // 打开或关闭音频
      switchAudioBySelf(user);
      e.stopPropagation();  // 防止冒泡
    };
    videoOptDom.onclick = function(e) {
      // 打开或关闭视频
      switchVideoBySelf(user);
      e.stopPropagation();  // 防止冒泡
    };
  };

  /**
   * 开始白板
   */
  var startWhiteboard = function () {
    var WhiteBoard = rongRTC.WhiteBoard;
    WhiteBoard.create().then(function (whiteboard) {
      var url = whiteboard.url;
      common.startWhiteboard(url);
    });
  };

  /**
   * 屏幕共享开关
   */
  var switchScreenShare = function () {
    var ScreenShare = rongRTC.ScreenShare;
    var stop = function () {
      ScreenShare.stop();
      isOpenScreenShare = false;
      common.closeScreenShare(loginUserId);
    };
    var start = function () {
      isOpenScreenShare = true;
      common.openScreenShare(loginUserId);
    };
    var failed = function () {
      sealAlert('首次使用屏幕共享, 请下载并安装插件', {
        isShowCancel: true,
        confirmText: '下载插件',
        confirmCallback: function () {
          utils.download(globalConfig.DOWNLOAD_SHARE_PLUGIN_URL);
        }
      });
    };
    isOpenScreenShare ? stop() : ScreenShare.start().then(start, failed);
  };

  /**
   * 监听 rtc 事件
   */
  var observeRTC = function () {
    var Observer = rongRTC.Observer;
    var observer = new Observer(function(mutation) {
      if (mutation.type === 'error') {
        sealAlert('初始化 RongRTC 失败');
      }
    });
    observer.observe(rongRTC, {
      error: true
    });
  };

  /**
   * 监听 Room 事件
   */
  var observeRoom = function () {
    var Room = rongRTC.Room,
      Observer = rongRTC.Observer;
    var observer = new Observer(function(mutation) {
      var type = mutation.type,
        user = mutation.user;
      if (type === 'joined') {
        // TODO userJoined
      }
      if (type === 'left') {
        common.userLeft(user);
      }
    });
    observer.observe(Room, {
      joined: true,
      left: true
    });
  };

  /**
   * 监听 stream 事件
   */
  var observeStream = function () {
    var Stream = rongRTC.Stream,
      Observer = rongRTC.Observer;
    var observer = new Observer(function (mutation) {
      var type = mutation.type,
        user = mutation.user,
        stream = mutation.stream;
      if (type === 'added') {
        var streamDoms = common.addStream({
          stream: stream,
          user: user
        });
        stream.type && common.changeResource(stream, user);
        bindStreamEvent(streamDoms, user);
      }
      if (type === 'changed') {
        common.changeResource(stream, user);
      }
    });
    observer.observe(Stream, {
      added: true,
      changed: true
    });
  };
  
  var observeScreenShare = function() {
    var ScreenShare = rongRTC.ScreenShare,
      Observer = rongRTC.Observer;
    var observer = new Observer(function(mutation) {
      var type = mutation.type;
      if (type === 'finished') {
        switchScreenShare();
      }
    });
    observer.observe(ScreenShare, {
      finished: true
    });
  };

  // const setVideoConstraints = (constraints) => {
  //   let Video = rongRTC.Stream.Video;
  //   Video.set && Video.set(constraints);
  // };

  var showSelfStream = function() {
    var user = {
      id: loginUserId
    };
    var Stream = rongRTC.Stream;
    Stream.get(user).then(function(result) {
      var { user, stream } = result;
      var streamDoms = common.addStream({
        stream: stream,
        user: user
      });
      win.selfStream = stream;
      stream.type && common.changeResource(stream, user);
      bindStreamEvent(streamDoms, user);
    }, function() {
      sealAlert('获取本地视频流失败');
    });
  };

  var setSelfVideo = function(params) {
    var user = {
      id: params.userId,
      name: params.userId,
      token: params.rtcToken 
    };
    if (!params.video) {
      var Video = rongRTC.Stream.Video;
      Video.disable(user);
      common.closeVideoBySelf(user.id);
    }
    if (!params.audio) {
      var Audio = rongRTC.Stream.Audio;
      Audio.mute(user);
      common.closeAudioBySelf(user.id);
    }
    showSelfStream();
  };

  /**
   * 登录用户加入房间
   */
  var joinRoom = function(params) {
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
    Room.join(room).then(function() {
      setSelfVideo(params);
    }, function() {
      sealAlert('加入房间失败');
    });
  };

  /**
   * 设置房间号
   * @param {string} roomId 房间号
   */
  var setRoomId = function(roomId) {
    var roomIdDom = getDom('.rong-room-title');
    roomIdDom.textContent = '会议 ID: ' + roomId;
  };

  /**
   * 设置登录用户名
   * @param {string} name 登录用户名
   */
  var setLoginUserName = function(name) {
    var userNameDom = getDom('.rong-user-title');
    userNameDom.textContent = '登录用户: ' + name;
  };

  /**
   * @param {string} id 登录用户 id
   */
  var setLoginUserId = function(id) {
    var selfStreamBoxDom = getDom('.rong-stream-box[is-self=\'true\']');
    selfStreamBoxDom.id = id;
  };

  /**
   * 挂断
   */
  var hangup = function() {
    var Room = rongRTC.Room;
    win.onbeforeunload = utils.noop;
    Room.leave().then(function () {
      win.location.reload();
    }, function () {
      sealAlert('离开房间失败');
    });
    setTimeout(function() {
      win.location.reload();
    }, 5000);
  };

  /**
   * 展示音视频交互主界面
   * @param {object} params 
   * @param {string} params.roomId 房间号
   * @param {string} params.userId 用户id
   * @param {string} params.resolution 分辨率
   */
  var showRTCPage = function(params) {
    var hangupBtnDom = getDom('.rong-opt-hangup'),
      wbBtnDom = getDom('.rong-opt-wb'),
      shareBtnDom = getDom('.rong-opt-share');
    utils.hideDom('.rong-login');
    utils.showDom('.rong-rtc');
    setRoomId(params.roomId);
    setLoginUserName(params.userId);
    setLoginUserId(params.userId);
    shareBtnDom.onclick = switchScreenShare;
    wbBtnDom.onclick = startWhiteboard;
    hangupBtnDom.onclick = hangup;
    win.onbeforeunload = hangup;
  };

  var initRTCInstance = function() {
    rongRTC = new RongRTC({
      url: globalConfig.WS_NAV_URL
    });
    observeRTC();
    observeRoom();
    observeStream();
    observeScreenShare();
    // setVideoConstraints({
    //   video: params.resolution
    // });
  };

  /**
   * 开始实时音视频
   * @param {object} params 
   * @param {string} params.roomId 房间号
   * @param {string} params.userId 用户id
   * @param {string} params.resolution 分辨率
   * @param {boolean} params.video 是否开启 video
   * @param {boolean} params.audio 是否开启 audio
   */
  var startRTC = function(params) {
    loginUserId = params.userId;
    initRTCInstance(params);
    common.getRTCToken({
      tokenUrl: globalConfig.TOKEN_URL,
      userId: loginUserId,
      appId: globalConfig.APP_ID
    }).then(function(token) {
      params.rtcToken = token;
      showRTCPage(params);
      joinRoom(params);
    }, function() {
      sealAlert('获取 rtc token 失败');
    });
  };

  win.RongSeal = win.RongSeal || {};
  win.RongSeal.startRTC = startRTC;

})({
  win: window,
  RongRTC: window.RongRTC,
  RongSeal: window.RongSeal,
  globalConfig: window.global_config
});