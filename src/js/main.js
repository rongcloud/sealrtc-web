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
  var RongRTCPage = common.UI.RongRTCPage;

  var videoTimer = new common.SealTimer();
  var sealToast = new common.SealToast();
  var EventName = RongSeal.EventName;
  // var casePreBtn = Dom.get('.rong-case-pre');
  // var caseNextBtn = Dom.get('.rong-case-next');

  var ClassName = {
    LOGIN_PAGE: 'rong-login',
    RTC_PAGE: 'rong-rtc',
    USER_TITLE: 'rong-user-title',
    ROOM_TITLE: 'rong-room-title',
    HANGUP_BUTTON: 'rong-opt-hangup',
    WHITEBOARD_BUTTON: 'rong-opt-wb',
    SCREENSHARE_BUTTON: 'rong-opt-share',
    STREAM_BOX: 'rong-stream-wrap',
    CASE_PRE_BTN: 'rong-case-pre',
    CASE_NEXT_BTN: 'rong-case-next'
  };

  var loginUserId, rongRTC, rongRTCRoom, rongRTCStream;
  var rongRTCPage, streamList;
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
    },
    clearUsers: function () {
      var self = this;
      self.users = {};
    }
  };

  var CustomizeTag = {
    NORMAL: 'normal',
    SCREENSHARE: 'screenshare'
  };

  function streamBoxSroll(event) {
    var direction = event.target.className;
    var streamListBox = Dom.get('.rong-stream-list');
    if (direction == 'rong-case-pre') {
      streamListBox.scrollLeft -= 152;
    } else {
      streamListBox.scrollLeft += 152;
    }
  }

  function destroyRongRTCPage() {
    if (rongRTCPage) {
      var bodyDom = Dom.get('body');
      rongRTCPage.destroyPage(bodyDom);
    }
  }

  function clearBox() {
    if (streamList) {
      streamList.clearBox();
    }
  }

  function createToast() {
    var stramBoxList = streamList.streamBoxList;
    if (stramBoxList.length < 2) {
      sealToast.toast('等待其他用户加入...')
    }
  }

  function showToast() {
    var stramBoxList = streamList.streamBoxList;
    if (stramBoxList.length < 2) {
      sealToast.show();
    }
  }

  function hideToast() {
    var stramBoxList = streamList.streamBoxList;
    if (stramBoxList.length >= 2) {
      sealToast.hide();
    }
  }

  function openVideoTimer() {
    var stramBoxList = streamList.streamBoxList;
    if (stramBoxList.length == 2) {
      videoTimer.start();
    }
  }

  function stopVideoTimer() {
    var stramBoxList = streamList.streamBoxList;
    if (stramBoxList.length < 2) {
      videoTimer.stop();
    }
  }

  function screenShareBtnOpen() {
    Dom.showByClass('rong-share-openicon');
    Dom.hideByClass('rong-share-closeicon');
    var hangUpDom = Dom.get('.rong-opt-hangup');
    if(hangUpDom){
      hangUpDom.disabled = false;
      hangUpDom.style.cursor = 'pointer';
    }
  }

  function getScreenShareError(error) {
    console.log('screenshare error', error);
    screenShareBtnOpen();
    return new Promise(function (resolve, reject) {
      !error.message && sealAlert(localeData.installPrompt, {
        isShowCancel: true,
        confirmText: localeData.downloadTitle,
        confirmCallback: function () {
          var downloadUrl = win.location.href + 'plugin/screenshare-addon.zip';
          utils.download(downloadUrl);
        }
      });
      reject();
    });
  }

  function publishStreamError(error) {
    if (error) {
      sealAlert(localeData.publishError + ' ' + JSON.stringify(error));
    }
  }

  function rtcTokenError(error) {
    sealAlert(localeData.getTokenError + ' ' + error.toString());
  }

  function joinRoomError(error) {
    sealAlert(localeData.joinError + ' ' + JSON.stringify(error));
  }

  function getSelfMediaStreamError(error) {
    sealAlert(localeData.getLocalStreamError + ' ' + error.toString());
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

  function getSelfMediaStream(videoEnable, audioEnable, resolution, audioOnly) {
    var videoConfig = videoEnable ? resolution : videoEnable;
    var constraints = {
      video: videoConfig,
      audio: audioEnable,
      frameRate: 15,
      audioOnly: audioOnly,
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
    var openAudio = isSelf ? streamBox.openAudioBySelf : streamBox.openAudioByOther;
    switch (type) {
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

  // video实际分辨率添加
  function createResolutionDom(dom) {
    var p = document.createElement('p');
    p.className = 'rong-videoResolution';
    var text = utils.tplEngine('{width}*{height}', {
      width: dom.videoWidth,
      height: dom.videoHeight
    });
    p.innerHTML = text;
    dom.parentNode.appendChild(p);
  }
  function showResolution(id) {
    var videoDom = utils.tplEngine('video[stream=Rong-{id}]', {
      id: id
    });
    var videoNode = Dom.get(videoDom);
    videoNode.onloadeddata = function () {
      createResolutionDom(videoNode)
    }
  }

  function showUserStream(user) {
    var id = user.id,
      // type = user.stream.type,
      mediaStream = user.stream.mediaStream;
    var streamBox = StreamBox.get(id);
    var isSelf = id === loginUserId;
    if (isSelf) {
      streamBox.childDom.video.muted = true;
    }
    streamBox.showStream(mediaStream);

    showResolution(id); //video 添加分辨率
  }

  function addUserStream(user) {
    var isSelf = user.id === loginUserId;
    console.log('addUserStream user:', JSON.stringify(user));
    var streamBox = StreamBox.get(user.id);
    if (isSelf) {
      showUserStream(user);
      userStreams.add(user);
      setStreamBox(user.id, user.stream.mediaStream);
      streamBox.closeFlibScreenShare();
    } else {
      console.log('有人订阅了----')
      // user.stream.type = rongRTC.StreamType.AUDIO_AND_VIDEO;
      console.log(JSON.stringify(user.stream))
      user.stream.size = rongRTC.StreamSize.MIN;
      rongRTCStream.subscribe(user).then(function (user) {
        showUserStream(user);
        setStreamBox(user.id, user.stream.mediaStream);
        userStreams.add(user);
        if (user.stream.enable.video == false) {
          streamBox.closeVideoByOther();
        }
        if (user.stream.tag == 'screenshare') {
          streamBox.openFlibScreenShare();
        }
      }, function (error) {
        sealAlert(localeData.subscriptError + JSON.stringify(error));
      });
    }
    // showResolution(user.id);
  }

  function removeUserStream(user) {
    console.log('remove user stream', JSON.stringify(user));
    var streamBox = StreamBox.get(user.id);
    if (user.stream.tag == 'screenshare') {
      streamBox.closeFlibScreenShare();
    }
    userStreams.remove(user);
    if (user.id !== loginUserId) {
      rongRTCStream.unsubscribe(user);
    }
    var list = userStreams.getList(user.id);
    if (list.length) {
      user = list[list.length - 1];
      showUserStream(user);
    }
  }

  //切换浏览器 tab 关闭屏幕分享选项弹窗
  function browserTabChange() {
    document.addEventListener('visibilitychange', function () {
      // console.log(document.visibilityState);
      RongScreenShare.clearChooseBox();
      screenShareBtnOpen();
    });
  }
  function closeScreenShare() {
    var list = userStreams.getList(loginUserId);
    Dom.showByClass('rong-share-openicon');
    Dom.hideByClass('rong-share-closeicon');
    list.forEach(function (user) {
      var stream = user.stream;
      var tag = stream.tag;
      if (tag === CustomizeTag.SCREENSHARE) {
        var streamBox = StreamBox.get(loginUserId);
        streamBox.closeScreenShare();
        removeUserStream(user);
        rongRTCStream.unpublish(user).then(function () {
        }).catch(function (err) {
          console.log(err)
        });
      }
    });
  }

  function openScreenshare() {
    browserTabChange();
    Dom.hideByClass('rong-share-openicon');
    Dom.showByClass('rong-share-closeicon');
    Dom.get('.rong-opt-hangup').disabled = true;
    Dom.get('.rong-opt-hangup').style.cursor = 'not-allowed';
    var user = {
      id: loginUserId,
      stream: {
        tag: CustomizeTag.SCREENSHARE,
        type: rongRTC.StreamType.VIDEO,
        mediaStream: null
      }
    };
    RongScreenShare.get().then(function (stream) {
      screenShareBtnOpen();
      Dom.get('.rong-opt-share').title = '结束屏幕共享'
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
      sealAlert(localeData.openVideoError);
    });
  }

  function closeVideo(user) {
    var video = rongRTCStream.video;
    var streamList = userStreams.getList(user.id);
    user = streamList ? streamList[streamList.length - 1] : user;
    video.disable(user).then(function () {
      // showUserStream(user);
      var streamBox = StreamBox.get(user.id);
      streamBox.closeVideoBySelf();
    }, function () {
      sealAlert(localeData.closeVideoError);
    });
  }

  function openAudio(user) {
    var audio = rongRTCStream.audio;
    var streamList = userStreams.getList(user.id);
    user = streamList[streamList.length - 1];
    audio.unmute(user).then(function () {
      // showUserStream(user);
      var streamBox = StreamBox.get(user.id);
      streamBox.openAudioBySelf();
    }, function () {
      sealAlert(localeData.openAudioError);
    });
  }

  function closeAudio(user) {
    var audio = rongRTCStream.audio;
    var streamList = userStreams.getList(user.id);
    user = streamList[streamList.length - 1];
    // var streamList = userStreams.getList(user.id);
    // user = streamList ? streamList[streamList.length - 1] : user;
    audio.mute(user).then(function () {
      // showUserStream(user);
      var streamBox = StreamBox.get(user.id);
      streamBox.closeAudioBySelf();
    }, function () {
      sealAlert(localeData.closeAudioError);
    });
  }

  function resizeStream(isZoom, id) {
    console.log('resize stream----')
    var StreamSize = rongRTC.StreamSize;
    var size = isZoom ? StreamSize.MAX : StreamSize.MIN;
    var user = userStreams.getStream(id);
    if (!user) {
      return;
    }
    user.stream.size = size;
    // if(isZoom == true) {
    rongRTCStream.resize(user).then(function () {
      console.log('resize success')
    }, function (err) {
      console.log('resize err user:', user)
      console.log('resize err:', err)
      sealAlert(localeData.switchStreamError);
    });
    // }
  }

  function addUserBox(user) {
    console.log('join user', JSON.stringify(user))
    var id = user.id,
      isSelf = id === loginUserId;
    var name = isSelf ? localeData.self : id;
    var resizeEvent = isSelf ? null : resizeStream;
    var streamBox = new StreamBox(id, {
      resizeEvent: resizeEvent,
      name: name
    });
    streamList.addBox(streamBox);
    if (isSelf) {
      utils.Dom.addClass(streamBox.dom, 'rong-is-self');
      console.log(streamBox.dom);
      streamBox.zoom(user);
    }else {
      addUserStream(user);
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
    //添加左右滑动视频窗按钮
    if (streamList.streamBoxList.length > 10) {
      Dom.showByClass(ClassName.CASE_PRE_BTN);
      Dom.showByClass(ClassName.CASE_NEXT_BTN);
      Dom.get('.' + ClassName.CASE_PRE_BTN).onclick = streamBoxSroll;
      Dom.get('.' + ClassName.CASE_NEXT_BTN).onclick = streamBoxSroll;
    }
    openVideoTimer();
    createToast();
    hideToast();
    console.log('streamList:', JSON.stringify(streamList));
    
  }

  function removeUserBox(user) {
    console.log('left user:',user)
    var id = user.id;
    var streamBox = StreamBox.get(id);
    if(streamBox){
      var isRemoveBoxZoom = streamBox.isZoom;
      streamList.removeBox(streamBox);
      StreamBox.clearQuitUser(id);
    }
    // var streamBoxList = common.StreamBoxList;
    var streamBoxList = streamList.streamBoxList;
    if (isRemoveBoxZoom) {
      for (var key in streamBoxList) {
        streamBox = streamBoxList[key];
        if (streamBox.id === loginUserId) {
          streamBox.zoom();
        }
      }
    }
    //隐藏左右滑动视频窗按钮
    if (streamList.streamBoxList.length <= 10) {
      Dom.hideByClass(ClassName.CASE_PRE_BTN);
      Dom.hideByClass(ClassName.CASE_NEXT_BTN);
    }
    stopVideoTimer();
    hideToast();
    showToast();
  }

  function publishSelfMediaStream(videoEnable, audioEnable, resolution, audioOnly) {
    return new Promise(function (resolve, reject) {
      // if(!videoEnable){
      //   videoEnable= true;
      //   getSelfMediaStream(videoEnable, audioEnable, resolution).then(function (user) {
      //     rongRTCStream.publish(user).then(function () {
      //       closeVideo(user);
      //       resolve(user);
      //     }, reject);
      //   }, getSelfMediaStreamError);
      // }

      getSelfMediaStream(videoEnable, audioEnable, resolution, audioOnly).then(function (user) {
        rongRTCStream.publish(user).then(function () {
          if (!videoEnable) {
            closeVideo(user);
          }
          resolve(user);
        }, reject);
      }, getSelfMediaStreamError);
    });
  }

  function joinRoom(roomId, token) {
    return RongSeal.im.getRTCToken(roomId).then(function () {
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

    // 创建音视频主页面
    rongRTCPage = new RongRTCPage();
    var bodyDom = Dom.get('body');
    rongRTCPage.createPage(bodyDom, function () {
      videoTimer = new common.SealTimer();
    });
    
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
    // win.location.reload();
    common.UI.backLoginPage();
    RongSeal.videoTimer.stop();
    RongSeal.userStreams.clearUsers();
    sealToast.destroy();
    RongSeal.destroyRongRTCPage();
    rongRTCRoom.leave().then(function () {
      // win.location.reload();
      console.log('quit---')
    }, function () {
      // leave error
    });
    RongSeal.im.disconnect();
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

  function addVideoViewBox(user) {
    if(user.stream.tag == 'screenshare'){
      addUserStream(user);
      return ;
    }
    addUserBox(user);
  }

  function joinCancel() {
    window.location.reload();
  }
  function RTCJoinConfirm(peopleNum,params) {
    console.log(peopleNum,params);
    addUserBox({ id: loginUserId });
    var streamBox = StreamBox.get(loginUserId);
    if(peopleNum>=3 && peopleNum<5) {
      streamBox.disabledVideoBySelf();
      var audioOnly = true;
      publishSelfMediaStream(false, true, params.resolution,audioOnly).then(
        addUserStream, publishStreamError);
    }else if(peopleNum >= 5) {
      streamBox.closeVideoBySelf();
      streamBox.closeAudioBySelf();
      streamBox.disabledVideoBySelf();
      streamBox.disabledAudioBySelf();
    }
  }
  
  //多人加入音视频处理
  function RTCNumberCheck(peopleNum,params){
    //弹窗提示：n>9  （n>3）展示
    var tipStr1 = '会议室中视频通话人数已超过 3 人，您将以音频模式加入会议室。';
    var tipStr2 = '会议室中视频通话人数已超过 5 人，您将以旁听者模式加入会议室。';
    
    if(peopleNum <3){
      // 隐藏 login, 展示 rtc
      Dom.hideByClass(ClassName.LOGIN_PAGE);
      Dom.showByClass(ClassName.RTC_PAGE);
      var videoEnable = params.videoEnable,
        audioEnable = params.audioEnable,
        resolution = params.resolution;
      addUserBox({ id: loginUserId });
      publishSelfMediaStream(videoEnable, audioEnable, resolution).then(
        addUserStream, publishStreamError);
    }else if(peopleNum>=3 && peopleNum<5){
      sealAlert(tipStr1,{
        isShowCancel: true,
        confirmCallback: function(){
          Dom.hideByClass(ClassName.LOGIN_PAGE);
          Dom.showByClass(ClassName.RTC_PAGE);
          Dom.hideByClass('rong-share-openicon');
          Dom.showByClass('rong-share-closeicon');
          
          RTCJoinConfirm(peopleNum,params)
        },
        cancelCallback: joinCancel
      })
    }else if(peopleNum >= 5) {
      sealAlert(tipStr2,{
        isShowCancel: true,
        confirmCallback: function(){
          // 隐藏 login, 展示 rtc
          Dom.hideByClass(ClassName.LOGIN_PAGE);
          Dom.showByClass(ClassName.RTC_PAGE);
          Dom.hideByClass('rong-share-openicon');
          Dom.showByClass('rong-share-closeicon');
          RTCJoinConfirm(peopleNum,params)
        },
        cancelCallback: joinCancel
      })
    }
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
      appkey: RongSeal.Config.APP_ID,
      // debug: true,
      logger: (log) => {
        console.log(JSON.stringify(log));
      },
      RongIMLib: win.RongIMLib,
      mode: RongRTC.RTC,
      mounted: function () { },
      error: function (err) {
        if (rongRTC.ErrorType.NETWORK_UNAVAILABLE == err.code) {
          RongSeal.eventEmitter.emit(EventName.NETWORK_ERROR);
          console.log('rtc err:', err)
        }
        // backLoginPage();
        sealToast.destroy();
      }
    });
    rongRTCRoom = new rongRTC.Room({
      id: params.roomId,
      // joined: addUserBox,
      left: removeUserBox
    });
    rongRTCStream = new rongRTC.Stream({
      // published: addUserStream,
      published: addVideoViewBox,
      unpublished: removeUserStream,
      disabled: hideUserVideo,
      enabled: showUserVideo,
      muted: hideUserAudio,
      unmuted: showUserAudio
    });
    joinRoom(params.roomId, params.token).then(function (roomUsers) {
      console.log(roomUsers.users.length)
      var peopleNum = roomUsers.users.length;
      // var peopleNum = 4;
      RTCNumberCheck(peopleNum,params);

      // var videoEnable = params.videoEnable,
      //   audioEnable = params.audioEnable,
      //   resolution = params.resolution;
      // addUserBox({ id: loginUserId });
      // publishSelfMediaStream(videoEnable, audioEnable, resolution).then(
      //   addUserStream, publishStreamError);
    }, joinRoomError);
    RongSeal.rongRTCRoom = rongRTCRoom;

  };

  RongSeal.startRTC = startRTC;
  RongSeal.clearBox = clearBox;
  RongSeal.destroyRongRTCPage = destroyRongRTCPage;
  RongSeal.videoTimer = videoTimer;
  RongSeal.userStreams = userStreams;

})({
  win: window,
  RongRTC: window.RongRTC,
  RongSeal: window.RongSeal,
  RongScreenShare: window.RongScreenShare,
  RongMedia: window.RongMedia,
  globalConfig: window.RongSeal.Config
});