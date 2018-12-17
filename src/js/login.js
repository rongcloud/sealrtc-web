(function (dependencies) {
  const RongSeal = dependencies.RongSeal,
    utils = RongSeal.utils,
    common = RongSeal.common,
    sealAlert = common.sealAlert,
    getDom = utils.getDom,
    Cache = utils.Cache;

  const roomIdDom = getDom('#roomId'),
    userIdDom = getDom('#userId'),
    startBtnDom = getDom('#start');

  const StorageKeys = {
    RoomId: 'rong-sealv2-roomid'
  };

  const setDefaultRTCInfo = () => {
    let roomId = Cache.get(StorageKeys.RoomId);
    if (roomId) {
      roomIdDom.value = roomId;
    }
  };

  const checkRTCValue = () => {
    let isRoomIdEmpty = !roomIdDom.value,
      isUserIdEmpty = !userIdDom.value;
    if (isRoomIdEmpty) {
      sealAlert('房间号不能为空');
      return false;
    }
    if (isUserIdEmpty) {
      sealAlert('用户名不能为空');
      return false;
    }
    return true;
  };

  const startRTC = () => {
    if (checkRTCValue()) {
      const resolutionDom = utils.getSelectedDomByName('resolution'),
        closeVideoDom = utils.getSelectedDomByName('isCloseVideo'),
        closeAudioDom = utils.getSelectedDomByName('isCloseAudio');
      let roomId = roomIdDom.value,
        userId = userIdDom.value,
        resolution = common.formatResolution(resolutionDom.value),
        video = !closeVideoDom,
        audio = !closeAudioDom;
      RongSeal.startRTC({
        userId: userId,
        roomId: roomId,
        resolution: resolution,
        video: video,
        audio: audio
      });
      Cache.set(StorageKeys.RoomId, roomId);
    }
  };

  const init = () => {
    setDefaultRTCInfo();
    startBtnDom.onclick = startRTC;
  };

  init();

})({
  win: window,
  RongSeal: window.RongSeal
});