(function (dependencies) {
  var win = dependencies.win,
    RongSeal = win.RongSeal,
    RongRTC = win.RongRTC;
  var common = RongSeal.common,
    utils = RongSeal.utils,
    Dom = utils.Dom,
    sealAlert = common.sealAlert,
    locale = RongSeal.locale[common.lang],
    localeData = locale.data;

  var RongMedia = dependencies.RongMedia;
  var RongScreenShare = dependencies.RongScreenShare;
  
  var StreamBox = common.UI.StreamBox;
  var StreamList = common.UI.StreamList;

  var ClassName = {
    LOGIN_PAGE: 'rong-login',
    RTC_PAGE: 'rong-rtc',
    USER_TITLE: 'rong-user-title',
    ROOM_TITLE: 'rong-room-title',
    HANGUP_BUTTON: 'rong-opt-hangup',
    WHITEBOARD_BUTTON: 'rong-opt-wb',
    SCREENSHARE_BUTTON: 'rong-opt-share',
    STREAM_BOX: 'rong-stream-wrap'
  };

  var loginUserId, rongRTC, rongRTCRoom, rongRTCStream;
  var streamList;
  var userStreams = {
    users: {},
    getList: function (id) {
      return userStreams.users[id];
    },
    getStream: function (id) {
      var list = userStreams.users[id] || [];
      var stream = null;
      if (list.length) {
        stream = list[list.length - 1];
      }
      return stream;
    },
    add: function (user) {
      var id = user.id;
      userStreams.users[id] = userStreams.users[id] || [];
      userStreams.users[id].push(user);
    },
    remove: function (user) {
      var id = user.id;
      var streams = userStreams.users[id];
      var index = streams.indexOf(user);
      streams.splice(index, 1);
    }
  };

  var CustomizeTag = {
    NORMAL: 'normal',
    SCREENSHARE: 'screenshare'
  };

  function getScreenShareError(error) {
    console.log('screenshare error', error);
    sealAlert(localeData.installPrompt, {
      isShowCancel: true,
      confirmText: localeData.downloadTitle,
      confirmCallback: function () {
        var downloadUrl = win.location.href + 'plugin/screenshare-addon.zip';
        utils.download(downloadUrl);
      }
    });
  }

  function publishStreamError(error) {
    sealAlert('推送流失败' + ' ' + JSON.stringify(error));
  }

  function rtcTokenError(error) {
    sealAlert(localeData.getTokenError + ' ' + error.toString());
  }

  function joinRoomError(error) {
    sealAlert(localeData.joinError + ' ' + JSON.stringify(error));
  }

  function getSelfMediaStreamError(error) {
    sealAlert('获取本地视频流失败' + ' ' + error.toString());
  }

  function getStreamType(videoEnable, audioEnable) {
    var StreamType = rongRTC.StreamType;
    var type = StreamType.NONE;
    if (videoEnable && audioEnable) {
      type = StreamType.AUDIO_AND_VIDEO
    } else if (videoEnable) {
      type = StreamType.VIDEO;
    } else if (audioEnable) {
      type = StreamType.AUDIO;
    }
    return type;
  }

  function getSelfMediaStream(videoEnable, audioEnable, resolution) {
    var videoConfig = videoEnable ? resolution : videoEnable;
    var constraints = {
      video: videoConfig,
      audio: audioEnable
    };
    return new Promise(function (resolve, reject) {
      RongMedia.get(constraints).then(function (stream) {
        var user = {
          id: loginUserId,
          stream: {
            mediaStream: stream,
            type: getStreamType(constraints.video, constraints.audio),
            tag: CustomizeTag.NORMAL
          }
        };
        resolve(user);
      }, reject);
    })
  }

  function setStreamBox(id, type) {
    var StreamType = rongRTC.StreamType;
    var streamBox = StreamBox.get(id);
    var isSelf = id === loginUserId;
    var closeVideo = isSelf ? streamBox.closeVideoBySelf : streamBox.closeVideoByOther;
    var openVideo = isSelf ? streamBox.openVideoBySelf : streamBox.openVideoByOther;
    var closeAudio = isSelf ? streamBox.closeAudioBySelf : streamBox.closeAudioByOther;
    var openAudio = isSelf ? streamBox.openAudioBySelf : streamBox.openAudioByOthe;
    switch(type) {
    case StreamType.AUDIO:
      closeVideo.apply(streamBox);
      openAudio.apply(streamBox);
      break;
    case StreamType.VIDEO:
      openVideo.apply(streamBox);
      closeAudio.apply(streamBox);
      break;
    case StreamType.AUDIO_AND_VIDEO:
      openVideo.apply(streamBox);
      openAudio.apply(streamBox);
      break;
    case StreamType.NONE:
      closeVideo.apply(streamBox);
      closeAudio.apply(streamBox);
      break;
    default:
      break;
    }
  }

  function showUserStream(user) {
    var id = user.id,
      type = user.stream.type,
      mediaStream = user.stream.mediaStream;
    var streamBox = StreamBox.get(id);
    streamBox.showStream(mediaStream);
    setStreamBox(id, type);
  }

  function addUserStream(user) {
    var isSelf = user.id === loginUserId;
    if (isSelf) {
      showUserStream(user);
      userStreams.add(user);
    } else {
      user.stream.type = rongRTC.StreamType.AUDIO_AND_VIDEO;
      rongRTCStream.subscribe(user).then(function (user) {
        showUserStream(user);
        userStreams.add(user);
      }, function (error) {
        sealAlert('订阅失败' + JSON.stringify(error));
      });
    }
  }

  function removeUserStream(user) {
    console.log('remove user stream', user);
    userStreams.remove(user);
    rongRTCStream.unsubscribe(user);
    var list = userStreams.getList(user.id);
    if (list.length) {
      user = list[list.length - 1];
      showUserStream(user);
    }
  }

  function closeScreenShare() {
    var list = userStreams.getList(loginUserId);
    list.forEach(function (user) {
      var stream = user.stream;
      var tag = stream.tag;
      if (tag === CustomizeTag.SCREENSHARE) {
        var streamBox = StreamBox.get(loginUserId);
        streamBox.closeScreenShare();
        removeUserStream(user);
      }
    });
  }

  function openScreenshare() {
    var user = {
      id: loginUserId,
      stream: {
        tag: CustomizeTag.SCREENSHARE,
        type: rongRTC.StreamType.AUDIO_AND_VIDEO,
        mediaStream: null
      }
    };
    RongScreenShare.get().then(function (stream) {
      user.stream.mediaStream = stream;
      stream.oninactive = function () {
        closeScreenShare(user.id);
      };
      return rongRTCStream.publish(user);
    }, getScreenShareError).then(function () {
      addUserStream(user);
      var streamBox = StreamBox.get(loginUserId);
      streamBox.openScreenShare();
    }, publishStreamError);
  }

  function hideUserVideo(user) {
    var id = user.id,
      mediaStream = user.stream.mediaStream;
    var streamBox = StreamBox.get(id);
    streamBox.showStream(mediaStream);
    streamBox.closeVideoByOther();
  }

  function showUserVideo(user) {
    var id = user.id,
      mediaStream = user.stream.mediaStream;
    var streamBox = StreamBox.get(id);
    streamBox.showStream(mediaStream);
    streamBox.openVideoByOther();
  }

  function hideUserAudio(user) {
    var id = user.id,
      mediaStream = user.stream.mediaStream;
    var streamBox = StreamBox.get(id);
    streamBox.showStream(mediaStream);
    streamBox.closeAudioByOther();
  }

  function showUserAudio(user) {
    var id = user.id,
      mediaStream = user.stream.mediaStream;
    var streamBox = StreamBox.get(id);
    streamBox.showStream(mediaStream);
    streamBox.openAudioByOther();
  }

  function openVideo(user) {
    var video = rongRTCStream.video;
    var streamList = userStreams.getList(user.id);
    user = streamList[streamList.length - 1];
    video.enable(user).then(function () {
      showUserStream(user);
      var streamBox = StreamBox.get(user.id);
      streamBox.openVideoBySelf();
    }, function () {
      sealAlert('关闭摄像头失败');
    });
  }

  function closeVideo(user) {
    var video = rongRTCStream.video;
    var streamList = userStreams.getList(user.id);
    user = streamList[streamList.length - 1];
    video.disable(user).then(function () {
      showUserStream(user);
      var streamBox = StreamBox.get(user.id);
      streamBox.closeVideoBySelf();
    }, function () {
      sealAlert('关闭摄像头失败');
    });
  }

  function openAudio(user) {
    var audio = rongRTCStream.audio;
    var streamList = userStreams.getList(user.id);
    user = streamList[streamList.length - 1];
    audio.unmute(user).then(function () {
      showUserStream(user);
      var streamBox = StreamBox.get(user.id);
      streamBox.openAudioBySelf();
    }, function () {
      sealAlert('关闭摄像头失败');
    });
  }

  function closeAudio(user) {
    var audio = rongRTCStream.audio;
    var streamList = userStreams.getList(user.id);
    user = streamList[streamList.length - 1];
    audio.mute(user).then(function () {
      showUserStream(user);
      var streamBox = StreamBox.get(user.id);
      streamBox.closeAudioBySelf();
    }, function () {
      sealAlert('关闭摄像头失败');
    });
  }

  function resizeStream(isZoom, id) {
    var StreamSize = rongRTC.StreamSize;
    var size = isZoom ? StreamSize.MAX : StreamSize.MIN;
    var user = userStreams.getStream(id);
    if (!user) {
      return;
    }
    user.stream.size = size;
    rongRTCStream.resize(user).then(function () {
      console.log('resize success')
    }, function () {
      sealAlert('切换流失败');
    });
  }

  function addUserBox(user) {
    var id = user.id,
      isSelf = id === loginUserId;
    var name = isSelf ? '自己' : id;
    var resizeEvent = isSelf ? null : resizeStream;
    var streamBox = new StreamBox(id, {
      resizeEvent: resizeEvent,
      name: name
    });
    streamList.addBox(streamBox);
    if (isSelf) {
      streamBox.zoom();
    }
    var childDom = streamBox.childDom;
    childDom.videoBtn.onclick = function (e) {
      streamBox.isVideoOpenedBySelf ? closeVideo(user) : openVideo(user);
      e.stopPropagation();
    };
    childDom.audioBtn.onclick = function (e) {
      streamBox.isAudioOpenedBySelf ? closeAudio(user) : openAudio(user);
      e.stopPropagation();
    };
  }

  function removeUserBox(user) {
    var id = user.id;
    var streamBox = StreamBox.get(id);
    streamList.remove(streamBox);
  }

  function publishSelfMediaStream(videoEnable, audioEnable, resolution) {
    return new Promise(function (resolve, reject) {
      getSelfMediaStream(videoEnable, audioEnable, resolution).then(function (user) {
        rongRTCStream.publish(user).then(function () {
          resolve(user);
        }, reject);
      }, getSelfMediaStreamError);
    });
  }

  function joinRoom(roomId) {
    return RongSeal.im.getRTCToken(roomId).then(function (token) {
      var user = {
        id: loginUserId,
        token: token
      };
      return rongRTCRoom.join(user);
    }, rtcTokenError);
  }

  /**
   * 展示音视频交互主界面
   * @param {object} params
   * @param {string} params.roomId 房间号
   * @param {string} params.userId 用户id
   */
  function showRTCPage(params) {
    // 隐藏 login, 展示 rtc
    Dom.hideByClass(ClassName.LOGIN_PAGE);
    Dom.showByClass(ClassName.RTC_PAGE);
    
    // 设置 UI 上的房间号和个人信息
    var roomTitleDom = Dom.getByClass(ClassName.ROOM_TITLE);
    roomTitleDom.textContent = localeData.room + ': ' + params.roomId;
    var userTitleDom = Dom.getByClass(ClassName.USER_TITLE);
    userTitleDom.textContent = localeData.user + ': ' + params.userId;
    
    // 创建流列表 UI
    var rtcBoxDom = Dom.getByClass(ClassName.STREAM_BOX);
    streamList = new StreamList();
    rtcBoxDom.appendChild(streamList.dom);
  }

  function switchScreenShare() {
    var streamBox = StreamBox.get(loginUserId);
    streamBox.isScreenShareOpened ? closeScreenShare() : openScreenshare();
  }

  function quit() {
    rongRTCRoom.leave().then(function () {
      win.location.reload();
    }, function () {
      // leave error
    });
  }

  function bindRTCBtnEvent() {
    var hangupBtn = Dom.getByClass(ClassName.HANGUP_BUTTON),
      // whiteboardBtn = Dom.getByClass(ClassName.WHITEBOARD_BUTTON),
      screenShareBtn = Dom.getByClass(ClassName.SCREENSHARE_BUTTON);
    hangupBtn.onclick = quit;
    // whiteboardBtn.onclick = '';
    screenShareBtn.onclick = switchScreenShare;
    win.onbeforeunload = quit;
  }

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
    showRTCPage(params);
    bindRTCBtnEvent();

    loginUserId = params.userId;
    rongRTC = new RongRTC({
      RongIMLib: win.RongIMLib,
      mode: RongRTC.RTC,
      mounted: function () {}
    });
    rongRTCRoom = new rongRTC.Room({
      id: params.roomId,
      joined: addUserBox,
      left: removeUserBox
    });
    rongRTCStream = new rongRTC.Stream({
      published: addUserStream,
      unpublished: removeUserStream,
      disabled: hideUserVideo,
      enabled: showUserVideo,
      muted: hideUserAudio,
      unmuted: showUserAudio
    });
    joinRoom(params.roomId).then(function () {
      var videoEnable = params.videoEnable,
        audioEnable = params.audioEnable,
        resolution = params.resolution;
      addUserBox({ id: loginUserId });
      publishSelfMediaStream(videoEnable, audioEnable, resolution).then(
        addUserStream, publishStreamError);
    }, joinRoomError);
  };

  RongSeal.startRTC = startRTC;

})({
  win: window,
  RongRTC: window.RongRTC,
  RongSeal: window.RongSeal,
  RongScreenShare: window.RongScreenShare,
  RongMedia: window.RongMedia,
  globalConfig: window.global_config
});