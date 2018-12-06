(function (dependencies) {
  const RongSeal = dependencies.RongSeal,
    utils = RongSeal.utils,
    getDom = utils.getDom;

  const roomIdEl = getDom('#roomId'),
    userIdEl = getDom('#userId'),
    startBtnEl = getDom('#start');

  const startMeet = () => {
    // check value
    var roomId = roomIdEl.value;
    var userId = userIdEl.value;
    RongSeal.startMeet(userId, roomId);
  };

  startBtnEl.onclick = startMeet;

})({
  win: window,
  RongSeal: window.RongSeal
});