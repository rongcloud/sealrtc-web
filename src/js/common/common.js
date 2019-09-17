(function (dependencies) {
  var win = dependencies.win;
  var RongSeal = win.RongSeal;
  var setting = RongSeal.setting;
  var utils = RongSeal.utils;
  var url = setting.server;

  var ENUM = {};
  ENUM.Mode = {
    Normal: 0, // 开启摄像头麦克风
    Bystander: 2, // 旁观者模式
    Audio: 1 // 音频模式
  };
  ENUM.StreamType = {
    NODE: -1,
    AUDIO: 0,
    VIDEO: 1,
    AUDIO_AND_VIDEO: 2
  };
  ENUM.RoomInfoMsgName = 'SealRTC:SetRoomInfo';

  function modeToStreamType(mode) {
    var Mode = ENUM.Mode,
      StreamType = ENUM.StreamType;
    switch (mode) {
      case Mode.Normal:
        return StreamType.AUDIO_AND_VIDEO;
      case Mode.Bystander:
        return StreamType.NODE;
      case Mode.Audio:
        return StreamType.AUDIO;
      default:
        return StreamType.AUDIO_AND_VIDEO;
    }
  }

  var Store = (function (config) {
    config = config || {};
    var prefix = config.prefix || 'r-srtc-ie-' + setting.appkey;
    var genKey = function (key) {
      return utils.tplEngine('{prefix}_{key}', {
        prefix: prefix,
        key: key
      });
    };
    var set = function (key, value) {
      var result = {
        value: value
      };
      localStorage.setItem(genKey(key), utils.toJSON(result));
    };
    var get = function (key) {
      var result = localStorage.getItem(genKey(key));
      result = utils.parse(result) || {};
      return result.value;
    };
    var remove = function (key) {
      localStorage.removeItem(genKey(key));
    };
    return {
      set: set,
      get: get,
      remove: remove
    };
  })();

  /**
   * 获取存储 rtc storage 的用户信息
   * @param {object} params 
   * @param {string} params.userId
   * @param {string} params.userName
   * @param {number} params.joinMode
   */
  function getRTCUserMessage(params) {
    params = params || {};

    var userId = params.userId;

    var message = {
      name: ENUM.RoomInfoMsgName,
      content: {
        infoKey: userId,
        infoValue: params
      }
    };

    return message;
  }

  var TokenStoreKey = 'token';
  var TokenStore = {
    get: function (phone) {
      var tokens = Store.get(TokenStoreKey) || {};
      return tokens[phone];
    },
    set: function (phone, token) {
      var tokens = Store.get(TokenStoreKey) || {};
      tokens[phone] = token;
      Store.set(TokenStoreKey, tokens);
    }
  };

  var UserStoreKey = 'user';
  var UserStore = {
    get: function () {
      return Store.get(UserStoreKey) || {};
    },
    set: function (phone, roomId, userName) {
      Store.set(UserStoreKey, {
        phone: phone,
        roomId: roomId,
        userName: userName
      });
    }
  };

  var ResolutionStoreKey = 'resolution';
  var ResolutionStore = {
    get: function () {
      return Store.get(ResolutionStoreKey);
    },
    set: function (resolution) {
      Store.set(ResolutionStoreKey, resolution);
    }
  };

  /**
   * 设置 RTC 房间用户
   */
  function setRTCUser(rongStorage, user, joinMode) {
    user = user || {};
    user.joinMode = joinMode;
    user.joinTime = Date.now();
    var message = getRTCUserMessage(user),
      key = user.userId;

    formatedUser = utils.toJSON(user);
    return rongStorage.set(key, formatedUser, message).then(function () {
      var users = {};
      users[user.userId] = user;
      return {
        message: message,
        users: users
      };
    });
  }

  function getRTCUserList(rongStorage) {
    return rongStorage.get([]).then(function (items) {
      utils.forEach(items, function (value, key) {
        items[key] = utils.parse(value);
      });
      return items;
    });
  }

  function Timer() {
    var intervalTime = 1000;
    var interval;
    var context = this;

    context.time = 0;
    context.isStaring = false;
    
    context.start = function () {
      interval = setInterval(function() {
        context.time++;
        context.isStaring = true;
      }, intervalTime);
    };

    context.stop = function () {
      clearInterval(interval);
      context.isStaring = false;
      context.time = 0;
    };

    return this;
  }

  /* 计时时间 */
  function formatTime(time) {
    var hour = Math.floor(time / 3600 % 24);
    var minite = Math.floor(time / 60 % 60);
    var second = Math.floor(time % 60);
    var timeList = [hour, minite, second];
    utils.forEach(timeList, function (time, index) {
      time = time + '';
      if (time.length < 2) {
        timeList[index] = '0' + time;
      }
    });
    return timeList.join(':');
  }

  RongSeal.common = {
    Store: Store,
    TokenStore: TokenStore,
    UserStore: UserStore,
    setRTCUser: setRTCUser,
    ResolutionStore: ResolutionStore,
    getRTCUserList: getRTCUserList,
    modeToStreamType: modeToStreamType,
    Timer: Timer,
    formatTime: formatTime,
    ENUM: ENUM
  };
})({
  win: window
});