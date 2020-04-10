(function (dependencies) {
  var RongSeal = dependencies.RongSeal,
    win = dependencies.win,
    utils = RongSeal.utils,
    common = RongSeal.common,
    sealAlert = common.sealAlert,
    Dom = utils.Dom,
    getDomListByName = Dom.getDomListByName,
    getSelectedByName = Dom.getSelectedByName,
    getDomById = Dom.getById,
    Cache = utils.Cache, _5min = 5 * 60,
    Config = RongSeal.Config,
    LocalCache = utils.LocalCache;
  // var randomUserId;
  var rongIMToken;
  // console.log('randomUserId: ', typeof randomUserId);

  var locale = RongSeal.locale[common.lang],
    localeData = locale.data;

  var roomDom = getDomById('roomId'),
    // userDom = getDomById('userId'),
    startBtnDom = getDomById('start'),
    inputDomList = Dom.getList('.rong-login-input'),
    roomTelNumDom = getDomById('roomTelNum'),
    userNameDom = getDomById('userName');
  var telDom = getDomById('telNumber'),
    verifyCodeDom = getDomById('verifyCode'),
    verifyCodeBtnDom = getDomById('verifyCodeBtn'),
    inputTelVerifyDomList = Dom.getList('.rong-login-verify-input'),
    verifyLoginDom = getDomById('verifyLogin'),
    userLoginIdDom = getDomById('userLoginId');

  var StorageKeys = {
    RoomId: 'rong-sealv2-roomid',
    Resolution: 'rong-sealv2-resolution',
    IMToken: 'rong-im-token',
    UserInfoKey: 'rong-user-info',
    VideoEnable: 'video-enable',
    BystanderEnable: 'bystander-enable',
    UserId: 'rong-user-id',
    TabIdKey: 'rong-tab-id'
  };

  var verifyLoginClickTimes = 0;

  var platform = 'web';
  //生成 tabId 并存储
  var generateTabId = function() {
    var tabId = LocalCache.get(StorageKeys.TabIdKey);
    var randomStr = utils.getRandomStr()
    if(!tabId){
      LocalCache.set(StorageKeys.TabIdKey, randomStr)
    }
  }
  generateTabId();
  // 处理清除缓存未生成 tabId
  var handleNullTabId = function() {
    var randomStr = utils.getRandomStr()
    LocalCache.set(StorageKeys.TabIdKey, randomStr)
    return randomStr;
  }
  var sealToast = new common.SealToast();
  /**
   * 获取手机验证码 
   * @param {object} params 
   * @param {object} params.getSmsCodeUrl 获取 手机验证码 的 url
   * @param {object} params.tel 获取手机号
   * @param {object} params.region 获取
   */
  function getSmsCode(params, callback) {
    callback = callback || utils.noop;
    var url = RongSeal.Config.URL + '/user/send_code';
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
    var url = RongSeal.Config.URL + '/user/verify_code';
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
  function setRadioCancel() {
    var selectID = null;
    var radios = document.querySelectorAll('[name=userOption]')
    for (var el of radios) {
      el.addEventListener('click', function () {
        if (selectID == this.id && selectID) {
          this.checked = '';
          selectID = null;
        } else {
          selectID = this.id;
        }
      })
    }
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
  var verifyPhoneNumber = function (phoneNumber) {
    return new Promise(function (resolve, reject) {
      var telReg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
      if (telReg.test(phoneNumber)) {
        resolve();
      } else {
        reject();
      }
    })
  };
  var sendSmsCode = function () {
    verifyPhoneNumber(telDom.value).then(function () {
      console.log(telDom.value);
      var params = {
        tel: telDom.value,
        region: 86
      }
      getSmsCode(params).then(function (data) {
        if (data.code !== 200) {
          sealAlert(data.message || '服务器错误');
        }
        console.log('data', data)
      }).catch(function (err) {
        console.log('getSMSCodeERR:', err)
      })
      var countDown = 60;
      setCountDownTimer(countDown);
    }).catch(function () {
      sealAlert(localeData.phoneNumberErr);
    })
  }
  var verifyLogin = function () {
    if(verifyLoginClickTimes>0){
      return;
    }
    verifyLoginClickTimes++;
    var tel = telDom.value,
      tabId = LocalCache.get(StorageKeys.TabIdKey) ? LocalCache.get(StorageKeys.TabIdKey) : handleNullTabId(),
      code = verifyCodeDom.value;
    var imTokenKey = utils.tplEngine('{IMTokenKey}_{tel}{tabId}_{platform}', {
      IMTokenKey: StorageKeys.IMToken,
      tel: tel,
      tabId: tabId,
      platform: platform
    });
    var loginUserId = utils.tplEngine('{tel}_{tabId}_{platform}', {
      tel: tel,
      tabId: tabId,
      platform: platform
    });
    verifyPhoneNumber(tel).then(function () {
      console.log(tel, 'tel ss')
      if (tel && code) {
        //发送验证码
        var params = {
          tel: tel, //验证码验证手机号
          region: '86',
          code: code,
          key: loginUserId //获取 token 用 id
        };
        verifySmsCode(params).then(function (data) {
          //验证正确：
          if (data.code === 200) {
            rongIMToken = data.result.token;
            if (rongIMToken) {
              Cache.set(imTokenKey, rongIMToken);
              Cache.remove(StorageKeys.UserId); //移除之前用的 登录 UserId
              startRTC(rongIMToken);
            } else {
              console.log('IM token 为空----');
              //join room 页面
              Dom.showByClass('rong-login-roomjoin')
              Dom.hideByClass('rong-login-telverify')
            }
          } else if (data.code === 1000) {
            verifyLoginClickTimes = 0;
            sealAlert(localeData.verifyCodeIncorrect)
          } else if (data.code === 2000) {
            verifyLoginClickTimes = 0;
            sealAlert(localeData.verifyCodeIncorrect)
          } else {
            verifyLoginClickTimes = 0;
            sealAlert(data.message)
          }
        }).catch(function (err) {
          console.log('veriyCodeErr:', err)
          verifyLoginClickTimes = 0;
        })
      } else {
        sealAlert(localeData.verifyCodeErr)
        verifyLoginClickTimes = 0;
      }
    }).catch(function () {
      console.log(tel, 'tel ff')
      verifyLoginClickTimes = 0;
      sealAlert(localeData.phoneNumberErr);
    })
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
    var roomTel = roomTelNumDom.value,
      tabId = LocalCache.get(StorageKeys.TabIdKey);
    var imTokenKey = utils.tplEngine('{IMTokenKey}_{tel}{tabId}_{platform}', {
      IMTokenKey: StorageKeys.IMToken,
      tel: roomTel,
      tabId: tabId,
      platform: platform
    });
    var IMToken = Cache.get(imTokenKey);
    if (IMToken) {
      return IMToken;
    } else {
      return false;
    }
  }
  var RTCEnterLogic = function () {
    var checkContent = checkRTCValue();
    if (!checkContent.isValid) {
      return sealAlert(checkContent.prompt);
    }
    var userId = roomTelNumDom.value;
    var _cache = Cache.get(userId);
    if (_cache) {
      _cache = JSON.parse(_cache);
      var isKick = (((+new Date()) - parseInt(_cache.kickOffTime)) / 1000 - _5min) < 0;
      if (_cache.roomId === roomDom.value && isKick) {
        sealAlert(localeData.sealRtcKickOﬀ);
        return;
      }
    }
    if (!isChromeOrSafari()) {
      return sealAlert(localeData.supportedBrowsers);
    }
    var imToken = hasIMToken();
    if (imToken) {
      startRTC(imToken);
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
  var isChromeOrSafari = function () {
    var browser = utils.getBrowser();
    var name = browser.type;
    if (name == 'Chrome' || name == 'Safari') {
      return true;
    } else {
      return false;
    }
  }
  var checkRTCValue = function () {
    var isRoomIdEmpty = !roomDom.value;
    var userNameVal = utils.trim(userNameDom.value);
    var isUserNameEmpty = !userNameVal;
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
    if (isUserNameEmpty) {
      prompt = localeData.userNameEmpty;
      isValid = false;
    }
    if (userNameVal.indexOf(' ') !== -1) {
      prompt = localeData.userNameIllegal;
      isValid = false;
    }
    // if(!utils.isNumberAndLetter(userNameVal)) {
    //   prompt = localeData.userNameEnglishOnly;
    //   isValid = false;
    // }
    return {
      isValid: isValid,
      prompt: prompt
    };
  };
  function GetRadioValue(radioName) {
    var radios = document.getElementsByName(radioName);
    for (var i = 0; i < radios.length; i++) {
      var radio = radios.item(i);
      if (radio.checked) {
        return radio.value;
      }
    }
  }
  var getRTCOption = function () {
    var resolutionDom = getSelectedByName('resolution');
    // closeVideoDom = getSelectedByName('isCloseVideo'),
    // bystanderDom = getSelectedByName('isBystander');
    // closeAudioDom = getSelectedByName('isCloseAudio');
    var modeOption = GetRadioValue('userOption');
    var videoEnable, bystanderEnable;

    var frameRate = getDomById('frameRate').value;
    var bitrate = getDomById('bitrate').value;
    var bitrateMIN = getDomById('bitrateMIN').value;
    var bitrateMAX = getDomById('bitrateMAX').value;
    var bitrateObj = {
      max: parseInt(bitrateMAX) || 1000,
      min: parseInt(bitrateMIN) || 100,
      start: parseInt(bitrate) || 300
    }
    var url = getDomById('url').value || Config.MEDIA_SERVER;
    if (modeOption) {
      if (modeOption == 'closeVideo') {
        videoEnable = false;
        bystanderEnable = false;
      }
      if (modeOption == 'bystander') {
        videoEnable = true;
        bystanderEnable = true;
      }
    } else {
      videoEnable = true;
      bystanderEnable = false;
    }
    var roomId = roomDom.value,
      userId = roomTelNumDom.value,
      // userId = randomUserId,
      resolution = common.formatResolution(resolutionDom.value);// 格式如: { width: 640, height: 320 }
    // console.log(resolutionDom);
    // audioEnable = !closeAudioDom;
    var option ={
      userId: userId,
      roomId: roomId,
      resolution: resolution,
      videoEnable: videoEnable,
      audioEnable: true,
      bystanderEnable: bystanderEnable,
      bitrate: bitrateObj
    };
    if(frameRate){
      option.frameRate = parseInt(frameRate);
    }
    if(url){
      option.url = url;
    }
    return option
  };
  //用户信息缓存
  function setUserInfoObj(params) {
    var currentTimestamp = new Date().getTime();
    var userId = utils.tplEngine('{tel}_{userName}_{platform}', {
      tel: roomTelNumDom.value,
      userName: LocalCache.get(StorageKeys.TabIdKey),
      platform: platform
    });
    var userInfo = {
      userId: userId,
      userName: userNameDom.value,
      joinMode: params.joinMode,
      joinTime: currentTimestamp,
      master: params.master
    };
    var forKey = roomTelNumDom.value;
    var message = {
      name: 'SealRTC:SetRoomInfo',
      content: {
        infoKey: roomTelNumDom.value,
        infoValue: userInfo
      }
    };
    return {
      userInfo: userInfo,
      forKey: forKey,
      message: message
    }
  }

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
      }, {
        rate: [5000, 2000]
      })
    };
    reconnect();
  }

  var connect = function (user) {
    user.navi = Config.NAVI;
    user.appKey = Config.APPKEY;
    var goVerifyPage = function () {
      common.UI.backLoginPage();
      telDom.value = roomTelNumDom.value;
      setVerifyCodeBtnEnable();
      //回到手机验证页面
      Dom.hideByClass('rong-login-roomjoin')
      Dom.showByClass('rong-login-telverify')
    };
    var token = user.token;
    if (!token) {
      return goVerifyPage();
    }
    RongSeal.im.connect(user, {
      connected: function (IMUserId) {
        userLoginIdDom.value = IMUserId;
        var option = getRTCOption();
        console.log(option);
        var resolution = option.resolution;
        option.userId = IMUserId;
        option.token = user.token;
        console.log('user', user);
        RongSeal.startRTC(option);
        Cache.set(StorageKeys.RoomId, option.roomId);
        // Cache.set(StorageKeys.VideoEnable, option.videoEnable);
        // Cache.set(StorageKeys.BystanderEnable, option.bystanderEnable);
        Cache.set(StorageKeys.Resolution, common.reFormatResolution(resolution));
        Dom.showByClass('rong-login-roomjoin')
        Dom.hideByClass('rong-login-telverify')
        verifyLoginClickTimes = 0;
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
            // common.UI.backLoginPage();
            // clear();
            sealToast.destroy();
            // RongSeal.im.disconnect();
            win.location.reload();
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
    // var userId = roomTelNumDom.value;
    var userId = utils.tplEngine('{tel}_{userName}_{platform}', {
      tel: roomTelNumDom.value,
      userName: LocalCache.get(StorageKeys.TabIdKey),
      platform: platform
    });
    connect({
      userId: userId,
      token: imToken
    })
    RongSeal.userInfo = {
      userName: userNameDom.value,
      userId: userId
    }
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
  var pressVerifyLogin = function (e) {
    if ((e.keyCode || e.which) == 13) {
      verifyLogin();
    }
  };

  (function init() {
    setRadioCancel();
    setDefaultRTCInfo();
    checkRoomTelValue();
    bindCodeFn();
    // pressVerifyLogin();
    roomTelNumDom.onkeyup = checkRoomTelValue;
    // startBtnDom.onclick = startRTC;
    utils.forEach(inputDomList, function (dom) {
      dom.onkeydown = pressInput;
    });
    utils.forEach(inputTelVerifyDomList, function (dom) {
      dom.onkeydown = pressVerifyLogin;
    });
    common.setLocale();
  })();
  RongSeal.setUserInfoObj = setUserInfoObj;
  RongSeal.StorageKeys = StorageKeys;

})({
  win: window,
  RongSeal: window.RongSeal,
  globalConfig: window.RongSeal.Config
});