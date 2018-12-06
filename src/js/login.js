(function (dependencies) {
  const win = dependencies.window,
    RongSeal = dependencies.RongSeal,
    utils = RongSeal.utils,
    getDom = utils.getDom;

  const roomIdEl = getDom('#roomId'),
    userIdEl = getDom('#userId'),
    startBtnEl = getDom('#start');

  startBtnEl.onclick = startMeet;

  function startMeet() {
    // check value
    RongSeal.startMeet();
  }

})({
  win: window,
  RongSeal: RongSeal
});