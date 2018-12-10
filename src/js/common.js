(function (dependencies) {
  const win = dependencies.win;
  const RongSeal = dependencies.RongSeal;
  const openAttribute = 'isopen';
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

  const getSwitchOpen = (el) => {
    let openValue = el.getAttribute(openAttribute) || SealSwitch.CLOSE;
    return openValue === SealSwitch.OPEN;
  }

  const setSwitchOpen = (el, isOpen) => {
    let openValue = isOpen ? SealSwitch.OPEN : SealSwitch.CLOSE;
    el.setAttribute(openAttribute, openValue);
  };

  const switchEl = (el) => {
    let isOpen = !getSwitchOpen(el);
    setSwitchOpen(el, isOpen);
  };

  const addVideoEl = (id) => {
    let parentEl = utils.getDom('.' + VideoListClassName);
    let boxEl = document.createElement('div');
    let videoEl = document.createElement('video');
    let audioEl = document.createElement('div');
    let infoEl = document.createElement('p');
    boxEl.className = VideoBoxClassName;
    audioEl.className = AudioShowClassName;
    infoEl.className = InfoClassName;
    infoEl.textContent = id;
    infoEl.title = id;
    boxEl.append(videoEl);
    boxEl.append(audioEl);
    boxEl.append(infoEl);
    parentEl.append(boxEl);
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
  
  const common = {
    getSwitchOpen: getSwitchOpen,
    setSwitchOpen: setSwitchOpen,
    switchEl: switchEl,
    addVideoEl: addVideoEl,
    showAudio: showAudio,
    hideAudio: hideAudio,
    showWhiteboard: showWhiteboard,
    hideWhiteboard: hideWhiteboard,
    getRateParams: getRateParams
  };
  win.RongSeal = win.RongSeal || {};
  win.RongSeal.common = common;
})({
  win: window,
  RongSeal: window.RongSeal
});