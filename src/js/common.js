(function (dependencies) {
  var win = dependencies.win,
    RongSeal = dependencies.RongSeal,
    utils = RongSeal.utils,
    Dom = utils.Dom,
    addClass = Dom.addClass,
    removeClass = Dom.removeClass,
    getChildDom = Dom.getChild;

  var lang = win.document.body.lang,
    locale = RongSeal.locale[lang];

  var StreamListTemp = Dom.getById('RongStreamList').innerText;
  var StreamBoxTemp = Dom.getById('RongStreamBox').innerText;
  var AlertHTMLTpl = Dom.getById('RongAlert').innerText;

  var ClassName = {
    isSelf: 'rong-is-self',
    isZoom: 'rong-is-zoom',
    closeVideoBySelf: 'rong-video-self-close',
    closeAudioBySelf: 'rong-audio-self-close',
    closeVideoByOther: 'rong-video-other-close',
    closeAudioByOther: 'rong-audio-other-close',
    openScreenshare: 'rong-screenshare-open'
  };

  /**
   * 设置多语言
   * @param {object} params 
   * @param {string} params.parentDom 父节点(只设置该节点下多语言)
   * @param {string} params.parentSelector 父选择器(只设置该选择器下多语言, 若已设置 parentDom, 则在 parentDom 基础上生效)
   */
  var setLocale = function (params) {
    params = params || {};
    var parentSelector = params.parentSelector || '';
    var parentDom = params.parentDom || win.document;
    var prefix = 'lang';
    if (locale) {
      for (var key in locale) {
        var lowerKey = key.toLocaleLowerCase();
        var attribute = '{prefix}-{key}';
        attribute = utils.tplEngine(attribute, {
          prefix: prefix,
          key: lowerKey
        });
        var selector = '{parent} *[{attribute}]';
        selector = utils.tplEngine(selector, {
          attribute: attribute,
          parent: parentSelector
        });
        var domList = parentDom.querySelectorAll(selector);
        for (var i = 0; i < domList.length; i++) {
          var dom = domList[i];
          var localeKey = dom.getAttribute(attribute);
          dom[key] = locale[key][localeKey];
        }
      }
    }
  };

  var createLocaleDom = function (temp) {
    var dom = Dom.create(temp);
    setLocale({
      parentDom: dom
    });
    return dom;
  };

  /**
   * 提示弹框
   * @param {string} str 提示信息
   * @param {object} params
   * @param {object} params.isShowCancel 是否展示取消按钮
   * @param {object} params.confirmText 确定按钮文字, 默认为 '确定'
   * @param {object} params.confirmCallback 点击确定的回调
   * @param {object} params.cancelCallback 点击取消的回调
   */
  var sealAlert = function (str, params) {
    params = params || {};
    var cancelDisplay = params.isShowCancel ? 'inline-block' : 'none';
    var innerHTML = utils.tplEngine(AlertHTMLTpl, {
      content: str,
      cancelDisplay: cancelDisplay
    });
    var alertBox = createLocaleDom(innerHTML);
    var alertDom = getChildDom(alertBox, 'rong-alert');
    var btnBoxDom = getChildDom(alertDom, 'rong-alert-btn-box');
    var cancelBtnDom = getChildDom(btnBoxDom, 'rong-alert-cancel');
    var confirmBtnDom = getChildDom(btnBoxDom, 'rong-alert-confirm');
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
  };

  var setClass = function (dom, className, isOpen) {
    isOpen ? addClass(dom, className) : removeClass(dom, className);
  };

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

  var StreamList = function (temp) {
    temp = temp || StreamListTemp;

    var self = this;
    self.streamList = [];
    self.dom = createLocaleDom(temp);

    self.add = function (streamBox) {
      if (!self.has(streamBox)) {
        self.dom.appendChild(streamBox.dom);
      }
    };
    self.remove = function (streamBox) {
      if (self.has(streamBox)) {
        self.dom.removeChild(streamBox.dom);
      }
    };
    self.has = function (streamBox) {
      var hasStreamBox = false;
      var boxList = self.dom.children;
      for (var i = 0; i < boxList.length; i++) {
        if (boxList[i] === streamBox.dom) {
          hasStreamBox = true;
        }
      }
      return hasStreamBox;
    };

    return self;
  };
  
  /* streamBox 集合 */
  var StreamBoxList = {};
  /* 清空所有 zoom class */
  var clearStreamBoxZoom = function () {
    for (var id in StreamBoxList) {
      var streamBox = StreamBoxList[id];
      removeClass(streamBox.dom, ClassName.isZoom);
    }
  };
  /**
   * @param {string} id 用户 id
   * @param {object} params 其他选项(可扩展)
   * @param {boolean} params.isSelf 是否为自己
   * @param {string} temp 模板, 可选
   */
  var StreamBox = function (id, params, temp) {
    params = params || {};
    temp = temp || StreamBoxTemp;

    var self = this;
    var isSelf = params.isSelf;
    temp = utils.tplEngine(temp, {
      name: isSelf ? locale.data.self : id
    });
    var dom = createLocaleDom(temp);
    var videoDom = Dom.getChild(dom, 'rong-video');
    var optsDom = Dom.getChild(dom, 'rong-stream-opt');
    var videoBtnDom = Dom.getChild(optsDom, 'rong-opt-video');
    var audioBtnDom = Dom.getChild(optsDom, 'rong-opt-audio');

    dom.onclick = function (e) {
      self.zoom();
      e.stopPropagation();
    };
    self.id = id;
    self.dom = dom;
    self.childDom = {
      video: videoDom,
      videoOptBtn: videoBtnDom,
      audioOptBtn: audioBtnDom
    };

    self.setStream = function (stream) {
      var videoDom = self.childDom.video;
      if (videoDom) {
        videoDom.srcObject = stream;
      }
    };
    self.zoom = function () {
      clearStreamBoxZoom();
      addClass(self.dom, ClassName.isZoom);
    };
    self.isVideoCloseBySelf = function () {
      return Dom.hasClass(self.dom, ClassName.closeVideoBySelf);
    };
    self.closeVideoBySelf = function () {
      setClass(self.dom, ClassName.closeVideoBySelf, true);
    };
    self.openVideoBySelf = function () {
      setClass(self.dom, ClassName.closeVideoBySelf, false);
    };
    self.isAudioCloseBySelf = function () {
      return Dom.hasClass(self.dom, ClassName.closeAudioBySelf);
    };
    self.closeAudioBySelf = function () {
      setClass(self.dom, ClassName.closeAudioBySelf, true);
    };
    self.openAudioBySelf = function () {
      setClass(self.dom, ClassName.closeAudioBySelf, false);
    };
    self.closeVideoByOther = function () {
      setClass(self.dom, ClassName.closeVideoByOther, true);
    };
    self.openVideoByOther = function () {
      setClass(self.dom, ClassName.closeVideoByOther, false);
    };
    self.closeAudioByOther = function () {
      // do nothing
    };
    self.openAudioByOther = function () {
      // do nothing
    };
    self.openScreenShare = function () {
      setClass(self.dom, ClassName.openScreenshare, true);
    };
    self.closeScreenShare = function () {
      setClass(self.dom, ClassName.openScreenshare, false);
    };

    if (isSelf) {
      setClass(dom, ClassName.isSelf, true);
      self.zoom();
    }

    StreamBoxList[id] = self;
    return self;
  };
  StreamBox.get = function (id) {
    return StreamBoxList[id];
  };

  var WhiteBoard = function (domId) {
    domId = domId || 'RongWB';
    var self = this;
    var dom = Dom.getById(domId);
    var closeDom = Dom.getChild(dom, 'rong-wb-close');
    var iframeDom = Dom.getChild(dom, 'rong-whiteboard');
    closeDom.onclick = function () {
      self.hide();
    };
    self.dom = dom;
    self.closeDom = closeDom;
    self.show = function (url) {
      iframeDom.src = url;
      Dom.show(self.dom);
    };
    self.hide = function () {
      iframeDom.src = '';
      Dom.hide(self.dom);
    };
    return self;
  };

  /**
   * 获取 rtc token
   * @param {object} params 
   * @param {object} params.tokenUrl 获取 rtc token 的 url
   * @param {object} params.userId 用户 id
   * @param {object} params.appId
   */
  var getRTCToken = function (params, callback) {
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
  };

  var UI = {
    StreamList: StreamList,
    StreamBox: StreamBox,
    WhiteBoard: WhiteBoard
  };

  var common = {
    sealAlert: sealAlert,
    formatResolution: formatResolution,
    getRTCToken: getRTCToken,
    UI: UI,
    setLocale: setLocale,
    lang: lang
  };
  win.RongSeal = win.RongSeal || {};
  win.RongSeal.common = common;
})({
  win: window,
  RongSeal: window.RongSeal
});