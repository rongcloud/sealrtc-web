(function (dependencies) {
  const RongSeal = dependencies.RongSeal,
    utils = RongSeal.utils,
    common = RongSeal.common,
    getDom = utils.getDom,
    Cache = utils.Cache;

  const roomIdEl = getDom('#roomId'),
    userIdEl = getDom('#userId'),
    startBtnEl = getDom('#start');

  const RoomIdKey = 'rong-sealv2-roomid';

  const setDefaultId = () => {
    let roomId = Cache.get(RoomIdKey);
    if (roomId) {
      roomIdEl.value = roomId;
    }
  };
  const isRTCValueValid = () => {
    var isRoomIdEmpty = !roomIdEl.value,
      isUserIdEmpty = !userIdEl.value;
    if (isRoomIdEmpty) {
      alert('房间号不能为空');
      return false;
    }
    if (isUserIdEmpty) {
      alert('用户名不能为空');
      return false;
    }
    return true;
  };
  
  const startMeet = () => {
    if (isRTCValueValid()) {
      var roomId = roomIdEl.value;
      var userId = userIdEl.value;
      var rateEl = utils.getSelected('rate');
      var rate = common.getRateParams(rateEl.value);
      var isOpenCamera = utils.getSelected('isOpenCamera');
      var isTourist = utils.getSelected('isTourist');
      RongSeal.startMeet({
        userId: userId,
        roomId: roomId,
        rate: rate,
        isOpenCamera: isOpenCamera,
        isTourist: isTourist
      });
      Cache.set(RoomIdKey, roomId);
    }
  };

  setDefaultId();
  startBtnEl.onclick = startMeet;

})({
  win: window,
  RongSeal: window.RongSeal
});