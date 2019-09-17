(function (RongSeal, dependencies) {
  var RongIMLib = dependencies.RongIMLib,
    RongIMClient = RongIMLib.RongIMClient,
    RongSealLib = dependencies.RongSealLib,
    RongRTC = dependencies.RongRTC,
    utils = RongSeal.utils,
    setting = RongSeal.setting,
    url = setting.server,
    Defer = RongSeal.Defer;

  var win = dependencies.win;

  function reconnect() {
    var callback = {
      onSuccess: function (userId) {},
      onTokenIncorrect: function () {
        alert('重连 Token 无效')
      },
      onError: function (errorCode) {
        if (errorCode == -1 || errorCode == 3) {
          reconnect();
        } else {
          alert('重连失败');
        }
      }
    };
    var config = {
      auto: true,
      url: 'cdn.ronghub.com/RongIMLib-2.2.6.min.js?d=' + Date.now(),
      rate: [100, 1000, 1000, 2000, 2000, 2000]
    };
    RongIMClient.reconnect(callback, config);
  }

  var initIM = function (token) {
    var console = win.console;

    var appKey = setting.appkey,
      navi = setting.navi;
    
    if (navi) {
      // 私有云初始化
      RongIMClient.init(appKey, null, {
        navi: navi, // 私有云 navi 地址
        protobuf: './lib/protobuf-2.3.6.min.js'
      });
    } else {
      RongIMClient.init(appKey, null, {
        protobuf: './lib/protobuf-2.3.6.min.js'
        // isPolling: true
      });
    }

    // 设置状态监听器
    RongIMClient.setConnectionStatusListener({
      onChanged: function (status) {
        utils.Logger.log('status changed', status);
        switch(status) {
          case RongIMLib.ConnectionStatus.NETWORK_UNAVAILABLE:
            reconnect();
            break;
        }
        // 此处若监听到网络错误, 需调用 disconnect 做重连处理
      }
    });

    // 设置消息监听器
    RongIMClient.setOnReceiveMessageListener({
      onReceived: function (message) {
        utils.Logger.log('received message', message, 'is offLineMessage :', message.offLineMessage);
      }
    });

    return new Defer(function (resolve, reject) {
      // 连接融云服务器
      RongIMClient.connect(token, {
        onSuccess: function (userId) {
          resolve(userId);
        },
        onTokenIncorrect: function () {
          reject();
        },
        onError: function (errorCode) {
          reject(errorCode);
        }
      }, '');
    });
  };

  function logoutIM() {
    RongIMClient.getInstance().clearCache();
    RongIMClient.getInstance().logout();
  }

  function setAuth(userId) {
    RongSeal.instance.auth = userId;
  }

  function clearAuth() {
    RongSeal.instance.auth = null;
  }

  /**
 * 获取手机验证码
 * @param {object} params
 * @param {object} params.phone 获取手机号
 * @param {object} params.region 获取
 */
  function sendSMSCode(params) {
    return new RongSeal.Defer(function (resolve, reject) {
      utils.ajax({
        url: url + '/user/send_code',
        method: 'POST',
        body: utils.toJSON({
          phone: params.phone,
          region: params.region
        }),
        success: resolve,
        fail: reject
      });
    });
  }

  function verifySMSCode(params) {
    return new RongSeal.Defer(function (resolve, reject) {
      utils.ajax({
        url: url + '/user/verify_code',
        method: 'POST',
        body: utils.toJSON({
          phone: params.phone,
          region: params.region,
          code: params.code,
          key: params.phone
        }),
        success: resolve,
        fail: reject
      });
    });
  }

  RongSeal = RongSeal || {};
  RongSeal.service = {
    initIM: initIM,
    logoutIM: logoutIM,
    sendSMSCode: sendSMSCode,
    verifySMSCode: verifySMSCode,
    setAuth: setAuth,
    clearAuth: clearAuth
  };
  
})(window.RongSeal, {
  win: window,
  RongIMLib: window.RongIMLib,
  RongRTC: window.RongRTC
});