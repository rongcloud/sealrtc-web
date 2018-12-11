(function (dependencies) {
  const win = dependencies.win;
  const RongSeal = dependencies.RongSeal;
  const OpenAttribute = 'rong-data-open';
  const ShowMainAttribute = 'rong-data-main';
  const IdAttribute = 'rong-data-id';
  const utils = RongSeal.utils;

  const SealSwitch = {
    OPEN: '1',
    CLOSE: '0',
    '0': 'OPEN',
    '1': 'CLOSE'
  };
  const WhiteboardId = 'rongWhiteboard';
  const VideoListClassName = 'rong-video-list';
  const VideoBoxClassName = 'rong-video-box';
  const AudioShowClassName = 'rong-show-audio';
  const WhiteboardBoxClassName = 'rong-wb-box';
  const WhiteboardCloseClassName = 'rong-wb-close';
  const InfoClassName = 'rong-show-info';
  const CameraOptClassName = 'rong-opt-camera';
  const VoiceOptClassName = 'rong-opt-voice';
  const VideoHTMLTpl = `<video></video>
    <div class="${AudioShowClassName}"></div>
    <p class="${InfoClassName}" title="{id}">{id}</p>
    <a ${OpenAttribute}="1" ${IdAttribute}={id}  class="rong-video-opt ${CameraOptClassName}"></a>
    <a ${OpenAttribute}="1" ${IdAttribute}={id} class="rong-video-opt ${VoiceOptClassName}"></a>`;

  const getSwitchOpen = (el) => {
    let openValue = el.getAttribute(OpenAttribute) || SealSwitch.CLOSE;
    return openValue === SealSwitch.OPEN;
  }

  const setSwitchOpen = (el, isOpen) => {
    let openValue = isOpen ? SealSwitch.OPEN : SealSwitch.CLOSE;
    el.setAttribute(OpenAttribute, openValue);
  };

  const switchEl = (el) => {
    let isOpen = !getSwitchOpen(el);
    setSwitchOpen(el, isOpen);
  };

  const addVideoEl = (id) => {
    let parentEl = utils.getDom('.' + VideoListClassName);
    let boxEl = document.createElement('div');
    boxEl.className = VideoBoxClassName;
    let innerHTML = utils.tplEngine(VideoHTMLTpl, {
      id: id
    });
    boxEl.innerHTML = innerHTML;
    parentEl.append(boxEl);
    let videoEl = boxEl.children[0];
    return videoEl;
  };

  const getAudioEl = function (id) {
    let videoEl = utils.getDomById(id);
    let videoBoxEl = videoEl.parentNode;
    let children = videoBoxEl.children;
    let audioEl;
    for (let i = 0, max = children.length; i < max; i++) {
      let child = children[i];
      let hasAudioName = child.className.indexOf(AudioShowClassName) !== -1;
      if (hasAudioName) {
        audioEl = child;
      }
    }
    return audioEl;
  };

  const showAudio = (id) => {
    let audioEl = getAudioEl(id);
    utils.showDom(audioEl);
  };

  const hideAudio = (id) => {
    let audioEl = getAudioEl(id);
    utils.hideDom(audioEl);
  };

  const hideWhiteboard = () => {
    let whiteboardBox = utils.getDom('.' + WhiteboardBoxClassName);
    let wbEl = utils.getDomById(WhiteboardId);
    if (wbEl && whiteboardBox) {
      wbEl.src = '';
      utils.hideDom(whiteboardBox);
    }
  };

  const showWhiteboard = (url) => {
    let whiteboardBox = utils.getDom('.' + WhiteboardBoxClassName);
    let wbEl = utils.getDomById(WhiteboardId);
    if (whiteboardBox && wbEl) {
      utils.showDom(whiteboardBox);
      wbEl.src = url;
      let wbCloseEl = utils.getDom('.' + WhiteboardCloseClassName);
      wbCloseEl.onclick = hideWhiteboard;
    }
  };

  const getRateParams = (rate) => {
    let index = rate.indexOf('*');
    let width = rate.substring(0, index);
    let height = rate.substring(index + 1);
    return {
      width: Number(width),
      height: Number(height)
    };
  };

  const viewDom = (el) => {
    let mainSelector = '*[{mark}=\'true\']';
    isMainMark = utils.tplEngine(mainSelector, {
      mark: ShowMainAttribute
    });
    let mainEl = utils.getDom(isMainMark);
    mainEl.setAttribute(ShowMainAttribute, '');
    el.setAttribute(ShowMainAttribute, true);
  };
  
  const common = {
    getSwitchOpen: getSwitchOpen,
    setSwitchOpen: setSwitchOpen,
    switchEl: switchEl,
    addVideoEl: addVideoEl,
    showAudio: showAudio,
    hideAudio: hideAudio,
    showWhiteboard: showWhiteboard,
    hideWhiteboard: hideWhiteboard,
    getRateParams: getRateParams,
    viewDom: viewDom,
    SealEnum: {
      OpenAttribute: OpenAttribute,
      ShowMainAttribute: ShowMainAttribute,
      IdAttribute: IdAttribute,
      SealSwitch: SealSwitch
    },
    ClassName: {
      AudioShow: AudioShowClassName,
      CameraOpt: CameraOptClassName,
      VoiceOpt: VoiceOptClassName
    }
  };
  win.RongSeal = win.RongSeal || {};
  win.RongSeal.common = common;
})({
  win: window,
  RongSeal: window.RongSeal
});