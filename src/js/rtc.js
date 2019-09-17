(function (RongSeal, dependencies) {
  /* 音视频逻辑 */

  var win = dependencies.win,
    Vue = win.Vue,
    RongRTC = win.RongRTC,
    RongIMLib = win.RongIMLib;
  var utils = RongSeal.utils,
    Defer = utils.Defer,
    common = RongSeal.common,
    service = RongSeal.service,
    ENUM = common.ENUM,
    Mode = ENUM.Mode,
    Logger = utils.Logger,
    setting = RongSeal.setting;

  var rtcInstance = {};

  var SelfName = '自己';

  var rongRTC, rongRoom, rongStream, rongStorage;
  var selfId;

  var RTCUsers = {
    users: {},
    set: function (users) {
      utils.forEach(users, function (user, userId) {
        RTCUsers.users[userId] = user;
        updateUserName(userId);
      });
    },
    remove: function (id) {
      delete RTCUsers.users[id];
    },
    get: function (userId) {
      return RTCUsers.users[userId] || {};
    },
    getName: function (userId) {
      var user = RTCUsers.users[userId] || {};
      return user.userName || userId;
    },
    getCount: function () {
      var users = RTCUsers.users;
      var count = 0;
      utils.forEach(users, function () {
        count++;
      });
      return count;
    }
  };

  function reloadPage() {
    win.location.reload();
  }

  function updateUserName(userId) {
    var Tag = RongRTC.Tag;
    var userName = RTCUsers.getName(userId);
    Logger.log('设置用户信息', userId, userName);
    var user = {
      id: userId,
      name: userName,
      stream: {
        tag: Tag.RTC
      }
    };
    rongStream.update(user).catch(function (e) {
      console.log('更新失败', e);
    });
    user.stream.tag = Tag.ScreenShare;
    rongStream.update(user);
  }

  function toLoginPage() {
    var instance = RongSeal.instance;
    instance.$router.push({
      name: 'login'
    });
  }

  function subscribe(user) {
    var updateCount = 0, updateTime = 1000, maxUpdateCount = 10;
    var updateName = function (id) {
      setTimeout(function() {
        updateCount++;
        updateUserName(id);
        updateCount < maxUpdateCount && updateName(id);
      }, updateTime);
    };

    var id = user.id;
    user.name = RTCUsers.getName(id) || id;
    return rongStream.subscribe(user).then(function (result) {
      updateName(id);
      Logger.log('订阅成功', result);
    }).catch(function (error) {
      Logger.log('订阅失败', error);
    });
  }

  function unsubscribe(user) {
    return rongStream.unsubscribe(user).then(function (result) {
      Logger.log('取消订阅成功', result);
    }).catch(function (error) {
      Logger.log('取消订阅失败', error);
    });
  }

  /**
   * 发布/取消发布
   * @param {string} user.id 用户 id
   * @param {string} user.name 用户名
   * @param {string} user.isPublish
   * @param {string} user.stream.type 类型
   * @param {string} user.stream.tag
   * @param {string} user.stream.resolution 分辨率
   */
  function handlePublish(user) {
    user = user || {};
    var isPublish = user.isPublish;

    var success = function () {
      return Logger.log('处理资源成功');
    };
    var error = function (e) {
      return Logger.log('处理资源失败', e);
    };
    if (isPublish) {
      return rongStream.publish(user).then(success).catch(error);
    } else {
      return rongStream.unpublish(user).then(success).catch(error);
    }
  }

  function resize(user) {
    var id = user.id;
    var isSelf = selfId === id;
    !isSelf && rongStream.resize(user).then(function () {
      Logger.log('切换大小流成功', user);
    }).catch(function () {
      Logger.log('切换大小流失败', user);
    })
  }

  function initRTC(roomId) {
    rongRTC = new RongRTC({
      id: 'EngineComponent',
      RongIMLib: RongIMLib,
      error: function (error) {
        Logger.log('error', error);
        alert('网络已断开');
        window.location
      },
      logger: function (log) {
        Logger.log(JSON.stringify(log));
      }
    });
    rongRoom = new rongRTC.Room({
      id: roomId,
      joined: function (user) {
        Logger.log(user.id + '加入房间');
      },
      left: function (user) {
        RTCUsers.remove(user.id);
        setTime();
        Logger.log(user, 'user.id 离开房间');
      }
    });
    rongStream = new rongRTC.Stream({
      published: subscribe,
      unpublished: unsubscribe,
      resized: resize
    });
    window.rongStream = rongStream;
    rongStorage = new rongRTC.Storage();
    new rongRTC.Message({
      received: receiveMessage
    });
  }

  function publishRTC(roomInfo) {
    var Tag = RongRTC.Tag,
      Rotate = RongRTC.Rotate;
    var userId = roomInfo.userId;
    var mode = roomInfo.mode,
      resolution = roomInfo.resolution;

    var isBystander = mode === Mode.Bystander;
    var type = common.modeToStreamType(mode);
    
    !isBystander && handlePublish({
      id: userId,
      name: SelfName,
      isZoomIn: true,
      stream: {
        tag: Tag.RTC,
        type: type,
        resolution: resolution,
        rotate: Rotate.ROTATE_X
      },
      isPublish: true
    });
  }

  function publishScreenShare(userId, isPublish) {
    var Tag = RongRTC.Tag;
    var StreamType = rongRTC.StreamType;
    return handlePublish({
      id: userId,
      name: SelfName,
      stream: {
        tag: Tag.ScreenShare,
        type: StreamType.VIDEO
      },
      isPublish: isPublish
    });
  }

  function joinRoom(roomInfo) {
    var userId = roomInfo.userId;

    return rongRoom.join({
      id: userId
    }).then(function (users) {
      Logger.log("加入房间成功", users);
    }, function (error) {
      Logger.log(error);
    });
  }

  function getSelfRTCUser(context) {
    var userId = context.userId;
    var Tag = RongRTC.Tag;
    return {
      id: userId,
      stream: {
        tag: Tag.RTC
      }
    };
  }

  function handleCamera() {
    var context = this,
      isOpen = !context.isCameraOpened,
      user = getSelfRTCUser(context),
      video = rongStream.video,
      func = isOpen ? video.enable : video.disable;

    if (!context.isCameraAvailable) {
      return;
    }
    
    func(user).then(function () {
      context.isCameraOpened = isOpen;
    });
  }

  function handleMic() {
    var context = this,
      isOpen = !context.isMicOpened,
      user = getSelfRTCUser(context),
      audio = rongStream.audio,
      func = isOpen ? audio.unmute : audio.mute;

    if (!context.isMicAvailable) {
      return;
    }
    
    func(user).then(function () {
      context.isMicOpened = isOpen;
    });
  }

  function setSelfMediaType(mode, context) {
    var isCameraAvailable = false, isMicAvailable = false;
    switch(mode) {
      case Mode.Normal:
        isCameraAvailable = true;
        isMicAvailable = true;
        break;
      case Mode.Bystander:
        isCameraAvailable = false;
        isMicAvailable = false;
        break;
      case Mode.Audio:
        isCameraAvailable = false;
        isMicAvailable = true;
        break;
    }
    context.isCameraAvailable = context.isCameraOpened = isCameraAvailable;
    context.isMicAvailable = context.isMicOpened = isMicAvailable;
  }

  function setTime() {
    var context = rtcInstance;
    var count = RTCUsers.getCount();
    var timer = context.roomTimer;
    if (!timer.isStaring && count >= 2) {
      timer.start();
    }
    if (timer.isStaring && count < 2) {
      timer.stop();
    }
  }

  function receiveMessage(message) {
    utils.Logger.log('receive message', message);
    var content = message.content;
    switch (message.name) {
      case ENUM.RoomInfoMsgName:
        var key = content.infoKey;
        var users = {};
        users[key] = content.infoValue;
        RTCUsers.set(users);
        setTime()
        break;
      default:
        break;
    }
  }

  function initRTCUsers(user, mode) {
    return Defer.all([
      common.getRTCUserList(rongStorage),
      common.setRTCUser(rongStorage, user, mode)
    ]).then(function (result) {
      var users = result[0],
        selfUserInfo = result[1];
      RTCUsers.set(users);
      RTCUsers.set(selfUserInfo.users);
      setTime();
    });
  }

  RongSeal.rtc = Vue.component('r-rtc', {
    template: '#rong-template-rtc',
    data: function () {
      return {
        userId: '',
        roomId: '',
        userName: '',
        roomTimer: new common.Timer(),
        isScreenSharing: false,
        isCameraOpened: true,
        isMicOpened: true,
        isCameraAvailable: true,
        isMicAvailable: true
      };
    },
    mounted: function () {
      rtcInstance = this;
      var context = this,
        params = context.$route.params,
        roomId = params.roomId,
        mode = params.mode;
      
      context.userId = selfId = params.userId;
      context.roomId = roomId;
      context.userName = params.userName;
      
      setSelfMediaType(mode, context);
      initRTC(roomId);
      
      joinRoom(params).then(function () {
        return initRTCUsers(params, mode);
      }).then(function () {
        return publishRTC(params);
      });
    },
    computed: {
      roomTime: function () {
        var time = this.roomTimer.time;
        return common.formatTime(time);
      }
    },
    methods: {
      hungup: function () {
        rongRoom.leave().then(function () {
          service.logoutIM();
          service.clearAuth();
          // toLoginPage();
          reloadPage();
        });
        setTimeout(function() {
          reloadPage();
        }, 1000);
      },
      startScreenshare: function () {
        var context = this;
        var isScreenSharing = !context.isScreenSharing;
        publishScreenShare(this.userId, isScreenSharing).then(function () {
          context.isScreenSharing = isScreenSharing;
        });
      },
      handleCamera: handleCamera,
      handleMic: handleMic
    }
  });

})(window.RongSeal, {
  win: window
});