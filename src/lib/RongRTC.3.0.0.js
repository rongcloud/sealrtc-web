/*
* RongRTC.js v3.0.0
* Copyright 2019 RongCloud
* Released under the MIT License.
*/
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.RongRTC = factory());
}(this, (function () { 'use strict';

  var noop = function noop() {};
  var isObject = function isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  };
  var isArray = function isArray(arr) {
    return Object.prototype.toString.call(arr) === '[object Array]';
  };
  var isFunction = function isFunction(arr) {
    return Object.prototype.toString.call(arr) === '[object Function]';
  };
  var isString = function isString(str) {
    return Object.prototype.toString.call(str) === '[object String]';
  };
  var isBoolean = function isBoolean(str) {
    return Object.prototype.toString.call(str) === '[object Boolean]';
  };
  var isUndefined = function isUndefined(str) {
    return Object.prototype.toString.call(str) === '[object Undefined]';
  };
  var stringify = function stringify(obj) {
    return JSON.stringify(obj);
  };
  var parse = function parse(str) {
    return JSON.parse(str);
  };
  var forEach = function forEach(obj, callback) {
    callback = callback || noop;
    var loopObj = function loopObj() {
      for (var key in obj) {
        callback(obj[key], key, obj);
      }
    };
    var loopArr = function loopArr() {
      for (var i = 0, len = obj.length; i < len; i++) {
        callback(obj[i], i);
      }
    };
    if (isObject(obj)) {
      loopObj();
    }
    if (isArray(obj)) {
      loopArr();
    }
  };
  var rename = function rename(origin, newNames) {
    var isObj = isObject(origin);
    if (isObj) {
      origin = [origin];
    }
    origin = parse(stringify(origin));
    var updateProperty = function updateProperty(val, key, obj) {
      delete obj[key];
      key = newNames[key];
      obj[key] = val;
    };
    forEach(origin, function (item) {
      forEach(item, function (val, key, obj) {
        var isRename = key in newNames;
        (isRename ? updateProperty : noop)(val, key, obj);
      });
    });
    return isObject ? origin[0] : origin;
  };
  var extend = function extend(destination, sources) {
    for (var key in sources) {
      var value = sources[key];
      if (!isUndefined(value)) {
        destination[key] = value;
      }
    }
    return destination;
  };
  var Defer = Promise;
  var deferred = function deferred(callback) {
    return new Defer(callback);
  };
  var tplEngine = function tplEngine(tpl, data, regexp) {
    if (!isArray(data)) {
      data = [data];
    }
    var ret = [];
    var replaceAction = function replaceAction(object) {
      return tpl.replace(regexp || /\\?\{([^}]+)\}/g, function (match, name) {
        if (match.charAt(0) === '\\') return match.slice(1);
        return object[name] !== undefined ? object[name] : '{' + name + '}';
      });
    };
    for (var i = 0, j = data.length; i < j; i++) {
      ret.push(replaceAction(data[i]));
    }
    return ret.join('');
  };
  // 暂时支持 String
  var isContain = function isContain(str, keyword) {
    return str.indexOf(keyword) > -1;
  };
  var isEqual = function isEqual(source, target) {
    return source === target;
  };
  var Cache = function Cache(cache) {
    if (!isObject(cache)) {
      cache = {};
    }
    var set = function set(key, value) {
      cache[key] = value;
    };
    var get = function get(key) {
      return cache[key];
    };
    var remove = function remove(key) {
      delete cache[key];
    };
    var getKeys = function getKeys() {
      var keys = [];
      for (var key in cache) {
        keys.push(key);
      }
      return keys;
    };
    var clear = function clear() {
      cache = {};
    };
    return {
      set: set,
      get: get,
      remove: remove,
      getKeys: getKeys,
      clear: clear
    };
  };
  var request = function request(url, option) {
    return deferred(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      var method = option.method || 'GET';
      xhr.open(method, url, true);
      var headers = option.headers || {};
      forEach(headers, function (header, name) {
        xhr.setRequestHeader(name, header);
      });
      var body = option.body;
      var isSuccess = function isSuccess() {
        return (/^(200|202)$/.test(xhr.status)
        );
      };
      xhr.onreadystatechange = function () {
        if (isEqual(xhr.readyState, 4)) {
          var responseText = xhr.responseText;

          var result = JSON.parse(responseText);
          if (isSuccess()) {
            resolve(result);
          } else {
            reject(result);
          }
        }
      };
      xhr.send(body);
    });
    // return fetch(url, option);
  };
  var map = function map(arrs, callback) {
    return arrs.map(callback);
  };
  var filter = function filter(arrs, callback) {
    return arrs.filter(callback);
  };
  var uniq = function uniq(arrs, callback) {
    var newData = [],
        tempData = {};
    arrs.forEach(function (target) {
      var temp = callback(target);
      tempData[temp.key] = temp.value;
    });
    forEach(tempData, function (val) {
      newData.push(val);
    });
    return newData;
  };
  var some = function some(arrs, callback) {
    return arrs.some(callback);
  };
  var isEmpty = function isEmpty(obj) {
    var result = true;
    if (isObject(obj)) {
      forEach(obj, function () {
        result = false;
      });
    }
    if (isString(obj) || isArray(obj)) {
      result = obj.length === 0;
    }
    return result;
  };
  var toJSON = function toJSON(value) {
    return JSON.stringify(value);
  };
  function Timer(_option) {
    _option = _option || {};
    var option = {
      timeout: 0,
      // interval | timeout
      type: 'interval'
    };
    extend(option, _option);
    var timers = [];
    var _timeout = option.timeout,
        type = option.type;

    var timerType = {
      resume: {
        interval: function interval(callback, immediate) {
          if (immediate) {
            callback();
          }
          return setInterval(callback, _timeout);
        },
        timeout: function timeout(callback, immediate) {
          if (immediate) {
            callback();
          }
          return setTimeout(callback, _timeout);
        }
      },
      pause: {
        interval: function interval(timer) {
          return clearInterval(timer);
        },
        timeout: function timeout(timer) {
          return clearTimeout(timer);
        }
      }
    };
    this.resume = function (callback, immediate) {
      callback = callback || noop;
      var resume = timerType.resume;

      var timer = resume[type](callback, immediate);
      timers.push(timer);
    };
    this.pause = function () {
      var pause = timerType.pause;

      forEach(timers, function (timer) {
        pause[type](timer);
      });
    };
  }
  var isInclude = function isInclude(str, match) {
    return str.indexOf(match) > -1;
  };
  var clone = function clone(source) {
    return JSON.parse(JSON.stringify(source));
  };
  function Observer() {
    var observers = [];
    this.add = function (observer) {
      if (isFunction(observer)) {
        observers.push(observer);
      }
    };
    this.remove = function (observer) {
      observers = filter(observers, function (_observer) {
        return _observer !== observer;
      });
    };
    this.emit = function (data) {
      forEach(observers, function (observer) {
        observer(data);
      });
    };
  }
  function Prosumer() {
    var data = [],
        isConsuming = false;
    this.produce = function (res) {
      data.push(res);
    };
    this.consume = function (callback, finished) {
      if (isConsuming) {
        return;
      }
      isConsuming = true;
      var next = function next() {
        var res = data.shift();
        if (isUndefined(res)) {
          isConsuming = false;
          finished && finished();
          return;
        }
        callback(res, next);
      };
      next();
    };
    this.isExeuting = function () {
      return isConsuming;
    };
  }
  /* 
   prosumer.consume(function(data, next){
    //dosomething
    next();
   });
  */
  var Log = console;
  var utils = {
    Prosumer: Prosumer,
    Log: Log,
    Observer: Observer,
    Timer: Timer,
    isUndefined: isUndefined,
    isBoolean: isBoolean,
    isString: isString,
    isObject: isObject,
    isArray: isArray,
    isFunction: isFunction,
    stringify: stringify,
    parse: parse,
    rename: rename,
    extend: extend,
    clone: clone,
    deferred: deferred,
    Defer: Defer,
    forEach: forEach,
    tplEngine: tplEngine,
    isContain: isContain,
    noop: noop,
    Cache: Cache,
    request: request,
    map: map,
    filter: filter,
    uniq: uniq,
    some: some,
    isEqual: isEqual,
    isEmpty: isEmpty,
    toJSON: toJSON,
    isInclude: isInclude
  };

  var DownEvent = {
    ROOM_USER_JOINED: 'room_user_joined',
    ROOM_USER_LEFT: 'room_user_left',

    STREAM_PUBLISHED: 'stream_published',
    STREAM_UNPUBLISHED: 'stream_unpublished',
    STREAM_DISABLED: 'stream_disabled',
    STREAM_ENABLED: 'stream_enabled',
    STREAM_MUTED: 'stream_muted',
    STREAM_UNMUTED: 'stream_unmuted',

    RTC_ERROR: 'rtc_error',
    RTC_MOUNTED: 'rtc_mounted',
    RTC_UNMOUNTED: 'rtc_unmounted'
  };

  var UpEvent = {
    ROOM_JOIN: 'room_join',
    ROOM_LEAVE: 'room_leave',
    ROOM_GET: 'room_get',

    STREAM_PUBLISH: 'stream_publish',
    STREAM_UNPUBLISH: 'stream_UNPUBLISH',
    STREAM_SUBSCRIBE: 'stream_subscribe',
    STREAM_UNSUBSCRIBE: 'stream_unsubscribe',
    STREAM_RESIZE: 'stream_resize',
    STREAM_GET: 'stream_get',

    AUDIO_MUTE: 'audio_mute',
    AUDIO_UNMUTE: 'audio_unmute',

    VIDEO_DISABLE: 'video_disable',
    VIDEO_ENABLE: 'video_enable',

    DEVICE_CHECK: 'device_check',
    DEVICE_GET_LIST: 'device_get_list'
  };

  var RoomEvents = [{
    name: DownEvent.ROOM_USER_JOINED,
    type: 'joined'
  }, {
    name: DownEvent.ROOM_USER_LEFT,
    type: 'left'
  }];

  var StreamEvents = [{
    name: DownEvent.STREAM_PUBLISHED,
    type: 'published'
  }, {
    name: DownEvent.STREAM_UNPUBLISHED,
    type: 'unpublished'
  }, {
    name: DownEvent.STREAM_DISABLED,
    type: 'disabled'
  }, {
    name: DownEvent.STREAM_ENABLED,
    type: 'enabled'
  }, {
    name: DownEvent.STREAM_MUTED,
    type: 'muted'
  }, {
    name: DownEvent.STREAM_UNMUTED,
    type: 'unmuted'
  }];

  var getErrors = function getErrors() {
    var errors = [{
      code: 10000,
      name: 'INSTANCE_IS_DESTROYED',
      msg: 'RongRTC 实例已销毁，请重新创建实例'
    }, {
      code: 10001,
      name: 'IM_NOT_CONNECTED',
      msg: '请在 IM 连接成功后开始音频业务'
    }, {
      code: 10002,
      name: 'RTC_NOT_JOIN_ROOM',
      msg: '未加入房间，加入成功后方可调用业务方法'
    }, {
      code: 10003,
      name: 'SOCKET_UNAVAILABLE',
      msg: 'IM Socket 连接不可用'
    }, {
      code: 10004,
      name: 'NETWORK_UNAVAILABLE',
      msg: '网络不可用'
    }, {
      code: 20001,
      name: 'STREAM_NOT_EXIST',
      msg: 'stream 不存在，请检查传入参数, id、stream.type、stream.tag 是否正确'
    }, {
      code: 30001,
      name: 'PARAMTER_ILLEGAL',
      msg: '请检查参数，{name} 参数为必传入项'
    }, {
      code: 40001,
      name: 'NOT_IN_ROOM',
      msg: '当前用户不在房间内'
    }, {
      code: 40002,
      name: 'INTERNAL_ERROR',
      msg: 'IM Server 内部错误'
    }, {
      code: 40003,
      name: 'HAS_NO_ROOM',
      msg: 'IM Server 房间信息不存在'
    }, {
      code: 40004,
      name: 'INVALID_USERID',
      msg: 'userId 不合法'
    }, {
      code: 40005,
      name: 'REPEAT_JOIN_ROOM',
      msg: '重复加入房间'
    }];

    var errorMap = {
      Inner: {},
      Outer: {}
    };
    utils.forEach(errors, function (error) {
      var name = error.name,
          code = error.code,
          msg = error.msg;

      var info = {
        code: code,
        msg: msg
      };
      errorMap.Inner[name] = info;
      errorMap[code] = info;
      errorMap.Outer[name] = code;
    });
    return errorMap;
  };
  var ErrorType = getErrors();

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var inherits = function (subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };

  var possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };

  var slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  var toConsumableArray = function (arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    } else {
      return Array.from(arr);
    }
  };

  /* 
    data： 任意对象
    rules: 校验规则，数组
    let user = {
      id: '',
      stream: {
        type: 1,
        tag: 2
      }
    };
    // 校验必传入参数, 暂时支持 2 级
    check(user, ['id', 'stream.type', 'stream.tag', 'stream.mediaStream']);
  */
  var check = function check(data, rules) {
    var isIllegal = false,
        name = '';
    var getBody = function getBody() {
      return {
        isIllegal: isIllegal,
        name: name
      };
    };
    if (!utils.isArray(rules)) {
      rules = [rules];
    }
    if (!utils.isObject(data)) {
      throw new Error('check(data, rules): data must be an object');
    }
    utils.forEach(rules, function (rule) {
      var isTier = rule.indexOf('.') > -1;
      if (!isTier) {
        isIllegal = utils.isUndefined(data[rule]);
        if (isIllegal) {
          return name = rule;
        }
      }
      if (isTier) {
        var props = rule.split('.');

        var _props = slicedToArray(props, 2),
            parent = _props[0],
            child = _props[1];

        var parentData = data[parent];
        isIllegal = utils.isUndefined(parentData);
        if (isIllegal) {
          return name = parent;
        }
        if (!utils.isArray(parentData)) {
          parentData = [parentData];
        }
        utils.forEach(parentData, function (parent) {
          var childData = parent[child];
          isIllegal = utils.isUndefined(childData);
          if (isIllegal) {
            return name = child;
          }
        });
      }
    });
    return getBody();
  };

  var getError = function getError(name) {
    var error = ErrorType.Inner.PARAMTER_ILLEGAL;
    var msg = error.msg;

    msg = utils.tplEngine(msg, {
      name: name
    });
    return utils.extend(error, {
      msg: msg
    });
  };

  var StreamType = {
    NODE: -1,
    AUDIO: 0,
    VIDEO: 1,
    AUDIO_AND_VIDEO: 2
  };

  var StreamSize = {
    MAX: 1,
    MIN: 2
  };

  var StreamState = {
    ENABLE: 1,
    DISBALE: 0
  };

  var UserState = {
    JOINED: 0,
    LEFT: 1,
    OFFLINE: 2
  };

  var PingCount = 3;

  var LogTag = {
    ICE: 'ice',
    LIFECYCLE: 'lifecycle',
    ROOM: 'room',
    STREAM: 'stream',
    STREAM_HANDLER: 'stream_handler',
    ROOM_HANDLER: 'room_handler',
    IM: 'im'
  };

  var LogLevel = {
    INFO: 'I',
    DEBUG: 'D',
    VERBOSE: 'V',
    WARN: 'W',
    ERROR: 'E'
  };

  var EventType = {
    REQUEST: 1,
    RESPONSE: 2
  };

  function Logger() {
    var observer = new utils.Observer();
    var write = function write(level, tag, meta) {
      var time = new Date().getTime();
      var log = {
        level: level,
        tag: tag,
        meta: meta,
        time: time,
        platform: 'web'
      };
      observer.emit(log);
    };
    var warn = function warn(tag, meta) {
      return write(LogLevel.WARN, tag, meta);
    };
    var error = function error(tag, meta) {
      return write(LogLevel.ERROR, tag, meta);
    };
    var info = function info(tag, meta) {
      return write(LogLevel.INFO, tag, meta);
    };
    var log = function log(tag, meta) {
      return write(LogLevel.VERBOSE, tag, meta);
    };
    var watch = function watch(watcher) {
      observer.add(watcher);
    };
    return {
      warn: warn,
      error: error,
      info: info,
      log: log,
      watch: watch
    };
  }
  var Logger$1 = Logger();

  var Room = function () {
    function Room(option) {
      classCallCheck(this, Room);

      var context = this;
      var client = context.getClient();
      utils.forEach(RoomEvents, function (event) {
        var _event = event,
            name = _event.name,
            type = _event.type;

        client.on(name, function (error, user) {
          event = option[type] || utils.noop;
          event(user, error);
          Logger$1.log(LogTag.ROOM, {
            event: type,
            user: user
          });
        });
      });
      var id = option.id;

      utils.extend(context, {
        option: option,
        client: client,
        room: {
          id: id
        }
      });
    }

    createClass(Room, [{
      key: 'join',
      value: function join(user) {
        var _check = check(user, ['id', 'token']),
            isIllegal = _check.isIllegal,
            name = _check.name;

        if (isIllegal) {
          var error = getError(name);
          return utils.Defer.reject(error);
        }
        var room = this.room,
            client = this.client;

        utils.extend(room, {
          user: user
        });
        return client.exec({
          event: UpEvent.ROOM_JOIN,
          type: 'room',
          args: [room]
        });
      }
    }, {
      key: 'leave',
      value: function leave() {
        var room = this.room,
            client = this.client;

        return client.exec({
          event: UpEvent.ROOM_LEAVE,
          type: 'room',
          args: [room]
        });
      }
    }, {
      key: 'get',
      value: function get$$1() {
        var room = this.room,
            client = this.client;

        return client.exec({
          event: UpEvent.ROOM_GET,
          type: 'room',
          args: [room]
        });
      }
    }]);
    return Room;
  }();

  function Video(client) {
    return {
      disable: function disable(user) {
        var _check = check(user, ['id', 'stream.tag']),
            isIllegal = _check.isIllegal,
            name = _check.name;

        if (isIllegal) {
          var error = getError(name);
          return utils.Defer.reject(error);
        }
        return client.exec({
          event: UpEvent.VIDEO_DISABLE,
          type: 'stream',
          args: [user]
        });
      },
      enable: function enable(user) {
        var _check2 = check(user, ['id', 'stream.tag']),
            isIllegal = _check2.isIllegal,
            name = _check2.name;

        if (isIllegal) {
          var error = getError(name);
          return utils.Defer.reject(error);
        }
        return client.exec({
          event: UpEvent.VIDEO_ENABLE,
          type: 'stream',
          args: [user]
        });
      }
    };
  }

  function Audio(client) {
    return {
      mute: function mute(user) {
        var _check = check(user, ['id', 'stream.tag']),
            isIllegal = _check.isIllegal,
            name = _check.name;

        if (isIllegal) {
          var error = getError(name);
          return utils.Defer.reject(error);
        }
        return client.exec({
          event: UpEvent.AUDIO_MUTE,
          type: 'stream',
          args: [user]
        });
      },
      unmute: function unmute(user) {
        var _check2 = check(user, ['id', 'stream.tag']),
            isIllegal = _check2.isIllegal,
            name = _check2.name;

        if (isIllegal) {
          var error = getError(name);
          return utils.Defer.reject(error);
        }
        return client.exec({
          event: UpEvent.AUDIO_UNMUTE,
          type: 'stream',
          args: [user]
        });
      }
    };
  }

  var Stream = function () {
    function Stream(option) {
      classCallCheck(this, Stream);

      var context = this;
      var client = context.getClient();
      utils.forEach(StreamEvents, function (event) {
        var _event = event,
            name = _event.name,
            type = _event.type;

        client.on(name, function (error, user) {
          event = option[type] || utils.noop;
          event(user, error);
          Logger$1.log(LogTag.STREAM, {
            event: type,
            user: user
          });
        });
      });
      utils.extend(context, {
        option: option,
        client: client,
        video: new Video(client),
        audio: new Audio(client)
      });
    }

    createClass(Stream, [{
      key: 'publish',
      value: function publish(user) {
        var _check = check(user, ['id', 'stream.tag', 'stream.mediaStream', 'stream.type']),
            isIllegal = _check.isIllegal,
            name = _check.name;

        if (isIllegal) {
          var error = getError(name);
          return utils.Defer.reject(error);
        }
        var client = this.client;

        return client.exec({
          event: UpEvent.STREAM_PUBLISH,
          type: 'stream',
          args: [user]
        });
      }
    }, {
      key: 'unpublish',
      value: function unpublish(user) {
        var _check2 = check(user, ['id', 'stream.tag', 'stream.type']),
            isIllegal = _check2.isIllegal,
            name = _check2.name;

        if (isIllegal) {
          var error = getError(name);
          return utils.Defer.reject(error);
        }
        var client = this.client;

        return client.exec({
          event: UpEvent.STREAM_UNPUBLISH,
          type: 'stream',
          args: [user]
        });
      }
    }, {
      key: 'subscribe',
      value: function subscribe(user) {
        var _check3 = check(user, ['id', 'stream.tag', 'stream.type']),
            isIllegal = _check3.isIllegal,
            name = _check3.name;

        if (isIllegal) {
          var error = getError(name);
          return utils.Defer.reject(error);
        }
        var client = this.client;

        return client.exec({
          event: UpEvent.STREAM_SUBSCRIBE,
          type: 'stream',
          args: [user]
        });
      }
    }, {
      key: 'unsubscribe',
      value: function unsubscribe(user) {
        var _check4 = check(user, ['id', 'stream.tag', 'stream.type']),
            isIllegal = _check4.isIllegal,
            name = _check4.name;

        if (isIllegal) {
          var error = getError(name);
          return utils.Defer.reject(error);
        }
        var client = this.client;

        return client.exec({
          event: UpEvent.STREAM_UNSUBSCRIBE,
          type: 'stream',
          args: [user]
        });
      }
    }, {
      key: 'resize',
      value: function resize(user) {
        var _check5 = check(user, ['id', 'stream.tag']),
            isIllegal = _check5.isIllegal,
            name = _check5.name;

        if (isIllegal) {
          var error = getError(name);
          return utils.Defer.reject(error);
        }
        var client = this.client;

        return client.exec({
          event: UpEvent.STREAM_RESIZE,
          type: 'stream',
          args: [user]
        });
      }
    }, {
      key: 'get',
      value: function get$$1(user) {
        var client = this.client;

        var _check6 = check(user, ['id', 'stream.tag']),
            isIllegal = _check6.isIllegal,
            name = _check6.name;

        if (isIllegal) {
          var error = getError(name);
          return utils.Defer.reject(error);
        }
        return client.exec({
          event: UpEvent.STREAM_GET,
          type: 'stream',
          args: [user]
        });
      }
    }]);
    return Stream;
  }();

  var EventEmitter = function () {
    function EventEmitter() {
      classCallCheck(this, EventEmitter);

      this.events = {};
      this.onceEvents = {};
    }

    createClass(EventEmitter, [{
      key: 'on',
      value: function on(name, event) {
        var events = this.events[name] || [];
        events.push(event);
        this.events[name] = events;
      }
    }, {
      key: 'off',
      value: function off(name) {
        delete this.events[name];
      }
    }, {
      key: 'emit',
      value: function emit(name, data, error) {
        var events = this.events[name];
        utils.forEach(events, function (event) {
          event(error, data);
        });

        var onceEvent = this.onceEvents[name] || utils.noop;
        onceEvent(error, data);
        delete this.onceEvents[name];
      }
    }, {
      key: 'once',
      value: function once(name, event) {
        this.onceEvents[name] = event;
      }
    }, {
      key: 'teardown',
      value: function teardown() {
        for (var name in this.events) {
          this.off(name);
        }
        for (var _name in this.onceEvents) {
          delete this.onceEvents[_name];
        }
      }
    }]);
    return EventEmitter;
  }();

  var Request = function () {
    function Request() {
      classCallCheck(this, Request);
    }

    createClass(Request, [{
      key: 'setOption',
      value: function setOption(option) {
        utils.extend(this, option);
      }
    }, {
      key: 'post',
      value: function post(option) {
        var domain = this.url;
        var path = option.path,
            body = option.body;

        var tpl = '{domain}{path}';
        var url = utils.tplEngine(tpl, {
          domain: domain,
          path: path
        });
        return utils.request(url, {
          method: 'POST',
          body: JSON.stringify(body),
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    }]);
    return Request;
  }();

  var request$1 = new Request();

  var PeerConnectionEvent = {
    ADDED: 'p_stream_added',
    REMOVED: 'p_stream_removed',
    RECEIVED: 'p_stream_received',
    CHANGED: 'p_ice_changed'
  };

  var ICEEvent = {
    FAILED: 'failed',
    DISCONNECTED: 'disconnected'
  };

  var CommonEvent = {
    JOINED: 'common_joined',
    LEFT: 'common_left',
    ERROR: 'common_error',
    CONSUME: 'common_consume',
    CONSUME_FINISHED: 'common_consume_finished'
  };

  var PeerConnection = function (_EventEmitter) {
    inherits(PeerConnection, _EventEmitter);

    function PeerConnection() {
      classCallCheck(this, PeerConnection);

      var _this = possibleConstructorReturn(this, (PeerConnection.__proto__ || Object.getPrototypeOf(PeerConnection)).call(this));

      var context = _this;
      var pc = new RTCPeerConnection({
        sdpSemantics: 'plan-b',
        // Chrome 49 Test
        iceServers: []
      });
      var events = {
        onaddstream: function onaddstream(event) {
          var stream = event.stream;

          context.emit(PeerConnectionEvent.ADDED, stream);
        },
        onremovestream: function onremovestream() {
          var _event = event,
              stream = _event.stream;

          context.emit(PeerConnectionEvent.REMOVED, stream);
        },
        ondatachannel: function ondatachannel(event) {
          //TODO: 具体返回参数
          context.emit(PeerConnectionEvent.RECEIVED, event);
        },
        oniceconnectionstatechange: function oniceconnectionstatechange() {
          var state = pc.iceConnectionState;
          utils.extend(context, {
            state: state
          });
          context.emit(PeerConnectionEvent.CHANGED, state);
          Logger$1.log(LogTag.ICE, { state: state });
        }
      };
      utils.forEach(events, function (event, name) {
        pc[name] = event;
      });
      utils.extend(context, {
        pc: pc
      });
      return _this;
    }

    createClass(PeerConnection, [{
      key: 'addStream',
      value: function addStream(user) {
        var context = this;
        var pc = context.pc;
        var stream = user.stream;

        if (!utils.isArray(stream)) {
          stream = [stream];
        }
        utils.forEach(stream, function (_ref) {
          var mediaStream = _ref.mediaStream;

          pc.addStream(mediaStream);
        });
        return context.createOffer(user);
      }
    }, {
      key: 'removeStream',
      value: function removeStream(user) {
        var context = this;
        var pc = context.pc;
        var stream = user.stream;

        if (!utils.isArray(stream)) {
          stream = [stream];
        }
        utils.forEach(stream, function (_ref2) {
          var mediaStream = _ref2.mediaStream;

          pc.removeStream(mediaStream);
        });
        return context.createOffer(user);
      }
    }, {
      key: 'setOffer',
      value: function setOffer(desc) {
        var context = this;
        var pc = context.pc;

        return pc.setLocalDescription(desc);
      }
    }, {
      key: 'setAnwser',
      value: function setAnwser(sdp) {
        var context = this;
        var pc = context.pc;

        return pc.setRemoteDescription(new RTCSessionDescription(sdp));
      }
    }, {
      key: 'close',
      value: function close() {
        var context = this;
        var pc = context.pc;

        pc.close();
      }
    }, {
      key: 'getOption',
      value: function getOption() {
        return {
          iceRestart: true,
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        };
      }
    }, {
      key: 'isNegotiate',
      value: function isNegotiate() {
        var state = this.state;

        return utils.isEqual(state, ICEEvent.FAILED) || utils.isEqual(state, ICEEvent.DISCONNECTED);
      }
    }, {
      key: 'createOffer',
      value: function createOffer(user) {
        var context = this;
        var pc = context.pc;
        var stream = user.stream;

        if (!utils.isArray(stream)) {
          stream = [stream];
        }
        var option = context.getOption();
        return utils.deferred(function (resole, reject) {
          pc.createOffer(function (desc) {
            utils.forEach(stream, function (_ref3) {
              var mediaStream = _ref3.mediaStream,
                  size = _ref3.size;

              var newStreamId = context.getStreamId(user, size);
              var streamId = mediaStream.id;
              var _desc = desc,
                  sdp = _desc.sdp;

              sdp = context.renameStream(sdp, {
                name: streamId,
                newName: newStreamId
              });
              utils.extend(desc, {
                sdp: sdp
              });
            });
            desc = context.renameCodec(desc);
            utils.extend(context, {
              desc: desc
            });
            resole(desc);
          }, function (error) {
            reject(error);
          }, option);
        });
      }
    }, {
      key: 'getOffer',
      value: function getOffer(callback) {
        var context = this;
        var pc = context.pc;

        var option = context.getOption();
        var success = function success(desc) {
          desc = context.renameCodec(desc);
          callback && callback(desc);
          return desc;
        };
        return pc.createOffer(option).then(success);
      }
    }, {
      key: 'renameStream',
      value: function renameStream(sdp, data) {
        var name = data.name,
            newName = data.newName;

        return sdp.replace(new RegExp(name, 'g'), newName);
      }
    }, {
      key: 'renameCodec',
      value: function renameCodec(offer) {
        var sdp = offer.sdp;
        // sdp = sdp.replace(new RegExp('a=group:BUNDLE 0 1', 'g'), 'a=group:BUNDLE audio video')

        var codecs = [{
          name: 'H264/90000',
          code: 98,
          rtx: 99,
          value: 'a=rtpmap:98 H264/90000\r\na=rtcp-fb:98 ccm fir\r\na=rtcp-fb:98 nack\r\na=rtcp-fb:98 nack pli\r\na=rtcp-fb:98 goog-remb\r\na=rtcp-fb:98 transport-cc\r\na=fmtp:98 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=98'
        }, {
          name: 'VP8/90000',
          code: 96,
          rtx: 97,
          value: 'a=rtpmap:96 VP8/90000\r\na=rtcp-fb:96 ccm fir\r\na=rtcp-fb:96 nack\r\na=rtcp-fb:96 nack pli\r\na=rtcp-fb:96 goog-remb\r\na=rtcp-fb:96 transport-cc\r\na=rtpmap:97 rtx/90000\r\na=fmtp:97 apt=96'
        }, {
          name: 'red/90000',
          rtx: '101',
          code: 100,
          value: 'a=rtpmap:100 red/90000\r\na=rtpmap:101 rtx/90000\r\na=fmtp:101 apt=100'
        }, {
          name: 'ulpfec/90000',
          code: 127,
          value: 'a=rtpmap:127 ulpfec/90000'
        }, {
          name: 'flexfec-03/90000',
          code: 125,
          value: 'a=rtpmap:125 flexfec-03/90000\r\na=rtcp-fb:125 transport-cc\r\na=rtcp-fb:125 goog-remb\r\na=fmtp:125 repair-window=10000000'
        }];
        var separator = '\r\n';
        var getVideoCodecs = function getVideoCodecs(len) {
          var matches = sdp.match(/m=video\s+[\w\s/]+/);
          var videoDesc = matches[0];
          var codecs = videoDesc.split(' ');
          // m=video 55382 UDP/TLS/RTP/SAVPF 98....
          codecs.length = len;
          return codecs;
        };
        // 获取 m=video 编码表的前三位
        var videoCodecs = getVideoCodecs(3);

        // 得到 Video 描述信息列表
        var videoTotalIndex = sdp.indexOf('m=video');
        var ssrcIndex = sdp.indexOf('a=ssrc-group');
        if (utils.isEqual(ssrcIndex, -1)) {
          ssrcIndex = sdp.length;
        }
        var videoBody = sdp.substring(videoTotalIndex, ssrcIndex);
        var videoDescs = videoBody.split(separator);
        var supportCodecs = {};
        utils.forEach(codecs, function (codec) {
          var name = codec.name;

          utils.forEach(videoDescs, function (desc) {
            if (utils.isInclude(desc, name)) {
              supportCodecs[name] = codec;
            }
          });
        });
        var sdpBody = '';
        utils.forEach(supportCodecs, function (codec) {
          var code = codec.code,
              value = codec.value,
              rtx = codec.rtx;

          sdpBody += value + separator;
          videoCodecs.push(code, rtx);
        });
        // 新 SDP = m=video + 所有 a=rtpmap + sdpFooter
        videoBody = videoBody.split(separator);
        videoBody.shift();
        videoBody = videoBody.join(separator);
        var headerIndex = videoBody.indexOf('a=rtpmap');
        var sdpHeader = sdp.substring(0, videoTotalIndex);
        var videoHeader = videoBody.substring(0, headerIndex);
        // 包含 ssrc 信息
        var sdpFooter = sdp.substring(ssrcIndex, sdp.length);
        sdp = sdpHeader + videoCodecs.join(' ') + '\r\n' + videoHeader + sdpBody + sdpFooter;
        utils.extend(offer, {
          sdp: sdp
        });
        return offer;
      }
    }, {
      key: 'getStreamId',
      value: function getStreamId(user, size) {
        var tpl = '{userId}_{tag}';
        var userId = user.id,
            stream = user.stream;

        if (!utils.isArray(stream)) {
          stream = [stream];
        }

        var _stream = stream,
            _stream2 = slicedToArray(_stream, 1),
            tag = _stream2[0].tag;

        if (utils.isEqual(size, StreamSize.MIN)) {
          tpl = '{userId}_{tag}_tiny';
        }
        return utils.tplEngine(tpl, {
          userId: userId,
          tag: tag
        });
      }
    }]);
    return PeerConnection;
  }(EventEmitter);

  var Path = {
    PUBLISH: '/exchange?{roomId}',
    UNPUBLISH: '/exchange?{roomId}',
    RESIZE: '/exchange?{roomId}',
    SUBSCRIBE: '/exchange?{roomId}',
    UNSUBSCRIBE: '/exchange?{roomId}',
    EXIT: '/exit?{roomId}'
  };

  var Message = {
    PUBLISH: 'RTCPublishResourceMessage',
    UNPUBLISH: 'RTCUnpublishResourceMessage',
    MODIFY: 'RTCModifyResourceMessage',
    STATE: 'RTCUserChangeMessage'
  };
  var Timeout = {
    TIME: 10 * 1000
  };
  var errorHandler = function errorHandler(code, reject) {
    var error = ErrorType[code] || {
      code: code
    };
    reject(error);
  };
  var IM = function (_EventEmitter) {
    inherits(IM, _EventEmitter);

    function IM(option) {
      classCallCheck(this, IM);

      var _this = possibleConstructorReturn(this, (IM.__proto__ || Object.getPrototypeOf(IM)).call(this));

      var timer = new utils.Timer({
        timeout: Timeout.TIME
      });
      var context = _this;
      var isJoinRoom = false;
      utils.extend(context, {
        timer: timer,
        isJoinRoom: isJoinRoom
      });
      var im = option.RongIMLib.RongIMClient,
          RongIMLib = option.RongIMLib;

      var init = function init() {
        if (context.isJoinRoom) {
          context.rePing();
        }
        context.registerMessage();
      };
      var connectState = -1;
      try {
        connectState = im.getInstance().getCurrentConnectionStatus();
      } catch (error) {
        Logger$1.error(LogTag.IM, {
          content: error,
          pos: 'new RongRTC'
        });
      }
      var CONNECTED = RongIMLib.ConnectionStatus.CONNECTED;

      utils.extend(context, {
        connectState: connectState,
        im: im,
        RongIMLib: RongIMLib
      });
      // 如果实例化 RongRTC 时，IM 已连接成功，主动触发内部 init
      if (utils.isEqual(connectState, CONNECTED)) {
        init();
      }
      im.statusWatch(function (status) {
        switch (status) {
          case CONNECTED:
            init();
            break;
        }
        utils.extend(context, {
          connectState: status
        });
      });
      var dispatchStreamEvent = function dispatchStreamEvent(user, callback) {
        var id = user.id,
            uris = user.uris;

        if (utils.isString(uris)) {
          uris = JSON.parse(uris);
        }
        var streams = [user];
        if (uris) {
          streams = utils.uniq(uris, function (target) {
            var streamId = target.streamId,
                tag = target.tag,
                mediaType = target.mediaType,
                state = target.state;

            return {
              key: [streamId, tag].join('_'),
              value: {
                tag: tag,
                uris: uris,
                mediaType: mediaType,
                state: state
              }
            };
          });
        }
        utils.forEach(streams, function (stream) {
          callback({
            id: id,
            stream: stream
          });
        });
      };
      var getModifyEvents = function getModifyEvents() {
        var events = {},
            tpl = '{type}_{state}';
        // 禁用视频
        var name = utils.tplEngine(tpl, {
          type: StreamType.VIDEO,
          state: StreamState.DISBALE
        });
        events[name] = DownEvent.STREAM_DISABLED;
        // 启用视频
        name = utils.tplEngine(tpl, {
          type: StreamType.VIDEO,
          state: StreamState.ENABLE
        });
        events[name] = DownEvent.STREAM_ENABLED;
        // 音频静音
        name = utils.tplEngine(tpl, {
          type: StreamType.AUDIO,
          state: StreamState.DISBALE
        });
        events[name] = DownEvent.STREAM_MUTED;
        // 音频取消静音
        name = utils.tplEngine(tpl, {
          type: StreamType.AUDIO,
          state: StreamState.ENABLE
        });
        events[name] = DownEvent.STREAM_UNMUTED;
        return events;
      };
      var roomEventHandler = function roomEventHandler(users) {
        utils.forEach(users, function (user) {
          var id = user.userId,
              state = user.state;

          switch (+state) {
            case UserState.JOINED:
              context.emit(DownEvent.ROOM_USER_JOINED, { id: id });
              break;
            case UserState.LEFT:
            case UserState.OFFLINE:
              context.emit(DownEvent.ROOM_USER_LEFT, { id: id });
              break;
            default:
              Logger$1.warn('UserState: unkown state ' + state);
          }
        });
      };
      im.messageWatch(function (message) {
        var type = message.messageType,
            id = message.senderUserId,
            _message$content = message.content,
            uris = _message$content.uris,
            users = _message$content.users;

        var user = { id: id };
        switch (type) {
          case Message.STATE:
            roomEventHandler(users);
            break;
          case Message.PUBLISH:
            user = { id: id, uris: uris };
            dispatchStreamEvent(user, function (user) {
              context.emit(DownEvent.STREAM_PUBLISHED, user);
            });
            break;
          case Message.UNPUBLISH:
            user = { id: id, uris: uris };
            dispatchStreamEvent(user, function (user) {
              context.emit(DownEvent.STREAM_UNPUBLISHED, user);
            });
            break;
          case Message.MODIFY:
            user = { id: id, uris: uris };
            dispatchStreamEvent(user, function (user) {
              var _user$stream = user.stream,
                  type = _user$stream.mediaType,
                  state = _user$stream.state;

              var tpl = '{type}_{state}';
              var name = utils.tplEngine(tpl, {
                type: type,
                state: state
              });
              var events = getModifyEvents();
              var event = events[name];
              context.emit(event, user);
            });
            break;
          default:
            Logger$1.warn('MessageWatch: unkown message type ' + message.objectName);
        }
      });
      return _this;
    }

    createClass(IM, [{
      key: 'registerMessage',
      value: function registerMessage() {
        var im = this.im,
            RongIMLib = this.RongIMLib;

        var register = function register(message) {
          var type = message.type,
              name = message.name,
              props = message.props;

          var isCounted = false;
          var isPersited = false;
          var tag = new RongIMLib.MessageTag(isCounted, isPersited);
          im.registerMessageType(type, name, tag, props);
        };
        var messages = [{
          type: Message.PUBLISH,
          name: 'RCRTC:PublishResource',
          props: ['uris']
        }, {
          type: Message.UNPUBLISH,
          name: 'RCRTC:UnpublishResource',
          props: ['uris']
        }, {
          type: Message.MODIFY,
          name: 'RCRTC:ModifyResource',
          props: ['uris']
        }, {
          type: Message.STATE,
          name: 'RCRTC:state',
          props: ['users']
        }];
        utils.forEach(messages, function (message) {
          register(message);
        });
      }
    }, {
      key: 'joinRoom',
      value: function joinRoom(room) {
        var context = this;
        var im = context.im;

        utils.extend(context, {
          room: room,
          isJoinRoom: true
        });
        return utils.deferred(function (resolve, reject) {
          im.getInstance().joinRTCRoom(room, {
            onSuccess: function onSuccess() {
              context.emit(CommonEvent.JOINED, room);
              context.rtcPing(room);
              resolve();
            },
            onError: function onError(code) {
              return errorHandler(code, reject);
            }
          });
        });
      }
    }, {
      key: 'leaveRoom',
      value: function leaveRoom() {
        var context = this;
        var im = context.im,
            room = context.room,
            timer = context.timer;

        timer.pause();
        utils.extend(context, {
          isJoinRoom: false
        });
        return utils.deferred(function (resolve, reject) {
          im.getInstance().quitRTCRoom(room, {
            onSuccess: function onSuccess() {
              context.emit(CommonEvent.LEFT, room);
              resolve();
            },
            onError: function onError(code) {
              return errorHandler(code, reject);
            }
          });
        });
      }
    }, {
      key: 'getRoom',
      value: function getRoom() {
        var im = this.im,
            room = this.room;

        return utils.deferred(function (resolve, _reject) {
          im.getInstance().getRTCRoomInfo(room, {
            onSuccess: resolve,
            reject: function reject(code) {
              return errorHandler(code, _reject);
            }
          });
        });
      }
    }, {
      key: 'getUsers',
      value: function getUsers() {
        var im = this.im,
            room = this.room;

        return utils.deferred(function (resolve, reject) {
          im.getInstance().getRTCUserInfoList(room, {
            onSuccess: resolve,
            onError: function onError(code) {
              return errorHandler(code, reject);
            }
          });
        });
      }
    }, {
      key: 'getToken',
      value: function getToken() {
        var token = this.room.user.token;

        return token;
      }
    }, {
      key: 'getRoomId',
      value: function getRoomId() {
        var id = this.room.id;

        return id;
      }
    }, {
      key: 'getUser',
      value: function getUser() {
        var user = this.room.user;

        return user;
      }
    }, {
      key: 'setUserInfo',
      value: function setUserInfo(key, value) {
        var room = this.room,
            im = this.im;

        value = utils.toJSON(value);
        var info = {
          key: key,
          value: value
        };
        return utils.deferred(function (resolve, reject) {
          im.getInstance().setRTCUserInfo(room, info, {
            onSuccess: resolve,
            onError: reject
          });
        });
      }
    }, {
      key: 'removeUserInfo',
      value: function removeUserInfo(keys) {
        var room = this.room,
            im = this.im;

        var info = {
          keys: keys
        };
        return utils.deferred(function (resolve, reject) {
          im.getInstance().removeRTCUserInfo(room, info, {
            onSuccess: resolve,
            onError: reject
          });
        });
      }
    }, {
      key: 'getExistUsers',
      value: function getExistUsers() {
        var im = this.im,
            room = this.room;

        return utils.deferred(function (resolve, reject) {
          im.getInstance().getRTCUserList(room, {
            onSuccess: resolve,
            onError: function onError(code) {
              return errorHandler(code, reject);
            }
          });
        });
      }
    }, {
      key: 'sendMessage',
      value: function sendMessage(message) {
        var im = this.im,
            room = this.room;

        return utils.deferred(function (resolve, reject) {
          var conversationType = 12,
              targetId = room.id;
          var create = function create() {
            var type = message.type,
                content = message.content;

            return new im.RegisterMessage[type](content);
          };
          var msg = create();
          Logger$1.log(LogTag.IM, {
            msg: 'send:before',
            message: message
          });
          im.getInstance().sendMessage(conversationType, targetId, msg, {
            onSuccess: function onSuccess() {
              Logger$1.log(LogTag.IM, {
                msg: 'send:after',
                message: message
              });
              resolve(room);
            },
            onError: function onError(code) {
              Logger$1.log(LogTag.IM, {
                msg: 'send:after',
                error: code
              });
              reject(code);
            }
          });
        });
      }
    }, {
      key: 'isReady',
      value: function isReady() {
        var context = this;
        var CONNECTED = context.RongIMLib.ConnectionStatus.CONNECTED;

        return context.connectState === CONNECTED;
      }
    }, {
      key: 'isJoined',
      value: function isJoined() {
        var context = this;
        return context.isJoinRoom;
      }
    }, {
      key: 'rePing',
      value: function rePing() {
        var context = this;
        var timer = context.timer;

        var roomId = context.getRoomId();
        if (!utils.isUndefined(roomId)) {
          timer.pause();
          context.rtcPing({
            id: roomId
          });
        }
      }
    }, {
      key: 'rtcPing',
      value: function rtcPing(room) {
        var context = this;
        var im = context.im,
            timer = context.timer;

        var count = 0;
        var isPinging = false;
        var Status = {
          reset: function reset() {
            count = 0;
            isPinging = false;
          },
          sum: function sum() {
            count += 1;
          }
        };
        timer.resume(function () {
          if (count > PingCount) {
            timer.pause();
            var Inner = ErrorType.Inner;

            utils.extend(context, {
              isJoinRoom: false
            });
            context.emit(CommonEvent.LEFT);
            return context.emit(CommonEvent.ERROR, Inner.SOCKET_UNAVAILABLE);
          }
          // 如果上次 Ping 没有结束，累计 Ping 次数
          if (isPinging) {
            Status.sum();
          }
          isPinging = true;
          im.getInstance().RTCPing(room, {
            onSuccess: function onSuccess() {
              Status.reset();
            },
            onError: function onError(code) {
              var error = ErrorType[code];
              if (error) {
                context.emit(CommonEvent.ERROR, error);
                timer.pause();
              }
            }
          });
        }, true);
      }
    }]);
    return IM;
  }(EventEmitter);

  var Network = function () {
    function Network(_option) {
      classCallCheck(this, Network);

      _option = _option || {};
      var option = {
        url: 'https://cdn.ronghub.com/detecting',
        timeout: 1500,
        max: 30
      };
      utils.extend(option, _option);
      utils.extend(this, {
        option: option
      });
    }

    createClass(Network, [{
      key: 'detect',
      value: function detect(callback) {
        var context = this;
        var detecting = context.detecting,
            option = context.option;

        if (detecting) {
          return;
        }
        utils.extend(context, {
          detecting: true
        });
        var url = option.url,
            timeout = option.timeout,
            max = option.max;

        var count = 1;
        var getCount = function getCount() {
          count += 1;
          return count;
        };
        var isOnline = false;
        var ajax = function ajax() {
          count = getCount();
          utils.request(url).then(function () {
            utils.extend(context, {
              detecting: false
            });
            isOnline = true;
            callback(isOnline);
          }, function () {
            if (utils.isEqual(max, count)) {
              return callback(isOnline);
            }
            setTimeout(function () {
              ajax();
            }, timeout);
          });
        };
        ajax();
      }
    }]);
    return Network;
  }();

  function StreamHandler(im, option) {
    var DataCache = utils.Cache();
    var DataCacheName = {
      USERS: 'room_users',
      // 全部通知后一次性交换 SDP
      IS_NOTIFY_READY: 'is_notify_ready'
    };
    var SubPromiseCache = utils.Cache();
    var PubResourceCache = utils.Cache();
    /* 
      缓存已订阅 MediaStream
      userId_type: mediaStream
    */
    var StreamCache = utils.Cache();
    /* 
      缓存订阅关系，每次修改需同步全量数据
      userId: [{ streamId: '', uri: '', type: 1, tag: ''}]
    */
    var subCache = utils.Cache();
    var prosumer = new utils.Prosumer();
    var pc = null;
    var SubscribeCache = {
      get: function get$$1(userId) {
        return subCache.get(userId);
      },
      set: function set$$1(userId, subs) {
        return subCache.set(userId, subs);
      },
      getKeys: function getKeys() {
        return subCache.getKeys();
      },
      remove: function remove(user) {
        var userId = user.id;

        var subs = subCache.get(userId) || [];
        var streamId = pc.getStreamId(user);
        subs = utils.filter(subs, function (_ref) {
          var msid = _ref.msid;

          return !utils.isEqual(streamId, msid);
        });
        subCache.set(userId, subs);
      },
      clear: function clear() {
        subCache.clear();
      }
    };
    var clear = function clear() {
      DataCache.clear();
      SubPromiseCache.clear();
      PubResourceCache.clear();
      StreamCache.clear();
      SubscribeCache.clear();
    };
    var eventEmitter = new EventEmitter();
    var getSubPromiseUId = function getSubPromiseUId(user) {
      var id = user.id,
          _user$stream = user.stream,
          tag = _user$stream.tag,
          type = _user$stream.type;

      var tpl = '{id}_{tag}_{type}';
      return utils.tplEngine(tpl, {
        id: id,
        tag: tag,
        type: type
      });
    };
    var getSubs = function getSubs() {
      var subs = [];
      var userIds = SubscribeCache.getKeys();
      utils.forEach(userIds, function (userId) {
        var streams = SubscribeCache.get(userId);
        utils.forEach(streams, function (stream) {
          subs.push(stream);
        });
      });
      return subs;
    };
    var getBody = function getBody() {
      return utils.deferred(function (resolve) {
        pc.getOffer(function (offer) {
          var token = im.getToken();
          var subs = getSubs();
          resolve({
            token: token,
            sdp: offer,
            subscribeList: subs
          });
        });
      });
    };
    var negotiate = function negotiate(response) {
      pc.getOffer(function (offer) {
        pc.setOffer(offer);
        var sdp = response.sdp;

        pc.setAnwser(sdp);
      });
    };
    var republish = function republish() {
      var roomId = im.getRoomId();
      getBody().then(function (body) {
        var url = utils.tplEngine(Path.SUBSCRIBE, {
          roomId: roomId
        });
        Logger$1.log(LogTag.STREAM_HANDLER, {
          msg: 'publish:reconnect:request',
          roomId: roomId,
          body: body
        });
        return request$1.post({
          path: url,
          body: body
        }).then(function (response) {
          Logger$1.log(LogTag.STREAM_HANDLER, {
            msg: 'publish:reconnect:response',
            roomId: roomId,
            response: response
          });
          //TODO: 重新设置数据
          negotiate(response);
        }, function (error) {
          Logger$1.log(LogTag.STREAM_HANDLER, {
            msg: 'publish:reconnect:response',
            roomId: roomId,
            error: error
          });
          return error;
        });
      });
    };
    var getUris = function getUris(publishList) {
      return utils.map(publishList, function (stream) {
        var msid = stream.msid;

        var _msid$split = msid.split('_'),
            _msid$split2 = slicedToArray(_msid$split, 2),
            tag = _msid$split2[1];

        utils.extend(stream, {
          tag: tag,
          state: StreamState.ENABLE
        });
        return stream;
      });
    };
    var detect = option.detect;

    var network = new Network(detect);
    var exchangeHandler = function exchangeHandler(result, user, type) {
      var publishList = result.publishList,
          sdp = result.sdp;

      pc.setAnwser(sdp);
      var uris = getUris(publishList);

      var getTempUris = function getTempUris(type) {
        var userId = user.id;

        var cacheUris = PubResourceCache.get(userId) || [];
        var isPublish = utils.isEqual(type, Message.PUBLISH);
        if (isPublish) {
          cacheUris = uris;
        }
        var streamId = pc.getStreamId(user);
        var getCondition = function getCondition(stream) {
          var msid = stream.msid;

          return utils.isEqual(msid, streamId);
        };
        var tempUris = utils.filter(cacheUris, function (stream) {
          return getCondition(stream);
        });
        // 第一次 publish 过滤后 tempUris 为空，使用默认值
        return utils.isEmpty(tempUris) ? uris : tempUris;
      };
      var sendUris = getTempUris(type);
      switch (type) {
        case Message.PUBLISH:
          im.sendMessage({
            type: type,
            content: {
              uris: sendUris
            }
          });
          break;
        case Message.UNPUBLISH:
          im.sendMessage({
            type: type,
            content: {
              uris: sendUris
            }
          });
          break;
      }
      PubResourceCache.set(user.id, uris);
      return utils.Defer.resolve();
    };
    eventEmitter.on(CommonEvent.CONSUME, function () {
      var user = im.getUser();
      var roomId = im.getRoomId();
      prosumer.consume(function (_ref2, next) {
        var sdp = _ref2.sdp,
            body = _ref2.body;

        Logger$1.log(LogTag.STREAM_HANDLER, {
          msg: 'subscribe:request',
          roomId: roomId,
          body: body
        });
        pc.setOffer(sdp);
        request$1.post(body).then(function (response) {
          var sdp = response.sdp;

          pc.setAnwser(sdp);
          Logger$1.log(LogTag.STREAM_HANDLER, {
            msg: 'subscribe:response',
            roomId: roomId,
            user: user,
            response: response
          });
          next();
        });
      }, function () {
        eventEmitter.emit(CommonEvent.CONSUME_FINISHED);
      });
    });
    var getUId = function getUId(user, tpl) {
      tpl = tpl || '{userId}_{tag}_{type}';
      var userId = user.id,
          _user$stream2 = user.stream,
          tag = _user$stream2.tag,
          type = _user$stream2.type;

      return utils.tplEngine(tpl, {
        userId: userId,
        tag: tag,
        type: type
      });
    };
    var dispatchStreamEvent = function dispatchStreamEvent(user, callback) {
      var id = user.id,
          uris = user.stream.uris;

      utils.forEach(uris, function (item) {
        var tag = item.tag,
            type = item.mediaType,
            uri = item.uri;

        var key = getUId({ id: id, stream: { tag: tag, type: type } });
        callback(key, uri);
      });
    };
    /* 已在房间，再有新人发布资源触发此事件 */
    im.on(DownEvent.STREAM_PUBLISHED, function (error, user) {
      if (error) {
        throw error;
      }
      dispatchStreamEvent(user, function (key, uri) {
        DataCache.set(key, uri);
      });
    });

    im.on(DownEvent.STREAM_CHANGED, function (error, user) {
      if (error) {
        throw error;
      }
      dispatchStreamEvent(user, function (key, uri) {
        DataCache.set(key, uri);
      });
    });
    im.on(CommonEvent.LEFT, function () {
      var streamIds = StreamCache.getKeys();
      utils.forEach(streamIds, function (streamId) {
        var stream = StreamCache.get(streamId);
        var tracks = stream.getTracks();
        utils.forEach(tracks, function (track) {
          track.stop();
        });
      });
      clear();
      if (pc) {
        pc.close();
      }
    });
    /* 加入房间成功后，主动获取已发布资源的人员列表，通知应用层 */
    im.on(CommonEvent.JOINED, function (error, room) {
      if (error) {
        throw error;
      }
      pc = new PeerConnection();
      var getStreamUser = function getStreamUser(stream) {
        var id = stream.id,
            type = StreamType.NODE;
        var _id$split = id.split('_'),
            _id$split2 = slicedToArray(_id$split, 2),
            userId = _id$split2[0],
            tag = _id$split2[1];

        var videoTracks = stream.getVideoTracks();
        var audioTrakcks = stream.getAudioTracks();
        var isEmtpyVideo = utils.isEmpty(videoTracks);
        var isEmptyAudio = utils.isEmpty(audioTrakcks);
        if (isEmtpyVideo) {
          type = StreamType.AUDIO;
        }
        if (isEmptyAudio) {
          type = StreamType.VIDEO;
        }
        if (!isEmptyAudio && !isEmtpyVideo) {
          type = StreamType.AUDIO_AND_VIDEO;
        }
        return {
          id: userId,
          stream: {
            tag: tag,
            type: type,
            mediaStream: stream
          }
        };
      };
      pc.on(PeerConnectionEvent.ADDED, function (error, stream) {
        if (error) {
          throw error;
        }
        var id = stream.id;

        StreamCache.set(id, stream);
        var user = getStreamUser(stream);
        var uid = getSubPromiseUId(user);
        var promise = SubPromiseCache.get(uid);
        promise.resolve(user);
      });
      pc.on(PeerConnectionEvent.REMOVED, function (error, stream) {
        if (error) {
          throw error;
        }
        var id = stream.id;

        StreamCache.remove(id);
      });
      pc.on(PeerConnectionEvent.CHANGED, function () {
        if (error) {
          throw error;
        }
        if (pc.isNegotiate()) {
          network.detect(function (isOnline) {
            if (isOnline) {
              republish();
            } else {
              var Inner = ErrorType.Inner;

              im.emit(CommonEvent.ERROR, Inner.NETWORK_UNAVAILABLE);
            }
          });
        }
      });
      im.getUsers(room).then(function (users) {
        DataCache.set(DataCacheName.USERS, users);
        if (utils.isEmpty(users)) {
          DataCache.set(DataCacheName.IS_NOTIFY_READY, true);
        }

        var _im$getUser = im.getUser(),
            currentUserId = _im$getUser.id;

        utils.forEach(users, function (data, id) {
          if (utils.isEqual(currentUserId, id)) {
            return;
          }
          var uris = data.uris;

          uris = JSON.parse(uris);
          utils.forEach(uris, function (item) {
            var type = item.mediaType,
                tag = item.tag,
                uri = item.uri;

            var key = getUId({
              id: id,
              stream: {
                type: type,
                tag: tag
              }
            });
            DataCache.set(key, uri);
          });
          var streams = utils.uniq(uris, function (target) {
            var streamId = target.streamId,
                tag = target.tag;

            return {
              key: [streamId, tag].join('_'),
              value: {
                tag: tag
              }
            };
          });
          utils.forEach(streams, function (stream) {
            var tag = stream.tag;

            setTimeout(function () {
              im.emit(DownEvent.STREAM_PUBLISHED, {
                id: id,
                stream: {
                  tag: tag,
                  uris: uris
                }
              });
            });
          });
        });
        DataCache.set(DataCacheName.IS_NOTIFY_READY, true);
      });
    });
    var isCurrentUser = function isCurrentUser(user) {
      var _im$getUser2 = im.getUser(),
          id = _im$getUser2.id;

      return utils.isEqual(user.id, id);
    };
    var User = {
      set: function set$$1(key, data) {
        var publishList = data.publishList;

        var uris = getUris(publishList);
        return im.setUserInfo(key, uris).then(function () {
          return data;
        });
      },
      SET_USERINFO: 'uris'
    };
    var publishTempStreams = [];
    var publishInvoke = function publishInvoke(users) {
      if (!utils.isArray(users)) {
        users = [users];
      }
      utils.forEach(users, function (user) {
        pc.addStream(user);
      });

      var _users = users,
          _users2 = slicedToArray(_users, 1),
          user = _users2[0];

      var roomId = im.getRoomId();
      Logger$1.log(LogTag.STREAM_HANDLER, {
        msg: 'publish:start',
        roomId: roomId,
        user: user
      });
      return pc.createOffer(user).then(function (desc) {
        pc.setOffer(desc);
        return getBody().then(function (body) {
          var url = utils.tplEngine(Path.SUBSCRIBE, {
            roomId: roomId
          });
          Logger$1.log(LogTag.STREAM_HANDLER, {
            msg: 'publish:request',
            roomId: roomId,
            user: user,
            body: body
          });
          return request$1.post({
            path: url,
            body: body
          }).then(function (response) {
            Logger$1.log(LogTag.STREAM_HANDLER, {
              msg: 'publish:response',
              roomId: roomId,
              user: user,
              response: response
            });
            return User.set(User.SET_USERINFO, response);
          }, function (error) {
            Logger$1.log(LogTag.STREAM_HANDLER, {
              msg: 'publish:response',
              roomId: roomId,
              user: user,
              error: error
            });
            return error;
          }).then(function (result) {
            publishTempStreams.length = 0;
            return exchangeHandler(result, user, Message.PUBLISH);
          });
        });
      });
    };
    eventEmitter.on(CommonEvent.CONSUME_FINISHED, function () {
      if (!utils.isEmpty(publishTempStreams)) {
        publishInvoke(publishTempStreams);
      }
    });
    var publish = function publish(user) {
      var streams = user.stream;

      if (!utils.isArray(streams)) {
        streams = [streams];
      }
      var id = user.id;

      utils.forEach(streams, function (stream) {
        var mediaStream = stream.mediaStream,
            size = stream.size;

        var streamId = pc.getStreamId({
          id: id,
          stream: stream
        }, size);
        StreamCache.set(streamId, mediaStream);
      });

      if (prosumer.isExeuting()) {
        publishTempStreams.push(user);
        return utils.Defer.resolve();
      }
      return publishInvoke(user);
    };
    var unpublish = function unpublish(user) {
      user = utils.clone(user);
      var streamId = pc.getStreamId(user);
      var mediaStream = StreamCache.get(streamId);
      if (!mediaStream) {
        return utils.Defer.reject(ErrorType.Inner.STREAM_NOT_EXIST);
      }
      var streams = [];
      var _user = user,
          stream = _user.stream;

      var tinyStream = utils.clone(stream);
      var _user2 = user,
          id = _user2.id;

      stream = utils.extend(stream, {
        mediaStream: mediaStream
      });
      streams.push(stream);

      var tinyStreamId = pc.getStreamId({
        id: id,
        stream: tinyStream
      }, StreamSize.MIN);
      var tinyMeidaStream = StreamCache.get(tinyStreamId);
      if (tinyMeidaStream) {
        tinyStream = utils.extend(tinyStream, {
          mediaStream: tinyMeidaStream
        });
        streams.push(tinyStream);
      }
      utils.extend(user, {
        stream: streams
      });
      var roomId = im.getRoomId();
      Logger$1.log(LogTag.STREAM_HANDLER, {
        msg: 'unpublish:start',
        roomId: roomId,
        user: user
      });
      utils.forEach(streams, function (_ref3) {
        var mediaStream = _ref3.mediaStream;

        var tracks = mediaStream.getTracks();
        utils.forEach(tracks, function (track) {
          track.stop();
        });
      });
      return pc.removeStream(user).then(function (desc) {
        pc.setOffer(desc);
        return getBody().then(function (body) {
          var url = utils.tplEngine(Path.UNPUBLISH, {
            roomId: roomId
          });
          Logger$1.log(LogTag.STREAM_HANDLER, {
            msg: 'unpublish:request',
            roomId: roomId,
            user: user,
            body: body
          });
          return request$1.post({
            path: url,
            body: body
          }).then(function (response) {
            Logger$1.log(LogTag.STREAM_HANDLER, {
              msg: 'unpublish:response',
              roomId: roomId,
              user: user,
              response: response
            });
            StreamCache.remove(streamId);
            return User.set(User.SET_USERINFO, response);
          }, function (error) {
            Logger$1.log(LogTag.STREAM_HANDLER, {
              msg: 'unpublish:response',
              roomId: roomId,
              user: user,
              error: error
            });
          }).then(function (result) {
            return exchangeHandler(result, user, Message.UNPUBLISH);
          });
        });
      });
    };
    var subscribe = function subscribe(user) {
      var userId = user.id,
          _user$stream3 = user.stream,
          tag = _user$stream3.tag,
          type = _user$stream3.type;

      var subs = SubscribeCache.get(userId) || [];
      var types = [StreamType.VIDEO, StreamType.AUDIO];
      if (!utils.isEqual(type, StreamType.AUDIO_AND_VIDEO)) {
        types = [type];
      }
      utils.forEach(types, function (type) {
        var tUser = {
          id: userId,
          stream: {
            tag: tag,
            type: type
          }
        };
        var key = getUId(tUser);
        var uri = DataCache.get(key);
        var isAdd = true;
        utils.forEach(subs, function (sub) {
          var existType = sub.type,
              existTag = sub.tag;

          var isExist = utils.isEqual(type, existType) && utils.isEqual(tag, existTag);
          if (isExist) {
            isAdd = false;
          }
        });
        var msid = pc.getStreamId(user);
        if (isAdd && !utils.isUndefined(uri)) {
          subs.push({
            msid: msid,
            uri: uri,
            type: type,
            tag: tag
          });
        }
      });
      SubscribeCache.set(userId, subs);
      var roomId = im.getRoomId();
      Logger$1.log(LogTag.STREAM_HANDLER, {
        msg: 'subscribe:start',
        roomId: roomId,
        user: user
      });
      return utils.deferred(function (resolve, reject) {
        var isNotifyReady = DataCache.get(DataCacheName.IS_NOTIFY_READY);
        // 首次加入分发未完成，只添加缓存，最后，一次性处理
        if (isNotifyReady) {
          getBody().then(function (body) {
            var _body = body,
                sdp = _body.sdp;

            var url = utils.tplEngine(Path.SUBSCRIBE, {
              roomId: roomId
            });
            body = {
              path: url,
              body: body
            };
            prosumer.produce({
              sdp: sdp,
              body: body
            });
            eventEmitter.emit(CommonEvent.CONSUME);
          });
        }
        var uid = getSubPromiseUId(user);
        SubPromiseCache.set(uid, {
          resolve: resolve,
          reject: reject
        });
      });
    };
    var unsubscribe = function unsubscribe(user) {
      SubscribeCache.remove(user);
      var roomId = im.getRoomId();
      Logger$1.log(LogTag.STREAM_HANDLER, {
        msg: 'unsubscribe:start',
        roomId: roomId,
        user: user
      });
      return getBody().then(function (body) {
        var url = utils.tplEngine(Path.UNSUBSCRIBE, {
          roomId: roomId
        });
        Logger$1.log(LogTag.STREAM_HANDLER, {
          msg: 'unsubscribe:request',
          roomId: roomId,
          user: user,
          body: body
        });
        return request$1.post({
          path: url,
          body: body
        }).then(function (response) {
          Logger$1.log(LogTag.STREAM_HANDLER, {
            msg: 'unsubscribe:response',
            roomId: roomId,
            user: user,
            response: response
          });
          negotiate(response);
        }, function (error) {
          Logger$1.log(LogTag.STREAM_HANDLER, {
            msg: 'unsubscribe:response',
            roomId: roomId,
            user: user,
            error: error
          });
        });
      });
    };
    var resize = function resize(user) {
      var size = user.stream.size,
          id = user.id;

      var streams = SubscribeCache.get(id);
      if (utils.isUndefined(streams)) {
        return utils.Defer.reject(ErrorType.Inner.STREAM_NOT_EXIST);
      }
      var roomId = im.getRoomId();
      Logger$1.log(LogTag.STREAM_HANDLER, {
        msg: 'resize:start',
        roomId: roomId,
        user: user
      });
      return getBody().then(function (body) {
        var streamId = pc.getStreamId(user);
        var stream = utils.filter(streams, function (stream) {
          var msid = stream.msid;

          return utils.isEqual(streamId, msid);
        })[0];
        if (!stream) {
          var error = ErrorType.Inner.STREAM_NOT_EXIST;
          Logger$1.log(LogTag.STREAM_HANDLER, {
            msg: 'resize:response',
            roomId: roomId,
            user: user,
            error: error
          });
          return utils.Defer.reject(error);
        }
        var uri = stream.uri;

        utils.forEach(body.subscribeList, function (stream) {
          if (utils.isEqual(stream.uri, uri)) {
            utils.extend(stream, {
              simulcast: size
            });
          }
        });
        var url = utils.tplEngine(Path.RESIZE, {
          roomId: roomId
        });
        Logger$1.log(LogTag.STREAM_HANDLER, {
          msg: 'resize:request',
          roomId: roomId,
          user: user,
          body: body
        });
        return request$1.post({
          path: url,
          body: body
        }).then(function (response) {
          Logger$1.log(LogTag.STREAM_HANDLER, {
            msg: 'resize:response',
            roomId: roomId,
            user: user,
            response: response
          });
        }, function (error) {
          Logger$1.log(LogTag.STREAM_HANDLER, {
            msg: 'resize:response',
            roomId: roomId,
            user: user,
            error: error
          });
        });
      });
    };
    var get$$1 = function get$$1(user) {
      return utils.deferred(function (resolve) {
        var streamId = pc.getStreamId(user);
        resolve(StreamCache.get(streamId));
      });
    };
    var trackHandler = function trackHandler(user, type, isEnable) {
      var streamId = pc.getStreamId(user);
      var stream = StreamCache.get(streamId);
      if (stream) {
        var isAudio = utils.isEqual(type, StreamType.AUDIO);
        type = isAudio ? 'Audio' : 'Video';
        var tpl = 'get{type}Tracks';
        type = utils.tplEngine(tpl, {
          type: type
        });
        var tracks = stream[type]();
        utils.forEach(tracks, function (track) {
          track.enabled = isEnable;
        });
      }
    };

    var getFitUris = function getFitUris(user, type, state) {
      var id = user.id;

      var uris = PubResourceCache.get(id) || [];
      var targetId = pc.getStreamId(user);
      uris = utils.filter(uris, function (stream) {
        var msid = stream.msid,
            mediaType = stream.mediaType;

        var isSameStream = utils.isEqual(targetId, msid),
            isSameType = utils.isEqual(mediaType, type);
        var isFit = isSameStream && isSameType;
        // state 默认为 StreamState.ENABLE，为 DISABLE 未发布资源
        if (isFit) {
          utils.extend(stream, {
            state: state
          });
        }
        return isFit;
      });
      return uris;
    };
    var sendModify = function sendModify(user, type, state) {
      var uris = getFitUris(user, type, state);
      // uris 为空表示没有发布资源，不需要修改
      if (!utils.isEmpty(uris)) {
        var id = user.id;

        var fullUris = PubResourceCache.get(id);
        im.setUserInfo(User.SET_USERINFO, fullUris);
        im.sendMessage({
          type: Message.MODIFY,
          content: {
            uris: uris
          }
        });
      }
      return utils.Defer.resolve();
    };
    var modifyTrack = function modifyTrack(user, type, state, isEnabled) {
      trackHandler(user, type, isEnabled);
      if (isCurrentUser(user)) {
        sendModify(user, type, state);
      }
      return utils.Defer.resolve();
    };
    var mute = function mute(user) {
      var isEnabled = false;
      return modifyTrack(user, StreamType.AUDIO, StreamState.DISBALE, isEnabled);
    };
    var unmute = function unmute(user) {
      var isEnabled = true;
      return modifyTrack(user, StreamType.AUDIO, StreamState.ENABLE, isEnabled);
    };
    var disable = function disable(user) {
      var isEnabled = false;
      return modifyTrack(user, StreamType.VIDEO, StreamState.DISBALE, isEnabled);
    };
    var enable = function enable(user) {
      var isEnabled = true;
      return modifyTrack(user, StreamType.VIDEO, StreamState.ENABLE, isEnabled);
    };
    var getUsersById = function getUsersById(user) {
      var id = user.id;

      var subs = SubscribeCache.get(id);
      var streams = {},
          msTypes = {};
      utils.forEach(subs, function (_ref4) {
        var msid = _ref4.msid,
            tag = _ref4.tag,
            type = _ref4.type;

        streams[msid] = tag;
        var types = msTypes[msid] || [];
        types.push(type);
        msTypes[msid] = types;
      });
      var users = [];
      utils.forEach(streams, function (tag, msid) {
        var types = msTypes[msid] || [];
        var type = msTypes[0];
        type = utils.isEqual(types.length, 2) ? StreamType.AUDIO_AND_VIDEO : type;
        users.push({
          id: id,
          stream: {
            tag: tag,
            type: type
          }
        });
      });
      return users;
    };
    im.on(DownEvent.ROOM_USER_LEFT, function (error, user) {
      if (error) {
        throw error;
      }
      var users = getUsersById(user);
      utils.forEach(users, function (user) {
        unsubscribe(user);
      });
    });
    im.on(DownEvent.STREAM_UNPUBLISHED, function (error, user) {
      if (error) {
        throw error;
      }
      dispatchStreamEvent(user, function (key) {
        DataCache.remove(key);
      });
      unsubscribe(user);
    });
    var dispatch = function dispatch(event, args) {
      switch (event) {
        case UpEvent.STREAM_PUBLISH:
          return publish.apply(undefined, toConsumableArray(args));
        case UpEvent.STREAM_UNPUBLISH:
          return unpublish.apply(undefined, toConsumableArray(args));
        case UpEvent.STREAM_SUBSCRIBE:
          return subscribe.apply(undefined, toConsumableArray(args));
        case UpEvent.STREAM_UNSUBSCRIBE:
          return unsubscribe.apply(undefined, toConsumableArray(args));
        case UpEvent.STREAM_RESIZE:
          return resize.apply(undefined, toConsumableArray(args));
        case UpEvent.STREAM_GET:
          return get$$1.apply(undefined, toConsumableArray(args));
        case UpEvent.AUDIO_MUTE:
          return mute.apply(undefined, toConsumableArray(args));
        case UpEvent.AUDIO_UNMUTE:
          return unmute.apply(undefined, toConsumableArray(args));
        case UpEvent.VIDEO_DISABLE:
          return disable.apply(undefined, toConsumableArray(args));
        case UpEvent.VIDEO_ENABLE:
          return enable.apply(undefined, toConsumableArray(args));
        default:
          Logger$1.warn(LogTag.STREAM_HANDLER, {
            event: event,
            msg: 'unkown event'
          });
      }
    };
    return {
      dispatch: dispatch
    };
  }

  function RoomHandler(im) {
    var join = function join(room) {
      Logger$1.log(LogTag.ROOM_HANDLER, {
        msg: 'join:before',
        room: room
      });
      return im.joinRoom(room).then(function () {
        Logger$1.log(LogTag.ROOM_HANDLER, {
          msg: 'join:after',
          room: room
        });
        Logger$1.log(LogTag.ROOM_HANDLER, {
          msg: 'getUsers:before',
          room: room
        });
        return im.getExistUsers().then(function (_ref) {
          var users = _ref.users;

          Logger$1.log(LogTag.ROOM_HANDLER, {
            msg: 'getUsers:after',
            room: room,
            users: users
          });
          utils.forEach(users, function (user) {
            var id = user.userId;

            im.emit(DownEvent.ROOM_USER_JOINED, {
              id: id
            });
          });
        }, function (error) {
          Logger$1.log(LogTag.ROOM_HANDLER, {
            msg: 'getUsers:after',
            room: room,
            error: error
          });
          return error;
        });
      }, function (error) {
        Logger$1.log(LogTag.ROOM_HANDLER, {
          msg: 'join:after',
          room: room,
          error: error
        });
        return error;
      }).then(function () {
        return room;
      });
    };
    var leave = function leave() {
      var roomId = im.getRoomId();
      Logger$1.log(LogTag.ROOM_HANDLER, {
        msg: 'leave:before',
        roomId: roomId
      });
      return im.leaveRoom().then(function () {
        Logger$1.log(LogTag.ROOM_HANDLER, {
          msg: 'leave:after',
          roomId: roomId
        });
        var token = im.getToken();
        if (utils.isString(token)) {
          var url = utils.tplEngine(Path.EXIT, {
            roomId: roomId
          });
          request$1.post({
            path: url,
            body: {
              token: token
            }
          });
        }
      }, function (error) {
        Logger$1.log(LogTag.ROOM_HANDLER, {
          msg: 'leave:after',
          roomId: roomId,
          error: error
        });
        return error;
      });
    };
    var get$$1 = function get$$1() {
      return im.getRoom();
    };
    var dispatch = function dispatch(event, args) {
      switch (event) {
        case UpEvent.ROOM_JOIN:
          return join.apply(undefined, toConsumableArray(args));
        case UpEvent.ROOM_LEAVE:
          return leave.apply(undefined, toConsumableArray(args));
        case UpEvent.ROOM_GET:
          return get$$1.apply(undefined, toConsumableArray(args));
        default:
          Logger$1.warn(LogTag.ROOM_HANDLER, {
            event: event,
            msg: 'unkown event'
          });
      }
    };
    return {
      dispatch: dispatch
    };
  }

  /* 
      版本更新须知: 原版 adapter.js 不支持 es6 引入，将原始文件 factory 定义 Adapter 方法，通过模块引用初始化
  */
  function Adapter() {
  return function e(t, n, r) {
          function s(o, u) {
              if (!n[o]) {
                  if (!t[o]) {
                      var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw f.code = "MODULE_NOT_FOUND", f;
                  }var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
                      var n = t[o][1][e];return s(n ? n : e);
                  }, l, l.exports, e, t, n, r);
              }return n[o].exports;
          }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
              s(r[o]);
          }return s;
      }({
          1: [function (require, module, exports) {

              // Shimming starts here.

              (function () {
                  // Utils.
                  var logging = require('./utils').log;
                  var browserDetails = require('./utils').browserDetails;
                  // Export to the adapter global object visible in the browser.
                  module.exports.browserDetails = browserDetails;
                  module.exports.extractVersion = require('./utils').extractVersion;
                  module.exports.disableLog = require('./utils').disableLog;

                  // Comment out the line below if you want logging to occur, including logging
                  // for the switch statement below. Can also be turned on in the browser via
                  // adapter.disableLog(false), but then logging from the switch statement below
                  // will not appear.
                  require('./utils').disableLog(true);

                  // Browser shims.
                  var chromeShim = require('./chrome/chrome_shim') || null;
                  var edgeShim = require('./edge/edge_shim') || null;
                  var firefoxShim = require('./firefox/firefox_shim') || null;
                  var safariShim = require('./safari/safari_shim') || null;

                  // Shim browser if found.
                  switch (browserDetails.browser) {
                      case 'opera': // fallthrough as it uses chrome shims
                      case 'chrome':
                          if (!chromeShim || !chromeShim.shimPeerConnection) {
                              logging('Chrome shim is not included in this adapter release.');
                              return;
                          }
                          logging('adapter.js shimming chrome.');
                          // Export to the adapter global object visible in the browser.
                          module.exports.browserShim = chromeShim;

                          chromeShim.shimGetUserMedia();
                          chromeShim.shimSourceObject();
                          chromeShim.shimPeerConnection();
                          chromeShim.shimOnTrack();
                          break;
                      case 'firefox':
                          if (!firefoxShim || !firefoxShim.shimPeerConnection) {
                              logging('Firefox shim is not included in this adapter release.');
                              return;
                          }
                          logging('adapter.js shimming firefox.');
                          // Export to the adapter global object visible in the browser.
                          module.exports.browserShim = firefoxShim;

                          firefoxShim.shimGetUserMedia();
                          firefoxShim.shimSourceObject();
                          firefoxShim.shimPeerConnection();
                          firefoxShim.shimOnTrack();
                          break;
                      case 'edge':
                          if (!edgeShim || !edgeShim.shimPeerConnection) {
                              logging('MS edge shim is not included in this adapter release.');
                              return;
                          }
                          logging('adapter.js shimming edge.');
                          // Export to the adapter global object visible in the browser.
                          module.exports.browserShim = edgeShim;

                          edgeShim.shimPeerConnection();
                          break;
                      case 'safari':
                          if (!safariShim) {
                              logging('Safari shim is not included in this adapter release.');
                              return;
                          }
                          logging('adapter.js shimming safari.');
                          // Export to the adapter global object visible in the browser.
                          module.exports.browserShim = safariShim;

                          safariShim.shimGetUserMedia();
                          break;
                      default:
                          logging('Unsupported browser!');
                  }
              })();
          }, { "./chrome/chrome_shim": 2, "./edge/edge_shim": 5, "./firefox/firefox_shim": 6, "./safari/safari_shim": 8, "./utils": 9 }], 2: [function (require, module, exports) {

              var logging = require('../utils.js').log;
              var browserDetails = require('../utils.js').browserDetails;

              var chromeShim = {
                  shimOnTrack: function shimOnTrack() {
                      if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object' && window.RTCPeerConnection && !('ontrack' in window.RTCPeerConnection.prototype)) {
                          Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
                              get: function get$$1() {
                                  return this._ontrack;
                              },
                              set: function set$$1(f) {
                                  var self = this;
                                  if (this._ontrack) {
                                      this.removeEventListener('track', this._ontrack);
                                      this.removeEventListener('addstream', this._ontrackpoly);
                                  }
                                  this.addEventListener('track', this._ontrack = f);
                                  this.addEventListener('addstream', this._ontrackpoly = function (e) {
                                      // onaddstream does not fire when a track is added to an existing
                                      // stream. But stream.onaddtrack is implemented so we use that.
                                      e.stream.addEventListener('addtrack', function (te) {
                                          var event = new Event('track');
                                          event.track = te.track;
                                          event.receiver = { track: te.track };
                                          event.streams = [e.stream];
                                          self.dispatchEvent(event);
                                      });
                                      e.stream.getTracks().forEach(function (track) {
                                          var event = new Event('track');
                                          event.track = track;
                                          event.receiver = { track: track };
                                          event.streams = [e.stream];
                                          this.dispatchEvent(event);
                                      }.bind(this));
                                  }.bind(this));
                              }
                          });
                      }
                  },

                  shimSourceObject: function shimSourceObject() {
                      if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object') {
                          if (window.HTMLMediaElement && !('srcObject' in window.HTMLMediaElement.prototype)) {
                              // Shim the srcObject property, once, when HTMLMediaElement is found.
                              Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
                                  get: function get$$1() {
                                      return this._srcObject;
                                  },
                                  set: function set$$1(stream) {
                                      var self = this;
                                      // Use _srcObject as a private property for this shim
                                      this._srcObject = stream;
                                      if (this.src) {
                                          URL.revokeObjectURL(this.src);
                                      }

                                      if (!stream) {
                                          this.src = '';
                                          return;
                                      }
                                      this.src = URL.createObjectURL(stream);
                                      // We need to recreate the blob url when a track is added or
                                      // removed. Doing it manually since we want to avoid a recursion.
                                      stream.addEventListener('addtrack', function () {
                                          if (self.src) {
                                              URL.revokeObjectURL(self.src);
                                          }
                                          self.src = URL.createObjectURL(stream);
                                      });
                                      stream.addEventListener('removetrack', function () {
                                          if (self.src) {
                                              URL.revokeObjectURL(self.src);
                                          }
                                          self.src = URL.createObjectURL(stream);
                                      });
                                  }
                              });
                          }
                      }
                  },

                  shimPeerConnection: function shimPeerConnection() {
                      // The RTCPeerConnection object.
                      window.RTCPeerConnection = function (pcConfig, pcConstraints) {
                          // Translate iceTransportPolicy to iceTransports,
                          // see https://code.google.com/p/webrtc/issues/detail?id=4869
                          logging('PeerConnection');
                          if (pcConfig && pcConfig.iceTransportPolicy) {
                              pcConfig.iceTransports = pcConfig.iceTransportPolicy;
                          }

                          var pc = new webkitRTCPeerConnection(pcConfig, pcConstraints);
                          var origGetStats = pc.getStats.bind(pc);
                          pc.getStats = function (selector, successCallback, errorCallback) {
                              var self = this;
                              var args = arguments;

                              // If selector is a function then we are in the old style stats so just
                              // pass back the original getStats format to avoid breaking old users.
                              if (arguments.length > 0 && typeof selector === 'function') {
                                  return origGetStats(selector, successCallback);
                              }

                              var fixChromeStats_ = function fixChromeStats_(response) {
                                  var standardReport = {};
                                  var reports = response.result();
                                  reports.forEach(function (report) {
                                      var standardStats = {
                                          id: report.id,
                                          timestamp: report.timestamp,
                                          type: report.type
                                      };
                                      report.names().forEach(function (name) {
                                          standardStats[name] = report.stat(name);
                                      });
                                      standardReport[standardStats.id] = standardStats;
                                  });

                                  return standardReport;
                              };

                              if (arguments.length >= 2) {
                                  var successCallbackWrapper_ = function successCallbackWrapper_(response) {
                                      args[1](fixChromeStats_(response));
                                  };

                                  return origGetStats.apply(this, [successCallbackWrapper_, arguments[0]]);
                              }

                              // promise-support
                              return new Promise(function (resolve, reject) {
                                  if (args.length === 1 && (typeof selector === "undefined" ? "undefined" : _typeof(selector)) === 'object') {
                                      origGetStats.apply(self, [function (response) {
                                          resolve.apply(null, [fixChromeStats_(response)]);
                                      }, reject]);
                                  } else {
                                      origGetStats.apply(self, [resolve, reject]);
                                  }
                              });
                          };

                          return pc;
                      };
                      window.RTCPeerConnection.prototype = webkitRTCPeerConnection.prototype;

                      // wrap static methods. Currently just generateCertificate.
                      if (webkitRTCPeerConnection.generateCertificate) {
                          Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
                              get: function get$$1() {
                                  return webkitRTCPeerConnection.generateCertificate;
                              }
                          });
                      }

                      // add promise support
                      ['createOffer', 'createAnswer'].forEach(function (method) {
                          var nativeMethod = webkitRTCPeerConnection.prototype[method];
                          webkitRTCPeerConnection.prototype[method] = function () {
                              var self = this;
                              if (arguments.length < 1 || arguments.length === 1 && _typeof(arguments[0]) === 'object') {
                                  var opts = arguments.length === 1 ? arguments[0] : undefined;
                                  return new Promise(function (resolve, reject) {
                                      nativeMethod.apply(self, [resolve, reject, opts]);
                                  });
                              }
                              return nativeMethod.apply(this, arguments);
                          };
                      });

                      ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate'].forEach(function (method) {
                          var nativeMethod = webkitRTCPeerConnection.prototype[method];
                          webkitRTCPeerConnection.prototype[method] = function () {
                              var args = arguments;
                              var self = this;
                              args[0] = new (method === 'addIceCandidate' ? RTCIceCandidate : RTCSessionDescription)(args[0]);
                              return new Promise(function (resolve, reject) {
                                  nativeMethod.apply(self, [args[0], function () {
                                      resolve();
                                      if (args.length >= 2) {
                                          args[1].apply(null, []);
                                      }
                                  }, function (err) {
                                      reject(err);
                                      if (args.length >= 3) {
                                          args[2].apply(null, [err]);
                                      }
                                  }]);
                              });
                          };
                      });
                  },

                  // Attach a media stream to an element.
                  attachMediaStream: function attachMediaStream(element, stream) {
                      logging('DEPRECATED, attachMediaStream will soon be removed.');
                      if (browserDetails.version >= 43) {
                          element.srcObject = stream;
                      } else if (typeof element.src !== 'undefined') {
                          element.src = URL.createObjectURL(stream);
                      } else {
                          logging('Error attaching stream to element.');
                      }
                  },

                  reattachMediaStream: function reattachMediaStream(to, from) {
                      logging('DEPRECATED, reattachMediaStream will soon be removed.');
                      if (browserDetails.version >= 43) {
                          to.srcObject = from.srcObject;
                      } else {
                          to.src = from.src;
                      }
                  }
              };

              // Expose public methods.
              module.exports = {
                  shimOnTrack: chromeShim.shimOnTrack,
                  shimSourceObject: chromeShim.shimSourceObject,
                  shimPeerConnection: chromeShim.shimPeerConnection,
                  shimGetUserMedia: require('./getusermedia'),
                  attachMediaStream: chromeShim.attachMediaStream,
                  reattachMediaStream: chromeShim.reattachMediaStream
              };
          }, { "../utils.js": 9, "./getusermedia": 3 }], 3: [function (require, module, exports) {

              var logging = require('../utils.js').log;

              // Expose public methods.
              module.exports = function () {
                  var constraintsToChrome_ = function constraintsToChrome_(c) {
                      if ((typeof c === "undefined" ? "undefined" : _typeof(c)) !== 'object' || c.mandatory || c.optional) {
                          return c;
                      }
                      var cc = {};
                      Object.keys(c).forEach(function (key) {
                          if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
                              return;
                          }
                          var r = _typeof(c[key]) === 'object' ? c[key] : { ideal: c[key] };
                          if (r.exact !== undefined && typeof r.exact === 'number') {
                              r.min = r.max = r.exact;
                          }
                          var oldname_ = function oldname_(prefix, name) {
                              if (prefix) {
                                  return prefix + name.charAt(0).toUpperCase() + name.slice(1);
                              }
                              return name === 'deviceId' ? 'sourceId' : name;
                          };
                          if (r.ideal !== undefined) {
                              cc.optional = cc.optional || [];
                              var oc = {};
                              if (typeof r.ideal === 'number') {
                                  oc[oldname_('min', key)] = r.ideal;
                                  cc.optional.push(oc);
                                  oc = {};
                                  oc[oldname_('max', key)] = r.ideal;
                                  cc.optional.push(oc);
                              } else {
                                  oc[oldname_('', key)] = r.ideal;
                                  cc.optional.push(oc);
                              }
                          }
                          if (r.exact !== undefined && typeof r.exact !== 'number') {
                              cc.mandatory = cc.mandatory || {};
                              cc.mandatory[oldname_('', key)] = r.exact;
                          } else {
                              ['min', 'max'].forEach(function (mix) {
                                  if (r[mix] !== undefined) {
                                      cc.mandatory = cc.mandatory || {};
                                      cc.mandatory[oldname_(mix, key)] = r[mix];
                                  }
                              });
                          }
                      });
                      if (c.advanced) {
                          cc.optional = (cc.optional || []).concat(c.advanced);
                      }
                      return cc;
                  };

                  var getUserMedia_ = function getUserMedia_(constraints, onSuccess, onError) {
                      constraints = JSON.parse(JSON.stringify(constraints));
                      if (constraints.audio) {
                          constraints.audio = constraintsToChrome_(constraints.audio);
                      }
                      if (constraints.video) {
                          constraints.video = constraintsToChrome_(constraints.video);
                      }
                      logging('chrome: ' + JSON.stringify(constraints));
                      return navigator.webkitGetUserMedia(constraints, onSuccess, onError);
                  };
                  navigator.getUserMedia = getUserMedia_;

                  // Returns the result of getUserMedia as a Promise.
                  var getUserMediaPromise_ = function getUserMediaPromise_(constraints) {
                      return new Promise(function (resolve, reject) {
                          navigator.getUserMedia(constraints, resolve, reject);
                      });
                  };

                  if (!navigator.mediaDevices) {
                      navigator.mediaDevices = {
                          getUserMedia: getUserMediaPromise_,
                          enumerateDevices: function enumerateDevices() {
                              return new Promise(function (resolve) {
                                  var kinds = { audio: 'audioinput', video: 'videoinput' };
                                  return MediaStreamTrack.getSources(function (devices) {
                                      resolve(devices.map(function (device) {
                                          return {
                                              label: device.label,
                                              kind: kinds[device.kind],
                                              deviceId: device.id,
                                              groupId: ''
                                          };
                                      }));
                                  });
                              });
                          }
                      };
                  }

                  // A shim for getUserMedia method on the mediaDevices object.
                  // TODO(KaptenJansson) remove once implemented in Chrome stable.
                  if (!navigator.mediaDevices.getUserMedia) {
                      navigator.mediaDevices.getUserMedia = function (constraints) {
                          return getUserMediaPromise_(constraints);
                      };
                  } else {
                      // Even though Chrome 45 has navigator.mediaDevices and a getUserMedia
                      // function which returns a Promise, it does not accept spec-style
                      // constraints.
                      var origGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
                      navigator.mediaDevices.getUserMedia = function (c) {
                          if (c) {
                              logging('spec:   ' + JSON.stringify(c)); // whitespace for alignment
                              c.audio = constraintsToChrome_(c.audio);
                              c.video = constraintsToChrome_(c.video);
                              logging('chrome: ' + JSON.stringify(c));
                          }
                          return origGetUserMedia(c);
                      }.bind(this);
                  }

                  // Dummy devicechange event methods.
                  // TODO(KaptenJansson) remove once implemented in Chrome stable.
                  if (typeof navigator.mediaDevices.addEventListener === 'undefined') {
                      navigator.mediaDevices.addEventListener = function () {
                          logging('Dummy mediaDevices.addEventListener called.');
                      };
                  }
                  if (typeof navigator.mediaDevices.removeEventListener === 'undefined') {
                      navigator.mediaDevices.removeEventListener = function () {
                          logging('Dummy mediaDevices.removeEventListener called.');
                      };
                  }
              };
          }, { "../utils.js": 9 }], 4: [function (require, module, exports) {

              // SDP helpers.

              var SDPUtils = {};

              // Generate an alphanumeric identifier for cname or mids.
              // TODO: use UUIDs instead? https://gist.github.com/jed/982883
              SDPUtils.generateIdentifier = function () {
                  return Math.random().toString(36).substr(2, 10);
              };

              // The RTCP CNAME used by all peerconnections from the same JS.
              SDPUtils.localCName = SDPUtils.generateIdentifier();

              // Splits SDP into lines, dealing with both CRLF and LF.
              SDPUtils.splitLines = function (blob) {
                  return blob.trim().split('\n').map(function (line) {
                      return line.trim();
                  });
              };
              // Splits SDP into sessionpart and mediasections. Ensures CRLF.
              SDPUtils.splitSections = function (blob) {
                  var parts = blob.split('\nm=');
                  return parts.map(function (part, index) {
                      return (index > 0 ? 'm=' + part : part).trim() + '\r\n';
                  });
              };

              // Returns lines that start with a certain prefix.
              SDPUtils.matchPrefix = function (blob, prefix) {
                  return SDPUtils.splitLines(blob).filter(function (line) {
                      return line.indexOf(prefix) === 0;
                  });
              };

              // Parses an ICE candidate line. Sample input:
              // candidate:702786350 2 udp 41819902 8.8.8.8 60769 typ relay raddr 8.8.8.8
              // rport 55996"
              SDPUtils.parseCandidate = function (line) {
                  var parts;
                  // Parse both variants.
                  if (line.indexOf('a=candidate:') === 0) {
                      parts = line.substring(12).split(' ');
                  } else {
                      parts = line.substring(10).split(' ');
                  }

                  var candidate = {
                      foundation: parts[0],
                      component: parts[1],
                      protocol: parts[2].toLowerCase(),
                      priority: parseInt(parts[3], 10),
                      ip: parts[4],
                      port: parseInt(parts[5], 10),
                      // skip parts[6] == 'typ'
                      type: parts[7]
                  };

                  for (var i = 8; i < parts.length; i += 2) {
                      switch (parts[i]) {
                          case 'raddr':
                              candidate.relatedAddress = parts[i + 1];
                              break;
                          case 'rport':
                              candidate.relatedPort = parseInt(parts[i + 1], 10);
                              break;
                          case 'tcptype':
                              candidate.tcpType = parts[i + 1];
                              break;
                          default:
                              // Unknown extensions are silently ignored.
                              break;
                      }
                  }
                  return candidate;
              };

              // Translates a candidate object into SDP candidate attribute.
              SDPUtils.writeCandidate = function (candidate) {
                  var sdp = [];
                  sdp.push(candidate.foundation);
                  sdp.push(candidate.component);
                  sdp.push(candidate.protocol.toUpperCase());
                  sdp.push(candidate.priority);
                  sdp.push(candidate.ip);
                  sdp.push(candidate.port);

                  var type = candidate.type;
                  sdp.push('typ');
                  sdp.push(type);
                  if (type !== 'host' && candidate.relatedAddress && candidate.relatedPort) {
                      sdp.push('raddr');
                      sdp.push(candidate.relatedAddress); // was: relAddr
                      sdp.push('rport');
                      sdp.push(candidate.relatedPort); // was: relPort
                  }
                  if (candidate.tcpType && candidate.protocol.toLowerCase() === 'tcp') {
                      sdp.push('tcptype');
                      sdp.push(candidate.tcpType);
                  }
                  return 'candidate:' + sdp.join(' ');
              };

              // Parses an rtpmap line, returns RTCRtpCoddecParameters. Sample input:
              // a=rtpmap:111 opus/48000/2
              SDPUtils.parseRtpMap = function (line) {
                  var parts = line.substr(9).split(' ');
                  var parsed = {
                      payloadType: parseInt(parts.shift(), 10) // was: id
                  };

                  parts = parts[0].split('/');

                  parsed.name = parts[0];
                  parsed.clockRate = parseInt(parts[1], 10); // was: clockrate
                  // was: channels
                  parsed.numChannels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
                  return parsed;
              };

              // Generate an a=rtpmap line from RTCRtpCodecCapability or
              // RTCRtpCodecParameters.
              SDPUtils.writeRtpMap = function (codec) {
                  var pt = codec.payloadType;
                  if (codec.preferredPayloadType !== undefined) {
                      pt = codec.preferredPayloadType;
                  }
                  return 'a=rtpmap:' + pt + ' ' + codec.name + '/' + codec.clockRate + (codec.numChannels !== 1 ? '/' + codec.numChannels : '') + '\r\n';
              };

              // Parses an a=extmap line (headerextension from RFC 5285). Sample input:
              // a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
              SDPUtils.parseExtmap = function (line) {
                  var parts = line.substr(9).split(' ');
                  return {
                      id: parseInt(parts[0], 10),
                      uri: parts[1]
                  };
              };

              // Generates a=extmap line from RTCRtpHeaderExtensionParameters or
              // RTCRtpHeaderExtension.
              SDPUtils.writeExtmap = function (headerExtension) {
                  return 'a=extmap:' + (headerExtension.id || headerExtension.preferredId) + ' ' + headerExtension.uri + '\r\n';
              };

              // Parses an ftmp line, returns dictionary. Sample input:
              // a=fmtp:96 vbr=on;cng=on
              // Also deals with vbr=on; cng=on
              SDPUtils.parseFmtp = function (line) {
                  var parsed = {};
                  var kv;
                  var parts = line.substr(line.indexOf(' ') + 1).split(';');
                  for (var j = 0; j < parts.length; j++) {
                      kv = parts[j].trim().split('=');
                      parsed[kv[0].trim()] = kv[1];
                  }
                  return parsed;
              };

              // Generates an a=ftmp line from RTCRtpCodecCapability or RTCRtpCodecParameters.
              SDPUtils.writeFmtp = function (codec) {
                  var line = '';
                  var pt = codec.payloadType;
                  if (codec.preferredPayloadType !== undefined) {
                      pt = codec.preferredPayloadType;
                  }
                  if (codec.parameters && Object.keys(codec.parameters).length) {
                      var params = [];
                      Object.keys(codec.parameters).forEach(function (param) {
                          params.push(param + '=' + codec.parameters[param]);
                      });
                      line += 'a=fmtp:' + pt + ' ' + params.join(';') + '\r\n';
                  }
                  return line;
              };

              // Parses an rtcp-fb line, returns RTCPRtcpFeedback object. Sample input:
              // a=rtcp-fb:98 nack rpsi
              SDPUtils.parseRtcpFb = function (line) {
                  var parts = line.substr(line.indexOf(' ') + 1).split(' ');
                  return {
                      type: parts.shift(),
                      parameter: parts.join(' ')
                  };
              };
              // Generate a=rtcp-fb lines from RTCRtpCodecCapability or RTCRtpCodecParameters.
              SDPUtils.writeRtcpFb = function (codec) {
                  var lines = '';
                  var pt = codec.payloadType;
                  if (codec.preferredPayloadType !== undefined) {
                      pt = codec.preferredPayloadType;
                  }
                  if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
                      // FIXME: special handling for trr-int?
                      codec.rtcpFeedback.forEach(function (fb) {
                          lines += 'a=rtcp-fb:' + pt + ' ' + fb.type + ' ' + fb.parameter + '\r\n';
                      });
                  }
                  return lines;
              };

              // Parses an RFC 5576 ssrc media attribute. Sample input:
              // a=ssrc:3735928559 cname:something
              SDPUtils.parseSsrcMedia = function (line) {
                  var sp = line.indexOf(' ');
                  var parts = {
                      ssrc: parseInt(line.substr(7, sp - 7), 10)
                  };
                  var colon = line.indexOf(':', sp);
                  if (colon > -1) {
                      parts.attribute = line.substr(sp + 1, colon - sp - 1);
                      parts.value = line.substr(colon + 1);
                  } else {
                      parts.attribute = line.substr(sp + 1);
                  }
                  return parts;
              };

              // Extracts DTLS parameters from SDP media section or sessionpart.
              // FIXME: for consistency with other functions this should only
              //   get the fingerprint line as input. See also getIceParameters.
              SDPUtils.getDtlsParameters = function (mediaSection, sessionpart) {
                  var lines = SDPUtils.splitLines(mediaSection);
                  // Search in session part, too.
                  lines = lines.concat(SDPUtils.splitLines(sessionpart));
                  var fpLine = lines.filter(function (line) {
                      return line.indexOf('a=fingerprint:') === 0;
                  })[0].substr(14);
                  // Note: a=setup line is ignored since we use the 'auto' role.
                  var dtlsParameters = {
                      role: 'auto',
                      fingerprints: [{
                          algorithm: fpLine.split(' ')[0],
                          value: fpLine.split(' ')[1]
                      }]
                  };
                  return dtlsParameters;
              };

              // Serializes DTLS parameters to SDP.
              SDPUtils.writeDtlsParameters = function (params, setupType) {
                  var sdp = 'a=setup:' + setupType + '\r\n';
                  params.fingerprints.forEach(function (fp) {
                      sdp += 'a=fingerprint:' + fp.algorithm + ' ' + fp.value + '\r\n';
                  });
                  return sdp;
              };
              // Parses ICE information from SDP media section or sessionpart.
              // FIXME: for consistency with other functions this should only
              //   get the ice-ufrag and ice-pwd lines as input.
              SDPUtils.getIceParameters = function (mediaSection, sessionpart) {
                  var lines = SDPUtils.splitLines(mediaSection);
                  // Search in session part, too.
                  lines = lines.concat(SDPUtils.splitLines(sessionpart));
                  var iceParameters = {
                      usernameFragment: lines.filter(function (line) {
                          return line.indexOf('a=ice-ufrag:') === 0;
                      })[0].substr(12),
                      password: lines.filter(function (line) {
                          return line.indexOf('a=ice-pwd:') === 0;
                      })[0].substr(10)
                  };
                  return iceParameters;
              };

              // Serializes ICE parameters to SDP.
              SDPUtils.writeIceParameters = function (params) {
                  return 'a=ice-ufrag:' + params.usernameFragment + '\r\n' + 'a=ice-pwd:' + params.password + '\r\n';
              };

              // Parses the SDP media section and returns RTCRtpParameters.
              SDPUtils.parseRtpParameters = function (mediaSection) {
                  var description = {
                      codecs: [],
                      headerExtensions: [],
                      fecMechanisms: [],
                      rtcp: []
                  };
                  var lines = SDPUtils.splitLines(mediaSection);
                  var mline = lines[0].split(' ');
                  for (var i = 3; i < mline.length; i++) {
                      // find all codecs from mline[3..]
                      var pt = mline[i];
                      var rtpmapline = SDPUtils.matchPrefix(mediaSection, 'a=rtpmap:' + pt + ' ')[0];
                      if (rtpmapline) {
                          var codec = SDPUtils.parseRtpMap(rtpmapline);
                          var fmtps = SDPUtils.matchPrefix(mediaSection, 'a=fmtp:' + pt + ' ');
                          // Only the first a=fmtp:<pt> is considered.
                          codec.parameters = fmtps.length ? SDPUtils.parseFmtp(fmtps[0]) : {};
                          codec.rtcpFeedback = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-fb:' + pt + ' ').map(SDPUtils.parseRtcpFb);
                          description.codecs.push(codec);
                          // parse FEC mechanisms from rtpmap lines.
                          switch (codec.name.toUpperCase()) {
                              case 'RED':
                              case 'ULPFEC':
                                  description.fecMechanisms.push(codec.name.toUpperCase());
                                  break;
                              default:
                                  // only RED and ULPFEC are recognized as FEC mechanisms.
                                  break;
                          }
                      }
                  }
                  SDPUtils.matchPrefix(mediaSection, 'a=extmap:').forEach(function (line) {
                      description.headerExtensions.push(SDPUtils.parseExtmap(line));
                  });
                  // FIXME: parse rtcp.
                  return description;
              };

              // Generates parts of the SDP media section describing the capabilities /
              // parameters.
              SDPUtils.writeRtpDescription = function (kind, caps) {
                  var sdp = '';

                  // Build the mline.
                  sdp += 'm=' + kind + ' ';
                  sdp += caps.codecs.length > 0 ? '9' : '0'; // reject if no codecs.
                  sdp += ' UDP/TLS/RTP/SAVPF ';
                  sdp += caps.codecs.map(function (codec) {
                      if (codec.preferredPayloadType !== undefined) {
                          return codec.preferredPayloadType;
                      }
                      return codec.payloadType;
                  }).join(' ') + '\r\n';

                  sdp += 'c=IN IP4 0.0.0.0\r\n';
                  sdp += 'a=rtcp:9 IN IP4 0.0.0.0\r\n';

                  // Add a=rtpmap lines for each codec. Also fmtp and rtcp-fb.
                  caps.codecs.forEach(function (codec) {
                      sdp += SDPUtils.writeRtpMap(codec);
                      sdp += SDPUtils.writeFmtp(codec);
                      sdp += SDPUtils.writeRtcpFb(codec);
                  });
                  // FIXME: add headerExtensions, fecMechanism艧 and rtcp.
                  sdp += 'a=rtcp-mux\r\n';
                  return sdp;
              };

              // Parses the SDP media section and returns an array of
              // RTCRtpEncodingParameters.
              SDPUtils.parseRtpEncodingParameters = function (mediaSection) {
                  var encodingParameters = [];
                  var description = SDPUtils.parseRtpParameters(mediaSection);
                  var hasRed = description.fecMechanisms.indexOf('RED') !== -1;
                  var hasUlpfec = description.fecMechanisms.indexOf('ULPFEC') !== -1;

                  // filter a=ssrc:... cname:, ignore PlanB-msid
                  var ssrcs = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:').map(function (line) {
                      return SDPUtils.parseSsrcMedia(line);
                  }).filter(function (parts) {
                      return parts.attribute === 'cname';
                  });
                  var primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
                  var secondarySsrc;

                  var flows = SDPUtils.matchPrefix(mediaSection, 'a=ssrc-group:FID').map(function (line) {
                      var parts = line.split(' ');
                      parts.shift();
                      return parts.map(function (part) {
                          return parseInt(part, 10);
                      });
                  });
                  if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
                      secondarySsrc = flows[0][1];
                  }

                  description.codecs.forEach(function (codec) {
                      if (codec.name.toUpperCase() === 'RTX' && codec.parameters.apt) {
                          var encParam = {
                              ssrc: primarySsrc,
                              codecPayloadType: parseInt(codec.parameters.apt, 10),
                              rtx: {
                                  ssrc: secondarySsrc
                              }
                          };
                          encodingParameters.push(encParam);
                          if (hasRed) {
                              encParam = JSON.parse(JSON.stringify(encParam));
                              encParam.fec = {
                                  ssrc: secondarySsrc,
                                  mechanism: hasUlpfec ? 'red+ulpfec' : 'red'
                              };
                              encodingParameters.push(encParam);
                          }
                      }
                  });
                  if (encodingParameters.length === 0 && primarySsrc) {
                      encodingParameters.push({
                          ssrc: primarySsrc
                      });
                  }

                  // we support both b=AS and b=TIAS but interpret AS as TIAS.
                  var bandwidth = SDPUtils.matchPrefix(mediaSection, 'b=');
                  if (bandwidth.length) {
                      if (bandwidth[0].indexOf('b=TIAS:') === 0) {
                          bandwidth = parseInt(bandwidth[0].substr(7), 10);
                      } else if (bandwidth[0].indexOf('b=AS:') === 0) {
                          bandwidth = parseInt(bandwidth[0].substr(5), 10);
                      }
                      encodingParameters.forEach(function (params) {
                          params.maxBitrate = bandwidth;
                      });
                  }
                  return encodingParameters;
              };

              SDPUtils.writeSessionBoilerplate = function () {
                  // FIXME: sess-id should be an NTP timestamp.
                  return 'v=0\r\n' + 'o=thisisadapterortc 8169639915646943137 2 IN IP4 127.0.0.1\r\n' + 's=-\r\n' + 't=0 0\r\n';
              };

              SDPUtils.writeMediaSection = function (transceiver, caps, type, stream) {
                  var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);

                  // Map ICE parameters (ufrag, pwd) to SDP.
                  sdp += SDPUtils.writeIceParameters(transceiver.iceGatherer.getLocalParameters());

                  // Map DTLS parameters to SDP.
                  sdp += SDPUtils.writeDtlsParameters(transceiver.dtlsTransport.getLocalParameters(), type === 'offer' ? 'actpass' : 'active');

                  sdp += 'a=mid:' + transceiver.mid + '\r\n';

                  if (transceiver.rtpSender && transceiver.rtpReceiver) {
                      sdp += 'a=sendrecv\r\n';
                  } else if (transceiver.rtpSender) {
                      sdp += 'a=sendonly\r\n';
                  } else if (transceiver.rtpReceiver) {
                      sdp += 'a=recvonly\r\n';
                  } else {
                      sdp += 'a=inactive\r\n';
                  }

                  // FIXME: for RTX there might be multiple SSRCs. Not implemented in Edge yet.
                  if (transceiver.rtpSender) {
                      var msid = 'msid:' + stream.id + ' ' + transceiver.rtpSender.track.id + '\r\n';
                      sdp += 'a=' + msid;
                      sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc + ' ' + msid;
                  }
                  // FIXME: this should be written by writeRtpDescription.
                  sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc + ' cname:' + SDPUtils.localCName + '\r\n';
                  return sdp;
              };

              // Gets the direction from the mediaSection or the sessionpart.
              SDPUtils.getDirection = function (mediaSection, sessionpart) {
                  // Look for sendrecv, sendonly, recvonly, inactive, default to sendrecv.
                  var lines = SDPUtils.splitLines(mediaSection);
                  for (var i = 0; i < lines.length; i++) {
                      switch (lines[i]) {
                          case 'a=sendrecv':
                          case 'a=sendonly':
                          case 'a=recvonly':
                          case 'a=inactive':
                              return lines[i].substr(2);
                          default:
                          // FIXME: What should happen here?
                      }
                  }
                  if (sessionpart) {
                      return SDPUtils.getDirection(sessionpart);
                  }
                  return 'sendrecv';
              };

              // Expose public methods.
              module.exports = SDPUtils;
          }, {}], 5: [function (require, module, exports) {

              var SDPUtils = require('./edge_sdp');
              var logging = require('../utils').log;

              var edgeShim = {
                  shimPeerConnection: function shimPeerConnection() {
                      if (window.RTCIceGatherer) {
                          // ORTC defines an RTCIceCandidate object but no constructor.
                          // Not implemented in Edge.
                          if (!window.RTCIceCandidate) {
                              window.RTCIceCandidate = function (args) {
                                  return args;
                              };
                          }
                          // ORTC does not have a session description object but
                          // other browsers (i.e. Chrome) that will support both PC and ORTC
                          // in the future might have this defined already.
                          if (!window.RTCSessionDescription) {
                              window.RTCSessionDescription = function (args) {
                                  return args;
                              };
                          }
                      }

                      window.RTCPeerConnection = function (config) {
                          var self = this;

                          var _eventTarget = document.createDocumentFragment();
                          ['addEventListener', 'removeEventListener', 'dispatchEvent'].forEach(function (method) {
                              self[method] = _eventTarget[method].bind(_eventTarget);
                          });

                          this.onicecandidate = null;
                          this.onaddstream = null;
                          this.ontrack = null;
                          this.onremovestream = null;
                          this.onsignalingstatechange = null;
                          this.oniceconnectionstatechange = null;
                          this.onnegotiationneeded = null;
                          this.ondatachannel = null;

                          this.localStreams = [];
                          this.remoteStreams = [];
                          this.getLocalStreams = function () {
                              return self.localStreams;
                          };
                          this.getRemoteStreams = function () {
                              return self.remoteStreams;
                          };

                          this.localDescription = new RTCSessionDescription({
                              type: '',
                              sdp: ''
                          });
                          this.remoteDescription = new RTCSessionDescription({
                              type: '',
                              sdp: ''
                          });
                          this.signalingState = 'stable';
                          this.iceConnectionState = 'new';
                          this.iceGatheringState = 'new';

                          this.iceOptions = {
                              gatherPolicy: 'all',
                              iceServers: []
                          };
                          if (config && config.iceTransportPolicy) {
                              switch (config.iceTransportPolicy) {
                                  case 'all':
                                  case 'relay':
                                      this.iceOptions.gatherPolicy = config.iceTransportPolicy;
                                      break;
                                  case 'none':
                                      // FIXME: remove once implementation and spec have added this.
                                      throw new TypeError('iceTransportPolicy "none" not supported');
                                  default:
                                      // don't set iceTransportPolicy.
                                      break;
                              }
                          }
                          if (config && config.iceServers) {
                              // Edge does not like
                              // 1) stun:
                              // 2) turn: that does not have all of turn:host:port?transport=udp
                              this.iceOptions.iceServers = config.iceServers.filter(function (server) {
                                  if (server && server.urls) {
                                      server.urls = server.urls.filter(function (url) {
                                          return url.indexOf('turn:') === 0 && url.indexOf('transport=udp') !== -1;
                                      })[0];
                                      return !!server.urls;
                                  }
                                  return false;
                              });
                          }

                          // per-track iceGathers, iceTransports, dtlsTransports, rtpSenders, ...
                          // everything that is needed to describe a SDP m-line.
                          this.transceivers = [];

                          // since the iceGatherer is currently created in createOffer but we
                          // must not emit candidates until after setLocalDescription we buffer
                          // them in this array.
                          this._localIceCandidatesBuffer = [];
                      };

                      window.RTCPeerConnection.prototype._emitBufferedCandidates = function () {
                          var self = this;
                          var sections = SDPUtils.splitSections(self.localDescription.sdp);
                          // FIXME: need to apply ice candidates in a way which is async but
                          // in-order
                          this._localIceCandidatesBuffer.forEach(function (event) {
                              var end = !event.candidate || Object.keys(event.candidate).length === 0;
                              if (end) {
                                  for (var j = 1; j < sections.length; j++) {
                                      if (sections[j].indexOf('\r\na=end-of-candidates\r\n') === -1) {
                                          sections[j] += 'a=end-of-candidates\r\n';
                                      }
                                  }
                              } else if (event.candidate.candidate.indexOf('typ endOfCandidates') === -1) {
                                  sections[event.candidate.sdpMLineIndex + 1] += 'a=' + event.candidate.candidate + '\r\n';
                              }
                              self.localDescription.sdp = sections.join('');
                              self.dispatchEvent(event);
                              if (self.onicecandidate !== null) {
                                  self.onicecandidate(event);
                              }
                              if (!event.candidate && self.iceGatheringState !== 'complete') {
                                  var complete = self.transceivers.every(function (transceiver) {
                                      return transceiver.iceGatherer && transceiver.iceGatherer.state === 'completed';
                                  });
                                  if (complete) {
                                      self.iceGatheringState = 'complete';
                                  }
                              }
                          });
                          this._localIceCandidatesBuffer = [];
                      };

                      window.RTCPeerConnection.prototype.addStream = function (stream) {
                          // Clone is necessary for local demos mostly, attaching directly
                          // to two different senders does not work (build 10547).
                          this.localStreams.push(stream.clone());
                          this._maybeFireNegotiationNeeded();
                      };

                      window.RTCPeerConnection.prototype.removeStream = function (stream) {
                          var idx = this.localStreams.indexOf(stream);
                          if (idx > -1) {
                              this.localStreams.splice(idx, 1);
                              this._maybeFireNegotiationNeeded();
                          }
                      };

                      // Determines the intersection of local and remote capabilities.
                      window.RTCPeerConnection.prototype._getCommonCapabilities = function (localCapabilities, remoteCapabilities) {
                          var commonCapabilities = {
                              codecs: [],
                              headerExtensions: [],
                              fecMechanisms: []
                          };
                          localCapabilities.codecs.forEach(function (lCodec) {
                              for (var i = 0; i < remoteCapabilities.codecs.length; i++) {
                                  var rCodec = remoteCapabilities.codecs[i];
                                  if (lCodec.name.toLowerCase() === rCodec.name.toLowerCase() && lCodec.clockRate === rCodec.clockRate && lCodec.numChannels === rCodec.numChannels) {
                                      // push rCodec so we reply with offerer payload type
                                      commonCapabilities.codecs.push(rCodec);

                                      // FIXME: also need to determine intersection between
                                      // .rtcpFeedback and .parameters
                                      break;
                                  }
                              }
                          });

                          localCapabilities.headerExtensions.forEach(function (lHeaderExtension) {
                              for (var i = 0; i < remoteCapabilities.headerExtensions.length; i++) {
                                  var rHeaderExtension = remoteCapabilities.headerExtensions[i];
                                  if (lHeaderExtension.uri === rHeaderExtension.uri) {
                                      commonCapabilities.headerExtensions.push(rHeaderExtension);
                                      break;
                                  }
                              }
                          });

                          // FIXME: fecMechanisms
                          return commonCapabilities;
                      };

                      // Create ICE gatherer, ICE transport and DTLS transport.
                      window.RTCPeerConnection.prototype._createIceAndDtlsTransports = function (mid, sdpMLineIndex) {
                          var self = this;
                          var iceGatherer = new RTCIceGatherer(self.iceOptions);
                          var iceTransport = new RTCIceTransport(iceGatherer);
                          iceGatherer.onlocalcandidate = function (evt) {
                              var event = new Event('icecandidate');
                              event.candidate = { sdpMid: mid, sdpMLineIndex: sdpMLineIndex };

                              var cand = evt.candidate;
                              var end = !cand || Object.keys(cand).length === 0;
                              // Edge emits an empty object for RTCIceCandidateComplete鈥�
                              if (end) {
                                  // polyfill since RTCIceGatherer.state is not implemented in
                                  // Edge 10547 yet.
                                  if (iceGatherer.state === undefined) {
                                      iceGatherer.state = 'completed';
                                  }

                                  // Emit a candidate with type endOfCandidates to make the samples
                                  // work. Edge requires addIceCandidate with this empty candidate
                                  // to start checking. The real solution is to signal
                                  // end-of-candidates to the other side when getting the null
                                  // candidate but some apps (like the samples) don't do that.
                                  event.candidate.candidate = 'candidate:1 1 udp 1 0.0.0.0 9 typ endOfCandidates';
                              } else {
                                  // RTCIceCandidate doesn't have a component, needs to be added
                                  cand.component = iceTransport.component === 'RTCP' ? 2 : 1;
                                  event.candidate.candidate = SDPUtils.writeCandidate(cand);
                              }

                              var complete = self.transceivers.every(function (transceiver) {
                                  return transceiver.iceGatherer && transceiver.iceGatherer.state === 'completed';
                              });

                              // Emit candidate if localDescription is set.
                              // Also emits null candidate when all gatherers are complete.
                              switch (self.iceGatheringState) {
                                  case 'new':
                                      self._localIceCandidatesBuffer.push(event);
                                      if (end && complete) {
                                          self._localIceCandidatesBuffer.push(new Event('icecandidate'));
                                      }
                                      break;
                                  case 'gathering':
                                      self._emitBufferedCandidates();
                                      self.dispatchEvent(event);
                                      if (self.onicecandidate !== null) {
                                          self.onicecandidate(event);
                                      }
                                      if (complete) {
                                          self.dispatchEvent(new Event('icecandidate'));
                                          if (self.onicecandidate !== null) {
                                              self.onicecandidate(new Event('icecandidate'));
                                          }
                                          self.iceGatheringState = 'complete';
                                      }
                                      break;
                                  case 'complete':
                                      // should not happen... currently!
                                      break;
                                  default:
                                      // no-op.
                                      break;
                              }
                          };
                          iceTransport.onicestatechange = function () {
                              self._updateConnectionState();
                          };

                          var dtlsTransport = new RTCDtlsTransport(iceTransport);
                          dtlsTransport.ondtlsstatechange = function () {
                              self._updateConnectionState();
                          };
                          dtlsTransport.onerror = function () {
                              // onerror does not set state to failed by itself.
                              dtlsTransport.state = 'failed';
                              self._updateConnectionState();
                          };

                          return {
                              iceGatherer: iceGatherer,
                              iceTransport: iceTransport,
                              dtlsTransport: dtlsTransport
                          };
                      };

                      // Start the RTP Sender and Receiver for a transceiver.
                      window.RTCPeerConnection.prototype._transceive = function (transceiver, send, recv) {
                          var params = this._getCommonCapabilities(transceiver.localCapabilities, transceiver.remoteCapabilities);
                          if (send && transceiver.rtpSender) {
                              params.encodings = transceiver.sendEncodingParameters;
                              params.rtcp = {
                                  cname: SDPUtils.localCName
                              };
                              if (transceiver.recvEncodingParameters.length) {
                                  params.rtcp.ssrc = transceiver.recvEncodingParameters[0].ssrc;
                              }
                              transceiver.rtpSender.send(params);
                          }
                          if (recv && transceiver.rtpReceiver) {
                              params.encodings = transceiver.recvEncodingParameters;
                              params.rtcp = {
                                  cname: transceiver.cname
                              };
                              if (transceiver.sendEncodingParameters.length) {
                                  params.rtcp.ssrc = transceiver.sendEncodingParameters[0].ssrc;
                              }
                              transceiver.rtpReceiver.receive(params);
                          }
                      };

                      window.RTCPeerConnection.prototype.setLocalDescription = function (description) {
                          var self = this;
                          var sections;
                          var sessionpart;
                          if (description.type === 'offer') {
                              // FIXME: What was the purpose of this empty if statement?
                              // if (!this._pendingOffer) {
                              // } else {
                              if (this._pendingOffer) {
                                  // VERY limited support for SDP munging. Limited to:
                                  // * changing the order of codecs
                                  sections = SDPUtils.splitSections(description.sdp);
                                  sessionpart = sections.shift();
                                  sections.forEach(function (mediaSection, sdpMLineIndex) {
                                      var caps = SDPUtils.parseRtpParameters(mediaSection);
                                      self._pendingOffer[sdpMLineIndex].localCapabilities = caps;
                                  });
                                  this.transceivers = this._pendingOffer;
                                  delete this._pendingOffer;
                              }
                          } else if (description.type === 'answer') {
                              sections = SDPUtils.splitSections(self.remoteDescription.sdp);
                              sessionpart = sections.shift();
                              sections.forEach(function (mediaSection, sdpMLineIndex) {
                                  var transceiver = self.transceivers[sdpMLineIndex];
                                  var iceGatherer = transceiver.iceGatherer;
                                  var iceTransport = transceiver.iceTransport;
                                  var dtlsTransport = transceiver.dtlsTransport;
                                  var localCapabilities = transceiver.localCapabilities;
                                  var remoteCapabilities = transceiver.remoteCapabilities;
                                  var rejected = mediaSection.split('\n', 1)[0].split(' ', 2)[1] === '0';

                                  if (!rejected) {
                                      var remoteIceParameters = SDPUtils.getIceParameters(mediaSection, sessionpart);
                                      iceTransport.start(iceGatherer, remoteIceParameters, 'controlled');

                                      var remoteDtlsParameters = SDPUtils.getDtlsParameters(mediaSection, sessionpart);
                                      dtlsTransport.start(remoteDtlsParameters);

                                      // Calculate intersection of capabilities.
                                      var params = self._getCommonCapabilities(localCapabilities, remoteCapabilities);

                                      // Start the RTCRtpSender. The RTCRtpReceiver for this
                                      // transceiver has already been started in setRemoteDescription.
                                      self._transceive(transceiver, params.codecs.length > 0, false);
                                  }
                              });
                          }

                          this.localDescription = {
                              type: description.type,
                              sdp: description.sdp
                          };
                          switch (description.type) {
                              case 'offer':
                                  this._updateSignalingState('have-local-offer');
                                  break;
                              case 'answer':
                                  this._updateSignalingState('stable');
                                  break;
                              default:
                                  throw new TypeError('unsupported type "' + description.type + '"');
                          }

                          // If a success callback was provided, emit ICE candidates after it
                          // has been executed. Otherwise, emit callback after the Promise is
                          // resolved.
                          var hasCallback = arguments.length > 1 && typeof arguments[1] === 'function';
                          if (hasCallback) {
                              var cb = arguments[1];
                              window.setTimeout(function () {
                                  cb();
                                  if (self.iceGatheringState === 'new') {
                                      self.iceGatheringState = 'gathering';
                                  }
                                  self._emitBufferedCandidates();
                              }, 0);
                          }
                          var p = Promise.resolve();
                          p.then(function () {
                              if (!hasCallback) {
                                  if (self.iceGatheringState === 'new') {
                                      self.iceGatheringState = 'gathering';
                                  }
                                  // Usually candidates will be emitted earlier.
                                  window.setTimeout(self._emitBufferedCandidates.bind(self), 500);
                              }
                          });
                          return p;
                      };

                      window.RTCPeerConnection.prototype.setRemoteDescription = function (description) {
                          var self = this;
                          var stream = new MediaStream();
                          var receiverList = [];
                          var sections = SDPUtils.splitSections(description.sdp);
                          var sessionpart = sections.shift();
                          sections.forEach(function (mediaSection, sdpMLineIndex) {
                              var lines = SDPUtils.splitLines(mediaSection);
                              var mline = lines[0].substr(2).split(' ');
                              var kind = mline[0];
                              var rejected = mline[1] === '0';
                              var direction = SDPUtils.getDirection(mediaSection, sessionpart);

                              var transceiver;
                              var iceGatherer;
                              var iceTransport;
                              var dtlsTransport;
                              var rtpSender;
                              var rtpReceiver;
                              var sendEncodingParameters;
                              var recvEncodingParameters;
                              var localCapabilities;

                              var track;
                              // FIXME: ensure the mediaSection has rtcp-mux set.
                              var remoteCapabilities = SDPUtils.parseRtpParameters(mediaSection);
                              var remoteIceParameters;
                              var remoteDtlsParameters;
                              if (!rejected) {
                                  remoteIceParameters = SDPUtils.getIceParameters(mediaSection, sessionpart);
                                  remoteDtlsParameters = SDPUtils.getDtlsParameters(mediaSection, sessionpart);
                              }
                              recvEncodingParameters = SDPUtils.parseRtpEncodingParameters(mediaSection);

                              var mid = SDPUtils.matchPrefix(mediaSection, 'a=mid:');
                              if (mid.length) {
                                  mid = mid[0].substr(6);
                              } else {
                                  mid = SDPUtils.generateIdentifier();
                              }

                              var cname;
                              // Gets the first SSRC. Note that with RTX there might be multiple
                              // SSRCs.
                              var remoteSsrc = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:').map(function (line) {
                                  return SDPUtils.parseSsrcMedia(line);
                              }).filter(function (obj) {
                                  return obj.attribute === 'cname';
                              })[0];
                              if (remoteSsrc) {
                                  cname = remoteSsrc.value;
                              }

                              var isComplete = SDPUtils.matchPrefix(mediaSection, 'a=end-of-candidates').length > 0;
                              var cands = SDPUtils.matchPrefix(mediaSection, 'a=candidate:').map(function (cand) {
                                  return SDPUtils.parseCandidate(cand);
                              }).filter(function (cand) {
                                  return cand.component === '1';
                              });
                              if (description.type === 'offer' && !rejected) {
                                  var transports = self._createIceAndDtlsTransports(mid, sdpMLineIndex);
                                  if (isComplete) {
                                      transports.iceTransport.setRemoteCandidates(cands);
                                  }

                                  localCapabilities = RTCRtpReceiver.getCapabilities(kind);
                                  sendEncodingParameters = [{
                                      ssrc: (2 * sdpMLineIndex + 2) * 1001
                                  }];

                                  rtpReceiver = new RTCRtpReceiver(transports.dtlsTransport, kind);

                                  track = rtpReceiver.track;
                                  receiverList.push([track, rtpReceiver]);
                                  // FIXME: not correct when there are multiple streams but that is
                                  // not currently supported in this shim.
                                  stream.addTrack(track);

                                  // FIXME: look at direction.
                                  if (self.localStreams.length > 0 && self.localStreams[0].getTracks().length >= sdpMLineIndex) {
                                      // FIXME: actually more complicated, needs to match types etc
                                      var localtrack = self.localStreams[0].getTracks()[sdpMLineIndex];
                                      rtpSender = new RTCRtpSender(localtrack, transports.dtlsTransport);
                                  }

                                  self.transceivers[sdpMLineIndex] = {
                                      iceGatherer: transports.iceGatherer,
                                      iceTransport: transports.iceTransport,
                                      dtlsTransport: transports.dtlsTransport,
                                      localCapabilities: localCapabilities,
                                      remoteCapabilities: remoteCapabilities,
                                      rtpSender: rtpSender,
                                      rtpReceiver: rtpReceiver,
                                      kind: kind,
                                      mid: mid,
                                      cname: cname,
                                      sendEncodingParameters: sendEncodingParameters,
                                      recvEncodingParameters: recvEncodingParameters
                                  };
                                  // Start the RTCRtpReceiver now. The RTPSender is started in
                                  // setLocalDescription.
                                  self._transceive(self.transceivers[sdpMLineIndex], false, direction === 'sendrecv' || direction === 'sendonly');
                              } else if (description.type === 'answer' && !rejected) {
                                  transceiver = self.transceivers[sdpMLineIndex];
                                  iceGatherer = transceiver.iceGatherer;
                                  iceTransport = transceiver.iceTransport;
                                  dtlsTransport = transceiver.dtlsTransport;
                                  rtpSender = transceiver.rtpSender;
                                  rtpReceiver = transceiver.rtpReceiver;
                                  sendEncodingParameters = transceiver.sendEncodingParameters;
                                  localCapabilities = transceiver.localCapabilities;

                                  self.transceivers[sdpMLineIndex].recvEncodingParameters = recvEncodingParameters;
                                  self.transceivers[sdpMLineIndex].remoteCapabilities = remoteCapabilities;
                                  self.transceivers[sdpMLineIndex].cname = cname;

                                  if (isComplete) {
                                      iceTransport.setRemoteCandidates(cands);
                                  }
                                  iceTransport.start(iceGatherer, remoteIceParameters, 'controlling');
                                  dtlsTransport.start(remoteDtlsParameters);

                                  self._transceive(transceiver, direction === 'sendrecv' || direction === 'recvonly', direction === 'sendrecv' || direction === 'sendonly');

                                  if (rtpReceiver && (direction === 'sendrecv' || direction === 'sendonly')) {
                                      track = rtpReceiver.track;
                                      receiverList.push([track, rtpReceiver]);
                                      stream.addTrack(track);
                                  } else {
                                      // FIXME: actually the receiver should be created later.
                                      delete transceiver.rtpReceiver;
                                  }
                              }
                          });

                          this.remoteDescription = {
                              type: description.type,
                              sdp: description.sdp
                          };
                          switch (description.type) {
                              case 'offer':
                                  this._updateSignalingState('have-remote-offer');
                                  break;
                              case 'answer':
                                  this._updateSignalingState('stable');
                                  break;
                              default:
                                  throw new TypeError('unsupported type "' + description.type + '"');
                          }
                          if (stream.getTracks().length) {
                              self.remoteStreams.push(stream);
                              window.setTimeout(function () {
                                  var event = new Event('addstream');
                                  event.stream = stream;
                                  self.dispatchEvent(event);
                                  if (self.onaddstream !== null) {
                                      window.setTimeout(function () {
                                          self.onaddstream(event);
                                      }, 0);
                                  }

                                  receiverList.forEach(function (item) {
                                      var track = item[0];
                                      var receiver = item[1];
                                      var trackEvent = new Event('track');
                                      trackEvent.track = track;
                                      trackEvent.receiver = receiver;
                                      trackEvent.streams = [stream];
                                      self.dispatchEvent(event);
                                      if (self.ontrack !== null) {
                                          window.setTimeout(function () {
                                              self.ontrack(trackEvent);
                                          }, 0);
                                      }
                                  });
                              }, 0);
                          }
                          if (arguments.length > 1 && typeof arguments[1] === 'function') {
                              window.setTimeout(arguments[1], 0);
                          }
                          return Promise.resolve();
                      };

                      window.RTCPeerConnection.prototype.close = function () {
                          this.transceivers.forEach(function (transceiver) {
                              /* not yet
                              if (transceiver.iceGatherer) {
                                transceiver.iceGatherer.close();
                              }
                              */
                              if (transceiver.iceTransport) {
                                  transceiver.iceTransport.stop();
                              }
                              if (transceiver.dtlsTransport) {
                                  transceiver.dtlsTransport.stop();
                              }
                              if (transceiver.rtpSender) {
                                  transceiver.rtpSender.stop();
                              }
                              if (transceiver.rtpReceiver) {
                                  transceiver.rtpReceiver.stop();
                              }
                          });
                          // FIXME: clean up tracks, local streams, remote streams, etc
                          this._updateSignalingState('closed');
                      };

                      // Update the signaling state.
                      window.RTCPeerConnection.prototype._updateSignalingState = function (newState) {
                          this.signalingState = newState;
                          var event = new Event('signalingstatechange');
                          this.dispatchEvent(event);
                          if (this.onsignalingstatechange !== null) {
                              this.onsignalingstatechange(event);
                          }
                      };

                      // Determine whether to fire the negotiationneeded event.
                      window.RTCPeerConnection.prototype._maybeFireNegotiationNeeded = function () {
                          // Fire away (for now).
                          var event = new Event('negotiationneeded');
                          this.dispatchEvent(event);
                          if (this.onnegotiationneeded !== null) {
                              this.onnegotiationneeded(event);
                          }
                      };

                      // Update the connection state.
                      window.RTCPeerConnection.prototype._updateConnectionState = function () {
                          var self = this;
                          var newState;
                          var states = {
                              'new': 0,
                              closed: 0,
                              connecting: 0,
                              checking: 0,
                              connected: 0,
                              completed: 0,
                              failed: 0
                          };
                          this.transceivers.forEach(function (transceiver) {
                              states[transceiver.iceTransport.state]++;
                              states[transceiver.dtlsTransport.state]++;
                          });
                          // ICETransport.completed and connected are the same for this purpose.
                          states.connected += states.completed;

                          newState = 'new';
                          if (states.failed > 0) {
                              newState = 'failed';
                          } else if (states.connecting > 0 || states.checking > 0) {
                              newState = 'connecting';
                          } else if (states.disconnected > 0) {
                              newState = 'disconnected';
                          } else if (states.new > 0) {
                              newState = 'new';
                          } else if (states.connected > 0 || states.completed > 0) {
                              newState = 'connected';
                          }

                          if (newState !== self.iceConnectionState) {
                              self.iceConnectionState = newState;
                              var event = new Event('iceconnectionstatechange');
                              this.dispatchEvent(event);
                              if (this.oniceconnectionstatechange !== null) {
                                  this.oniceconnectionstatechange(event);
                              }
                          }
                      };

                      window.RTCPeerConnection.prototype.createOffer = function () {
                          var self = this;
                          if (this._pendingOffer) {
                              throw new Error('createOffer called while there is a pending offer.');
                          }
                          var offerOptions;
                          if (arguments.length === 1 && typeof arguments[0] !== 'function') {
                              offerOptions = arguments[0];
                          } else if (arguments.length === 3) {
                              offerOptions = arguments[2];
                          }

                          var tracks = [];
                          var numAudioTracks = 0;
                          var numVideoTracks = 0;
                          // Default to sendrecv.
                          if (this.localStreams.length) {
                              numAudioTracks = this.localStreams[0].getAudioTracks().length;
                              numVideoTracks = this.localStreams[0].getVideoTracks().length;
                          }
                          // Determine number of audio and video tracks we need to send/recv.
                          if (offerOptions) {
                              // Reject Chrome legacy constraints.
                              if (offerOptions.mandatory || offerOptions.optional) {
                                  throw new TypeError('Legacy mandatory/optional constraints not supported.');
                              }
                              if (offerOptions.offerToReceiveAudio !== undefined) {
                                  numAudioTracks = offerOptions.offerToReceiveAudio;
                              }
                              if (offerOptions.offerToReceiveVideo !== undefined) {
                                  numVideoTracks = offerOptions.offerToReceiveVideo;
                              }
                          }
                          if (this.localStreams.length) {
                              // Push local streams.
                              this.localStreams[0].getTracks().forEach(function (track) {
                                  tracks.push({
                                      kind: track.kind,
                                      track: track,
                                      wantReceive: track.kind === 'audio' ? numAudioTracks > 0 : numVideoTracks > 0
                                  });
                                  if (track.kind === 'audio') {
                                      numAudioTracks--;
                                  } else if (track.kind === 'video') {
                                      numVideoTracks--;
                                  }
                              });
                          }
                          // Create M-lines for recvonly streams.
                          while (numAudioTracks > 0 || numVideoTracks > 0) {
                              if (numAudioTracks > 0) {
                                  tracks.push({
                                      kind: 'audio',
                                      wantReceive: true
                                  });
                                  numAudioTracks--;
                              }
                              if (numVideoTracks > 0) {
                                  tracks.push({
                                      kind: 'video',
                                      wantReceive: true
                                  });
                                  numVideoTracks--;
                              }
                          }

                          var sdp = SDPUtils.writeSessionBoilerplate();
                          var transceivers = [];
                          tracks.forEach(function (mline, sdpMLineIndex) {
                              // For each track, create an ice gatherer, ice transport,
                              // dtls transport, potentially rtpsender and rtpreceiver.
                              var track = mline.track;
                              var kind = mline.kind;
                              var mid = SDPUtils.generateIdentifier();

                              var transports = self._createIceAndDtlsTransports(mid, sdpMLineIndex);

                              var localCapabilities = RTCRtpSender.getCapabilities(kind);
                              var rtpSender;
                              var rtpReceiver;

                              // generate an ssrc now, to be used later in rtpSender.send
                              var sendEncodingParameters = [{
                                  ssrc: (2 * sdpMLineIndex + 1) * 1001
                              }];
                              if (track) {
                                  rtpSender = new RTCRtpSender(track, transports.dtlsTransport);
                              }

                              if (mline.wantReceive) {
                                  rtpReceiver = new RTCRtpReceiver(transports.dtlsTransport, kind);
                              }

                              transceivers[sdpMLineIndex] = {
                                  iceGatherer: transports.iceGatherer,
                                  iceTransport: transports.iceTransport,
                                  dtlsTransport: transports.dtlsTransport,
                                  localCapabilities: localCapabilities,
                                  remoteCapabilities: null,
                                  rtpSender: rtpSender,
                                  rtpReceiver: rtpReceiver,
                                  kind: kind,
                                  mid: mid,
                                  sendEncodingParameters: sendEncodingParameters,
                                  recvEncodingParameters: null
                              };
                              var transceiver = transceivers[sdpMLineIndex];
                              sdp += SDPUtils.writeMediaSection(transceiver, transceiver.localCapabilities, 'offer', self.localStreams[0]);
                          });

                          this._pendingOffer = transceivers;
                          var desc = new RTCSessionDescription({
                              type: 'offer',
                              sdp: sdp
                          });
                          if (arguments.length && typeof arguments[0] === 'function') {
                              window.setTimeout(arguments[0], 0, desc);
                          }
                          return Promise.resolve(desc);
                      };

                      window.RTCPeerConnection.prototype.createAnswer = function () {
                          var self = this;

                          var sdp = SDPUtils.writeSessionBoilerplate();
                          this.transceivers.forEach(function (transceiver) {
                              // Calculate intersection of capabilities.
                              var commonCapabilities = self._getCommonCapabilities(transceiver.localCapabilities, transceiver.remoteCapabilities);

                              sdp += SDPUtils.writeMediaSection(transceiver, commonCapabilities, 'answer', self.localStreams[0]);
                          });

                          var desc = new RTCSessionDescription({
                              type: 'answer',
                              sdp: sdp
                          });
                          if (arguments.length && typeof arguments[0] === 'function') {
                              window.setTimeout(arguments[0], 0, desc);
                          }
                          return Promise.resolve(desc);
                      };

                      window.RTCPeerConnection.prototype.addIceCandidate = function (candidate) {
                          var mLineIndex = candidate.sdpMLineIndex;
                          if (candidate.sdpMid) {
                              for (var i = 0; i < this.transceivers.length; i++) {
                                  if (this.transceivers[i].mid === candidate.sdpMid) {
                                      mLineIndex = i;
                                      break;
                                  }
                              }
                          }
                          var transceiver = this.transceivers[mLineIndex];
                          if (transceiver) {
                              var cand = Object.keys(candidate.candidate).length > 0 ? SDPUtils.parseCandidate(candidate.candidate) : {};
                              // Ignore Chrome's invalid candidates since Edge does not like them.
                              if (cand.protocol === 'tcp' && cand.port === 0) {
                                  return;
                              }
                              // Ignore RTCP candidates, we assume RTCP-MUX.
                              if (cand.component !== '1') {
                                  return;
                              }
                              // A dirty hack to make samples work.
                              if (cand.type === 'endOfCandidates') {
                                  cand = {};
                              }
                              transceiver.iceTransport.addRemoteCandidate(cand);

                              // update the remoteDescription.
                              var sections = SDPUtils.splitSections(this.remoteDescription.sdp);
                              sections[mLineIndex + 1] += (cand.type ? candidate.candidate.trim() : 'a=end-of-candidates') + '\r\n';
                              this.remoteDescription.sdp = sections.join('');
                          }
                          if (arguments.length > 1 && typeof arguments[1] === 'function') {
                              window.setTimeout(arguments[1], 0);
                          }
                          return Promise.resolve();
                      };

                      window.RTCPeerConnection.prototype.getStats = function () {
                          var promises = [];
                          this.transceivers.forEach(function (transceiver) {
                              ['rtpSender', 'rtpReceiver', 'iceGatherer', 'iceTransport', 'dtlsTransport'].forEach(function (method) {
                                  if (transceiver[method]) {
                                      promises.push(transceiver[method].getStats());
                                  }
                              });
                          });
                          var cb = arguments.length > 1 && typeof arguments[1] === 'function' && arguments[1];
                          return new Promise(function (resolve) {
                              var results = {};
                              Promise.all(promises).then(function (res) {
                                  res.forEach(function (result) {
                                      Object.keys(result).forEach(function (id) {
                                          results[id] = result[id];
                                      });
                                  });
                                  if (cb) {
                                      window.setTimeout(cb, 0, results);
                                  }
                                  resolve(results);
                              });
                          });
                      };
                  },

                  // Attach a media stream to an element.
                  attachMediaStream: function attachMediaStream(element, stream) {
                      logging('DEPRECATED, attachMediaStream will soon be removed.');
                      element.srcObject = stream;
                  },

                  reattachMediaStream: function reattachMediaStream(to, from) {
                      logging('DEPRECATED, reattachMediaStream will soon be removed.');
                      to.srcObject = from.srcObject;
                  }
              };

              // Expose public methods.
              module.exports = {
                  shimPeerConnection: edgeShim.shimPeerConnection,
                  attachMediaStream: edgeShim.attachMediaStream,
                  reattachMediaStream: edgeShim.reattachMediaStream
              };
          }, { "../utils": 9, "./edge_sdp": 4 }], 6: [function (require, module, exports) {

              var logging = require('../utils').log;
              var browserDetails = require('../utils').browserDetails;

              var firefoxShim = {
                  shimOnTrack: function shimOnTrack() {
                      if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object' && window.RTCPeerConnection && !('ontrack' in window.RTCPeerConnection.prototype)) {
                          Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
                              get: function get$$1() {
                                  return this._ontrack;
                              },
                              set: function set$$1(f) {
                                  if (this._ontrack) {
                                      this.removeEventListener('track', this._ontrack);
                                      this.removeEventListener('addstream', this._ontrackpoly);
                                  }
                                  this.addEventListener('track', this._ontrack = f);
                                  this.addEventListener('addstream', this._ontrackpoly = function (e) {
                                      e.stream.getTracks().forEach(function (track) {
                                          var event = new Event('track');
                                          event.track = track;
                                          event.receiver = { track: track };
                                          event.streams = [e.stream];
                                          this.dispatchEvent(event);
                                      }.bind(this));
                                  }.bind(this));
                              }
                          });
                      }
                  },

                  shimSourceObject: function shimSourceObject() {
                      // Firefox has supported mozSrcObject since FF22, unprefixed in 42.
                      if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object') {
                          if (window.HTMLMediaElement && !('srcObject' in window.HTMLMediaElement.prototype)) {
                              // Shim the srcObject property, once, when HTMLMediaElement is found.
                              Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
                                  get: function get$$1() {
                                      return this.mozSrcObject;
                                  },
                                  set: function set$$1(stream) {
                                      this.mozSrcObject = stream;
                                  }
                              });
                          }
                      }
                  },

                  shimPeerConnection: function shimPeerConnection() {
                      // The RTCPeerConnection object.
                      if (!window.RTCPeerConnection) {
                          window.RTCPeerConnection = function (pcConfig, pcConstraints) {
                              if (browserDetails.version < 38) {
                                  // .urls is not supported in FF < 38.
                                  // create RTCIceServers with a single url.
                                  if (pcConfig && pcConfig.iceServers) {
                                      var newIceServers = [];
                                      for (var i = 0; i < pcConfig.iceServers.length; i++) {
                                          var server = pcConfig.iceServers[i];
                                          if (server.hasOwnProperty('urls')) {
                                              for (var j = 0; j < server.urls.length; j++) {
                                                  var newServer = {
                                                      url: server.urls[j]
                                                  };
                                                  if (server.urls[j].indexOf('turn') === 0) {
                                                      newServer.username = server.username;
                                                      newServer.credential = server.credential;
                                                  }
                                                  newIceServers.push(newServer);
                                              }
                                          } else {
                                              newIceServers.push(pcConfig.iceServers[i]);
                                          }
                                      }
                                      pcConfig.iceServers = newIceServers;
                                  }
                              }
                              return new mozRTCPeerConnection(pcConfig, pcConstraints);
                          };
                          window.RTCPeerConnection.prototype = mozRTCPeerConnection.prototype;

                          // wrap static methods. Currently just generateCertificate.
                          if (mozRTCPeerConnection.generateCertificate) {
                              Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
                                  get: function get$$1() {
                                      return mozRTCPeerConnection.generateCertificate;
                                  }
                              });
                          }

                          window.RTCSessionDescription = mozRTCSessionDescription;
                          window.RTCIceCandidate = mozRTCIceCandidate;
                      }

                      // shim away need for obsolete RTCIceCandidate/RTCSessionDescription.
                      ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate'].forEach(function (method) {
                          var nativeMethod = RTCPeerConnection.prototype[method];
                          RTCPeerConnection.prototype[method] = function () {
                              arguments[0] = new (method === 'addIceCandidate' ? RTCIceCandidate : RTCSessionDescription)(arguments[0]);
                              return nativeMethod.apply(this, arguments);
                          };
                      });
                  },

                  shimGetUserMedia: function shimGetUserMedia() {
                      // getUserMedia constraints shim.
                      var getUserMedia_ = function getUserMedia_(constraints, onSuccess, onError) {
                          var constraintsToFF37_ = function constraintsToFF37_(c) {
                              if ((typeof c === "undefined" ? "undefined" : _typeof(c)) !== 'object' || c.require) {
                                  return c;
                              }
                              var require = [];
                              Object.keys(c).forEach(function (key) {
                                  if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
                                      return;
                                  }
                                  var r = c[key] = _typeof(c[key]) === 'object' ? c[key] : { ideal: c[key] };
                                  if (r.min !== undefined || r.max !== undefined || r.exact !== undefined) {
                                      require.push(key);
                                  }
                                  if (r.exact !== undefined) {
                                      if (typeof r.exact === 'number') {
                                          r.min = r.max = r.exact;
                                      } else {
                                          c[key] = r.exact;
                                      }
                                      delete r.exact;
                                  }
                                  if (r.ideal !== undefined) {
                                      c.advanced = c.advanced || [];
                                      var oc = {};
                                      if (typeof r.ideal === 'number') {
                                          oc[key] = { min: r.ideal, max: r.ideal };
                                      } else {
                                          oc[key] = r.ideal;
                                      }
                                      c.advanced.push(oc);
                                      delete r.ideal;
                                      if (!Object.keys(r).length) {
                                          delete c[key];
                                      }
                                  }
                              });
                              if (require.length) {
                                  c.require = require;
                              }
                              return c;
                          };
                          constraints = JSON.parse(JSON.stringify(constraints));
                          if (browserDetails.version < 38) {
                              logging('spec: ' + JSON.stringify(constraints));
                              if (constraints.audio) {
                                  constraints.audio = constraintsToFF37_(constraints.audio);
                              }
                              if (constraints.video) {
                                  constraints.video = constraintsToFF37_(constraints.video);
                              }
                              logging('ff37: ' + JSON.stringify(constraints));
                          }
                          return navigator.mozGetUserMedia(constraints, onSuccess, onError);
                      };

                      navigator.getUserMedia = getUserMedia_;

                      // Returns the result of getUserMedia as a Promise.
                      var getUserMediaPromise_ = function getUserMediaPromise_(constraints) {
                          return new Promise(function (resolve, reject) {
                              navigator.getUserMedia(constraints, resolve, reject);
                          });
                      };

                      // Shim for mediaDevices on older versions.
                      if (!navigator.mediaDevices) {
                          navigator.mediaDevices = {
                              getUserMedia: getUserMediaPromise_,
                              addEventListener: function addEventListener() {},
                              removeEventListener: function removeEventListener() {}
                          };
                      }
                      navigator.mediaDevices.enumerateDevices = navigator.mediaDevices.enumerateDevices || function () {
                          return new Promise(function (resolve) {
                              var infos = [{ kind: 'audioinput', deviceId: 'default', label: '', groupId: '' }, { kind: 'videoinput', deviceId: 'default', label: '', groupId: '' }];
                              resolve(infos);
                          });
                      };

                      if (browserDetails.version < 41) {
                          // Work around http://bugzil.la/1169665
                          var orgEnumerateDevices = navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
                          navigator.mediaDevices.enumerateDevices = function () {
                              return orgEnumerateDevices().then(undefined, function (e) {
                                  if (e.name === 'NotFoundError') {
                                      return [];
                                  }
                                  throw e;
                              });
                          };
                      }
                  },

                  // Attach a media stream to an element.
                  attachMediaStream: function attachMediaStream(element, stream) {
                      logging('DEPRECATED, attachMediaStream will soon be removed.');
                      element.srcObject = stream;
                  },

                  reattachMediaStream: function reattachMediaStream(to, from) {
                      logging('DEPRECATED, reattachMediaStream will soon be removed.');
                      to.srcObject = from.srcObject;
                  }
              };

              // Expose public methods.
              module.exports = {
                  shimOnTrack: firefoxShim.shimOnTrack,
                  shimSourceObject: firefoxShim.shimSourceObject,
                  shimPeerConnection: firefoxShim.shimPeerConnection,
                  shimGetUserMedia: require('./getusermedia'),
                  attachMediaStream: firefoxShim.attachMediaStream,
                  reattachMediaStream: firefoxShim.reattachMediaStream
              };
          }, { "../utils": 9, "./getusermedia": 7 }], 7: [function (require, module, exports) {

              var logging = require('../utils').log;
              var browserDetails = require('../utils').browserDetails;

              // Expose public methods.
              module.exports = function () {
                  // getUserMedia constraints shim.
                  var getUserMedia_ = function getUserMedia_(constraints, onSuccess, onError) {
                      var constraintsToFF37_ = function constraintsToFF37_(c) {
                          if ((typeof c === "undefined" ? "undefined" : _typeof(c)) !== 'object' || c.require) {
                              return c;
                          }
                          var require = [];
                          Object.keys(c).forEach(function (key) {
                              if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
                                  return;
                              }
                              var r = c[key] = _typeof(c[key]) === 'object' ? c[key] : { ideal: c[key] };
                              if (r.min !== undefined || r.max !== undefined || r.exact !== undefined) {
                                  require.push(key);
                              }
                              if (r.exact !== undefined) {
                                  if (typeof r.exact === 'number') {
                                      r.min = r.max = r.exact;
                                  } else {
                                      c[key] = r.exact;
                                  }
                                  delete r.exact;
                              }
                              if (r.ideal !== undefined) {
                                  c.advanced = c.advanced || [];
                                  var oc = {};
                                  if (typeof r.ideal === 'number') {
                                      oc[key] = { min: r.ideal, max: r.ideal };
                                  } else {
                                      oc[key] = r.ideal;
                                  }
                                  c.advanced.push(oc);
                                  delete r.ideal;
                                  if (!Object.keys(r).length) {
                                      delete c[key];
                                  }
                              }
                          });
                          if (require.length) {
                              c.require = require;
                          }
                          return c;
                      };
                      constraints = JSON.parse(JSON.stringify(constraints));
                      if (browserDetails.version < 38) {
                          logging('spec: ' + JSON.stringify(constraints));
                          if (constraints.audio) {
                              constraints.audio = constraintsToFF37_(constraints.audio);
                          }
                          if (constraints.video) {
                              constraints.video = constraintsToFF37_(constraints.video);
                          }
                          logging('ff37: ' + JSON.stringify(constraints));
                      }
                      return navigator.mozGetUserMedia(constraints, onSuccess, onError);
                  };

                  navigator.getUserMedia = getUserMedia_;

                  // Returns the result of getUserMedia as a Promise.
                  var getUserMediaPromise_ = function getUserMediaPromise_(constraints) {
                      return new Promise(function (resolve, reject) {
                          navigator.getUserMedia(constraints, resolve, reject);
                      });
                  };

                  // Shim for mediaDevices on older versions.
                  if (!navigator.mediaDevices) {
                      navigator.mediaDevices = {
                          getUserMedia: getUserMediaPromise_,
                          addEventListener: function addEventListener() {},
                          removeEventListener: function removeEventListener() {}
                      };
                  }
                  navigator.mediaDevices.enumerateDevices = navigator.mediaDevices.enumerateDevices || function () {
                      return new Promise(function (resolve) {
                          var infos = [{ kind: 'audioinput', deviceId: 'default', label: '', groupId: '' }, { kind: 'videoinput', deviceId: 'default', label: '', groupId: '' }];
                          resolve(infos);
                      });
                  };

                  if (browserDetails.version < 41) {
                      // Work around http://bugzil.la/1169665
                      var orgEnumerateDevices = navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
                      navigator.mediaDevices.enumerateDevices = function () {
                          return orgEnumerateDevices().then(undefined, function (e) {
                              if (e.name === 'NotFoundError') {
                                  return [];
                              }
                              throw e;
                          });
                      };
                  }
              };
          }, { "../utils": 9 }], 8: [function (require, module, exports) {

              var safariShim = {
                  // TODO: DrAlex, should be here, double check against LayoutTests
                  // shimOnTrack: function() { },

                  // TODO: DrAlex
                  // attachMediaStream: function(element, stream) { },
                  // reattachMediaStream: function(to, from) { },

                  // TODO: once the back-end for the mac port is done, add.
                  // TODO: check for webkitGTK+
                  // shimPeerConnection: function() { },

                  shimGetUserMedia: function shimGetUserMedia() {
                      navigator.getUserMedia = navigator.webkitGetUserMedia;
                  }
              };

              // Expose public methods.
              module.exports = {
                  shimGetUserMedia: safariShim.shimGetUserMedia
                  // TODO
                  // shimOnTrack: safariShim.shimOnTrack,
                  // shimPeerConnection: safariShim.shimPeerConnection,
                  // attachMediaStream: safariShim.attachMediaStream,
                  // reattachMediaStream: safariShim.reattachMediaStream
              };
          }, {}], 9: [function (require, module, exports) {

              var logDisabled_ = false;

              // Utility methods.
              var utils = {
                  disableLog: function disableLog(bool) {
                      if (typeof bool !== 'boolean') {
                          return new Error('Argument type: ' + (typeof bool === "undefined" ? "undefined" : _typeof(bool)) + '. Please use a boolean.');
                      }
                      logDisabled_ = bool;
                      return bool ? 'adapter.js logging disabled' : 'adapter.js logging enabled';
                  },

                  log: function log() {
                      if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object') {
                          if (logDisabled_) {
                              return;
                          }
                          if (typeof console !== 'undefined' && typeof console.log === 'function') {
                              console.log.apply(console, arguments);
                          }
                      }
                  },

                  /**
                   * Extract browser version out of the provided user agent string.
                   *
                   * @param {!string} uastring userAgent string.
                   * @param {!string} expr Regular expression used as match criteria.
                   * @param {!number} pos position in the version string to be returned.
                   * @return {!number} browser version.
                   */
                  extractVersion: function extractVersion(uastring, expr, pos) {
                      var match = uastring.match(expr);
                      return match && match.length >= pos && parseInt(match[pos], 10);
                  },

                  /**
                   * Browser detector.
                   *
                   * @return {object} result containing browser, version and minVersion
                   *     properties.
                   */
                  detectBrowser: function detectBrowser() {
                      // Returned result object.
                      var result = {};
                      result.browser = null;
                      result.version = null;
                      result.minVersion = null;

                      // Fail early if it's not a browser
                      if (typeof window === 'undefined' || !window.navigator) {
                          result.browser = 'Not a browser.';
                          return result;
                      }

                      // Firefox.
                      if (navigator.mozGetUserMedia) {
                          result.browser = 'firefox';
                          result.version = this.extractVersion(navigator.userAgent, /Firefox\/([0-9]+)\./, 1);
                          result.minVersion = 31;

                          // all webkit-based browsers
                      } else if (navigator.webkitGetUserMedia) {
                          // Chrome, Chromium, Webview, Opera, all use the chrome shim for now
                          if (window.webkitRTCPeerConnection) {
                              result.browser = 'chrome';
                              result.version = this.extractVersion(navigator.userAgent, /Chrom(e|ium)\/([0-9]+)\./, 2);
                              result.minVersion = 38;

                              // Safari or unknown webkit-based
                              // for the time being Safari has support for MediaStreams but not webRTC
                          } else {
                              // Safari UA substrings of interest for reference:
                              // - webkit version:           AppleWebKit/602.1.25 (also used in Op,Cr)
                              // - safari UI version:        Version/9.0.3 (unique to Safari)
                              // - safari UI webkit version: Safari/601.4.4 (also used in Op,Cr)
                              //
                              // if the webkit version and safari UI webkit versions are equals,
                              // ... this is a stable version.
                              //
                              // only the internal webkit version is important today to know if
                              // media streams are supported
                              //
                              if (navigator.userAgent.match(/Version\/(\d+).(\d+)/)) {
                                  result.browser = 'safari';
                                  result.version = this.extractVersion(navigator.userAgent, /AppleWebKit\/([0-9]+)\./, 1);
                                  result.minVersion = 602;

                                  // unknown webkit-based browser
                              } else {
                                  result.browser = 'Unsupported webkit-based browser ' + 'with GUM support but no WebRTC support.';
                                  return result;
                              }
                          }

                          // Edge.
                      } else if (navigator.mediaDevices && navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) {
                          result.browser = 'edge';
                          result.version = this.extractVersion(navigator.userAgent, /Edge\/(\d+).(\d+)$/, 2);
                          result.minVersion = 10547;

                          // Default fallthrough: not supported.
                      } else {
                          result.browser = 'Not a supported browser.';
                          return result;
                      }

                      // Warn if version is less than minVersion.
                      if (result.version < result.minVersion) {
                          utils.log('Browser: ' + result.browser + ' Version: ' + result.version + ' < minimum supported version: ' + result.minVersion + '\n some things might not work!');
                      }

                      return result;
                  }
              };

              // Export.
              module.exports = {
                  log: utils.log,
                  disableLog: utils.disableLog,
                  browserDetails: utils.detectBrowser(),
                  extractVersion: utils.extractVersion
              };
          }, {}]
      }, {}, [1])(1);
  }

  var init = function init() {
      window.adapter = Adapter();
  };

  var RTCAdapter = {
      init: init
  };

  var Client = function (_EventEmitter) {
    inherits(Client, _EventEmitter);

    /* 
      let option = {
        url: 'mediaServer path',
        RongIMLib
      };
    */
    function Client(option) {
      classCallCheck(this, Client);

      var _this = possibleConstructorReturn(this, (Client.__proto__ || Object.getPrototypeOf(Client)).call(this));

      RTCAdapter.init();
      var im = new IM(option);
      var RequestHandler = {
        room: RoomHandler(im, option),
        stream: StreamHandler(im, option)
      };
      var context = _this;
      var RongIMLib = option.RongIMLib;

      var destroyed = false;
      utils.extend(context, {
        RongIMLib: RongIMLib,
        option: option,
        destroyed: destroyed,
        im: im,
        RequestHandler: RequestHandler
      });
      var bindEvent = function bindEvent(event) {
        var name = event.name;

        im.on(name, function (error, user) {
          context.emit(name, user, error);
        });
      };
      utils.forEach(RoomEvents, bindEvent);
      im.on(CommonEvent.JOINED, function () {
        context.emit(DownEvent.RTC_MOUNTED);
      });
      im.on(CommonEvent.LEFT, function () {
        context.emit(DownEvent.RTC_UNMOUNTED);
      });
      im.on(CommonEvent.ERROR, function (error, data) {
        context.emit(DownEvent.RTC_ERROR, data, error);
      });
      var getMSType = function getMSType(uris) {
        var check = function check(msType) {
          return utils.some(uris, function (_ref) {
            var mediaType = _ref.mediaType,
                state = _ref.state;

            return utils.isEqual(msType, mediaType) && utils.isEqual(state, StreamState.ENABLE);
          });
        };
        var type = StreamType.NODE;
        var hasAudio = check(StreamType.AUDIO);
        var hasVideo = check(StreamType.VIDEO);
        if (hasAudio) {
          type = StreamType.AUDIO;
        }
        if (hasVideo) {
          type = StreamType.VIDEO;
        }
        if (hasVideo && hasAudio) {
          type = StreamType.AUDIO_AND_VIDEO;
        }
        return type;
      };
      var eventHandler = function eventHandler(name, result, error) {
        var id = result.id,
            _result$stream = result.stream,
            tag = _result$stream.tag,
            uris = _result$stream.uris;

        var type = getMSType(uris);
        var user = {
          id: id,
          stream: {
            tag: tag,
            type: type
          }
        };
        context.emit(name, user, error);
      };
      im.on(DownEvent.STREAM_PUBLISHED, function (error, user) {
        eventHandler(DownEvent.STREAM_PUBLISHED, user, error);
      });
      im.on(DownEvent.STREAM_UNPUBLISHED, function (error, user) {
        eventHandler(DownEvent.STREAM_UNPUBLISHED, user, error);
      });
      im.on(DownEvent.STREAM_DISABLED, function (error, user) {
        eventHandler(DownEvent.STREAM_DISABLED, user, error);
      });
      im.on(DownEvent.STREAM_ENABLED, function (error, user) {
        eventHandler(DownEvent.STREAM_ENABLED, user, error);
      });
      im.on(DownEvent.STREAM_MUTED, function (error, user) {
        eventHandler(DownEvent.STREAM_MUTED, user, error);
      });
      im.on(DownEvent.STREAM_UNMUTED, function (error, user) {
        eventHandler(DownEvent.STREAM_UNMUTED, user, error);
      });
      request$1.setOption(option);
      return _this;
    }

    createClass(Client, [{
      key: 'exec',
      value: function exec(params) {
        var context = this;
        var im = context.im;

        if (context.isDestroyed()) {
          return utils.Defer.reject(ErrorType.Inner.INSTANCE_IS_DESTROYED);
        }
        if (!im.isReady()) {
          return utils.Defer.reject(ErrorType.Inner.IM_NOT_CONNECTED);
        }
        var type = params.type,
            args = params.args,
            event = params.event;

        if (!utils.isEqual(UpEvent.ROOM_JOIN, event) && !im.isJoined()) {
          return utils.Defer.reject(ErrorType.Inner.RTC_NOT_JOIN_ROOM);
        }
        var RequestHandler = this.RequestHandler;

        Logger$1.log(type, {
          func: event,
          type: EventType.REQUEST,
          args: args
        });
        return RequestHandler[type].dispatch(event, args).then(function (result) {
          Logger$1.log(type, {
            func: event,
            type: EventType.RESPONSE,
            result: result
          });
          return result;
        }, function (error) {
          Logger$1.log(type, {
            func: event,
            type: EventType.RESPONSE,
            error: error
          });
          throw error;
        });
      }
    }, {
      key: 'isDestroyed',
      value: function isDestroyed() {
        return this.destroyed;
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        var context = this;
        utils.extend(context, {
          destroyed: true
        });
        context.teardown();
        context.im.teardown();
      }
    }]);
    return Client;
  }(EventEmitter);

  var RongRTC = function () {
    function RongRTC(_option) {
      classCallCheck(this, RongRTC);

      var context = this;
      var option = {
        url: 'https://msqa.rongcloud.net/',
        debug: false,
        created: function created() {},
        mounted: function mounted() {},
        unmounted: function unmounted() {},
        destroyed: function destroyed() {},
        error: function error() {}
      };
      utils.extend(option, _option);
      var logger = option.logger,
          debug = option.debug;

      if (utils.isFunction(logger)) {
        Logger$1.watch(logger);
      }
      if (debug) {
        Logger$1.watch(function (log) {
          utils.Log.log(log);
        });
      }
      var client = new Client(option);
      utils.forEach([Room, Stream], function (module) {
        module.prototype.getClient = function () {
          return client;
        };
      });
      utils.extend(context, {
        Room: Room,
        Stream: Stream,
        StreamType: StreamType,
        StreamSize: StreamSize,
        option: option,
        client: client
      });
      var created = option.created,
          mounted = option.mounted,
          unmounted = option.unmounted,
          error = option.error;

      created();
      Logger$1.log(LogTag.LIFECYCLE, {
        state: 'created'
      });
      client.on(DownEvent.RTC_MOUNTED, function () {
        mounted();
        Logger$1.log(LogTag.LIFECYCLE, {
          state: 'mounted'
        });
      });
      client.on(DownEvent.RTC_UNMOUNTED, function () {
        unmounted();
        Logger$1.log(LogTag.LIFECYCLE, {
          state: 'unmounted'
        });
      });
      client.on(DownEvent.RTC_ERROR, function (e, data) {
        if (e) {
          throw new Error(e);
        }
        error(data);
      });
    }

    createClass(RongRTC, [{
      key: 'destroy',
      value: function destroy() {
        var destroyed = this.option.destroyed,
            client = this.client;

        destroyed();
        client.destroy();
        Logger$1.log(LogTag.LIFECYCLE, {
          state: 'destroyed'
        });
      }
    }]);
    return RongRTC;
  }();

  return RongRTC;

})));
