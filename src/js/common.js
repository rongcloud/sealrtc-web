(function (dependencies) {
  const win = dependencies.win,
    RongSeal = dependencies.RongSeal,
    utils = RongSeal.utils,
    getChildDom = utils.getChildDom,
    getDom = utils.getDom,
    RongRTC = win.RongRTC;
  
  const ResourceType = RongRTC.ResourceType;

  /* 
    此处通过向 rong-stream-list 中追加 rong-stream-box 组件
    实现音视频界面的展示, 详情 见 index.html
   */

  /* 页面中使用标签的 attribute 做展示切换 */
  const RongAttribute = {
    isZoom: 'is-zoom',
    isScreenShare: 'is-screenshare',
    isOpenVideoBySelf: 'is-openvideo-byself',
    isOpenAudioBySelf: 'is-openaudio-byself',
    isOpenVideoByOther: 'is-openvideo-byother'
  };

  /* ClassName */
  const StreamOptBoxClassName = 'rong-stream-opt',
    StreamOptVideoClassName = 'rong-opt-video',
    StreamOptAudioClassName = 'rong-opt-audio';

  /* 视频区模板, 用于增加视频区 */
  const StreamBoxHTMLTpl = `
    <video></video>
    <div class="rong-audio-cover">
      <div class="rong-audio-cover-box">
        <img src="./css/img/audio-cover.png">
        <p class="rong-audiocover-title">摄像头已关闭</p>
        <p class="rong-audiocover-title-other">对方已关闭摄像头</p>
      </div>
    </div>
    <p class="rong-user-name">{id}</p>
    <div class="${StreamOptBoxClassName}">
      <a class="${StreamOptVideoClassName}"></a>
      <a class="${StreamOptAudioClassName}"></a>
    </div>`;

  /* alert 弹框模板 */
  const AlertHTMLTpl = `
    <div class="rong-alert">
      <p class="rong-alert-title">提示</p>
      <p class="rong-alert-content">{content}</p>
      <div class="rong-alert-btn-box">
        <button class="rong-alert-cancel" style="display: {cancelDisplay}">取消</button>
        <button class="rong-alert-confirm">{confirmText}</button>
      </div>
    </div>
  `;

  /**
   * 提示弹框
   * @param {string} str 提示信息
   * @param {object} params
   * @param {object} params.isShowCancel 是否展示取消按钮
   * @param {object} params.confirmText 确定按钮文字, 默认为 '确定'
   * @param {object} params.confirmCallback 点击确定的回调
   * @param {object} params.cancelCallback 点击取消的回调
   */
  const sealAlert = (str, params) => {
    params = params || {};
    let cancelDisplay = params.isShowCancel ? 'inline-block' : 'none';
    let alertBox = document.createElement('div');
    alertBox.className = 'rong-alert-box';
    let innerHTML = utils.tplEngine(AlertHTMLTpl, {
      content: str,
      cancelDisplay: cancelDisplay,
      confirmText: params.confirmText || '确定'
    });
    alertBox.innerHTML = innerHTML;
    let alertDom = getChildDom(alertBox, 'rong-alert');
    let btnBoxDom = getChildDom(alertDom, 'rong-alert-btn-box');
    let cancelBtnDom = getChildDom(btnBoxDom, 'rong-alert-cancel');
    let confirmBtnDom = getChildDom(btnBoxDom, 'rong-alert-confirm');
    document.body.append(alertBox);
    cancelBtnDom = cancelBtnDom || {};
    confirmBtnDom = confirmBtnDom || {};
    cancelBtnDom.onclick = () => {
      params.cancelCallback && params.cancelCallback();
      document.body.removeChild(alertBox);
    };
    confirmBtnDom.onclick = () => {
      params.confirmCallback && params.confirmCallback();
      document.body.removeChild(alertBox);
    };
  };

  /**
   * 格式化分辨率
   * @param {string} rate 分辨率
   * @return {object} 包含 width、height
   */
  const formatResolution = (rate) => {
    let index = rate.indexOf('*');
    let width = rate.substring(0, index);
    let height = rate.substring(index + 1);
    return {
      width: Number(width),
      height: Number(height)
    };
  };

  /**
   * 获取 rtc token
   * @param {object} params 
   * @param {object} params.tokenUrl 获取 rtc token 的 url
   * @param {object} params.userId 用户 id
   * @param {object} params.appId
   */
  const getRTCToken = (params, callback) => {
    callback = callback || utils.noop;
    return new Promise((resolve, reject) => {
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

  /**
   * ui 层开始白板
   * @param {string} url 版本 url
   */
  const startWhiteboard = (url) => {
    let whiteboardBox = getDom('.rong-wb-box');
    let wbEl = utils.getDomById('rongWhiteboard');
    if (whiteboardBox && wbEl) {
      utils.showDom(whiteboardBox); // 展示白板 ui
      wbEl.src = url;
      let wbCloseEl = utils.getDom('.rong-wb-close');
      // 绑定关闭白板事件
      wbCloseEl.onclick = function () {
        wbEl.src = '';
        utils.hideDom(whiteboardBox);
      };
    }
  };

  /**
   * 获取音视频组件
   * @param {string} id 
   */
  const getStreamBox = (id) => {
    return utils.getDomById(id);
  };

  /**
   * 获取音视频流的 video 节点
   * @param {string} id 
   */
  const getVideo = (id) => {
    let streamBox = getStreamBox(id);
    let children = streamBox.children;
    let videoDom;
    if (children.length) {
      videoDom = children[0];
    }
    return videoDom;
  };

  /**
   * 创建音视频组件
   * @param {string} id 
   */
  const createStreamBox = (id) => {
    let streamListDom = getDom('.rong-stream-list');
    let streamBoxDom = document.createElement('div');
    streamBoxDom.className = 'rong-stream-box';
    streamBoxDom.id = id;
    let innerHTML = utils.tplEngine(StreamBoxHTMLTpl, {
      id: id
    });
    streamBoxDom.innerHTML = innerHTML;
    streamListDom.append(streamBoxDom);
    return {
      boxDom: streamBoxDom,
      videoDom: streamBoxDom.children[0]
    };
  };

  const userJoined = () => {
    // TODO
  };

  /**
   * 用户离开, 移除音视频组件
   * @param {object} user 
   */
  const userLeft = (user) => {
    let streamBoxDom = getStreamBox(user.id);
    if (streamBoxDom) {
      let parentDom = streamBoxDom.parentNode;
      parentDom.removeChild(streamBoxDom);
    }
  };

  /**
   * 新增流
   * @param {object} params 
   * @param {object} params.user
   * @param {string} params.user.id
   * @param {object} params.stream
   * @param {MediaStream} params.stream.mediaStream
   */
  const addStream = (params) => {
    let stream = params.stream,
      user = params.user,
      userId = user.id;
    if (utils.isObject(stream)) {
      stream = stream.mediaStream;
    }
    let streamBoxDom = getStreamBox(userId);
    let videoDom;
    if (streamBoxDom) {
      videoDom = getVideo(userId);
    } else {
      let streamParams = createStreamBox(userId);
      videoDom = streamParams.videoDom;
      streamBoxDom = streamParams.boxDom;
    }
    videoDom.srcObject = stream;
    videoDom.autoplay = true;
    let streamOptBoxDom = getChildDom(streamBoxDom, StreamOptBoxClassName);
    return {
      boxDom: streamBoxDom,
      videoDom: videoDom,
      audioOptDom: getChildDom(streamOptBoxDom, StreamOptAudioClassName),
      videoOptDom: getChildDom(streamOptBoxDom, StreamOptVideoClassName)
    };
  };

  /**
   * 放大 id 相关音视频组件
   * @param {string} id 
   */
  const zoomStream = (id) => {
    let zoomKey = RongAttribute.isZoom,
      zoomDom = getDom(`*[${zoomKey}='true']`),
      streamBoxDom = getStreamBox(id);
    if (zoomDom) {
      zoomDom.setAttribute(zoomKey, false);
    }
    if (streamBoxDom) {
      streamBoxDom.setAttribute(zoomKey, true);
    }
  };

  /**
   * 设置音视频组件的属性
   * @param {string} id 
   * @param {string} attribute 属性名
   * @param {boolean} isOpen 是否开启
   */
  const setStreamAttribute = (id, attribute, isOpen) => {
    let streamBoxDom = getStreamBox(id);
    if (streamBoxDom) {
      streamBoxDom.setAttribute(attribute, isOpen);
    }
  };

  /**
   * 获取音视频组件属性
   * @param {string} id 
   * @param {string} attribute 属性名
   */
  const getStreamAttribute = (id, attribute) => {
    let streamBoxDom = getStreamBox(id);
    if (streamBoxDom) {
      let isOpened = streamBoxDom.getAttribute(attribute);
      return isOpened !== 'false';
    }
    return false;
  }

  /**
   * 登陆者开启 id 的视频流
   * @param {string} id 
   */
  const openVideoBySelf = (id) => {
    setStreamAttribute(id, RongAttribute.isOpenVideoBySelf, true);
  };

  /**
   * 登陆者关闭 id 的音频流
   * @param {string} id 
   */
  const closeVideoBySelf = (id) => {
    setStreamAttribute(id, RongAttribute.isOpenVideoBySelf, false);
  };

  /**
   * 获取登录者是否已开启 id 的视频流
   * @param {string} id 
   */
  const isOpenVideoBySelf = (id) => {
    return getStreamAttribute(id, RongAttribute.isOpenVideoBySelf);
  };

  /**
   * 登陆者操作的视频流开关
   * @param {string} id 
   */
  const switchVideoBySelf = (id) => {
    let isOpened = getStreamAttribute(id, RongAttribute.isOpenVideoBySelf);
    isOpened ? closeVideoBySelf(id) : openVideoBySelf(id);
  };

  /**
   * 开启屏幕共享
   * @param {string} id 
   */
  const openScreenShare = (id) => {
    setStreamAttribute(id, RongAttribute.isScreenShare, true);
  };

  /**
   * 关闭屏幕共享
   * @param {string} id 
   */
  const closeScreenShare = (id) => {
    setStreamAttribute(id, RongAttribute.isScreenShare, false);
  };

  /**
   * 登陆者开启 id 的音频流
   * @param {string} id 
   */
  const openAudioBySelf = (id) => {
    setStreamAttribute(id, RongAttribute.isOpenAudioBySelf, true);
  };

  /**
   * 登陆者关闭 id 的音频流
   * @param {string} id 
   */
  const closeAudioBySelf = (id) => {
    setStreamAttribute(id, RongAttribute.isOpenAudioBySelf, false);
  };

  /**
   * 获取登录者是否已开启 id 的音频流
   * @param {string} id 
   */
  const isOpenAudioBySelf = (id) => {
    return getStreamAttribute(id, RongAttribute.isOpenAudioBySelf);
  };

  /**
   * 登陆者操作的音频流开关
   * @param {string} id
   */
  const switchAudioBySelf = (id) => {
    let isOpened = getStreamAttribute(id, RongAttribute.isOpenAudioBySelf);
    isOpened ? closeAudioBySelf(id) : openAudioBySelf(id);
  };

  /**
   * 对方(id)开启视频流
   * @param {string} id 
   */
  const openVideoByOther = (id) => {
    setStreamAttribute(id, RongAttribute.isOpenVideoByOther, true);
  };

  /**
   * 对方(id)关闭视频流
   * @param {string} id
   */
  const closeVideoByOther = (id) => {
    setStreamAttribute(id, RongAttribute.isOpenVideoByOther, false);
  };

  /**
   * 用户(user)资源改变
   * @param {object} stream 
   * @param {object} user 
   */
  const changeResource = (stream, user) => {
    let type = stream.type;
    let userId = user.id;
    switch (type) {
    case ResourceType.AUDIO:
      closeVideoByOther(userId);
      break;
    case ResourceType.VIDEO:
      openVideoByOther(userId);
      break;
    case ResourceType.AUDIO_AND_VIDEO:
      openVideoByOther(userId);
      break;
    case ResourceType.NONE:
      closeVideoByOther(userId);
      break;
    default:
      break;
    }
  };
  
  const common = {
    sealAlert: sealAlert,
    formatResolution: formatResolution,
    getRTCToken: getRTCToken,

    userJoined: userJoined,
    userLeft: userLeft,
    addStream: addStream,
    zoomStream: zoomStream,
    changeResource: changeResource,

    switchVideoBySelf: switchVideoBySelf,
    switchAudioBySelf: switchAudioBySelf,
    isOpenedVideoBySelf: isOpenVideoBySelf,
    isOpenedAudioBySelf: isOpenAudioBySelf,
    openScreenShare: openScreenShare,
    closeScreenShare: closeScreenShare,

    startWhiteboard: startWhiteboard
  };
  win.RongSeal = win.RongSeal || {};
  win.RongSeal.common = common;
})({
  win: window,
  RongSeal: window.RongSeal
});