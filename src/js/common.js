(function (dependencies) {
  var win = dependencies.win,
    RongSeal = dependencies.RongSeal,
    utils = RongSeal.utils,
    Dom = utils.Dom,
    addClass = Dom.addClass,
    removeClass = Dom.removeClass;

  var RongRTCPageTemp = Dom.getById('RongRTC').innerText; //RTC主页面
  var StreamListTemp = Dom.getById('RongStreamList').innerText; // 音视频列表展示模板
  var StreamBoxTemp = Dom.getById('RongStreamBox').innerText; // 单个音视频流展示模板
  var AlertTemp = Dom.getById('RongAlert').innerText; // 提示弹框展示模板

  var OptClassName = {
    isSelf: 'rong-is-self',
    IS_ZOOM: 'rong-is-zoom',
    CLOSE_VIDEO_BY_SELF: 'rong-video-self-close',
    CLOSE_AUDIO_BY_SELF: 'rong-audio-self-close',
    CLOSE_VIDEO_BY_OTHER: 'rong-video-other-close',
    OPEN_SCREENSHARE: 'rong-screenshare-open'
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
    return rate.width+'*'+rate.height;
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
  /** *
   * toast 提示
   * @param {string} str 提示信息
   * @param {number} duration 展示时间
  */
  var SealToast = function(){ };
  SealToast.prototype = {
    create: function(str,duration) {
      var self = this;
      var toastHtml = '';
      var toastText = '<div class="rong-seal-toast-text">'+str+'</div>';
      toastHtml = '<div class="rong-seal-toast">'+toastText+'</div>';
      if(Dom.get('.rong-seal-toast')) return; //未hide禁止重复点击
      document.body.insertAdjacentHTML('beforeend', toastHtml);
      if(duration){
        setTimeout(function(){
          self.hide();
        }, duration)
      }
    },
    show: function() {
      // var self = this;
      Dom.showByClass('rong-seal-toast');
      Dom.get('.rong-seal-toast').style.marginTop = '-'+Math.round(Dom.get('.rong-seal-toast').offsetHeight/2)+'px';
      if(Dom.get('.rong-seal-toast')) return;
    },
    hide: function() {
      // var self = this;
      if(Dom.get('.rong-seal-toast')){
        Dom.hideByClass('rong-seal-toast');
      }
    },
    destroy: function() {
      var parentDom = Dom.get('body');
      var childDom = Dom.getByClass('rong-seal-toast');
      if(childDom) {
        parentDom.removeChild(childDom);
      }
    },
    toast: function(str,duration){
      var self = this;
      return self.create(str,duration);
    }
  }
  /** *
   *  通话计时器
  */
  var SealTimer = (function() {
    var hour = 0,
      minute = 0,
      second = 0;
    var countDown,timerDom;
    
    function stop() {
      clearInterval(countDown);
      hour=minute=second=0;
      timerDom.innerHTML = '';
    }

    function format (count) {
      if(count < 10){
        return '0'+count;
      }
      return count ;
    }

    function timer() {
      second += 1;
      if(second >= 60){
        second = 0;
        minute += 1;
      }
      if(minute >= 60){
        minute = 0;
        hour += 1;
      }
      timerDom = Dom.get('.rong-user-timer');
      timerDom.innerHTML = '通话时长：'+format(hour)+':'+format(minute)+':'+format(second);
    }

    function start() {
      countDown = setInterval(timer,1000);
    }

    return function() {
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

    function createPage(bodyDom,callback) {
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
      for(var i=0;i<streamList.length;i++){
        self.removeBox(streamList[i]);
      }
    }
    
    return function (temp) {
      temp = temp || StreamListTemp;
      var self = this;
      self.streamBoxList = [];
      self.dom = createLocaleDom(temp);
      
      self.addBox = addBox;
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
  var StreamBoxList = {}; // streamBox 集合
  console.log('StreamBoxList: ', StreamBoxList);
  
  var StreamBox = (function () {
    var setClass = function (dom, className, isOpen) {
      isOpen ? addClass(dom, className) : removeClass(dom, className);
    };
    
    // 清空所有 zoom class
    function clearStreamBoxZoom() {
      for (var id in StreamBoxList) {
        var streamBox = StreamBoxList[id];
        streamBox.resizeEvent(false, id);
        streamBox.isZoom = false;
        removeClass(streamBox.dom, OptClassName.IS_ZOOM);
      }
    }

    // 展示分辨率
    // function addResolution(dom) {
    //   var p = document.createElement('p')
    //   p.innerHtml = dom.video.videoWidth +'*'+dom.video.videoHeight;
    //   dom.appendChild(p);
    // }
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
        videoDom.setAttribute('stream',customizeValue);
      }
    }

    function zoom() {
      var self = this;
      
      clearStreamBoxZoom();
      self.isZoom = true;
      addClass(this.dom, OptClassName.IS_ZOOM)
    }
    function closeVideoBySelf() {
      setClass(this.dom, OptClassName.CLOSE_VIDEO_BY_SELF, true);
      this.isVideoOpenedBySelf = false;
      console.log('close my video')
    }
    function openVideoBySelf() {
      setClass(this.dom, OptClassName.CLOSE_VIDEO_BY_SELF, false);
      this.isVideoOpenedBySelf = true;
      console.log('open my video')
    }
    function closeAudioBySelf() {
      setClass(this.dom, OptClassName.CLOSE_AUDIO_BY_SELF, true);
      this.isAudioOpenedBySelf = false;
      console.log('close my audio')
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
      dom.setAttribute('user',customizeValue);
      dom.onclick = function (e) {
        self.zoom();
        self.resizeEvent(true, id);
        e.stopPropagation();
      };

      self.id = id;
      self.resizeEvent = params.resizeEvent || utils.noop;
      self.dom = dom;
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
  })();

  var UI = {
    RongRTCPage: RongRTCPage,
    StreamList: StreamList,
    StreamBox: StreamBox,
    WhiteBoard: WhiteBoard,
    backLoginPage: backLoginPage
  };
  
  var common = {
    sealAlert: sealAlert,
    SealTimer: SealTimer,
    StreamBoxList: StreamBoxList,
    SealToast: SealToast,
    formatResolution: formatResolution,
    reFormatResolution: reFormatResolution,
    getRTCToken: getRTCToken,
    getIMToken: getIMToken,
    UI: UI,
    setLocale: setLocale,
    lang: win.document.body.lang
  };
  win.RongSeal = win.RongSeal || {};
  win.RongSeal.common = common;

})({
  win: window,
  RongSeal: window.RongSeal
});