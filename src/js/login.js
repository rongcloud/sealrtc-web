(function (dependencies) {
  var RongSeal = dependencies.RongSeal,
    utils = RongSeal.utils,
    common = RongSeal.common,
    sealAlert = common.sealAlert,
    Dom = utils.Dom,
    getDomListByName = Dom.getDomListByName,
    getSelectedByName = Dom.getSelectedByName,
    getDomById = Dom.getById,
    Cache = utils.Cache,
    Config = RongSeal.Config;

  // var randomUserId;
  var userId, rongIMToken;
  // console.log('randomUserId: ', typeof randomUserId);

  var locale = RongSeal.locale[common.lang],
    localeData = locale.data;

  var roomDom = getDomById('roomId'),
    // userDom = getDomById('userId'),
    startBtnDom = getDomById('start'),
    inputDomList = Dom.getList('.rong-login-input'),
    roomTelNumDom = getDomById('roomTelNum');
  var telDom = getDomById('telNumber'),
    verifyCodeDom = getDomById('verifyCode'),
    verifyCodeBtnDom = getDomById('verifyCodeBtn'),
    verifyLoginDom = getDomById('verifyLogin');

  var StorageKeys = {
    RoomId: 'rong-sealv2-roomid',
    Resolution: 'rong-sealv2-resolution',
    IMToken: 'rong-im-token'
  };
  /**
   * 获取手机验证码 
   * @param {object} params 
   * @param {object} params.getSmsCodeUrl 获取 手机验证码 的 url
   * @param {object} params.tel 获取手机号
   * @param {object} params.region 获取
   */
  function getSmsCode(params, callback) {
    callback = callback || utils.noop;
    var url = RongSeal.Config.GET_SMS_CODE_URL;
    return new Promise(function (resolve, reject) {
      utils.ajax({
        url: url,
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          phone: params.tel,
          region: params.region
        }),
        success: function (result) {
          result = JSON.parse(result);
          callback(null, result);
          resolve(result);
        },
        fail: function (error) {
          callback(error);
          reject(error);
        }
      });
    });
  }
  /**
   * 验证手机验证码 
   * @param {object} params 
   * @param {object} params.tokenUrl 验证手机验证码er的 url
   * @param {object} params.tel 手机号
   * @param {object} params.region 国际区号
   * @param {object} params.code 手机验证码
   * @param {object} params.key ???
   */
  function verifySmsCode(params, callback) {
    callback = callback || utils.noop;
    var url = RongSeal.Config.VERIFY_SMS_CODE_URL;
    return new Promise(function (resolve, reject) {
      utils.ajax({
        url: url,
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          phone: params.tel,
          region: params.region,
          code: params.code,
          key: params.key
        }),
        success: function (result) {
          result = JSON.parse(result);
          callback(null, result);
          resolve(result);
        },
        fail: function (error) {
          callback(error);
          reject(error);
        }
      });
    });
  }
  function verifyTelNum(telNum) {
    if (telNum.length === 11) {
      return true;
    } else {
      return false;
    }
  }
  var setVerifyCodeBtnEnable = function () {
    verifyCodeBtnDom.style.background = '#28d6f6';
    verifyCodeBtnDom.style.border = '#28d6f6';
    verifyCodeBtnDom.onclick = sendSmsCode;
  }
  var setVErifyCodeBtnDisable = function () {
    verifyCodeBtnDom.style.background = '#475163';
    verifyCodeBtnDom.style.border = '#475163';
    verifyCodeBtnDom.onclick = function () { };
  }
  var setCountDownTimer = function (countDown) {
    if (countDown === 0) {
      verifyCodeBtnDom.value = '发送验证码';
      countDown = 60;
      setVerifyCodeBtnEnable();
      return;
    } else {
      countDown--;
      setVErifyCodeBtnDisable();
    }
    setTimeout(function () {
      verifyCodeBtnDom.value = countDown + 's后重新发送';
      setCountDownTimer(countDown)
    }, 1000)
  }
  var sendSmsCode = function () {
    var telReg = /^[1][3,4,5,7,8][0-9]{9}$/;
    if (telReg.test(telDom.value)) {
      console.log(telDom.value);
      var params = {
        tel: telDom.value,
        region: 86
      }
      getSmsCode(params).then(function (data) {
        console.log('data', data)
      }).catch(function (err) {
        console.log('getSMSCodeERR:', err)
      })
      var countDown = 60;
      setCountDownTimer(countDown);
    } else {
      sealAlert(localeData.phoneNumberErr);
    }

  }
  var verifyLogin = function () {
    var tel = telDom.value,
      code = verifyCodeDom.value;
    var imTokenKey = StorageKeys.IMToken + '_' + tel;
    if (tel && code) {
      //发送验证码
      var params = {
        tel: tel,
        region: '86',
        code: code,
        key: 'lzp'
      };
      verifySmsCode(params).then(function (data) {
        //验证正确：
        // var resData = data;
        if (data.code === 200) {
          rongIMToken = data.result.token;
          if (rongIMToken) {
            Cache.set(imTokenKey, rongIMToken)
          } else {
            console.log('IM token 为空----')
          }
          //join room 页面
          Dom.showByClass('rong-login-roomjoin')
          Dom.hideByClass('rong-login-telverify')
        } else if (data.code === 1000) {
          sealAlert(localeData.verifyCodeIncorrect)
        } else if (data.code === 2000) {
          sealAlert(localeData.verifyCodeExpired)
        }
      }).catch(function (err) {
        console.log('veriyCodeErr:', err)
      })

    } else {
      sealAlert(localeData.verifyCodeErr)
    }

  }
  var bindCodeFn = function () {
    verifyLoginDom.onclick = verifyLogin;
    telDom.onkeyup = function () {
      var telLength = telDom.value.length;
      if (telLength === 11) {
        //可点击
        setVerifyCodeBtnEnable()
      } else {
        //不可点击
        setVErifyCodeBtnDisable();
      }
    }
  }
  var hasIMToken = function () {
    var roomTel = roomTelNumDom.value;
    var imTokenKey = StorageKeys.IMToken + '_' + roomTel;
    console.log(roomTel)
    var IMToken = Cache.get(imTokenKey);
    if (IMToken) {
      return IMToken;
    } else {
      return false;
    }
  }
  var RTCEnterLogic = function () {
    var imToken = hasIMToken();
    if (imToken) {
      startRTC(imToken);
      // join room page
      // Dom.showByClass('rong-login-roomjoin')
      // Dom.hideByClass('rong-login-telverify')
    } else {
      // verify tel page
      var tips = localeData.verifyCodeTips;
      sealAlert(tips, {
        confirmCallback: function () {
          telDom.value = roomTelNumDom.value;
          setVerifyCodeBtnEnable();
          Dom.hideByClass('rong-login-roomjoin')
          Dom.showByClass('rong-login-telverify')
        }
      })
    }
  }
  var setDefaultRTCInfo = function () {
    var roomId = Cache.get(StorageKeys.RoomId);
    if (roomId) {
      roomDom.value = roomId;
    }
    var resolution = Cache.get(StorageKeys.Resolution);
    if (resolution) {
      var list = getDomListByName('resolution');
      for (var i = 0; i < list.length; i++) {
        if (list[i].value === resolution) {
          list[i].checked = true;
        }
      }
    }
  };

  var checkRTCValue = function () {
    var isRoomIdEmpty = !roomDom.value;
    var isValid = true;
    var prompt = '';
    if (isRoomIdEmpty) {
      prompt = localeData.roomIdEmpty;
      isValid = false;
    }
    if (!utils.isNumberAndLetter(roomDom.value)) {
      prompt = localeData.roomIdIllegal;
      isValid = false;
    }
    return {
      isValid: isValid,
      prompt: prompt
    };
  };

  var getRTCOption = function () {
    var resolutionDom = getSelectedByName('resolution'),
      closeVideoDom = getSelectedByName('isCloseVideo');
    // closeAudioDom = getSelectedByName('isCloseAudio');
    var roomId = roomDom.value,
      userId = roomTelNumDom.value,
      // userId = randomUserId,
      resolution = common.formatResolution(resolutionDom.value), // 格式如: { width: 640, height: 320 }
      videoEnable = !closeVideoDom;
    // console.log(resolutionDom);
    // audioEnable = !closeAudioDom;
    return {
      userId: userId,
      roomId: roomId,
      resolution: resolution,
      videoEnable: videoEnable,
      audioEnable: true
    };
  };

  var clear = function () {
    common.UI.backLoginPage();
    RongSeal.videoTimer.stop();
    RongSeal.userStreams.clearUsers();
    RongSeal.destroyRongRTCPage();
  };
  var isRTCError = false;
  var EventName = RongSeal.EventName;
  RongSeal.eventEmitter.on(EventName.NETWORK_ERROR, function () {
    console.log('isRTCError', isRTCError)
    isRTCError = true;
    clear();
  });

  var reconnectionMechanism = function () {

    //30s前网络嗅探并重新连接
    var total = 30, count = 0;

    var reconnect = function () {
      RongSeal.im.reconnect({
        success: function () {
          var isRTCShow = getDomById('RongRTC').style.display === 'block' ? true : false;
          if (!isRTCShow) {
            getDomById('RongRTC').style.display = 'block';
          }
        },
        error: function () {
          count++;
          console.log('count: ', count);
          if (count >= total || isRTCError) {
            console.log('back login');
            clear();
            return;
          }
          reconnect();
        }
      })
    };
    reconnect();
  }

  var connect = function (user) {
    user.navi = Config.NAVI;
    user.appKey = Config.APP_ID;
    var goVerifyPage = function () {
      common.UI.backLoginPage();
      telDom.value = roomTelNumDom.value;
      setVerifyCodeBtnEnable();
      //回到手机验证页面
      Dom.hideByClass('rong-login-roomjoin')
      Dom.showByClass('rong-login-telverify')
    };
    var token = user.token;
    if(!token){
      return goVerifyPage();
    }
    RongSeal.im.connect(user, {
      connected: function (/* userId */) {
        var option = getRTCOption();
        console.log(option);
        var resolution = option.resolution;
        option.userId = user.userId;
        option.token = user.token;
        console.log('user', user);
        RongSeal.startRTC(option);
        Cache.set(StorageKeys.RoomId, option.roomId);
        Cache.set(StorageKeys.Resolution, common.reFormatResolution(resolution))
      },
      backLoginPage: function () {
        reconnectionMechanism();
      },
      tokenIncorrect: function () {
        console.log('token expired')
        var tips = localeData.tokenExpired;
        sealAlert(tips, {
          confirmCallback: goVerifyPage
        })
      },
      kickedByOther: function () {
        var tips = localeData.kickedByOtherTips;
        sealAlert(tips, {
          confirmCallback: function () {
            common.UI.backLoginPage();
          }
        })
      }
    });
  };

  var startRTC = function (imToken) {
    var checkContent = checkRTCValue();
    if (!checkContent.isValid) {
      return sealAlert(checkContent.prompt);
    }
    Dom.hideByClass('rong-btn-start');
    Dom.showByClass('rong-btn-loading');
    userId = roomTelNumDom.value;
    connect({
      userId: userId,
      token: imToken
    })
    // randomUserId = new Date().getTime().toString();
    // common.getIMToken({
    //   // id: randomUserId
    //   id: userId
    // }).then(function (user) {
    //   connect(user);
    // }, function (error) {
    //   console.log(error)
    //   sealAlert(localeData.networkError);
    //   Dom.hideByClass('rong-btn-loading');
    //   Dom.showByClass('rong-btn-start');
    //   RongSeal.im.instance().logout();
    // });
  };

  var checkRoomTelValue = function () {
    // var roomId = roomDom.value;
    var telNum = roomTelNumDom.value;
    if (verifyTelNum(telNum)) {
      startBtnDom.style.background = '#28d6f6';
      startBtnDom.style.border = '#28d6f6';
      startBtnDom.onclick = RTCEnterLogic;
    } else {
      startBtnDom.style.background = '#475163';
      startBtnDom.style.border = '#475163';
      startBtnDom.onclick = function () { };
      return;
    }
  }

  var pressInput = function (e) {
    var token = hasIMToken();
    if ((e.keyCode || e.which) == 13) {
      startRTC(token);
    }
  };

  (function init() {
    setDefaultRTCInfo();
    checkRoomTelValue();
    bindCodeFn();
    roomTelNumDom.onkeyup = checkRoomTelValue;
    // startBtnDom.onclick = startRTC;
    utils.forEach(inputDomList, function (dom) {
      dom.onkeydown = pressInput;
    });
    common.setLocale();
  })();
})({
  win: window,
  RongSeal: window.RongSeal,
  globalConfig: window.RongSeal.Config
});