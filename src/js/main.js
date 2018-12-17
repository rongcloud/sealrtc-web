(function (dependencies) {
  const win = dependencies.win,
    RongRTC = dependencies.RongRTC,
    RongSeal = dependencies.RongSeal,
    globalConfig = dependencies.globalConfig;
    
  const utils = RongSeal.utils,
    common = RongSeal.common,
    getDom = utils.getDom,
    sealAlert = common.sealAlert;

  let rongRTC, loginUserId, roomId, rtcToken, isOpenScreenShare

  /**
   * 音频流开关
   * @param {object} user
   */
  const switchAudioBySelf = (user) => {
    let userId = user.id;
    let Stream = rongRTC.Stream;
    let Audio = Stream.Audio;
    let isAudioOpened = common.isOpenedAudioBySelf(userId);
    isAudioOpened ? Audio.mute(user) : Audio.unmute(user);
    common.switchAudioBySelf(userId);  // ui 层修改
  };

  /**
   * 视频流开关
   * @param {object} user
   */
  const switchVideoBySelf = (user) => {
    let userId = user.id;
    let Stream = rongRTC.Stream;
    let Video = Stream.Video;
    let isVideoOpened = common.isOpenedVideoBySelf(userId);
    isVideoOpened ? Video.disable(user) : Video.enable(user);
    common.switchVideoBySelf(userId);  // ui 层修改
  };

  /**
   * 绑定视频点击事件
   * @param {array<Element>} streamDoms 
   * @param {object} user 
   */
  const bindStreamEvent = (streamDoms, user) => {
    let boxDom = streamDoms.boxDom,
      audioOptDom = streamDoms.audioOptDom,
      videoOptDom = streamDoms.videoOptDom;
    boxDom.onclick = () => {
      // 放大展示视频流
      common.zoomStream(user.id);
    };
    audioOptDom.onclick = (e) => {
      // 打开或关闭音频
      switchAudioBySelf(user);
      e.stopPropagation();  // 防止冒泡
    };
    videoOptDom.onclick = (e) => {
      // 打开或关闭视频
      switchVideoBySelf(user);
      e.stopPropagation();  // 防止冒泡
    };
  };

  /**
   * 监听 rtc 事件
   */
  const observeRTC = () => {
    let Observer = rongRTC.Observer;
    let observer = new Observer((mutation) => {
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
  const observeRoom = () => {
    let Room = rongRTC.Room,
      Observer = rongRTC.Observer;
    let observer = new Observer((mutation) => {
      let type = mutation.type,
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
  const observeStream = () => {
    let Stream = rongRTC.Stream,
      Observer = rongRTC.Observer;
    let observer = new Observer((mutation) => {
      let type = mutation.type,
        user = mutation.user,
        stream = mutation.stream;
      if (type === 'added') {
        let streamDoms = common.addStream({
          stream: stream,
          user: user
        });
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

  /**
   * 登录用户加入房间
   */
  const joinRoom = () => {
    let room = {
      id: roomId,
      user: {
        id: loginUserId,
        name: loginUserId,
        token: rtcToken
      }
    };
    let Room = rongRTC.Room;
    Room.join(room).then(() => {
      // 加入房间成功
    }, () => {
      sealAlert('加入房间失败');
    });
  };

  /**
   * 设置视频展示窗口的宽度
   * @param {object} resolution 分辨率, 格式如: 640*480
   */
  const setMainVideoWidth = (resolution) => {
    let mainDom = getDom('.rong-rtc-main');
    let width = resolution.width / resolution.height * 100 + 'vh';
    mainDom.style.width = width;
  };

  /**
   * 设置房间号
   * @param {string} roomId 房间号
   */
  const setRoomId = (roomId) => {
    let roomIdDom = getDom('.rong-room-title');
    roomIdDom.textContent = '会议 ID: ' + roomId;
  };

  /**
   * 设置登录用户名
   * @param {string} name 登录用户名
   */
  const setLoginUserName = (name) => {
    let userNameDom = getDom('.rong-user-title');
    userNameDom.textContent = '登录用户: ' + name;
  };

  /**
   * @param {string} id 登录用户 id
   */
  const setLoginUserId = (id) => {
    let selfStreamBoxDom = getDom('.rong-stream-box[is-self=\'true\']');
    selfStreamBoxDom.id = id;
  };

  /**
   * 挂断
   */
  const hangup = () => {
    var Room = rongRTC.Room;
    win.onbeforeunload = utils.noop;
    Room.leave().then(function () {
      win.location.reload();
    }, function () {
      sealAlert('离开房间失败');
    });
    setTimeout(() => {
      win.location.reload();
    }, 5000);
  };

  /**
   * 开始白板
   */
  const startWhiteboard = () => {
    var WhiteBoard = rongRTC.WhiteBoard;
    WhiteBoard.create().then(function (whiteboard) {
      let url = whiteboard.url;
      common.startWhiteboard(url);
    });
  };

  /**
   * 开始屏幕共享
   */
  const startScreenShare = () => {
    let ScreenShare = rongRTC.ScreenShare;
    let stop = () => {
      ScreenShare.stop();
      isOpenScreenShare = false;
      common.closeScreenShare(loginUserId);
    };
    isOpenScreenShare ? stop() : ScreenShare.start().then(function () {
      isOpenScreenShare = true;
      common.openScreenShare(loginUserId);
    }, function () {
      sealAlert('首次使用屏幕共享, 请下载并安装插件', {
        isShowCancel: true,
        confirmCallback: () => {
          utils.download(globalConfig.DOWNLOAD_SHARE_PLUGIN_URL);
        }
      });
    });
  };

  /**
   * 展示音视频交互主界面
   * @param {object} params 
   * @param {string} params.roomId 房间号
   * @param {string} params.userId 用户id
   * @param {string} params.resolution 分辨率
   */
  const showRTCPage = (params) => {
    const hangupBtnDom = getDom('.rong-opt-hangup'),
      wbBtnDom = getDom('.rong-opt-wb'),
      shareBtnDom = getDom('.rong-opt-share');
    utils.hideDom('.rong-login');
    utils.showDom('.rong-rtc');
    setMainVideoWidth(params.resolution);
    setRoomId(params.roomId);
    setLoginUserName(params.userId);
    setLoginUserId(params.userId);
    shareBtnDom.onclick = startScreenShare;
    wbBtnDom.onclick = startWhiteboard;
    hangupBtnDom.onclick = hangup;
    win.onbeforeunload = hangup;
  };

  /**
   * 开始实时音视频
   * @param {object} params 
   * @param {string} params.roomId 房间号
   * @param {string} params.userId 用户id
   * @param {string} params.resolution 分辨率
   */
  const startRTC = (params) => {
    loginUserId = params.userId;
    roomId = params.roomId;
    rongRTC = new RongRTC({
      url: globalConfig.WS_NAV_URL
    });
    observeRTC();
    observeRoom();
    observeStream();
    common.getRTCToken({
      tokenUrl: globalConfig.TOKEN_URL,
      userId: loginUserId,
      appId: globalConfig.APP_ID
    }).then((token) => {
      rtcToken = token;
      showRTCPage(params);
      joinRoom();
    }, () => {
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