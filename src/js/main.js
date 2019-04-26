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
  var CustomVideoOpt = common.UI.customVideoOpt;

  var videoTimer = new common.SealTimer();
  var sealToast = new common.SealToast();
  var EventName = RongSeal.EventName;
  var ClassName = {
    LOGIN_PAGE: 'rong-login',
    RTC_PAGE: 'rong-rtc',
    USER_TITLE: 'rong-user-title',
    ROOM_TITLE: 'rong-room-title',
    HANGUP_BUTTON: 'rong-opt-hangup',
    WHITEBOARD_BUTTON: 'rong-opt-wb',
    SCREENSHARE_BUTTON: 'rong-opt-share',
    USER_LIST_BUTTON: 'rong-opt-userlist',
    USER_LIST_CLOSE_BUTTON: 'user-list-close',
    USER_CUSTOM_VIDEO_OPEN_BUTTON: 'rong-opt-custom-video',
    USER_CUSTOM_VIDEO_CLOSE_BUTTON: 'rong-opt-custom-video-close',
    STREAM_BOX: 'rong-stream-wrap',
    CASE_PRE_BTN: 'rong-case-pre',
    CASE_NEXT_BTN: 'rong-case-next'
  };
  var VideoPrefix = {
    STREAM: 'Rong-{id}'
  };
  var loginUserId, rongRTC, rongRTCRoom, rongRTCStream, rongRTCMessage, rongStorage, rongReport;
  var rongRTCPage, streamList, CustomVideoTagName, hasCustomVideoTag;
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
    // NORMAL: 'normal',
    NORMAL: 'RongCloudRTC',
    SCREENSHARE: 'screenshare',
    PROMOTIONAL_VIDEO: 'RongRTCFileVideo-'
  };

  var JoinMode = {
    SRJoinModeAV: 0,
    SRJoinModeAudioOnly: 1,
    SRJoinModeObserver: 2
  };

  var LimitNum = {
    SRJoinNumAV: 9,
    SRJoinNumAudioOnly: 30
  }

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
    }else if(stramBoxList.length === 2) {
      stramBoxList.forEach(function(item) {
        if(item.tag){
          sealToast.show();
        }
      })
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
    if (hangUpDom) {
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
  function getVideoAttr(key, value) {
    return utils.tplEngine('video[{key}={value}]', {
      key: key,
      value: value
    });
  }
  function getVideoByAttr(id){
    var value = utils.tplEngine(VideoPrefix.STREAM, {
      id
    });
    var arrt = getVideoAttr('stream', value);
    return Dom.get(arrt);
  }
  function showResolution(id) {
    var node = getVideoByAttr(id);
    node.onloadeddata = function () {
      createResolutionDom(node)
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
    var streamBox = StreamBox.get(user.id);
    if (isSelf) {
      var stream = user.stream;
      var ms = stream.mediaStream;
      var tag = stream.tag;
      var userId = user.id;
      var isShare = CustomizeTag.SCREENSHARE === tag;
      if (!isShare) {
        showUserStream(user);
      }
      if (isShare) {
        var node = getVideoByAttr(user.id);
        node && node.pause();
      }
      userStreams.add(user);
      setStreamBox(userId, ms);
      streamBox.closeFlibScreenShare();
    } else {
      console.log('有人订阅了----')
      user.stream.size = rongRTC.StreamSize.MIN;
      rongRTCStream.subscribe(user).then(function (user) {
        showUserStream(user);
        setStreamBox(user.id, user.stream.type);
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
      if(user.id === loginUserId) {
        streamBox.dom.childNodes[3].childNodes[1].style.display = 'inline-block';
      }
    }, function () {
      sealAlert(localeData.openAudioError);
    });
  }

  function closeAudio(user) {
    var audio = rongRTCStream.audio;
    var streamList = userStreams.getList(user.id);
    user = streamList[streamList.length - 1];
    audio.mute(user).then(function () {
      var streamBox = StreamBox.get(user.id);
      streamBox.closeAudioBySelf();
      if(user.id === loginUserId) {
        streamBox.dom.childNodes[3].childNodes[1].style.display = 'none';
      }
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
    rongRTCStream.resize(user).then(function () {
      console.log('resize success')
    }, function (err) {
      console.log('resize err user:', user)
      console.log('resize err:', err)
      sealAlert(localeData.switchStreamError);
    });
  }

  function addUserBoxSetting(user) {
    var id = user.id,
      isSelf = id === loginUserId;
    var name = isSelf ? localeData.self : user.name;
    var resizeEvent = isSelf ? null : resizeStream;
    var streamBox = new StreamBox(id, {
      resizeEvent: resizeEvent,
      name: name
    });
    streamList.addBox(streamBox);
    if (isSelf) {
      utils.Dom.addClass(streamBox.dom, 'rong-is-self');
      streamBox.zoom(user);
    } else {
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
  }
  
  function addUserBox(user) {
    console.log('join user', JSON.stringify(user))
    var id = user.id,
      isSelf = id === loginUserId;
    if(!isSelf){
      //删除多端挤掉的盒子
      var box = StreamBox.get(id);
      if(box){
        streamList.removeBox(box);
        stopVideoTimer();
        rongRTCStream.unsubscribe(user).then(function(){
          console.log('unsub success');
          addUserBoxSetting(user);
        });
      }else {
        addUserBoxSetting(user);
      }
    }else {
      addUserBoxSetting(user);
    }
  }
  function getCurrentUserName() {
    var userNameStr = Dom.getById('rongUserName').innerText;
    return userNameStr.substring(5,userNameStr.length);
  }
  function getCustomVideoName(currentUserName,videoFileName) {
    return CustomizeTag.PROMOTIONAL_VIDEO+currentUserName+'-'+videoFileName;
  }
  function hasCustomFileVideo() {
    var userBoxList = streamList.streamBoxList;
    hasCustomVideoTag = false
    for(var key in userBoxList){
      if(userBoxList[key].tag){
        hasCustomVideoTag = true;
        // var userName = userBoxList[key].userName;
      }
    }
    return hasCustomVideoTag;
  }
  function addCustomVideoBox(user,videoId) {
    console.log(user,videoId,'addCustomVideoBox');
    var isSelf = user.id === loginUserId;
    var targetBox,currentUserName,videoFileName;
    targetBox = StreamBox.get(loginUserId);
    currentUserName = getCurrentUserName();
    var streamBox = new StreamBox(user.id+'custom', {
      resizeEvent: resizeStream,
      name: currentUserName,
      tag: CustomizeTag.PROMOTIONAL_VIDEO
    });
    streamList.insertBox(streamBox,targetBox);
    streamBox.setCustomVideoUI(currentUserName);
    var videoDom = streamBox.dom.children[0];
    videoDom.loop = true;
    if(isSelf) {
      if(videoId === 1){
        videoDom.src = './videos/video_demo1.mp4';
        videoFileName = 'video1';
      }else {
        videoDom.src = './videos/video_demo2.mp4';
        videoFileName = 'video2';
      }
      var count = 0;
      streamBox.setCustomVideoUI(currentUserName+'-'+'自定义视频');
      CustomVideoTagName = getCustomVideoName(currentUserName,videoFileName);
      videoDom.oncanplay = function(){
        if(count > 0){
          return;
        }
        count+=1;
        var ms = videoDom.captureStream();
        user = {
          id: loginUserId,
          stream: {
            tag: CustomVideoTagName,
            type: 2,
            mediaStream: ms
          }
        }
        rongRTCStream.publish(user).then(function () {
          console.log('pub success,customvideo');
          CustomVideoOpt.showCustomVideoCloseBtn();
        },function (err) {
          console.log('custom video pub err',err);
          removeCustomVideoBox({id: loginUserId},null);
        })
      }
    }else {
      var streamInfo = user.stream.tag.split('-');
      streamBox.setCustomVideoUI(streamInfo[1]+'-'+'自定义视频');
      rongRTCStream.subscribe(user).then(function (user) {
        videoDom.srcObject = user.stream.mediaStream;
      }, function (error) {
        sealAlert(localeData.subscriptError + JSON.stringify(error));
      });
    }
  }
    
  function removeCustomVideoBox(user,callback) {
    var streamBox = StreamBox.get(user.id+'custom');
    streamList.removeBox(streamBox);
    hasCustomVideoTag = false;
    var isRemoveBoxZoom = streamBox.isZoom;
    var streamBoxList = streamList.streamBoxList;
    if (isRemoveBoxZoom) {
      for (var key in streamBoxList) {
        streamBox = streamBoxList[key];
        if (streamBox.id === loginUserId) {
          streamBox.zoom();
        }
      }
    }
    var isSelf = user.id === loginUserId;
    if(isSelf){
      user = {
        id: loginUserId,
        stream: {
          tag: CustomVideoTagName,
          type: 2
        }
      }
      rongRTCStream.unpublish(user).then(function () {
        CustomVideoOpt.showCustomVideoOpenBtn();
        callback();
      }).catch(function (err) {
        console.log(err)
      });
    }
  }

  function removeUserBox(user) {
    console.log('left user:', user)
    var id = user.id;
    var streamBox = StreamBox.get(id);
    var customVideoBox = StreamBox.get(id+'custom');
    if(customVideoBox) {
      streamList.removeBox(customVideoBox);
      StreamBox.clearQuitUser(id+'custom');
    }
    if (streamBox) {
      var isRemoveBoxZoom = streamBox.isZoom;
      streamList.removeBox(streamBox);
      StreamBox.clearQuitUser(id);
    }
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
    removeRtcUserInfos(user.id,null,function(){
      // to do
    });
  }

  function removeUnpublishUser(user) {
    if(user.stream.tag.substring(0,17) === CustomizeTag.PROMOTIONAL_VIDEO){
      removeCustomVideoBox(user)
    }else {
      removeUserStream(user)
    }
  }
  function publishSelfMediaStream(videoEnable, audioEnable, resolution, audioOnly) {
    return new Promise(function (resolve, reject) {
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
    // userTitleDom.textContent = localeData.user + ': ' + params.userId;
    userTitleDom.textContent = localeData.userName + ': ' + RongSeal.userInfo.userName;

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
    removeRtcUserInfos(loginUserId,RongSeal.roomMsg,function(){
      rongRTCRoom.leave().then(function () {
        console.log('quit---')
        RongSeal.im.disconnect();
      }, function () {
        RongSeal.im.disconnect();
      });
      common.UI.backLoginPage();
      RongSeal.videoTimer.stop();
      RongSeal.userStreams.clearUsers();
      sealToast.destroy();
      RongSeal.destroyRongRTCPage();
    });
  }
  function cancelPublishedStream() {
    var streamBox = StreamBox.get(loginUserId+'custom');
    if(streamBox) {
      removeCustomVideoBox({id: loginUserId},function(){
        quit();
      })
    }else {
      quit();
    }
  }
  function switchLocalVideo(e) {
    var currentTargetVideo = e.target.id;
    if(currentTargetVideo === 'rong-customVideo1') {
      //创建标签 添加标签
      addCustomVideoBox({id: loginUserId},1);
    }else {
      addCustomVideoBox({id: loginUserId},2);
    }
  }
  
  function bindRTCBtnEvent() {
    var hangupBtn = Dom.getByClass(ClassName.HANGUP_BUTTON),
      // whiteboardBtn = Dom.getByClass(ClassName.WHITEBOARD_BUTTON),
      screenShareBtn = Dom.getByClass(ClassName.SCREENSHARE_BUTTON),
      userListBtn = Dom.getByClass(ClassName.USER_LIST_BUTTON),
      userListCloseBtn = Dom.getByClass(ClassName.USER_LIST_CLOSE_BUTTON),
      userCustomVideoBtn = Dom.getByClass(ClassName.USER_CUSTOM_VIDEO_OPEN_BUTTON),
      userCustomVideoCloseBtn = Dom.getByClass(ClassName.USER_CUSTOM_VIDEO_CLOSE_BUTTON);
    hangupBtn.onclick = cancelPublishedStream;
    // whiteboardBtn.onclick = '';
    userListBtn.onclick = common.UI.showUserList;
    userListCloseBtn.onclick = common.UI.hideUserList;
    userCustomVideoBtn.onclick = function(){
      // var explorer =navigator.userAgent ;
      var isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
      if(isSafari) {
        sealAlert('请使用 Chrome 浏览器体验此功能');
        return;
      }
      if(!hasCustomFileVideo()){
        CustomVideoOpt.switchCustomVideo();
      }else {
        sealAlert(localeData.publishedCustomVideo);
      }
    };
    userCustomVideoCloseBtn.onclick = function(){
      removeCustomVideoBox({id: loginUserId})
    };
    screenShareBtn.onclick = switchScreenShare;
    win.onbeforeunload = cancelPublishedStream;
    Dom.getById('rong-customVideo1').onclick = switchLocalVideo;
    Dom.getById('rong-customVideo2').onclick = switchLocalVideo;
  }

  function getJoinUserName(user,callback) {
    getRtcUserInfos([]).then(function(infos){
      for(var key in infos){
        var userInfo = JSON.parse(infos[key]);
        if(user.id == userInfo.userId){
          user.name = userInfo.userName;
          callback();
        }
      }
    })
  }
  function addVideoViewBox(user) {
    console.log(user,new Date().getTime(),'published-addVideoViewBox')
    if (user.stream.tag === 'screenshare') {
      addUserStream(user);
      return;
    }
    if(user.stream.tag.substring(0,17) === CustomizeTag.PROMOTIONAL_VIDEO) {
      addCustomVideoBox(user);
      return ;
    }
    getJoinUserName(user,function(){
      addUserBox(user);
    })
  }

  function joinCancel() {
    cancelPublishedStream();
  }
  function RTCJoinConfirm(peopleNum, params) {
    addUserBox({ id: loginUserId });
    var streamBox = StreamBox.get(loginUserId);
    if(peopleNum < LimitNum.SRJoinNumAV){
      if(params.videoEnable == false){
        unpublishedVideoUI();
        streamBox.disabledVideoBySelf();
      }
    }else if (peopleNum >= LimitNum.SRJoinNumAV && peopleNum < LimitNum.SRJoinNumAudioOnly) {
      streamBox.disabledVideoBySelf();
      var audioOnly = true;
      publishSelfMediaStream(false, true, params.resolution, audioOnly).then(
        addUserStream, publishStreamError);
    } else if (peopleNum >= LimitNum.SRJoinNumAudioOnly) {
      streamBox.closeVideoBySelf();
      streamBox.closeAudioBySelf();
      streamBox.disabledVideoBySelf();
      streamBox.disabledAudioBySelf();
    }
  }
  function unpublishedVideoUI() {
    Dom.hideByClass(ClassName.LOGIN_PAGE);
    Dom.showByClass(ClassName.RTC_PAGE);
    Dom.hideByClass('rong-share-openicon');
    Dom.showByClass('rong-share-closeicon');
  }
  //多人加入音视频处理
  function RTCNumberCheck(peopleNum, params) {
    //弹窗提示：n>9  （n>3）展示
    var tipStr1 = '会议室中视频通话人数已超过 9 人，您将以音频模式加入会议室。';
    var tipStr2 = '会议室中视频通话人数已超过 30 人，您将以旁听者模式加入会议室。';
    if(params.bystanderEnable == false) {
      if (peopleNum < LimitNum.SRJoinNumAV) {
        // 隐藏 login, 展示 rtc
        Dom.hideByClass(ClassName.LOGIN_PAGE);
        Dom.showByClass(ClassName.RTC_PAGE);
        var videoEnable = params.videoEnable,
          audioEnable = params.audioEnable,
          resolution = params.resolution;
        RTCJoinConfirm(peopleNum, params)
        publishSelfMediaStream(videoEnable, audioEnable, resolution).then(
          addUserStream, publishStreamError);
      } else if (peopleNum >= LimitNum.SRJoinNumAV && peopleNum < LimitNum.SRJoinNumAudioOnly) {
        sealAlert(tipStr1, {
          isShowCancel: true,
          confirmCallback: function () {
            unpublishedVideoUI();
            RTCJoinConfirm(peopleNum, params)
          },
          cancelCallback: joinCancel
        })
      } else if (peopleNum >= LimitNum.SRJoinNumAudioOnly) {
        sealAlert(tipStr2, {
          isShowCancel: true,
          confirmCallback: function () {
            // 隐藏 login, 展示 rtc
            unpublishedVideoUI();
            RTCJoinConfirm(peopleNum, params)
          },
          cancelCallback: joinCancel
        })
      }
    }else {
      addUserBox({ id: loginUserId });
      unpublishedVideoUI();
      CustomVideoOpt.hideCustomVideoOpenBtn();
      var streamBox = StreamBox.get(loginUserId);
      streamBox.closeVideoBySelf();
      streamBox.closeAudioBySelf();
      streamBox.disabledVideoBySelf();
      streamBox.disabledAudioBySelf();
    }
  }

  function getRtcMode(peopleNum,params) {
    var joinMode;
    if(params.bystanderEnable == true){
      //观察者
      joinMode = JoinMode.SRJoinModeObserver
    }else {
      if(peopleNum < LimitNum.SRJoinNumAV){
        //音视频
        if(params.videoEnable == false) {
          joinMode = JoinMode.SRJoinModeAudioOnly;
        }else {
          joinMode = JoinMode.SRJoinModeAV;
        }
      }else if(peopleNum >= LimitNum.SRJoinNumAV && peopleNum < LimitNum.SRJoinNumAudioOnly){
        //音频
        joinMode = JoinMode.SRJoinModeAudioOnly;
      }else {
        //观察者
        joinMode = JoinMode.SRJoinModeObserver;
      }
    }
    return joinMode;
  }
  function userListSortByDesc(list) {
    for(var i=0;i<list.length;i++){
      for(var j=0;j<list.length-1;j++){
        if(list[j].joinTime < list[j+1].joinTime){
          var temp = list[j+1]; //元素交换
          list[j+1] = list[j];
          list[j] = temp;
        }
      }
    }
    return list;
  }
  function getRtcUserInfos(InfosKey){
    return new Promise(function(resolve, reject){
      RongSeal.rongStorage.get(InfosKey).then(function (infos){
        resolve(infos)
      }).catch(function (err){
        // console.log(err)
        reject('getRtcUserInfos',err);
      })
    });
  }
  function setRtcUserInfos() {
    RongSeal.rongStorage.get([]).then(function (infos){
      var userList = [];
      for(var key in infos){
        var userInfo = JSON.parse(infos[key]);
        userList.push(userInfo);
      }
      var list = userListSortByDesc(userList)
      common.UI.userListView(list);
    }).catch(function (err){
      console.log('setRtcUserInfos',err)
    })
  }
  function removeRtcUserInfos(leftUserId,roomMsg,callback) {
    if(leftUserId == loginUserId){
      RongSeal.rongStorage.remove(leftUserId,roomMsg).then(function(){
        console.log('set success');
        callback();
      });
    }else {
      getRtcUserInfos([]).then(function(infos){
        var userList = [];
        delete infos[leftUserId];
        for(var key in infos){
          var userInfo = JSON.parse(infos[key]);
          userList.push(userInfo);
        }
        var list = userListSortByDesc(userList)
        common.UI.userListView(list);
      }).catch(function(err){
        console.log('removeRtcUserInfo-s',err);
      })
    }
  }
  function receivedRoomMsg(message) {
    console.log('roommsg:',message);
    setRtcUserInfos();
  }

  function addUserSoundImg(user) {
    // console.log(user);
    var streamBox = StreamBox.get(user.id);
    if(user.stream.audioLevel > 0){
      if(streamBox) {
        streamBox.showSoundGif();
      }
    }else {
      if(streamBox) {
        streamBox.hideSoundGif();
      }
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
      unpublished: removeUnpublishUser,
      disabled: hideUserVideo,
      enabled: showUserVideo,
      muted: hideUserAudio,
      unmuted: showUserAudio
    });
    rongRTCMessage = new rongRTC.Message({
      received: receivedRoomMsg,
    })
    rongStorage = new rongRTC.Storage();
    rongReport = new rongRTC.Report({
      spoke: addUserSoundImg
    })
    joinRoom(params.roomId, params.token).then(function (roomUsers) {
      console.log(roomUsers.users.length)
      var peopleNum = roomUsers.users.length;
      RTCNumberCheck(peopleNum, params);
      rongReport.start({
        frequency: 500
      });
      //获取 room 下所有 key val,传空[]
      var mode = getRtcMode(peopleNum,params);
      var userData = RongSeal.setUserInfoObj({joinMode: mode});
      var userInfo = userData.userInfo;
      var roomMsg = userData.message;
      var key = userInfo.userId;
      var strInfo = JSON.stringify(userInfo);
      RongSeal.roomMsg = roomMsg;
      RongSeal.rongStorage.set(key,strInfo,roomMsg).then(function(){
        setRtcUserInfos();
        console.log('set store S')
      }).catch(function(err){
        console.log('set storage F:',err)
      });
    }, joinRoomError);
    RongSeal.rongRTCRoom = rongRTCRoom;
    RongSeal.rongStorage = rongStorage;
    RongSeal.rongRTCMessage = rongRTCMessage;
  };

  RongSeal.startRTC = startRTC;
  RongSeal.clearBox = clearBox;
  RongSeal.destroyRongRTCPage = destroyRongRTCPage;
  RongSeal.videoTimer = videoTimer;
  RongSeal.sealToast = sealToast;
  RongSeal.userStreams = userStreams;

})({
  win: window,
  RongRTC: window.RongRTC,
  RongSeal: window.RongSeal,
  RongScreenShare: window.RongScreenShare,
  RongMedia: window.RongMedia,
  globalConfig: window.RongSeal.Config
});