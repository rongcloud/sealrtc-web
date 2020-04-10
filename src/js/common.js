(function (dependencies) {
  var win = dependencies.win,
    RongSeal = dependencies.RongSeal,
    utils = RongSeal.utils,
    Dom = utils.Dom,
    addClass = Dom.addClass,
    removeClass = Dom.removeClass;
  var eventEmitter = new utils.EventEmitter();
  var EventName = {
    NETWORK_ERROR: 'network_error'
  };
  var RongRTCPageTemp = Dom.getById('RongRTC').innerText; //RTC主页面
  var StreamListTemp = Dom.getById('RongStreamList').innerText; // 音视频列表展示模板
  var StreamBoxTemp = Dom.getById('RongStreamBox').innerText; // 单个音视频流展示模板
  var AlertTemp = Dom.getById('RongAlert').innerText; // 提示弹框展示模板
  var TipsTemp = Dom.getById('RongTips').innerText; // 提示弹框展示模板

  var OptClassName = {
    isSelf: 'rong-is-self',
    IS_ZOOM: 'rong-is-zoom',
    CLOSE_VIDEO_BY_SELF: 'rong-video-self-close',
    CLOSE_AUDIO_BY_SELF: 'rong-audio-self-close',
    CLOSE_VIDEO_BY_OTHER: 'rong-video-other-close',
    OPEN_SCREENSHARE: 'rong-screenshare-open',
    FLIP_SCREENSHARE: '.rong-is-screenshare',
  };

  /**
   * 设置多语言
   * @param {object} params 
   * @param {string} params.dom 只设置该节点下多语言
   * @param {string} params.selector 只设置该选择器下多语言, 若已设置 dom, 则在 dom 基础上再选择 selector 生效
   */
  function setLocale(params) {
    params = params || {};
    var lang = win.document.body.lang,
      locale = RongSeal.locale[lang], // locale 数据值
      prefix = 'lang';

    if (!locale) {
      return;
    }
    var selector = params.selector || '',
      dom = params.dom || win.document;

    for (var langKey in locale) {
      var lowerLangKey = langKey.toLocaleLowerCase(),
        attributeTpl = '{prefix}-{key}',
        selectorTpl = '{selector} *[{attribute}]';
      var attribute = utils.tplEngine(attributeTpl, {
        prefix: prefix,
        key: lowerLangKey
      });
      var langSelector = utils.tplEngine(selectorTpl, {
        attribute: attribute,
        selector: selector
      });
      var langDomList = dom.querySelectorAll(langSelector);
      for (var i = 0; i < langDomList.length; i++) {
        var langDom = langDomList[i];
        var localeKey = langDom.getAttribute(attribute);
        langDom[langKey] = locale[langKey][localeKey];
      }
    }
    return dom;
  }

  /**
   * 获取 rtc token
   * @param {object} params 
   * @param {object} params.tokenUrl 获取 rtc token 的 url
   * @param {object} params.userId 用户 id
   * @param {object} params.appId
   */
  function getRTCToken(params, callback) {
    callback = callback || utils.noop;
    return new Promise(function (resolve, reject) {
      utils.sendForm({
        url: params.tokenUrl,
        method: 'POST',
        body: {
          uid: params.userId,
          appid: params.appId
        },
        success: function (token) {
          callback(token);
          resolve(token);
        },
        fail: function (error) {
          callback(null, error);
          reject(error);
        }
      });
    });
  }

  /**
   * 获取 IM token
   * @param {String} params.id  用户 id
   */
  function getIMToken(params, callback) {
    callback = callback || utils.noop;
    var url = RongSeal.Config.TOKEN_URL;
    return new Promise(function (resolve, reject) {
      utils.ajax({
        url: url,
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          id: params.id
        }),
        success: function (result) {
          result = JSON.parse(result);
          callback(null, result.result);
          resolve(result.result);
        },
        fail: function (error) {
          callback(error);
          reject(error);
        }
      });
    });
  }

  /**
   * 格式化分辨率
   * @param {string} rate 分辨率
   * @return {object} 包含 width、height
   */
  var formatResolution = function (rate) {
    var index = rate.indexOf('*');
    var width = rate.substring(0, index);
    var height = rate.substring(index + 1);
    return {
      width: Number(width),
      height: Number(height)
    };
  };

  /**
   * 重置分辨率
   * @param {object} rate 包含 width、height
   * @return {string} 分辨率
   */
  var reFormatResolution = function (rate) {
    return rate.width + '*' + rate.height;
  };

  /**
   * 根据模板创建 dom
   * @param {string} temp 模板
   */
  function createLocaleDom(temp) {
    var dom = Dom.create(temp);
    return setLocale({ dom: dom });
  }

  /**
   * 提示弹框
   * @param {string} str 提示信息
   * @param {object} params.isShowCancel 是否展示取消按钮
   * @param {object} params.confirmText 确定按钮文字, 默认为 '确定'
   * @param {object} params.confirmCallback 点击确定的回调
   * @param {object} params.cancelCallback 点击取消的回调
   */
  function sealAlert(str, params) {
    params = params || {};
    var cancelDisplay = params.isShowCancel ? 'inline-block' : 'none';
    var innerHTML = utils.tplEngine(AlertTemp, {
      content: str,
      cancelDisplay: cancelDisplay
    });
    var alertBox = createLocaleDom(innerHTML);
    var cancelBtnDom = alertBox.querySelector('.rong-alert-cancel');
    var confirmBtnDom = alertBox.querySelector('.rong-alert-confirm');
    if (params.confirmText) {
      confirmBtnDom.value = params.confirmText;
    }
    win.document.body.appendChild(alertBox);
    cancelBtnDom = cancelBtnDom || {};
    confirmBtnDom = confirmBtnDom || {};
    cancelBtnDom.onclick = function () {
      params.cancelCallback && params.cancelCallback();
      win.document.body.removeChild(alertBox);
    };
    confirmBtnDom.onclick = function () {
      params.confirmCallback && params.confirmCallback();
      win.document.body.removeChild(alertBox);
    };
  }
  var sealTipsList = [];
  /**
  * 提示弹框
  * @param {string} str 提示信息
  * @param {object} duration 消息停留时间
  */
  function sealTips(str, duration) {
    sealTipsList.push([str, duration]);
    if (sealTipsList.length > 1) {
      return;
    }
    var innerHTML = utils.tplEngine(TipsTemp, {
      content: str
    });
    var alertBox = createLocaleDom(innerHTML);
    win.document.body.appendChild(alertBox);
    setTimeout(function () {
      sealTipsList.shift();
      win.document.body.removeChild(alertBox);
      if (sealTipsList.length > 0) {
        var _item = sealTipsList.shift();
        sealTips(_item[0], _item[1]);
      }
    }, duration)
  }
  /** *
   * toast 提示
   * @param {string} str 提示信息
   * @param {number} duration 展示时间
  */
  var SealToast = function () { };
  SealToast.prototype = {
    create: function (str, duration) {
      var self = this;
      var toastHtml = '';
      var toastText = '<span class="rong-seal-toast-text">' + str + '</span>';
      toastHtml = '<div class="rong-seal-toast">' + toastText + '</div>';
      if (Dom.get('.rong-sel-toast')) return; //未hide禁止重复点击
      document.body.insertAdjacentHTML('beforeend', toastHtml);
      if (duration) {
        setTimeout(function () {
          self.hide();
        }, duration)
      }
    },
    show: function () {
      // var self = this;
      Dom.showByClass('rong-seal-toast');
      Dom.get('.rong-seal-toast').style.marginTop = '-' + Math.round(Dom.get('.rong-seal-toast').offsetHeight / 2) + 'px';
      if (Dom.get('.rong-seal-toast')) return;
    },
    hide: function () {
      // var self = this;
      if (Dom.get('.rong-seal-toast')) {
        Dom.hideByClass('rong-seal-toast');
      }
    },
    destroy: function () {
      var parentDom = Dom.get('body');
      var childDom = Dom.getByClass('rong-seal-toast');
      if (childDom) {
        parentDom.removeChild(childDom);
      }
    },
    toast: function (str, duration) {
      var self = this;
      return self.create(str, duration);
    }
  }
  /** *
   *  通话计时器
  */
  var SealTimer = (function () {
    var hour = 0,
      minute = 0,
      second = 0;
    var countDown, timerDom;

    function stop() {
      clearInterval(countDown);
      hour = minute = second = 0;
      timerDom = Dom.get('.rong-user-timer');
      timerDom.innerHTML = '';
    }

    function format(count) {
      if (count < 10) {
        return '0' + count;
      }
      return count;
    }

    function timer() {
      second += 1;
      if (second >= 60) {
        second = 0;
        minute += 1;
      }
      if (minute >= 60) {
        minute = 0;
        hour += 1;
      }
      timerDom = Dom.get('.rong-user-timer');
      if (minute < 60 && hour <= 0) {
        timerDom.innerHTML = '通话时长：' + format(minute) + ':' + format(second);
      } else {
        timerDom.innerHTML = '通话时长：' + format(hour) + ':' + format(minute) + ':' + format(second);
      }

    }

    function start() {
      countDown = setInterval(timer, 1000);
    }

    return function () {
      var self = this;
      self.stop = stop;
      self.start = start;
    }
  })();

  /**
   * 音视频页面
   * @param {string} temp 模板(可选)
   */
  var RongRTCPage = (function () {

    function createPage(bodyDom, callback) {
      bodyDom.appendChild(this.dom);
      callback();
    }

    function destroyPage(bodyDom) {
      bodyDom.removeChild(this.dom)
    }

    return function (temp) {
      temp = temp || RongRTCPageTemp;
      var self = this;
      self.dom = createLocaleDom(temp);

      self.createPage = createPage;
      self.destroyPage = destroyPage;
    }
  })();

  /**
   * 音视频列表
   * @param {string} temp 模板(可选)
   */
  var StreamList = (function () {

    function hasBox(streamBox) {
      var self = this;
      var hasStreamBox = false;
      var boxList = self.dom.children;
      for (var i = 0; i < boxList.length; i++) {
        if (boxList[i] === streamBox.dom) {
          hasStreamBox = true;
        }
      }
      return hasStreamBox;
    }

    function addBox(streamBox) {
      var self = this;
      if (!self.hasBox(streamBox)) {
        self.streamBoxList.push(streamBox);
        self.dom.appendChild(streamBox.dom);
      }
    }

    function insertBox(streamBox, targetEl) {
      var self = this;
      if (!self.hasBox(streamBox)) {
        self.streamBoxList.push(streamBox);
        Dom.insertAfter(streamBox.dom, targetEl.dom);
      }
    }

    function removeBox(streamBox) {
      var self = this;
      if (self.hasBox(streamBox)) {
        var index = self.streamBoxList.indexOf(streamBox);
        self.streamBoxList.splice(index, 1);
        self.dom.removeChild(streamBox.dom);
      }
    }

    function clear() {
      var self = this;
      var streamList = self.streamBoxList;
      // streamList.forEach(function (streamBox) {
      //   console.log('streamBox:',streamBox)
      //   self.removeBox(streamBox);
      // })
      for (var i = 0; i < streamList.length; i++) {
        self.removeBox(streamList[i]);
      }
    }

    return function (temp) {
      temp = temp || StreamListTemp;
      var self = this;
      self.streamBoxList = [];
      self.dom = createLocaleDom(temp);

      self.addBox = addBox;
      self.insertBox = insertBox;
      self.removeBox = removeBox;
      self.hasBox = hasBox;
      self.clearBox = clear;

      return self;
    };
  })();

  /**
   * 单个音视频展示框
   * @param {string} id 用户 id
   * @param {object} params 其他选项(可扩展)
   * @param {boolean} params.isZoom 是否放大
   * @param {boolean} params.resizeEvent 是否放大
   * @param {string} temp 模板, 可选
   */
  /* TODO 去掉该变量的使用, 应使用 streamList 实例进行 box 操作 */
  var StreamBoxList = {}; // streamBox 集合
  var StreamBox = (function () {
    var setClass = function (dom, className, isOpen) {
      isOpen ? addClass(dom, className) : removeClass(dom, className);
    };

    // 清空所有 zoom class
    function clearStreamBoxZoom(userId) {
      var reset = function (id) {
        var streamBox = StreamBoxList[id];
        streamBox.resizeEvent(false, id);
        streamBox.isZoom = false;
        removeClass(streamBox.dom, OptClassName.IS_ZOOM);
      };
      if (userId) {
        return reset(userId);
      }
      for (var id in StreamBoxList) {
        reset(id);
      }
    }

    // 展示流
    function showStream(stream) {
      var id = this.id;
      var videoDom = this.childDom.video;
      var customizeValue = utils.tplEngine('{prefix}-{id}', {
        prefix: 'Rong',
        id: id
      });
      if (videoDom && stream) {
        videoDom.srcObject = stream;
        videoDom.setAttribute('stream', customizeValue);
      }
    }

    function zoom(user) {
      var self = this;
      user = user || {};
      if (self.isZoom) {
        // do nothing
      } else {
        clearStreamBoxZoom(user.id);
        self.isZoom = true;
        addClass(this.dom, OptClassName.IS_ZOOM)
      }
    }
    function showSoundGif() {
      var soundDom = this.dom.childNodes[3].childNodes[1].childNodes[0];
      addClass(soundDom, 'rong-sound-show')
    }
    function hideSoundGif() {
      var soundDom = this.dom.childNodes[3].childNodes[1].childNodes[0];
      removeClass(soundDom, 'rong-sound-show')
    }
    function closeVideoBySelf() {
      setClass(this.dom, OptClassName.CLOSE_VIDEO_BY_SELF, true);
      this.isVideoOpenedBySelf = false;
    }
    function openVideoBySelf() {
      setClass(this.dom, OptClassName.CLOSE_VIDEO_BY_SELF, false);
      this.isVideoOpenedBySelf = true;
    }
    function closeAudioBySelf() {
      setClass(this.dom, OptClassName.CLOSE_AUDIO_BY_SELF, true);
      this.isAudioOpenedBySelf = false;
    }
    function openAudioBySelf() {
      setClass(this.dom, OptClassName.CLOSE_AUDIO_BY_SELF, false);
      this.isAudioOpenedBySelf = true;
    }
    function closeVideoByOther() {
      setClass(this.dom, OptClassName.CLOSE_VIDEO_BY_OTHER, true);
      this.isVideoOpenedByOther = false;
    }
    function openVideoByOther() {
      setClass(this.dom, OptClassName.CLOSE_VIDEO_BY_OTHER, false);
      this.isVideoOpenedByOther = true;
    }
    function closeAudioByOther() {
      this.isAudioOpenedByOther = false;
    }
    function openAudioByOther() {
      this.isAudioOpenedByOther = true;
    }
    function openScreenShare() {
      this.isScreenShareOpened = true;
      setClass(this.dom, OptClassName.OPEN_SCREENSHARE, true);
    }
    function closeScreenShare() {
      this.isScreenShareOpened = false;
      setClass(this.dom, OptClassName.OPEN_SCREENSHARE, false);
    }
    function openFlibScreenShare() {
      var node = this.dom.querySelector('.rong-video');
      node.style.transform = 'none';
    }
    function closeFlibScreenShare() {
      var node = this.dom.querySelector('.rong-video');
      node.style.transform = 'rotateY(180deg)';
    }
    function disabledVideoBySelf() {
      var node = this.dom.querySelector('.rong-opt-video')
      var disabledNode = this.dom.querySelector('.rong-opt-video-disabled')
      node.style.display = 'none';
      disabledNode.style.display = 'inline-block';
    }
    function disabledAudioBySelf() {
      var node = this.dom.querySelector('.rong-opt-audio')
      var disabledNode = this.dom.querySelector('.rong-opt-audio-disabled')
      node.style.display = 'none';
      disabledNode.style.display = 'inline-block';
    }
    function setCustomVideoUI(videoTitle) {
      var streamTopDom = this.dom.querySelector('.rong-stream-top')
      var optDom = this.dom.querySelector('.rong-stream-opt')
      var customVideoDom = this.dom.querySelector('.rong-custom-video')
      Dom.hide(streamTopDom);
      Dom.hide(optDom);
      Dom.show(customVideoDom);
      customVideoDom.innerText = videoTitle;
    }
    function hideCustomAudioBox() {
      this.dom.style.display = 'none';
    }
    function setName(name) {
      var node = this.dom.querySelector('.rong-user-name');
      node.innerText = name;
      this.userName = name;
    }
    return function (id, params, temp) {
      params = params || {};
      temp = temp || StreamBoxTemp;

      var self = this;
      temp = utils.tplEngine(temp, {
        name: params.name || id
      });
      var dom = createLocaleDom(temp),
        videoDom = Dom.getChild(dom, 'rong-video'),
        videoBtnDom = dom.querySelector('.rong-opt-video'),
        audioBtnDom = dom.querySelector('.rong-opt-audio');
      var customizeValue = utils.tplEngine('{prefix}-{id}', {
        prefix: 'Rong',
        id: id
      });
      dom.setAttribute('user', customizeValue);
      dom.onclick = function (e) {
        e.stopPropagation();
        if (self.isZoom) {
          // do nothing
        } else {
          self.zoom();
          self.resizeEvent(true, id);
        }
      };

      self.id = id;
      self.resizeEvent = params.resizeEvent || utils.noop;
      self.dom = dom;
      self.tag = params.tag;
      self.userName = params.name;
      self.childDom = {
        video: videoDom,
        videoBtn: videoBtnDom,
        audioBtn: audioBtnDom
      };
      self.isVideoOpenedBySelf = true;
      self.isAudioOpenedBySelf = true;
      self.isVideoOpenedByOther = true;
      self.isAudioOpenedByOther = true;
      self.isScreenShareOpened = false;

      self.showStream = showStream;
      self.zoom = zoom;
      self.isZoom = false;
      self.openVideoBySelf = openVideoBySelf;
      self.closeVideoBySelf = closeVideoBySelf;
      self.openAudioBySelf = openAudioBySelf;
      self.closeAudioBySelf = closeAudioBySelf;
      self.openVideoByOther = openVideoByOther;
      self.closeVideoByOther = closeVideoByOther;
      self.openAudioByOther = openAudioByOther;
      self.closeAudioByOther = closeAudioByOther;
      self.openScreenShare = openScreenShare;
      self.closeScreenShare = closeScreenShare;
      self.openFlibScreenShare = openFlibScreenShare;
      self.closeFlibScreenShare = closeFlibScreenShare;
      self.disabledVideoBySelf = disabledVideoBySelf;
      self.disabledAudioBySelf = disabledAudioBySelf;
      self.showSoundGif = showSoundGif;
      self.hideSoundGif = hideSoundGif;
      self.setCustomVideoUI = setCustomVideoUI;
      self.hideCustomAudioBox = hideCustomAudioBox;
      self.setName = setName;

      StreamBoxList[id] = self;

      return self;
    };
  })();
  StreamBox.get = function (id) {
    return StreamBoxList[id];
  };

  StreamBox.clearQuitUser = function (id) {
    delete StreamBoxList[id];
  }

  //返回登录页
  function backLoginPage() {
    Dom.hideByClass('rong-rtc');
    Dom.showByClass('rong-login');
    Dom.hideByClass('rong-btn-loading');
    Dom.showByClass('rong-btn-start');
  }

  var WhiteBoard = (function () {
    return function (domId) {
      domId = domId || 'RongWB';
      var self = this;
      var dom = Dom.getById(domId);
      var closeDom = Dom.getChild(dom, 'rong-wb-close');
      var iframeDom = Dom.getChild(dom, 'rong-whiteboard');
      closeDom.onclick = function (e) {
        // e.stopPropagation();
        e.preventDefault();
        self.hide();
      };
      self.dom = dom;
      self.closeDom = closeDom;
      self.show = function (url) {
        iframeDom.src = url;
        Dom.show(self.dom);
      };
      self.hide = function (callback) {
        callback = callback || utils.noop;
        Dom.hide(self.dom);
        iframeDom.contentWindow.RongWB.leaveWBRoom();
        iframeDom.src = '';
        // iframeDom.close()
        callback();
      };
      return self;
    };
  })();

  function userListView(userList) {
    var userListDom = Dom.getById('rongRoomUsers');
    var userListNumDom = Dom.getById('userListNum');
    var _local = RongSeal.locale[RongSeal.common.lang].common;
    var userJoinMode = {
      name: _local.spectators,
      cls: ''
    };
    var joinData = {
      0: {
        name: _local.video,
        cls: 'join-video'
      },
      1: {
        name: _local.audio,
        cls: 'join-audio'
      },
      2: {
        name: _local.spectators,
        cls: ''
      }
    }

    userListNumDom.innerHTML = '<span>' + utils.tplEngine(_local.online, { 0: userList.length }) + '</span>';
    userListDom.innerHTML = '';
    for (var i = 0; i < userList.length; i++) {
      var masterHtml = '';
      userJoinMode = joinData[userList[i].joinMode] ? joinData[userList[i].joinMode] : userJoinMode;
      if (RongSeal.userInfo.master == 1 && userList[i].userId !== RongSeal.userInfo.userId) {
        masterHtml = '<span class="user-kick-off" operate="op.kick.off" id = "' + userList[i].userId + '" title="移除用户" username="' + userList[i].userName + '"></span>';
      } else if (userList[i].master == 1) {
        masterHtml = '<span class ="user-manage-name" >管理员</span>';
      }
      var userHtml = '<div class="user-list-item">' +
        '<div class="online-user" id=""> ' + userList[i].userName + '</div>' +
        '<div class="user-join-mode  ' + userJoinMode.cls + '" id="">' + userJoinMode.name + '</div>' + masterHtml + '</div>';
      if (userList[i].master == 1) {
        userListDom.innerHTML = userHtml + userListDom.innerHTML;
      } else {
        userListDom.innerHTML = userListDom.innerHTML + userHtml;
      }
    }
  }
  function showUserList() {
    Dom.showByClass('rong-user-list');
  }
  function hideUserList() {
    Dom.hideByClass('rong-user-list');
  }
  function showCustomVideoList() {
    Dom.showByClass('rong-user-customvideo');
  }
  function hideCustomVideoList() {
    Dom.hideByClass('rong-user-customvideo');
  }
  function showCustomAudioList() {
    Dom.showByClass('rong-user-customaudio');
  }
  function hideCustomAudioList() {
    Dom.hideByClass('rong-user-customaudio');
  }

  function showCustomVideoOpenBtn() {
    Dom.showByClass('rong-opt-videoicon-open');
    Dom.hideByClass('rong-opt-videoicon-close');
  }
  function hideCustomVideoOpenBtn() {
    Dom.hideByClass('rong-opt-videoicon-open');
  }
  function showCustomVideoCloseBtn() {
    Dom.hideByClass('rong-user-customvideo');
    Dom.hideByClass('rong-opt-videoicon-open');
    Dom.showByClass('rong-opt-videoicon-close');
  }
  function switchCustomVideo() {
    var isOpen = Dom.getByClass('rong-user-customvideo').style.display === 'block';
    if (isOpen) {
      hideCustomVideoList();
    } else {
      hideCustomAudioList();
      showCustomVideoList();
    }
  }
  function switchCustomAudio() {
    var isOpen = Dom.getByClass('rong-user-customaudio').style.display === 'block';
    if (isOpen) {
      hideCustomAudioList();
    } else {
      hideCustomVideoList();
      showCustomAudioList();
    }
  }
  function showCustomAudioOpenBtn() {
    Dom.showByClass('rong-opt-audioicon-open');
    Dom.hideByClass('rong-opt-audioicon-close');
  }
  function hideCustomAudioOpenBtn() {
    Dom.hideByClass('rong-opt-audioicon-open');
  }
  function showCustomAudioCloseBtn() {
    Dom.hideByClass('rong-user-customaudio');
    Dom.hideByClass('rong-opt-audioicon-open');
    Dom.showByClass('rong-opt-audioicon-close');
  }
  function hideWhiteBoardBtn() {
    var whiteBoardBtn = Dom.getByClass('rong-opt-wb')
    Dom.hide(whiteBoardBtn);
  }
  function UiTable(param) {
    var params = {
      domId: param.domId,
      dom: document.getElementById(param.domId),
      clm: param.clm,
      data: [],
      click: param.click || function () { },
      tools: {},
      event: {},
      clmMap: {},
      unique: ''
    }
    var prefix = {
      tr: 'ui_tableuiTr_'
    }
    params.clmMap = {};
    params.dom.innerHTML = '';
    var clms = params.clm;
    for (var i = 0; i < clms.length; i++) {
      var clm = clms[i];
      params.clmMap[clm.id] = clm;
      if (clm.unique) {
        params.unique = clm.id
      }
    }

    function getHeadHtmlTemple() {
      var uiHtml = '<thead><tr>'
      for (var i = 0; i < params.clm.length; i++) {
        var item = params.clm[i];
        uiHtml += '<td id="' + item.id + '"  style="display:' + (item.hide ? 'none' : '') + ';"><span >' + item.name + '</span></td>';
        if (item.type == 'btn') {
          params.tools.btns = item;
        }
      }
      uiHtml += '</tr></thead>';
      return uiHtml;
    }
    function getDataHtml(item) {
      var uiTr = '';
      for (var i = 0; i < params.clm.length; i++) {
        var key = params.clm[i];
        uiTr += '<td  data-name= "' + key.id + '" style="display:' + (key.hide ? 'none' : '') + ';"> <span>' + item[key.id] + '</span> </td>'
      }
      return uiTr;
    }
    function getBodyHtmlTemple(data) {
      var uiHtml = '<tbody>';
      for (var j = 0; j < data.length; j++) {
        var item = data[j];
        var uiTr = '<tr data-index="' + j + '" id= "' + prefix.tr + item[params.unique] + '">';
        uiTr += getDataHtml(item);
        uiTr += '</tr>';
        uiHtml += uiTr;
      }
      uiHtml += '</tbody>';
      return uiHtml;
    }
    function addLine(item) {
      params.data.push(item);
      var uiTr = '<tr data-index="' + (params.data.length - 1) + '" id= "' + prefix.tr + item[params.unique] + '">';
      uiTr += getDataHtml(item);
      uiTr += '</tr>';
      params.dom.querySelector('tbody').innerHTML += uiTr;
    }
    function bindClmEvent() {
      var uiTr = params.dom.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
      for (var i = 0; i < uiTr.length; i++) {
        uiTr[i].onclick = function (e) {
          var index = parseInt(this.getAttribute('data-index'));
          var item = params.data[index];
          params.click(e, item);
        };
      }
    }
    function bindEvent() {
      bindClmEvent();
    }
    this.init = function (data) {
      var headHtml = getHeadHtmlTemple();
      var bodyHtml = getBodyHtmlTemple(data);
      params.dom.innerHTML = '<table class = "rong-table">' + headHtml + bodyHtml + '</table>';
      params.data = data;
      bindEvent();
    }
    this.getParams = function () {
      return params;
    }
    this.param = params;
    var updateOneLine = function (data) {
      var dom = document.getElementById(prefix.tr + data[params.unique])
      if (!dom) {
        addLine(data);
        return;
      }
      var childrens = dom.children;
      for (var i = 0; i < childrens.length; i++) {
        var item = childrens[i];
        var key = item.getAttribute('data-name');
        if (data[key]) {
          item.children[0].innerHTML = data[key];
          item.children[0].setAttribute('title',data[key]);
        }
      }
    }
    this.updateData = function (data) {
      for (var i = 0; i < data.length; i++) {
        updateOneLine(data[i]);
      }
    }
  }

  var UI = {
    RongRTCPage: RongRTCPage,
    StreamList: StreamList,
    StreamBox: StreamBox,
    WhiteBoard: WhiteBoard,
    backLoginPage: backLoginPage,
    userListView: userListView,
    showUserList: showUserList,
    hideUserList: hideUserList,
    customVideoOpt: {
      switchCustomVideo: switchCustomVideo,
      showCustomVideoList: showCustomVideoList,
      hideCustomVideoList: hideCustomVideoList,
      showCustomVideoOpenBtn: showCustomVideoOpenBtn,
      showCustomVideoCloseBtn: showCustomVideoCloseBtn,
      hideCustomVideoOpenBtn: hideCustomVideoOpenBtn
    },
    customAudioOpt: {
      switchCustomAudio: switchCustomAudio,
      showCustomAudioOpenBtn: showCustomAudioOpenBtn,
      hideCustomAudioOpenBtn: hideCustomAudioOpenBtn,
      showCustomAudioCloseBtn: showCustomAudioCloseBtn
    },
    hideWhiteBoardBtn: hideWhiteBoardBtn
  };

  var common = {
    sealAlert: sealAlert,
    SealTimer: SealTimer,
    sealTips: sealTips,
    StreamBoxList: StreamBoxList,
    SealToast: SealToast,
    formatResolution: formatResolution,
    reFormatResolution: reFormatResolution,
    getRTCToken: getRTCToken,
    getIMToken: getIMToken,
    UI: UI,
    setLocale: setLocale,
    lang: win.document.body.lang,
    Table: UiTable
  };
  win.RongSeal = win.RongSeal || {};
  win.RongSeal.common = common;
  win.RongSeal.eventEmitter = eventEmitter;
  win.RongSeal.EventName = EventName;

})({
  win: window,
  RongSeal: window.RongSeal
});