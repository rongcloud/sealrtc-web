(function (dependencies) {
  const win = dependencies.win,
    RongRTC = dependencies.RongRTC,
    RongSeal = dependencies.RongSeal,
    utils = RongSeal.utils,
    common = RongSeal.common,
    getDom = utils.getDom,
    getDomById = utils.getDomById,
    globalConfig = dependencies.globalConfig,
    naviUrl = globalConfig.WS_NAV_URL,
    IdAttribute = common.SealEnum.IdAttribute,
    ResourceType = RongRTC.ResourceType;

  const SelfVideoName = '.rong-self-video';
  
  let userResourceTypes = {};

  let rongRTC, loginUserId, isOpenScreenShare;

  /**
   * 摄像头开关
   * @param {event} event 
   */
  const switchCamera = (event) => {
    let Video = rongRTC.Stream.Video;
    let cameraEl = event.target;
    let isCameraOpen = !common.getSwitchOpen(cameraEl);
    let id = cameraEl.getAttribute(IdAttribute) || loginUserId;
    let user = {
      id: id
    };
    // let isAudioStatus = userResourceTypes[id] === ResourceType.AUDIO;
    if (isCameraOpen) {
      Video.enable(user);
      common.hideAudioCover(user.id);
    } else {
      Video.disable(user);
      common.showAudioCover(user.id);
    }
    common.setSwitchOpen(cameraEl, isCameraOpen);
  };

  const switchVoice = (event) => {
    let Audio = rongRTC.Stream.Audio;
    let voiceEl = event.target;
    let isVoiceOpen = !common.getSwitchOpen(voiceEl);
    let id = voiceEl.getAttribute(IdAttribute) || loginUserId;
    let user = {
      id: id
    };
    isVoiceOpen ? Audio.mute(user) : Audio.unmute(user);
    common.setSwitchOpen(voiceEl, isVoiceOpen);
  };

  /**
   * video 点击事件, 放大点击的视频
   */
  const viewVideo = (event) => {
    let videoEl = event.currentTarget;
    let boxEl = videoEl.parentElement;
    common.viewDom(boxEl);
  };

  const bindStreamEvent = (videoEl) => {
    const ClassName = common.ClassName;
    const optBoxEl = utils.getBrotherDom(videoEl, ClassName.OptBox);
    let audioCoverEl = utils.getBrotherDom(videoEl, ClassName.AudioShow);
    let shareCoverEl = utils.getBrotherDom(videoEl, ClassName.ScreenCover);
    let cameraEl = utils.getChildDom(optBoxEl, ClassName.CameraOpt);
    let voiceEl = utils.getChildDom(optBoxEl, ClassName.VoiceOpt);
    videoEl.onclick = viewVideo;
    if (shareCoverEl) {
      shareCoverEl.onclick = viewVideo;
    }
    if (audioCoverEl) {
      audioCoverEl.onclick = viewVideo;
    }
    if (cameraEl) {
      cameraEl.onclick = switchCamera;
    }
    if (voiceEl) {
      voiceEl.onclick = switchVoice;
    }
  }

  /**
   * 收到视频流后, 展示
   * @param {stream} stream 视频/音频流
   * @param {object} user 用户信息
   */
  const showStream = (stream, user) => {
    let userId = user.id,
      streamEl = getDomById(userId),
      isSelf = userId === loginUserId;
    if (isSelf) {
      streamEl = getDom(SelfVideoName);
    }
    if (!streamEl) {
      let clickEvent = viewVideo;
      streamEl = common.addVideoEl(userId, clickEvent);
    }
    streamEl.id = userId;
    streamEl.srcObject = stream;
    streamEl.autoplay = true;
    bindStreamEvent(streamEl);
  };

  const removeStream = (user) => {
    let id = user.id;
    common.removeVideoEl(id);
  };

  /**
   * 开始屏幕共享
   */
  const startScreenShare = () => {
    let ScreenShare = rongRTC.ScreenShare;
    let stop = function () {
      ScreenShare.stop();
      isOpenScreenShare = false;
      common.hideScreenShareCover(loginUserId);
    };
    isOpenScreenShare ? stop() : ScreenShare.start().then(function () {
      isOpenScreenShare = true;
      common.showScreenShareCover(loginUserId);
    }, function (error) {
      alert('屏幕共享失败: ' + error);
    });
  };

  /**
   * 展示白板
   */
  const showWhiteboard = () => {
    var WhiteBoard = rongRTC.WhiteBoard;
    WhiteBoard.create().then(function (whiteboard) {
      let url = whiteboard.url;
      common.showWhiteboard(url);
    });
  };

  const hangup = () => {
    var Room = rongRTC.Room;
    window.onbeforeunload = utils.noop;
    Room.leave().then(function () {
      // console.log('离开房间');
      window.location.reload();
    }, function (error) {
      alert('离开房间失败: ' + error);
    });
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  };

  /**
   * 绑定操作按钮的点击事件
   */
  const bindOptButtonEvent = () => {
    const cameraSwitchBtn = getDom('.rong-opt-camera'),
      micSwitchBtn = getDom('.rong-opt-microphone'),
      shareBtn = getDom('.rong-opt-share'),
      wbSwitchBtn = getDom('.rong-opt-wb'),
      hangupSwitchBtn = getDom('.rong-opt-hangup');
    cameraSwitchBtn.onclick = switchCamera;
    micSwitchBtn.onclick = switchVoice;
    shareBtn.onclick = startScreenShare;
    wbSwitchBtn.onclick = showWhiteboard;
    hangupSwitchBtn.onclick = hangup;
    window.onbeforeunload = hangup;
  };

  const changeResource = (user) => {
    let resource = user.resource,
      resourceType = resource.type,
      userId = user.id;
    switch(resourceType) {
    // 对方只开启音频
    case ResourceType.AUDIO:
      common.showAudioCover(userId);
      break;
    // 对方只开启视频
    case ResourceType.VIDEO:
      break;
    // 对方同时开启视频和音频
    case ResourceType.AUDIO_AND_VIDEO:
      common.hideAudioCover(userId);
      break;
    default:
      break;
    }
    userResourceTypes[userId] = resourceType;
  };
    
  /**
   * 监听 rongRTC 事件
   */
  const observeRTC = () => {
    let Observer = rongRTC.Observer;
    let observer = new Observer((mutation) => {
      // console.log('\nrtc 监听', mutation + '\n');
      if (mutation.type === 'error') {
        alert('初始化 RongRTC 失败');
      }
    });
    observer.observe(rongRTC, {
      error: true
    });
  };

  /**
   * 监听 room 事件
   */
  const observeRoom = () => {
    let Room = rongRTC.Room,
      Observer = rongRTC.Observer;
    let observer = new Observer((mutation) => {
      let type = mutation.type,
        user = mutation.user;
      // console.log('room 监听', mutation);
      if (type === 'joined') {
        // TODO joined
      }
      if (type === 'left') {
        removeStream(user);
      }
      if (type === 'changed_resource') {
        changeResource(user);
      }
    });
    observer.observe(Room, {
      joined: true,
      left: true,
      changed: {
        resource: true
      }
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
      // console.log('stream 监听', mutation);
      if (type === 'added') {
        showStream(stream, user);
      }
    });
    observer.observe(Stream, {
      added: true
    });
  };

  /**
   * 获取 rtc token
   * @param {object} params 
   * @param {string} params.tokenUrl  获取 rtc token 的地址
   * @param {string} params.userId  用户 id
   * @param {string} params.appId  融云 appkey
   * @param {function} callback  回调
   */
  const getRTCToken = (params, callback) => {
    let tokenUrl = params.tokenUrl,
      selfId = params.userId,
      appId = params.appId;
    utils.sendForm({
      url: tokenUrl,
      method: 'POST',
      body: {
        uid: selfId,
        appid: appId
      },
      success: function (token) {
        callback(null, token);
      },
      fail: function (error) {
        callback(error);
      }
    });
  };

  /**
   * 加入房间
   * @param {object} params 
   * @param {string} params.roomId 房间 id
   * @param {string} params.userId 用户 id
   * @param {string} params.token rtc token
   */
  const joinRoom = (params) => {
    var roomId = params.roomId,
      userId = params.userId,
      token = params.token;
    let room = {
      id: roomId,
      user: {
        id: userId,
        name: userId,
        token: token
      }
    };
    let Room = rongRTC.Room;
    Room.join(room).then(function () {
      // console.log('加入房间成功');
    }, function (error) {
      alert('加入房间失败: ' + error.toString());
    });
  };

  /**
   * 展示视频界面
   * @param {string} params.roomId 房间号
   * @param {string} params.userId 用户 id
   * @param {string} params.rate 自己视频的分辨率, 格式如 640*480
   */
  const showMain = (params) => {
    let setMainStyle = function () {
      let showMainEl = getDom('.rong-main-show'),
        rate = params.rate,
        width = rate.width / rate.height * 100 + 'vh';
      showMainEl.style.width = width;
    };
    let setRoomName = () => {
      let roomNameEl = getDom('.rong-room-name');
      roomNameEl.textContent = '会议 ID: ' + params.roomId;
    };
    let setUserName = () => {
      let userNameEl = getDom('.rong-user-name');
      userNameEl.textContent = '登录用户: ' + params.userId;
    };
    utils.hideDom('.rong-login');
    utils.showDom('.rong-main');
    bindOptButtonEvent();
    setMainStyle();
    setRoomName();
    setUserName();
  };

  /**
   * 开始
   * @param {string} params.roomId 房间号
   * @param {string} params.userId 用户 id
   * @param {string} params.rate 自己视频的分辨率, 格式如 640*480
   */
  const startMeet = (params) => {
    loginUserId = params.userId;
    rongRTC = new RongRTC({
      url: naviUrl
    });
    let getTokenParams = {
        tokenUrl: globalConfig.TOKEN_URL,
        userId: loginUserId,
        appId: globalConfig.APP_ID
      },
      joinRoomParams = {
        userId: loginUserId,
        roomId: params.roomId,
        token: ''
      };
    observeRTC();
    observeRoom();
    observeStream();
    getRTCToken(getTokenParams, function (error, token) {
      if (error) {
        return alert('get token error', error);
      }
      showMain(params);
      joinRoomParams.token = token;
      joinRoom(joinRoomParams);
    });
  };

  win.RongSeal = win.RongSeal || {};
  win.RongSeal.startMeet = startMeet;

})({
  win: window,
  RongRTC: window.RongRTC,
  RongSeal: window.RongSeal,
  globalConfig: window.global_config
});