/*
* RongRTC.js v2.0.0
* Copyright 2018 RongCloud
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
      destination[key] = value;
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
    return {
      set: set,
      get: get,
      remove: remove
    };
  };
  var Logger = console;
  var utils = {
    isBoolean: isBoolean,
    isString: isString,
    isObject: isObject,
    isArray: isArray,
    isFunction: isFunction,
    stringify: stringify,
    parse: parse,
    rename: rename,
    extend: extend,
    deferred: deferred,
    Defer: Defer,
    forEach: forEach,
    tplEngine: tplEngine,
    isContain: isContain,
    noop: noop,
    Cache: Cache,
    Logger: Logger
  };

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

  var EventEmitter = function () {
    function EventEmitter() {
      classCallCheck(this, EventEmitter);

      this.events = {};
      this.onceEvents = {};
    }

    createClass(EventEmitter, [{
      key: 'on',
      value: function on(name, event) {
        this.events[name] = event;
      }
    }, {
      key: 'off',
      value: function off(name) {
        delete this.events[name];
      }
    }, {
      key: 'emit',
      value: function emit(name, data, error) {
        var event = this.events[name] || utils.noop;
        event(error, data);

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

  var getErrors = function getErrors() {
    var errors = [{
      code: 10000,
      name: 'INSTANCE_IS_DESTROYED',
      msg: 'RongRTC 实例已销毁，请创建实例并绑定事件后再调用实例方法'
    }, {
      code: 10001,
      name: 'NOT_JOIN_ROOM',
      msg: '不在房间内，请先加入房间再调用业务接口'
    }, {
      code: 20000,
      name: 'JOIN_ERROR',
      msg: '加入房间失败，请检查网络是否正常'
    }, {
      code: 20001,
      name: 'LEAVE_ERROR',
      msg: '离开房间失败，请检查网络是否正常'
    }, {
      code: 21000,
      name: 'CREATE_WB_ERROR',
      msg: '获取白板失败'
    }, {
      code: 21001,
      name: 'GET_WB_ERROR',
      msg: '获取白板列表失败'
    }, {
      code: 22001,
      name: 'SCREEN_SHARE_PLUGIN_SUPPORT_ERROR',
      msg: '屏幕共享失败, 当前浏览器不支持屏幕共享'
    }, {
      code: 22002,
      name: 'SCREEN_SHARE_NOT_INSTALL_ERROR',
      msg: '屏幕共享失败, 未安装浏览器屏幕共享插件, 下载地址: http://fsprodrcx.cn.ronghub.com/zaoh1s2oIOU9siHWzaoh1sSRr-3NqK1xoM9SpazNRA/rong-rtc-plugin.zip'
    }, {
      code: 30001,
      name: 'TOKEN_USERID_MISMATCH',
      msg: 'Token 与 UserId 不匹配'
    }];

    var Inner = {},
        Outer = {};
    utils.forEach(errors, function (error) {
      var name = error.name,
          code = error.code,
          msg = error.msg;

      Inner[name] = {
        code: code,
        msg: msg
      };
      Outer[name] = code;
    });
    return {
      Inner: Inner,
      Outer: Outer
    };
  };
  var ErrorType = getErrors();

  var EventName = {
    ROOM_SELF_JOINED: 'room_self_joined',
    ROOM_SELF_LEFT: 'room_self_left',
    ROOM_USER_JOINED: 'room_user_joined',
    ROOM_USER_LEFT: 'room_user_left',
    STREAM_ADDED: 'stream_added',
    STREAM_CHANGED: 'stream_changed',
    RTC_SERVER: 'rtc_server',
    RTC_SERVER_READY: 'rtc_server_ready',
    RTC_SERVER_COLSE: 'rtc_server_ready',
    RTC_ERROR: 'rtc_error',
    WHITEBOARD_CREATED: 'whiteboard_created',
    WHITEBOARD_GETLIST: 'whiteboard_getlist',
    SCREEN_SHARE_START: 'screen_share_start',
    SCREEN_SHARE_STOP: 'screen_share_stop',
    SCREEN_SHARE_FINISHED: 'screen_share_finished'
  };

  var StreamType = {
    NONE: 0,
    AUDIO: 1,
    VIDEO: 2,
    AUDIO_AND_VIDEO: 3,
    SCREEN_SHARE: 4
  };

  var RoomEvents = [{
    name: EventName.ROOM_USER_JOINED,
    type: 'joined'
  }, {
    name: EventName.ROOM_USER_LEFT,
    type: 'left'
  }];

  var StreamEvents = [{
    name: EventName.STREAM_ADDED,
    type: 'added'
  }, {
    name: EventName.STREAM_CHANGED,
    type: 'changed'
  }];

  var ErrorEvents = [{
    name: EventName.RTC_ERROR,
    type: 'error'
  }];

  var ScreenShareEvents = [{
    name: EventName.SCREEN_SHARE_FINISHED,
    type: 'finished'
  }];

  function Room(rtc) {
    var eventEmitter = new EventEmitter();
    utils.forEach(RoomEvents, function (event) {
      var name = event.name,
          type = event.type;

      rtc._on(name, function (error, user) {
        if (error) {
          throw new Error(error);
        }
        var result = {
          type: type,
          user: user
        };
        eventEmitter.emit(type, result);
      });
    });

    var join = function join(room) {
      return rtc.exec('joinRoom', room);
    };

    var leave = function leave(room) {
      return rtc.exec('leaveRoom', room);
    };

    var _on = function _on(name, event) {
      return eventEmitter.on(name, function (error, result) {
        if (error) {
          throw new Error(error);
        }
        event(result);
      });
    };

    var _off = function _off(name) {
      return eventEmitter.off(name);
    };

    var _teardown = function _teardown() {
      return eventEmitter.teardown();
    };
    return {
      join: join,
      leave: leave,
      _on: _on,
      _off: _off,
      _teardown: _teardown
    };
  }

  function Video(rtc) {
    return {
      disable: function disable(user) {
        return rtc.exec('disableVideo', user);
      },
      enable: function enable(user) {
        return rtc.exec('enableVideo', user);
      },
      set: function set(constraints) {
        rtc.exec('setProfiles', constraints);
      }
    };
  }

  function Audio(rtc) {
    return {
      mute: function mute(user) {
        return rtc.exec('mute', user);
      },
      unmute: function unmute(user) {
        return rtc.exec('unmute', user);
      }
    };
  }

  function Stream(rtc) {
    var eventEmitter = new EventEmitter();
    utils.forEach(StreamEvents, function (event) {
      var name = event.name,
          type = event.type;

      rtc._on(name, function (error, result) {
        if (error) {
          throw new Error(error);
        }
        utils.extend(result, {
          type: type
        });
        eventEmitter.emit(type, result);
      });
    });

    var $video = Video(rtc);
    var $audio = Audio(rtc);
    var get = function get(user) {
      return rtc.exec('getStream', user);
    };
    var _on = function _on(name, event) {
      return eventEmitter.on(name, function (error, result) {
        if (error) {
          throw new Error(error);
        }
        event(result);
      });
    };
    var _off = function _off(name) {
      return eventEmitter.off(name);
    };
    var _teardown = function _teardown() {
      return eventEmitter.teardown();
    };
    return {
      Video: $video,
      Audio: $audio,
      get: get,
      _on: _on,
      _off: _off,
      _teardown: _teardown
    };
  }

  function WhiteBoard(rtc) {
    return {
      create: function create() {
        return rtc.exec('createWhiteBoard');
      },
      getList: function getList() {
        return rtc.exec('getWhiteBoardList');
      }
    };
  }

  function ScreenShare(rtc) {
    var eventEmitter = new EventEmitter();
    utils.forEach(ScreenShareEvents, function (event) {
      var name = event.name,
          type = event.type;

      rtc._on(name, function (error, result) {
        result = result || {};
        if (error) {
          throw new Error(error);
        }
        utils.extend(result, {
          type: type
        });
        eventEmitter.emit(type, result);
      });
    });
    var start = function start() {
      return rtc.exec('startScreenShare');
    };
    var stop = function stop() {
      return rtc.exec('stopScreenShare');
    };
    var _on = function _on(name, event) {
      return eventEmitter.on(name, function (error, result) {
        if (error) {
          throw new Error(error);
        }
        event(result);
      });
    };
    var _off = function _off(name) {
      return eventEmitter.off(name);
    };
    var _teardown = function _teardown() {
      return eventEmitter.teardown();
    };
    return {
      start: start,
      stop: stop,
      _on: _on,
      _off: _off,
      _teardown: _teardown
    };
  }

  function Device(rtc) {
    var isInvalid = function isInvalid(device) {
      var error = false;
      device = device || {};
      if (!utils.isObject(device.input)) {
        error = true;
      }
      return error;
    };
    var set = function set(device) {
      if (isInvalid(device)) {
        return utils.Defer.reject(device);
      }
      return rtc.exec('setDevice', device);
    };
    var check = function check() {
      return rtc.exec('checkDevice');
    };
    var getList = function getList() {
      return rtc.exec('getDeviceList');
    };
    return {
      set: set,
      check: check,
      getList: getList
    };
  }

  var check = function check(module, config) {
    var map = {
      module: {
        name: 'module',
        data: module
      },
      config: {
        name: 'config',
        data: config
      }
    };
    var tpl = '{name} is invalid.';
    utils.forEach(map, function (item) {
      if (!utils.isObject(item.data)) {
        throw new Error(utils.tplEngine(tpl, {
          name: item.name
        }));
      }
    });
  };

  var Observer = function () {
    function Observer(callback) {
      classCallCheck(this, Observer);

      this.callback = callback || utils.noop;
    }

    createClass(Observer, [{
      key: 'observe',
      value: function observe(module, config) {
        var _this = this;

        check(module, config);
        utils.extend(this, {
          module: module,
          config: config
        });
        utils.forEach(config, function (observer, action) {
          var isObserver = utils.isBoolean(observer) && observer;
          if (isObserver) {
            module._on && module._on(action, _this.callback);
          }
          if (utils.isObject(observer)) {
            var tpl = '{action}_{type}';
            utils.forEach(observer, function (isObserver, type) {
              var name = utils.tplEngine(tpl, {
                action: action,
                type: type
              });
              if (isObserver) {
                module._on && module._on(name, _this.callback);
              }
            });
          }
        });
      }
    }, {
      key: 'disconnect',
      value: function disconnect() {
        var module = this.module,
            config = this.config;

        config = config || {};
        utils.forEach(config, function (isObserver, name) {
          if (isObserver) {
            module._off && module._off(name);
          }
        });
      }
    }]);
    return Observer;
  }();

  /* 
      版本更新须知: 原版 adapter.js 不支持 es6 引入，将原始文件 factory 定义 Adapter 方法，通过模块引用初始化
  */
  function Adapter() {
  return function () {
      function r(e, n, t) {
        function o(i, f) {
          if (!n[i]) {
            if (!e[i]) {
              var c = "function" == typeof require && require;if (!f && c) return c(i, !0);if (u) return u(i, !0);var a = new Error("Cannot find module '" + i + "'");throw a.code = "MODULE_NOT_FOUND", a;
            }var p = n[i] = { exports: {} };e[i][0].call(p.exports, function (r) {
              var n = e[i][1][r];return o(n || r);
            }, p, p.exports, r, e, n, t);
          }return n[i].exports;
        }for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) {
          o(t[i]);
        }return o;
      }return r;
    }()({ 1: [function (require, module, exports) {

        var SDPUtils = require('sdp');

        function fixStatsType(stat) {
          return {
            inboundrtp: 'inbound-rtp',
            outboundrtp: 'outbound-rtp',
            candidatepair: 'candidate-pair',
            localcandidate: 'local-candidate',
            remotecandidate: 'remote-candidate'
          }[stat.type] || stat.type;
        }

        function writeMediaSection(transceiver, caps, type, stream, dtlsRole) {
          var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);

          // Map ICE parameters (ufrag, pwd) to SDP.
          sdp += SDPUtils.writeIceParameters(transceiver.iceGatherer.getLocalParameters());

          // Map DTLS parameters to SDP.
          sdp += SDPUtils.writeDtlsParameters(transceiver.dtlsTransport.getLocalParameters(), type === 'offer' ? 'actpass' : dtlsRole || 'active');

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

          if (transceiver.rtpSender) {
            var trackId = transceiver.rtpSender._initialTrackId || transceiver.rtpSender.track.id;
            transceiver.rtpSender._initialTrackId = trackId;
            // spec.
            var msid = 'msid:' + (stream ? stream.id : '-') + ' ' + trackId + '\r\n';
            sdp += 'a=' + msid;
            // for Chrome. Legacy should no longer be required.
            sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc + ' ' + msid;

            // RTX
            if (transceiver.sendEncodingParameters[0].rtx) {
              sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc + ' ' + msid;
              sdp += 'a=ssrc-group:FID ' + transceiver.sendEncodingParameters[0].ssrc + ' ' + transceiver.sendEncodingParameters[0].rtx.ssrc + '\r\n';
            }
          }
          // FIXME: this should be written by writeRtpDescription.
          sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc + ' cname:' + SDPUtils.localCName + '\r\n';
          if (transceiver.rtpSender && transceiver.sendEncodingParameters[0].rtx) {
            sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc + ' cname:' + SDPUtils.localCName + '\r\n';
          }
          return sdp;
        }

        // Edge does not like
        // 1) stun: filtered after 14393 unless ?transport=udp is present
        // 2) turn: that does not have all of turn:host:port?transport=udp
        // 3) turn: with ipv6 addresses
        // 4) turn: occurring muliple times
        function filterIceServers(iceServers, edgeVersion) {
          var hasTurn = false;
          iceServers = JSON.parse(JSON.stringify(iceServers));
          return iceServers.filter(function (server) {
            if (server && (server.urls || server.url)) {
              var urls = server.urls || server.url;
              if (server.url && !server.urls) {
                console.warn('RTCIceServer.url is deprecated! Use urls instead.');
              }
              var isString = typeof urls === 'string';
              if (isString) {
                urls = [urls];
              }
              urls = urls.filter(function (url) {
                var validTurn = url.indexOf('turn:') === 0 && url.indexOf('transport=udp') !== -1 && url.indexOf('turn:[') === -1 && !hasTurn;

                if (validTurn) {
                  hasTurn = true;
                  return true;
                }
                return url.indexOf('stun:') === 0 && edgeVersion >= 14393 && url.indexOf('?transport=udp') === -1;
              });

              delete server.url;
              server.urls = isString ? urls[0] : urls;
              return !!urls.length;
            }
          });
        }

        // Determines the intersection of local and remote capabilities.
        function getCommonCapabilities(localCapabilities, remoteCapabilities) {
          var commonCapabilities = {
            codecs: [],
            headerExtensions: [],
            fecMechanisms: []
          };

          var findCodecByPayloadType = function findCodecByPayloadType(pt, codecs) {
            pt = parseInt(pt, 10);
            for (var i = 0; i < codecs.length; i++) {
              if (codecs[i].payloadType === pt || codecs[i].preferredPayloadType === pt) {
                return codecs[i];
              }
            }
          };

          var rtxCapabilityMatches = function rtxCapabilityMatches(lRtx, rRtx, lCodecs, rCodecs) {
            var lCodec = findCodecByPayloadType(lRtx.parameters.apt, lCodecs);
            var rCodec = findCodecByPayloadType(rRtx.parameters.apt, rCodecs);
            return lCodec && rCodec && lCodec.name.toLowerCase() === rCodec.name.toLowerCase();
          };

          localCapabilities.codecs.forEach(function (lCodec) {
            for (var i = 0; i < remoteCapabilities.codecs.length; i++) {
              var rCodec = remoteCapabilities.codecs[i];
              if (lCodec.name.toLowerCase() === rCodec.name.toLowerCase() && lCodec.clockRate === rCodec.clockRate) {
                if (lCodec.name.toLowerCase() === 'rtx' && lCodec.parameters && rCodec.parameters.apt) {
                  // for RTX we need to find the local rtx that has a apt
                  // which points to the same local codec as the remote one.
                  if (!rtxCapabilityMatches(lCodec, rCodec, localCapabilities.codecs, remoteCapabilities.codecs)) {
                    continue;
                  }
                }
                rCodec = JSON.parse(JSON.stringify(rCodec)); // deepcopy
                // number of channels is the highest common number of channels
                rCodec.numChannels = Math.min(lCodec.numChannels, rCodec.numChannels);
                // push rCodec so we reply with offerer payload type
                commonCapabilities.codecs.push(rCodec);

                // determine common feedback mechanisms
                rCodec.rtcpFeedback = rCodec.rtcpFeedback.filter(function (fb) {
                  for (var j = 0; j < lCodec.rtcpFeedback.length; j++) {
                    if (lCodec.rtcpFeedback[j].type === fb.type && lCodec.rtcpFeedback[j].parameter === fb.parameter) {
                      return true;
                    }
                  }
                  return false;
                });
                // FIXME: also need to determine .parameters
                //  see https://github.com/openpeer/ortc/issues/569
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
        }

        // is action=setLocalDescription with type allowed in signalingState
        function isActionAllowedInSignalingState(action, type, signalingState) {
          return {
            offer: {
              setLocalDescription: ['stable', 'have-local-offer'],
              setRemoteDescription: ['stable', 'have-remote-offer']
            },
            answer: {
              setLocalDescription: ['have-remote-offer', 'have-local-pranswer'],
              setRemoteDescription: ['have-local-offer', 'have-remote-pranswer']
            }
          }[type][action].indexOf(signalingState) !== -1;
        }

        function maybeAddCandidate(iceTransport, candidate) {
          // Edge's internal representation adds some fields therefore
          // not all fieldѕ are taken into account.
          var alreadyAdded = iceTransport.getRemoteCandidates().find(function (remoteCandidate) {
            return candidate.foundation === remoteCandidate.foundation && candidate.ip === remoteCandidate.ip && candidate.port === remoteCandidate.port && candidate.priority === remoteCandidate.priority && candidate.protocol === remoteCandidate.protocol && candidate.type === remoteCandidate.type;
          });
          if (!alreadyAdded) {
            iceTransport.addRemoteCandidate(candidate);
          }
          return !alreadyAdded;
        }

        function makeError(name, description) {
          var e = new Error(description);
          e.name = name;
          // legacy error codes from https://heycam.github.io/webidl/#idl-DOMException-error-names
          e.code = {
            NotSupportedError: 9,
            InvalidStateError: 11,
            InvalidAccessError: 15,
            TypeError: undefined,
            OperationError: undefined
          }[name];
          return e;
        }

        module.exports = function (window, edgeVersion) {
          // https://w3c.github.io/mediacapture-main/#mediastream
          // Helper function to add the track to the stream and
          // dispatch the event ourselves.
          function addTrackToStreamAndFireEvent(track, stream) {
            stream.addTrack(track);
            stream.dispatchEvent(new window.MediaStreamTrackEvent('addtrack', { track: track }));
          }

          function removeTrackFromStreamAndFireEvent(track, stream) {
            stream.removeTrack(track);
            stream.dispatchEvent(new window.MediaStreamTrackEvent('removetrack', { track: track }));
          }

          function fireAddTrack(pc, track, receiver, streams) {
            var trackEvent = new Event('track');
            trackEvent.track = track;
            trackEvent.receiver = receiver;
            trackEvent.transceiver = { receiver: receiver };
            trackEvent.streams = streams;
            window.setTimeout(function () {
              pc._dispatchEvent('track', trackEvent);
            });
          }

          var RTCPeerConnection = function RTCPeerConnection(config) {
            var pc = this;

            var _eventTarget = document.createDocumentFragment();
            ['addEventListener', 'removeEventListener', 'dispatchEvent'].forEach(function (method) {
              pc[method] = _eventTarget[method].bind(_eventTarget);
            });

            this.canTrickleIceCandidates = null;

            this.needNegotiation = false;

            this.localStreams = [];
            this.remoteStreams = [];

            this._localDescription = null;
            this._remoteDescription = null;

            this.signalingState = 'stable';
            this.iceConnectionState = 'new';
            this.connectionState = 'new';
            this.iceGatheringState = 'new';

            config = JSON.parse(JSON.stringify(config || {}));

            this.usingBundle = config.bundlePolicy === 'max-bundle';
            if (config.rtcpMuxPolicy === 'negotiate') {
              throw makeError('NotSupportedError', 'rtcpMuxPolicy \'negotiate\' is not supported');
            } else if (!config.rtcpMuxPolicy) {
              config.rtcpMuxPolicy = 'require';
            }

            switch (config.iceTransportPolicy) {
              case 'all':
              case 'relay':
                break;
              default:
                config.iceTransportPolicy = 'all';
                break;
            }

            switch (config.bundlePolicy) {
              case 'balanced':
              case 'max-compat':
              case 'max-bundle':
                break;
              default:
                config.bundlePolicy = 'balanced';
                break;
            }

            config.iceServers = filterIceServers(config.iceServers || [], edgeVersion);

            this._iceGatherers = [];
            if (config.iceCandidatePoolSize) {
              for (var i = config.iceCandidatePoolSize; i > 0; i--) {
                this._iceGatherers.push(new window.RTCIceGatherer({
                  iceServers: config.iceServers,
                  gatherPolicy: config.iceTransportPolicy
                }));
              }
            } else {
              config.iceCandidatePoolSize = 0;
            }

            this._config = config;

            // per-track iceGathers, iceTransports, dtlsTransports, rtpSenders, ...
            // everything that is needed to describe a SDP m-line.
            this.transceivers = [];

            this._sdpSessionId = SDPUtils.generateSessionId();
            this._sdpSessionVersion = 0;

            this._dtlsRole = undefined; // role for a=setup to use in answers.

            this._isClosed = false;
          };

          Object.defineProperty(RTCPeerConnection.prototype, 'localDescription', {
            configurable: true,
            get: function get$$1() {
              return this._localDescription;
            }
          });
          Object.defineProperty(RTCPeerConnection.prototype, 'remoteDescription', {
            configurable: true,
            get: function get$$1() {
              return this._remoteDescription;
            }
          });

          // set up event handlers on prototype
          RTCPeerConnection.prototype.onicecandidate = null;
          RTCPeerConnection.prototype.onaddstream = null;
          RTCPeerConnection.prototype.ontrack = null;
          RTCPeerConnection.prototype.onremovestream = null;
          RTCPeerConnection.prototype.onsignalingstatechange = null;
          RTCPeerConnection.prototype.oniceconnectionstatechange = null;
          RTCPeerConnection.prototype.onconnectionstatechange = null;
          RTCPeerConnection.prototype.onicegatheringstatechange = null;
          RTCPeerConnection.prototype.onnegotiationneeded = null;
          RTCPeerConnection.prototype.ondatachannel = null;

          RTCPeerConnection.prototype._dispatchEvent = function (name, event) {
            if (this._isClosed) {
              return;
            }
            this.dispatchEvent(event);
            if (typeof this['on' + name] === 'function') {
              this['on' + name](event);
            }
          };

          RTCPeerConnection.prototype._emitGatheringStateChange = function () {
            var event = new Event('icegatheringstatechange');
            this._dispatchEvent('icegatheringstatechange', event);
          };

          RTCPeerConnection.prototype.getConfiguration = function () {
            return this._config;
          };

          RTCPeerConnection.prototype.getLocalStreams = function () {
            return this.localStreams;
          };

          RTCPeerConnection.prototype.getRemoteStreams = function () {
            return this.remoteStreams;
          };

          // internal helper to create a transceiver object.
          // (which is not yet the same as the WebRTC 1.0 transceiver)
          RTCPeerConnection.prototype._createTransceiver = function (kind, doNotAdd) {
            var hasBundleTransport = this.transceivers.length > 0;
            var transceiver = {
              track: null,
              iceGatherer: null,
              iceTransport: null,
              dtlsTransport: null,
              localCapabilities: null,
              remoteCapabilities: null,
              rtpSender: null,
              rtpReceiver: null,
              kind: kind,
              mid: null,
              sendEncodingParameters: null,
              recvEncodingParameters: null,
              stream: null,
              associatedRemoteMediaStreams: [],
              wantReceive: true
            };
            if (this.usingBundle && hasBundleTransport) {
              transceiver.iceTransport = this.transceivers[0].iceTransport;
              transceiver.dtlsTransport = this.transceivers[0].dtlsTransport;
            } else {
              var transports = this._createIceAndDtlsTransports();
              transceiver.iceTransport = transports.iceTransport;
              transceiver.dtlsTransport = transports.dtlsTransport;
            }
            if (!doNotAdd) {
              this.transceivers.push(transceiver);
            }
            return transceiver;
          };

          RTCPeerConnection.prototype.addTrack = function (track, stream) {
            if (this._isClosed) {
              throw makeError('InvalidStateError', 'Attempted to call addTrack on a closed peerconnection.');
            }

            var alreadyExists = this.transceivers.find(function (s) {
              return s.track === track;
            });

            if (alreadyExists) {
              throw makeError('InvalidAccessError', 'Track already exists.');
            }

            var transceiver;
            for (var i = 0; i < this.transceivers.length; i++) {
              if (!this.transceivers[i].track && this.transceivers[i].kind === track.kind) {
                transceiver = this.transceivers[i];
              }
            }
            if (!transceiver) {
              transceiver = this._createTransceiver(track.kind);
            }

            this._maybeFireNegotiationNeeded();

            if (this.localStreams.indexOf(stream) === -1) {
              this.localStreams.push(stream);
            }

            transceiver.track = track;
            transceiver.stream = stream;
            transceiver.rtpSender = new window.RTCRtpSender(track, transceiver.dtlsTransport);
            return transceiver.rtpSender;
          };

          RTCPeerConnection.prototype.addStream = function (stream) {
            var pc = this;
            if (edgeVersion >= 15025) {
              stream.getTracks().forEach(function (track) {
                pc.addTrack(track, stream);
              });
            } else {
              // Clone is necessary for local demos mostly, attaching directly
              // to two different senders does not work (build 10547).
              // Fixed in 15025 (or earlier)
              var clonedStream = stream.clone();
              stream.getTracks().forEach(function (track, idx) {
                var clonedTrack = clonedStream.getTracks()[idx];
                track.addEventListener('enabled', function (event) {
                  clonedTrack.enabled = event.enabled;
                });
              });
              clonedStream.getTracks().forEach(function (track) {
                pc.addTrack(track, clonedStream);
              });
            }
          };

          RTCPeerConnection.prototype.removeTrack = function (sender) {
            if (this._isClosed) {
              throw makeError('InvalidStateError', 'Attempted to call removeTrack on a closed peerconnection.');
            }

            if (!(sender instanceof window.RTCRtpSender)) {
              throw new TypeError('Argument 1 of RTCPeerConnection.removeTrack ' + 'does not implement interface RTCRtpSender.');
            }

            var transceiver = this.transceivers.find(function (t) {
              return t.rtpSender === sender;
            });

            if (!transceiver) {
              throw makeError('InvalidAccessError', 'Sender was not created by this connection.');
            }
            var stream = transceiver.stream;

            transceiver.rtpSender.stop();
            transceiver.rtpSender = null;
            transceiver.track = null;
            transceiver.stream = null;

            // remove the stream from the set of local streams
            var localStreams = this.transceivers.map(function (t) {
              return t.stream;
            });
            if (localStreams.indexOf(stream) === -1 && this.localStreams.indexOf(stream) > -1) {
              this.localStreams.splice(this.localStreams.indexOf(stream), 1);
            }

            this._maybeFireNegotiationNeeded();
          };

          RTCPeerConnection.prototype.removeStream = function (stream) {
            var pc = this;
            stream.getTracks().forEach(function (track) {
              var sender = pc.getSenders().find(function (s) {
                return s.track === track;
              });
              if (sender) {
                pc.removeTrack(sender);
              }
            });
          };

          RTCPeerConnection.prototype.getSenders = function () {
            return this.transceivers.filter(function (transceiver) {
              return !!transceiver.rtpSender;
            }).map(function (transceiver) {
              return transceiver.rtpSender;
            });
          };

          RTCPeerConnection.prototype.getReceivers = function () {
            return this.transceivers.filter(function (transceiver) {
              return !!transceiver.rtpReceiver;
            }).map(function (transceiver) {
              return transceiver.rtpReceiver;
            });
          };

          RTCPeerConnection.prototype._createIceGatherer = function (sdpMLineIndex, usingBundle) {
            var pc = this;
            if (usingBundle && sdpMLineIndex > 0) {
              return this.transceivers[0].iceGatherer;
            } else if (this._iceGatherers.length) {
              return this._iceGatherers.shift();
            }
            var iceGatherer = new window.RTCIceGatherer({
              iceServers: this._config.iceServers,
              gatherPolicy: this._config.iceTransportPolicy
            });
            Object.defineProperty(iceGatherer, 'state', { value: 'new', writable: true });

            this.transceivers[sdpMLineIndex].bufferedCandidateEvents = [];
            this.transceivers[sdpMLineIndex].bufferCandidates = function (event) {
              var end = !event.candidate || Object.keys(event.candidate).length === 0;
              // polyfill since RTCIceGatherer.state is not implemented in
              // Edge 10547 yet.
              iceGatherer.state = end ? 'completed' : 'gathering';
              if (pc.transceivers[sdpMLineIndex].bufferedCandidateEvents !== null) {
                pc.transceivers[sdpMLineIndex].bufferedCandidateEvents.push(event);
              }
            };
            iceGatherer.addEventListener('localcandidate', this.transceivers[sdpMLineIndex].bufferCandidates);
            return iceGatherer;
          };

          // start gathering from an RTCIceGatherer.
          RTCPeerConnection.prototype._gather = function (mid, sdpMLineIndex) {
            var pc = this;
            var iceGatherer = this.transceivers[sdpMLineIndex].iceGatherer;
            if (iceGatherer.onlocalcandidate) {
              return;
            }
            var bufferedCandidateEvents = this.transceivers[sdpMLineIndex].bufferedCandidateEvents;
            this.transceivers[sdpMLineIndex].bufferedCandidateEvents = null;
            iceGatherer.removeEventListener('localcandidate', this.transceivers[sdpMLineIndex].bufferCandidates);
            iceGatherer.onlocalcandidate = function (evt) {
              if (pc.usingBundle && sdpMLineIndex > 0) {
                // if we know that we use bundle we can drop candidates with
                // ѕdpMLineIndex > 0. If we don't do this then our state gets
                // confused since we dispose the extra ice gatherer.
                return;
              }
              var event = new Event('icecandidate');
              event.candidate = { sdpMid: mid, sdpMLineIndex: sdpMLineIndex };

              var cand = evt.candidate;
              // Edge emits an empty object for RTCIceCandidateComplete‥
              var end = !cand || Object.keys(cand).length === 0;
              if (end) {
                // polyfill since RTCIceGatherer.state is not implemented in
                // Edge 10547 yet.
                if (iceGatherer.state === 'new' || iceGatherer.state === 'gathering') {
                  iceGatherer.state = 'completed';
                }
              } else {
                if (iceGatherer.state === 'new') {
                  iceGatherer.state = 'gathering';
                }
                // RTCIceCandidate doesn't have a component, needs to be added
                cand.component = 1;
                // also the usernameFragment. TODO: update SDP to take both variants.
                cand.ufrag = iceGatherer.getLocalParameters().usernameFragment;

                var serializedCandidate = SDPUtils.writeCandidate(cand);
                event.candidate = Object.assign(event.candidate, SDPUtils.parseCandidate(serializedCandidate));

                event.candidate.candidate = serializedCandidate;
                event.candidate.toJSON = function () {
                  return {
                    candidate: event.candidate.candidate,
                    sdpMid: event.candidate.sdpMid,
                    sdpMLineIndex: event.candidate.sdpMLineIndex,
                    usernameFragment: event.candidate.usernameFragment
                  };
                };
              }

              // update local description.
              var sections = SDPUtils.getMediaSections(pc._localDescription.sdp);
              if (!end) {
                sections[event.candidate.sdpMLineIndex] += 'a=' + event.candidate.candidate + '\r\n';
              } else {
                sections[event.candidate.sdpMLineIndex] += 'a=end-of-candidates\r\n';
              }
              pc._localDescription.sdp = SDPUtils.getDescription(pc._localDescription.sdp) + sections.join('');
              var complete = pc.transceivers.every(function (transceiver) {
                return transceiver.iceGatherer && transceiver.iceGatherer.state === 'completed';
              });

              if (pc.iceGatheringState !== 'gathering') {
                pc.iceGatheringState = 'gathering';
                pc._emitGatheringStateChange();
              }

              // Emit candidate. Also emit null candidate when all gatherers are
              // complete.
              if (!end) {
                pc._dispatchEvent('icecandidate', event);
              }
              if (complete) {
                pc._dispatchEvent('icecandidate', new Event('icecandidate'));
                pc.iceGatheringState = 'complete';
                pc._emitGatheringStateChange();
              }
            };

            // emit already gathered candidates.
            window.setTimeout(function () {
              bufferedCandidateEvents.forEach(function (e) {
                iceGatherer.onlocalcandidate(e);
              });
            }, 0);
          };

          // Create ICE transport and DTLS transport.
          RTCPeerConnection.prototype._createIceAndDtlsTransports = function () {
            var pc = this;
            var iceTransport = new window.RTCIceTransport(null);
            iceTransport.onicestatechange = function () {
              pc._updateIceConnectionState();
              pc._updateConnectionState();
            };

            var dtlsTransport = new window.RTCDtlsTransport(iceTransport);
            dtlsTransport.ondtlsstatechange = function () {
              pc._updateConnectionState();
            };
            dtlsTransport.onerror = function () {
              // onerror does not set state to failed by itself.
              Object.defineProperty(dtlsTransport, 'state', { value: 'failed', writable: true });
              pc._updateConnectionState();
            };

            return {
              iceTransport: iceTransport,
              dtlsTransport: dtlsTransport
            };
          };

          // Destroy ICE gatherer, ICE transport and DTLS transport.
          // Without triggering the callbacks.
          RTCPeerConnection.prototype._disposeIceAndDtlsTransports = function (sdpMLineIndex) {
            var iceGatherer = this.transceivers[sdpMLineIndex].iceGatherer;
            if (iceGatherer) {
              delete iceGatherer.onlocalcandidate;
              delete this.transceivers[sdpMLineIndex].iceGatherer;
            }
            var iceTransport = this.transceivers[sdpMLineIndex].iceTransport;
            if (iceTransport) {
              delete iceTransport.onicestatechange;
              delete this.transceivers[sdpMLineIndex].iceTransport;
            }
            var dtlsTransport = this.transceivers[sdpMLineIndex].dtlsTransport;
            if (dtlsTransport) {
              delete dtlsTransport.ondtlsstatechange;
              delete dtlsTransport.onerror;
              delete this.transceivers[sdpMLineIndex].dtlsTransport;
            }
          };

          // Start the RTP Sender and Receiver for a transceiver.
          RTCPeerConnection.prototype._transceive = function (transceiver, send, recv) {
            var params = getCommonCapabilities(transceiver.localCapabilities, transceiver.remoteCapabilities);
            if (send && transceiver.rtpSender) {
              params.encodings = transceiver.sendEncodingParameters;
              params.rtcp = {
                cname: SDPUtils.localCName,
                compound: transceiver.rtcpParameters.compound
              };
              if (transceiver.recvEncodingParameters.length) {
                params.rtcp.ssrc = transceiver.recvEncodingParameters[0].ssrc;
              }
              transceiver.rtpSender.send(params);
            }
            if (recv && transceiver.rtpReceiver && params.codecs.length > 0) {
              // remove RTX field in Edge 14942
              if (transceiver.kind === 'video' && transceiver.recvEncodingParameters && edgeVersion < 15019) {
                transceiver.recvEncodingParameters.forEach(function (p) {
                  delete p.rtx;
                });
              }
              if (transceiver.recvEncodingParameters.length) {
                params.encodings = transceiver.recvEncodingParameters;
              } else {
                params.encodings = [{}];
              }
              params.rtcp = {
                compound: transceiver.rtcpParameters.compound
              };
              if (transceiver.rtcpParameters.cname) {
                params.rtcp.cname = transceiver.rtcpParameters.cname;
              }
              if (transceiver.sendEncodingParameters.length) {
                params.rtcp.ssrc = transceiver.sendEncodingParameters[0].ssrc;
              }
              transceiver.rtpReceiver.receive(params);
            }
          };

          RTCPeerConnection.prototype.setLocalDescription = function (description) {
            var pc = this;

            // Note: pranswer is not supported.
            if (['offer', 'answer'].indexOf(description.type) === -1) {
              return Promise.reject(makeError('TypeError', 'Unsupported type "' + description.type + '"'));
            }

            if (!isActionAllowedInSignalingState('setLocalDescription', description.type, pc.signalingState) || pc._isClosed) {
              return Promise.reject(makeError('InvalidStateError', 'Can not set local ' + description.type + ' in state ' + pc.signalingState));
            }

            var sections;
            var sessionpart;
            if (description.type === 'offer') {
              // VERY limited support for SDP munging. Limited to:
              // * changing the order of codecs
              sections = SDPUtils.splitSections(description.sdp);
              sessionpart = sections.shift();
              sections.forEach(function (mediaSection, sdpMLineIndex) {
                var caps = SDPUtils.parseRtpParameters(mediaSection);
                pc.transceivers[sdpMLineIndex].localCapabilities = caps;
              });

              pc.transceivers.forEach(function (transceiver, sdpMLineIndex) {
                pc._gather(transceiver.mid, sdpMLineIndex);
              });
            } else if (description.type === 'answer') {
              sections = SDPUtils.splitSections(pc._remoteDescription.sdp);
              sessionpart = sections.shift();
              var isIceLite = SDPUtils.matchPrefix(sessionpart, 'a=ice-lite').length > 0;
              sections.forEach(function (mediaSection, sdpMLineIndex) {
                var transceiver = pc.transceivers[sdpMLineIndex];
                var iceGatherer = transceiver.iceGatherer;
                var iceTransport = transceiver.iceTransport;
                var dtlsTransport = transceiver.dtlsTransport;
                var localCapabilities = transceiver.localCapabilities;
                var remoteCapabilities = transceiver.remoteCapabilities;

                // treat bundle-only as not-rejected.
                var rejected = SDPUtils.isRejected(mediaSection) && SDPUtils.matchPrefix(mediaSection, 'a=bundle-only').length === 0;

                if (!rejected && !transceiver.rejected) {
                  var remoteIceParameters = SDPUtils.getIceParameters(mediaSection, sessionpart);
                  var remoteDtlsParameters = SDPUtils.getDtlsParameters(mediaSection, sessionpart);
                  if (isIceLite) {
                    remoteDtlsParameters.role = 'server';
                  }

                  if (!pc.usingBundle || sdpMLineIndex === 0) {
                    pc._gather(transceiver.mid, sdpMLineIndex);
                    if (iceTransport.state === 'new') {
                      iceTransport.start(iceGatherer, remoteIceParameters, isIceLite ? 'controlling' : 'controlled');
                    }
                    if (dtlsTransport.state === 'new') {
                      dtlsTransport.start(remoteDtlsParameters);
                    }
                  }

                  // Calculate intersection of capabilities.
                  var params = getCommonCapabilities(localCapabilities, remoteCapabilities);

                  // Start the RTCRtpSender. The RTCRtpReceiver for this
                  // transceiver has already been started in setRemoteDescription.
                  pc._transceive(transceiver, params.codecs.length > 0, false);
                }
              });
            }

            pc._localDescription = {
              type: description.type,
              sdp: description.sdp
            };
            if (description.type === 'offer') {
              pc._updateSignalingState('have-local-offer');
            } else {
              pc._updateSignalingState('stable');
            }

            return Promise.resolve();
          };

          RTCPeerConnection.prototype.setRemoteDescription = function (description) {
            var pc = this;

            // Note: pranswer is not supported.
            if (['offer', 'answer'].indexOf(description.type) === -1) {
              return Promise.reject(makeError('TypeError', 'Unsupported type "' + description.type + '"'));
            }

            if (!isActionAllowedInSignalingState('setRemoteDescription', description.type, pc.signalingState) || pc._isClosed) {
              return Promise.reject(makeError('InvalidStateError', 'Can not set remote ' + description.type + ' in state ' + pc.signalingState));
            }

            var streams = {};
            pc.remoteStreams.forEach(function (stream) {
              streams[stream.id] = stream;
            });
            var receiverList = [];
            var sections = SDPUtils.splitSections(description.sdp);
            var sessionpart = sections.shift();
            var isIceLite = SDPUtils.matchPrefix(sessionpart, 'a=ice-lite').length > 0;
            var usingBundle = SDPUtils.matchPrefix(sessionpart, 'a=group:BUNDLE ').length > 0;
            pc.usingBundle = usingBundle;
            var iceOptions = SDPUtils.matchPrefix(sessionpart, 'a=ice-options:')[0];
            if (iceOptions) {
              pc.canTrickleIceCandidates = iceOptions.substr(14).split(' ').indexOf('trickle') >= 0;
            } else {
              pc.canTrickleIceCandidates = false;
            }

            sections.forEach(function (mediaSection, sdpMLineIndex) {
              var lines = SDPUtils.splitLines(mediaSection);
              var kind = SDPUtils.getKind(mediaSection);
              // treat bundle-only as not-rejected.
              var rejected = SDPUtils.isRejected(mediaSection) && SDPUtils.matchPrefix(mediaSection, 'a=bundle-only').length === 0;
              var protocol = lines[0].substr(2).split(' ')[2];

              var direction = SDPUtils.getDirection(mediaSection, sessionpart);
              var remoteMsid = SDPUtils.parseMsid(mediaSection);

              var mid = SDPUtils.getMid(mediaSection) || SDPUtils.generateIdentifier();

              // Reject datachannels which are not implemented yet.
              if (rejected || kind === 'application' && (protocol === 'DTLS/SCTP' || protocol === 'UDP/DTLS/SCTP')) {
                // TODO: this is dangerous in the case where a non-rejected m-line
                //     becomes rejected.
                pc.transceivers[sdpMLineIndex] = {
                  mid: mid,
                  kind: kind,
                  protocol: protocol,
                  rejected: true
                };
                return;
              }

              if (!rejected && pc.transceivers[sdpMLineIndex] && pc.transceivers[sdpMLineIndex].rejected) {
                // recycle a rejected transceiver.
                pc.transceivers[sdpMLineIndex] = pc._createTransceiver(kind, true);
              }

              var transceiver;
              var iceGatherer;
              var iceTransport;
              var dtlsTransport;
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
                remoteDtlsParameters.role = 'client';
              }
              recvEncodingParameters = SDPUtils.parseRtpEncodingParameters(mediaSection);

              var rtcpParameters = SDPUtils.parseRtcpParameters(mediaSection);

              var isComplete = SDPUtils.matchPrefix(mediaSection, 'a=end-of-candidates', sessionpart).length > 0;
              var cands = SDPUtils.matchPrefix(mediaSection, 'a=candidate:').map(function (cand) {
                return SDPUtils.parseCandidate(cand);
              }).filter(function (cand) {
                return cand.component === 1;
              });

              // Check if we can use BUNDLE and dispose transports.
              if ((description.type === 'offer' || description.type === 'answer') && !rejected && usingBundle && sdpMLineIndex > 0 && pc.transceivers[sdpMLineIndex]) {
                pc._disposeIceAndDtlsTransports(sdpMLineIndex);
                pc.transceivers[sdpMLineIndex].iceGatherer = pc.transceivers[0].iceGatherer;
                pc.transceivers[sdpMLineIndex].iceTransport = pc.transceivers[0].iceTransport;
                pc.transceivers[sdpMLineIndex].dtlsTransport = pc.transceivers[0].dtlsTransport;
                if (pc.transceivers[sdpMLineIndex].rtpSender) {
                  pc.transceivers[sdpMLineIndex].rtpSender.setTransport(pc.transceivers[0].dtlsTransport);
                }
                if (pc.transceivers[sdpMLineIndex].rtpReceiver) {
                  pc.transceivers[sdpMLineIndex].rtpReceiver.setTransport(pc.transceivers[0].dtlsTransport);
                }
              }
              if (description.type === 'offer' && !rejected) {
                transceiver = pc.transceivers[sdpMLineIndex] || pc._createTransceiver(kind);
                transceiver.mid = mid;

                if (!transceiver.iceGatherer) {
                  transceiver.iceGatherer = pc._createIceGatherer(sdpMLineIndex, usingBundle);
                }

                if (cands.length && transceiver.iceTransport.state === 'new') {
                  if (isComplete && (!usingBundle || sdpMLineIndex === 0)) {
                    transceiver.iceTransport.setRemoteCandidates(cands);
                  } else {
                    cands.forEach(function (candidate) {
                      maybeAddCandidate(transceiver.iceTransport, candidate);
                    });
                  }
                }

                localCapabilities = window.RTCRtpReceiver.getCapabilities(kind);

                // filter RTX until additional stuff needed for RTX is implemented
                // in adapter.js
                if (edgeVersion < 15019) {
                  localCapabilities.codecs = localCapabilities.codecs.filter(function (codec) {
                    return codec.name !== 'rtx';
                  });
                }

                sendEncodingParameters = transceiver.sendEncodingParameters || [{
                  ssrc: (2 * sdpMLineIndex + 2) * 1001
                }];

                // TODO: rewrite to use http://w3c.github.io/webrtc-pc/#set-associated-remote-streams
                var isNewTrack = false;
                if (direction === 'sendrecv' || direction === 'sendonly') {
                  isNewTrack = !transceiver.rtpReceiver;
                  rtpReceiver = transceiver.rtpReceiver || new window.RTCRtpReceiver(transceiver.dtlsTransport, kind);

                  if (isNewTrack) {
                    var stream;
                    track = rtpReceiver.track;
                    // FIXME: does not work with Plan B.
                    if (remoteMsid && remoteMsid.stream === '-') ; else if (remoteMsid) {
                      if (!streams[remoteMsid.stream]) {
                        streams[remoteMsid.stream] = new window.MediaStream();
                        Object.defineProperty(streams[remoteMsid.stream], 'id', {
                          get: function get$$1() {
                            return remoteMsid.stream;
                          }
                        });
                      }
                      Object.defineProperty(track, 'id', {
                        get: function get$$1() {
                          return remoteMsid.track;
                        }
                      });
                      stream = streams[remoteMsid.stream];
                    } else {
                      if (!streams.default) {
                        streams.default = new window.MediaStream();
                      }
                      stream = streams.default;
                    }
                    if (stream) {
                      addTrackToStreamAndFireEvent(track, stream);
                      transceiver.associatedRemoteMediaStreams.push(stream);
                    }
                    receiverList.push([track, rtpReceiver, stream]);
                  }
                } else if (transceiver.rtpReceiver && transceiver.rtpReceiver.track) {
                  transceiver.associatedRemoteMediaStreams.forEach(function (s) {
                    var nativeTrack = s.getTracks().find(function (t) {
                      return t.id === transceiver.rtpReceiver.track.id;
                    });
                    if (nativeTrack) {
                      removeTrackFromStreamAndFireEvent(nativeTrack, s);
                    }
                  });
                  transceiver.associatedRemoteMediaStreams = [];
                }

                transceiver.localCapabilities = localCapabilities;
                transceiver.remoteCapabilities = remoteCapabilities;
                transceiver.rtpReceiver = rtpReceiver;
                transceiver.rtcpParameters = rtcpParameters;
                transceiver.sendEncodingParameters = sendEncodingParameters;
                transceiver.recvEncodingParameters = recvEncodingParameters;

                // Start the RTCRtpReceiver now. The RTPSender is started in
                // setLocalDescription.
                pc._transceive(pc.transceivers[sdpMLineIndex], false, isNewTrack);
              } else if (description.type === 'answer' && !rejected) {
                transceiver = pc.transceivers[sdpMLineIndex];
                iceGatherer = transceiver.iceGatherer;
                iceTransport = transceiver.iceTransport;
                dtlsTransport = transceiver.dtlsTransport;
                rtpReceiver = transceiver.rtpReceiver;
                sendEncodingParameters = transceiver.sendEncodingParameters;
                localCapabilities = transceiver.localCapabilities;

                pc.transceivers[sdpMLineIndex].recvEncodingParameters = recvEncodingParameters;
                pc.transceivers[sdpMLineIndex].remoteCapabilities = remoteCapabilities;
                pc.transceivers[sdpMLineIndex].rtcpParameters = rtcpParameters;

                if (cands.length && iceTransport.state === 'new') {
                  if ((isIceLite || isComplete) && (!usingBundle || sdpMLineIndex === 0)) {
                    iceTransport.setRemoteCandidates(cands);
                  } else {
                    cands.forEach(function (candidate) {
                      maybeAddCandidate(transceiver.iceTransport, candidate);
                    });
                  }
                }

                if (!usingBundle || sdpMLineIndex === 0) {
                  if (iceTransport.state === 'new') {
                    iceTransport.start(iceGatherer, remoteIceParameters, 'controlling');
                  }
                  if (dtlsTransport.state === 'new') {
                    dtlsTransport.start(remoteDtlsParameters);
                  }
                }

                // If the offer contained RTX but the answer did not,
                // remove RTX from sendEncodingParameters.
                var commonCapabilities = getCommonCapabilities(transceiver.localCapabilities, transceiver.remoteCapabilities);

                var hasRtx = commonCapabilities.codecs.filter(function (c) {
                  return c.name.toLowerCase() === 'rtx';
                }).length;
                if (!hasRtx && transceiver.sendEncodingParameters[0].rtx) {
                  delete transceiver.sendEncodingParameters[0].rtx;
                }

                pc._transceive(transceiver, direction === 'sendrecv' || direction === 'recvonly', direction === 'sendrecv' || direction === 'sendonly');

                // TODO: rewrite to use http://w3c.github.io/webrtc-pc/#set-associated-remote-streams
                if (rtpReceiver && (direction === 'sendrecv' || direction === 'sendonly')) {
                  track = rtpReceiver.track;
                  if (remoteMsid) {
                    if (!streams[remoteMsid.stream]) {
                      streams[remoteMsid.stream] = new window.MediaStream();
                    }
                    addTrackToStreamAndFireEvent(track, streams[remoteMsid.stream]);
                    receiverList.push([track, rtpReceiver, streams[remoteMsid.stream]]);
                  } else {
                    if (!streams.default) {
                      streams.default = new window.MediaStream();
                    }
                    addTrackToStreamAndFireEvent(track, streams.default);
                    receiverList.push([track, rtpReceiver, streams.default]);
                  }
                } else {
                  // FIXME: actually the receiver should be created later.
                  delete transceiver.rtpReceiver;
                }
              }
            });

            if (pc._dtlsRole === undefined) {
              pc._dtlsRole = description.type === 'offer' ? 'active' : 'passive';
            }

            pc._remoteDescription = {
              type: description.type,
              sdp: description.sdp
            };
            if (description.type === 'offer') {
              pc._updateSignalingState('have-remote-offer');
            } else {
              pc._updateSignalingState('stable');
            }
            Object.keys(streams).forEach(function (sid) {
              var stream = streams[sid];
              if (stream.getTracks().length) {
                if (pc.remoteStreams.indexOf(stream) === -1) {
                  pc.remoteStreams.push(stream);
                  var event = new Event('addstream');
                  event.stream = stream;
                  window.setTimeout(function () {
                    pc._dispatchEvent('addstream', event);
                  });
                }

                receiverList.forEach(function (item) {
                  var track = item[0];
                  var receiver = item[1];
                  if (stream.id !== item[2].id) {
                    return;
                  }
                  fireAddTrack(pc, track, receiver, [stream]);
                });
              }
            });
            receiverList.forEach(function (item) {
              if (item[2]) {
                return;
              }
              fireAddTrack(pc, item[0], item[1], []);
            });

            // check whether addIceCandidate({}) was called within four seconds after
            // setRemoteDescription.
            window.setTimeout(function () {
              if (!(pc && pc.transceivers)) {
                return;
              }
              pc.transceivers.forEach(function (transceiver) {
                if (transceiver.iceTransport && transceiver.iceTransport.state === 'new' && transceiver.iceTransport.getRemoteCandidates().length > 0) {
                  console.warn('Timeout for addRemoteCandidate. Consider sending ' + 'an end-of-candidates notification');
                  transceiver.iceTransport.addRemoteCandidate({});
                }
              });
            }, 4000);

            return Promise.resolve();
          };

          RTCPeerConnection.prototype.close = function () {
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
            this._isClosed = true;
            this._updateSignalingState('closed');
          };

          // Update the signaling state.
          RTCPeerConnection.prototype._updateSignalingState = function (newState) {
            this.signalingState = newState;
            var event = new Event('signalingstatechange');
            this._dispatchEvent('signalingstatechange', event);
          };

          // Determine whether to fire the negotiationneeded event.
          RTCPeerConnection.prototype._maybeFireNegotiationNeeded = function () {
            var pc = this;
            if (this.signalingState !== 'stable' || this.needNegotiation === true) {
              return;
            }
            this.needNegotiation = true;
            window.setTimeout(function () {
              if (pc.needNegotiation) {
                pc.needNegotiation = false;
                var event = new Event('negotiationneeded');
                pc._dispatchEvent('negotiationneeded', event);
              }
            }, 0);
          };

          // Update the ice connection state.
          RTCPeerConnection.prototype._updateIceConnectionState = function () {
            var newState;
            var states = {
              'new': 0,
              closed: 0,
              checking: 0,
              connected: 0,
              completed: 0,
              disconnected: 0,
              failed: 0
            };
            this.transceivers.forEach(function (transceiver) {
              states[transceiver.iceTransport.state]++;
            });

            newState = 'new';
            if (states.failed > 0) {
              newState = 'failed';
            } else if (states.checking > 0) {
              newState = 'checking';
            } else if (states.disconnected > 0) {
              newState = 'disconnected';
            } else if (states.new > 0) {
              newState = 'new';
            } else if (states.connected > 0) {
              newState = 'connected';
            } else if (states.completed > 0) {
              newState = 'completed';
            }

            if (newState !== this.iceConnectionState) {
              this.iceConnectionState = newState;
              var event = new Event('iceconnectionstatechange');
              this._dispatchEvent('iceconnectionstatechange', event);
            }
          };

          // Update the connection state.
          RTCPeerConnection.prototype._updateConnectionState = function () {
            var newState;
            var states = {
              'new': 0,
              closed: 0,
              connecting: 0,
              connected: 0,
              completed: 0,
              disconnected: 0,
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
            } else if (states.connecting > 0) {
              newState = 'connecting';
            } else if (states.disconnected > 0) {
              newState = 'disconnected';
            } else if (states.new > 0) {
              newState = 'new';
            } else if (states.connected > 0) {
              newState = 'connected';
            }

            if (newState !== this.connectionState) {
              this.connectionState = newState;
              var event = new Event('connectionstatechange');
              this._dispatchEvent('connectionstatechange', event);
            }
          };

          RTCPeerConnection.prototype.createOffer = function () {
            var pc = this;

            if (pc._isClosed) {
              return Promise.reject(makeError('InvalidStateError', 'Can not call createOffer after close'));
            }

            var numAudioTracks = pc.transceivers.filter(function (t) {
              return t.kind === 'audio';
            }).length;
            var numVideoTracks = pc.transceivers.filter(function (t) {
              return t.kind === 'video';
            }).length;

            // Determine number of audio and video tracks we need to send/recv.
            var offerOptions = arguments[0];
            if (offerOptions) {
              // Reject Chrome legacy constraints.
              if (offerOptions.mandatory || offerOptions.optional) {
                throw new TypeError('Legacy mandatory/optional constraints not supported.');
              }
              if (offerOptions.offerToReceiveAudio !== undefined) {
                if (offerOptions.offerToReceiveAudio === true) {
                  numAudioTracks = 1;
                } else if (offerOptions.offerToReceiveAudio === false) {
                  numAudioTracks = 0;
                } else {
                  numAudioTracks = offerOptions.offerToReceiveAudio;
                }
              }
              if (offerOptions.offerToReceiveVideo !== undefined) {
                if (offerOptions.offerToReceiveVideo === true) {
                  numVideoTracks = 1;
                } else if (offerOptions.offerToReceiveVideo === false) {
                  numVideoTracks = 0;
                } else {
                  numVideoTracks = offerOptions.offerToReceiveVideo;
                }
              }
            }

            pc.transceivers.forEach(function (transceiver) {
              if (transceiver.kind === 'audio') {
                numAudioTracks--;
                if (numAudioTracks < 0) {
                  transceiver.wantReceive = false;
                }
              } else if (transceiver.kind === 'video') {
                numVideoTracks--;
                if (numVideoTracks < 0) {
                  transceiver.wantReceive = false;
                }
              }
            });

            // Create M-lines for recvonly streams.
            while (numAudioTracks > 0 || numVideoTracks > 0) {
              if (numAudioTracks > 0) {
                pc._createTransceiver('audio');
                numAudioTracks--;
              }
              if (numVideoTracks > 0) {
                pc._createTransceiver('video');
                numVideoTracks--;
              }
            }

            var sdp = SDPUtils.writeSessionBoilerplate(pc._sdpSessionId, pc._sdpSessionVersion++);
            pc.transceivers.forEach(function (transceiver, sdpMLineIndex) {
              // For each track, create an ice gatherer, ice transport,
              // dtls transport, potentially rtpsender and rtpreceiver.
              var track = transceiver.track;
              var kind = transceiver.kind;
              var mid = transceiver.mid || SDPUtils.generateIdentifier();
              transceiver.mid = mid;

              if (!transceiver.iceGatherer) {
                transceiver.iceGatherer = pc._createIceGatherer(sdpMLineIndex, pc.usingBundle);
              }

              var localCapabilities = window.RTCRtpSender.getCapabilities(kind);
              // filter RTX until additional stuff needed for RTX is implemented
              // in adapter.js
              if (edgeVersion < 15019) {
                localCapabilities.codecs = localCapabilities.codecs.filter(function (codec) {
                  return codec.name !== 'rtx';
                });
              }
              localCapabilities.codecs.forEach(function (codec) {
                // work around https://bugs.chromium.org/p/webrtc/issues/detail?id=6552
                // by adding level-asymmetry-allowed=1
                if (codec.name === 'H264' && codec.parameters['level-asymmetry-allowed'] === undefined) {
                  codec.parameters['level-asymmetry-allowed'] = '1';
                }

                // for subsequent offers, we might have to re-use the payload
                // type of the last offer.
                if (transceiver.remoteCapabilities && transceiver.remoteCapabilities.codecs) {
                  transceiver.remoteCapabilities.codecs.forEach(function (remoteCodec) {
                    if (codec.name.toLowerCase() === remoteCodec.name.toLowerCase() && codec.clockRate === remoteCodec.clockRate) {
                      codec.preferredPayloadType = remoteCodec.payloadType;
                    }
                  });
                }
              });
              localCapabilities.headerExtensions.forEach(function (hdrExt) {
                var remoteExtensions = transceiver.remoteCapabilities && transceiver.remoteCapabilities.headerExtensions || [];
                remoteExtensions.forEach(function (rHdrExt) {
                  if (hdrExt.uri === rHdrExt.uri) {
                    hdrExt.id = rHdrExt.id;
                  }
                });
              });

              // generate an ssrc now, to be used later in rtpSender.send
              var sendEncodingParameters = transceiver.sendEncodingParameters || [{
                ssrc: (2 * sdpMLineIndex + 1) * 1001
              }];
              if (track) {
                // add RTX
                if (edgeVersion >= 15019 && kind === 'video' && !sendEncodingParameters[0].rtx) {
                  sendEncodingParameters[0].rtx = {
                    ssrc: sendEncodingParameters[0].ssrc + 1
                  };
                }
              }

              if (transceiver.wantReceive) {
                transceiver.rtpReceiver = new window.RTCRtpReceiver(transceiver.dtlsTransport, kind);
              }

              transceiver.localCapabilities = localCapabilities;
              transceiver.sendEncodingParameters = sendEncodingParameters;
            });

            // always offer BUNDLE and dispose on return if not supported.
            if (pc._config.bundlePolicy !== 'max-compat') {
              sdp += 'a=group:BUNDLE ' + pc.transceivers.map(function (t) {
                return t.mid;
              }).join(' ') + '\r\n';
            }
            sdp += 'a=ice-options:trickle\r\n';

            pc.transceivers.forEach(function (transceiver, sdpMLineIndex) {
              sdp += writeMediaSection(transceiver, transceiver.localCapabilities, 'offer', transceiver.stream, pc._dtlsRole);
              sdp += 'a=rtcp-rsize\r\n';

              if (transceiver.iceGatherer && pc.iceGatheringState !== 'new' && (sdpMLineIndex === 0 || !pc.usingBundle)) {
                transceiver.iceGatherer.getLocalCandidates().forEach(function (cand) {
                  cand.component = 1;
                  sdp += 'a=' + SDPUtils.writeCandidate(cand) + '\r\n';
                });

                if (transceiver.iceGatherer.state === 'completed') {
                  sdp += 'a=end-of-candidates\r\n';
                }
              }
            });

            var desc = new window.RTCSessionDescription({
              type: 'offer',
              sdp: sdp
            });
            return Promise.resolve(desc);
          };

          RTCPeerConnection.prototype.createAnswer = function () {
            var pc = this;

            if (pc._isClosed) {
              return Promise.reject(makeError('InvalidStateError', 'Can not call createAnswer after close'));
            }

            if (!(pc.signalingState === 'have-remote-offer' || pc.signalingState === 'have-local-pranswer')) {
              return Promise.reject(makeError('InvalidStateError', 'Can not call createAnswer in signalingState ' + pc.signalingState));
            }

            var sdp = SDPUtils.writeSessionBoilerplate(pc._sdpSessionId, pc._sdpSessionVersion++);
            if (pc.usingBundle) {
              sdp += 'a=group:BUNDLE ' + pc.transceivers.map(function (t) {
                return t.mid;
              }).join(' ') + '\r\n';
            }
            sdp += 'a=ice-options:trickle\r\n';

            var mediaSectionsInOffer = SDPUtils.getMediaSections(pc._remoteDescription.sdp).length;
            pc.transceivers.forEach(function (transceiver, sdpMLineIndex) {
              if (sdpMLineIndex + 1 > mediaSectionsInOffer) {
                return;
              }
              if (transceiver.rejected) {
                if (transceiver.kind === 'application') {
                  if (transceiver.protocol === 'DTLS/SCTP') {
                    // legacy fmt
                    sdp += 'm=application 0 DTLS/SCTP 5000\r\n';
                  } else {
                    sdp += 'm=application 0 ' + transceiver.protocol + ' webrtc-datachannel\r\n';
                  }
                } else if (transceiver.kind === 'audio') {
                  sdp += 'm=audio 0 UDP/TLS/RTP/SAVPF 0\r\n' + 'a=rtpmap:0 PCMU/8000\r\n';
                } else if (transceiver.kind === 'video') {
                  sdp += 'm=video 0 UDP/TLS/RTP/SAVPF 120\r\n' + 'a=rtpmap:120 VP8/90000\r\n';
                }
                sdp += 'c=IN IP4 0.0.0.0\r\n' + 'a=inactive\r\n' + 'a=mid:' + transceiver.mid + '\r\n';
                return;
              }

              // FIXME: look at direction.
              if (transceiver.stream) {
                var localTrack;
                if (transceiver.kind === 'audio') {
                  localTrack = transceiver.stream.getAudioTracks()[0];
                } else if (transceiver.kind === 'video') {
                  localTrack = transceiver.stream.getVideoTracks()[0];
                }
                if (localTrack) {
                  // add RTX
                  if (edgeVersion >= 15019 && transceiver.kind === 'video' && !transceiver.sendEncodingParameters[0].rtx) {
                    transceiver.sendEncodingParameters[0].rtx = {
                      ssrc: transceiver.sendEncodingParameters[0].ssrc + 1
                    };
                  }
                }
              }

              // Calculate intersection of capabilities.
              var commonCapabilities = getCommonCapabilities(transceiver.localCapabilities, transceiver.remoteCapabilities);

              var hasRtx = commonCapabilities.codecs.filter(function (c) {
                return c.name.toLowerCase() === 'rtx';
              }).length;
              if (!hasRtx && transceiver.sendEncodingParameters[0].rtx) {
                delete transceiver.sendEncodingParameters[0].rtx;
              }

              sdp += writeMediaSection(transceiver, commonCapabilities, 'answer', transceiver.stream, pc._dtlsRole);
              if (transceiver.rtcpParameters && transceiver.rtcpParameters.reducedSize) {
                sdp += 'a=rtcp-rsize\r\n';
              }
            });

            var desc = new window.RTCSessionDescription({
              type: 'answer',
              sdp: sdp
            });
            return Promise.resolve(desc);
          };

          RTCPeerConnection.prototype.addIceCandidate = function (candidate) {
            var pc = this;
            var sections;
            if (candidate && !(candidate.sdpMLineIndex !== undefined || candidate.sdpMid)) {
              return Promise.reject(new TypeError('sdpMLineIndex or sdpMid required'));
            }

            // TODO: needs to go into ops queue.
            return new Promise(function (resolve, reject) {
              if (!pc._remoteDescription) {
                return reject(makeError('InvalidStateError', 'Can not add ICE candidate without a remote description'));
              } else if (!candidate || candidate.candidate === '') {
                for (var j = 0; j < pc.transceivers.length; j++) {
                  if (pc.transceivers[j].rejected) {
                    continue;
                  }
                  pc.transceivers[j].iceTransport.addRemoteCandidate({});
                  sections = SDPUtils.getMediaSections(pc._remoteDescription.sdp);
                  sections[j] += 'a=end-of-candidates\r\n';
                  pc._remoteDescription.sdp = SDPUtils.getDescription(pc._remoteDescription.sdp) + sections.join('');
                  if (pc.usingBundle) {
                    break;
                  }
                }
              } else {
                var sdpMLineIndex = candidate.sdpMLineIndex;
                if (candidate.sdpMid) {
                  for (var i = 0; i < pc.transceivers.length; i++) {
                    if (pc.transceivers[i].mid === candidate.sdpMid) {
                      sdpMLineIndex = i;
                      break;
                    }
                  }
                }
                var transceiver = pc.transceivers[sdpMLineIndex];
                if (transceiver) {
                  if (transceiver.rejected) {
                    return resolve();
                  }
                  var cand = Object.keys(candidate.candidate).length > 0 ? SDPUtils.parseCandidate(candidate.candidate) : {};
                  // Ignore Chrome's invalid candidates since Edge does not like them.
                  if (cand.protocol === 'tcp' && (cand.port === 0 || cand.port === 9)) {
                    return resolve();
                  }
                  // Ignore RTCP candidates, we assume RTCP-MUX.
                  if (cand.component && cand.component !== 1) {
                    return resolve();
                  }
                  // when using bundle, avoid adding candidates to the wrong
                  // ice transport. And avoid adding candidates added in the SDP.
                  if (sdpMLineIndex === 0 || sdpMLineIndex > 0 && transceiver.iceTransport !== pc.transceivers[0].iceTransport) {
                    if (!maybeAddCandidate(transceiver.iceTransport, cand)) {
                      return reject(makeError('OperationError', 'Can not add ICE candidate'));
                    }
                  }

                  // update the remoteDescription.
                  var candidateString = candidate.candidate.trim();
                  if (candidateString.indexOf('a=') === 0) {
                    candidateString = candidateString.substr(2);
                  }
                  sections = SDPUtils.getMediaSections(pc._remoteDescription.sdp);
                  sections[sdpMLineIndex] += 'a=' + (cand.type ? candidateString : 'end-of-candidates') + '\r\n';
                  pc._remoteDescription.sdp = SDPUtils.getDescription(pc._remoteDescription.sdp) + sections.join('');
                } else {
                  return reject(makeError('OperationError', 'Can not add ICE candidate'));
                }
              }
              resolve();
            });
          };

          RTCPeerConnection.prototype.getStats = function (selector) {
            if (selector && selector instanceof window.MediaStreamTrack) {
              var senderOrReceiver = null;
              this.transceivers.forEach(function (transceiver) {
                if (transceiver.rtpSender && transceiver.rtpSender.track === selector) {
                  senderOrReceiver = transceiver.rtpSender;
                } else if (transceiver.rtpReceiver && transceiver.rtpReceiver.track === selector) {
                  senderOrReceiver = transceiver.rtpReceiver;
                }
              });
              if (!senderOrReceiver) {
                throw makeError('InvalidAccessError', 'Invalid selector.');
              }
              return senderOrReceiver.getStats();
            }

            var promises = [];
            this.transceivers.forEach(function (transceiver) {
              ['rtpSender', 'rtpReceiver', 'iceGatherer', 'iceTransport', 'dtlsTransport'].forEach(function (method) {
                if (transceiver[method]) {
                  promises.push(transceiver[method].getStats());
                }
              });
            });
            return Promise.all(promises).then(function (allStats) {
              var results = new Map();
              allStats.forEach(function (stats) {
                stats.forEach(function (stat) {
                  results.set(stat.id, stat);
                });
              });
              return results;
            });
          };

          // fix low-level stat names and return Map instead of object.
          var ortcObjects = ['RTCRtpSender', 'RTCRtpReceiver', 'RTCIceGatherer', 'RTCIceTransport', 'RTCDtlsTransport'];
          ortcObjects.forEach(function (ortcObjectName) {
            var obj = window[ortcObjectName];
            if (obj && obj.prototype && obj.prototype.getStats) {
              var nativeGetstats = obj.prototype.getStats;
              obj.prototype.getStats = function () {
                return nativeGetstats.apply(this).then(function (nativeStats) {
                  var mapStats = new Map();
                  Object.keys(nativeStats).forEach(function (id) {
                    nativeStats[id].type = fixStatsType(nativeStats[id]);
                    mapStats.set(id, nativeStats[id]);
                  });
                  return mapStats;
                });
              };
            }
          });

          // legacy callback shims. Should be moved to adapter.js some days.
          var methods = ['createOffer', 'createAnswer'];
          methods.forEach(function (method) {
            var nativeMethod = RTCPeerConnection.prototype[method];
            RTCPeerConnection.prototype[method] = function () {
              var args = arguments;
              if (typeof args[0] === 'function' || typeof args[1] === 'function') {
                // legacy
                return nativeMethod.apply(this, [arguments[2]]).then(function (description) {
                  if (typeof args[0] === 'function') {
                    args[0].apply(null, [description]);
                  }
                }, function (error) {
                  if (typeof args[1] === 'function') {
                    args[1].apply(null, [error]);
                  }
                });
              }
              return nativeMethod.apply(this, arguments);
            };
          });

          methods = ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate'];
          methods.forEach(function (method) {
            var nativeMethod = RTCPeerConnection.prototype[method];
            RTCPeerConnection.prototype[method] = function () {
              var args = arguments;
              if (typeof args[1] === 'function' || typeof args[2] === 'function') {
                // legacy
                return nativeMethod.apply(this, arguments).then(function () {
                  if (typeof args[1] === 'function') {
                    args[1].apply(null);
                  }
                }, function (error) {
                  if (typeof args[2] === 'function') {
                    args[2].apply(null, [error]);
                  }
                });
              }
              return nativeMethod.apply(this, arguments);
            };
          });

          // getStats is special. It doesn't have a spec legacy method yet we support
          // getStats(something, cb) without error callbacks.
          ['getStats'].forEach(function (method) {
            var nativeMethod = RTCPeerConnection.prototype[method];
            RTCPeerConnection.prototype[method] = function () {
              var args = arguments;
              if (typeof args[1] === 'function') {
                return nativeMethod.apply(this, arguments).then(function () {
                  if (typeof args[1] === 'function') {
                    args[1].apply(null);
                  }
                });
              }
              return nativeMethod.apply(this, arguments);
            };
          });

          return RTCPeerConnection;
        };
      }, { "sdp": 2 }], 2: [function (require, module, exports) {

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

        // returns the session description.
        SDPUtils.getDescription = function (blob) {
          var sections = SDPUtils.splitSections(blob);
          return sections && sections[0];
        };

        // returns the individual media sections.
        SDPUtils.getMediaSections = function (blob) {
          var sections = SDPUtils.splitSections(blob);
          sections.shift();
          return sections;
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
            component: parseInt(parts[1], 10),
            protocol: parts[2].toLowerCase(),
            priority: parseInt(parts[3], 10),
            ip: parts[4],
            address: parts[4], // address is an alias for ip.
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
              case 'ufrag':
                candidate.ufrag = parts[i + 1]; // for backward compability.
                candidate.usernameFragment = parts[i + 1];
                break;
              default:
                // extension handling, in particular ufrag
                candidate[parts[i]] = parts[i + 1];
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
          sdp.push(candidate.address || candidate.ip);
          sdp.push(candidate.port);

          var type = candidate.type;
          sdp.push('typ');
          sdp.push(type);
          if (type !== 'host' && candidate.relatedAddress && candidate.relatedPort) {
            sdp.push('raddr');
            sdp.push(candidate.relatedAddress);
            sdp.push('rport');
            sdp.push(candidate.relatedPort);
          }
          if (candidate.tcpType && candidate.protocol.toLowerCase() === 'tcp') {
            sdp.push('tcptype');
            sdp.push(candidate.tcpType);
          }
          if (candidate.usernameFragment || candidate.ufrag) {
            sdp.push('ufrag');
            sdp.push(candidate.usernameFragment || candidate.ufrag);
          }
          return 'candidate:' + sdp.join(' ');
        };

        // Parses an ice-options line, returns an array of option tags.
        // a=ice-options:foo bar
        SDPUtils.parseIceOptions = function (line) {
          return line.substr(14).split(' ');
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
          parsed.channels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
          // legacy alias, got renamed back to channels in ORTC.
          parsed.numChannels = parsed.channels;
          return parsed;
        };

        // Generate an a=rtpmap line from RTCRtpCodecCapability or
        // RTCRtpCodecParameters.
        SDPUtils.writeRtpMap = function (codec) {
          var pt = codec.payloadType;
          if (codec.preferredPayloadType !== undefined) {
            pt = codec.preferredPayloadType;
          }
          var channels = codec.channels || codec.numChannels || 1;
          return 'a=rtpmap:' + pt + ' ' + codec.name + '/' + codec.clockRate + (channels !== 1 ? '/' + channels : '') + '\r\n';
        };

        // Parses an a=extmap line (headerextension from RFC 5285). Sample input:
        // a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
        // a=extmap:2/sendonly urn:ietf:params:rtp-hdrext:toffset
        SDPUtils.parseExtmap = function (line) {
          var parts = line.substr(9).split(' ');
          return {
            id: parseInt(parts[0], 10),
            direction: parts[0].indexOf('/') > 0 ? parts[0].split('/')[1] : 'sendrecv',
            uri: parts[1]
          };
        };

        // Generates a=extmap line from RTCRtpHeaderExtensionParameters or
        // RTCRtpHeaderExtension.
        SDPUtils.writeExtmap = function (headerExtension) {
          return 'a=extmap:' + (headerExtension.id || headerExtension.preferredId) + (headerExtension.direction && headerExtension.direction !== 'sendrecv' ? '/' + headerExtension.direction : '') + ' ' + headerExtension.uri + '\r\n';
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
              if (codec.parameters[param]) {
                params.push(param + '=' + codec.parameters[param]);
              } else {
                params.push(param);
              }
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
              lines += 'a=rtcp-fb:' + pt + ' ' + fb.type + (fb.parameter && fb.parameter.length ? ' ' + fb.parameter : '') + '\r\n';
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

        SDPUtils.parseSsrcGroup = function (line) {
          var parts = line.substr(13).split(' ');
          return {
            semantics: parts.shift(),
            ssrcs: parts.map(function (ssrc) {
              return parseInt(ssrc, 10);
            })
          };
        };

        // Extracts the MID (RFC 5888) from a media section.
        // returns the MID or undefined if no mid line was found.
        SDPUtils.getMid = function (mediaSection) {
          var mid = SDPUtils.matchPrefix(mediaSection, 'a=mid:')[0];
          if (mid) {
            return mid.substr(6);
          }
        };

        SDPUtils.parseFingerprint = function (line) {
          var parts = line.substr(14).split(' ');
          return {
            algorithm: parts[0].toLowerCase(), // algorithm is case-sensitive in Edge.
            value: parts[1]
          };
        };

        // Extracts DTLS parameters from SDP media section or sessionpart.
        // FIXME: for consistency with other functions this should only
        //   get the fingerprint line as input. See also getIceParameters.
        SDPUtils.getDtlsParameters = function (mediaSection, sessionpart) {
          var lines = SDPUtils.matchPrefix(mediaSection + sessionpart, 'a=fingerprint:');
          // Note: a=setup line is ignored since we use the 'auto' role.
          // Note2: 'algorithm' is not case sensitive except in Edge.
          return {
            role: 'auto',
            fingerprints: lines.map(SDPUtils.parseFingerprint)
          };
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
          var maxptime = 0;
          caps.codecs.forEach(function (codec) {
            if (codec.maxptime > maxptime) {
              maxptime = codec.maxptime;
            }
          });
          if (maxptime > 0) {
            sdp += 'a=maxptime:' + maxptime + '\r\n';
          }
          sdp += 'a=rtcp-mux\r\n';

          if (caps.headerExtensions) {
            caps.headerExtensions.forEach(function (extension) {
              sdp += SDPUtils.writeExtmap(extension);
            });
          }
          // FIXME: write fecMechanisms.
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
            var parts = line.substr(17).split(' ');
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
                codecPayloadType: parseInt(codec.parameters.apt, 10)
              };
              if (primarySsrc && secondarySsrc) {
                encParam.rtx = { ssrc: secondarySsrc };
              }
              encodingParameters.push(encParam);
              if (hasRed) {
                encParam = JSON.parse(JSON.stringify(encParam));
                encParam.fec = {
                  ssrc: primarySsrc,
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
              // use formula from JSEP to convert b=AS to TIAS value.
              bandwidth = parseInt(bandwidth[0].substr(5), 10) * 1000 * 0.95 - 50 * 40 * 8;
            } else {
              bandwidth = undefined;
            }
            encodingParameters.forEach(function (params) {
              params.maxBitrate = bandwidth;
            });
          }
          return encodingParameters;
        };

        // parses http://draft.ortc.org/#rtcrtcpparameters*
        SDPUtils.parseRtcpParameters = function (mediaSection) {
          var rtcpParameters = {};

          // Gets the first SSRC. Note tha with RTX there might be multiple
          // SSRCs.
          var remoteSsrc = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:').map(function (line) {
            return SDPUtils.parseSsrcMedia(line);
          }).filter(function (obj) {
            return obj.attribute === 'cname';
          })[0];
          if (remoteSsrc) {
            rtcpParameters.cname = remoteSsrc.value;
            rtcpParameters.ssrc = remoteSsrc.ssrc;
          }

          // Edge uses the compound attribute instead of reducedSize
          // compound is !reducedSize
          var rsize = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-rsize');
          rtcpParameters.reducedSize = rsize.length > 0;
          rtcpParameters.compound = rsize.length === 0;

          // parses the rtcp-mux attrіbute.
          // Note that Edge does not support unmuxed RTCP.
          var mux = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-mux');
          rtcpParameters.mux = mux.length > 0;

          return rtcpParameters;
        };

        // parses either a=msid: or a=ssrc:... msid lines and returns
        // the id of the MediaStream and MediaStreamTrack.
        SDPUtils.parseMsid = function (mediaSection) {
          var parts;
          var spec = SDPUtils.matchPrefix(mediaSection, 'a=msid:');
          if (spec.length === 1) {
            parts = spec[0].substr(7).split(' ');
            return { stream: parts[0], track: parts[1] };
          }
          var planB = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:').map(function (line) {
            return SDPUtils.parseSsrcMedia(line);
          }).filter(function (msidParts) {
            return msidParts.attribute === 'msid';
          });
          if (planB.length > 0) {
            parts = planB[0].value.split(' ');
            return { stream: parts[0], track: parts[1] };
          }
        };

        // Generate a session ID for SDP.
        // https://tools.ietf.org/html/draft-ietf-rtcweb-jsep-20#section-5.2.1
        // recommends using a cryptographically random +ve 64-bit value
        // but right now this should be acceptable and within the right range
        SDPUtils.generateSessionId = function () {
          return Math.random().toString().substr(2, 21);
        };

        // Write boilder plate for start of SDP
        // sessId argument is optional - if not supplied it will
        // be generated randomly
        // sessVersion is optional and defaults to 2
        // sessUser is optional and defaults to 'thisisadapterortc'
        SDPUtils.writeSessionBoilerplate = function (sessId, sessVer, sessUser) {
          var sessionId;
          var version = sessVer !== undefined ? sessVer : 2;
          if (sessId) {
            sessionId = sessId;
          } else {
            sessionId = SDPUtils.generateSessionId();
          }
          var user = sessUser || 'thisisadapterortc';
          // FIXME: sess-id should be an NTP timestamp.
          return 'v=0\r\n' + 'o=' + user + ' ' + sessionId + ' ' + version + ' IN IP4 127.0.0.1\r\n' + 's=-\r\n' + 't=0 0\r\n';
        };

        SDPUtils.writeMediaSection = function (transceiver, caps, type, stream) {
          var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);

          // Map ICE parameters (ufrag, pwd) to SDP.
          sdp += SDPUtils.writeIceParameters(transceiver.iceGatherer.getLocalParameters());

          // Map DTLS parameters to SDP.
          sdp += SDPUtils.writeDtlsParameters(transceiver.dtlsTransport.getLocalParameters(), type === 'offer' ? 'actpass' : 'active');

          sdp += 'a=mid:' + transceiver.mid + '\r\n';

          if (transceiver.direction) {
            sdp += 'a=' + transceiver.direction + '\r\n';
          } else if (transceiver.rtpSender && transceiver.rtpReceiver) {
            sdp += 'a=sendrecv\r\n';
          } else if (transceiver.rtpSender) {
            sdp += 'a=sendonly\r\n';
          } else if (transceiver.rtpReceiver) {
            sdp += 'a=recvonly\r\n';
          } else {
            sdp += 'a=inactive\r\n';
          }

          if (transceiver.rtpSender) {
            // spec.
            var msid = 'msid:' + stream.id + ' ' + transceiver.rtpSender.track.id + '\r\n';
            sdp += 'a=' + msid;

            // for Chrome.
            sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc + ' ' + msid;
            if (transceiver.sendEncodingParameters[0].rtx) {
              sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc + ' ' + msid;
              sdp += 'a=ssrc-group:FID ' + transceiver.sendEncodingParameters[0].ssrc + ' ' + transceiver.sendEncodingParameters[0].rtx.ssrc + '\r\n';
            }
          }
          // FIXME: this should be written by writeRtpDescription.
          sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc + ' cname:' + SDPUtils.localCName + '\r\n';
          if (transceiver.rtpSender && transceiver.sendEncodingParameters[0].rtx) {
            sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc + ' cname:' + SDPUtils.localCName + '\r\n';
          }
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

        SDPUtils.getKind = function (mediaSection) {
          var lines = SDPUtils.splitLines(mediaSection);
          var mline = lines[0].split(' ');
          return mline[0].substr(2);
        };

        SDPUtils.isRejected = function (mediaSection) {
          return mediaSection.split(' ', 2)[1] === '0';
        };

        SDPUtils.parseMLine = function (mediaSection) {
          var lines = SDPUtils.splitLines(mediaSection);
          var parts = lines[0].substr(2).split(' ');
          return {
            kind: parts[0],
            port: parseInt(parts[1], 10),
            protocol: parts[2],
            fmt: parts.slice(3).join(' ')
          };
        };

        SDPUtils.parseOLine = function (mediaSection) {
          var line = SDPUtils.matchPrefix(mediaSection, 'o=')[0];
          var parts = line.substr(2).split(' ');
          return {
            username: parts[0],
            sessionId: parts[1],
            sessionVersion: parseInt(parts[2], 10),
            netType: parts[3],
            addressType: parts[4],
            address: parts[5]
          };
        };

        // a very naive interpretation of a valid SDP.
        SDPUtils.isValidSDP = function (blob) {
          if (typeof blob !== 'string' || blob.length === 0) {
            return false;
          }
          var lines = SDPUtils.splitLines(blob);
          for (var i = 0; i < lines.length; i++) {
            if (lines[i].length < 2 || lines[i].charAt(1) !== '=') {
              return false;
            }
            // TODO: check the modifier a bit more.
          }
          return true;
        };

        // Expose public methods.
        if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === 'object') {
          module.exports = SDPUtils;
        }
      }, {}], 3: [function (require, module, exports) {
        (function (global) {

          var adapterFactory = require('./adapter_factory.js');
          module.exports = adapterFactory({ window: global.window });
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
      }, { "./adapter_factory.js": 4 }], 4: [function (require, module, exports) {

        var utils = require('./utils');
        // Shimming starts here.
        module.exports = function (dependencies, opts) {
          var window = dependencies && dependencies.window;

          var options = {
            shimChrome: true,
            shimFirefox: true,
            shimEdge: true,
            shimSafari: true
          };

          for (var key in opts) {
            if (hasOwnProperty.call(opts, key)) {
              options[key] = opts[key];
            }
          }

          // Utils.
          var logging = utils.log;
          var browserDetails = utils.detectBrowser(window);

          // Uncomment the line below if you want logging to occur, including logging
          // for the switch statement below. Can also be turned on in the browser via
          // adapter.disableLog(false), but then logging from the switch statement below
          // will not appear.
          // require('./utils').disableLog(false);

          // Browser shims.
          var chromeShim = require('./chrome/chrome_shim') || null;
          var edgeShim = require('./edge/edge_shim') || null;
          var firefoxShim = require('./firefox/firefox_shim') || null;
          var safariShim = require('./safari/safari_shim') || null;
          var commonShim = require('./common_shim') || null;

          // Export to the adapter global object visible in the browser.
          var adapter = {
            browserDetails: browserDetails,
            commonShim: commonShim,
            extractVersion: utils.extractVersion,
            disableLog: utils.disableLog,
            disableWarnings: utils.disableWarnings
          };

          // Shim browser if found.
          switch (browserDetails.browser) {
            case 'chrome':
              if (!chromeShim || !chromeShim.shimPeerConnection || !options.shimChrome) {
                logging('Chrome shim is not included in this adapter release.');
                return adapter;
              }
              logging('adapter.js shimming chrome.');
              // Export to the adapter global object visible in the browser.
              adapter.browserShim = chromeShim;
              commonShim.shimCreateObjectURL(window);

              chromeShim.shimGetUserMedia(window);
              chromeShim.shimMediaStream(window);
              chromeShim.shimSourceObject(window);
              chromeShim.shimPeerConnection(window);
              chromeShim.shimOnTrack(window);
              chromeShim.shimAddTrackRemoveTrack(window);
              chromeShim.shimGetSendersWithDtmf(window);
              chromeShim.shimSenderReceiverGetStats(window);
              chromeShim.fixNegotiationNeeded(window);

              commonShim.shimRTCIceCandidate(window);
              commonShim.shimMaxMessageSize(window);
              commonShim.shimSendThrowTypeError(window);
              break;
            case 'firefox':
              if (!firefoxShim || !firefoxShim.shimPeerConnection || !options.shimFirefox) {
                logging('Firefox shim is not included in this adapter release.');
                return adapter;
              }
              logging('adapter.js shimming firefox.');
              // Export to the adapter global object visible in the browser.
              adapter.browserShim = firefoxShim;
              commonShim.shimCreateObjectURL(window);

              firefoxShim.shimGetUserMedia(window);
              firefoxShim.shimSourceObject(window);
              firefoxShim.shimPeerConnection(window);
              firefoxShim.shimOnTrack(window);
              firefoxShim.shimRemoveStream(window);
              firefoxShim.shimSenderGetStats(window);
              firefoxShim.shimReceiverGetStats(window);
              firefoxShim.shimRTCDataChannel(window);

              commonShim.shimRTCIceCandidate(window);
              commonShim.shimMaxMessageSize(window);
              commonShim.shimSendThrowTypeError(window);
              break;
            case 'edge':
              if (!edgeShim || !edgeShim.shimPeerConnection || !options.shimEdge) {
                logging('MS edge shim is not included in this adapter release.');
                return adapter;
              }
              logging('adapter.js shimming edge.');
              // Export to the adapter global object visible in the browser.
              adapter.browserShim = edgeShim;
              commonShim.shimCreateObjectURL(window);

              edgeShim.shimGetUserMedia(window);
              edgeShim.shimPeerConnection(window);
              edgeShim.shimReplaceTrack(window);
              edgeShim.shimGetDisplayMedia(window);

              // the edge shim implements the full RTCIceCandidate object.

              commonShim.shimMaxMessageSize(window);
              commonShim.shimSendThrowTypeError(window);
              break;
            case 'safari':
              if (!safariShim || !options.shimSafari) {
                logging('Safari shim is not included in this adapter release.');
                return adapter;
              }
              logging('adapter.js shimming safari.');
              // Export to the adapter global object visible in the browser.
              adapter.browserShim = safariShim;
              commonShim.shimCreateObjectURL(window);

              safariShim.shimRTCIceServerUrls(window);
              safariShim.shimCreateOfferLegacy(window);
              safariShim.shimCallbacksAPI(window);
              safariShim.shimLocalStreamsAPI(window);
              safariShim.shimRemoteStreamsAPI(window);
              safariShim.shimTrackEventTransceiver(window);
              safariShim.shimGetUserMedia(window);

              commonShim.shimRTCIceCandidate(window);
              commonShim.shimMaxMessageSize(window);
              commonShim.shimSendThrowTypeError(window);
              break;
            default:
              logging('Unsupported browser!');
              break;
          }

          return adapter;
        };
      }, { "./chrome/chrome_shim": 5, "./common_shim": 7, "./edge/edge_shim": 8, "./firefox/firefox_shim": 11, "./safari/safari_shim": 13, "./utils": 14 }], 5: [function (require, module, exports) {

        var utils = require('../utils.js');
        var logging = utils.log;

        /* iterates the stats graph recursively. */
        function walkStats(stats, base, resultSet) {
          if (!base || resultSet.has(base.id)) {
            return;
          }
          resultSet.set(base.id, base);
          Object.keys(base).forEach(function (name) {
            if (name.endsWith('Id')) {
              walkStats(stats, stats.get(base[name]), resultSet);
            } else if (name.endsWith('Ids')) {
              base[name].forEach(function (id) {
                walkStats(stats, stats.get(id), resultSet);
              });
            }
          });
        }

        /* filter getStats for a sender/receiver track. */
        function filterStats(result, track, outbound) {
          var streamStatsType = outbound ? 'outbound-rtp' : 'inbound-rtp';
          var filteredResult = new Map();
          if (track === null) {
            return filteredResult;
          }
          var trackStats = [];
          result.forEach(function (value) {
            if (value.type === 'track' && value.trackIdentifier === track.id) {
              trackStats.push(value);
            }
          });
          trackStats.forEach(function (trackStat) {
            result.forEach(function (stats) {
              if (stats.type === streamStatsType && stats.trackId === trackStat.id) {
                walkStats(result, stats, filteredResult);
              }
            });
          });
          return filteredResult;
        }

        module.exports = {
          shimGetUserMedia: require('./getusermedia'),
          shimMediaStream: function shimMediaStream(window) {
            window.MediaStream = window.MediaStream || window.webkitMediaStream;
          },

          shimOnTrack: function shimOnTrack(window) {
            if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object' && window.RTCPeerConnection && !('ontrack' in window.RTCPeerConnection.prototype)) {
              Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
                get: function get$$1() {
                  return this._ontrack;
                },
                set: function set$$1(f) {
                  if (this._ontrack) {
                    this.removeEventListener('track', this._ontrack);
                  }
                  this.addEventListener('track', this._ontrack = f);
                },
                enumerable: true,
                configurable: true
              });
              var origSetRemoteDescription = window.RTCPeerConnection.prototype.setRemoteDescription;
              window.RTCPeerConnection.prototype.setRemoteDescription = function () {
                var pc = this;
                if (!pc._ontrackpoly) {
                  pc._ontrackpoly = function (e) {
                    // onaddstream does not fire when a track is added to an existing
                    // stream. But stream.onaddtrack is implemented so we use that.
                    e.stream.addEventListener('addtrack', function (te) {
                      var receiver;
                      if (window.RTCPeerConnection.prototype.getReceivers) {
                        receiver = pc.getReceivers().find(function (r) {
                          return r.track && r.track.id === te.track.id;
                        });
                      } else {
                        receiver = { track: te.track };
                      }

                      var event = new Event('track');
                      event.track = te.track;
                      event.receiver = receiver;
                      event.transceiver = { receiver: receiver };
                      event.streams = [e.stream];
                      pc.dispatchEvent(event);
                    });
                    e.stream.getTracks().forEach(function (track) {
                      var receiver;
                      if (window.RTCPeerConnection.prototype.getReceivers) {
                        receiver = pc.getReceivers().find(function (r) {
                          return r.track && r.track.id === track.id;
                        });
                      } else {
                        receiver = { track: track };
                      }
                      var event = new Event('track');
                      event.track = track;
                      event.receiver = receiver;
                      event.transceiver = { receiver: receiver };
                      event.streams = [e.stream];
                      pc.dispatchEvent(event);
                    });
                  };
                  pc.addEventListener('addstream', pc._ontrackpoly);
                }
                return origSetRemoteDescription.apply(pc, arguments);
              };
            } else {
              // even if RTCRtpTransceiver is in window, it is only used and
              // emitted in unified-plan. Unfortunately this means we need
              // to unconditionally wrap the event.
              utils.wrapPeerConnectionEvent(window, 'track', function (e) {
                if (!e.transceiver) {
                  Object.defineProperty(e, 'transceiver', { value: { receiver: e.receiver } });
                }
                return e;
              });
            }
          },

          shimGetSendersWithDtmf: function shimGetSendersWithDtmf(window) {
            // Overrides addTrack/removeTrack, depends on shimAddTrackRemoveTrack.
            if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object' && window.RTCPeerConnection && !('getSenders' in window.RTCPeerConnection.prototype) && 'createDTMFSender' in window.RTCPeerConnection.prototype) {
              var shimSenderWithDtmf = function shimSenderWithDtmf(pc, track) {
                return {
                  track: track,
                  get dtmf() {
                    if (this._dtmf === undefined) {
                      if (track.kind === 'audio') {
                        this._dtmf = pc.createDTMFSender(track);
                      } else {
                        this._dtmf = null;
                      }
                    }
                    return this._dtmf;
                  },
                  _pc: pc
                };
              };

              // augment addTrack when getSenders is not available.
              if (!window.RTCPeerConnection.prototype.getSenders) {
                window.RTCPeerConnection.prototype.getSenders = function () {
                  this._senders = this._senders || [];
                  return this._senders.slice(); // return a copy of the internal state.
                };
                var origAddTrack = window.RTCPeerConnection.prototype.addTrack;
                window.RTCPeerConnection.prototype.addTrack = function (track, stream) {
                  var pc = this;
                  var sender = origAddTrack.apply(pc, arguments);
                  if (!sender) {
                    sender = shimSenderWithDtmf(pc, track);
                    pc._senders.push(sender);
                  }
                  return sender;
                };

                var origRemoveTrack = window.RTCPeerConnection.prototype.removeTrack;
                window.RTCPeerConnection.prototype.removeTrack = function (sender) {
                  var pc = this;
                  origRemoveTrack.apply(pc, arguments);
                  var idx = pc._senders.indexOf(sender);
                  if (idx !== -1) {
                    pc._senders.splice(idx, 1);
                  }
                };
              }
              var origAddStream = window.RTCPeerConnection.prototype.addStream;
              window.RTCPeerConnection.prototype.addStream = function (stream) {
                var pc = this;
                pc._senders = pc._senders || [];
                origAddStream.apply(pc, [stream]);
                stream.getTracks().forEach(function (track) {
                  pc._senders.push(shimSenderWithDtmf(pc, track));
                });
              };

              var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
              window.RTCPeerConnection.prototype.removeStream = function (stream) {
                var pc = this;
                pc._senders = pc._senders || [];
                origRemoveStream.apply(pc, [stream]);

                stream.getTracks().forEach(function (track) {
                  var sender = pc._senders.find(function (s) {
                    return s.track === track;
                  });
                  if (sender) {
                    pc._senders.splice(pc._senders.indexOf(sender), 1); // remove sender
                  }
                });
              };
            } else if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object' && window.RTCPeerConnection && 'getSenders' in window.RTCPeerConnection.prototype && 'createDTMFSender' in window.RTCPeerConnection.prototype && window.RTCRtpSender && !('dtmf' in window.RTCRtpSender.prototype)) {
              var origGetSenders = window.RTCPeerConnection.prototype.getSenders;
              window.RTCPeerConnection.prototype.getSenders = function () {
                var pc = this;
                var senders = origGetSenders.apply(pc, []);
                senders.forEach(function (sender) {
                  sender._pc = pc;
                });
                return senders;
              };

              Object.defineProperty(window.RTCRtpSender.prototype, 'dtmf', {
                get: function get$$1() {
                  if (this._dtmf === undefined) {
                    if (this.track.kind === 'audio') {
                      this._dtmf = this._pc.createDTMFSender(this.track);
                    } else {
                      this._dtmf = null;
                    }
                  }
                  return this._dtmf;
                }
              });
            }
          },

          shimSenderReceiverGetStats: function shimSenderReceiverGetStats(window) {
            if (!((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object' && window.RTCPeerConnection && window.RTCRtpSender && window.RTCRtpReceiver)) {
              return;
            }

            // shim sender stats.
            if (!('getStats' in window.RTCRtpSender.prototype)) {
              var origGetSenders = window.RTCPeerConnection.prototype.getSenders;
              if (origGetSenders) {
                window.RTCPeerConnection.prototype.getSenders = function () {
                  var pc = this;
                  var senders = origGetSenders.apply(pc, []);
                  senders.forEach(function (sender) {
                    sender._pc = pc;
                  });
                  return senders;
                };
              }

              var origAddTrack = window.RTCPeerConnection.prototype.addTrack;
              if (origAddTrack) {
                window.RTCPeerConnection.prototype.addTrack = function () {
                  var sender = origAddTrack.apply(this, arguments);
                  sender._pc = this;
                  return sender;
                };
              }
              window.RTCRtpSender.prototype.getStats = function () {
                var sender = this;
                return this._pc.getStats().then(function (result) {
                  /* Note: this will include stats of all senders that
                   *   send a track with the same id as sender.track as
                   *   it is not possible to identify the RTCRtpSender.
                   */
                  return filterStats(result, sender.track, true);
                });
              };
            }

            // shim receiver stats.
            if (!('getStats' in window.RTCRtpReceiver.prototype)) {
              var origGetReceivers = window.RTCPeerConnection.prototype.getReceivers;
              if (origGetReceivers) {
                window.RTCPeerConnection.prototype.getReceivers = function () {
                  var pc = this;
                  var receivers = origGetReceivers.apply(pc, []);
                  receivers.forEach(function (receiver) {
                    receiver._pc = pc;
                  });
                  return receivers;
                };
              }
              utils.wrapPeerConnectionEvent(window, 'track', function (e) {
                e.receiver._pc = e.srcElement;
                return e;
              });
              window.RTCRtpReceiver.prototype.getStats = function () {
                var receiver = this;
                return this._pc.getStats().then(function (result) {
                  return filterStats(result, receiver.track, false);
                });
              };
            }

            if (!('getStats' in window.RTCRtpSender.prototype && 'getStats' in window.RTCRtpReceiver.prototype)) {
              return;
            }

            // shim RTCPeerConnection.getStats(track).
            var origGetStats = window.RTCPeerConnection.prototype.getStats;
            window.RTCPeerConnection.prototype.getStats = function () {
              var pc = this;
              if (arguments.length > 0 && arguments[0] instanceof window.MediaStreamTrack) {
                var track = arguments[0];
                var sender;
                var receiver;
                var err;
                pc.getSenders().forEach(function (s) {
                  if (s.track === track) {
                    if (sender) {
                      err = true;
                    } else {
                      sender = s;
                    }
                  }
                });
                pc.getReceivers().forEach(function (r) {
                  if (r.track === track) {
                    if (receiver) {
                      err = true;
                    } else {
                      receiver = r;
                    }
                  }
                  return r.track === track;
                });
                if (err || sender && receiver) {
                  return Promise.reject(new DOMException('There are more than one sender or receiver for the track.', 'InvalidAccessError'));
                } else if (sender) {
                  return sender.getStats();
                } else if (receiver) {
                  return receiver.getStats();
                }
                return Promise.reject(new DOMException('There is no sender or receiver for the track.', 'InvalidAccessError'));
              }
              return origGetStats.apply(pc, arguments);
            };
          },

          shimSourceObject: function shimSourceObject(window) {
            var URL = window && window.URL;

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
                      return undefined;
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

          shimAddTrackRemoveTrackWithNative: function shimAddTrackRemoveTrackWithNative(window) {
            // shim addTrack/removeTrack with native variants in order to make
            // the interactions with legacy getLocalStreams behave as in other browsers.
            // Keeps a mapping stream.id => [stream, rtpsenders...]
            window.RTCPeerConnection.prototype.getLocalStreams = function () {
              var pc = this;
              this._shimmedLocalStreams = this._shimmedLocalStreams || {};
              return Object.keys(this._shimmedLocalStreams).map(function (streamId) {
                return pc._shimmedLocalStreams[streamId][0];
              });
            };

            var origAddTrack = window.RTCPeerConnection.prototype.addTrack;
            window.RTCPeerConnection.prototype.addTrack = function (track, stream) {
              if (!stream) {
                return origAddTrack.apply(this, arguments);
              }
              this._shimmedLocalStreams = this._shimmedLocalStreams || {};

              var sender = origAddTrack.apply(this, arguments);
              if (!this._shimmedLocalStreams[stream.id]) {
                this._shimmedLocalStreams[stream.id] = [stream, sender];
              } else if (this._shimmedLocalStreams[stream.id].indexOf(sender) === -1) {
                this._shimmedLocalStreams[stream.id].push(sender);
              }
              return sender;
            };

            var origAddStream = window.RTCPeerConnection.prototype.addStream;
            window.RTCPeerConnection.prototype.addStream = function (stream) {
              var pc = this;
              this._shimmedLocalStreams = this._shimmedLocalStreams || {};

              stream.getTracks().forEach(function (track) {
                var alreadyExists = pc.getSenders().find(function (s) {
                  return s.track === track;
                });
                if (alreadyExists) {
                  // throw new DOMException('Track already exists.', 'InvalidAccessError');
                }
              });
              var existingSenders = pc.getSenders();
              origAddStream.apply(this, arguments);
              var newSenders = pc.getSenders().filter(function (newSender) {
                return existingSenders.indexOf(newSender) === -1;
              });
              this._shimmedLocalStreams[stream.id] = [stream].concat(newSenders);
            };

            var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
            window.RTCPeerConnection.prototype.removeStream = function (stream) {
              this._shimmedLocalStreams = this._shimmedLocalStreams || {};
              delete this._shimmedLocalStreams[stream.id];
              return origRemoveStream.apply(this, arguments);
            };

            var origRemoveTrack = window.RTCPeerConnection.prototype.removeTrack;
            window.RTCPeerConnection.prototype.removeTrack = function (sender) {
              var pc = this;
              this._shimmedLocalStreams = this._shimmedLocalStreams || {};
              if (sender) {
                Object.keys(this._shimmedLocalStreams).forEach(function (streamId) {
                  var idx = pc._shimmedLocalStreams[streamId].indexOf(sender);
                  if (idx !== -1) {
                    pc._shimmedLocalStreams[streamId].splice(idx, 1);
                  }
                  if (pc._shimmedLocalStreams[streamId].length === 1) {
                    delete pc._shimmedLocalStreams[streamId];
                  }
                });
              }
              return origRemoveTrack.apply(this, arguments);
            };
          },

          shimAddTrackRemoveTrack: function shimAddTrackRemoveTrack(window) {
            if (!window.RTCPeerConnection) {
              return;
            }
            var browserDetails = utils.detectBrowser(window);
            // shim addTrack and removeTrack.
            if (window.RTCPeerConnection.prototype.addTrack && browserDetails.version >= 65) {
              return this.shimAddTrackRemoveTrackWithNative(window);
            }

            // also shim pc.getLocalStreams when addTrack is shimmed
            // to return the original streams.
            var origGetLocalStreams = window.RTCPeerConnection.prototype.getLocalStreams;
            window.RTCPeerConnection.prototype.getLocalStreams = function () {
              var pc = this;
              var nativeStreams = origGetLocalStreams.apply(this);
              pc._reverseStreams = pc._reverseStreams || {};
              return nativeStreams.map(function (stream) {
                return pc._reverseStreams[stream.id];
              });
            };

            var origAddStream = window.RTCPeerConnection.prototype.addStream;
            window.RTCPeerConnection.prototype.addStream = function (stream) {
              var pc = this;
              pc._streams = pc._streams || {};
              pc._reverseStreams = pc._reverseStreams || {};

              stream.getTracks().forEach(function (track) {
                var alreadyExists = pc.getSenders().find(function (s) {
                  return s.track === track;
                });
                if (alreadyExists) {
                  // throw new DOMException('Track already exists.', 'InvalidAccessError');
                }
              });
              // Add identity mapping for consistency with addTrack.
              // Unless this is being used with a stream from addTrack.
              if (!pc._reverseStreams[stream.id]) {
                var newStream = new window.MediaStream(stream.getTracks());
                pc._streams[stream.id] = newStream;
                pc._reverseStreams[newStream.id] = stream;
                stream = newStream;
              }
              origAddStream.apply(pc, [stream]);
            };

            var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
            window.RTCPeerConnection.prototype.removeStream = function (stream) {
              var pc = this;
              pc._streams = pc._streams || {};
              pc._reverseStreams = pc._reverseStreams || {};

              origRemoveStream.apply(pc, [pc._streams[stream.id] || stream]);
              delete pc._reverseStreams[pc._streams[stream.id] ? pc._streams[stream.id].id : stream.id];
              delete pc._streams[stream.id];
            };

            window.RTCPeerConnection.prototype.addTrack = function (track, stream) {
              var pc = this;
              if (pc.signalingState === 'closed') {
                throw new DOMException('The RTCPeerConnection\'s signalingState is \'closed\'.', 'InvalidStateError');
              }
              var streams = [].slice.call(arguments, 1);
              if (streams.length !== 1 || !streams[0].getTracks().find(function (t) {
                return t === track;
              })) {
                // this is not fully correct but all we can manage without
                // [[associated MediaStreams]] internal slot.
                throw new DOMException('The adapter.js addTrack polyfill only supports a single ' + ' stream which is associated with the specified track.', 'NotSupportedError');
              }

              var alreadyExists = pc.getSenders().find(function (s) {
                return s.track === track;
              });
              if (alreadyExists) {
                // throw new DOMException('Track already exists.', 'InvalidAccessError');
              }

              pc._streams = pc._streams || {};
              pc._reverseStreams = pc._reverseStreams || {};
              var oldStream = pc._streams[stream.id];
              if (oldStream) {
                // this is using odd Chrome behaviour, use with caution:
                // https://bugs.chromium.org/p/webrtc/issues/detail?id=7815
                // Note: we rely on the high-level addTrack/dtmf shim to
                // create the sender with a dtmf sender.
                oldStream.addTrack(track);

                // Trigger ONN async.
                Promise.resolve().then(function () {
                  pc.dispatchEvent(new Event('negotiationneeded'));
                });
              } else {
                var newStream = new window.MediaStream([track]);
                pc._streams[stream.id] = newStream;
                pc._reverseStreams[newStream.id] = stream;
                pc.addStream(newStream);
              }
              return pc.getSenders().find(function (s) {
                return s.track === track;
              });
            };

            // replace the internal stream id with the external one and
            // vice versa.
            function replaceInternalStreamId(pc, description) {
              var sdp = description.sdp;
              Object.keys(pc._reverseStreams || []).forEach(function (internalId) {
                var externalStream = pc._reverseStreams[internalId];
                var internalStream = pc._streams[externalStream.id];
                sdp = sdp.replace(new RegExp(internalStream.id, 'g'), externalStream.id);
              });
              return new RTCSessionDescription({
                type: description.type,
                sdp: sdp
              });
            }
            function replaceExternalStreamId(pc, description) {
              var sdp = description.sdp;
              Object.keys(pc._reverseStreams || []).forEach(function (internalId) {
                var externalStream = pc._reverseStreams[internalId];
                var internalStream = pc._streams[externalStream.id];
                sdp = sdp.replace(new RegExp(externalStream.id, 'g'), internalStream.id);
              });
              return new RTCSessionDescription({
                type: description.type,
                sdp: sdp
              });
            }
            ['createOffer', 'createAnswer'].forEach(function (method) {
              var nativeMethod = window.RTCPeerConnection.prototype[method];
              window.RTCPeerConnection.prototype[method] = function () {
                var pc = this;
                var args = arguments;
                var isLegacyCall = arguments.length && typeof arguments[0] === 'function';
                if (isLegacyCall) {
                  return nativeMethod.apply(pc, [function (description) {
                    var desc = replaceInternalStreamId(pc, description);
                    args[0].apply(null, [desc]);
                  }, function (err) {
                    if (args[1]) {
                      args[1].apply(null, err);
                    }
                  }, arguments[2]]);
                }
                return nativeMethod.apply(pc, arguments).then(function (description) {
                  return replaceInternalStreamId(pc, description);
                });
              };
            });

            var origSetLocalDescription = window.RTCPeerConnection.prototype.setLocalDescription;
            window.RTCPeerConnection.prototype.setLocalDescription = function () {
              var pc = this;
              if (!arguments.length || !arguments[0].type) {
                return origSetLocalDescription.apply(pc, arguments);
              }
              arguments[0] = replaceExternalStreamId(pc, arguments[0]);
              return origSetLocalDescription.apply(pc, arguments);
            };

            // TODO: mangle getStats: https://w3c.github.io/webrtc-stats/#dom-rtcmediastreamstats-streamidentifier

            var origLocalDescription = Object.getOwnPropertyDescriptor(window.RTCPeerConnection.prototype, 'localDescription');
            Object.defineProperty(window.RTCPeerConnection.prototype, 'localDescription', {
              get: function get$$1() {
                var pc = this;
                var description = origLocalDescription.get.apply(this);
                if (description.type === '') {
                  return description;
                }
                return replaceInternalStreamId(pc, description);
              }
            });

            window.RTCPeerConnection.prototype.removeTrack = function (sender) {
              var pc = this;
              if (pc.signalingState === 'closed') {
                throw new DOMException('The RTCPeerConnection\'s signalingState is \'closed\'.', 'InvalidStateError');
              }
              // We can not yet check for sender instanceof RTCRtpSender
              // since we shim RTPSender. So we check if sender._pc is set.
              if (!sender._pc) {
                throw new DOMException('Argument 1 of RTCPeerConnection.removeTrack ' + 'does not implement interface RTCRtpSender.', 'TypeError');
              }
              var isLocal = sender._pc === pc;
              if (!isLocal) {
                throw new DOMException('Sender was not created by this connection.', 'InvalidAccessError');
              }

              // Search for the native stream the senders track belongs to.
              pc._streams = pc._streams || {};
              var stream;
              Object.keys(pc._streams).forEach(function (streamid) {
                var hasTrack = pc._streams[streamid].getTracks().find(function (track) {
                  return sender.track === track;
                });
                if (hasTrack) {
                  stream = pc._streams[streamid];
                }
              });

              if (stream) {
                if (stream.getTracks().length === 1) {
                  // if this is the last track of the stream, remove the stream. This
                  // takes care of any shimmed _senders.
                  pc.removeStream(pc._reverseStreams[stream.id]);
                } else {
                  // relying on the same odd chrome behaviour as above.
                  stream.removeTrack(sender.track);
                }
                pc.dispatchEvent(new Event('negotiationneeded'));
              }
            };
          },

          shimPeerConnection: function shimPeerConnection(window) {
            var browserDetails = utils.detectBrowser(window);

            // The RTCPeerConnection object.
            if (!window.RTCPeerConnection && window.webkitRTCPeerConnection) {
              window.RTCPeerConnection = function (pcConfig, pcConstraints) {
                // Translate iceTransportPolicy to iceTransports,
                // see https://code.google.com/p/webrtc/issues/detail?id=4869
                // this was fixed in M56 along with unprefixing RTCPeerConnection.
                logging('PeerConnection');
                if (pcConfig && pcConfig.iceTransportPolicy) {
                  pcConfig.iceTransports = pcConfig.iceTransportPolicy;
                }

                return new window.webkitRTCPeerConnection(pcConfig, pcConstraints);
              };
              window.RTCPeerConnection.prototype = window.webkitRTCPeerConnection.prototype;
              // wrap static methods. Currently just generateCertificate.
              if (window.webkitRTCPeerConnection.generateCertificate) {
                Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
                  get: function get$$1() {
                    return window.webkitRTCPeerConnection.generateCertificate;
                  }
                });
              }
            }
            if (!window.RTCPeerConnection) {
              return;
            }

            var origGetStats = window.RTCPeerConnection.prototype.getStats;
            window.RTCPeerConnection.prototype.getStats = function (selector, successCallback, errorCallback) {
              var pc = this;
              var args = arguments;

              // If selector is a function then we are in the old style stats so just
              // pass back the original getStats format to avoid breaking old users.
              if (arguments.length > 0 && typeof selector === 'function') {
                return origGetStats.apply(this, arguments);
              }

              // When spec-style getStats is supported, return those when called with
              // either no arguments or the selector argument is null.
              if (origGetStats.length === 0 && (arguments.length === 0 || typeof arguments[0] !== 'function')) {
                return origGetStats.apply(this, []);
              }

              var fixChromeStats_ = function fixChromeStats_(response) {
                var standardReport = {};
                var reports = response.result();
                reports.forEach(function (report) {
                  var standardStats = {
                    id: report.id,
                    timestamp: report.timestamp,
                    type: {
                      localcandidate: 'local-candidate',
                      remotecandidate: 'remote-candidate'
                    }[report.type] || report.type
                  };
                  report.names().forEach(function (name) {
                    standardStats[name] = report.stat(name);
                  });
                  standardReport[standardStats.id] = standardStats;
                });

                return standardReport;
              };

              // shim getStats with maplike support
              var makeMapStats = function makeMapStats(stats) {
                return new Map(Object.keys(stats).map(function (key) {
                  return [key, stats[key]];
                }));
              };

              if (arguments.length >= 2) {
                var successCallbackWrapper_ = function successCallbackWrapper_(response) {
                  args[1](makeMapStats(fixChromeStats_(response)));
                };

                return origGetStats.apply(this, [successCallbackWrapper_, arguments[0]]);
              }

              // promise-support
              return new Promise(function (resolve, reject) {
                origGetStats.apply(pc, [function (response) {
                  resolve(makeMapStats(fixChromeStats_(response)));
                }, reject]);
              }).then(successCallback, errorCallback);
            };

            // add promise support -- natively available in Chrome 51
            if (browserDetails.version < 51) {
              ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate'].forEach(function (method) {
                var nativeMethod = window.RTCPeerConnection.prototype[method];
                window.RTCPeerConnection.prototype[method] = function () {
                  var args = arguments;
                  var pc = this;
                  var promise = new Promise(function (resolve, reject) {
                    nativeMethod.apply(pc, [args[0], resolve, reject]);
                  });
                  if (args.length < 2) {
                    return promise;
                  }
                  return promise.then(function () {
                    args[1].apply(null, []);
                  }, function (err) {
                    if (args.length >= 3) {
                      args[2].apply(null, [err]);
                    }
                  });
                };
              });
            }

            // promise support for createOffer and createAnswer. Available (without
            // bugs) since M52: crbug/619289
            if (browserDetails.version < 52) {
              ['createOffer', 'createAnswer'].forEach(function (method) {
                var nativeMethod = window.RTCPeerConnection.prototype[method];
                window.RTCPeerConnection.prototype[method] = function () {
                  var pc = this;
                  if (arguments.length < 1 || arguments.length === 1 && _typeof(arguments[0]) === 'object') {
                    var opts = arguments.length === 1 ? arguments[0] : undefined;
                    return new Promise(function (resolve, reject) {
                      nativeMethod.apply(pc, [resolve, reject, opts]);
                    });
                  }
                  return nativeMethod.apply(this, arguments);
                };
              });
            }

            // shim implicit creation of RTCSessionDescription/RTCIceCandidate
            ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate'].forEach(function (method) {
              var nativeMethod = window.RTCPeerConnection.prototype[method];
              window.RTCPeerConnection.prototype[method] = function () {
                arguments[0] = new (method === 'addIceCandidate' ? window.RTCIceCandidate : window.RTCSessionDescription)(arguments[0]);
                return nativeMethod.apply(this, arguments);
              };
            });

            // support for addIceCandidate(null or undefined)
            var nativeAddIceCandidate = window.RTCPeerConnection.prototype.addIceCandidate;
            window.RTCPeerConnection.prototype.addIceCandidate = function () {
              if (!arguments[0]) {
                if (arguments[1]) {
                  arguments[1].apply(null);
                }
                return Promise.resolve();
              }
              return nativeAddIceCandidate.apply(this, arguments);
            };
          },

          fixNegotiationNeeded: function fixNegotiationNeeded(window) {
            utils.wrapPeerConnectionEvent(window, 'negotiationneeded', function (e) {
              var pc = e.target;
              if (pc.signalingState !== 'stable') {
                return;
              }
              return e;
            });
          },

          shimGetDisplayMedia: function shimGetDisplayMedia(window, getSourceId) {
            if (!window.navigator || !window.navigator.mediaDevices || 'getDisplayMedia' in window.navigator.mediaDevices) {
              return;
            }
            // getSourceId is a function that returns a promise resolving with
            // the sourceId of the screen/window/tab to be shared.
            if (typeof getSourceId !== 'function') {
              console.error('shimGetDisplayMedia: getSourceId argument is not ' + 'a function');
              return;
            }
            window.navigator.mediaDevices.getDisplayMedia = function (constraints) {
              return getSourceId(constraints).then(function (sourceId) {
                var widthSpecified = constraints.video && constraints.video.width;
                var heightSpecified = constraints.video && constraints.video.height;
                var frameRateSpecified = constraints.video && constraints.video.frameRate;
                constraints.video = {
                  mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: sourceId,
                    maxFrameRate: frameRateSpecified || 3
                  }
                };
                if (widthSpecified) {
                  constraints.video.mandatory.maxWidth = widthSpecified;
                }
                if (heightSpecified) {
                  constraints.video.mandatory.maxHeight = heightSpecified;
                }
                return window.navigator.mediaDevices.getUserMedia(constraints);
              });
            };
            window.navigator.getDisplayMedia = function (constraints) {
              utils.deprecated('navigator.getDisplayMedia', 'navigator.mediaDevices.getDisplayMedia');
              return window.navigator.mediaDevices.getDisplayMedia(constraints);
            };
          }
        };
      }, { "../utils.js": 14, "./getusermedia": 6 }], 6: [function (require, module, exports) {

        var utils = require('../utils.js');
        var logging = utils.log;

        // Expose public methods.
        module.exports = function (window) {
          var browserDetails = utils.detectBrowser(window);
          var navigator = window && window.navigator;

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

          var shimConstraints_ = function shimConstraints_(constraints, func) {
            if (browserDetails.version >= 61) {
              return func(constraints);
            }
            constraints = JSON.parse(JSON.stringify(constraints));
            if (constraints && _typeof(constraints.audio) === 'object') {
              var remap = function remap(obj, a, b) {
                if (a in obj && !(b in obj)) {
                  obj[b] = obj[a];
                  delete obj[a];
                }
              };
              constraints = JSON.parse(JSON.stringify(constraints));
              remap(constraints.audio, 'autoGainControl', 'googAutoGainControl');
              remap(constraints.audio, 'noiseSuppression', 'googNoiseSuppression');
              constraints.audio = constraintsToChrome_(constraints.audio);
            }
            if (constraints && _typeof(constraints.video) === 'object') {
              // Shim facingMode for mobile & surface pro.
              var face = constraints.video.facingMode;
              face = face && ((typeof face === "undefined" ? "undefined" : _typeof(face)) === 'object' ? face : { ideal: face });
              var getSupportedFacingModeLies = browserDetails.version < 66;

              if (face && (face.exact === 'user' || face.exact === 'environment' || face.ideal === 'user' || face.ideal === 'environment') && !(navigator.mediaDevices.getSupportedConstraints && navigator.mediaDevices.getSupportedConstraints().facingMode && !getSupportedFacingModeLies)) {
                delete constraints.video.facingMode;
                var matches;
                if (face.exact === 'environment' || face.ideal === 'environment') {
                  matches = ['back', 'rear'];
                } else if (face.exact === 'user' || face.ideal === 'user') {
                  matches = ['front'];
                }
                if (matches) {
                  // Look for matches in label, or use last cam for back (typical).
                  return navigator.mediaDevices.enumerateDevices().then(function (devices) {
                    devices = devices.filter(function (d) {
                      return d.kind === 'videoinput';
                    });
                    var dev = devices.find(function (d) {
                      return matches.some(function (match) {
                        return d.label.toLowerCase().indexOf(match) !== -1;
                      });
                    });
                    if (!dev && devices.length && matches.indexOf('back') !== -1) {
                      dev = devices[devices.length - 1]; // more likely the back cam
                    }
                    if (dev) {
                      constraints.video.deviceId = face.exact ? { exact: dev.deviceId } : { ideal: dev.deviceId };
                    }
                    constraints.video = constraintsToChrome_(constraints.video);
                    logging('chrome: ' + JSON.stringify(constraints));
                    return func(constraints);
                  });
                }
              }
              constraints.video = constraintsToChrome_(constraints.video);
            }
            logging('chrome: ' + JSON.stringify(constraints));
            return func(constraints);
          };

          var shimError_ = function shimError_(e) {
            if (browserDetails.version >= 64) {
              return e;
            }
            return {
              name: {
                PermissionDeniedError: 'NotAllowedError',
                PermissionDismissedError: 'NotAllowedError',
                InvalidStateError: 'NotAllowedError',
                DevicesNotFoundError: 'NotFoundError',
                ConstraintNotSatisfiedError: 'OverconstrainedError',
                TrackStartError: 'NotReadableError',
                MediaDeviceFailedDueToShutdown: 'NotAllowedError',
                MediaDeviceKillSwitchOn: 'NotAllowedError',
                TabCaptureError: 'AbortError',
                ScreenCaptureError: 'AbortError',
                DeviceCaptureError: 'AbortError'
              }[e.name] || e.name,
              message: e.message,
              constraint: e.constraint || e.constraintName,
              toString: function toString() {
                return this.name + (this.message && ': ') + this.message;
              }
            };
          };

          var getUserMedia_ = function getUserMedia_(constraints, onSuccess, onError) {
            shimConstraints_(constraints, function (c) {
              navigator.webkitGetUserMedia(c, onSuccess, function (e) {
                if (onError) {
                  onError(shimError_(e));
                }
              });
            });
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
                  return window.MediaStreamTrack.getSources(function (devices) {
                    resolve(devices.map(function (device) {
                      return { label: device.label,
                        kind: kinds[device.kind],
                        deviceId: device.id,
                        groupId: '' };
                    }));
                  });
                });
              },
              getSupportedConstraints: function getSupportedConstraints() {
                return {
                  deviceId: true, echoCancellation: true, facingMode: true,
                  frameRate: true, height: true, width: true
                };
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
            navigator.mediaDevices.getUserMedia = function (cs) {
              return shimConstraints_(cs, function (c) {
                return origGetUserMedia(c).then(function (stream) {
                  if (c.audio && !stream.getAudioTracks().length || c.video && !stream.getVideoTracks().length) {
                    stream.getTracks().forEach(function (track) {
                      track.stop();
                    });
                    throw new DOMException('', 'NotFoundError');
                  }
                  return stream;
                }, function (e) {
                  return Promise.reject(shimError_(e));
                });
              });
            };
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
      }, { "../utils.js": 14 }], 7: [function (require, module, exports) {

        var SDPUtils = require('sdp');
        var utils = require('./utils');

        module.exports = {
          shimRTCIceCandidate: function shimRTCIceCandidate(window) {
            // foundation is arbitrarily chosen as an indicator for full support for
            // https://w3c.github.io/webrtc-pc/#rtcicecandidate-interface
            if (!window.RTCIceCandidate || window.RTCIceCandidate && 'foundation' in window.RTCIceCandidate.prototype) {
              return;
            }

            var NativeRTCIceCandidate = window.RTCIceCandidate;
            window.RTCIceCandidate = function (args) {
              // Remove the a= which shouldn't be part of the candidate string.
              if ((typeof args === "undefined" ? "undefined" : _typeof(args)) === 'object' && args.candidate && args.candidate.indexOf('a=') === 0) {
                args = JSON.parse(JSON.stringify(args));
                args.candidate = args.candidate.substr(2);
              }

              if (args.candidate && args.candidate.length) {
                // Augment the native candidate with the parsed fields.
                var nativeCandidate = new NativeRTCIceCandidate(args);
                var parsedCandidate = SDPUtils.parseCandidate(args.candidate);
                var augmentedCandidate = Object.assign(nativeCandidate, parsedCandidate);

                // Add a serializer that does not serialize the extra attributes.
                augmentedCandidate.toJSON = function () {
                  return {
                    candidate: augmentedCandidate.candidate,
                    sdpMid: augmentedCandidate.sdpMid,
                    sdpMLineIndex: augmentedCandidate.sdpMLineIndex,
                    usernameFragment: augmentedCandidate.usernameFragment
                  };
                };
                return augmentedCandidate;
              }
              return new NativeRTCIceCandidate(args);
            };
            window.RTCIceCandidate.prototype = NativeRTCIceCandidate.prototype;

            // Hook up the augmented candidate in onicecandidate and
            // addEventListener('icecandidate', ...)
            utils.wrapPeerConnectionEvent(window, 'icecandidate', function (e) {
              if (e.candidate) {
                Object.defineProperty(e, 'candidate', {
                  value: new window.RTCIceCandidate(e.candidate),
                  writable: 'false'
                });
              }
              return e;
            });
          },

          // shimCreateObjectURL must be called before shimSourceObject to avoid loop.

          shimCreateObjectURL: function shimCreateObjectURL(window) {
            var URL = window && window.URL;

            if (!((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object' && window.HTMLMediaElement && 'srcObject' in window.HTMLMediaElement.prototype && URL.createObjectURL && URL.revokeObjectURL)) {
              // Only shim CreateObjectURL using srcObject if srcObject exists.
              return undefined;
            }

            var nativeCreateObjectURL = URL.createObjectURL.bind(URL);
            var nativeRevokeObjectURL = URL.revokeObjectURL.bind(URL);
            var streams = new Map(),
                newId = 0;

            URL.createObjectURL = function (stream) {
              if ('getTracks' in stream) {
                var url = 'polyblob:' + ++newId;
                streams.set(url, stream);
                utils.deprecated('URL.createObjectURL(stream)', 'elem.srcObject = stream');
                return url;
              }
              return nativeCreateObjectURL(stream);
            };
            URL.revokeObjectURL = function (url) {
              nativeRevokeObjectURL(url);
              streams.delete(url);
            };

            var dsc = Object.getOwnPropertyDescriptor(window.HTMLMediaElement.prototype, 'src');
            Object.defineProperty(window.HTMLMediaElement.prototype, 'src', {
              get: function get$$1() {
                return dsc.get.apply(this);
              },
              set: function set$$1(url) {
                this.srcObject = streams.get(url) || null;
                return dsc.set.apply(this, [url]);
              }
            });

            var nativeSetAttribute = window.HTMLMediaElement.prototype.setAttribute;
            window.HTMLMediaElement.prototype.setAttribute = function () {
              if (arguments.length === 2 && ('' + arguments[0]).toLowerCase() === 'src') {
                this.srcObject = streams.get(arguments[1]) || null;
              }
              return nativeSetAttribute.apply(this, arguments);
            };
          },

          shimMaxMessageSize: function shimMaxMessageSize(window) {
            if (window.RTCSctpTransport || !window.RTCPeerConnection) {
              return;
            }
            var browserDetails = utils.detectBrowser(window);

            if (!('sctp' in window.RTCPeerConnection.prototype)) {
              Object.defineProperty(window.RTCPeerConnection.prototype, 'sctp', {
                get: function get$$1() {
                  return typeof this._sctp === 'undefined' ? null : this._sctp;
                }
              });
            }

            var sctpInDescription = function sctpInDescription(description) {
              var sections = SDPUtils.splitSections(description.sdp);
              sections.shift();
              return sections.some(function (mediaSection) {
                var mLine = SDPUtils.parseMLine(mediaSection);
                return mLine && mLine.kind === 'application' && mLine.protocol.indexOf('SCTP') !== -1;
              });
            };

            var getRemoteFirefoxVersion = function getRemoteFirefoxVersion(description) {
              // TODO: Is there a better solution for detecting Firefox?
              var match = description.sdp.match(/mozilla...THIS_IS_SDPARTA-(\d+)/);
              if (match === null || match.length < 2) {
                return -1;
              }
              var version = parseInt(match[1], 10);
              // Test for NaN (yes, this is ugly)
              return version !== version ? -1 : version;
            };

            var getCanSendMaxMessageSize = function getCanSendMaxMessageSize(remoteIsFirefox) {
              // Every implementation we know can send at least 64 KiB.
              // Note: Although Chrome is technically able to send up to 256 KiB, the
              //       data does not reach the other peer reliably.
              //       See: https://bugs.chromium.org/p/webrtc/issues/detail?id=8419
              var canSendMaxMessageSize = 65536;
              if (browserDetails.browser === 'firefox') {
                if (browserDetails.version < 57) {
                  if (remoteIsFirefox === -1) {
                    // FF < 57 will send in 16 KiB chunks using the deprecated PPID
                    // fragmentation.
                    canSendMaxMessageSize = 16384;
                  } else {
                    // However, other FF (and RAWRTC) can reassemble PPID-fragmented
                    // messages. Thus, supporting ~2 GiB when sending.
                    canSendMaxMessageSize = 2147483637;
                  }
                } else if (browserDetails.version < 60) {
                  // Currently, all FF >= 57 will reset the remote maximum message size
                  // to the default value when a data channel is created at a later
                  // stage. :(
                  // See: https://bugzilla.mozilla.org/show_bug.cgi?id=1426831
                  canSendMaxMessageSize = browserDetails.version === 57 ? 65535 : 65536;
                } else {
                  // FF >= 60 supports sending ~2 GiB
                  canSendMaxMessageSize = 2147483637;
                }
              }
              return canSendMaxMessageSize;
            };

            var getMaxMessageSize = function getMaxMessageSize(description, remoteIsFirefox) {
              // Note: 65536 bytes is the default value from the SDP spec. Also,
              //       every implementation we know supports receiving 65536 bytes.
              var maxMessageSize = 65536;

              // FF 57 has a slightly incorrect default remote max message size, so
              // we need to adjust it here to avoid a failure when sending.
              // See: https://bugzilla.mozilla.org/show_bug.cgi?id=1425697
              if (browserDetails.browser === 'firefox' && browserDetails.version === 57) {
                maxMessageSize = 65535;
              }

              var match = SDPUtils.matchPrefix(description.sdp, 'a=max-message-size:');
              if (match.length > 0) {
                maxMessageSize = parseInt(match[0].substr(19), 10);
              } else if (browserDetails.browser === 'firefox' && remoteIsFirefox !== -1) {
                // If the maximum message size is not present in the remote SDP and
                // both local and remote are Firefox, the remote peer can receive
                // ~2 GiB.
                maxMessageSize = 2147483637;
              }
              return maxMessageSize;
            };

            var origSetRemoteDescription = window.RTCPeerConnection.prototype.setRemoteDescription;
            window.RTCPeerConnection.prototype.setRemoteDescription = function () {
              var pc = this;
              pc._sctp = null;

              if (sctpInDescription(arguments[0])) {
                // Check if the remote is FF.
                var isFirefox = getRemoteFirefoxVersion(arguments[0]);

                // Get the maximum message size the local peer is capable of sending
                var canSendMMS = getCanSendMaxMessageSize(isFirefox);

                // Get the maximum message size of the remote peer.
                var remoteMMS = getMaxMessageSize(arguments[0], isFirefox);

                // Determine final maximum message size
                var maxMessageSize;
                if (canSendMMS === 0 && remoteMMS === 0) {
                  maxMessageSize = Number.POSITIVE_INFINITY;
                } else if (canSendMMS === 0 || remoteMMS === 0) {
                  maxMessageSize = Math.max(canSendMMS, remoteMMS);
                } else {
                  maxMessageSize = Math.min(canSendMMS, remoteMMS);
                }

                // Create a dummy RTCSctpTransport object and the 'maxMessageSize'
                // attribute.
                var sctp = {};
                Object.defineProperty(sctp, 'maxMessageSize', {
                  get: function get$$1() {
                    return maxMessageSize;
                  }
                });
                pc._sctp = sctp;
              }

              return origSetRemoteDescription.apply(pc, arguments);
            };
          },

          shimSendThrowTypeError: function shimSendThrowTypeError(window) {
            if (!(window.RTCPeerConnection && 'createDataChannel' in window.RTCPeerConnection.prototype)) {
              return;
            }

            // Note: Although Firefox >= 57 has a native implementation, the maximum
            //       message size can be reset for all data channels at a later stage.
            //       See: https://bugzilla.mozilla.org/show_bug.cgi?id=1426831

            function wrapDcSend(dc, pc) {
              var origDataChannelSend = dc.send;
              dc.send = function () {
                var data = arguments[0];
                var length = data.length || data.size || data.byteLength;
                if (dc.readyState === 'open' && pc.sctp && length > pc.sctp.maxMessageSize) {
                  throw new TypeError('Message too large (can send a maximum of ' + pc.sctp.maxMessageSize + ' bytes)');
                }
                return origDataChannelSend.apply(dc, arguments);
              };
            }
            var origCreateDataChannel = window.RTCPeerConnection.prototype.createDataChannel;
            window.RTCPeerConnection.prototype.createDataChannel = function () {
              var pc = this;
              var dataChannel = origCreateDataChannel.apply(pc, arguments);
              wrapDcSend(dataChannel, pc);
              return dataChannel;
            };
            utils.wrapPeerConnectionEvent(window, 'datachannel', function (e) {
              wrapDcSend(e.channel, e.target);
              return e;
            });
          }
        };
      }, { "./utils": 14, "sdp": 2 }], 8: [function (require, module, exports) {

        var utils = require('../utils');
        var filterIceServers = require('./filtericeservers');
        var shimRTCPeerConnection = require('rtcpeerconnection-shim');

        module.exports = {
          shimGetUserMedia: require('./getusermedia'),
          shimPeerConnection: function shimPeerConnection(window) {
            var browserDetails = utils.detectBrowser(window);

            if (window.RTCIceGatherer) {
              if (!window.RTCIceCandidate) {
                window.RTCIceCandidate = function (args) {
                  return args;
                };
              }
              if (!window.RTCSessionDescription) {
                window.RTCSessionDescription = function (args) {
                  return args;
                };
              }
              // this adds an additional event listener to MediaStrackTrack that signals
              // when a tracks enabled property was changed. Workaround for a bug in
              // addStream, see below. No longer required in 15025+
              if (browserDetails.version < 15025) {
                var origMSTEnabled = Object.getOwnPropertyDescriptor(window.MediaStreamTrack.prototype, 'enabled');
                Object.defineProperty(window.MediaStreamTrack.prototype, 'enabled', {
                  set: function set$$1(value) {
                    origMSTEnabled.set.call(this, value);
                    var ev = new Event('enabled');
                    ev.enabled = value;
                    this.dispatchEvent(ev);
                  }
                });
              }
            }

            // ORTC defines the DTMF sender a bit different.
            // https://github.com/w3c/ortc/issues/714
            if (window.RTCRtpSender && !('dtmf' in window.RTCRtpSender.prototype)) {
              Object.defineProperty(window.RTCRtpSender.prototype, 'dtmf', {
                get: function get$$1() {
                  if (this._dtmf === undefined) {
                    if (this.track.kind === 'audio') {
                      this._dtmf = new window.RTCDtmfSender(this);
                    } else if (this.track.kind === 'video') {
                      this._dtmf = null;
                    }
                  }
                  return this._dtmf;
                }
              });
            }
            // Edge currently only implements the RTCDtmfSender, not the
            // RTCDTMFSender alias. See http://draft.ortc.org/#rtcdtmfsender2*
            if (window.RTCDtmfSender && !window.RTCDTMFSender) {
              window.RTCDTMFSender = window.RTCDtmfSender;
            }

            var RTCPeerConnectionShim = shimRTCPeerConnection(window, browserDetails.version);
            window.RTCPeerConnection = function (config) {
              if (config && config.iceServers) {
                config.iceServers = filterIceServers(config.iceServers);
              }
              return new RTCPeerConnectionShim(config);
            };
            window.RTCPeerConnection.prototype = RTCPeerConnectionShim.prototype;
          },
          shimReplaceTrack: function shimReplaceTrack(window) {
            // ORTC has replaceTrack -- https://github.com/w3c/ortc/issues/614
            if (window.RTCRtpSender && !('replaceTrack' in window.RTCRtpSender.prototype)) {
              window.RTCRtpSender.prototype.replaceTrack = window.RTCRtpSender.prototype.setTrack;
            }
          },
          shimGetDisplayMedia: function shimGetDisplayMedia(window, preferredMediaSource) {
            if (!('getDisplayMedia' in window.navigator) || !window.navigator.mediaDevices || 'getDisplayMedia' in window.navigator.mediaDevices) {
              return;
            }
            var origGetDisplayMedia = window.navigator.getDisplayMedia;
            window.navigator.mediaDevices.getDisplayMedia = function (constraints) {
              return origGetDisplayMedia.call(window.navigator, constraints);
            };
            window.navigator.getDisplayMedia = function (constraints) {
              utils.deprecated('navigator.getDisplayMedia', 'navigator.mediaDevices.getDisplayMedia');
              return origGetDisplayMedia.call(window.navigator, constraints);
            };
          }
        };
      }, { "../utils": 14, "./filtericeservers": 9, "./getusermedia": 10, "rtcpeerconnection-shim": 1 }], 9: [function (require, module, exports) {

        var utils = require('../utils');
        // Edge does not like
        // 1) stun: filtered after 14393 unless ?transport=udp is present
        // 2) turn: that does not have all of turn:host:port?transport=udp
        // 3) turn: with ipv6 addresses
        // 4) turn: occurring muliple times
        module.exports = function (iceServers, edgeVersion) {
          var hasTurn = false;
          iceServers = JSON.parse(JSON.stringify(iceServers));
          return iceServers.filter(function (server) {
            if (server && (server.urls || server.url)) {
              var urls = server.urls || server.url;
              if (server.url && !server.urls) {
                utils.deprecated('RTCIceServer.url', 'RTCIceServer.urls');
              }
              var isString = typeof urls === 'string';
              if (isString) {
                urls = [urls];
              }
              urls = urls.filter(function (url) {
                var validTurn = url.indexOf('turn:') === 0 && url.indexOf('transport=udp') !== -1 && url.indexOf('turn:[') === -1 && !hasTurn;

                if (validTurn) {
                  hasTurn = true;
                  return true;
                }
                return url.indexOf('stun:') === 0 && edgeVersion >= 14393 && url.indexOf('?transport=udp') === -1;
              });

              delete server.url;
              server.urls = isString ? urls[0] : urls;
              return !!urls.length;
            }
          });
        };
      }, { "../utils": 14 }], 10: [function (require, module, exports) {

        // Expose public methods.

        module.exports = function (window) {
          var navigator = window && window.navigator;

          var shimError_ = function shimError_(e) {
            return {
              name: { PermissionDeniedError: 'NotAllowedError' }[e.name] || e.name,
              message: e.message,
              constraint: e.constraint,
              toString: function toString() {
                return this.name;
              }
            };
          };

          // getUserMedia error shim.
          var origGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
          navigator.mediaDevices.getUserMedia = function (c) {
            return origGetUserMedia(c).catch(function (e) {
              return Promise.reject(shimError_(e));
            });
          };
        };
      }, {}], 11: [function (require, module, exports) {

        var utils = require('../utils');

        module.exports = {
          shimGetUserMedia: require('./getusermedia'),
          shimOnTrack: function shimOnTrack(window) {
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
                      event.transceiver = { receiver: event.receiver };
                      event.streams = [e.stream];
                      this.dispatchEvent(event);
                    }.bind(this));
                  }.bind(this));
                },
                enumerable: true,
                configurable: true
              });
            }
            if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object' && window.RTCTrackEvent && 'receiver' in window.RTCTrackEvent.prototype && !('transceiver' in window.RTCTrackEvent.prototype)) {
              Object.defineProperty(window.RTCTrackEvent.prototype, 'transceiver', {
                get: function get$$1() {
                  return { receiver: this.receiver };
                }
              });
            }
          },

          shimSourceObject: function shimSourceObject(window) {
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

          shimPeerConnection: function shimPeerConnection(window) {
            var browserDetails = utils.detectBrowser(window);

            if ((typeof window === "undefined" ? "undefined" : _typeof(window)) !== 'object' || !(window.RTCPeerConnection || window.mozRTCPeerConnection)) {
              return; // probably media.peerconnection.enabled=false in about:config
            }
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
                return new window.mozRTCPeerConnection(pcConfig, pcConstraints);
              };
              window.RTCPeerConnection.prototype = window.mozRTCPeerConnection.prototype;

              // wrap static methods. Currently just generateCertificate.
              if (window.mozRTCPeerConnection.generateCertificate) {
                Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
                  get: function get$$1() {
                    return window.mozRTCPeerConnection.generateCertificate;
                  }
                });
              }

              window.RTCSessionDescription = window.mozRTCSessionDescription;
              window.RTCIceCandidate = window.mozRTCIceCandidate;
            }

            // shim away need for obsolete RTCIceCandidate/RTCSessionDescription.
            ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate'].forEach(function (method) {
              var nativeMethod = window.RTCPeerConnection.prototype[method];
              window.RTCPeerConnection.prototype[method] = function () {
                arguments[0] = new (method === 'addIceCandidate' ? window.RTCIceCandidate : window.RTCSessionDescription)(arguments[0]);
                return nativeMethod.apply(this, arguments);
              };
            });

            // support for addIceCandidate(null or undefined)
            var nativeAddIceCandidate = window.RTCPeerConnection.prototype.addIceCandidate;
            window.RTCPeerConnection.prototype.addIceCandidate = function () {
              if (!arguments[0]) {
                if (arguments[1]) {
                  arguments[1].apply(null);
                }
                return Promise.resolve();
              }
              return nativeAddIceCandidate.apply(this, arguments);
            };

            // shim getStats with maplike support
            var makeMapStats = function makeMapStats(stats) {
              var map = new Map();
              Object.keys(stats).forEach(function (key) {
                map.set(key, stats[key]);
                map[key] = stats[key];
              });
              return map;
            };

            var modernStatsTypes = {
              inboundrtp: 'inbound-rtp',
              outboundrtp: 'outbound-rtp',
              candidatepair: 'candidate-pair',
              localcandidate: 'local-candidate',
              remotecandidate: 'remote-candidate'
            };

            var nativeGetStats = window.RTCPeerConnection.prototype.getStats;
            window.RTCPeerConnection.prototype.getStats = function (selector, onSucc, onErr) {
              return nativeGetStats.apply(this, [selector || null]).then(function (stats) {
                if (browserDetails.version < 48) {
                  stats = makeMapStats(stats);
                }
                if (browserDetails.version < 53 && !onSucc) {
                  // Shim only promise getStats with spec-hyphens in type names
                  // Leave callback version alone; misc old uses of forEach before Map
                  try {
                    stats.forEach(function (stat) {
                      stat.type = modernStatsTypes[stat.type] || stat.type;
                    });
                  } catch (e) {
                    if (e.name !== 'TypeError') {
                      throw e;
                    }
                    // Avoid TypeError: "type" is read-only, in old versions. 34-43ish
                    stats.forEach(function (stat, i) {
                      stats.set(i, Object.assign({}, stat, {
                        type: modernStatsTypes[stat.type] || stat.type
                      }));
                    });
                  }
                }
                return stats;
              }).then(onSucc, onErr);
            };
          },

          shimSenderGetStats: function shimSenderGetStats(window) {
            if (!((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object' && window.RTCPeerConnection && window.RTCRtpSender)) {
              return;
            }
            if (window.RTCRtpSender && 'getStats' in window.RTCRtpSender.prototype) {
              return;
            }
            var origGetSenders = window.RTCPeerConnection.prototype.getSenders;
            if (origGetSenders) {
              window.RTCPeerConnection.prototype.getSenders = function () {
                var pc = this;
                var senders = origGetSenders.apply(pc, []);
                senders.forEach(function (sender) {
                  sender._pc = pc;
                });
                return senders;
              };
            }

            var origAddTrack = window.RTCPeerConnection.prototype.addTrack;
            if (origAddTrack) {
              window.RTCPeerConnection.prototype.addTrack = function () {
                var sender = origAddTrack.apply(this, arguments);
                sender._pc = this;
                return sender;
              };
            }
            window.RTCRtpSender.prototype.getStats = function () {
              return this.track ? this._pc.getStats(this.track) : Promise.resolve(new Map());
            };
          },

          shimReceiverGetStats: function shimReceiverGetStats(window) {
            if (!((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object' && window.RTCPeerConnection && window.RTCRtpSender)) {
              return;
            }
            if (window.RTCRtpSender && 'getStats' in window.RTCRtpReceiver.prototype) {
              return;
            }
            var origGetReceivers = window.RTCPeerConnection.prototype.getReceivers;
            if (origGetReceivers) {
              window.RTCPeerConnection.prototype.getReceivers = function () {
                var pc = this;
                var receivers = origGetReceivers.apply(pc, []);
                receivers.forEach(function (receiver) {
                  receiver._pc = pc;
                });
                return receivers;
              };
            }
            utils.wrapPeerConnectionEvent(window, 'track', function (e) {
              e.receiver._pc = e.srcElement;
              return e;
            });
            window.RTCRtpReceiver.prototype.getStats = function () {
              return this._pc.getStats(this.track);
            };
          },

          shimRemoveStream: function shimRemoveStream(window) {
            if (!window.RTCPeerConnection || 'removeStream' in window.RTCPeerConnection.prototype) {
              return;
            }
            window.RTCPeerConnection.prototype.removeStream = function (stream) {
              var pc = this;
              utils.deprecated('removeStream', 'removeTrack');
              this.getSenders().forEach(function (sender) {
                if (sender.track && stream.getTracks().indexOf(sender.track) !== -1) {
                  pc.removeTrack(sender);
                }
              });
            };
          },

          shimRTCDataChannel: function shimRTCDataChannel(window) {
            // rename DataChannel to RTCDataChannel (native fix in FF60):
            // https://bugzilla.mozilla.org/show_bug.cgi?id=1173851
            if (window.DataChannel && !window.RTCDataChannel) {
              window.RTCDataChannel = window.DataChannel;
            }
          },

          shimGetDisplayMedia: function shimGetDisplayMedia(window, preferredMediaSource) {
            if (!window.navigator || !window.navigator.mediaDevices || 'getDisplayMedia' in window.navigator.mediaDevices) {
              return;
            }
            window.navigator.mediaDevices.getDisplayMedia = function (constraints) {
              if (!(constraints && constraints.video)) {
                var err = new DOMException('getDisplayMedia without video ' + 'constraints is undefined');
                err.name = 'NotFoundError';
                // from https://heycam.github.io/webidl/#idl-DOMException-error-names
                err.code = 8;
                return Promise.reject(err);
              }
              if (constraints.video === true) {
                constraints.video = { mediaSource: preferredMediaSource };
              } else {
                constraints.video.mediaSource = preferredMediaSource;
              }
              return window.navigator.mediaDevices.getUserMedia(constraints);
            };
            window.navigator.getDisplayMedia = function (constraints) {
              utils.deprecated('navigator.getDisplayMedia', 'navigator.mediaDevices.getDisplayMedia');
              return window.navigator.mediaDevices.getDisplayMedia(constraints);
            };
          }
        };
      }, { "../utils": 14, "./getusermedia": 12 }], 12: [function (require, module, exports) {

        var utils = require('../utils');
        var logging = utils.log;

        // Expose public methods.
        module.exports = function (window) {
          var browserDetails = utils.detectBrowser(window);
          var navigator = window && window.navigator;
          var MediaStreamTrack = window && window.MediaStreamTrack;

          var shimError_ = function shimError_(e) {
            return {
              name: {
                InternalError: 'NotReadableError',
                NotSupportedError: 'TypeError',
                PermissionDeniedError: 'NotAllowedError',
                SecurityError: 'NotAllowedError'
              }[e.name] || e.name,
              message: {
                'The operation is insecure.': 'The request is not allowed by the ' + 'user agent or the platform in the current context.'
              }[e.message] || e.message,
              constraint: e.constraint,
              toString: function toString() {
                return this.name + (this.message && ': ') + this.message;
              }
            };
          };

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
            return navigator.mozGetUserMedia(constraints, onSuccess, function (e) {
              onError(shimError_(e));
            });
          };

          // Returns the result of getUserMedia as a Promise.
          var getUserMediaPromise_ = function getUserMediaPromise_(constraints) {
            return new Promise(function (resolve, reject) {
              getUserMedia_(constraints, resolve, reject);
            });
          };

          // Shim for mediaDevices on older versions.
          if (!navigator.mediaDevices) {
            navigator.mediaDevices = { getUserMedia: getUserMediaPromise_,
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
          if (browserDetails.version < 49) {
            var origGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
            navigator.mediaDevices.getUserMedia = function (c) {
              return origGetUserMedia(c).then(function (stream) {
                // Work around https://bugzil.la/802326
                if (c.audio && !stream.getAudioTracks().length || c.video && !stream.getVideoTracks().length) {
                  stream.getTracks().forEach(function (track) {
                    track.stop();
                  });
                  throw new DOMException('The object can not be found here.', 'NotFoundError');
                }
                return stream;
              }, function (e) {
                return Promise.reject(shimError_(e));
              });
            };
          }
          if (!(browserDetails.version > 55 && 'autoGainControl' in navigator.mediaDevices.getSupportedConstraints())) {
            var remap = function remap(obj, a, b) {
              if (a in obj && !(b in obj)) {
                obj[b] = obj[a];
                delete obj[a];
              }
            };

            var nativeGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
            navigator.mediaDevices.getUserMedia = function (c) {
              if ((typeof c === "undefined" ? "undefined" : _typeof(c)) === 'object' && _typeof(c.audio) === 'object') {
                c = JSON.parse(JSON.stringify(c));
                remap(c.audio, 'autoGainControl', 'mozAutoGainControl');
                remap(c.audio, 'noiseSuppression', 'mozNoiseSuppression');
              }
              return nativeGetUserMedia(c);
            };

            if (MediaStreamTrack && MediaStreamTrack.prototype.getSettings) {
              var nativeGetSettings = MediaStreamTrack.prototype.getSettings;
              MediaStreamTrack.prototype.getSettings = function () {
                var obj = nativeGetSettings.apply(this, arguments);
                remap(obj, 'mozAutoGainControl', 'autoGainControl');
                remap(obj, 'mozNoiseSuppression', 'noiseSuppression');
                return obj;
              };
            }

            if (MediaStreamTrack && MediaStreamTrack.prototype.applyConstraints) {
              var nativeApplyConstraints = MediaStreamTrack.prototype.applyConstraints;
              MediaStreamTrack.prototype.applyConstraints = function (c) {
                if (this.kind === 'audio' && (typeof c === "undefined" ? "undefined" : _typeof(c)) === 'object') {
                  c = JSON.parse(JSON.stringify(c));
                  remap(c, 'autoGainControl', 'mozAutoGainControl');
                  remap(c, 'noiseSuppression', 'mozNoiseSuppression');
                }
                return nativeApplyConstraints.apply(this, [c]);
              };
            }
          }
          navigator.getUserMedia = function (constraints, onSuccess, onError) {
            if (browserDetails.version < 44) {
              return getUserMedia_(constraints, onSuccess, onError);
            }
            // Replace Firefox 44+'s deprecation warning with unprefixed version.
            utils.deprecated('navigator.getUserMedia', 'navigator.mediaDevices.getUserMedia');
            navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
          };
        };
      }, { "../utils": 14 }], 13: [function (require, module, exports) {

        var utils = require('../utils');

        module.exports = {
          shimLocalStreamsAPI: function shimLocalStreamsAPI(window) {
            if ((typeof window === "undefined" ? "undefined" : _typeof(window)) !== 'object' || !window.RTCPeerConnection) {
              return;
            }
            if (!('getLocalStreams' in window.RTCPeerConnection.prototype)) {
              window.RTCPeerConnection.prototype.getLocalStreams = function () {
                if (!this._localStreams) {
                  this._localStreams = [];
                }
                return this._localStreams;
              };
            }
            if (!('getStreamById' in window.RTCPeerConnection.prototype)) {
              window.RTCPeerConnection.prototype.getStreamById = function (id) {
                var result = null;
                if (this._localStreams) {
                  this._localStreams.forEach(function (stream) {
                    if (stream.id === id) {
                      result = stream;
                    }
                  });
                }
                if (this._remoteStreams) {
                  this._remoteStreams.forEach(function (stream) {
                    if (stream.id === id) {
                      result = stream;
                    }
                  });
                }
                return result;
              };
            }
            if (!('addStream' in window.RTCPeerConnection.prototype)) {
              var _addTrack = window.RTCPeerConnection.prototype.addTrack;
              window.RTCPeerConnection.prototype.addStream = function (stream) {
                if (!this._localStreams) {
                  this._localStreams = [];
                }
                if (this._localStreams.indexOf(stream) === -1) {
                  this._localStreams.push(stream);
                }
                var pc = this;
                stream.getTracks().forEach(function (track) {
                  _addTrack.call(pc, track, stream);
                });
              };

              window.RTCPeerConnection.prototype.addTrack = function (track, stream) {
                if (stream) {
                  if (!this._localStreams) {
                    this._localStreams = [stream];
                  } else if (this._localStreams.indexOf(stream) === -1) {
                    this._localStreams.push(stream);
                  }
                }
                return _addTrack.call(this, track, stream);
              };
            }
            if (!('removeStream' in window.RTCPeerConnection.prototype)) {
              window.RTCPeerConnection.prototype.removeStream = function (stream) {
                if (!this._localStreams) {
                  this._localStreams = [];
                }
                var index = this._localStreams.indexOf(stream);
                if (index === -1) {
                  return;
                }
                this._localStreams.splice(index, 1);
                var pc = this;
                var tracks = stream.getTracks();
                this.getSenders().forEach(function (sender) {
                  if (tracks.indexOf(sender.track) !== -1) {
                    pc.removeTrack(sender);
                  }
                });
              };
            }
          },
          shimRemoteStreamsAPI: function shimRemoteStreamsAPI(window) {
            if ((typeof window === "undefined" ? "undefined" : _typeof(window)) !== 'object' || !window.RTCPeerConnection) {
              return;
            }
            if (!('getRemoteStreams' in window.RTCPeerConnection.prototype)) {
              window.RTCPeerConnection.prototype.getRemoteStreams = function () {
                return this._remoteStreams ? this._remoteStreams : [];
              };
            }
            if (!('onaddstream' in window.RTCPeerConnection.prototype)) {
              Object.defineProperty(window.RTCPeerConnection.prototype, 'onaddstream', {
                get: function get$$1() {
                  return this._onaddstream;
                },
                set: function set$$1(f) {
                  if (this._onaddstream) {
                    this.removeEventListener('addstream', this._onaddstream);
                  }
                  this.addEventListener('addstream', this._onaddstream = f);
                }
              });
              var origSetRemoteDescription = window.RTCPeerConnection.prototype.setRemoteDescription;
              window.RTCPeerConnection.prototype.setRemoteDescription = function () {
                var pc = this;
                if (!this._onaddstreampoly) {
                  this.addEventListener('track', this._onaddstreampoly = function (e) {
                    e.streams.forEach(function (stream) {
                      if (!pc._remoteStreams) {
                        pc._remoteStreams = [];
                      }
                      if (pc._remoteStreams.indexOf(stream) >= 0) {
                        return;
                      }
                      pc._remoteStreams.push(stream);
                      var event = new Event('addstream');
                      event.stream = stream;
                      pc.dispatchEvent(event);
                    });
                  });
                }
                return origSetRemoteDescription.apply(pc, arguments);
              };
            }
          },
          shimCallbacksAPI: function shimCallbacksAPI(window) {
            if ((typeof window === "undefined" ? "undefined" : _typeof(window)) !== 'object' || !window.RTCPeerConnection) {
              return;
            }
            var prototype = window.RTCPeerConnection.prototype;
            var createOffer = prototype.createOffer;
            var createAnswer = prototype.createAnswer;
            var setLocalDescription = prototype.setLocalDescription;
            var setRemoteDescription = prototype.setRemoteDescription;
            var addIceCandidate = prototype.addIceCandidate;

            prototype.createOffer = function (successCallback, failureCallback) {
              var options = arguments.length >= 2 ? arguments[2] : arguments[0];
              var promise = createOffer.apply(this, [options]);
              if (!failureCallback) {
                return promise;
              }
              promise.then(successCallback, failureCallback);
              return Promise.resolve();
            };

            prototype.createAnswer = function (successCallback, failureCallback) {
              var options = arguments.length >= 2 ? arguments[2] : arguments[0];
              var promise = createAnswer.apply(this, [options]);
              if (!failureCallback) {
                return promise;
              }
              promise.then(successCallback, failureCallback);
              return Promise.resolve();
            };

            var withCallback = function withCallback(description, successCallback, failureCallback) {
              var promise = setLocalDescription.apply(this, [description]);
              if (!failureCallback) {
                return promise;
              }
              promise.then(successCallback, failureCallback);
              return Promise.resolve();
            };
            prototype.setLocalDescription = withCallback;

            withCallback = function withCallback(description, successCallback, failureCallback) {
              var promise = setRemoteDescription.apply(this, [description]);
              if (!failureCallback) {
                return promise;
              }
              promise.then(successCallback, failureCallback);
              return Promise.resolve();
            };
            prototype.setRemoteDescription = withCallback;

            withCallback = function withCallback(candidate, successCallback, failureCallback) {
              var promise = addIceCandidate.apply(this, [candidate]);
              if (!failureCallback) {
                return promise;
              }
              promise.then(successCallback, failureCallback);
              return Promise.resolve();
            };
            prototype.addIceCandidate = withCallback;
          },
          shimGetUserMedia: function shimGetUserMedia(window) {
            var navigator = window && window.navigator;

            if (!navigator.getUserMedia) {
              if (navigator.webkitGetUserMedia) {
                navigator.getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
              } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.getUserMedia = function (constraints, cb, errcb) {
                  navigator.mediaDevices.getUserMedia(constraints).then(cb, errcb);
                }.bind(navigator);
              }
            }
          },
          shimRTCIceServerUrls: function shimRTCIceServerUrls(window) {
            // migrate from non-spec RTCIceServer.url to RTCIceServer.urls
            var OrigPeerConnection = window.RTCPeerConnection;
            window.RTCPeerConnection = function (pcConfig, pcConstraints) {
              if (pcConfig && pcConfig.iceServers) {
                var newIceServers = [];
                for (var i = 0; i < pcConfig.iceServers.length; i++) {
                  var server = pcConfig.iceServers[i];
                  if (!server.hasOwnProperty('urls') && server.hasOwnProperty('url')) {
                    utils.deprecated('RTCIceServer.url', 'RTCIceServer.urls');
                    server = JSON.parse(JSON.stringify(server));
                    server.urls = server.url;
                    delete server.url;
                    newIceServers.push(server);
                  } else {
                    newIceServers.push(pcConfig.iceServers[i]);
                  }
                }
                pcConfig.iceServers = newIceServers;
              }
              return new OrigPeerConnection(pcConfig, pcConstraints);
            };
            window.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
            // wrap static methods. Currently just generateCertificate.
            if ('generateCertificate' in window.RTCPeerConnection) {
              Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
                get: function get$$1() {
                  return OrigPeerConnection.generateCertificate;
                }
              });
            }
          },
          shimTrackEventTransceiver: function shimTrackEventTransceiver(window) {
            // Add event.transceiver member over deprecated event.receiver
            if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object' && window.RTCPeerConnection && 'receiver' in window.RTCTrackEvent.prototype &&
            // can't check 'transceiver' in window.RTCTrackEvent.prototype, as it is
            // defined for some reason even when window.RTCTransceiver is not.
            !window.RTCTransceiver) {
              Object.defineProperty(window.RTCTrackEvent.prototype, 'transceiver', {
                get: function get$$1() {
                  return { receiver: this.receiver };
                }
              });
            }
          },

          shimCreateOfferLegacy: function shimCreateOfferLegacy(window) {
            var origCreateOffer = window.RTCPeerConnection.prototype.createOffer;
            window.RTCPeerConnection.prototype.createOffer = function (offerOptions) {
              var pc = this;
              if (offerOptions) {
                if (typeof offerOptions.offerToReceiveAudio !== 'undefined') {
                  // support bit values
                  offerOptions.offerToReceiveAudio = !!offerOptions.offerToReceiveAudio;
                }
                var audioTransceiver = pc.getTransceivers().find(function (transceiver) {
                  return transceiver.sender.track && transceiver.sender.track.kind === 'audio';
                });
                if (offerOptions.offerToReceiveAudio === false && audioTransceiver) {
                  if (audioTransceiver.direction === 'sendrecv') {
                    if (audioTransceiver.setDirection) {
                      audioTransceiver.setDirection('sendonly');
                    } else {
                      audioTransceiver.direction = 'sendonly';
                    }
                  } else if (audioTransceiver.direction === 'recvonly') {
                    if (audioTransceiver.setDirection) {
                      audioTransceiver.setDirection('inactive');
                    } else {
                      audioTransceiver.direction = 'inactive';
                    }
                  }
                } else if (offerOptions.offerToReceiveAudio === true && !audioTransceiver) {
                  pc.addTransceiver('audio');
                }

                if (typeof offerOptions.offerToReceiveVideo !== 'undefined') {
                  // support bit values
                  offerOptions.offerToReceiveVideo = !!offerOptions.offerToReceiveVideo;
                }
                var videoTransceiver = pc.getTransceivers().find(function (transceiver) {
                  return transceiver.sender.track && transceiver.sender.track.kind === 'video';
                });
                if (offerOptions.offerToReceiveVideo === false && videoTransceiver) {
                  if (videoTransceiver.direction === 'sendrecv') {
                    videoTransceiver.setDirection('sendonly');
                  } else if (videoTransceiver.direction === 'recvonly') {
                    videoTransceiver.setDirection('inactive');
                  }
                } else if (offerOptions.offerToReceiveVideo === true && !videoTransceiver) {
                  pc.addTransceiver('video');
                }
              }
              return origCreateOffer.apply(pc, arguments);
            };
          }
        };
      }, { "../utils": 14 }], 14: [function (require, module, exports) {

        var logDisabled_ = true;
        var deprecationWarnings_ = true;

        /**
         * Extract browser version out of the provided user agent string.
         *
         * @param {!string} uastring userAgent string.
         * @param {!string} expr Regular expression used as match criteria.
         * @param {!number} pos position in the version string to be returned.
         * @return {!number} browser version.
         */
        function extractVersion(uastring, expr, pos) {
          var match = uastring.match(expr);
          return match && match.length >= pos && parseInt(match[pos], 10);
        }

        // Wraps the peerconnection event eventNameToWrap in a function
        // which returns the modified event object (or false to prevent
        // the event).
        function wrapPeerConnectionEvent(window, eventNameToWrap, wrapper) {
          if (!window.RTCPeerConnection) {
            return;
          }
          var proto = window.RTCPeerConnection.prototype;
          var nativeAddEventListener = proto.addEventListener;
          proto.addEventListener = function (nativeEventName, cb) {
            if (nativeEventName !== eventNameToWrap) {
              return nativeAddEventListener.apply(this, arguments);
            }
            var wrappedCallback = function wrappedCallback(e) {
              var modifiedEvent = wrapper(e);
              if (modifiedEvent) {
                cb(modifiedEvent);
              }
            };
            this._eventMap = this._eventMap || {};
            this._eventMap[cb] = wrappedCallback;
            return nativeAddEventListener.apply(this, [nativeEventName, wrappedCallback]);
          };

          var nativeRemoveEventListener = proto.removeEventListener;
          proto.removeEventListener = function (nativeEventName, cb) {
            if (nativeEventName !== eventNameToWrap || !this._eventMap || !this._eventMap[cb]) {
              return nativeRemoveEventListener.apply(this, arguments);
            }
            var unwrappedCb = this._eventMap[cb];
            delete this._eventMap[cb];
            return nativeRemoveEventListener.apply(this, [nativeEventName, unwrappedCb]);
          };

          Object.defineProperty(proto, 'on' + eventNameToWrap, {
            get: function get$$1() {
              return this['_on' + eventNameToWrap];
            },
            set: function set$$1(cb) {
              if (this['_on' + eventNameToWrap]) {
                this.removeEventListener(eventNameToWrap, this['_on' + eventNameToWrap]);
                delete this['_on' + eventNameToWrap];
              }
              if (cb) {
                this.addEventListener(eventNameToWrap, this['_on' + eventNameToWrap] = cb);
              }
            },
            enumerable: true,
            configurable: true
          });
        }

        // Utility methods.
        module.exports = {
          extractVersion: extractVersion,
          wrapPeerConnectionEvent: wrapPeerConnectionEvent,
          disableLog: function disableLog(bool) {
            if (typeof bool !== 'boolean') {
              return new Error('Argument type: ' + (typeof bool === "undefined" ? "undefined" : _typeof(bool)) + '. Please use a boolean.');
            }
            logDisabled_ = bool;
            return bool ? 'adapter.js logging disabled' : 'adapter.js logging enabled';
          },

          /**
           * Disable or enable deprecation warnings
           * @param {!boolean} bool set to true to disable warnings.
           */
          disableWarnings: function disableWarnings(bool) {
            if (typeof bool !== 'boolean') {
              return new Error('Argument type: ' + (typeof bool === "undefined" ? "undefined" : _typeof(bool)) + '. Please use a boolean.');
            }
            deprecationWarnings_ = !bool;
            return 'adapter.js deprecation warnings ' + (bool ? 'disabled' : 'enabled');
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
           * Shows a deprecation warning suggesting the modern and spec-compatible API.
           */
          deprecated: function deprecated(oldMethod, newMethod) {
            if (!deprecationWarnings_) {
              return;
            }
            console.warn(oldMethod + ' is deprecated, please use ' + newMethod + ' instead.');
          },

          /**
           * Browser detector.
           *
           * @return {object} result containing browser and version
           *     properties.
           */
          detectBrowser: function detectBrowser(window) {
            var navigator = window && window.navigator;

            // Returned result object.
            var result = {};
            result.browser = null;
            result.version = null;

            // Fail early if it's not a browser
            if (typeof window === 'undefined' || !window.navigator) {
              result.browser = 'Not a browser.';
              return result;
            }

            if (navigator.mozGetUserMedia) {
              // Firefox.
              result.browser = 'firefox';
              result.version = extractVersion(navigator.userAgent, /Firefox\/(\d+)\./, 1);
            } else if (navigator.webkitGetUserMedia) {
              // Chrome, Chromium, Webview, Opera.
              // Version matches Chrome/WebRTC version.
              result.browser = 'chrome';
              result.version = extractVersion(navigator.userAgent, /Chrom(e|ium)\/(\d+)\./, 2);
            } else if (navigator.mediaDevices && navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) {
              // Edge.
              result.browser = 'edge';
              result.version = extractVersion(navigator.userAgent, /Edge\/(\d+).(\d+)$/, 2);
            } else if (window.RTCPeerConnection && navigator.userAgent.match(/AppleWebKit\/(\d+)\./)) {
              // Safari.
              result.browser = 'safari';
              result.version = extractVersion(navigator.userAgent, /AppleWebKit\/(\d+)\./, 1);
            } else {
              // Default fallthrough: not supported.
              result.browser = 'Not a supported browser.';
              return result;
            }

            return result;
          }
        };
      }, {}] }, {}, [3])(3);
  }

  var initAdapter = function initAdapter() {
    window.adapter = Adapter();
  };

  /** This library require adapter.js */
  initAdapter();

  /** ----- 参数定义 ----- */
  var RongRTCGlobal = {
    /** 带宽设置计数器 */
    bandWidthCount: 0
  };
  var RongRTCError = {
    TOKEN_USERID_MISMATCH: 1
  };

  /** ----- 参数定义 ----- */

  /** ----- 常量定义 ----- */
  var RongRTCConstant = {
    /** RongRTC SDK版本号 */
    SDK_VERSION_NAME: '1.0.0',
    /** client type */
    CLIENT_TYPE: 3,
    /** keepAlive时间间隔 */
    KEEPALIVE_INTERVAL: 5 * 1000,
    /** keepAlive最大连续失败次数 */
    KEEPALIVE_FAILEDTIMES_MAX: 4,
    /** keepAliveTimer时间间隔 */
    KEEPALIVE_TIMER_INTERVAL: 1 * 1000,
    /** keepAlive未收到result最大超时时间 */
    KEEPALIVE_TIMER_TIMEOUT_MAX: 20,
    /** keepAlive未收到result最大超时时间 */
    KEEPALIVE_TIMER_TIMEOUT_RECONNECT: 12,
    /** reconnect最大连续次数 */
    RECONNECT_MAXTIMES: 10,
    /** reconnect连续重连时间间隔 */
    RECONNECT_TIMEOUT: 1 * 1000,
    /** getStatsReport时间间隔 */
    GETSTATSREPORT_INTERVAL: 1 * 1000
    /** 连接类型 */
  };RongRTCConstant.ConnectionType = {
    /** P2P模式 */
    P2P: 0,
    /** MediaServer模式 */
    MEDIASERVER: 1
    /** logon version */
  };RongRTCConstant.LogonVersion = {
    /** 初始版本 */
    INIT: 1,
    /** 订阅分发版本 */
    SUBSCRIBE: 3
    /** 用户模式类型 */
  };RongRTCConstant.UserType = {
    /** 普通模式 */
    NORMAL: 1,
    /** 观察者模式 */
    OBSERVER: 2,
    /** 主持人模式 */
    HOST: 3,
    /** 主讲人 */
    SPEAK: 4
    /** 用户音视频类型 */
  };RongRTCConstant.TalkType = {
    /** 仅音频 */
    OnlyAudio: 0,
    /** 音频+视频 */
    All: 1,
    /** 视频 */
    OnlyVideo: 2,
    /** 无 */
    None: 3
    /** 设备类型 */
  };RongRTCConstant.DeviceType = {
    /** 摄像头 */
    Camera: 1,
    /** 麦克风 */
    Microphone: 2,
    /** 摄像头+麦克风 */
    CameraAndMicrophone: 3,
    /** 屏幕共享 */
    ScreenShare: 4
    /** 操作类型 */
  };RongRTCConstant.OperationType = {
    /** 打开 */
    OPEN: 1,
    /** 关闭 */
    CLOSE: 2
    /** EnablType */
  };RongRTCConstant.EnableType = {
    /** disable */
    Disable: 0,
    /** enable */
    Enable: 1
    /** 与服务器的连接状态 */
  };RongRTCConstant.ConnectionState = {
    CONNECTED: 'CONNECTED',
    DISCONNECTED: 'DISCONNECTED',
    ROOM_ERROR: 'ROOM_ERROR'
    /** websocket的连接状态 */
  };RongRTCConstant.wsConnectionState = {
    CONNECTED: 'CONNECTED',
    DISCONNECTED: 'DISCONNECTED',
    CONNECTING: 'CONNECTING'
    /** 交换类型 */
  };RongRTCConstant.ExchangeType = {
    /** offer */
    OFFER: 1,
    /** answer */
    ANSWER: 2,
    /** candidate */
    CANDIDATE: 3
    /** logonAndJoin status */
  };RongRTCConstant.LogonAndJoinStatus = {
    CONNECT: 0,
    RECONNECT: 1
    /** offer status */
  };RongRTCConstant.OfferStatus = {
    SENDING: 'SENDING',
    DONE: 'DONE'
  };
  RongRTCConstant.ScreenShareReason = {
    API: 1,
    BROWER: 2
  };
  /**
  * 会控操作类型
  *
  */
  RongRTCConstant.MeetingActionType = {
    /** 与会人员能力管理 */
    RoleChange: {
      /** 将与会人降级为观察者 */
      DegradeToObserver: 1,
      /** 邀请观察者发言,将观察升级为正常用户 */
      UpgradeToNormal: 2,
      /** 移除与会人员 */
      RemoveUser: 3,
      /** 设置主讲人 */
      SetSpeak: 4,
      /**取消主讲人 **/
      RecusalSpeaker: 5
    },
    /** 申请管理 */
    Apply: {
      /** 观察者请求变更为正常用户发言 */
      RequestUpgradeToNormal: 1,
      /** 正常用户成为主持人 */
      GetHostAuthority: 2,
      /** 获取邀请连接 */
      GetInviteUrl: 3
    },
    /** 与会人员设备管理 */
    ManageAction: {},
    /** 会控应答 */
    ChannelAnswer: {
      /** 邀请观察者发言 */
      UpgradeToNormal: 1,
      /** 观察者主动要求发言 */
      RequestUpgradeToNormal: 2,
      /** 邀请打开设备 */
      InviteToOpen: 3,
      /** 把正常用户降级为观察者 */
      DegradeToObserver: 4,
      /** 邀请关闭设备 */
      InviteToClose: 5,
      /** 设置主讲人 */
      SetSpeak: 6,
      /** 取消主讲人 */
      RecusalSpeaker: 7
    },
    /** 画布展示 */
    ShareType: {
      /** 共享屏幕 */
      ShareScreen: 1,
      /** 共享白板 */
      ShareEWB: 2,
      /** 共享视频 */
      ShareVideo: 3
    }
    /**
    * 会控应答类型
    *
    */
  };RongRTCConstant.MeetingAnswerType = {
    /** 接受 */
    Accept: 1,
    /** 拒绝 */
    Deny: 2,
    /** 忙碌 */
    Busy: 4,
    /** 无响应*/
    Unresponsive: 8
    /** 视频分辨率 */
  };RongRTCConstant.VideoProfile_default = {
    width: 640,
    height: 480,
    frameRate: 15
    /** 小视频分辨率 */
  };RongRTCConstant.VideoProfile_min = {
    width: 176,
    height: 144,
    frameRate: 15
    /** 共享屏幕分辨率 */
  };RongRTCConstant.ShareProfile_default = {
    width: 1280,
    height: 720,
    frameRate: 15
    /** 带宽 */
  };RongRTCConstant.BandWidth_default = {
    min: 100,
    max: 500
    /** 带宽全部 */
  };RongRTCConstant.BandWidth_320_240 = {
    min: 100,
    max: 320
  };
  RongRTCConstant.BandWidth_640_480 = {
    min: 100,
    max: 500
  };
  RongRTCConstant.BandWidth_1280_720 = {
    min: 100,
    max: 1500
  };
  RongRTCConstant.BandWidth_ScreenShare_1280_720 = {
    min: 1000,
    max: 1500
    /**
    * 屏幕共享状态码
    *
    */
  };RongRTCConstant.ScreenShareSupportCode = {
    /** 支持 */
    Support: 0,
    /** 浏览器不支持 */
    BrowserNotSupport: 1,
    /** 未安装插件 */
    NoPlugin: 2
    /**
    * 视频类型
    *
    */
  };RongRTCConstant.VideoType = {
    /** 普通音视频 */
    NORMAL: 1,
    /** 屏幕共享 */
    SCREEN: 2
    /**
    * 流后缀
    *
    */
  };RongRTCConstant.StreamSuffix = {
    TINY: '_tiny',
    SCREEN: '_screen'
    /**
    * Track后缀
    *
    */
  };RongRTCConstant.TrackSuffix = {
    VIDEO: '_video',
    AUDIO: '_audio'
    /** 用户关心的通知类型 */
  };RongRTCConstant.CareType = {
    /** 错误，不符合标准的值 */
    Error: -1,
    /** 不关心任何通知 */
    None: 0,
    /** 关心人员进出变更通知 */
    MemberChange: 1,
    /** 关心阅资源发布类型变更通知 */
    ResourceChange: 2,
    /** 关心人员进出和资源发布类型变更通知 */
    MemberAndResourceChange: 3,
    /** 关心订阅列表信息变更通知 */
    SubscribeChange: 4,
    /** 关心人员进出和订阅列表信息变更通知 */
    MemberAndSubscribeChange: 5,
    /** 关心资源发布类型和订阅列表信息变更通知 */
    ResourceAndSubscribeChange: 6,
    /** 关心所有类型通知 */
    All: 7
    /** 资源发布的类型 */
  };RongRTCConstant.ResourceType = {
    /** 错误，不符合标准的值 */
    Error: -1,
    /** 不发布任何资源 */
    None: 0,
    /** 只发布音频 */
    AudioOnly: 1,
    /** 只发布视频 */
    VideoOnly: 2,
    /** 发布音频和视频 */
    AudioAndVideo: 3,
    /** 发布屏幕共享 */
    ScreenSharing: 4,
    /** 发布音频和屏幕共享 */
    AudioAndScreenSharing: 5,
    /** 发布视频和屏幕共享 */
    VideoAndScreenSharing: 6,
    /** 发布音视频和屏幕共享 */
    AudioAndVideoAndScreenSharing: 7
    /** 资源订阅的类型 */
  };RongRTCConstant.SubscribeType = {
    /** 错误，不符合标准的值 */
    Error: -1,
    /** 不订阅任何资源 */
    None: 0,
    /** 只订阅音频 */
    AudioOnly: 1,
    /** 只订阅视频 */
    VideoOnly: 2,
    /** 订阅音频和视频 */
    AudioAndVideo: 3,
    /** 订阅屏幕共享 */
    ScreenSharing: 4,
    /** 订阅音频和屏幕共享 */
    AudioAndScreenSharing: 5,
    /** 订阅视频和屏幕共享 */
    VideoAndScreenSharing: 6,
    /** 订阅音视频和屏幕共享 */
    AudioAndVideoAndScreenSharing: 7
    /**
    * 错误
    *
    */
  };RongRTCConstant.ErrorType = {
    UserNotExist: '用户不存在'
    /**
    * 管理类型
    *
    */
  };RongRTCConstant.ManageType = {
    Manage: 1,
    Apply: 2
    /** 信令 */
  };RongRTCConstant.SignalType = {
    /** 请求信令 */
    // LOGON : 'logon',
    // JOIN : 'join',
    // PING : 'ping',
    LOGONANDJOIN: 'logonAndJoin',
    CHANNEL_PING: 'channelPing',
    LEAVE: 'leave',
    UPDATETALKTYPE: 'updateTalkType',
    TURNTALKTYPE: 'turntalktype',
    SCREENSHARING: 'screensharing',
    /** 应答信令 */
    LOGONANDJOIN_RESULT: 'logonAndJoin_result',
    CHANNEL_PING_RESULT: 'channelPing_result',
    LEAVE_RESULT: 'leave_result',
    UPDATETALKTYPE_RESULT: 'updateTalkType_result',
    TURNTALKTYPE_RESULT: 'turntalktype_result',
    SCREENSHARING_RESULT: 'screensharing_result',
    /** 通知信令 */
    JOINED: 'joined',
    LEFT: 'left',
    OFFER_REQUEST: 'offerRequest',
    UPDATETALKTYPE_NOTIFY: 'update_talktype',
    TURNTALKTYPE_NOTIFY: 'turntalktype',
    SCREENSHARING_NOTIFY: 'screensharing',
    /** exchange信令 */
    EXCHANGE: 'exchange',
    EXCHANGE_RESULT: 'exchange_result',
    /** 白板信令 */
    EWBCREATE: 'ewb_create',
    EWBQUERY: 'ewb_query',
    CREATE_MULTI: 'ewb_create_multi',
    DELETE: 'ewb_delete',
    EWBCREATE_RESULT: 'ewb_create_result',
    EWBQUERY_RESULT: 'ewb_query_result',
    EWBCREATE_NOTIFY: 'ewb_create_notify',
    CREATEMULTI_RESULT: 'ewb_create_multi_result',
    DELETEWHITEBOARD_RESULT: 'delete_result',
    /** 会控信令 */
    // rolechange
    ROLECHANGE: 'rolechange',
    ROLECHANGE_RESULT: 'rolechange_result',
    ROLECHANGE_NOTIFY: 'rolechange',
    // apply
    APPLY: 'apply',
    APPLY_RESULT: 'apply_result',
    APPLY_NOTIFY: 'apply',
    // manageaction
    MANAGEACTION: 'manageaction',
    MANAGEACTION_RESULT: 'manageaction_result',
    MANAGEACTION_NOTIFY: 'manageaction',
    // channelanswer
    CHANNELANSWER: 'channelanswer',
    CHANNELANSWER_RESULT: 'channelanswer_result',
    CHANNELANSWER_NOTIFY: 'channelanswer',
    //shareType
    SHARETYPE: 'sharetype',
    SHARETYPE_RESULT: 'sharetype_result',
    SHARETYPE_NOTIFY: 'sharetype',
    /** 大小流 */
    FLOWSUBSCRIBE: 'flowSubscribe',
    /** 订阅分发信令 */
    // update_resource
    UPDATE_RESOURCE: 'update_resource',
    UPDATE_RESOURCE_RESULT: 'update_resource_result',
    UPDATE_RESOURCE_NOTIFY: 'update_resource_notify',
    // update_subscribe
    UPDATE_SUBSCRIBE: 'update_subscribe',
    UPDATE_SUBSCRIBE_RESULT: 'update_subscribe_result',
    UPDATE_SUBSCRIBE_NOTIFY: 'update_subscribe_notify',
    // manage_update_resource_subscribe
    MANAGE_UPDATE_RESOURCE_SUBSCRIBE: 'manage_update_resource_subscribe',
    MANAGE_UPDATE_RESOURCE_SUBSCRIBE_RESULT: 'manage_update_resource_subscribe_result',
    MANAGE_UPDATE_RESOURCE_NOTIFY: 'manage_update_resource_notify',
    MANAGE_UPDATE_SUBSCRIBE_NOTIFY: 'manage_update_subscribe_notify',
    // manage_answer_update_resource
    MANAGE_ANSWER_UPDATE_RESOURCE: 'manage_answer_update_resource',
    MANAGE_ANSWER_UPDATE_RESOURCE_RESULT: 'manage_answer_update_resource_result',
    MANAGE_ANSWER_UPDATE_RESOURCE_NOTIFY: 'manage_answer_update_resource',
    // manage_answer_update_subscribe
    MANAGE_ANSWER_UPDATE_SUBSCRIBE: 'manage_answer_update_subscribe',
    MANAGE_ANSWER_UPDATE_SUBSCRIBE_RESULT: 'manage_answer_update_subscribe_result',
    MANAGE_ANSWER_UPDATE_SUBSCRIBE_NOTIFY: 'manage_answer_update_subscribe',
    /** 共享列表更新 */
    UPDATE_SHARE_LIST: 'update_share_list'
    /** ----- 常量定义 ----- */

    /** ----- RongRTCEngine ----- */
    //var RongRTCEngine = (function() {
    /**
    * 构造函数
    *
    */
  };var RongRTCEngine = function RongRTCEngine(wsNavUrl) {
    this.init(wsNavUrl);
    // 初始化屏幕共享
    this.initScreenShare();
    return this;
  };
  /**
  * 初始化
  *
  */
  RongRTCEngine.prototype.init = function (wsNavUrl) {
    /** logon version */
    this.logonVersion = RongRTCConstant.LogonVersion.SUBSCRIBE;

    /** ----- Stream信息 ----- */
    /** 本地视频流 */
    this.localStream = null;
    /** 本地屏幕共享流 */
    this.localScreenStream = null;
    /** 本地视频小流 */
    this.localMinStream = null;
    /** 远端视频流集合 */
    this.remoteStreams = new RongRTCMap();
    /** 远端屏幕共享流集合 */
    this.remoteScreenStreams = new RongRTCMap();
    /** ----- Stream信息 ----- */

    /** ----- Track信息 ----- */
    /** 本地音频Track */
    this.localAudioTrack = null;
    /** 本地视频Track */
    this.localVideoTrack = null;
    /** 本地屏幕共享视频Track */
    this.localScreenVideoTrack = null;
    /** 本地Track的操作方式, true表示start/stop, false表示enable, 订阅分发版本开始支持start/stop */
    this.isStartStopLocalTrack = true;
    /** ----- Track信息 ----- */

    /** 连接集合 */
    this.peerConnections = {};
    /** 连接的用户集合 */
    this.joinedUsers = new RongRTCMap();
    /** remote cname Map */
    this.remoteCnameMap = new RongRTCMap();
    /** remote Sdp Map */
    this.remoteSdpMap = new RongRTCMap();
    /** remote trackId Map */
    this.remoteTrackIdMap = new RongRTCMap();

    /** ----- 连接信息 ----- */
    /** keepAlive连续失败次数计数器 */
    this.keepAliveFailedTimes = 0;
    /** keepAlive间隔 */
    this.keepAliveInterval = null;
    /** keepAlive未收到result计时 */
    this.keepAliveTimerCount = 0;
    /** keepAlive未收到result计时器 */
    this.keepAliveTimer = null;
    /** reconnect连续次数计数器 */
    this.reconnectTimes = 0;
    /** csequence */
    this.csequence = 0;
    /** websocket对象 */
    this.signaling = null;
    /** websocket消息队列 */
    this.wsQueue = [];
    /** websocket连接状态, true:已连接, false:未连接 */
    this.wsConnectionState = null;
    /** websocket是否强制关闭：true:是, false不是 */
    this.wsForcedClose = false;
    /** websocket是否需要重连：true:是, false不是 */
    this.wsNeedConnect = true;
    /** websocket地址列表 */
    this.wsUrlList = [];
    /** websocket地址索引 */
    this.wsUrlIndex = 0;
    // 设置websocket nav url
    this.wsNavUrl = wsNavUrl;
    /** ----- 连接信息 ----- */

    /** ----- 房间信息 ----- */
    /** 会议ID */
    this.channelId = null;
    /** token */
    this.token = null;
    /** 纯音频 */
    this.isAudioOnly = false;
    /** 本地音频开关 */
    this.localAudioEnable = true;
    /** 本地视频开关 */
    this.localVideoEnable = true;
    /** 远端音频开关 */
    this.remoteAudioEnable = true;
    /** logonAndJoin status 登录类型，第一次登录加入房间传0，断线重连传1 */
    this.logonAndJoinStatus = null;
    /** offer status */
    this.offerStatus = null;
    /** 白板url */
    this.ewbUrl = '';
    /** 白板id */
    this.ewbId = [];
    /** ----- 房间信息 ----- */

    /** ----- 用户信息 ----- */
    this.userId;
    this.userType = RongRTCConstant.UserType.NORMAL;
    this.talkType = RongRTCConstant.TalkType.All;
    this.userName;
    /** 订阅分发 */
    this.care = RongRTCConstant.CareType.All;
    this.resource = RongRTCConstant.ResourceType.AudioAndVideo;
    this.defaultSub = RongRTCConstant.SubscribeType.AudioAndVideo;
    this.specialSubs = [];
    /** ----- 用户信息 ----- */

    /** ----- 视频参数 ----- */
    /** media config */
    this.mediaConfig = {
      video: RongRTCConstant.VideoProfile_default,
      audio: true
      /** bandwidth */
    };this.videoMaxRate = RongRTCConstant.BandWidth_default.max;
    this.videoMinRate = RongRTCConstant.BandWidth_default.min;
    this.bandWidth = {
      min: this.videoMinRate,
      max: this.videoMaxRate
    };
    /** ----- 视频参数 ----- */

    /** ----- StatsReport ----- */
    /** 是否上报丢包率信息 */
    this.isSendLostReport = false;
    /** RongRTCConnectionStatsReport */
    this.rongRTCConnectionStatsReport = null;
    /** getStatsReport间隔 */
    this.getStatsReportInterval = null;
    /** ----- StatsReport ----- */

    /** ----- 屏幕共享 ----- */
    /** 屏幕共享状态 */
    this.screenSharingStatus = false;
    /** 屏幕共享流是否分离 */
    this.isScreenStreamSeparate = false;
    if (this.isScreenStreamSeparate) {
      // 屏幕共享流分离
      this.defaultSub = RongRTCConstant.SubscribeType.AudioAndVideoAndScreenSharing;
    }
    /** ----- 屏幕共享 ----- */

    /** ----- 大小流 ----- */
    /** 是否开启小流 */
    this.isEnableMinStream = false;
    /** ----- 大小流 ----- */
  };
  /**
  * 初始化屏幕共享
  *
  */
  RongRTCEngine.prototype.initScreenShare = function () {
    // 绑定插件监听事件
    this.addEventListener();
    // 检测插件
    setTimeout(function () {
      window.postMessage('test', '*');
    }, 1000);
  };
  /**
  * reset
  *
  */
  RongRTCEngine.prototype.reset = function () {};
  /**
  * clear
  *
  */
  RongRTCEngine.prototype.clear = function () {
    this.exitScheduleKeepAlive();
    this.exitScheduleKeepAliveTimer();
    this.disconnect(false);
    this.closePeerConnection(this.userId);
    this.localStream = null;
  };
  /** ----- 提供能力 ----- */
  /**
  * 获取RongRTC SDK版本号
  *
  * @return sdkversion
  */
  RongRTCEngine.prototype.getSDKVersion = function () {
    return RongRTCConstant.SDK_VERSION_NAME;
  };
  /**
  * 设置RongRTCEngineEventHandle监听
  *
  */
  RongRTCEngine.prototype.setRongRTCEngineEventHandle = function (rongRTCEngineEventHandle) {
    this.rongRTCEngineEventHandle = rongRTCEngineEventHandle;
  };
  /**
  * 设置视频参数
  *
  */
  RongRTCEngine.prototype.setVideoParameters = function (config) {
    if (config.USER_TYPE != null && config.USER_TYPE == RongRTCConstant.UserType.OBSERVER) {
      this.userType = RongRTCConstant.UserType.OBSERVER;
    }
    if (config.IS_AUDIO_ONLY != null) {
      this.isAudioOnly = config.IS_AUDIO_ONLY;
    }
    if (config.IS_CLOSE_VIDEO != null) {
      this.localVideoEnable = !config.IS_CLOSE_VIDEO;
    }
    if (config.VIDEO_PROFILE != null) {
      /** media config */
      this.mediaConfig.video = config.VIDEO_PROFILE;
    }
    /** bandwidth */
    if (config.VIDEO_MAX_RATE != null) {
      this.videoMaxRate = config.VIDEO_MAX_RATE;
      this.bandWidth.max = this.videoMaxRate;
    } else if (config.VIDEO_PROFILE.width != null && config.VIDEO_PROFILE.height != null) {
      var bandWidth_resulotion = RongRTCConstant["BandWidth_" + config.VIDEO_PROFILE.width + "_" + config.VIDEO_PROFILE.height];
      if (bandWidth_resulotion != null) {
        this.videoMaxRate = bandWidth_resulotion.max;
        this.bandWidth.max = this.videoMaxRate;
      }
    }
    if (config.VIDEO_MIN_RATE != null) {
      this.videoMinRate = config.VIDEO_MIN_RATE;
      this.bandWidth.min = this.videoMinRate;
    } else if (config.VIDEO_PROFILE.width != null && config.VIDEO_PROFILE.height != null) {
      var bandWidth_resulotion = RongRTCConstant["BandWidth_" + config.VIDEO_PROFILE.width + "_" + config.VIDEO_PROFILE.height];
      if (bandWidth_resulotion != null) {
        this.videoMinRate = bandWidth_resulotion.min;
        this.bandWidth.min = this.videoMinRate;
      }
    }

    if (this.userType == RongRTCConstant.UserType.OBSERVER) {
      // 观察者
      this.talkType = RongRTCConstant.TalkType.None;
      this.resource = RongRTCConstant.ResourceType.None;
    } else {
      this.talkType = this.localVideoEnable ? RongRTCConstant.TalkType.All : RongRTCConstant.TalkType.OnlyAudio;
      this.resource = this.localVideoEnable ? RongRTCConstant.ResourceType.AudioAndVideo : RongRTCConstant.ResourceType.AudioOnly;
    }
  };
  /**
  * 列举 麦克风  摄像头
  * @return audioState ：0 没有麦克风 1 有 ；videoState 0 没有摄像头 1 有
  */
  // RongRTCEngine.prototype.audioVideoState = async function () {
  //   // 列举设备 audioState  videoState
  //   let audioState = 0;
  //   let videoState = 0;
  //   let audioAuthorized = 0;
  //   let videoAuthorized = 0;
  //   await navigator.mediaDevices.enumerateDevices().then(function (deviceInfos) {
  //       let deviceArr = deviceInfos.map(function(deviceInfo, index) {
  //           return deviceInfo.kind;
  //       })
  //       deviceArr.forEach(function(kind) {
  //           if (kind.indexOf('video') > -1)
  //               videoState = 1;
  //           if (kind.indexOf('audio') > -1)
  //               audioState = 1;
  //       })
  //   });
  //   if (videoState) {
  //       await  navigator.mediaDevices.getUserMedia({video: true, audio: false}).then(function(data)  {
  //           videoAuthorized = 1;
  //       }).catch(function(error)  {
  //           if (error.name == 'PermissionDeniedError')
  //               videoAuthorized = 0;
  //       })

  //   }
  //   if (audioState) {
  //       await  navigator.mediaDevices.getUserMedia({video: false, audio: true}).then(function(data)  {
  //           audioAuthorized = 1;
  //       }).catch(function(error)  {
  //           if (error.name == 'PermissionDeniedError')
  //               audioAuthorized = 0;
  //       })
  //   }
  //   return {
  //       audioState: audioState,
  //       audioAuthorized: audioAuthorized,
  //       videoState: videoState,
  //       videoAuthorized: videoAuthorized
  //   }
  // }
  /**
  * 获取本地视频流
  * 
  */
  RongRTCEngine.prototype.getLocalDeviceStream = function () {
    var rongRTCEngine = this;
    return navigator.mediaDevices.getUserMedia(rongRTCEngine.mediaConfig).then(function (stream) {
      console.info("navigator.getUserMedia success");
      rongRTCEngine.localStream = stream;
      if (!rongRTCEngine.localVideoEnable) {
        rongRTCEngine.closeLocalVideoWithUpdateTalkType(!rongRTCEngine.localVideoEnable, false);
      }
      return stream;
    }).catch(function (error) {
      console.error(error);
    });
  };
  /**
  * 获取设备信息
  * 
  */
  RongRTCEngine.prototype.getDevicesInfos = function () {
    return navigator.mediaDevices.enumerateDevices().then(function (deviceInfos) {
      return deviceInfos;
    }).catch(function (error) {
      console.error(error);
    });
  };
  /**
  * 检测 麦克风  摄像头
  * 
  */
  RongRTCEngine.prototype.checkDeviceState = function () {
    var rongRTCEngine = this;
    return rongRTCEngine.getDevicesInfos().then(function (deviceInfos) {
      var input = false;
      var output = false;
      var videoState = false;
      deviceInfos.forEach(function (deviceInfo) {
        var kind = deviceInfo.kind;
        if (kind.indexOf('video') > -1) videoState = true;
        if (kind.indexOf('audioinput') > -1) input = true;
        if (kind.indexOf('audiooutput') > -1) output = true;
      });
      var audioState = {
        input: input,
        output: output
      };
      return {
        audioState: audioState,
        videoState: videoState
      };
    }).catch(function (error) {
      console.error(error);
    });
  };
  /**
  *摄像头信息获取
  */
  RongRTCEngine.prototype.getVideoInfos = function () {
    var rongRTCEngine = this;
    return rongRTCEngine.getDevicesInfos().then(function (deviceInfos) {
      var videoInfoList = rongRTCEngine.videoInfoList;
      deviceInfos.forEach(function (deviceInfo) {
        var kind = deviceInfo.kind;
        if (kind.indexOf('video') > -1) {
          var deviceId = deviceInfo.deviceId;
          var label = deviceInfo.label;
          deviceInfo = {
            deviceId: deviceId,
            label: label
          };
          videoInfoList.push(deviceInfo);
        }
      });
      return videoInfoList;
    }).catch(function (error) {
      console.error(error);
    });
  };
  /**
  *摄像头切换
  */
  RongRTCEngine.prototype.switchVideo = function (deviceId) {
    var rongRTCEngine = this;
    var oldStream = rongRTCEngine.localStream;
    if (oldStream) {
      oldStream.getTracks().forEach(function (track) {
        track.stop();
      });
    }
    if (deviceId) {
      var config = rongRTCEngine.mediaConfig;
      var video = config.video;
      video.deviceId = { exact: deviceId };
    }
    this.getLocalDeviceStream().then(function (stream) {
      rongRTCEngine.localStream = stream;
      var pcClient = rongRTCEngine.peerConnections[rongRTCEngine.selfUserId];
      if (pcClient != null) {
        var pc = pcClient['pc'];
        pc.removeStream(oldStream);
        pc.addStream(stream);
        rongRTCEngine.createOffer(pc, rongRTCEngine.selfUserId, true);
      }
      rongRTCEngine.rongRTCEngineEventHandle.call("onSwithVideo", {
        "isSuccess": true
      });
    }).catch(function (error) {
      console.error("navigator.mediaDevices error", error);
    });
  };
  /**
  * 加入会议
  *
  */
  RongRTCEngine.prototype.joinChannel = function (channelId, userId, token, userName) {
    var rongRTCEngine = this;
    this.checkDeviceState().then(function (status) {
      var audioState = status.audioState;
      var input = audioState.input;
      var videoState = status.videoState;
      if (!videoState) {
        var key = 'NOCAMERA';
        console.error("navigator.mediaDevices.getUserMedia error");
        return;
      }
      if (!input) {
        var key = 'NOAUDIOINPUT';
        console.error("navigator.mediaDevices.getUserMedia error");
        return;
      }
      rongRTCEngine.channelId = RongRTCConstant.ConnectionType.MEDIASERVER + channelId;
      rongRTCEngine.userId = userId;
      rongRTCEngine.token = token;
      rongRTCEngine.userName = userName;
      // 创建本地视频    pc.addStream(rongRTCEngine.localStreamMin);//加入小流
      if (rongRTCEngine.userType == 2) {
        rongRTCEngine.createSignaling();
        rongRTCEngine.logonAndJoin(RongRTCConstant.LogonAndJoinStatus.CONNECT);
        rongRTCEngine.localStream = new MediaStream();
        return;
      }
      var mediaConfig = {};
      if (rongRTCEngine.isSubscribeVersion()) {
        // 订阅分发版本
        mediaConfig = rongRTCEngine.getMediaConfig(rongRTCEngine.localVideoEnable, rongRTCEngine.localAudioEnable);
      } else {
        mediaConfig = rongRTCEngine.getMediaConfig(true, true);
      }
      if (rongRTCEngine.videoId) {
        var config = rongRTCEngine.mediaConfig;
        var video = config.video;
        video.deviceId = { exact: rongRTCEngine.videoId };
      }
      rongRTCEngine.getLocalDeviceStream(rongRTCEngine.mediaConfig).then(function (stream) {
        console.info(new Date(), "joinChannel navigator.getUserMedia success");
        rongRTCEngine.setLocalStream(stream);
        rongRTCEngine.createSignaling();
        rongRTCEngine.logonAndJoin(RongRTCConstant.LogonAndJoinStatus.CONNECT);
      }).catch(function (error) {
        console.error("navigator.mediaDevices.getUserMedia error: ", error);
      });
      if (rongRTCEngine.isEnableMinStream) {
        // 开启了小流
        var minMediaConfig = rongRTCEngine.getMinMediaConfig();
        rongRTCEngine.getLocalDeviceStream(minMediaConfig).then(function (stream) {
          console.info(new Date(), "joinChannel navigator.getMinUserMedia success");
          rongRTCEngine.localMinStream = stream;
        }).catch(function (error) {
          console.error(new Date(), "joinChannel navigator.getMinUserMedia error: ", error);
        });
      }
    }).catch(function (error) {
      console.error("navigator.mediaDevices.enumerateDevices: ", error);
    });
  };
  /**
  * 离开会议
  *
  */
  RongRTCEngine.prototype.leaveChannel = function () {
    this.leave();
  };
  /**
  * 获取本地视频视图
  * @Deprecated
  *
  */
  RongRTCEngine.prototype.getLocalVideoView = function () {
    return this.getLocalStream();
  };
  /**
  * 获取远端视频视图
  * @Deprecated
  *
  */
  RongRTCEngine.prototype.getRemoteVideoView = function (userId) {
    return this.getRemoteStream(userId);
  };
  /**
  * 获取本地视频流/屏幕共享流
  *
  */
  RongRTCEngine.prototype.getLocalStream = function (videoType) {
    if (videoType == RongRTCConstant.VideoType.SCREEN) {
      // 屏幕共享流
      return this.getLocalScreenStream();
    }
    return this.localStream;
  };
  /**
  * 获取本地屏幕共享流
  *
  */
  RongRTCEngine.prototype.getLocalScreenStream = function () {
    return this.localScreenStream;
  };
  /**
  * 获取远端视频流/屏幕共享流
  *
  */
  RongRTCEngine.prototype.getRemoteStream = function (userId, videoType) {
    if (videoType == RongRTCConstant.VideoType.SCREEN) {
      // 屏幕共享流
      return this.remoteScreenStreams.get(userId);
    }
    return this.remoteStreams.get(userId);
  };
  /**
  * 创建本地视频视图
  *
  */
  RongRTCEngine.prototype.createLocalVideoView = function (videoType) {
    var localVideoView = this.createVideoView();
    // ID
    if (videoType == RongRTCConstant.VideoType.SCREEN) {
      // 屏幕共享流
      localVideoView.id = this.userId + RongRTCConstant.StreamSuffix.SCREEN;
    } else {
      localVideoView.id = this.userId;
    }
    // 本地视频静音
    localVideoView.muted = true;
    // 附加视频流
    localVideoView.srcObject = this.getLocalStream(videoType);
    return localVideoView;
  };
  /**
  * 创建远端视频视图
  *
  */
  RongRTCEngine.prototype.createRemoteVideoView = function (userId, videoType) {
    var remoteVideoView = this.createVideoView();
    // ID
    if (videoType == RongRTCConstant.VideoType.SCREEN) {
      // 屏幕共享流
      remoteVideoView.id = userId + RongRTCConstant.StreamSuffix.SCREEN;
    } else {
      remoteVideoView.id = userId;
    }
    // 附加视频流
    remoteVideoView.srcObject = this.getRemoteStream(userId, videoType);  return remoteVideoView;
  };
  /**
  * 关闭/打开麦克风, true:关闭, false:打开
  * @Deprecated
  */
  RongRTCEngine.prototype.muteMicrophone = function (isMute) {
    console.info(new Date(), "Microphone mute=" + isMute);
    this.controlAudioVideoDevice(RongRTCConstant.DeviceType.Microphone, !isMute);
  };
  /**
  * 关闭/打开本地摄像头, true:关闭, false:打开
  * @Deprecated
  */
  RongRTCEngine.prototype.closeLocalVideo = function (isCameraClose) {
    console.info(new Date(), "Local video close=" + isCameraClose);
    this.controlAudioVideoDevice(RongRTCConstant.DeviceType.Camera, !isCameraClose);
  };
  /**
  * 打开/关闭本地音频/视频
  *
  */
  RongRTCEngine.prototype.controlAudioVideoDevice = function (deviceType, isOpen) {
    if (this.isSubscribeVersion()) {
      // 订阅分发版本
      var operationType = isOpen ? RongRTCConstant.OperationType.OPEN : RongRTCConstant.OperationType.CLOSE;
      var resource = this.convertResource(this.resource, deviceType, operationType);
      this.updateResource(resource);
    } else {
      // 变更talkType
      this.changeTalkType(this.userId, deviceType, isOpen);
      // 发送信令
      var index = isOpen ? RongRTCConstant.OperationType.OPEN : RongRTCConstant.OperationType.CLOSE;
      this.turnTalkType(deviceType, index);
    }
  };
  /**
  * 关闭本地媒体流（视频流和音频流）
  *
  */
  RongRTCEngine.prototype.closeLocalStream = function () {
    // 本地视频流
    if (this.localAudioTrack) {
      this.localAudioTrack.stop();
    }
    if (this.localVideoTrack) {
      this.localVideoTrack.stop();
    }
    if (this.localStream && this.localStream.getTracks()) {
      this.localStream.getTracks().forEach(function (track) {
        track.stop();
      });
    }
    // 屏幕共享流
    if (this.localScreenVideoTrack) {
      this.localScreenVideoTrack.stop();
    }
    if (this.localScreenStream && this.localScreenStream.getTracks()) {
      this.localScreenStream.getTracks().forEach(function (track) {
        track.stop();
      });
    }
    // 小流
    if (this.isEnableMinStream && this.localMinStream) {
      if (this.localMinStream && this.localMinStream.getTracks()) {
        this.localMinStream.getTracks().forEach(function (track) {
          track.stop();
        });
      }
    }
  };
  /**
  * 关闭/打开远端声音, true:关闭, false:打开
  *
  */
  RongRTCEngine.prototype.closeRemoteAudio = function (isAudioClose) {
    console.info(new Date(), "Remote audio close=" + isAudioClose);
    this.remoteAudioEnable = !isAudioClose;
    if (this.remoteStreams && this.remoteStreams.getEntrys()) {
      this.remoteStreams.getEntrys().forEach(function (remoteStreamEntry) {
        if (remoteStreamEntry) {
          var remoteStream = remoteStreamEntry.value;
          if (remoteStream && remoteStream.getAudioTracks()) {
            remoteStream.getAudioTracks().forEach(function (track) {
              track.enabled = !isAudioClose;
            });
          }
        }
      });
    }
  };
  /** ----- 白板能力 ----- */
  /**
  * 请求白板页面 HTTP URL
  *
  */
  RongRTCEngine.prototype.requestWhiteBoardURL = function () {
    this.ewbCreate();
  };
  /**
  * 查询白板
  *
  */
  RongRTCEngine.prototype.queryWhiteBoard = function () {
    if (this.ewbUrl != null && this.ewbUrl != '') {
      this.rongRTCEngineEventHandle.call('onWhiteBoardQuery', {
        'isSuccess': true,
        'url': this.ewbUrl
      });
    } else {
      this.ewbQuery();
    }
  };
  /**
  * 创建多白板
  *
  *
  */
  RongRTCEngine.prototype.createMutiWhiteBoard = function () {
    this.sendMsg(RongRTCConstant.SignalType.CREATE_MULTI, null, {
      'key': this.channelId
    });
  };
  /**
  * 白板删除
  *
  *
  */
  RongRTCEngine.prototype.deleteWhiteBoard = function (id, callBack) {
    var ewbIds = this.ewbId;
    var checkId = ewbIds.forEach(function (item) {
      if (item == id) {
        return false;
      }
      return true;
    });
    if (checkId) {
      callBack(RongRTCConstant.ErrorType.UserNotExist);
      return;
    }
    this.sendMsg(RongRTCConstant.SignalType.DELETE, null, {
      'key': this.channelId,
      'serverData': id
    });
  };
  /** ----- 白板能力 ----- */
  /**
  * 设置是否上报丢包率信息
  *
  */
  RongRTCEngine.prototype.enableSendLostReport = function (enable) {
    this.isSendLostReport = enable;
  };
  /** ----- 屏幕共享能力 ----- */
  /**
  * 设置屏幕共享流是否分离
  *
  */
  RongRTCEngine.prototype.setScreenStreamSeparate = function (isScreenStreamSeparate) {
    this.isScreenStreamSeparate = isScreenStreamSeparate;
    if (this.isScreenStreamSeparate) {
      // 屏幕共享流分离
      this.defaultSub = RongRTCConstant.SubscribeType.AudioAndVideoAndScreenSharing;
    } else {
      this.defaultSub = RongRTCConstant.SubscribeType.AudioAndVideo;
    }
  };
  /**
  * 开启屏幕共享
  *
  */
  RongRTCEngine.prototype.startScreenShare = function (stream) {
    if (stream) {
      // rce electron 直接可以获取屏幕流 不安装插件
      this.screenShareWithStream(stream);
    } else {
      // 检查是否支持
      var screenShareSupportStatus = this.checkScreenShareSupport();
      if (screenShareSupportStatus != 0) {
        // 不支持
        this.rongRTCEngineEventHandle.call('onStartScreenShareComplete', {
          'isSuccess': false,
          'code': screenShareSupportStatus
        });
        return;
      }
      // 发起屏幕共享
      this.requestScreenShare();
    }
  };
  /**
  * 关闭屏幕共享
  *
  */
  RongRTCEngine.prototype.stopScreenShare = function (option) {
    //	if (this.isScreenStreamSeparate) { // 屏幕共享流分离
    //		// stop后会关闭弹出的屏幕共享工具条
    //		this.localScreenStream.getVideoTracks()[0].stop();
    //		this._stopScreenShare();
    //	} else {
    //	    var rongRTCEngine = this;
    //		var mediaConfig = this.getMediaConfig(true, false);
    //		RongRTCUtil.getMedia(mediaConfig).then(function (stream) {
    //			// 移除原屏幕共享流videoTrack
    //			var oldVideoTrack = rongRTCEngine.localStream.getVideoTracks()[0];
    //		    oldVideoTrack.stop();
    //			rongRTCEngine.localStream.removeTrack(oldVideoTrack);
    //		    // 将视频流videoTrack加入到流中
    //			rongRTCEngine.localStream.addTrack(stream.getVideoTracks()[0]);
    //			// // 刷新本地视频窗口的流
    //			// RongRTCUtil.setMediaStream(rongRTCEngine.userId, rongRTCEngine.localStream);
    //
    //			rongRTCEngine._stopScreenShare();
    //	    }).catch(function (error) {
    //	        console.error(new Date(), "stopScreenShare getMedia error: " + error);
    //	        rongRTCEngine.rongRTCEngineEventHandle.call('onStopScreenShareComplete', {
    //	            'isSuccess': false
    //	        });
    //	    });
    //	}
    if (this.localScreenVideoTrack) {
      // 移除screenVideoTrack
      if (this.isScreenStreamSeparate) {
        // 屏幕共享流分离
        this.localScreenStream.removeTrack(this.localScreenVideoTrack);
      } else {
        this.localStream.removeTrack(this.localScreenVideoTrack);
      }
      // stop后会关闭弹出的屏幕共享工具条
      this.localScreenVideoTrack.stop();
      this.localScreenVideoTrack = null;
    }
    if (this.isScreenStreamSeparate) ; else {
      if (this.isSubscribeVersion() && this.isStartStopLocalTrack) {
        // 订阅分发版本且是start/stop track
        if (this.localVideoEnable) {
          var callback = function callback(rongRTCEngine) {
            rongRTCEngine._stopScreenShare(option);
          };
          this.startLocalTrack(RongRTCConstant.DeviceType.Camera, callback);
          return;
        }
      } else {
        // 将视频流videoTrack加入到流中
        if (this.localVideoTrack) {
          this.localStream.addTrack(this.localVideoTrack);
        }
        // // 刷新本地视频窗口的流
        // RongRTCUtil.setMediaStream(this.userId, this.localStream);
      }
    }
    this._stopScreenShare(option);
  };
  /** ----- 屏幕共享能力 ----- */
  /** ----- 会控能力 ----- */
  RongRTCEngine.prototype.contains = function (userId) {
    return this.joinedUsers.contains(userId);
  };
  /**
  * 主持人或者主讲人调用发起, 指定画布显示屏幕共享
  *
  */
  RongRTCEngine.prototype.shareContentScreen = function (userId, callBack) {
    if (!this.contains(userId)) {
      callBack(RongRTCConstant.ErrorType.UserNotExist);
    }
    var content = userId;
    content = JSON.stringify(content);
    this.shareType(userId, RongRTCConstant.MeetingActionType.ShareType.ShareScreen, content);
  };
  /**
  * 主持人或者主讲人调用发起, 指定画布显示白板
  *
  */
  RongRTCEngine.prototype.shareContentEWB = function (id, url, callBack) {
    if (id == null) {
      callBack(RongRTCConstant.ErrorType.UserNotExist);
    }
    var content = {
      'whiteboard_id': id,
      'whiteboard_url': url
    };
    content = JSON.stringify(content);
    this.shareType(url, RongRTCConstant.MeetingActionType.ShareType.ShareEWB, content);
  };
  /**
  * 主持人或者主讲人调用发起, 指定画布显示视频
  *
  */
  RongRTCEngine.prototype.shareContentVideo = function (userId, callBack) {
    //  if (!this.contains(userId)) {
    //      callBack(RongRTCConstant.ErrorType.UserNotExist)
    //  }
    var content = userId;
    this.shareType(userId, RongRTCConstant.MeetingActionType.ShareType.ShareVideo, content);
  };
  /**
  * 主持人调用发起, 将与会者设置为主讲人
  *
  */
  RongRTCEngine.prototype.setSpeak = function (userId, callBack) {
    if (!this.contains(userId)) {
      callBack(RongRTCConstant.ErrorType.UserNotExist);
    }
    this.roleChange(userId, RongRTCConstant.MeetingActionType.RoleChange.SetSpeak);
  };
  /**
  * 主持人调用发起, 取消主讲人资格
  *
  */
  RongRTCEngine.prototype.recusalSpeaker = function (userId, callBack) {
    if (!this.contains(userId)) {
      callBack(RongRTCConstant.ErrorType.UserNotExist);
    }
    this.roleChange(userId, RongRTCConstant.MeetingActionType.RoleChange.RecusalSpeaker);
  };

  /**
  * 主持人调用发起, 将正常用户降级为观察者
  *
  */
  RongRTCEngine.prototype.degradeNormalUserToObserver = function (userId) {
    if (this.isSubscribeVersion()) {
      // 订阅分发版本
      var subscribeInfo = {
        'userId': userId,
        'userType': RongRTCConstant.UserType.OBSERVER
      };
      var subscribeInfos = new Array();
      subscribeInfos.push(subscribeInfo);
      this.manageResourceSubscribe(false, subscribeInfos);
    } else {
      this.roleChange(userId, RongRTCConstant.MeetingActionType.RoleChange.DegradeToObserver);
    }
  };
  /**
  * 主持人调用发起, 将观察者升级为正常用户(需要被操作的观察者应答)
  *
  */
  RongRTCEngine.prototype.upgradeObserverToNormalUser = function (userId) {
    if (this.isSubscribeVersion()) {
      // 订阅分发版本
      var subscribeInfo = {
        'userId': userId,
        'userType': RongRTCConstant.UserType.NORMAL
      };
      var subscribeInfos = new Array();
      subscribeInfos.push(subscribeInfo);
      this.manageResourceSubscribe(false, subscribeInfos);
    } else {
      this.roleChange(userId, RongRTCConstant.MeetingActionType.RoleChange.UpgradeToNormal);
    }
  };
  /**
  * 主持人调用, 移除与会人员
  *
  */
  RongRTCEngine.prototype.removeUser = function (userId) {
    this.roleChange(userId, RongRTCConstant.MeetingActionType.RoleChange.RemoveUser);
  };
  /**
  * 观察者调用, 请求发言(需要主持人应答)
  *
  */
  RongRTCEngine.prototype.observerRequestBecomeNormalUser = function () {
    if (this.isSubscribeVersion()) {
      // 订阅分发版本
      var subscribeInfo = {
        'userId': this.userId,
        'userType': RongRTCConstant.UserType.NORMAL
      };
      var subscribeInfos = new Array();
      subscribeInfos.push(subscribeInfo);
      this.manageResourceSubscribe(true, subscribeInfos);
    } else {
      this.apply(RongRTCConstant.MeetingActionType.Apply.RequestUpgradeToNormal);
    }
  };
  /**
  * 与会正常用户调用, 请求获取主持人权限
  *
  */
  RongRTCEngine.prototype.normalUserRequestHostAuthority = function () {
    this.apply(RongRTCConstant.MeetingActionType.Apply.GetHostAuthority);
  };
  /**
  * 任何与会人员调用, 已在房间里的用户获取邀请链接
  *
  */
  RongRTCEngine.prototype.getInviteURL = function () {
    this.apply(RongRTCConstant.MeetingActionType.Apply.GetInviteUrl);
  };
  /**
  * 主持人调用, 操作与会人员麦克风/摄像头的打开/关闭(当打开设备时, 需要被操作人应答; 关闭设备时不需要应答直接关闭)
  *
  */
  RongRTCEngine.prototype.hostControlUserDevice = function (userId, deviceType, isOpen) {
    if (this.isSubscribeVersion()) {
      // 订阅分发版本
      var operationType = isOpen ? RongRTCConstant.OperationType.OPEN : RongRTCConstant.OperationType.CLOSE;
      var user = this.joinedUsers.get(userId);
      var oldResource = user.resource;
      var resource = this.convertResource(oldResource, deviceType, operationType);
      var subscribeInfo = {
        'userId': userId,
        'resource': resource
      };
      var subscribeInfos = new Array();
      subscribeInfos.push(subscribeInfo);
      this.manageResourceSubscribe(false, subscribeInfos);
    } else {
      this.manageAction(userId, deviceType, isOpen ? RongRTCConstant.OperationType.OPEN : RongRTCConstant.OperationType.CLOSE);
    }
  };
  /**
  * 主持人邀请观察者升级成正常用户时, 观察者的应答调用
  *
  */
  RongRTCEngine.prototype.answerUpgradeObserverToNormalUser = function (hostId, isAccept, subscribeInfo) {
    var status = isAccept ? RongRTCConstant.MeetingAnswerType.Accept : RongRTCConstant.MeetingAnswerType.Deny;
    if (this.isSubscribeVersion()) {
      // 订阅分发版本
      this.answerManageResource(false, hostId, status, subscribeInfo);
    } else {
      this.channelAnswer(hostId, RongRTCConstant.MeetingActionType.ChannelAnswer.UpgradeToNormal, null, status);
    }
    //	if (isAccept) {
    //		// 变更为普通与会人员
    //		this.change2Normal(this.userId);
    //	}
  };
  /**
  * 观察者向主持人申请升级成正常用户时, 主持人的应答调用
  *
  */
  RongRTCEngine.prototype.answerObserverRequestBecomeNormalUser = function (userId, isAccept, subscribeInfo) {
    if (isAccept == RongRTCConstant.MeetingAnswerType.Accept) {
      var status = RongRTCConstant.MeetingAnswerType.Accept;
    } else if (isAccept == RongRTCConstant.MeetingAnswerType.Deny) {
      var status = RongRTCConstant.MeetingAnswerType.Deny;
    } else if (isAccept == RongRTCConstant.MeetingAnswerType.Unresponsive) {
      var status = RongRTCConstant.MeetingAnswerType.Unresponsive;
    }
    if (this.isSubscribeVersion()) {
      // 订阅分发版本
      this.answerManageResource(true, userId, status, subscribeInfo);
    } else {
      this.channelAnswer(userId, RongRTCConstant.MeetingAnswerType.ChannelAnswer.RequestUpgradeToNormal, null, status);
    }
    //	if (isAccept) {
    //		// 变更为普通与会人员
    //		this.change2Normal(userId);
    //	}
  };
  /**
  * 主持人把正常用户降级为观察者时, 用户的应答调用
  *
  */

  RongRTCEngine.prototype.answerDegradeNormalUserToObserver = function (hostId, isAccept, subscribeInfo) {
    var status = isAccept ? RongRTCConstant.MeetingAnswerType.Accept : RongRTCConstant.MeetingAnswerType.Deny;
    if (this.isSubscribeVersion()) {
      // 订阅分发版本
      this.answerManageResource(false, hostId, status, subscribeInfo);
    } else {
      this.channelAnswer(hostId, RongRTCConstant.MeetingActionType.ChannelAnswer.DegradeToObserver, null, status);
    }
    //	if (isAccept) {
    //		// 变更为观察者
    //		this.change2Observer(this.userId);
    //	}
  };
  /**
  * 麦克风/摄像头被主持人打开时, 被打开人的应答调用
  *
  */
  RongRTCEngine.prototype.answerHostControlUserDevice = function (hostId, deviceType, isOpen, isAccept, subscribeInfo) {
    var status = isAccept ? RongRTCConstant.MeetingAnswerType.Accept : RongRTCConstant.MeetingAnswerType.Deny;
    if (this.isSubscribeVersion()) {
      // 订阅分发版本
      this.answerManageResource(false, hostId, status, subscribeInfo);
      //
      //    	var resource = subscribeInfo.resource;
      //    	var oldResource = this.resource;
      //		var operation = this.convertOperation(oldResource, resource);
      //		var deviceType = operation.deviceType;
      //		var operationType = operation.operationType;
      //		var isOpen = operationType == RongRTCConstant.OperationType.OPEN ? true : false;
      //      if (isAccept) {
      //        	// 变更资源
      //        	this._updateResource(resource);
      //      }
    } else {
      var index = isOpen ? RongRTCConstant.MeetingActionType.ChannelAnswer.InviteToOpen : RongRTCConstant.MeetingActionType.ChannelAnswer.InviteToClose;
      this.channelAnswer(hostId, index, deviceType, status);
      //    	if (isAccept) {
      //			// 变更talkType
      //			this.changeTalkType(this.userId, deviceType, isOpen);
      //    	}
    }
  };
  /** ----- 会控能力 ----- */
  /** ----- 大小流能力 ----- */
  /**
  * 大小流订阅
  *
  */
  RongRTCEngine.prototype.subscribeStream = function (flowSubscribes) {
    this.flowSubscribe(JSON.stringify(flowSubscribes));
  };
  /** ----- 大小流能力 ----- */
  /** ----- 订阅分发能力 ----- */
  /**
  * 变更资源
  *
  */
  RongRTCEngine.prototype.updateResource = function (resource) {
    // 发信令
    this.update_resource(resource);
    // 变更资源
    this._updateResource(resource);
  };
  /**
  * 变更订阅
  *
  */
  RongRTCEngine.prototype.updateSubscribe = function (defaultSub, specialSubs) {
    this.defaultSub = defaultSub;
    this.specialSubs = specialSubs;
    this.update_subscribe(defaultSub, specialSubs);
  };
  /**
  * 自己申请修改自己的资源订阅或主持人修改其他人的资源订阅
  *
  */
  RongRTCEngine.prototype.manageResourceSubscribe = function (isApply, subscribeInfos) {
    var index = isApply ? RongRTCConstant.ManageType.Apply : RongRTCConstant.ManageType.Manage;
    this.manage_update_resource_subscribe(index, subscribeInfos);
  };
  /**
  * 管理资源发布状态信令的应答
  *
  */
  RongRTCEngine.prototype.answerManageResource = function (isApply, userId, status, subscribeInfo) {
    var index = isApply ? RongRTCConstant.ManageType.Apply : RongRTCConstant.ManageType.Manage;
    this.manage_answer_update_resource(index, userId, status, subscribeInfo);
  };
  /**
  * 管理资源订阅状态信令的应答
  *
  */
  RongRTCEngine.prototype.answerManageSubscribe = function (isApply, userId, status, subscribeInfo) {
    var index = isApply ? RongRTCConstant.ManageType.Apply : RongRTCConstant.ManageType.Manage;
    this.manage_answer_update_subscribe(index, userId, status, subscribeInfo);
  };
  /** ----- 订阅分发能力 ----- */
  /** ----- 提供能力 ----- */
  /** ----- websocket ----- */
  /**
  * 创建WebSocket对象
  *
  */
  RongRTCEngine.prototype.createSignaling = function () {
    // ws正在连接
    this.wsConnectionState = RongRTCConstant.wsConnectionState.CONNECTING;
    if (this.wsUrlList.length > 0) {
      // 已取得websocket连接地址
      this.wsUrlIndex++;
      if (this.wsUrlIndex > this.wsUrlList.length - 1) {
        this.wsUrlIndex = 0;
      }
      var url = this.wsUrlList[this.wsUrlIndex];
      this.createSignalingWithUrl(url);
    } else {
      // 还没有取得websocket连接地址
      var rongRTCEngine = this;
      RongRTCUtil.getWsUrlList(this.wsNavUrl, function (data) {
        var wsUrlList = data;
        if (wsUrlList.length < 1) {
          throw new Error("websocket连接失败!");
        }
        rongRTCEngine.wsUrlList = RongRTCUtil.shuffle(wsUrlList);
        var url = rongRTCEngine.wsUrlList[0];
        rongRTCEngine.createSignalingWithUrl(url);
      });
    }
  };
  /**
  * 创建WebScoket对象
  *
  */
  RongRTCEngine.prototype.createSignalingWithUrl = function (url) {
    var rongRTCEngine = this;
    rongRTCEngine.signaling = new WebSocket('wss://' + url + '/signaling');
    rongRTCEngine.signaling.onopen = function () {
      rongRTCEngine.onOpen();
    };
    rongRTCEngine.signaling.onmessage = function (ev) {
      rongRTCEngine.onMessage(ev);
    };
    rongRTCEngine.signaling.onerror = function (ev) {
      rongRTCEngine.onError(ev);
    };
    rongRTCEngine.signaling.onclose = function (ev) {
      rongRTCEngine.onClose(ev);
    };
  };
  /**
  * RongRTCMessage实体
  *
  * @param signal
  * @param content
  * @param parameters
  * @returns
  */
  var RongRTCMessage = function RongRTCMessage(signal, content, parameters, bodys) {
    this.signal = signal;
    this.content = content;
    this.parameters = parameters;
    if (bodys != null && bodys.length > 0) {
      this.bodys = bodys;
    }
  };
  /**
  * 发送消息
  *
  */
  RongRTCEngine.prototype.sendMsg = function (signal, msgBody, parameters, bodys) {
    this.csequence++;
    parameters.csequence = this.csequence;
    var message = new RongRTCMessage(signal, msgBody, parameters, bodys);
    this.send(message);
  };
  /**
  * 发送消息
  *
  */
  RongRTCEngine.prototype.send = function (message) {
    var signal = message.signal;
    if (this.wsConnectionState == RongRTCConstant.wsConnectionState.CONNECTED) {
      // ws连接可用
      if (signal == RongRTCConstant.SignalType.CHANNEL_PING) {
        // channelPing记录debug日志
        console.debug(new Date(), "req: ", message);
      } else {
        console.info(new Date(), "req: ", message);
      }
      message = JSON.stringify(message);
      this.signaling.send(message);
    } else {
      // websocket不可用
      console.warn(new Date(), "websocket not connected!");
      if (this.wsQueue.length == 0 // 消息队列只保留一条logonAndJoin
      && signal == RongRTCConstant.SignalType.LOGONANDJOIN) {
        // logonAndJoin
        // 加入消息队列
        this.wsQueue.push(message);
      }
    }
  };
  /**
  * 发送队列中的消息
  *
  */
  RongRTCEngine.prototype.doWsQueue = function () {
    if (this.wsQueue.length > 0) {
      // 消息队列只有一条logonAndJoin，取出并删除
      var message = this.wsQueue.shift();
      this.send(message);
    }
  };
  /**
  * onOpen
  *
  */
  RongRTCEngine.prototype.onOpen = function () {
    console.info(new Date(), 'websocket open');
    // ws连接可用
    this.wsConnectionState = RongRTCConstant.wsConnectionState.CONNECTED;
    // 重置reconnectTimes
    this.reconnectTimes = 0;
    // websocket可用后，发送队列中的消息
    this.doWsQueue();
  };
  /**
  * onMessage
  *
  */
  RongRTCEngine.prototype.onMessage = function (ev) {
    var data = JSON.parse(ev.data);
    if (data.signal == RongRTCConstant.SignalType.CHANNEL_PING_RESULT) {
      // channelPing_result记录debug日志
      console.debug(new Date(), "res: ", data);
    } else {
      console.info(new Date(), "res: ", data);
    }
    switch (data.signal) {
      /** 应答信令 */
      case RongRTCConstant.SignalType.LOGONANDJOIN_RESULT:
        this.logonAndJoin_result(data);
        return;
      case RongRTCConstant.SignalType.CHANNEL_PING_RESULT:
        this.channelPing_result(data);
        return;
      case RongRTCConstant.SignalType.LEAVE_RESULT:
        this.leave_result(data);
        return;
      case RongRTCConstant.SignalType.TURNTALKTYPE_RESULT:
        this.turnTalkType_result(data);
        return;
      /** 通知信令 */
      case RongRTCConstant.SignalType.JOINED:
        this.joined(data);
        return;
      case RongRTCConstant.SignalType.LEFT:
        this.left(data);
        return;
      case RongRTCConstant.SignalType.OFFER_REQUEST:
        this.offerRequest(data);
        return;
      case RongRTCConstant.SignalType.UPDATETALKTYPE_NOTIFY:
        this.updateTalktype_notify(data);
        return;
      case RongRTCConstant.SignalType.TURNTALKTYPE_NOTIFY:
        this.turnTalktype_notify(data);
        return;
      case RongRTCConstant.SignalType.SCREENSHARING_NOTIFY:
        this.screenSharing_notify(data);
        return;
      /** exchange信令 */
      case RongRTCConstant.SignalType.EXCHANGE:
        this.exchange(data);
        return;
      /** 白板信令 */
      case RongRTCConstant.SignalType.EWBCREATE_RESULT:
        this.ewbCreate_result(data);
        return;
      case RongRTCConstant.SignalType.EWBQUERY_RESULT:
        this.ewbQuery_result(data);
        return;
      case RongRTCConstant.SignalType.EWBCREATE_NOTIFY:
        this.ewbCreate_notify(data);
        return;
      case RongRTCConstant.SignalType.CREATEMULTI_RESULT:
        this.createMulti_result(data);
      case RongRTCConstant.SignalType.DELETEWHITEBOARD_RESULT:
        this.deleteWhiteBoard_result(data);
      /** 会控信令 */
      // rolechange
      case RongRTCConstant.SignalType.ROLECHANGE_RESULT:
        this.roleChange_result(data);
        return;
      case RongRTCConstant.SignalType.ROLECHANGE_NOTIFY:
        this.roleChange_notify(data);
        return;
      // apply
      case RongRTCConstant.SignalType.APPLY_RESULT:
        this.apply_result(data);
        return;
      case RongRTCConstant.SignalType.APPLY_NOTIFY:
        this.apply_notify(data);
        return;
      // manageaction
      case RongRTCConstant.SignalType.MANAGEACTION_RESULT:
        this.manageAction_result(data);
        return;
      case RongRTCConstant.SignalType.MANAGEACTION_NOTIFY:
        this.manageAction_notify(data);
        return;
      // channelanswer
      case RongRTCConstant.SignalType.CHANNELANSWER_RESULT:
        this.channelAnswer_result(data);
        return;
      case RongRTCConstant.SignalType.CHANNELANSWER_NOTIFY:
        this.channelAnswer_notify(data);
        return;
      case RongRTCConstant.SignalType.SHARETYPE_RESULT:
        this.shareType_result(data);
        return;
      case RongRTCConstant.SignalType.SHARETYPE_NOTIFY:
        this.shareType_notify(data);
        return;
      case RongRTCConstant.SignalType.UPDATE_SHARE_LIST:
        this.updata_share_list(data);
        return;
      /** 订阅分发信令 */
      // update_resource
      case RongRTCConstant.SignalType.UPDATE_RESOURCE_RESULT:
        this.update_resource_result(data);
        return;
      case RongRTCConstant.SignalType.UPDATE_RESOURCE_NOTIFY:
        this.update_resource_notify(data);
        return;
      // update_subscribe
      case RongRTCConstant.SignalType.UPDATE_SUBSCRIBE_RESULT:
        this.update_subscribe_result(data);
        return;
      case RongRTCConstant.SignalType.UPDATE_SUBSCRIBE_NOTIFY:
        this.update_subscribe_notify(data);
        return;
      // manage_update_resource_subscribe
      case RongRTCConstant.SignalType.MANAGE_UPDATE_RESOURCE_SUBSCRIBE_RESULT:
        this.manage_update_resource_subscribe_result(data);
        return;
      case RongRTCConstant.SignalType.MANAGE_UPDATE_RESOURCE_NOTIFY:
        this.manage_update_resource_notify(data);
        return;
      case RongRTCConstant.SignalType.MANAGE_UPDATE_SUBSCRIBE_NOTIFY:
        this.manage_update_subscribe_notify(data);
        return;
      // manage_answer_update_resource
      case RongRTCConstant.SignalType.MANAGE_ANSWER_UPDATE_RESOURCE_RESULT:
        this.manage_answer_update_resource_result(data);
        return;
      case RongRTCConstant.SignalType.MANAGE_ANSWER_UPDATE_RESOURCE_NOTIFY:
        this.manage_answer_update_resource_notify(data);
        return;
      // manage_answer_update_subscribe
      case RongRTCConstant.SignalType.MANAGE_ANSWER_UPDATE_SUBSCRIBE_RESULT:
        this.manage_answer_update_subscribe_result(data);
        return;
      case RongRTCConstant.SignalType.MANAGE_ANSWER_UPDATE_SUBSCRIBE_NOTIFY:
        this.manage_answer_update_subscribe_notify(data);
        return;
      case RongRTCConstant.SignalType.EXCHANGE_RESULT:
        this.exchangeResult(data);
        return;

      default:
        console.debug(new Date(), data);
    }
  };
  /**
  * onClose
  *
  */
  RongRTCEngine.prototype.onClose = function (ev) {
    var rongRTCEnv = this;
    console.warn(new Date(), 'websocket close', ev);
    if (ev.code == 1000 && ev.reason == 'wsForcedClose') {
      // 如果自定义关闭ws连接，避免二次重连
      return;
    }
    // ws连接不可用
    this.wsConnectionState = RongRTCConstant.wsConnectionState.DISCONNECTED;
    if (this.wsNeedConnect) {
      // ws需要重连
      setTimeout(function () {
        rongRTCEnv.reconnect();
      }, RongRTCConstant.RECONNECT_TIMEOUT);
    }
  };
  /**
  * onError
  *
  */
  RongRTCEngine.prototype.onError = function (ev) {
    console.error(new Date(), 'websocket error', ev);
  };
  /**
  * disconnect
  *
  */
  RongRTCEngine.prototype.disconnect = function (wsNeedConnect) {
    console.warn(new Date(), 'websocket disconnect');
    console.warn(new Date(), 'wsNeedConnect=' + wsNeedConnect);

    this.wsForcedClose = true;
    this.wsNeedConnect = wsNeedConnect;
    this.wsConnectionState = RongRTCConstant.wsConnectionState.DISCONNECTED;
    // 自定义关闭ws连接
    this.signaling.close(1000, 'wsForcedClose');
    // 网断后，执行close方法后不会立即触发onclose事件，所以需要手动重连
    if (this.wsNeedConnect) {
      // ws需要重连
      this.reconnect();
    }
  };
  /**
  * reconnect
  *
  */
  RongRTCEngine.prototype.reconnect = function () {
    if (this.wsConnectionState != RongRTCConstant.wsConnectionState.DISCONNECTED) {
      // ws连接可用或正在连接不重连
      return;
    }
    this.reconnectTimes++;
    console.warn(new Date(), 'reconnectTimes=' + this.reconnectTimes);
    if (this.reconnectTimes > RongRTCConstant.RECONNECT_MAXTIMES) {
      this.keepAliveDisconnect();
    } else {
      var reconnectFunc = function reconnectFunc(rongRTCEngine) {
        if (rongRTCEngine.wsConnectionState == RongRTCConstant.wsConnectionState.DISCONNECTED) {
          // ws连接不可用
          console.info(new Date(), 'websocket reconnect');
          rongRTCEngine.createSignaling();
          // 重新logonAndJoin
          rongRTCEngine.logonAndJoin(RongRTCConstant.LogonAndJoinStatus.RECONNECT);
        }
      };

      var rongRTCEngine = this;
      if (rongRTCEngine.reconnectTimes > 1) {
        // 连续重连的话间隔一定时间
        setTimeout(function () {
          reconnectFunc(rongRTCEngine);
        }, RongRTCConstant.RECONNECT_TIMEOUT);
      } else {
        reconnectFunc(rongRTCEngine);
      }
    }
  };
  /** ----- websocket ----- */
  /** ----- keepAlive ----- */
  /**
  * keepAlive
  *
  */
  RongRTCEngine.prototype.keepAlive = function () {
    if (this.wsConnectionState == RongRTCConstant.wsConnectionState.CONNECTED) {
      // ws连接可用
      // 开始计时
      this.startScheduleKeepAliveTimer();
      this.channelPing();
    } else {
      this.keepAliveFailed();
    }
  };
  /**
  * keepAlive失败
  *
  */
  RongRTCEngine.prototype.keepAliveFailed = function () {
    this.keepAliveFailedTimes++;
    console.warn(new Date(), "keepAliveFailedTimes=" + this.keepAliveFailedTimes);
    if (this.keepAliveFailedTimes > RongRTCConstant.KEEPALIVE_FAILEDTIMES_MAX) {
      this.keepAliveDisconnect();
    }
  };
  /**
  * 开始keepAlive
  *
  */
  RongRTCEngine.prototype.startScheduleKeepAlive = function () {
    this.exitScheduleKeepAlive();
    this.exitScheduleKeepAliveTimer();

    var rongRTCEngine = this;
    rongRTCEngine.keepAlive(); // 立即执行1次
    rongRTCEngine.keepAliveInterval = setInterval(function () {
      rongRTCEngine.keepAlive();
    }, RongRTCConstant.KEEPALIVE_INTERVAL);
  };
  /**
  * 停止keepAlive
  *
  */
  RongRTCEngine.prototype.exitScheduleKeepAlive = function () {
    this.keepAliveFailedTimes = 0;
    if (this.keepAliveInterval != null) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  };
  /**
  * keepAlive未收到result计时器方法
  *
  */
  RongRTCEngine.prototype.keepAliveTimerFunc = function () {
    this.keepAliveTimerCount++;
    if (this.keepAliveTimerCount > RongRTCConstant.KEEPALIVE_TIMER_TIMEOUT_MAX / 3) {
      console.warn(new Date(), "keepAliveTimerCount=" + this.keepAliveTimerCount);
    } else {
      console.debug(new Date(), "keepAliveTimerCount=" + this.keepAliveTimerCount);
    }
    if (this.keepAliveTimerCount > RongRTCConstant.KEEPALIVE_TIMER_TIMEOUT_MAX) {
      this.keepAliveDisconnect();
      return;
    }
    if (this.keepAliveTimerCount == RongRTCConstant.KEEPALIVE_TIMER_TIMEOUT_RECONNECT) {
      // 断开本次连接，进行重连
      this.disconnect(true);
    }
  };
  /**
  * 开始keepAlive未收到result计时器
  *
  */
  RongRTCEngine.prototype.startScheduleKeepAliveTimer = function () {
    if (this.keepAliveTimer == null) {
      var rongRTCEngine = this;
      // keepAlive5秒间隔，这个时候有可能已经断了5秒
      rongRTCEngine.keepAliveTimerCount += RongRTCConstant.KEEPALIVE_INTERVAL / 1000;
      rongRTCEngine.keepAliveTimer = setInterval(function () {
        rongRTCEngine.keepAliveTimerFunc();
      }, RongRTCConstant.KEEPALIVE_TIMER_INTERVAL);
    }
  };
  /**
  * 停止keepAlive未收到result计时器
  *
  */
  RongRTCEngine.prototype.exitScheduleKeepAliveTimer = function () {
    this.keepAliveTimerCount = 0;
    if (this.keepAliveTimer != null) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  };
  /**
  * 与服务器断开
  *
  */
  RongRTCEngine.prototype.keepAliveDisconnect = function () {
    this.clear();
    this.rongRTCEngineEventHandle.call('onConnectionStateChanged', {
      'connectionState': RongRTCConstant.ConnectionState.DISCONNECTED
    });
  };
  /** ----- keepAlive ----- */
  /** ----- 基本功能 ----- */
  /**
  * 获取mediaConfig
  *
  */
  RongRTCEngine.prototype.getMediaConfig = function (isVideoEnable, isAudioEnable) {
    var mediaConfig = {
      video: this.mediaConfig.video,
      audio: this.mediaConfig.audio
    };
    if (!isVideoEnable) {
      mediaConfig.video = false;
    }
    if (!isAudioEnable) {
      mediaConfig.audio = false;
    }
    return mediaConfig;
  };
  /**
  * 获取screenMediaConfig
  *
  */
  RongRTCEngine.prototype.getScreenMediaConfig = function (sourceId) {
    var screenMediaConfig = {
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          maxWidth: RongRTCConstant.ShareProfile_default.width,
          maxHeight: RongRTCConstant.ShareProfile_default.height,
          chromeMediaSourceId: sourceId
        },
        optional: [{ googTemporalLayeredScreencast: true }]
      }
    };
    return screenMediaConfig;
  };
  /**
  * 获取minMediaConfig
  *
  */
  RongRTCEngine.prototype.getMinMediaConfig = function () {
    var minMediaConfig = {
      video: RongRTCConstant.VideoProfile_min,
      audio: false // 小流不需要音频
    };
    return minMediaConfig;
  };
  /**
  * 设置本地视频流
  *
  */
  RongRTCEngine.prototype.setLocalStream = function (stream) {
    if (this.localStream == null || this.localStream.getTracks().length == 0) {
      this.localStream = stream;
    }
    // 音频Track
    var audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      this.localAudioTrack = audioTrack;
    }
    // 视频Track
    var videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      this.localVideoTrack = videoTrack;
    }
    if (!this.localVideoEnable) {
      this.enableLocalTrack(RongRTCConstant.DeviceType.Camera, !this.localVideoEnable);
    }
    if (this.isSubscribeVersion()) {
      // 订阅分发版本
      // 绑定LocalTrack
      this.updateLocalTrackBind(this.resource);
    }
  };
  /**
  * 获取远端视频流/屏幕共享流数量
  *
  */
  RongRTCEngine.prototype.getRemoteStreamCount = function () {
    return this.remoteStreams.size() + this.remoteScreenStreams.size();
  };
  /**
  * 创建视频视图
  *
  */
  RongRTCEngine.prototype.createVideoView = function () {
    var videoView = document.createElement('video');
    // 视频自动播放
    videoView.autoplay = true;
    videoView.setAttribute("playsinline", true); // isa
    return videoView;
  };
  /**
  * enable本地音频track
  *
  */
  RongRTCEngine.prototype.enableLocalAudioTrack = function (enable) {
    this.localAudioEnable = enable;
    if (this.localAudioTrack) {
      this.localAudioTrack.enabled = enable;
    }
    if (this.localStream && this.localStream.getAudioTracks()) {
      this.localStream.getAudioTracks().forEach(function (track) {
        track.enabled = enable;
      });
    }
  };
  /**
  * enable本地视频track
  *
  */
  RongRTCEngine.prototype.enableLocalVideoTrack = function (enable) {
    this.localVideoEnable = enable;
    if (this.localVideoTrack) {
      this.localVideoTrack.enabled = enable;
    }
    if (this.localStream && this.localStream.getVideoTracks()) {
      this.localStream.getVideoTracks().forEach(function (track) {
        track.enabled = enable;
      });
    }
  };
  /**
  * enable本地音频/视频track
  *
  */
  RongRTCEngine.prototype.enableLocalTrack = function (deviceType, enable) {
    if (deviceType == RongRTCConstant.DeviceType.Camera) {
      this.enableLocalVideoTrack(enable);
    } else if (deviceType == RongRTCConstant.DeviceType.Microphone) {
      this.enableLocalAudioTrack(enable);
    } else if (deviceType == RongRTCConstant.DeviceType.CameraAndMicrophone) {
      this.enableLocalVideoTrack(enable);
      this.enableLocalAudioTrack(enable);
    }
  };
  /**
  * stop屏幕共享视频track
  *
  */
  RongRTCEngine.prototype.stopLocalScreenVideoTrack = function () {
    if (this.localScreenVideoTrack) {
      this.localScreenVideoTrack.stop();
    }
    if (this.isScreenStreamSeparate) {
      // 屏幕共享流分离
      if (this.localScreenStream && this.localScreenStream.getVideoTracks()) {
        this.localScreenStream.getVideoTracks().forEach(function (track) {
          track.stop();
        });
      }
    } else {
      if (this.localStream && this.localStream.getVideoTracks()) {
        this.localStream.getVideoTracks().forEach(function (track) {
          track.stop();
        });
      }
    }
  };
  /** ----- 基本功能 ----- */
  /** ----- offer ----- */
  /**
  * 建立连接
  *
  */
  RongRTCEngine.prototype.preparePeerConnection = function (userId) {
    console.info(new Date(), "preparePeerConnection userId=" + userId);
    var rongRTCEngine = this;
    if (rongRTCEngine.peerConnections[userId] == null) {
      var pc = new RTCPeerConnection();
      pc.onaddstream = function (evt) {
        console.debug(new Date(), "onaddstream", evt);

        var streamId = evt.stream.id;
        var userId = streamId;
        var videoType = RongRTCConstant.VideoType.NORMAL;
        if (streamId.lastIndexOf(RongRTCConstant.StreamSuffix.SCREEN) != -1) {
          // 屏幕共享流
          userId = streamId.substring(0, streamId.lastIndexOf(RongRTCConstant.StreamSuffix.SCREEN));
          videoType = RongRTCConstant.VideoType.SCREEN;
          rongRTCEngine.remoteScreenStreams.put(userId, evt.stream);
        } else {
          rongRTCEngine.remoteStreams.put(userId, evt.stream);
          var user = rongRTCEngine.joinedUsers.get(userId);
          var isNoVideo = false;
          if (rongRTCEngine.isSubscribeVersion()) {
            // 订阅分发版本
            var resource = user.resource;
            if (resource == RongRTCConstant.ResourceType.None || resource == RongRTCConstant.ResourceType.AudioOnly) {
              // 无视频
              isNoVideo = true;
            }
          } else {
            var talkType = user.talkType;
            if (talkType == RongRTCConstant.TalkType.OnlyAudio || talkType == RongRTCConstant.TalkType.None) {
              // 无视频
              isNoVideo = true;
            }
          }
          if (isNoVideo) {
            // 无视频
            evt.stream.getVideoTracks().forEach(function (track) {
              track.enabled = false;
            });
          }
        }

        // 增加trackId和userId的对应关系
        evt.stream.getTracks().forEach(function (track) {
          rongRTCEngine.remoteTrackIdMap.put(track.id, evt.stream.id);
        });

        // @Deprecated
        rongRTCEngine.rongRTCEngineEventHandle.call('onAddStream', {
          'userId': userId,
          'videoType': videoType
        });
        var user = rongRTCEngine.joinedUsers.get(userId);
        rongRTCEngine.rongRTCEngineEventHandle.call('onNotifyUserVideoCreated', {
          userId: userId,
          videoType: videoType,
          resource: user.resource
        });
      };

      pc.onremovestream = function (evt) {
        console.debug(new Date(), "onremovestream", evt);

        var streamId = evt.stream.id;
        var userId = streamId;
        var videoType = RongRTCConstant.VideoType.NORMAL;
        if (streamId.lastIndexOf(RongRTCConstant.StreamSuffix.SCREEN) != -1) {
          // 屏幕共享流
          userId = streamId.substring(0, streamId.lastIndexOf(RongRTCConstant.StreamSuffix.SCREEN));
          videoType = RongRTCConstant.VideoType.SCREEN;
          rongRTCEngine.remoteScreenStreams.remove(userId);
        } else {
          rongRTCEngine.remoteStreams.remove(userId);
        }

        // 移除trackId和userId的对应关系
        evt.stream.getTracks().forEach(function (track) {
          rongRTCEngine.remoteTrackIdMap.remove(track.id);
        });

        // @Deprecated
        rongRTCEngine.rongRTCEngineEventHandle.call('onRemoveStream', {
          'userId': userId,
          'videoType': videoType
        });
        rongRTCEngine.rongRTCEngineEventHandle.call('OnNotifyUserVideoDestroyed', {
          'userId': userId,
          'videoType': videoType
        });
      };

      pc.ontrack = function (evt) {
        console.debug(new Date(), "ontrack", evt);

        var track = evt.track;
        var stream = evt.streams[0];
        var userId = stream.id;
        //    		if (track.kind == 'video') { // add video track
        //    			// 刷新视频窗口的流
        //    			RongRTCUtil.setMediaStream(userId, stream);
        //    		}
      };

      pc.onsignalingstatechange = function (evt) {
        console.debug(new Date(), "onsignalingstatechange", evt);
      };

      pc.oniceconnectionstatechange = function (evt) {
        console.debug(new Date(), "oniceconnectionstatechange", evt);
        console.warn(new Date(), "pc.iceConnectionState=" + pc.iceConnectionState);

        if (pc.iceConnectionState == 'failed') {
          if (rongRTCEngine.wsConnectionState == RongRTCConstant.wsConnectionState.CONNECTED) {
            // ws连接可用
            console.warn(new Date(), "oniceconnectionstatechange createOffer");
            rongRTCEngine.createOffer(pc, userId, true);
          }
        }
      };

      pc.onnegotiationneeded = function (evt) {
        console.debug(new Date(), "onnegotiationneeded", evt);
      };

      pc.ondatachannel = function (evt) {
        console.debug(new Date(), "ondatachannel", evt);
      };

      pc.onicecandidate = function (evt) {
        console.debug(new Date(), "onicecandidate", evt);

        handle(pc, evt);

        function handle(pc, evt) {
          if ((pc.signalingState || pc.readyState) == 'stable' && rongRTCEngine.peerConnections[userId]['rem'] == true) {
            if (evt.candidate) {
              rongRTCEngine.candidate(JSON.stringify(evt.candidate), userId);
            }
            return;
          }
          setTimeout(function () {
            handle(pc, evt);
          }, 2 * 1000);
        }
      };
      rongRTCEngine.peerConnections[userId] = {};
      rongRTCEngine.peerConnections[userId]['pc'] = pc;
      rongRTCEngine.peerConnections[userId]['rem'] = false;

      // peerConnection创建成功，开始getStatsReport
      rongRTCEngine.startScheduleGetStatsReport();

      if (this.isEnableMinStream) {
        // 开启了小流
        var pcMin = new RTCPeerConnection();
        rongRTCEngine.peerConnections[userId]['pcMin'] = pcMin;
      }
    }
    return rongRTCEngine.peerConnections[userId];
  };
  /**
  * 关闭连接
  *
  */
  RongRTCEngine.prototype.closePeerConnection = function (userId) {
    if (this.peerConnections[userId] != null) {
      this.peerConnections[userId]['pc'].close();
      this.peerConnections[userId] = null;
    }
    // 重置带宽设置计数器
    RongRTCGlobal.bandWidthCount = 0;
    // peerConnection关闭，停止getStatsReport
    this.exitScheduleGetStatsReport();
  };
  /**
  * handle offer
  *
  */
  RongRTCEngine.prototype.handleOffer = function (data) {
    if (this.offerStatus == RongRTCConstant.OfferStatus.SENDING) {
      console.warn(new Date(), "handleOffer offerStatus sending");
      return;
    }

    var from = data.parameters['from'];
    var desc = JSON.parse(data.content.replace(new RegExp('\'', 'g'), '"'));
    // set bandwidth
    desc.sdp = RongRTCUtil.setBandWidth(desc.sdp, this.getBandWidth());

    var pcClient = this.preparePeerConnection(from);
    var pc = pcClient['pc'];
    if (this.userType != RongRTCConstant.UserType.OBSERVER) {
      pc.addStream(this.localStream);
    }
    if (this.isScreenStreamSeparate && this.localScreenStream && this.screenSharingStatus) {
      // 屏幕共享流分离且开启了屏幕共享
      pc.addStream(this.localScreenStream);
    }
    var rongRTCEngine = this;
    pc.setRemoteDescription(new RTCSessionDescription(desc), function () {
      console.info(new Date(), "handleOffer setRemoteDescription success");
      rongRTCEngine.offerStatus = RongRTCConstant.OfferStatus.DONE;
      // set remote cname map
      rongRTCEngine.setRemoteCnameMap(desc.sdp);
      pcClient['rem'] = true;
      pc.createAnswer(function (desc2) {
        console.info(new Date(), "createAnswer success");
        pc.setLocalDescription(desc2, function () {
          console.info(new Date(), "createAnswer setLocalDescription success");
          rongRTCEngine.answer(JSON.stringify(desc2), from);
        }, function (error) {
          console.error(new Date(), "createAnswer setLocalDescription error: ", error);
        });
      }, function (error) {
        console.error(new Date(), "createAnswer error: ", error);
      }, rongRTCEngine.getSdpMediaConstraints(false));
    }, function (error) {
      console.error(new Date(), "handleOffer setRemoteDescription error: ", error);
    });
  };
  /**
  * handle answer
  *
  */
  RongRTCEngine.prototype.handleAnswer = function (data) {
    if (this.offerStatus == RongRTCConstant.OfferStatus.DONE) {
      // 已经设置过一次SDP，放弃本次设置
      console.warn(new Date(), "handleAnswer offerStatus done");
      return;
    }

    var from = data.parameters['from'];
    var desc = JSON.parse(data.content.replace(new RegExp('\'', 'g'), '"'));
    var pcClient = this.preparePeerConnection(from);
    var pc = pcClient['pc'];
    if (this.isEnableMinStream && desc.type == "tinyStreamAnswer") {
      // 小流
      desc.type = "answer";
      pc = pcClient['pcMin'];
    }
    // set bandwidth
    desc.sdp = RongRTCUtil.setBandWidth(desc.sdp, this.getBandWidth());

    var rongRTCEngine = this;
    pc.setRemoteDescription(new RTCSessionDescription(desc), function () {
      console.info(new Date(), "handleAnswer setRemoteDescription success");
      rongRTCEngine.offerStatus = RongRTCConstant.OfferStatus.DONE;
      // set remote cname map
      rongRTCEngine.setRemoteCnameMap(desc.sdp);
      pcClient['rem'] = true;
    }, function (error) {
      console.error(new Date(), "handleAnswer setRemoteDescription error: ", error);
    });
  };
  /**
  * handle candidate
  *
  */
  RongRTCEngine.prototype.handleCandidate = function (data) {
    var from = data.parameters['from'];
    var desc = JSON.parse(data.content.replace(new RegExp('\'', 'g'), '"'));

    var pcClient = this.preparePeerConnection(from);
    var pc = pcClient['pc'];
    pc.addIceCandidate(new RTCIceCandidate(desc), function () {
      console.info(new Date(), "addIceCandidate success");
    }, function (error) {
      console.error(new Date(), "addIceCandidate error: ", error);
    });
  };
  /**
  * create offer
  *
  */
  RongRTCEngine.prototype.createOffer = function (pc, userId, isIceRestart, subscribeInfo) {
    if (this.offerStatus == RongRTCConstant.OfferStatus.SENDING) {
      // 已经创建过Offer，本次不创建
      console.warn(new Date(), "createOffer offerStatus sending");
      return;
    }
    console.info(new Date(), "createOffer userId=" + userId);
    var rongRTCEngine = this;
    pc.createOffer(function (desc) {
      console.info(new Date(), "createOffer success");
      // 变更SDP信息
      desc.sdp = rongRTCEngine.changeSdp(desc.sdp);
      pc.setLocalDescription(desc, function () {
        console.info(new Date(), "createOffer setLocalDescription success");
        rongRTCEngine.offerStatus = RongRTCConstant.OfferStatus.SENDING;
        var bodys = new Array();
        if (subscribeInfo) {
          bodys.push(JSON.stringify(subscribeInfo));
        }
        rongRTCEngine.offer(JSON.stringify(desc), userId, bodys);
      }, function (error) {
        console.error(new Date(), "createOffer setLocalDescription error: ", error);
      });
    }, function (error) {
      console.error(new Date(), "createOffer error: ", error);
    }, rongRTCEngine.getSdpMediaConstraints(isIceRestart));
    // 小流
    if (this.isEnableMinStream && this.localMinStream) {
      var pcMin = this.peerConnections[userId]['pcMin'];
      pcMin.addStream(rongRTCEngine.localMinStream);
      pcMin.createOffer(function (desc) {
        console.info(new Date(), "pcMin createOffer success");
        // 变更SDP信息
        desc.sdp = rongRTCEngine.changeSdp(desc.sdp);
        pcMin.setLocalDescription(desc, function () {
          console.info(new Date(), "pcMin createOffer setLocalDescription success");
          rongRTCEngine.offerStatus = RongRTCConstant.OfferStatus.SENDING;
          // offer to tinyStreamOffer
          desc.type = "tinyStreamOffer";
          rongRTCEngine.offer(JSON.stringify(desc), userId);
        }, function (error) {
          console.error(new Date(), "pcMin createOffer setLocalDescription error: ", error);
        });
      }, function (error) {
        console.error(new Date(), "pcMin createOffer error: ", error);
      });
    }
  };
  /**
  * 变更SDP信息
  *
  */
  RongRTCEngine.prototype.changeSdp = function (sdp) {
    if (this.localStream) {
      // 本地视频流
      // change streamId use userId
      sdp = RongRTCUtil.changeStreamId(sdp, this.localStream.id, this.userId);
      //	    // change videoTrackId
      //	    this.localStream.getVideoTracks().forEach(function (track) {
      //	    	sdp = RongRTCUtil.changeTrackId(sdp, track.id, this.userId + RongRTCConstant.TrackSuffix.VIDEO);
      //	    });
      //		// change audioTrackId
      //	    this.localStream.getAudioTracks().forEach(function (track) {
      //	    	sdp = RongRTCUtil.changeTrackId(sdp, track.id, this.userId + RongRTCConstant.TrackSuffix.AUDIO);
      //	    });
    }
    if (this.isScreenStreamSeparate && this.localScreenStream && this.screenSharingStatus) {
      // 屏幕共享流分离且开启了屏幕共享
      // change screenStreamId use userId
      sdp = RongRTCUtil.changeStreamId(sdp, this.localScreenStream.id, this.userId + RongRTCConstant.StreamSuffix.SCREEN);
      //    	// change videoTrackId
      //      this.localScreenStream.getVideoTracks().forEach(function (track) {
      //        	sdp = RongRTCUtil.changeTrackId(sdp, track.id, this.userId + RongRTCConstant.StreamSuffix.SCREEN + RongRTCConstant.StreamSuffix.SCREEN + RongRTCConstant.TrackSuffix.VIDEO);
      //      });
    }
    if (this.isEnableMinStream && this.localMinStream && !this.screenSharingStatus) {
      // 有小流且没有开启屏幕共享
      // change minStreamId use userId
      sdp = RongRTCUtil.changeStreamId(sdp, this.localMinStream.id, this.userId + RongRTCConstant.StreamSuffix.TINY);
      //      // change videoTrackId
      //      this.localMinStream.getVideoTracks().forEach(function (track) {
      //        	sdp = RongRTCUtil.changeTrackId(sdp, track.id, this.userId + RongRTCConstant.StreamSuffix.TINY + RongRTCConstant.StreamSuffix.TINY + RongRTCConstant.TrackSuffix.VIDEO);
      //      });
    }

    // 替换video参数
    sdp = RongRTCUtil.changeVideoDesc(sdp);
    return sdp;
  };
  /**
  * 设置sdp属性
  *
  */
  RongRTCEngine.prototype.getSdpMediaConstraints = function (isIceRestart) {
    var sdpMediaConstraints = {};
    sdpMediaConstraints.mandatory = {};
    // 统一设置，包含观察者模式和普通模式无摄像头情况
    sdpMediaConstraints.mandatory.OfferToReceiveAudio = true;
    sdpMediaConstraints.mandatory.OfferToReceiveVideo = true;
    // IceRestart
    console.warn(new Date(), "isIceRestart=" + isIceRestart);
    sdpMediaConstraints.mandatory.IceRestart = isIceRestart;
    return sdpMediaConstraints;
  };
  /**
  * 设置remote cname map
  *
  */
  RongRTCEngine.prototype.setRemoteCnameMap = function (sdp) {
    var userArr = this.joinedUsers.getEntrys();
    for (var i in userArr) {
      var userId = userArr[i].key;
      if (userId == this.userId) {
        // 不是远端
        continue;
      }
      if (!this.remoteCnameMap.contains(userId)) {
        var cname = RongRTCUtil.getCname(sdp, userId);
        if (cname != null && cname != "") {
          this.remoteCnameMap.put(userId, cname);
          this.remoteSdpMap.put(userId, sdp);
        }
      } else {
        var cname = this.remoteCnameMap.get(userId);
        if (cname != null && cname != "") {
          if (!RongRTCUtil.isHasCname(sdp, cname)) {
            // userId不变，cname变化，视为客户端杀进程后重连，刷新远端视频流
            var newCname = RongRTCUtil.getCname(sdp, userId);
            if (newCname != null && newCname != "") {
              this.remoteCnameMap.put(userId, newCname);
              RongRTCUtil.refreshMediaStream(userId);
            }
          } else {
            // 屏幕共享cname不变
            var newCname = RongRTCUtil.getCname(sdp, userId);
            if (cname == newCname) {
              var oldSdp = this.remoteSdpMap.get(userId);
              var ts = RongRTCUtil.getSsrc(oldSdp, userId, cname);
              var newTs = RongRTCUtil.getSsrc(sdp, userId, cname);
              if (ts != newTs) {
                RongRTCUtil.refreshMediaStream(userId);
              }
            }
          }
        }
      }
    }
  };
  /**
  * 获取带宽
  *
  */
  RongRTCEngine.prototype.getBandWidth = function () {
    if (this.screenSharingStatus) {
      // 正在屏幕共享
      return RongRTCConstant.BandWidth_ScreenShare_1280_720;
    }
    return this.bandWidth;
  };
  /** ----- offer ----- */
  /** ----- getStatsReport ----- */
  /**
  * getStatsReport
  *
  */
  RongRTCEngine.prototype.getStatsReport = function () {
    var pcClient = this.peerConnections[this.userId];
    if (pcClient != null) {
      var pc = pcClient['pc'];
      var rongRTCEngine = this;
      pc.getStats(null, function (report) {
        rongRTCEngine.rongRTCConnectionStatsReport.parseStatsReport(report);
        // 上报丢包率信息，返回本地数据流的丢包率
        if (rongRTCEngine.isSendLostReport) {
          var packetSendLossRate = rongRTCEngine.rongRTCConnectionStatsReport.packetSendLossRate;
          console.debug(new Date(), "onNetworkSentLost=" + packetSendLossRate);
          rongRTCEngine.rongRTCEngineEventHandle.call('onNetworkSentLost', {
            packetSendLossRate: packetSendLossRate
          });
        }
        // 上报音频输入电平
        var audioInputLevel = rongRTCEngine.rongRTCConnectionStatsReport.audioInputLevel;
        if (!rongRTCEngine.localAudioEnable) {
          // 本地静音
          audioInputLevel = 0;
        }
        console.debug(new Date(), "audioInputLevel=" + audioInputLevel);
        rongRTCEngine.rongRTCEngineEventHandle.call('onAudioInputLevel', {
          audioInputLevel: audioInputLevel
        });
        // 上报音频接收电平
        var audioReceivedLevel = rongRTCEngine.rongRTCConnectionStatsReport.audioReceivedLevel;
        console.debug(new Date(), "audioReceivedLevel=" + audioReceivedLevel);
        rongRTCEngine.rongRTCEngineEventHandle.call('onAudioReceivedLevel', {
          audioReceivedLevel: audioReceivedLevel
        });
      }, function (error) {
        console.error(new Date(), "getStatsReport error: ", error);
      });
    }
  };
  /**
  * 开始getStatsReport
  *
  */
  RongRTCEngine.prototype.startScheduleGetStatsReport = function () {
    this.exitScheduleGetStatsReport();

    this.rongRTCConnectionStatsReport = new RongRTCConnectionStatsReport(this);
    var rongRTCEngine = this;
    rongRTCEngine.getStatsReportInterval = setInterval(function () {
      rongRTCEngine.getStatsReport();
    }, RongRTCConstant.GETSTATSREPORT_INTERVAL);
  };
  /**
  * 停止getStatsReport
  *
  */
  RongRTCEngine.prototype.exitScheduleGetStatsReport = function () {
    if (this.getStatsReportInterval != null) {
      clearInterval(this.getStatsReportInterval);
      this.getStatsReportInterval = null;
    }
    this.rongRTCConnectionStatsReport = null;
  };
  /** ----- getStatsReport ----- */
  /** ----- screenShare ----- */
  /**
  * 绑定插件监听事件
  *
  */
  RongRTCEngine.prototype.addEventListener = function () {
    if (this.isBindEvent) {
      // 已经绑定过事件
      return;
    }
    var rongRTCEngine = this;
    window.addEventListener("message", function (msg) {
      var messageHandler = {
        onResponseReqSouId: function onResponseReqSouId(msg) {
          rongRTCEngine.screenShareWithSource(msg.data.sourceId);
        },
        testMessage: function testMessage(msg) {
          rongRTCEngine.isScreenSharePluginInstalled = true;
        },
        other: function other(msg) {
          // console.debug(new Date(), msg);
        }
      };
      var handle = messageHandler[msg.data.type] || messageHandler.other;
      handle(msg);
    }, false);
    this.isBindEvent = true;
  };
  /**
  * 检查是否支持屏幕共享
  *
  */
  RongRTCEngine.prototype.checkScreenShareSupport = function () {
    // 检测浏览器是否支持
    var supportBrowser = ['Chrome'];
    var mb = RongRTCUtil.myBrowser();
    if (supportBrowser.indexOf(mb) < 0) {
      // 浏览器不支持
      return RongRTCConstant.ScreenShareSupportCode.BrowserNotSupport;
    }
    // 检测是否安装了插件
    if (!this.isScreenSharePluginInstalled) {
      // 未安装插件
      return RongRTCConstant.ScreenShareSupportCode.NoPlugin;
    }
    return RongRTCConstant.ScreenShareSupportCode.Support;
  };
  /**
  * 向插件发起屏幕共享请求
  *
  */
  RongRTCEngine.prototype.requestScreenShare = function () {
    window.postMessage('requestScreenSourceId', '*');
  };
  /**
  * 屏幕共享，有source
  *
  */
  RongRTCEngine.prototype.screenShareWithSource = function (sourceId) {
    var rongRTCEngine = this;
    var screenMediaConfig = this.getScreenMediaConfig(sourceId);
    RongRTCUtil.getMedia(screenMediaConfig).then(function (stream) {
      rongRTCEngine.screenShareWithStream(stream);
    }).catch(function (error) {
      console.error(new Date(), "startScreenShare getMedia error: " + error);
      rongRTCEngine.rongRTCEngineEventHandle.call('onStartScreenShareComplete', {
        'isSuccess': false
      });
    });
  };
  /**
  * 屏幕共享，有screenStream
  *
  */
  RongRTCEngine.prototype.screenShareWithStream = function (screenStream) {
    //	var rongRTCEngine = this;
    //	var screenVideoTrack = screenStream.getVideoTracks()[0];
    //	screenVideoTrack.onended = function () {
    //  	// 关闭屏幕共享
    //      rongRTCEngine.stopScreenShare();
    //  };
    //  if (this.isScreenStreamSeparate) { // 屏幕共享流分离
    //  	this.localScreenStream = screenStream;
    //  } else {
    //    	// 移除视频流videoTrack
    // 		var oldVideoTrack = this.localStream.getVideoTracks()[0];
    // 		oldVideoTrack.stop();
    // 		this.localStream.removeTrack(oldVideoTrack);
    // 		// 将屏幕共享流videoTrack加入到流中
    // 		this.localStream.addTrack(screenVideoTrack);
    //    	// // 刷新本地视频窗口的流
    //    	// RongRTCUtil.setMediaStream(this.userId, this.localStream);
    //  }
    //  this._startScreenShare();
    var rongRTCEngine = this;
    this.localScreenVideoTrack = screenStream.getVideoTracks()[0];
    this.localScreenVideoTrack.onended = function () {
      // 关闭屏幕共享
      rongRTCEngine.stopScreenShare({
        reason: RongRTCConstant.ScreenShareReason.BROWER
      });
    };
    if (this.isScreenStreamSeparate) {
      // 屏幕共享流分离
      this.localScreenStream = screenStream;
    } else {
      if (this.isSubscribeVersion() && this.isStartStopLocalTrack) {
        // 订阅分发版本且是start/stop track
        if (this.localVideoEnable) {
          // 原视频是enable的
          this.stopLocalTrack(RongRTCConstant.DeviceType.Camera);
        }
      }
      // 移除视频流videoTrack
      if (this.localVideoTrack) {
        this.localStream.removeTrack(this.localVideoTrack);
      }
      // 将屏幕共享流videoTrack加入到流中
      this.localStream.addTrack(this.localScreenVideoTrack);
      // // 刷新本地视频窗口的流
      // RongRTCUtil.setMediaStream(this.userId, this.localStream);
    }
    this._startScreenShare();
  };
  /**
  * 开启屏幕共享
  *
  */
  RongRTCEngine.prototype._startScreenShare = function () {
    this.screenSharingStatus = true;
    if (this.isSubscribeVersion()) {
      // 订阅分发版本
      var resource = this.convertResource(this.resource, RongRTCConstant.DeviceType.ScreenShare, RongRTCConstant.OperationType.OPEN);
      // 变更resource
      this.changeResource(this.userId, resource);
      // 发信令
      this.update_resource(resource);
    }
    this.rongRTCEngineEventHandle.call('onStartScreenShareComplete', {
      'isSuccess': true
    });

    // offer
    var pcClient = this.peerConnections[this.userId];
    if (pcClient != null) {
      // 只有一人时，值为null，在订阅分发版本中，只有一人时也有peerConnection
      var pc = pcClient['pc'];
      if (this.isScreenStreamSeparate && this.localScreenStream) {
        // 屏幕共享流分离
        pc.addStream(this.localScreenStream);
      }
      console.warn(new Date(), "startScreenShare createOffer");
      this.createOffer(pc, this.userId, false);
    }
  };
  /**
  * 关闭屏幕共享
  *
  */
  RongRTCEngine.prototype._stopScreenShare = function (option) {
    option = option || { reason: RongRTCConstant.ScreenShareReason.API };
    this.screenSharingStatus = false;
    if (this.isSubscribeVersion()) {
      // 订阅分发版本
      var resource = this.convertResource(this.resource, RongRTCConstant.DeviceType.ScreenShare, RongRTCConstant.OperationType.CLOSE);
      // 变更resource
      this.changeResource(this.userId, resource);
      // 发信令
      this.update_resource(resource);
    }
    this.rongRTCEngineEventHandle.call('onStopScreenShareComplete', {
      isSuccess: true,
      reason: option.reason
    });

    // offer
    var pcClient = this.peerConnections[this.userId];
    if (pcClient != null) {
      // 只有一人时，值为null，在订阅分发版本中，只有一人时也有peerConnection
      var pc = pcClient['pc'];
      if (this.isScreenStreamSeparate && this.localScreenStream) {
        // 屏幕共享流分离
        pc.removeStream(this.localScreenStream);
        this.localScreenStream = null;
      }
      console.warn(new Date(), "stopScreenShare createOffer");
      this.createOffer(pc, this.userId, false);
    } else {
      if (this.isScreenStreamSeparate && this.localScreenStream) {
        // 屏幕共享流分离
        this.localScreenStream = null;
      }
    }
  };
  /** ----- screenShare ----- */
  /** ----- 会控 ----- */
  /**
  * 变更为观察者
  *
  */
  RongRTCEngine.prototype.change2Observer = function (userId) {
    // 变更userType
    this.changeUserType(userId, RongRTCConstant.UserType.OBSERVER);
    if (userId == this.userId) {
      if (this.isSubscribeVersion()) {
        // 订阅分发版本
        if (this.isStartStopLocalTrack) {
          // start/stop track
          this.stopLocalTrack(RongRTCConstant.DeviceType.CameraAndMicrophone);
        }
        // 变更Track绑定
        this.updateLocalTrackBind(this.resource);
      }
      // 关闭屏幕共享
      if (this.screenSharingStatus) {
        // 开启了屏幕共享
        if (this.localScreenVideoTrack) {
          // 移除screenVideoTrack
          if (this.isScreenStreamSeparate) {
            // 屏幕共享流分离
            this.localScreenStream.removeTrack(this.localScreenVideoTrack);
          } else {
            this.localStream.removeTrack(this.localScreenVideoTrack);
          }
          // stop后会关闭弹出的屏幕共享工具条
          this.localScreenVideoTrack.stop();
          this.localScreenVideoTrack = null;
        }
      }
      // offer
      var pcClient = this.peerConnections[this.userId];
      if (pcClient != null) {
        // 只有一人时，值为null，在订阅分发版本中，只有一人时也有peerConnection
        var pc = pcClient['pc'];
        pc.removeStream(this.localStream);
        if (this.isScreenStreamSeparate && this.localScreenStream && this.screenSharingStatus) {
          // 屏幕共享流分离且开启了屏幕共享
          pc.removeStream(this.localScreenStream);
          this.localScreenStream = null;
        }
        console.warn(new Date(), "change2Observer createOffer");
        this.createOffer(pc, this.userId, false);
      } else {
        if (this.isScreenStreamSeparate && this.localScreenStream && this.screenSharingStatus) {
          // 屏幕共享流分离且开启了屏幕共享
          this.localScreenStream = null;
        }
      }
    }
  };
  /**
  * 变更为普通与会人员
  *
  */
  RongRTCEngine.prototype.change2Normal = function (userId) {
    // 变更userType
    this.changeUserType(userId, RongRTCConstant.UserType.NORMAL);

    if (userId == this.userId) {
      var createOffer = function createOffer(rongRTCEngine) {
        // offer
        var pcClient = rongRTCEngine.peerConnections[rongRTCEngine.userId];
        if (pcClient != null) {
          // 只有一人时，值为null，在订阅分发版本中，只有一人时也有peerConnection
          var pc = pcClient['pc'];
          pc.addStream(rongRTCEngine.localStream);
          console.warn(new Date(), "change2Normal createOffer");
          rongRTCEngine.createOffer(pc, rongRTCEngine.userId, false);
        }
      };
      if (this.isSubscribeVersion()) {
        // 订阅分发版本
        if (this.isStartStopLocalTrack) {
          // start/stop track
          this.startLocalTrack(RongRTCConstant.DeviceType.CameraAndMicrophone, createOffer);
          return;
        }
        // 变更Track绑定
        this.updateLocalTrackBind(this.resource);
      }
      if (this.localStream == null || this.localStream.getTracks().length == 0) {
        var rongRTCEngine = this;
        var mediaConfig = this.getMediaConfig(true, true);
        RongRTCUtil.getMedia(mediaConfig).then(function (stream) {
          console.info(new Date(), "change2Normal navigator.getUserMedia success");
          rongRTCEngine.setLocalStream(stream);
          // 刷新本地视频窗口的流
          RongRTCUtil.setMediaStream(rongRTCEngine.userId, rongRTCEngine.localStream);
          // offer
          createOffer(rongRTCEngine);
        }).catch(function (error) {
          console.error(new Date(), "change2Normal navigator.getUserMedia error: ", error);
        });
      } else {
        // offer
        createOffer(this);
      }
    }
  };
  /**
  * 变更为主持人
  *
  */
  RongRTCEngine.prototype.change2Host = function (userId) {
    // 变更userType
    this.changeUserType(userId, RongRTCConstant.UserType.HOST);
  };
  /**
  * 变更userType
  *
  */
  RongRTCEngine.prototype.changeUserType = function (userId, userType) {
    if (userType == RongRTCConstant.UserType.HOST) {
      // 变更为主持人
      // 原主持人变更为普通与会人员
      var resetUserArr = [];
      this.joinedUsers.getEntrys().forEach(function (userEntry) {
        var user = userEntry.value;
        if (user.userType == RongRTCConstant.UserType.HOST) {
          user.userType = RongRTCConstant.UserType.NORMAL;
          resetUserArr.push(user);
        }
      });
      var rongRTCEngine = this;
      resetUserArr.forEach(function (user) {
        rongRTCEngine.joinedUsers.put(user.userId, user);
      });
      // 其他人获取主持人，若此时自己是主持人，自己变成普通与会人员
      if (this.userId != userId && this.userType == RongRTCConstant.UserType.HOST) {
        this.userType = RongRTCConstant.UserType.NORMAL;
      }
    }

    if (userId == this.userId) {
      this.userType = userType;
    }
    var user = this.joinedUsers.get(userId);
    if (user != null) {
      user.userType = userType;
      this.joinedUsers.put(userId, user);
    }

    if (this.isSubscribeVersion()) {
      // 订阅分发版本
      // 变更resource
      if (userType == RongRTCConstant.UserType.NORMAL) {
        // 变更为普通与会人员
        this.changeResource(userId, RongRTCConstant.ResourceType.AudioAndVideo);
      } else if (userType == RongRTCConstant.UserType.OBSERVER) {
        // 变更为观察者
        this.changeResource(userId, RongRTCConstant.ResourceType.None);
      } else if (userType == RongRTCConstant.UserType.HOST) ;
    } else {
      // 变更talkType
      if (userType == RongRTCConstant.UserType.NORMAL) {
        // 变更为普通与会人员
        this.changeTalkType(userId, RongRTCConstant.DeviceType.CameraAndMicrophone, true);
      } else if (userType == RongRTCConstant.UserType.OBSERVER) {
        // 变更为观察者
        this.changeTalkType(userId, RongRTCConstant.DeviceType.CameraAndMicrophone, false);
      } else if (userType == RongRTCConstant.UserType.HOST) ;
    }
  };
  /**
  * 变更talkType
  *
  */
  RongRTCEngine.prototype.changeTalkType = function (userId, deviceType, isOpen) {
    // change talkType
    var operationType = isOpen ? RongRTCConstant.OperationType.OPEN : RongRTCConstant.OperationType.CLOSE;
    if (userId == this.userId) {
      var oldTalkType = this.talkType;
      var newTalkType = this.convertTalkType(oldTalkType, deviceType, operationType);
      this.talkType = newTalkType;
    }
    var user = this.joinedUsers.get(userId);
    if (user != null) {
      var oldTalkType = user.talkType;
      var newTalkType = this.convertTalkType(oldTalkType, deviceType, operationType);
      user.talkType = newTalkType;
      this.joinedUsers.put(userId, user);
    }
    if (userId == this.userId) {
      // change carema/microphone track
      this.enableLocalTrack(deviceType, isOpen);
    }
    // 远端
    if (isOpen && deviceType == RongRTCConstant.DeviceType.Camera) {
      // 打开摄像头
      var remoteStream = this.getRemoteStream(userId);
      if (remoteStream && remoteStream.getVideoTracks()) {
        remoteStream.getVideoTracks().forEach(function (track) {
          track.enabled = true;
        });
      }
    }
  };
  /**
  * 转换talktype
  *
  */
  RongRTCEngine.prototype.convertTalkType = function (oldTalkType, deviceType, operationType) {
    var videoEnable = true;
    var audioEnable = true;
    if (oldTalkType == RongRTCConstant.TalkType.OnlyAudio || oldTalkType == RongRTCConstant.TalkType.None) {
      // 无视频
      videoEnable = false;
    }
    if (oldTalkType == RongRTCConstant.TalkType.OnlyVideo || oldTalkType == RongRTCConstant.TalkType.None) {
      // 无音频
      audioEnable = false;
    }

    if (operationType == RongRTCConstant.OperationType.OPEN) {
      // 打开
      if (deviceType == RongRTCConstant.DeviceType.Camera) {
        videoEnable = true;
      } else if (deviceType == RongRTCConstant.DeviceType.Microphone) {
        audioEnable = true;
      } else if (deviceType == RongRTCConstant.DeviceType.CameraAndMicrophone) {
        videoEnable = true;
        audioEnable = true;
      }
    } else if (operationType == RongRTCConstant.OperationType.CLOSE) {
      // 关闭
      if (deviceType == RongRTCConstant.DeviceType.Camera) {
        videoEnable = false;
      } else if (deviceType == RongRTCConstant.DeviceType.Microphone) {
        audioEnable = false;
      } else if (deviceType == RongRTCConstant.DeviceType.CameraAndMicrophone) {
        videoEnable = false;
        audioEnable = false;
      }
    }

    var newTalkType = oldTalkType;
    if (videoEnable && audioEnable) {
      newTalkType = RongRTCConstant.TalkType.All;
    } else if (videoEnable && !audioEnable) {
      newTalkType = RongRTCConstant.TalkType.OnlyVideo;
    } else if (!videoEnable && audioEnable) {
      newTalkType = RongRTCConstant.TalkType.OnlyAudio;
    } else if (!videoEnable && !audioEnable) {
      newTalkType = RongRTCConstant.TalkType.None;
    }
    return newTalkType;
  };
  /** ----- 会控 ----- */
  /** ----- 订阅分发 ----- */
  /**
  * 是否订阅分发版本
  *
  */
  RongRTCEngine.prototype.isSubscribeVersion = function () {
    if (this.logonVersion == RongRTCConstant.LogonVersion.SUBSCRIBE) {
      // 订阅分发版本
      return true;
    }
    return false;
  };
  /**
  * 变更资源
  *
  */
  RongRTCEngine.prototype._updateResource = function (resource) {
    var oldResource = this.resource;
    // 变更resource
    this.changeResource(this.userId, resource);
    var createOffer = function createOffer(rongRTCEngine) {
      // offer
      var pcClient = rongRTCEngine.peerConnections[rongRTCEngine.userId];
      if (pcClient != null) {
        // 只有一人时，值为null，在订阅分发版本中，只有一人时也有peerConnection
        var pc = pcClient['pc'];
        console.warn(new Date(), "_updateResource createOffer");
        rongRTCEngine.createOffer(pc, rongRTCEngine.userId, false);
      }
    };
    if (this.isStartStopLocalTrack) {
      // start/stop track
      // 转换operation
      var operation = this.convertOperation(oldResource, resource);
      var deviceType = operation.deviceType;
      var operationType = operation.operationType;
      if (operationType == RongRTCConstant.OperationType.OPEN) {
        // 打开
        this.startLocalTrack(deviceType, createOffer);
        return;
      }
      this.stopLocalTrack(deviceType);
    }
    // 变更Track绑定
    this.updateLocalTrackBind(this.resource);
    // offer
    createOffer(this);
  };
  /**
  * 变更resource
  *
  */
  RongRTCEngine.prototype.changeResource = function (userId, resource) {
    // change resource
    var oldResource;
    if (userId == this.userId) {
      oldResource = this.resource;
      this.resource = resource;
    }
    var user = this.joinedUsers.get(userId);
    if (user != null) {
      oldResource = user.resource;
      user.resource = resource;
      this.joinedUsers.put(userId, user);
    }
    oldResource = oldResource || resource;
    // 转换operation
    var operation = this.convertOperation(oldResource, resource);
    var deviceType = operation.deviceType;
    var operationType = operation.operationType;
    var isOpen = operationType == RongRTCConstant.OperationType.OPEN ? true : false;
    // 变更talkType
    this.changeTalkType(userId, deviceType, isOpen);
  };
  /**
  * 转换resource
  *
  */
  RongRTCEngine.prototype.convertResource = function (oldResource, deviceType, operationType) {
    var enableType = operationType == RongRTCConstant.OperationType.OPEN ? RongRTCConstant.EnableType.Enable : RongRTCConstant.EnableType.Disable;
    // 转换成二进制后反转，第一位是麦克风，第二位是摄像头，第三位是屏幕共享
    var oldBinaryArr = oldResource.toString(2).split("").reverse();
    var binaryArr = oldBinaryArr;
    if (deviceType == RongRTCConstant.DeviceType.Microphone) {
      // 麦克风
      binaryArr[0] = enableType;
    } else if (deviceType == RongRTCConstant.DeviceType.Camera) {
      // 摄像头
      binaryArr[1] = enableType;
    } else if (deviceType == RongRTCConstant.DeviceType.CameraAndMicrophone) {
      // 麦克风+摄像头
      binaryArr[0] = enableType;
      binaryArr[1] = enableType;
    } else if (deviceType == RongRTCConstant.DeviceType.ScreenShare) {
      // 屏幕共享
      binaryArr[2] = enableType;
    }
    // 补0
    if (binaryArr[0] == null) {
      binaryArr[0] = 0;
    }
    if (binaryArr[1] == null) {
      binaryArr[1] = 0;
    }
    if (binaryArr[2] == null) {
      binaryArr[2] = 0;
    }
    // 反转后转换成十进制
    var resource = parseInt(binaryArr.reverse().join(""), 2);
    return resource;
  };
  /**
  * 转换operation
  *
  */
  RongRTCEngine.prototype.convertOperation = function (oldResource, resource) {
    var operation = {};
    // 转换成二进制后反转，第一位是麦克风，第二位是摄像头，第三位是屏幕共享
    var oldBinaryArr = oldResource.toString(2).split("").reverse();
    var binaryArr = resource.toString(2).split("").reverse();
    // 补0
    if (oldBinaryArr[0] == null) {
      oldBinaryArr[0] = 0;
    }
    if (oldBinaryArr[1] == null) {
      oldBinaryArr[1] = 0;
    }
    if (oldBinaryArr[2] == null) {
      oldBinaryArr[2] = 0;
    }
    if (binaryArr[0] == null) {
      binaryArr[0] = 0;
    }
    if (binaryArr[1] == null) {
      binaryArr[1] = 0;
    }
    if (binaryArr[2] == null) {
      binaryArr[2] = 0;
    }
    if (binaryArr[2] > oldBinaryArr[2]) {
      // 开启了屏幕共享
      operation.deviceType = RongRTCConstant.DeviceType.ScreenShare, operation.operationType = RongRTCConstant.OperationType.OPEN;
    } else if (binaryArr[2] < oldBinaryArr[2]) {
      // 关闭了屏幕共享
      operation.deviceType = RongRTCConstant.DeviceType.ScreenShare, operation.operationType = RongRTCConstant.OperationType.CLOSE;
    } else {
      if (binaryArr[1] > oldBinaryArr[1] && binaryArr[0] > oldBinaryArr[0]) {
        // 开启了摄像头+麦克风
        operation.deviceType = RongRTCConstant.DeviceType.CameraAndMicrophone, operation.operationType = RongRTCConstant.OperationType.OPEN;
      } else if (binaryArr[1] < oldBinaryArr[1] && binaryArr[0] < oldBinaryArr[0]) {
        // 关闭了摄像头+麦克风
        operation.deviceType = RongRTCConstant.DeviceType.CameraAndMicrophone, operation.operationType = RongRTCConstant.OperationType.CLOSE;
      } else {
        if (binaryArr[1] > oldBinaryArr[1]) {
          // 开启了摄像头
          operation.deviceType = RongRTCConstant.DeviceType.Camera, operation.operationType = RongRTCConstant.OperationType.OPEN;
        } else if (binaryArr[1] < oldBinaryArr[1]) {
          // 关闭了摄像头
          operation.deviceType = RongRTCConstant.DeviceType.Camera, operation.operationType = RongRTCConstant.OperationType.CLOSE;
        }
        if (binaryArr[0] > oldBinaryArr[0]) {
          // 开启了麦克风
          operation.deviceType = RongRTCConstant.DeviceType.Microphone, operation.operationType = RongRTCConstant.OperationType.OPEN;
        } else if (binaryArr[0] < oldBinaryArr[0]) {
          // 关闭了麦克风
          operation.deviceType = RongRTCConstant.DeviceType.Microphone, operation.operationType = RongRTCConstant.OperationType.CLOSE;
        }
      }
    }
    return operation;
  };
  /**
  * resourceType转talkType
  *
  */
  RongRTCEngine.prototype.convertResourceType2TalkType = function (resourceType) {
    if (resourceType == RongRTCConstant.ResourceType.AudioOnly || resourceType == RongRTCConstant.ResourceType.AudioAndScreenSharing) {
      // 只音频
      return RongRTCConstant.TalkType.OnlyAudio;
    }
    if (resourceType == RongRTCConstant.ResourceType.VideoOnly || resourceType == RongRTCConstant.ResourceType.VideoAndScreenSharing) {
      // 只视频
      return RongRTCConstant.TalkType.OnlyVideo;
    }
    if (resourceType == RongRTCConstant.ResourceType.ScreenSharing) {
      // 屏幕共享
      if (this.isScreenStreamSeparate) {
        // 屏幕共享流分离
        return RongRTCConstant.TalkType.None;
      }
      return RongRTCConstant.TalkType.OnlyVideo;
    }
    if (resourceType == RongRTCConstant.ResourceType.AudioAndVideo || resourceType == RongRTCConstant.ResourceType.AudioAndVideoAndScreenSharing) {
      // 音视频
      return RongRTCConstant.TalkType.All;
    }
    if (resourceType == RongRTCConstant.ResourceType.None) {
      // 无音视频
      return RongRTCConstant.TalkType.None;
    }
    return null;
  };
  /**
  * talkType转resourceType
  *
  */
  RongRTCEngine.prototype.convertTalkType2ResourceType = function (talkType, screenSharingStatus) {
    if (talkType == RongRTCConstant.TalkType.OnlyAudio) {
      // 只音频
      if (screenSharingStatus) {
        return RongRTCConstant.ResourceType.AudioAndScreenSharing;
      }
      return RongRTCConstant.ResourceType.AudioOnly;
    }
    if (talkType == RongRTCConstant.TalkType.OnlyVideo) {
      // 只视频
      if (screenSharingStatus) {
        return RongRTCConstant.ResourceType.VideoAndScreenSharing;
      }
      return RongRTCConstant.ResourceType.VideoOnly;
    }
    if (talkType == RongRTCConstant.TalkType.All) {
      // 音视频
      if (screenSharingStatus) {
        return RongRTCConstant.ResourceType.AudioAndVideoAndScreenSharing;
      }
      return RongRTCConstant.ResourceType.AudioAndVideo;
    }
    if (talkType == RongRTCConstant.TalkType.None) {
      // 无音视频
      if (screenSharingStatus) {
        return RongRTCConstant.ResourceType.ScreenSharing;
      }
      return RongRTCConstant.ResourceType.None;
    }
    return null;
  };
  /**
  * stop本地音频track
  *
  */
  RongRTCEngine.prototype.stopLocalAudioTrack = function () {
    if (this.localAudioTrack) {
      this.localAudioTrack.stop();
    }
    if (this.localStream && this.localStream.getAudioTracks()) {
      this.localStream.getAudioTracks().forEach(function (track) {
        track.stop();
      });
    }
  };
  /**
  * stop本地视频track
  *
  */
  RongRTCEngine.prototype.stopLocalVideoTrack = function () {
    if (this.localVideoTrack) {
      this.localVideoTrack.stop();
    }
    if (this.localStream && this.localStream.getVideoTracks()) {
      this.localStream.getVideoTracks().forEach(function (track) {
        track.stop();
      });
    }
  };
  /**
  * stop本地track
  *
  */
  RongRTCEngine.prototype.stopLocalTrack = function (deviceType) {
    if (deviceType == RongRTCConstant.DeviceType.Camera) {
      this.stopLocalVideoTrack();
    } else if (deviceType == RongRTCConstant.DeviceType.Microphone) {
      this.stopLocalAudioTrack();
    } else if (deviceType == RongRTCConstant.DeviceType.CameraAndMicrophone) {
      this.stopLocalVideoTrack();
      this.stopLocalAudioTrack();
    }
  };
  /**
  * start本地track
  *
  */
  RongRTCEngine.prototype.startLocalTrack = function (deviceType, callback) {
    var localVideoEnable = false;
    var localAudioEnable = false;
    var isNeedStart = true;
    if (deviceType == RongRTCConstant.DeviceType.Camera) {
      localVideoEnable = true;
    } else if (deviceType == RongRTCConstant.DeviceType.Microphone) {
      localAudioEnable = true;
    } else if (deviceType == RongRTCConstant.DeviceType.CameraAndMicrophone) {
      localVideoEnable = true;
      localAudioEnable = true;
    } else {
      isNeedStart = false;
    }
    if (isNeedStart) {
      var rongRTCEngine = this;
      var mediaConfig = this.getMediaConfig(localVideoEnable, localAudioEnable);
      RongRTCUtil.getMedia(mediaConfig).then(function (stream) {
        console.info(new Date(), "startLocalTrack navigator.getUserMedia success");
        rongRTCEngine.setLocalStream(stream);
        // 刷新本地视频窗口的流
        RongRTCUtil.setMediaStream(rongRTCEngine.userId, rongRTCEngine.localStream);
        callback(rongRTCEngine);
      }).catch(function (error) {
        console.error(new Date(), "startLocalTrack navigator.getUserMedia error: ", error);
      });
    }
  };
  /**
  * 变更本地Track绑定
  *
  */
  RongRTCEngine.prototype.updateLocalTrackBind = function (resource) {
    if (resource == RongRTCConstant.ResourceType.None || resource == RongRTCConstant.ResourceType.ScreenSharing) {
      // 无音视频
      if (this.localAudioTrack) {
        this.localStream.removeTrack(this.localAudioTrack);
      }
      if (this.localVideoTrack) {
        this.localStream.removeTrack(this.localVideoTrack);
      }
    } else if (resource == RongRTCConstant.ResourceType.AudioOnly || resource == RongRTCConstant.ResourceType.AudioAndScreenSharing) {
      // 只音频
      if (this.localAudioTrack) {
        this.localStream.addTrack(this.localAudioTrack);
      }
      if (this.localVideoTrack) {
        this.localStream.removeTrack(this.localVideoTrack);
      }
    } else if (resource == RongRTCConstant.ResourceType.VideoOnly || resource == RongRTCConstant.ResourceType.VideoAndScreenSharing) {
      // 只视频
      if (this.localAudioTrack) {
        this.localStream.removeTrack(this.localAudioTrack);
      }
      if (this.localVideoTrack) {
        this.localStream.addTrack(this.localVideoTrack);
      }
    } else if (resource == RongRTCConstant.ResourceType.AudioAndVideo || resource == RongRTCConstant.ResourceType.AudioAndVideoAndScreenSharing) {
      // 音视频
      if (this.localAudioTrack) {
        this.localStream.addTrack(this.localAudioTrack);
      }
      if (this.localVideoTrack) {
        this.localStream.addTrack(this.localVideoTrack);
      }
    }
  };
  /** ----- 订阅分发 ----- */
  /** ----- 请求信令 ----- */
  // /**
  // * 请求logon信令
  // *
  // */
  // RongRTCEngine.prototype.logon = function() {
  // this.sendMsg(RongRTCConstant.SignalType.LOGON, this.token, {
  // 'version' : RongRTCConstant.LOGON_VERSION
  // });
  // }
  // /**
  // * 请求join信令
  // *
  // */
  // RongRTCEngine.prototype.join = function() {
  // this.sendMsg(RongRTCConstant.SignalType.JOIN, null, {
  // 'key' : this.channelId,
  // 'type' : this.userType
  // });
  // }
  /**
  * 请求logonAndJoin信令
  *
  */
  RongRTCEngine.prototype.logonAndJoin = function (status) {
    this.logonAndJoinStatus = status == null || status == undefined ? 0 : status;
    this.offerStatus = null;
    if (this.isSubscribeVersion()) {
      // 订阅分发版本
      this.sendMsg(RongRTCConstant.SignalType.LOGONANDJOIN, this.token, {
        'key': this.channelId,
        'type': this.userType,
        'status': this.logonAndJoinStatus,
        'version': this.logonVersion,
        'userName': this.userName,
        'clientType': RongRTCConstant.CLIENT_TYPE,
        'carelist': this.care,
        'resourcelist': this.resource
      });
    } else {
      this.sendMsg(RongRTCConstant.SignalType.LOGONANDJOIN, this.token, {
        'key': this.channelId,
        'type': this.userType,
        'index': this.talkType,
        'status': this.logonAndJoinStatus,
        'version': this.logonVersion,
        'userName': this.userName,
        'clientType': RongRTCConstant.CLIENT_TYPE
        // , 'mediaid': this.userId // 只在融云RCE环境下开启
      });
    }
  };
  /**
  * 请求channelPing信令
  *
  */
  RongRTCEngine.prototype.channelPing = function () {
    this.sendMsg(RongRTCConstant.SignalType.CHANNEL_PING, null, {
      'key': this.channelId
    });
  };
  /**
  * 请求leave信令
  *
  */
  RongRTCEngine.prototype.leave = function () {
    this.sendMsg(RongRTCConstant.SignalType.LEAVE, null, {
      'key': this.channelId
    });
  };
  /**
  * 请求updateTalkType信令
  * @Deprecated
  */
  RongRTCEngine.prototype.updateTalkType = function () {
    this.sendMsg(RongRTCConstant.SignalType.UPDATETALKTYPE, null, {
      'key': this.channelId,
      'index': this.localVideoEnable ? RongRTCConstant.TalkType.All : RongRTCConstant.TalkType.OnlyAudio
    });
  };
  /**
  * 请求turnTalkType信令
  *
  */
  RongRTCEngine.prototype.turnTalkType = function (type, index) {
    this.sendMsg(RongRTCConstant.SignalType.TURNTALKTYPE, null, {
      'key': this.channelId,
      'type': type,
      'index': index
    });
  };
  /**
  * 请求screenSharing信令
  *
  */
  RongRTCEngine.prototype.screenSharing = function (index) {
    this.sendMsg(RongRTCConstant.SignalType.SCREENSHARING, null, {
      'key': this.channelId,
      'index': index
    });
  };
  /**
  * 请求offer信令
  *
  */
  RongRTCEngine.prototype.offer = function (content, from, bodys) {
    this.sendMsg(RongRTCConstant.SignalType.EXCHANGE, content, {
      'key': this.channelId,
      'type': RongRTCConstant.ExchangeType.OFFER,
      'to': from
    }, bodys);
  };
  /**
  * 请求answer信令
  *
  */
  RongRTCEngine.prototype.answer = function (desc, from) {
    this.sendMsg(RongRTCConstant.SignalType.EXCHANGE, desc, {
      'key': this.channelId,
      'type': RongRTCConstant.ExchangeType.ANSWER,
      'to': from
    });
  };
  /**
  * 请求candidate信令
  *
  */
  RongRTCEngine.prototype.candidate = function (candidate, userId) {
    this.sendMsg(RongRTCConstant.SignalType.EXCHANGE, candidate, {
      'key': this.channelId,
      'type': RongRTCConstant.ExchangeType.CANDIDATE,
      'to': userId
    });
  };
  /**
  * 请求白板信令
  *
  */
  RongRTCEngine.prototype.ewbCreate = function () {
    this.sendMsg(RongRTCConstant.SignalType.EWBCREATE, null, {
      'key': this.channelId
    });
  };
  /**
  * 查询白板信令
  *
  */
  RongRTCEngine.prototype.ewbQuery = function () {
    this.sendMsg(RongRTCConstant.SignalType.EWBQUERY, null, {
      'key': this.channelId
    });
  };
  /** ----- 会控请求 ----- */
  /**
  * 主持人或者主讲人调用发起, 指定画布显示为屏幕共享
  *
  */
  RongRTCEngine.prototype.shareType = function (data, index, content) {
    this.sendMsg(RongRTCConstant.SignalType.SHARETYPE, content, {
      'key': this.channelId,
      'index': index
    });
  };
  /**
  * 与会人员能力管理
  *
  */
  RongRTCEngine.prototype.roleChange = function (userId, index) {
    this.sendMsg(RongRTCConstant.SignalType.ROLECHANGE, null, {
      'key': this.channelId,
      'to': userId,
      'index': index
    });
  };
  /**
  * 申请管理
  *
  */
  RongRTCEngine.prototype.apply = function (index) {
    this.sendMsg(RongRTCConstant.SignalType.APPLY, null, {
      'key': this.channelId,
      'index': index
    });
  };
  /**
  * 与会人员设备管理
  *
  */
  RongRTCEngine.prototype.manageAction = function (userId, type, index) {
    this.sendMsg(RongRTCConstant.SignalType.MANAGEACTION, null, {
      'key': this.channelId,
      'to': userId,
      'index': index,
      'type': type
    });
  };
  /**
  * 会控应答
  *
  */
  RongRTCEngine.prototype.channelAnswer = function (userId, index, type, status) {
    var parameters = {
      'key': this.channelId,
      'to': userId,
      'index': index,
      'status': status
    };
    if (type != null && type != '') {
      parameters.type = type;
    }
    this.sendMsg(RongRTCConstant.SignalType.CHANNELANSWER, null, parameters);
  };
  /** ----- 会控请求 ----- */
  /** ----- 大小流请求 ----- */
  /**
  * 大小流订阅
  *
  */
  RongRTCEngine.prototype.flowSubscribe = function (flowSubscribes) {
    this.sendMsg(RongRTCConstant.SignalType.FLOWSUBSCRIBE, flowSubscribes, {
      'key': this.channelId
    });
  };
  /** ----- 大小流请求 ----- */
  /** ----- 订阅分发请求 ----- */
  /**
  * 请求update_resource信令
  *
  */
  RongRTCEngine.prototype.update_resource = function (resource) {
    var content = {
      'userId': this.userId,
      'resource': resource
    };
    content = JSON.stringify(content);
    this.sendMsg(RongRTCConstant.SignalType.UPDATE_RESOURCE, content, {
      'key': this.channelId
    });
  };
  /**
  * 请求update_subscribe信令
  *
  */
  RongRTCEngine.prototype.update_subscribe = function (defaultSub, specialSubs) {
    var content = {
      'userId': this.userId,
      'defaultSub': defaultSub,
      'specialSub': specialSubs
    };
    content = JSON.stringify(content);
    this.sendMsg(RongRTCConstant.SignalType.UPDATE_SUBSCRIBE, content, {
      'key': this.channelId
    });
  };
  /**
  * 请求manage_update_resource_subscribe信令
  *
  */
  RongRTCEngine.prototype.manage_update_resource_subscribe = function (index, subscribeInfos) {
    var content = JSON.stringify(subscribeInfos);
    this.sendMsg(RongRTCConstant.SignalType.MANAGE_UPDATE_RESOURCE_SUBSCRIBE, content, {
      'key': this.channelId,
      'index': index
    });
  };
  /**
  * 请求manage_answer_update_resource信令
  *
  */
  RongRTCEngine.prototype.manage_answer_update_resource = function (index, userId, status, subscribeInfo) {
    var content = JSON.stringify(subscribeInfo);
    this.sendMsg(RongRTCConstant.SignalType.MANAGE_ANSWER_UPDATE_RESOURCE, content, {
      'key': this.channelId,
      'index': index,
      'to': userId,
      'status': status
    });
  };
  /**
  * 请求manage_answer_update_subscribe信令
  *
  */
  RongRTCEngine.prototype.manage_answer_update_subscribe = function (index, userId, status, subscribeInfo) {
    var content = JSON.stringify(subscribeInfo);
    this.sendMsg(RongRTCConstant.SignalType.MANAGE_ANSWER_UPDATE_SUBSCRIBE, content, {
      'key': this.channelId,
      'index': index,
      'to': userId,
      'status': status
    });
  };
  /** ----- 订阅分发请求 ----- */
  /** ----- 请求信令 ----- */
  /** ----- 处理应答信令 ----- */
  /**
  * 处理join_result应答信令
  *
  */
  RongRTCEngine.prototype.logonAndJoin_result = function (data) {
    var statusCode = data.parameters['statusCode'];
    var isJoined = statusCode == 'OK' ? true : false;
    if (isJoined) {
      var content = data.content; // 返回的结果是包含自己的
      if (this.isSubscribeVersion()) {
        // 订阅分发版本
        var memberArr = JSON.parse(content);
        for (var i in memberArr) {
          var userId = memberArr[i].userId;
          if (!this.joinedUsers.contains(userId)) {
            var userType = memberArr[i].userType;
            var userName = memberArr[i].userName;
            var resource = memberArr[i].resource;
            var talkType = this.convertResourceType2TalkType(resource);
            var defaultSub = memberArr[i].defaultSub;
            var specialSubs = memberArr[i].specialSub;
            var joinedUser = {
              'userId': userId,
              'userType': userType,
              'talkType': talkType,
              'userName': userName,
              'resource': resource,
              'defaultSub': defaultSub,
              'specialSubs': specialSubs
            };
            this.joinedUsers.put(userId, joinedUser);
            if (userId != this.userId) {
              this.rongRTCEngineEventHandle.call('onUserJoined', {
                'userId': userId,
                'userType': userType,
                'talkType': talkType,
                'userName': userName,
                'resource': resource,
                'defaultSub': defaultSub,
                'specialSubs': specialSubs,
                'share': serverData
              });
            } else {
              this.userType = userType;
              this.talkType = talkType;
            }
          }
        }
      } else {
        var contentArr = content.split("],");
        var member = contentArr.length > 1 ? contentArr[1] : contentArr[0];
        var memberArr = JSON.parse(member);
        for (var i in memberArr) {
          var userId = memberArr[i].userId;
          if (!this.joinedUsers.contains(userId)) {
            var userType = memberArr[i].type;
            var talkType = memberArr[i].talktype;
            var userName = memberArr[i].userName;
            var screenSharingStatus = memberArr[i].screenSharingStatus;
            var joinedUser = {
              'userId': userId,
              'userType': userType,
              'talkType': talkType,
              'userName': userName,
              'screenSharingStatus': screenSharingStatus
            };
            this.joinedUsers.put(userId, joinedUser);
            if (userId != this.userId) {
              var serverData = data.parameters['serverData'];
              this.rongRTCEngineEventHandle.call('onUserJoined', {
                'userId': userId,
                'userType': userType,
                'talkType': talkType,
                'userName': userName,
                'screenSharingStatus': screenSharingStatus,
                'share': serverData
              });
            } else {
              this.userType = userType;
              this.talkType = talkType;
            }
          }
        }
      }
      // 开始keepAlive
      this.startScheduleKeepAlive();
      if (this.logonAndJoinStatus == RongRTCConstant.LogonAndJoinStatus.RECONNECT) {
        // 断线重连，主动发offer
        var pcClient = this.peerConnections[this.userId];
        if (pcClient != null) {
          // 只有一人时，值为null，在订阅分发版本中，只有一人时也有peerConnection
          var pc = pcClient['pc'];
          console.warn(new Date(), "reLogonAndJoin createOffer");
          this.createOffer(pc, this.userId, true);
        }
      }
    }
    if (this.logonAndJoinStatus == RongRTCConstant.LogonAndJoinStatus.CONNECT // 正常加入
    || this.logonAndJoinStatus == RongRTCConstant.LogonAndJoinStatus.RECONNECT && !isJoined // 重连加入且加入失败
    || !this.onJoinComplete) {
      this.rongRTCEngineEventHandle.call('onJoinComplete', {
        'isJoined': isJoined,
        'userType': this.userType
      });
      this.onJoinComplete = true;
    }
  };
  /**
  * 处理channelPing_result应答信令
  *
  */
  RongRTCEngine.prototype.channelPing_result = function (data) {
    // 收到result，停止计时
    this.exitScheduleKeepAliveTimer();

    var statusCode = data.parameters['statusCode'];
    var isOK = statusCode == 'OK' ? true : false;
    if (!isOK) {
      this.keepAliveFailed();
    } else {
      // 重置keepAliveFailedTimes
      this.keepAliveFailedTimes = 0;
    }
  };
  /**
  * 处理leave_result应答信令
  *
  */
  RongRTCEngine.prototype.leave_result = function (data) {
    var statusCode = data.parameters['statusCode'];
    var isLeft = statusCode == 'OK' ? true : false;
    if (isLeft) {
      this.clear();
    }
    this.rongRTCEngineEventHandle.call('onLeaveComplete', {
      'isLeft': isLeft
    });
  };
  /**
  * 处理turnTalkType_result应答信令
  *
  */
  RongRTCEngine.prototype.turnTalkType_result = function (data) {
    var statusCode = data.parameters['statusCode'];
    var isSuccess = statusCode == 'OK' ? true : false;
    this.rongRTCEngineEventHandle.call('onControlAudioVideoDevice', {
      'isSuccess': isSuccess
    });
  };
  /**
  * 处理ewb_create_result应答信令
  *
  */
  RongRTCEngine.prototype.ewbCreate_result = function (data) {
    var statusCode = data.parameters['statusCode'];
    var isSuccess = statusCode == 'OK' ? true : false;
    var url = '';
    if (isSuccess && data.content) {
      url = data.content;
    }
    this.ewbUrl = url; // 观察者模式url返回为空
    this.rongRTCEngineEventHandle.call('onWhiteBoardURL', {
      'isSuccess': isSuccess,
      'url': this.ewbUrl
    });
  };
  /**
  * 处理ewb_query_result应答信令
  *
  */
  RongRTCEngine.prototype.ewbQuery_result = function (data) {
    var statusCode = data.parameters['statusCode'];
    var isSuccess = statusCode == 'OK' ? true : false;
    var url = '';
    if (isSuccess && data.content) {
      url = data.content;
    }
    this.ewbUrl = url; // 当前会议没有白板url返回为空
    this.rongRTCEngineEventHandle.call('onWhiteBoardQuery', {
      'isSuccess': isSuccess,
      'url': this.ewbUrl
    });
  };
  /*
  * 处理create_mulit_result
  *
  */
  RongRTCEngine.prototype.createMulti_result = function (data) {
    var statusCode = data.parameters['statusCode'];
    var isSuccess = statusCode == 'OK' ? true : false;
    var content = "";
    var id = "";
    var whiteboard_url = "";
    if (data.content) {
      content = JSON.parse(data.content);
      id = content.whiteboard_id;
      whiteboard_url = content.whiteboard_url;
      this.ewbId.push(id);
    }

    this.rongRTCEngineEventHandle.call('onWhiteBoardMulit', {
      'isSuccess': isSuccess,
      'content': {
        whiteboard_id: id,
        whiteboard_url: whiteboard_url
      }
    });
  };
  /*
  * 处理 deleteWhiteBoard_result 
  *
  */
  RongRTCEngine.prototype.deleteWhiteBoard_result = function (data) {
    var statusCode = data.parameters['statusCode'];
    var isSuccess = statusCode == 'OK' ? true : false;
    this.rongRTCEngineEventHandle.call('onWhiteBoardDelete', {
      'isSuccess': isSuccess
    });
  };

  /** ----- 会控应答 ----- */
  /**
  * 处理roleChange应答信令
  *
  */
  RongRTCEngine.prototype.roleChange_result = function (data) {
    var statusCode = data.parameters['statusCode'];
    var isSuccess = statusCode == 'OK' ? true : false;
    var index = data.parameters['index'];
    var to = data.parameters['to'];
    if (index == RongRTCConstant.MeetingActionType.RoleChange.DegradeToObserver) {
      // 将与会人降级为观察者
      this.rongRTCEngineEventHandle.call('onDegradeNormalUserToObserver', {
        'isSuccess': isSuccess,
        'userId': to
      });
    } else if (index == RongRTCConstant.MeetingActionType.RoleChange.UpgradeToNormal) {
      // 邀请观察者发言
      this.rongRTCEngineEventHandle.call('onDegradeNormalUserToObserver', {
        'isSuccess': isSuccess,
        'userId': to
      });
    } else if (index == RongRTCConstant.MeetingActionType.RoleChange.RemoveUser) {
      // 移除与会人员
      this.rongRTCEngineEventHandle.call('onRemoveUser', {
        'isSuccess': isSuccess,
        'userId': to
      });
    }
  };
  /**
  * 处理pply应答信令
  *
  */
  RongRTCEngine.prototype.apply_result = function (data) {
    var statusCode = data.parameters['statusCode'];
    var isSuccess = statusCode == 'OK' ? true : false;
    var index = data.parameters['index'];
    if (index == RongRTCConstant.MeetingActionType.Apply.RequestUpgradeToNormal) {
      // 观察者主动要求发言
      this.rongRTCEngineEventHandle.call('onObserverRequestBecomeNormalUser', {
        'isSuccess': isSuccess
      });
    } else if (index == RongRTCConstant.MeetingActionType.Apply.GetHostAuthority) {
      // 获取主持人权限
      var content = data.content;

      if (isSuccess) {
        // 变更为主持人
        this.change2Host(this.userId);
      }
      if (content) {
        content = JSON.parse(content);
        this.rongRTCEngineEventHandle.call('onNormalUserRequestHostAuthority', {
          'isSuccess': isSuccess,
          'content': content
        });
      } else {
        this.rongRTCEngineEventHandle.call('onNormalUserRequestHostAuthority', {
          'isSuccess': isSuccess,
          'content': content
        });
      }
    } else if (index == RongRTCConstant.MeetingActionType.Apply.GetInviteUrl) {
      // 生成邀请链接
      var inviteUrl = '';
      if (isSuccess && data.content) {
        inviteUrl = data.content;
      }
      this.rongRTCEngineEventHandle.call('onGetInviteURL', {
        'isSuccess': isSuccess,
        'url': inviteUrl
      });
    }
  };
  /**
  * 处理manageAction应答信令
  *
  */
  RongRTCEngine.prototype.manageAction_result = function (data) {
    var statusCode = data.parameters['statusCode'];
    var isSuccess = statusCode == 'OK' ? true : false;
    var type = data.parameters['type'];
    var index = data.parameters['index'];
    var to = data.parameters['to'];
    this.rongRTCEngineEventHandle.call('onHostControlUserDevice', {
      'isSuccess': isSuccess,
      'userId': to,
      'deviceType': type,
      'isOpen': index == RongRTCConstant.OperationType.OPEN ? true : false
    });
  };
  /**
  * 处理channelAnswer应答信令
  *
  */
  RongRTCEngine.prototype.channelAnswer_result = function (data) {
    var statusCode = data.parameters['statusCode'];
    var isSuccess = statusCode == 'OK' ? true : false;
    var index = data.parameters['index'];
    var type = data.parameters['type'];
    var to = data.parameters['to'];
    var status = data.parameters['status'];
    var isAccept = status == RongRTCConstant.MeetingAnswerType.Accept ? true : false;
    if (index == RongRTCConstant.MeetingActionType.ChannelAnswer.UpgradeToNormal) {
      // 邀请观察者发言
      if (isSuccess && isAccept) {
        // 变更为普通与会人员
        this.change2Normal(this.userId);
      }
      this.rongRTCEngineEventHandle.call("onAnswerUpgradeObserverToNormalUser", {
        'isSuccess': isSuccess,
        'isAccept': isAccept
      });
    } else if (index == RongRTCConstant.MeetingActionType.ChannelAnswer.RequestUpgradeToNormal) {
      // 观察者主动要求发言
      if (isSuccess && isAccept) {
        // 变更为普通与会人员
        this.change2Normal(to);
      }
      this.rongRTCEngineEventHandle.call("onAnswerObserverRequestBecomeNormalUser", {
        'isSuccess': isSuccess,
        'isAccept': isAccept
      });
    } else if (index == RongRTCConstant.MeetingActionType.ChannelAnswer.DegradeToObserver) {
      // 将与会人降级为观察者
      if (isSuccess && isAccept) {
        // 变更为观察者
        this.change2Observer(this.userId);
      }
      this.rongRTCEngineEventHandle.call("onAnswerDegradeNormalUserToObserver", {
        'isSuccess': isSuccess,
        'isAccept': isAccept
      });
    } else if (index == RongRTCConstant.MeetingActionType.ChannelAnswer.InviteToOpen || index == RongRTCConstant.MeetingActionType.ChannelAnswer.InviteToClose) {
      // 邀请打开/关闭设备
      var isOpen = index == RongRTCConstant.MeetingActionType.ChannelAnswer.InviteToOpen ? true : false;
      if (isSuccess && isAccept) {
        // 变更talkType
        this.changeTalkType(this.userId, type, isOpen);
      }
      this.rongRTCEngineEventHandle.call("onAnswerHostControlUserDevice", {
        'isSuccess': isSuccess,
        'deviceType': type,
        'isOpen': isOpen,
        'isAccept': isAccept
      });
    } else if (index == RongRTCConstant.MeetingActionType.ChannelAnswer.SetSpeak) {
      var content = data.content;
      if (content) {
        content = JSON.parse(content);
        this.rongRTCEngineEventHandle.call("onAnswerNormalUserBecomeSpeak", {
          'isSuccess': isSuccess,
          'content': content

        });
      } else {
        this.rongRTCEngineEventHandle.call("onAnswerNormalUserBecomeSpeak", {
          'isSuccess': isSuccess
        });
      }
    }
  };
  /**
  * 处理sharetype_result应答信令
  * 共享者收到
  */
  RongRTCEngine.prototype.shareType_result = function (data) {
    var statusCode = data.parameters['statusCode'];
    var isSuccess = statusCode == 'OK' ? true : false;
    var shareType = data.index;
    this.rongRTCEngineEventHandle.call("onShared", {
      'isSuccess': isSuccess,
      shareType: shareType
    });
  };
  /** ----- 会控应答 ----- */
  /** ----- 订阅分发应答 ----- */
  /**
  * 处理update_resource应答信令
  *
  */
  RongRTCEngine.prototype.update_resource_result = function (data) {
    console.log("开关摄像头资源");
    console.log(data);
  };
  /**
  * 处理update_subscribe应答信令
  *
  */
  RongRTCEngine.prototype.update_subscribe_result = function (data) {};
  /**
  * 处理manage_update_resource_subscribe应答信令
  *
  */
  RongRTCEngine.prototype.manage_update_resource_subscribe_result = function (data) {};
  /**
  * 处理manage_answer_update_resource应答信令
  *
  */
  RongRTCEngine.prototype.manage_answer_update_resource_result = function (data) {
    var statusCode = data.parameters['statusCode'];
    var isSuccess = statusCode == 'OK' ? true : false;
    var index = data.parameters['index'];
    var to = data.parameters['to'];
    var status = data.parameters['status'];
    var isAccept = status == RongRTCConstant.MeetingAnswerType.Accept ? true : false;
    var subscribeInfo = JSON.parse(data.content.replace(new RegExp('\'', 'g'), '"'));
    var userId = subscribeInfo.userId;
    var userType = subscribeInfo.userType;
    var resource = subscribeInfo.resource;

    if (resource != null && userType == null) {
      // 邀请打开/关闭设备
      var oldResource = this.resource;
      var operation = this.convertOperation(oldResource, resource);
      var deviceType = operation.deviceType;
      var operationType = operation.operationType;
      var isOpen = operationType == RongRTCConstant.OperationType.OPEN ? true : false;
      if (isSuccess && isAccept) {
        // 变更资源
        this._updateResource(resource);
      }
      this.rongRTCEngineEventHandle.call("onAnswerHostControlUserDevice", {
        'isSuccess': isSuccess,
        'deviceType': deviceType,
        'isOpen': isOpen,
        'isAccept': isAccept,
        'subscribeInfo': subscribeInfo
      });
    } else if (userType != null) {
      // 升降级
      if (index == RongRTCConstant.ManageType.Manage) {
        var oldUserType = this.userType;
        if (oldUserType == RongRTCConstant.UserType.NORMAL && userType == RongRTCConstant.UserType.OBSERVER) {
          // 将与会人降级为观察者
          if (isSuccess && isAccept) {
            // 变更为观察者
            this.change2Observer(this.userId);
          }
          this.rongRTCEngineEventHandle.call("onAnswerDegradeNormalUserToObserver", {
            'isSuccess': isSuccess,
            'isAccept': isAccept,
            'subscribeInfo': subscribeInfo
          });
        } else if (oldUserType == RongRTCConstant.UserType.OBSERVER && userType == RongRTCConstant.UserType.NORMAL) {
          // 邀请观察者发言
          if (isSuccess && isAccept) {
            // 变更为普通与会人员
            this.change2Normal(this.userId);
          }
          this.rongRTCEngineEventHandle.call("onAnswerUpgradeObserverToNormalUser", {
            'isSuccess': isSuccess,
            'isAccept': isAccept,
            'subscribeInfo': subscribeInfo
          });
        }
      } else if (index == RongRTCConstant.ManageType.Apply) {
        // 观察者主动要求发言
        if (isSuccess && isAccept) {
          // 变更为普通与会人员
          this.change2Normal(to);
        }
        this.rongRTCEngineEventHandle.call("onAnswerObserverRequestBecomeNormalUser", {
          'isSuccess': isSuccess,
          'isAccept': isAccept,
          'subscribeInfo': subscribeInfo
        });
      }
    }
  };
  /**
  * 处理manage_answer_update_subscribe应答信令
  *
  */
  RongRTCEngine.prototype.manage_answer_update_subscribe_result = function (data) {};
  /** ----- 订阅分发应答 ----- */
  /** ----- 处理应答信令 ----- */
  /** ----- 处理通知信令 ----- */
  /**
  * 处理joined通知信令
  *
  */
  RongRTCEngine.prototype.joined = function (data) {
    if (this.isSubscribeVersion()) {
      // 订阅分发版本
      var content = data.content;
      var member = JSON.parse(content);
      var userId = member.userId;
      var userType = member.userType;
      var userName = member.userName;
      var resource = member.resource;
      var talkType = this.convertResourceType2TalkType(resource);
      var defaultSub = member.defaultSub;
      var specialSubs = member.specialSub;
      if (!this.joinedUsers.contains(userId)) {
        var joinedUser = {
          'userId': userId,
          'userType': userType,
          'talkType': talkType,
          'userName': userName,
          'resource': resource,
          'defaultSub': defaultSub,
          'specialSubs': specialSubs
        };
        this.joinedUsers.put(userId, joinedUser);
      }
      //	    if (userType == RongRTCConstant.UserType.OBSERVER) { // 观察者
      this.rongRTCEngineEventHandle.call('onUserJoined', {
        'userId': userId,
        'userType': userType,
        'talkType': talkType,
        'userName': userName,
        'resource': resource,
        'defaultSub': defaultSub,
        'specialSubs': specialSubs
      });
      //	    }
    } else {
      var userId = data.parameters['serverData'];
      var userType = data.parameters['type'];
      var talkType = data.parameters['index'];
      var userName = data.parameters['userName'];
      if (!this.joinedUsers.contains(userId)) {
        var joinedUser = {
          'userId': userId,
          'userType': userType,
          'talkType': talkType,
          'userName': userName
        };
        this.joinedUsers.put(userId, joinedUser);
      }
      //	    if (userType == RongRTCConstant.UserType.OBSERVER) { // 观察者
      this.rongRTCEngineEventHandle.call('onUserJoined', {
        'userId': userId,
        'userType': userType,
        'talkType': talkType,
        'userName': userName
      });
      //	    }
    }
  };
  /**
  * 处理update_talktype通知信令
  * @Deprecated
  */
  RongRTCEngine.prototype.updateTalktype_notify = function (data) {
    var userId = data.parameters['serverData'];
    var userType = data.parameters['type'];
    var talkType = data.parameters['index'];
    this.rongRTCEngineEventHandle.call('onUserUpdatedTalkType', {
      'userId': userId,
      'userType': userType,
      'talkType': talkType
    });
  };
  /**
  * 处理turn_talktype通知信令
  *
  */
  RongRTCEngine.prototype.turnTalktype_notify = function (data) {
    var userId = data.parameters['serverData'];
    var type = data.parameters['type'];
    var index = data.parameters['index'];
    var isOpen = index == RongRTCConstant.OperationType.OPEN ? true : false;
    // 变更talkType
    this.changeTalkType(userId, type, isOpen);
    // @Deprecated
    this.rongRTCEngineEventHandle.call('onTurnTalkType', {
      'userId': userId,
      'deviceType': type,
      'isOpen': isOpen
    });
    this.rongRTCEngineEventHandle.call('onNotifyControlAudioVideoDevice', {
      'userId': userId,
      'deviceType': type,
      'isOpen': isOpen
    });
  };
  RongRTCEngine.prototype.exchangeResult = function (data) {
    var parameters = data.parameters;
    var code = parameters.statusCode;
    var isError = code == 'ERROR';
    if (isError) {
      this.wsNeedConnect = false;
      this.rongRTCEngineEventHandle.call('onNotifyRTCError', {
        // 服务暂时没有状态码，自定义错误码 1 ，提示参数错误且不会重连
        code: RongRTCError.TOKEN_USERID_MISMATCH
      });
    }
  };
  /**
  * 处理screen_sharing通知信令
  *
  */
  RongRTCEngine.prototype.screenSharing_notify = function (data) {
    var userId = data.parameters['serverData'];
    var index = data.parameters['index'];
    var isOpen = index == RongRTCConstant.OperationType.OPEN ? true : false;
    this.rongRTCEngineEventHandle.call('onNotifySharingScreen', {
      'userId': userId,
      'isOpen': isOpen
    });
  };
  /**
  * 处理left通知信令
  *
  */
  RongRTCEngine.prototype.left = function (data) {
    var userId = data.parameters['serverData'];
    var userType = data.parameters['type'];
    var user = this.joinedUsers.get(userId);
    this.joinedUsers.remove(userId);
    this.remoteStreams.remove(userId);
    this.remoteScreenStreams.remove(userId);
    this.remoteCnameMap.remove(userId);
    this.remoteSdpMap.remove(userId);
    // 移除trackId和userId的对应关系
    var removeTrackIdArr = [];
    this.remoteTrackIdMap.getEntrys().forEach(function (trackIdEntry) {
      if (userId == trackIdEntry.value) {
        removeTrackIdArr.push(trackIdEntry.key);
      }
    });
    var rongRTCEngine = this;
    removeTrackIdArr.forEach(function (trackId) {
      rongRTCEngine.remoteTrackIdMap.remove(trackId);
    });
    if (this.isSubscribeVersion()) ; else {
      if (this.joinedUsers.size() == 1) {
        // 当没有其它用户在会议时
        // 重置offerStatus状态
        this.offerStatus = null;
        // 关闭连接
        this.closePeerConnection(this.userId);
      }
    }
    this.rongRTCEngineEventHandle.call('onUserLeft', {
      'userId': userId,
      'userType': userType
    });
  };

  /**
  * 处理OfferRequest通知信令
  *
  */
  RongRTCEngine.prototype.offerRequest = function (data) {
    var from = data.parameters['serverData'];

    var pcClient = this.preparePeerConnection(from);
    var pc = pcClient['pc'];
    if (this.userType != RongRTCConstant.UserType.OBSERVER && this.localStream) {
      // 本地视频流
      pc.addStream(this.localStream);
    }
    if (this.userType != RongRTCConstant.UserType.OBSERVER && this.isScreenStreamSeparate && this.localScreenStream && this.screenSharingStatus) {
      // 屏幕共享流分离且开启了屏幕共享
      pc.addStream(this.localScreenStream);
    }
    var type = data.parameters['type'];
    if (type == '2' && this.userType != RongRTCConstant.UserType.OBSERVER && this.isEnableMinStream && this.localMinStream) {
      // 小流
      pc.addStream(this.localMinStream);
    }
    console.warn(new Date(), "offerRequest createOffer");
    var subscribeInfo;
    if (this.isSubscribeVersion()) {
      // 订阅分发版本
      subscribeInfo = {
        'userId': this.userId,
        'defaultSub': this.defaultSub,
        'specialSub': this.specialSubs
      };
    }
    this.createOffer(pc, from, false, subscribeInfo);
  };
  /**
  * 处理exchange通知信令
  *
  */
  RongRTCEngine.prototype.exchange = function (data) {
    var type = data.parameters['type'];
    if (type == RongRTCConstant.ExchangeType.OFFER) {
      this.handleOffer(data);
    } else if (type == RongRTCConstant.ExchangeType.ANSWER) {
      this.handleAnswer(data);
    } else if (type == RongRTCConstant.ExchangeType.CANDIDATE) {
      this.handleCandidate(data);
    }
  };
  /**
  * 处理ewb_create_notify通知信令
  RongRTCEngine.prototype.manageAction_notify = function (data) {
  *
  */
  RongRTCEngine.prototype.ewbCreate_notify = function (data) {
    var userId = data.parameters['serverData'];
    this.rongRTCEngineEventHandle.call('onNotifyCreateWhiteBoard', {
      'userId': userId
    });
  };
  /** ----- 会控通知 ----- */
  /**
   * 处理roleChange通知信令
   *
   */
  RongRTCEngine.prototype.roleChange_notify = function (data) {
    var index = data.parameters['index'];
    var from = data.parameters['from'];
    if (index == RongRTCConstant.MeetingActionType.RoleChange.DegradeToObserver) {
      // 将与会人降级为观察者
      this.rongRTCEngineEventHandle.call("onNotifyDegradeNormalUserToObserver", {
        'hostId': from
      });
    } else if (index == RongRTCConstant.MeetingActionType.RoleChange.UpgradeToNormal) {
      // 邀请观察者发言
      this.rongRTCEngineEventHandle.call("onNotifyUpgradeObserverToNormalUser", {
        'hostId': from
      });
    } else if (index == RongRTCConstant.MeetingActionType.RoleChange.RemoveUser) {
      // 移除与会人员
      this.rongRTCEngineEventHandle.call("onNotifyRemoveUser", {
        'hostId': from
      });
    } else if (index == RongRTCConstant.MeetingActionType.RoleChange.SetSpeak) {
      //设置主讲人
      var status = RongRTCConstant.MeetingAnswerType.Accept;
      var userId = this.userId;
      this.rongRTCEngineEventHandle.call("onNotifySetSpeaker", {
        'hostId': from
      });
      this.channelAnswer(userId, RongRTCConstant.MeetingActionType.ChannelAnswer.SetSpeak, null, status);
    } else if (index == RongRTCConstant.MeetingActionType.RoleChange.RecusalSpeaker) {
      //取消主讲人
      var status = RongRTCConstant.MeetingActionType.Deny;
      var userId = this.userId;
      this.channelAnswer(userId, RongRTCConstant.MeetingActionType.ChannelAnswer.RecusalSpeak, null, status);
      this.rongRTCEngineEventHandle.call("onNotifyRecusalSpeaker", {
        'hostId': from
      });
    }
  };
  /**
   * 处理apply通知信令
   *
   */
  RongRTCEngine.prototype.apply_notify = function (data) {
    var index = data.parameters['index'];
    var from = data.parameters['from'];
    if (index == RongRTCConstant.MeetingActionType.Apply.RequestUpgradeToNormal) {
      // 观察者主动要求发言
      this.rongRTCEngineEventHandle.call("onNotifyObserverRequestBecomeNormalUser", {
        'userId': from
      });
    } else if (index == RongRTCConstant.MeetingActionType.Apply.GetHostAuthority) {
      // 获取主持人权限
      // 变更为主持人
      this.change2Host(from);
      this.rongRTCEngineEventHandle.call("onNotifyNormalUserRequestHostAuthority", {
        'userId': from
      });
    }
    /**
     * 处理manageAction通知信令
     *
     */
    var from = data.parameters['from'];
    var type = data.parameters['type'];
    var index = data.parameters['index'];
    this.rongRTCEngineEventHandle.call("onNotifyHostControlUserDevice", {
      'hostId': from,
      'deviceType': type,
      'isOpen': index == RongRTCConstant.OperationType.OPEN ? true : false
    });
  };
  /**
  * 处理channelAnswer通知信令
  *
  */
  RongRTCEngine.prototype.channelAnswer_notify = function (data) {
    var index = data.parameters['index'];
    // 发起者的uid
    var from = data.parameters['from'];
    // 原操作发起者的uid
    var serverData = data.parameters['serverData'];
    var type = data.parameters['type'];
    var status = data.parameters['status'];
    var isAccept = status == RongRTCConstant.MeetingAnswerType.Accept ? true : false;
    if (index == RongRTCConstant.MeetingActionType.ChannelAnswer.UpgradeToNormal) {
      // 邀请观察者发言
      if (isAccept) {
        // 变更为普通与会人员
        this.change2Normal(from);
      }
      this.rongRTCEngineEventHandle.call("onNotifyAnswerUpgradeObserverToNormalUser", {
        'userId': from,
        'isAccept': isAccept
      });
    } else if (index == RongRTCConstant.MeetingActionType.ChannelAnswer.RequestUpgradeToNormal) {
      // 观察者主动要求发言
      if (isAccept) {
        // 变更为普通与会人员
        this.change2Normal(serverData);
      }
      this.rongRTCEngineEventHandle.call("onNotifyAnswerObserverRequestBecomeNormalUser", {
        'userId': serverData,
        'isAccept': isAccept
      });
    } else if (index == RongRTCConstant.MeetingActionType.ChannelAnswer.DegradeToObserver) {
      // 将与会人降级为观察者
      if (isAccept) {
        // 变更为观察者
        this.change2Observer(from);
      }
      this.rongRTCEngineEventHandle.call("onNotifyAnswerDegradeNormalUserToObserver", {
        'userId': from,
        'isAccept': isAccept
      });
    } else if (index == RongRTCConstant.MeetingActionType.ChannelAnswer.InviteToOpen || index == RongRTCConstant.MeetingActionType.ChannelAnswer.InviteToClose) {
      // 邀请打开/关闭设备
      var isOpen = index == RongRTCConstant.MeetingActionType.ChannelAnswer.InviteToOpen ? true : false;
      if (isAccept) {
        // 变更talkType
        this.changeTalkType(from, type, isOpen);
      }
      this.rongRTCEngineEventHandle.call("onNotifyAnswerHostControlUserDevice", {
        'userId': from,
        'deviceType': type,
        'isOpen': isOpen,
        'isAccept': isAccept
      });
    } else if (index == RongRTCConstant.MeetingActionType.ChannelAnswer.SetSpeak || index == RongRTCConstant.MeetingActionType.ChannelAnswer.RecusalSpeak) {
      var to = data.parameters['to'];
      var value = this.joinedUsers.get(to);
      var userType = value.userType;
      this.rongRTCEngineEventHandle.call("onNotifyAnswerOtherBecomeOrRecusalSpeaker", {
        "speakerId": from,
        "isAccept": isAccept,
        "userType": userType
      });
    }
  };
  RongRTCEngine.prototype.shareType_notify = function (data) {
    var shareType = data.parameters['index'];
    var from = data.parameters['from'];
    if (shareType == RongRTCConstant.MeetingActionType.ShareType.ShareScreen) {
      var content = data.content;
      this.rongRTCEngineEventHandle.call("onNotifyShareTypeScreen", {
        shareUserId: from,
        content: content
      });
    } else if (shareType == RongRTCConstant.MeetingActionType.ShareType.ShareEWB) {
      var url = data.parameters['serverData'];
      var content = JSON.parse(data.content.replace(new RegExp('\'', 'g'), '"'));
      this.rongRTCEngineEventHandle.call("onNotifyShareTypeEWB", {
        shareUserId: from,
        content: content
      });
    } else if (shareType == RongRTCConstant.MeetingActionType.ShareType.ShareVideo) {
      var content = data.content;
      this.rongRTCEngineEventHandle.call("onNotifyShareTypeVideo", {
        shareUserId: content
      });
    }
  };
  RongRTCEngine.prototype.updata_share_list = function (data) {
    var content = JSON.parse(data.content.replace(new RegExp('\'', 'g'), '"'));
    this.rongRTCEngineEventHandle.call("onUpdataShareList", {
      content: content
    });
  };
  /** ----- 会控通知 ----- */
  /** ----- 订阅分发通知 ----- */
  /**
  * 处理update_resource通知信令
  *
  */
  RongRTCEngine.prototype.update_resource_notify = function (data) {
    var subscribeInfo = JSON.parse(data.content);
    var userId = subscribeInfo.userId;
    var resource = subscribeInfo.resource;
    this.rongRTCEngineEventHandle.call('onNotifyResourceUpdated', {
      'userId': userId,
      'resource': resource
    });

    var user = this.joinedUsers.get(userId);
    var oldResource = user.resource;
    // 变更resource
    this.changeResource(userId, resource);
    // 转换operation
    oldResource = oldResource || resource;
    var operation = this.convertOperation(oldResource, resource);
    // 通知
    var deviceType = operation.deviceType;
    var operationType = operation.operationType;
    if (deviceType != null && operationType != null) {
      var isOpen = operationType == RongRTCConstant.OperationType.OPEN ? true : false;
      if (deviceType == RongRTCConstant.DeviceType.ScreenShare) ; else {
        // 摄像头或麦克风
        // @Deprecated
        this.rongRTCEngineEventHandle.call('onTurnTalkType', {
          'userId': userId,
          'deviceType': deviceType,
          'isOpen': isOpen
        });
        this.rongRTCEngineEventHandle.call('onNotifyControlAudioVideoDevice', {
          'userId': userId,
          'deviceType': deviceType,
          'isOpen': isOpen
        });
      }
    }
  };
  /**
  * 处理update_subscribe通知信令
  *
  */
  RongRTCEngine.prototype.update_subscribe_notify = function (data) {
    var subscribeInfo = JSON.parse(data.content);
    var userId = subscribeInfo.userId;
    var defaultSub = subscribeInfo.defaultSub;
    var specialSubs = subscribeInfo.specialSub;
    this.rongRTCEngineEventHandle.call('onNotifySubscribeUpdated', {
      'userId': userId,
      'defaultSub': defaultSub,
      'specialSubs': specialSubs
    });
  };
  /**
  * 处理manage_update_resource_subscribe通知信令
  *
  */
  RongRTCEngine.prototype.manage_update_resource_notify = function (data) {
    var index = data.parameters['index'];
    var from = data.parameters['from'];
    var subscribeInfo = JSON.parse(data.content);
    var userId = subscribeInfo.userId;
    var userType = subscribeInfo.userType;
    var resource = subscribeInfo.resource;

    if (resource != null && userType == null) {
      // 邀请打开/关闭设备
      var oldResource = this.resource;
      var operation = this.convertOperation(oldResource, resource);
      var deviceType = operation.deviceType;
      var operationType = operation.operationType;
      var isOpen = operationType == RongRTCConstant.OperationType.OPEN ? true : false;
      this.rongRTCEngineEventHandle.call("onNotifyHostControlUserDevice", {
        'hostId': from,
        'deviceType': deviceType,
        'isOpen': isOpen,
        'subscribeInfo': subscribeInfo
      });
    } else if (userType != null) {
      // 升降级
      if (index == RongRTCConstant.ManageType.Manage) {
        var oldUserType = this.userType;
        if (oldUserType == RongRTCConstant.UserType.NORMAL && userType == RongRTCConstant.UserType.OBSERVER) {
          // 将与会人降级为观察者
          this.rongRTCEngineEventHandle.call("onNotifyDegradeNormalUserToObserver", {
            'hostId': from,
            'subscribeInfo': subscribeInfo
          });
        } else if (oldUserType == RongRTCConstant.UserType.OBSERVER && userType == RongRTCConstant.UserType.NORMAL) {
          // 邀请观察者发言
          this.rongRTCEngineEventHandle.call("onNotifyUpgradeObserverToNormalUser", {
            'hostId': from,
            'subscribeInfo': subscribeInfo
          });
        }
      } else if (index == RongRTCConstant.ManageType.Apply) {
        // 观察者主动要求发言
        this.rongRTCEngineEventHandle.call("onNotifyObserverRequestBecomeNormalUser", {
          'userId': from,
          'subscribeInfo': subscribeInfo
        });
      }
    }
  };
  /**
  * 处理manage_update_subscribe_subscribe通知信令
  *
  */
  RongRTCEngine.prototype.manage_update_subscribe_notify = function (data) {}
  // onNotifySubscribeManaged

  /**
  * 处理manage_answer_update_resource通知信令
  *
  */
  ;RongRTCEngine.prototype.manage_answer_update_resource_notify = function (data) {
    var index = data.parameters['index'];
    var from = data.parameters['from'];
    var serverData = data.parameters['serverData'];
    var status = data.parameters['status'];
    var isAccept = status == RongRTCConstant.MeetingAnswerType.Accept ? true : false;
    var subscribeInfo = JSON.parse(data.content.replace(new RegExp('\'', 'g'), '"'));
    var userId = subscribeInfo.userId;
    var userType = subscribeInfo.userType;
    var resource = subscribeInfo.resource;

    if (resource != null && userType == null) {
      // 邀请打开/关闭设备
      var user = this.joinedUsers.get(from);
      if (user != null) {
        var oldResource = user.resource;
        var operation = this.convertOperation(oldResource, resource);
        var deviceType = operation.deviceType;
        var operationType = operation.operationType;
        var isOpen = operationType == RongRTCConstant.OperationType.OPEN ? true : false;
        if (isAccept) {
          // 变更resource
          this.changeResource(from, resource);
        }
        this.rongRTCEngineEventHandle.call("onNotifyAnswerHostControlUserDevice", {
          'userId': from,
          'deviceType': deviceType,
          'isOpen': isOpen,
          'isAccept': isAccept,
          'subscribeInfo': subscribeInfo
        });
      }
    } else if (userType != null) {
      // 升降级
      if (index == RongRTCConstant.ManageType.Manage) {
        var user = this.joinedUsers.get(from);
        if (user != null) {
          var oldUserType = user.userType;
          if (oldUserType == RongRTCConstant.UserType.NORMAL && userType == RongRTCConstant.UserType.OBSERVER) {
            // 将与会人降级为观察者
            if (isAccept) {
              // 变更为观察者
              this.change2Observer(from);
            }
            this.rongRTCEngineEventHandle.call("onNotifyAnswerDegradeNormalUserToObserver", {
              'userId': from,
              'isAccept': isAccept,
              'subscribeInfo': subscribeInfo
            });
          } else if (oldUserType == RongRTCConstant.UserType.OBSERVER && userType == RongRTCConstant.UserType.NORMAL) {
            // 邀请观察者发言
            if (isAccept) {
              // 变更为普通与会人员
              this.change2Normal(from);
            }
            this.rongRTCEngineEventHandle.call("onNotifyAnswerUpgradeObserverToNormalUser", {
              'userId': from,
              'isAccept': isAccept,
              'subscribeInfo': subscribeInfo
            });
          }
        }
      } else if (index == RongRTCConstant.ManageType.Apply) {
        // 观察者主动要求发言
        if (isAccept) {
          // 变更为普通与会人员
          this.change2Normal(serverData);
        }
        this.rongRTCEngineEventHandle.call("onNotifyAnswerObserverRequestBecomeNormalUser", {
          'userId': serverData,
          'isAccept': isAccept,
          'subscribeInfo': subscribeInfo
        });
      }
    }
  };
  /**
  * 处理manage_answer_update_subscribe通知信令
  *
  */
  RongRTCEngine.prototype.manage_answer_update_subscribe_notify = function (data) {};
  /** ----- 订阅分发通知 ----- */
  /** ----- 处理通知信令 ----- */
  //
  // return RongRTCEngine;
  // });
  /** ----- RongRTCEngine ----- */

  /** ----- RongRTCEngineEventHandle ----- */
  // var RongRTCEngineEventHandle = (function() {
  /**
  * 构造函数
  *
  */
  var RongRTCEngineEventHandle = function RongRTCEngineEventHandle(config) {
    /** 事件集合 */
    this.eventHandles = {};
    return this;
  };
  /**
  * 绑定事件
  *
  */
  RongRTCEngineEventHandle.prototype.on = function (eventName, event) {
    this.eventHandles[eventName] = event;
  };
  /**
  * 调用事件
  *
  */
  RongRTCEngineEventHandle.prototype.call = function (eventName, data) {
    for (var eventHandle in this.eventHandles) {
      if (eventName === eventHandle) {
        return this.eventHandles[eventName](data);
      }
    }
    console.info(new Date(), 'EventHandle ' + eventName + ' do not have defined function');
  };
  //
  // return RongRTCEngineEventHandle;
  // });
  /** ----- RongRTCEngineEventHandle ----- */

  /** ----- RongRTCConnectionStatsReport ----- */
  var RongRTCConnectionStatsReport = function RongRTCConnectionStatsReport(rongRTCEngine) {
    this.rongRTCEngine = rongRTCEngine;

    this.statsReportSend = {};
    this.statsReportRecv = {};

    // 本地丢包率
    this.packetSendLossRate = 0;
    // 音频输入电平
    this.audioInputLevel = 0;
    // 音频接收电平
    this.audioReceivedLevel = [];
    this.currentLevel = [0, 1, 2, 3, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9];
  };
  /**
  * parse statsReport
  *
  */
  RongRTCConnectionStatsReport.prototype.parseStatsReport = function (report) {
    var statsReportSend = {};
    var recvVideoMap = new RongRTCMap();
    var recvAudioMap = new RongRTCMap();
    var statsReportRecv = {};

    for (var i in report) {
      var now = report[i];
      if (now.type == 'ssrc') {
        if (now.id.indexOf("recv") != -1) {
          if (now.mediaType == 'video') {
            var recvVideo = {};
            recvVideo.googTrackId = now.googTrackId;
            recvVideo.googCodecName = now.googCodecName;
            recvVideo.googCurrentDelayMs = now.googCurrentDelayMs;
            recvVideo.googDecodeMs = now.googDecodeMs;
            recvVideo.googFrameHeightReceived = now.googFrameHeightReceived;
            recvVideo.googFrameRateDecoded = now.googFrameRateDecoded;
            recvVideo.googFrameRateOutput = now.googFrameRateOutput;
            recvVideo.googFrameRateReceived = now.googFrameRateReceived;
            recvVideo.googFrameWidthReceived = now.googFrameWidthReceived;
            recvVideo.packetsLost = now.packetsLost;
            recvVideo.packetsReceived = now.packetsReceived;
            recvVideoMap.put(recvVideo.googTrackId, recvVideo);
          } else if (now.mediaType == 'audio') {
            var recvAudio = {};
            recvAudio.googTrackId = now.googTrackId;
            recvAudio.audioOutputLevel = now.audioOutputLevel;
            recvAudioMap.put(recvAudio.googTrackId, recvAudio);
          }
        } else if (now.id.indexOf("send") != -1) {
          if (now.mediaType == 'video') {
            var sendVideo = {};
            sendVideo.googCodecName = now.googCodecName;
            sendVideo.googAvgEncodeMs = now.googAvgEncodeMs;
            sendVideo.googFrameHeightInput = now.googFrameHeightInput;
            sendVideo.googFrameHeightSent = now.googFrameHeightSent;
            sendVideo.googFrameRateSent = now.googFrameRateSent;
            sendVideo.googFrameWidthInput = now.googFrameWidthInput;
            sendVideo.googFrameWidthSent = now.googFrameWidthSent;
            sendVideo.googFrameRateInput = now.googFrameRateInput;
            sendVideo.packetsLost = now.packetsLost;
            sendVideo.packetsSent = now.packetsSent;
            statsReportSend.video = sendVideo;
          } else if (now.mediaType == 'audio') {
            var sendAudio = {};
            sendAudio.audioInputLevel = now.audioInputLevel;
            statsReportSend.audio = sendAudio;
          }
        }
      }
    }
    statsReportRecv.video = recvVideoMap;
    statsReportRecv.audio = recvAudioMap;

    var preStatsReportSend = this.statsReportSend;
    this.statsReportSend = statsReportSend;
    this.statsReportRecv = statsReportRecv;
    // 本地丢包率
    var packetSendLossRate = 0;
    packetSendLossRate = this.calculateLossRate(statsReportSend.video, preStatsReportSend.video);
    this.packetSendLossRate = packetSendLossRate;
    // 输入音平
    var audioInputLevel = 0;
    audioInputLevel = statsReportSend.audio == null ? 0 : statsReportSend.audio.audioInputLevel;
    audioInputLevel = this.calculateAudioLevel(audioInputLevel);
    this.audioInputLevel = audioInputLevel;
    // 接收音平
    var audioReceivedLevel = [];
    var rongRTCConnectionStatsReport = this;
    recvAudioMap.getEntrys().forEach(function (recvAudioEntry) {
      var trackId = recvAudioEntry.key;
      var userId = rongRTCConnectionStatsReport.rongRTCEngine.remoteTrackIdMap.get(trackId);
      if (userId != null) {
        // userId已退出
        var audioOutputLevel = recvAudioEntry.value.audioOutputLevel;
        audioOutputLevel = rongRTCConnectionStatsReport.calculateAudioLevel(audioOutputLevel);
        audioReceivedLevel.push({
          'userId': userId,
          'trackId': trackId,
          'audioOutputLevel': audioOutputLevel
        });
      }
    });
    this.audioReceivedLevel = audioReceivedLevel;
  };
  /**
  * 计算丢包率
  *
  */
  RongRTCConnectionStatsReport.prototype.calculateLossRate = function (nowStats, preStats) {
    var prePacketsSent = preStats == null || preStats.packetsSent == null || preStats.packetsSent == "" ? 0 : preStats.packetsSent;
    var prePacketsLost = preStats == null || preStats.packetsLost == null || preStats.packetsLost == "" ? 0 : preStats.packetsLost;

    var nowPacketsSent = nowStats == null || nowStats.packetsSent == null || nowStats.packetsSent == "" ? 0 : nowStats.packetsSent;
    var nowPacketsLost = nowStats == null || nowStats.packetsLost == null || nowStats.packetsLost == "" ? 0 : nowStats.packetsLost;

    if (nowPacketsSent == 0) {
      // 还未发数据
      return 0;
    }
    if (nowPacketsSent - prePacketsSent == 0) {
      // 发出的包数量为0，则表示全部丢失，丢包率为100%
      return 100;
    }
    var packetSendLossRate = (nowPacketsLost - prePacketsLost) * 100 / (nowPacketsSent - prePacketsSent + (nowPacketsLost - prePacketsLost));
    return parseInt(packetSendLossRate);
  };
  /**
  * 计算音平
  *
  */
  RongRTCConnectionStatsReport.prototype.calculateAudioLevel = function (audioLevel) {
    var pos = audioLevel == null || audioLevel == "" ? 0 : parseInt(audioLevel / 1000);
    return this.currentLevel[pos];
  };

  /** ----- RongRTCUtil ----- */
  var RongRTCUtil = {
    /**
     * 获取websocket地址列表
     *
     */
    getWsUrlList: function getWsUrlList(wsNavUrl, callback) {
      RongRTCAjax({
        type: "GET",
        url: wsNavUrl,
        async: true,
        data: {
          rand: Math.random()
        },
        dataType: "JSON",
        success: function success(data) {
          callback(data);
        },
        error: function error(_error) {
          console.error(new Date(), "request nav error: ", _error);
          throw _error;
        }
      });
    },
    /**
    * 获取媒体信息
    *
    */
    getMedia: function getMedia(mediaConfig) {
      return new Promise(function (resolve, reject) {
        navigator.getUserMedia(mediaConfig, resolve, reject);
      });
    },
    /**
     * SDP设置带宽
     *
     * @param sdp
     * @param bandWidthParam
     * @returns
     */
    setBandWidth: function setBandWidth(sdp, bandWidthParam) {
      var currentBandWidth = JSON.parse(JSON.stringify(bandWidthParam));
      var startBandWidth;
      if (RongRTCGlobal.bandWidthCount == 0) {
        startBandWidth = (currentBandWidth.min + currentBandWidth.max) / 2;
      }
      // 给带宽设置增加计数器，使每次设置的最小码率不同，防止码率一样WebRTC将码率重置成默认最小值
      RongRTCGlobal.bandWidthCount++;
      if (RongRTCGlobal.bandWidthCount % 2 == 0) {
        currentBandWidth.min = currentBandWidth.min + 1;
      }

      // set BAS
      sdp = sdp.replace(/a=mid:video\n/g, 'a=mid:video\nb=AS:' + currentBandWidth.max + '\n');

      // 查找最优先用的视频代码
      var sep1 = "\n";
      var findStr1 = "m=video";

      var sdpArr = sdp.split(sep1);
      // 查找findStr1
      var findIndex1 = RongRTCUtil.findLine(sdpArr, findStr1);
      if (findIndex1 == null) {
        return sdp;
      }

      var sep2 = " ";

      var videoDescArr1 = sdpArr[findIndex1].split(sep2);
      // m=video 9 UDP/TLS/RTP/SAVPF
      var firstVideoCode = videoDescArr1[3];
      var findStr2 = "a=rtpmap:" + firstVideoCode;
      // 查找findStr2
      var findIndex2 = RongRTCUtil.findLine(sdpArr, findStr2);
      if (findIndex2 == null) {
        return sdp;
      }

      var appendStr = 'a=fmtp:' + firstVideoCode + ' x-google-min-bitrate=' + currentBandWidth.min + '; x-google-max-bitrate=' + currentBandWidth.max;
      if (startBandWidth != null) {
        appendStr += '; x-google-start-bitrate=' + startBandWidth;
      }
      sdpArr[findIndex2] = sdpArr[findIndex2].concat(sep1 + appendStr);

      return sdpArr.join(sep1);
    },
    /**
     * SDP修改stream id
     *
     * @param sdp
     * @param oldId
     * @param newId
     * @returns
     */
    changeStreamId: function changeStreamId(sdp, oldId, newId) {
      sdp = sdp.replace(new RegExp(oldId, 'g'), newId);
      return sdp;
    },
    /**
     * SDP修改track id
     *
     * @param sdp
     * @param oldId
     * @param newId
     * @returns
     */
    changeTrackId: function changeTrackId(sdp, oldId, newId) {
      sdp = sdp.replace(new RegExp(oldId, 'g'), newId);
      return sdp;
    },
    /**
     * SDP修改video兼容参数
     *
     * @param sdp
     * @returns
     */
    changeVideoDesc: function changeVideoDesc(sdp) {
      //		var videoDesc1 = "m=video 9 RTP/AVPF 98 96 100 127 125 97 99 101";
      //		var videoDesc2 = "a=rtpmap:96 VP8/90000\r\na=rtcp-fb:96 ccm fir\r\na=rtcp-fb:96 nack\r\na=rtcp-fb:96 nack pli\r\na=rtcp-fb:96 goog-remb\r\na=rtcp-fb:96 transport-cc\r\na=rtpmap:98 H264/90000\r\na=rtcp-fb:98 ccm fir\r\na=rtcp-fb:98 nack\r\na=rtcp-fb:98 nack pli\r\na=rtcp-fb:98 goog-remb\r\na=rtcp-fb:98 transport-cc\r\na=fmtp:98 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f\r\na=rtpmap:100 red/90000\r\na=rtpmap:127 ulpfec/90000\r\na=rtpmap:125 flexfec-03/90000\r\na=rtcp-fb:125 transport-cc\r\na=rtcp-fb:125 goog-remb\r\na=fmtp:125 repair-window=10000000\r\na=rtpmap:97 rtx/90000\r\na=fmtp:97 apt=96\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=98\r\na=rtpmap:101 rtx/90000\r\na=fmtp:101 apt=100";
      //
      //		var findStr1 = "m=video";
      //		var findStr2 = "a=rtcp-rsize";
      //		var findStr3 = "a=ssrc-group";
      //
      //		var sdpArr = sdp.split('\r\n');
      //		// 查找videoDesc1
      //		var findIndex1 = RongRTCUtil.findLine(sdpArr, findStr1);
      //		// 替换videoDesc1
      //		sdpArr[findIndex1] = videoDesc1;
      //		// 查找videoDesc2
      //		var findIndex2 = RongRTCUtil.findLine(sdpArr, findStr2);
      //		var findIndex3 = RongRTCUtil.findLine(sdpArr, findStr3);
      //		// 删除中间的元素
      //		sdpArr.splice(findIndex2 + 1, findIndex3 - findIndex2 - 1);
      //		// 替换videoDesc2
      //		sdpArr[findIndex2] = sdpArr[findIndex2].concat('\r\n' + videoDesc2);
      //		return sdpArr.join('\r\n');

      var sep1 = "\r\n";
      var findStr1 = "m=video";

      var sdpArr = sdp.split(sep1);
      // 查找videoDesc1
      var findIndex1 = RongRTCUtil.findLine(sdpArr, findStr1);
      if (findIndex1 == null) {
        return sdp;
      }

      var h264_code = "98";
      var vp8_code = "96";
      var red_code = "100";
      var ulpfec_code = "127";
      var flexfec_code = "125";
      var h264_rtx_code = "99";
      var vp8_rtx_code = "97";
      var red_rtx_code = "101";

      var h264_search = "H264/90000";
      var vp8_search = "VP8/90000";
      var red_search = "red/90000";
      var ulpfec_search = "ulpfec/90000";
      var flexfec_search = "flexfec-03/90000";

      var h264_replace = "a=rtpmap:98 H264/90000\r\na=rtcp-fb:98 ccm fir\r\na=rtcp-fb:98 nack\r\na=rtcp-fb:98 nack pli\r\na=rtcp-fb:98 goog-remb\r\na=rtcp-fb:98 transport-cc\r\na=fmtp:98 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f\r\na=rtpmap:99 rtx/90000\r\na=fmtp:99 apt=98";
      var vp8_replace = "a=rtpmap:96 VP8/90000\r\na=rtcp-fb:96 ccm fir\r\na=rtcp-fb:96 nack\r\na=rtcp-fb:96 nack pli\r\na=rtcp-fb:96 goog-remb\r\na=rtcp-fb:96 transport-cc\r\na=rtpmap:97 rtx/90000\r\na=fmtp:97 apt=96";
      var red_replace = "a=rtpmap:100 red/90000\r\na=rtpmap:101 rtx/90000\r\na=fmtp:101 apt=100";
      var ulpfec_replace = "a=rtpmap:127 ulpfec/90000";
      var flexfec_replace = "a=rtpmap:125 flexfec-03/90000\r\na=rtcp-fb:125 transport-cc\r\na=rtcp-fb:125 goog-remb\r\na=fmtp:125 repair-window=10000000";

      var sep2 = " ";
      var findStr2 = "a=rtpmap";
      var findStr3 = "a=ssrc-group";

      var videoDescArr1 = sdpArr[findIndex1].split(sep2);
      // m=video 9 UDP/TLS/RTP/SAVPF
      var videoReplace1 = videoDescArr1[0] + sep2 + videoDescArr1[1] + sep2 + videoDescArr1[2];
      // 查找videoDesc2
      var findIndex2 = RongRTCUtil.findLineInRange(sdpArr, findStr2, findIndex1 + 1, sdpArr.length - 1);
      var findIndex3 = RongRTCUtil.findLineInRange(sdpArr, findStr3, findIndex2 + 1, sdpArr.length - 1);
      if (findIndex3 == null) {
        // 观察者模式没有findStr3相关信息
        findIndex3 = sdpArr.length - 1;
      }
      // 删除中间的元素
      var removeArr = sdpArr.splice(findIndex2, findIndex3 - findIndex2);

      // 查找H264
      var h264_index = RongRTCUtil.findLine(removeArr, h264_search);
      // 查找VP8
      var vp8_index = RongRTCUtil.findLine(removeArr, vp8_search);
      // 查找red
      var red_index = RongRTCUtil.findLine(removeArr, red_search);
      // 查找ulpfec
      var ulpfec_index = RongRTCUtil.findLine(removeArr, ulpfec_search);
      // 查找flexfec
      var flexfec_index = RongRTCUtil.findLine(removeArr, flexfec_search);

      var videoReplace2 = "";
      if (h264_index != null) {
        videoReplace1 += sep2 + h264_code;
        videoReplace2 += sep1 + h264_replace;
      }
      if (vp8_index != null) {
        videoReplace1 += sep2 + vp8_code;
        videoReplace2 += sep1 + vp8_replace;
      }
      if (red_index != null) {
        videoReplace1 += sep2 + red_code;
        videoReplace2 += sep1 + red_replace;
      }
      if (ulpfec_index != null) {
        videoReplace1 += sep2 + ulpfec_code;
        videoReplace2 += sep1 + ulpfec_replace;
      }
      if (flexfec_index != null) {
        videoReplace1 += sep2 + flexfec_code;
        videoReplace2 += sep1 + flexfec_replace;
      }
      if (h264_index != null) {
        videoReplace1 += sep2 + h264_rtx_code;
      }
      if (vp8_index != null) {
        videoReplace1 += sep2 + vp8_rtx_code;
      }
      if (red_index != null) {
        videoReplace1 += sep2 + red_rtx_code;
      }

      // 替换videoDesc1
      sdpArr[findIndex1] = videoReplace1;
      // 替换videoDesc2
      sdpArr[findIndex2 - 1] = sdpArr[findIndex2 - 1].concat(videoReplace2);

      return sdpArr.join(sep1);
    },
    /**
     * get cname
     *
     * @param userId
     */
    getCname: function getCname(sdp, userId) {
      var sep1 = "\n";
      var sep2 = " ";
      var sdpArr = sdp.split(sep1);

      // a=ssrc:702269835 msid:A9532881-B4CA-4B23-B219-9837CE93AA70 4716df1f-046f-4b96-a260-2593048d7e9e
      var msid_search = "msid:" + userId;
      var msid_index = RongRTCUtil.findLine(sdpArr, msid_search);
      if (msid_index == null) {
        return null;
      }
      var ssrc = sdpArr[msid_index].split(sep2)[0];

      // a=ssrc:702269835 cname:wRow2WLrs18ZB3Dg
      var cname_search = ssrc + " cname:";
      var cname_index = RongRTCUtil.findLine(sdpArr, cname_search);
      var cname = sdpArr[cname_index].split("cname:")[1];
      return cname;
    },
    /**
     * check cname
     *
     * @param userId
     */
    isHasCname: function isHasCname(sdp, cname) {
      var sep1 = "\n";
      var sdpArr = sdp.split(sep1);

      // a=ssrc:702269835 cname:wRow2WLrs18ZB3Dg
      var cname_search = "cname:" + cname;
      var cname_index = RongRTCUtil.findLine(sdpArr, cname_search);
      return cname_index != null;
    },
    getSsrc: function getSsrc(sdp, userId, cname) {
      // ssrc变化则为屏幕共享
      var sdpArr = sdp.split('\n');
      var videoLine = sdpArr.map(function (line, index) {
        if (line.indexOf('mid:video') > -1) return index;
      }).filter(function (item) {
        return item;
      });
      sdpArr = sdpArr.slice(videoLine[0]);
      var ssrc = sdpArr.filter(function (line) {
        return line.indexOf('a=ssrc:') > -1;
      });
      var cnameLine = ssrc.map(function (line, index) {
        if (line.indexOf('cname:' + cname) > -1) return index;
      }).filter(function (item) {
        return item;
      });
      var ts = ssrc.slice(cnameLine[0] + 1, cnameLine[0] + 2);
      if (ts[0] == null) {
        return null;
      }
      return ts[0].split(" ")[2];
    },
    /**
     * 数组中查找
     *
     * @param arr
     * @param substr
     * @returns
     */
    findLine: function findLine(arr, substr) {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].indexOf(substr) != -1) {
          return i;
        }
      }
      return null;
    },
    /**
     * 数组中查找
     *
     * @param arr
     * @param substr
     * @param startIndex
     * @param endIndex
     * @returns
     */
    findLineInRange: function findLineInRange(arr, substr, startIndex, endIndex) {
      var start = startIndex == null || startIndex == '' || startIndex < 0 ? 0 : startIndex;
      var end = endIndex == null || endIndex == '' || endIndex < 0 || endIndex > arr.length - 1 ? arr.length - 1 : endIndex;
      start = start > end ? end : start;
      for (var i = start; i <= end; i++) {
        if (arr[i].indexOf(substr) != -1) {
          return i;
        }
      }
      return null;
    },
    /**
     * 随机打乱数组内排序
     *
     * @param input
     * @returns
     */
    shuffle: function shuffle(input) {
      for (var i = input.length - 1; i >= 0; i--) {
        var randomIndex = Math.floor(Math.random() * (i + 1));
        var itemAtIndex = input[randomIndex];
        input[randomIndex] = input[i];
        input[i] = itemAtIndex;
      }
      return input;
    },
    /**
     * 刷新VideoView的视频流
     *
     * @param userId
     */
    refreshMediaStream: function refreshMediaStream(userId) {
      var videoView = document.getElementById(userId);
      if (videoView != null) {
        videoView.srcObject = videoView.srcObject;
      }
    },
    /**
     * 设置VideoView的视频流为指定流
     *
     * @param userId
     */
    setMediaStream: function setMediaStream(userId, stream) {
      var videoView = document.getElementById(userId);
      if (videoView != null) {
        videoView.srcObject = stream;
      }
    },
    /**
     * 当前浏览器
     */
    myBrowser: function myBrowser() {
      var userAgent = navigator.userAgent; // 取得浏览器的userAgent字符串
      if (userAgent.indexOf("Opera") > -1) {
        // 判断是否Opera浏览器
        return "Opera";
      }
      if (userAgent.indexOf("Firefox") > -1) {
        // 判断是否Firefox浏览器
        return "FF";
      }
      if (userAgent.indexOf("Chrome") > -1) {
        // 判断是否Chrome浏览器
        return "Chrome";
      }
      if (userAgent.indexOf("Safari") > -1) {
        // 判断是否Safari浏览器
        return "Safari";
      }
      if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera) {
        // 判断是否IE浏览器
        return "IE";
      }
      return "";
    }

    /** ----- RongRTCAjax ----- */
  };var RongRTCAjax = function RongRTCAjax(opt) {
    opt.type = opt.type.toUpperCase() || 'POST';
    if (opt.type === 'POST') {
      post(opt);
    } else {
      get(opt);
    }

    // 初始化数据
    function init(opt) {
      var optAdapter = {
        url: '',
        type: 'GET',
        data: {},
        async: true,
        dataType: 'JSON',
        success: function success() {},
        error: function error(s) {
          // alert('status:' + s + 'error!');
        }
      };
      opt.url = opt.url || optAdapter.url;
      opt.type = opt.type.toUpperCase() || optAdapter.method;
      opt.data = params(opt.data) || params(optAdapter.data);
      opt.dataType = opt.dataType.toUpperCase() || optAdapter.dataType;
      // opt.async = opt.async || optAdapter.async;
      opt.success = opt.success || optAdapter.success;
      opt.error = opt.error || optAdapter.error;
      return opt;
    }

    // 创建XMLHttpRequest对象
    function createXHR() {
      if (window.XMLHttpRequest) {
        // IE7+、Firefox、Opera、Chrome、Safari
        return new XMLHttpRequest();
      } else if (window.ActiveXObject) {
        // IE6 及以下
        var versions = ['MSXML2.XMLHttp', 'Microsoft.XMLHTTP'];
        for (var i = 0, len = versions.length; i < len; i++) {
          try {
            return new ActiveXObject(version[i]);
            break;
          } catch (e) {
            // 跳过
          }
        }
      } else {
        throw new Error('浏览器不支持XHR对象！');
      }
    }

    function params(data) {
      var arr = [];
      for (var i in data) {
        // 特殊字符传参产生的问题可以使用encodeURIComponent()进行编码处理
        arr.push(encodeURIComponent(i) + '=' + encodeURIComponent(data[i]));
      }
      return arr.join('&');
    }

    function callback(opt, xhr) {
      if (xhr.readyState == 4 && xhr.status == 200) {
        // 判断http的交互是否成功，200表示成功
        var returnValue;
        switch (opt.dataType) {
          case "XML":
            returnValue = xhr.responseXML;
            break;
          case "JSON":
            var jsonText = xhr.responseText;
            if (jsonText) {
              returnValue = JSON.parse(jsonText);
            }
            break;
          default:
            returnValue = xhr.responseText;
            break;
        }
        if (returnValue) {
          opt.success(returnValue);
        }
      } else {
        // alert('获取数据错误！错误代号：' + xhr.status + '，错误信息：' +
        // xhr.statusText);
        opt.error(xhr);
      }
    }

    // post方法
    function post(opt) {
      var xhr = createXHR(); // 创建XHR对象
      var opt = init(opt);
      opt.type = 'post';
      if (opt.async === true) {
        // true表示异步，false表示同步
        // 使用异步调用的时候，需要触发readystatechange 事件
        xhr.onreadystatechange = function () {
          if (xhr.readyState == 4) {
            // 判断对象的状态是否交互完成
            callback(opt, xhr); // 回调
          }
        };
      }
      // 在使用XHR对象时，必须先调用open()方法，
      // 它接受三个参数：请求类型(get、post)、请求的URL和表示是否异步。
      xhr.open(opt.type, opt.url, opt.async);
      // post方式需要自己设置http的请求头，来模仿表单提交。
      // 放在open方法之后，send方法之前。
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
      xhr.send(opt.data); // post方式将数据放在send()方法里
      if (opt.async === false) {
        // 同步
        callback(opt, xhr); // 回调
      }
    }

    // get方法
    function get(opt) {
      var xhr = createXHR(); // 创建XHR对象
      var opt = init(opt);
      opt.type = 'get';
      if (opt.async === true) {
        // true表示异步，false表示同步
        // 使用异步调用的时候，需要触发readystatechange 事件
        xhr.onreadystatechange = function () {
          if (xhr.readyState == 4) {
            // 判断对象的状态是否交互完成
            callback(opt, xhr); // 回调
          }
        };
      }
      // 若是GET请求，则将数据加到url后面
      opt.url += opt.url.indexOf('?') == -1 ? '?' + opt.data : '&' + opt.data;
      // 在使用XHR对象时，必须先调用open()方法，
      // 它接受三个参数：请求类型(get、post)、请求的URL和表示是否异步。
      xhr.open(opt.type, opt.url, opt.async);
      xhr.send(null); // get方式则填null
      if (opt.async === false) {
        // 同步
        callback(opt, xhr); // 回调
      }
    }
  };

  /** ----- RongRTCMap ----- */
  var RongRTCMap = function RongRTCMap() {
    this._entrys = new Array();

    this.put = function (key, value) {
      if (key == null || key == undefined) {
        return;
      }
      var index = this._getIndex(key);
      if (index == -1) {
        var entry = new Object();
        entry.key = key;
        entry.value = value;
        this._entrys[this._entrys.length] = entry;
      } else {
        this._entrys[index].value = value;
      }
    };
    this.get = function (key) {
      var index = this._getIndex(key);
      return index != -1 ? this._entrys[index].value : null;
    };
    this.remove = function (key) {
      var index = this._getIndex(key);
      if (index != -1) {
        this._entrys.splice(index, 1);
      }
    };
    this.clear = function () {
      this._entrys.length = 0;
    };
    this.contains = function (key) {
      var index = this._getIndex(key);
      return index != -1 ? true : false;
    };
    this.size = function () {
      return this._entrys.length;
    };
    this.getEntrys = function () {
      return this._entrys;
    };
    this._getIndex = function (key) {
      if (key == null || key == undefined) {
        return -1;
      }
      var _length = this._entrys.length;
      for (var i = 0; i < _length; i++) {
        var entry = this._entrys[i];
        if (entry == null || entry == undefined) {
          continue;
        }
        if (entry.key === key) {
          // equal
          return i;
        }
      }
      return -1;
    };
  };

  var RTC = RongRTCEngine;
  var EventHandler = RongRTCEngineEventHandle;

  /* 
    1、对上层（RongRTC）暴露 API
    2、如果后期 rtc.js 重构或 API 有重大调整，可重写此文件，保证对上层 API 不变
  */
  var Error$1 = ErrorType.Inner;


  var option = {
    url: 'https://rtc.ronghub.com/nav/websocketlist',
    currentUser: ''
  };
  var rtc = null;
  var eventHandler = null;
  var eventEmitter = null;

  var getCurrentUser = function getCurrentUser() {
    return option.currentUser;
  };
  var isCrruentUser = function isCrruentUser(user) {
    return user.id === option.currentUser.id;
  };
  var setEventHandler = function setEventHandler() {
    var eventFactory = {
      // user = > {id: 'userId', type: 1}
      onJoinComplete: function onJoinComplete(data) {
        var user = getCurrentUser();
        var isJoined = data.isJoined;

        var error = isJoined ? null : Error$1.JOIN_ERROR;
        eventEmitter.emit(EventName.ROOM_SELF_JOINED, user, error);
      },
      // user = > {id: 'userId'}
      onLeaveComplete: function onLeaveComplete(data) {
        var user = getCurrentUser();
        var isLeft = data.isLeft;

        if (isLeft) {
          rtc.closeLocalStream();
        }
        var error = isLeft ? null : Error$1.LEAVE_ERROR;
        eventEmitter.emit(EventName.ROOM_SELF_LEFT, user, error);
      },
      onNotifyUserVideoCreated: function onNotifyUserVideoCreated(data) {
        var userId = data.userId,
            type = data.resource;

        var user = {
          id: userId
        };
        var stream = rtc.getRemoteStream(userId, type);
        var result = {
          user: user,
          stream: {
            type: type,
            mediaStream: stream
          }
        };
        eventEmitter.emit(EventName.STREAM_ADDED, result);
      },
      onUserJoined: function onUserJoined(user) {
        var _user = user,
            userId = _user.userId,
            userType = _user.userType;

        user = {
          id: userId,
          type: userType
        };
        eventEmitter.emit(EventName.ROOM_USER_JOINED, user);
      },
      onUserLeft: function onUserLeft(user) {
        var _user2 = user,
            userId = _user2.userId;

        user = {
          id: userId
        };
        eventEmitter.emit(EventName.ROOM_USER_LEFT, user);
      },
      onNotifyResourceUpdated: function onNotifyResourceUpdated(user) {
        var _user3 = user,
            id = _user3.userId,
            type = _user3.resource;

        user = { id: id };
        var stream = rtc.getLocalStream();
        var result = {
          user: user,
          stream: {
            type: type,
            mediaStream: stream
          }
        };
        eventEmitter.emit(EventName.STREAM_CHANGED, result);
      },
      onConnectionStateChanged: function onConnectionStateChanged(network) {
        network = utils.rename(network, {
          connectionState: 'state'
        });
        eventEmitter.emit(EventName.NETWORK, network);
      },
      // 创建白板回调 
      onWhiteBoardURL: function onWhiteBoardURL(data) {
        // TODO: isSuccess 为 false 情况处理，需要修改 rtc.js ，后续处理
        var isSuccess = data.isSuccess,
            url = data.url;

        var error = isSuccess ? null : Error$1.CREATE_WB_ERROR;
        var whiteboard = {
          url: url
        };
        eventEmitter.emit(EventName.WHITEBOARD_CREATED, whiteboard, error);
      },
      // 获取白板
      onWhiteBoardQuery: function onWhiteBoardQuery(data) {
        // TODO: isSuccess 为 false 情况处理，需要修改 rtc.js ，后续处理
        var isSuccess = data.isSuccess,
            url = data.url;

        var error = isSuccess ? null : Error$1.GET_WB_ERROR;
        var whiteboard = {
          list: [{
            url: url
          }]
        };
        eventEmitter.emit(EventName.WHITEBOARD_GETLIST, whiteboard, error);
      },
      // onNetworkSentLost: (network) => {
      // TODO: eventEmitter.emit(EventName.NETWORK, network);
      // },
      onStartScreenShareComplete: function onStartScreenShareComplete(data) {
        var isSuccess = data.isSuccess,
            code = data.code;

        var errors = {
          1: Error$1.SCREEN_SHARE_PLUGIN_SUPPORT_ERROR,
          2: Error$1.SCREEN_SHARE_NOT_INSTALL_ERROR
        };
        var error = isSuccess ? null : errors[code];
        var result = null;
        eventEmitter.emit(EventName.SCREEN_SHARE_START, result, error);
      },
      onStopScreenShareComplete: function onStopScreenShareComplete(result) {
        var reason = result.reason;

        if (reason === 2) {
          return eventEmitter.emit(EventName.SCREEN_SHARE_FINISHED);
        }
        eventEmitter.emit(EventName.SCREEN_SHARE_STOP);
      },
      onNotifyRTCError: function onNotifyRTCError(result) {
        var code = result.code;

        var errors = {
          1: Error$1.TOKEN_USERID_MISMATCH
        };
        var error = errors[code] || result;
        eventEmitter.emit(EventName.RTC_ERROR, error);
      }
    };
    utils.forEach(eventFactory, function (event, name) {
      eventHandler.on(name, event);
    });
  };
  var CacheName = {
    IS_DESTROYED: 'isDestroyed',
    IS_IN_ROOM: 'isInRoom'
  };
  var SessionCache = utils.Cache({
    isDestroyed: false,
    isInRoom: false
  });

  var RTCEngine = function () {
    function RTCEngine(_option) {
      classCallCheck(this, RTCEngine);

      utils.extend(option, _option);
      rtc = new RTC(option.url);
      eventEmitter = new EventEmitter();
      eventHandler = new EventHandler();
      setEventHandler();
      rtc.setRongRTCEngineEventHandle(eventHandler);
    }

    createClass(RTCEngine, [{
      key: 'joinRoom',
      value: function joinRoom(room) {
        return utils.deferred(function (resolve, reject) {
          eventEmitter.once(EventName.ROOM_SELF_JOINED, function (error, user) {
            if (error) {
              return reject(error);
            }
            SessionCache.set(CacheName.IS_IN_ROOM, true);
            resolve(user);
          });
          var user = room.user;
          var userId = user.id,
              token = user.token;

          utils.extend(option, {
            currentUser: {
              id: userId
            }
          });
          var id = room.id;

          rtc.joinChannel(id, userId, token);
        });
      }
    }, {
      key: 'leaveRoom',
      value: function leaveRoom() {
        return utils.deferred(function (resolve, reject) {
          eventEmitter.once(EventName.ROOM_SELF_LEFT, function (error, user) {
            if (error) {
              return reject(error);
            }
            SessionCache.set(CacheName.IS_IN_ROOM, false);
            resolve(user);
          });
          rtc.leaveChannel();
        });
      }
    }, {
      key: 'setProfiles',
      value: function setProfiles(constraints) {
        rtc.setVideoParameters(constraints);
      }
    }, {
      key: 'getStream',
      value: function getStream(user) {
        return utils.deferred(function (resolve) {
          var method = isCrruentUser(user) ? 'getLocalStream' : 'getRemoteStream';
          var id = user.id;
          // 临时做法，不应该关心 type ，应该在 Stream 中返回

          var type = StreamType.AUDIO_AND_VIDEO;
          var mediaStream = rtc[method](type, id);
          resolve({
            user: user,
            stream: {
              type: StreamType.VIDEO,
              mediaStream: mediaStream
            }
          });
        });
      }
    }, {
      key: 'mute',
      value: function mute(user) {
        return utils.deferred(function (resolve) {
          //TODO: 成员静音需要区分 userId
          var method = isCrruentUser(user) ? 'muteMicrophone' : 'closeRemoteAudio';
          var isMute = true;
          rtc[method](isMute);
          resolve();
        });
      }
    }, {
      key: 'unmute',
      value: function unmute(user) {
        return utils.deferred(function (resolve) {
          //TODO: 成员静音需要区分 userId
          var method = isCrruentUser(user) ? 'muteMicrophone' : 'closeRemoteAudio';
          var isMute = false;
          rtc[method](isMute);
          resolve();
        });
      }
    }, {
      key: 'disableVideo',
      value: function disableVideo(user) {
        return utils.deferred(function (resolve) {
          //TODO: 禁用其他成员的视频流，订阅分发可视为修改订阅关系，不订阅指定用户的视频流
          if (isCrruentUser(user)) {
            var isClose = true;
            rtc.closeLocalVideo(isClose);
          }
          resolve();
        });
      }
    }, {
      key: 'enableVideo',
      value: function enableVideo(user) {
        return utils.deferred(function (resolve) {
          //TODO: 禁用其他成员的视频流，订阅分发可视为修改订阅关系，订阅指定用户的视频流
          if (isCrruentUser(user)) {
            var isClose = false;
            rtc.closeLocalVideo(isClose);
          }
          resolve();
        });
      }
    }, {
      key: 'createWhiteBoard',
      value: function createWhiteBoard() {
        return utils.deferred(function (resolve, reject) {
          eventEmitter.once(EventName.WHITEBOARD_CREATED, function (error, whiteboard) {
            if (error) {
              return reject(error);
            }
            resolve(whiteboard);
          });
          rtc.requestWhiteBoardURL();
        });
      }
    }, {
      key: 'getWhiteBoardList',
      value: function getWhiteBoardList() {
        return utils.deferred(function (resolve, reject) {
          eventEmitter.once(EventName.WHITEBOARD_GETLIST, function (error, result) {
            if (error) {
              return reject(error);
            }
            resolve(result);
          });
          rtc.queryWhiteBoard();
        });
      }
    }, {
      key: 'startScreenShare',
      value: function startScreenShare() {
        return utils.deferred(function (resolve, reject) {
          eventEmitter.once(EventName.SCREEN_SHARE_START, function (error) {
            if (error) {
              return reject(error);
            }
            resolve();
          });
          rtc.startScreenShare();
        });
      }
    }, {
      key: 'stopScreenShare',
      value: function stopScreenShare() {
        return utils.deferred(function (resolve, reject) {
          eventEmitter.once(EventName.SCREEN_SHARE_STOP, function (error) {
            if (error) {
              return reject(error);
            }
            resolve();
          });
          rtc.stopScreenShare();
        });
      }
    }, {
      key: 'setDevice',
      value: function setDevice(device) {
        var video = device.input.video;

        return utils.deferred(function (resolve) {
          rtc.switchVideo(video.id);
          resolve();
        });
      }
    }, {
      key: 'checkDevice',
      value: function checkDevice() {
        return rtc.checkDeviceState().then(function (state) {
          return utils.rename(state, {
            audioState: 'audio',
            videoState: 'video'
          });
        });
      }
    }, {
      key: 'getDeviceList',
      value: function getDeviceList() {
        return rtc.getDevicesInfos().then(function (devices) {
          var audioInputs = [],
              videoInputs = [],
              audioOutputs = [];
          var add = function add(inputs, device) {
            var id = device.deviceId,
                label = device.label,
                groupId = device.groupId;

            inputs.push({
              id: id,
              label: label,
              groupId: groupId
            });
          };
          var deviceKinds = {
            videoinput: function videoinput(device) {
              add(videoInputs, device);
            },
            audioinput: function audioinput(device) {
              add(audioInputs, device);
            },
            audiooutput: function audiooutput(device) {
              add(audioOutputs, device);
            }
          };
          devices.forEach(function (device) {
            var kind = device.kind;

            deviceKinds[kind](device);
          });
          return {
            input: {
              audio: audioInputs,
              video: videoInputs
            },
            output: {
              audio: audioOutputs
            }
          };
        });
      }
    }, {
      key: 'exec',
      value: function exec(name) {
        var isDestroyed = SessionCache.get(CacheName.IS_DESTROYED);
        if (isDestroyed) {
          return utils.Defer.reject(Error$1.INSTANCE_IS_DESTROYED);
        }
        var isInRoom = SessionCache.get(CacheName.IS_IN_ROOM);
        var whitelist = ['joinRoom', 'setProfiles'];
        var isInWhitelist = whitelist.indexOf(name) > -1;
        if (!isInRoom && !isInWhitelist) {
          return utils.Defer.reject(Error$1.NOT_JOIN_ROOM);
        }

        for (var _len = arguments.length, data = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          data[_key - 1] = arguments[_key];
        }

        return this[name].apply(this, data);
      }
    }, {
      key: '_on',
      value: function _on(name, event) {
        eventEmitter.on(name, event);
      }
    }, {
      key: '_off',
      value: function _off(name) {
        eventEmitter.off(name);
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        eventEmitter.teardown();
        SessionCache.set(CacheName.IS_DESTROYED, true);
        this.leaveRoom();
      }
    }]);
    return RTCEngine;
  }();

  var RongRTC = function RongRTC(option) {
    classCallCheck(this, RongRTC);

    var that = this;
    var rtc = new RTCEngine(option);
    var eventEmitter = new EventEmitter();
    utils.forEach(ErrorEvents, function (event) {
      var name = event.name,
          type = event.type;

      rtc._on(name, function (error, info) {
        if (error) {
          throw new Error(error);
        }
        var result = {
          type: type,
          info: info
        };
        eventEmitter.emit(type, result);
      });
    });

    var destroy = function destroy() {
      if (that._isDestroyed) {
        return utils.Defer.resolve();
      }
      utils.extend(that, {
        _isDestroyed: true
      });
      utils.forEach(that, function (module) {
        module._teardown && module._teardown();
      });
      rtc.destroy();
      return utils.Defer.resolve();
    };

    var _on = function _on(name, event) {
      return eventEmitter.on(name, function (error, result) {
        if (error) {
          throw new Error(error);
        }
        event(result);
      });
    };

    var _off = function _off(name) {
      return eventEmitter.off(name);
    };

    utils.extend(that, {
      Observer: Observer,
      Room: Room(rtc),
      Stream: Stream(rtc),
      WhiteBoard: WhiteBoard(rtc),
      ScreenShare: ScreenShare(rtc),
      Device: Device(rtc),
      destroy: destroy,
      _isDestroyed: false,
      _on: _on,
      _off: _off
    });
  };


  utils.extend(RongRTC, {
    StreamType: StreamType
  });

  return RongRTC;

})));
