(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.RongScreenShare = factory(global));
})(window, function (win) {
  'use strict';
  var Keys = {
    CHECK: 'rong-check-share-installed',
    CHECK_RESPONSE: 'rong-share-installed',
    GET: 'rong-share-get',
    GET_RESPONSE: 'rong-share-get-response',
    CLEAR_BOX: 'rong-share-clear-box'
  };

  var Reason = {
    PLUGIN_NOT_INSTALLED: 'Plugin not installed'
  };

  var ShareProfile = {
    width: 1280,
    height: 720,
    frameRate: 15
  };

  var checkTimeout = 1500;

  var get;

  var sendToPlugin = function (key) {
    win.postMessage({
      type: key
    });
  };

  var addListener = function (event) {
    win.addEventListener('message', event);
  };

  var removeListenr = function (event) {
    win.removeEventListener('message', event);
  };

  var clearTimeoutAndListenr = function (timeout, listener) {
    listener && removeListenr(listener);
    timeout && clearTimeout(timeout);
  };

  var getScreenMediaConfig = function (sourceId) {
    var screenMediaConfig = {
      video: {
        mandatory: {
          chromeMediaSource: 'screen',
          chromeMediaSourceId: sourceId,
          maxWidth: 1280,
          maxHeight: 720,
          minFrameRate: 15, 
          maxFrameRate: 15
        }
        // optional: [{ googTemporalLayeredScreencast: true }]
      }
    };
    return screenMediaConfig;
  };

  var testSourceId = null;

  var getScreenMedia = function (sourceId) {
    return new Promise(function (resolve, reject) {
      var mediaConfig = getScreenMediaConfig(sourceId);
      console.log(mediaConfig);
      win.navigator.mediaDevices.getUserMedia(mediaConfig).then(function (stream) {
        resolve(stream);
      }, function (err, test) {
        reject(err);
      });
    });
  };
  window.getScreenMedia = getScreenMedia;

  var check = function (callback) {
    return new Promise(function (resolve, reject) {
      var timeout, checkCallback;
      checkCallback = function (data) {
        var data = data.data || {};
        var type = data.type;
        if (type === Keys.CHECK_RESPONSE) {
          callback && callback(null);
          resolve();
          clearTimeoutAndListenr(timeout, checkCallback);
        }
      };
      timeout = setTimeout(function () {
        callback && callback(Reason.PLUGIN_NOT_INSTALLED);
        reject();
        clearTimeoutAndListenr(timeout, checkCallback);
      }, checkTimeout);
      addListener(checkCallback);
      sendToPlugin(Keys.CHECK);
    });
  };

  var getScreenByPlugin = function (callback) {
    return new Promise(function (resolve, reject) {
      var getCallback = function (data) {
        var data = data.data || {};
        var type = data.type;
        if (type === Keys.GET_RESPONSE) {
          var sourceId = data.sourceId;
          getScreenMedia(sourceId).then(function (stream) {
            resolve(stream);
            removeListenr(getCallback);
            callback && callback(null, stream);
          }, function (err) {
            removeListenr(getCallback);
            reject(err);
            callback && callback(err);
          });
        }
      };
      check().then(function () {
        addListener(getCallback);
        sendToPlugin(Keys.GET);
      }, function (err) {
        reject(Reason.PLUGIN_NOT_INSTALLED);
      });
    });
  };

  var getDisplayMedia = function() {
    return win.navigator.mediaDevices.getDisplayMedia();
  }

  var init = function () {
    var bro = win.navigator.userAgent.match( /Chrome\/([\d.]+)/);
    var version = parseInt(bro[1]);
    if(version > 71) {
      get = getDisplayMedia;
    }else {
      get = getScreenByPlugin;
    }
  }

  var clearChooseBox = function () {
    sendToPlugin(Keys.CLEAR_BOX);
  };

  init();

  return {
    check,
    get,
    clearChooseBox
  };
});