(function (dependencies) {
  const win = dependencies.win,
    RongSeal = dependencies.RongSeal,
    RongRTC = dependencies.RongRTC,
    utils = RongSeal.utils;

  let rongRTC,
    userId,
    roomId;


  function startMeet(usId, rmId) {
    userId = usId;
    roomId = rmId;
    rongRTC = new RongRTC();
    observeRTC();
    observeRoom();
    observeStream();
  }

  function observeRTC() {
    let Observer = rongRTC.Observer;
    let observer = new Observer((mutation) => {
      if (mutation.type === 'error') {
        // TODO 初始化失败
      }
    });
    observer.observe(rongRTC, {
      error: true
    });
  }

  function observeRoom() {
    let Room = rongRTC.Room,
      Observer = rongRTC.Observer;
    let observer = new Observer((mutation) => {
      let type = mutation.type,
        user = mutation.user;
      if (type === 'joined') {
        // TODO 某用户加入房间 信令
      }
      if (type === 'left') {
        // TODO 某用户离开房间
      }
    });
    observer.observe(Room, {
      joined: true,
      left: true
    });
  }

  function observeStream() {
    let Stream = rongRTC.Stream,
      Observer = rongRTC.Observer;
    let observer = new Observer((mutation) => {
      let type = mutation.type,
        user = mutation.user,
        stream = mutation.stream;
      if (type === 'added') {
        // TODO 相应媒体流展示
      }
    });
    observer.observe(Stream, {
      added: true
    });
  }

  win.RongSeal = win.RongSeal || {};
  win.RongSeal.startMeet = startMeet;

})({
  win: window,
  RongRTC: RongRTC,
  RongSeal: RongSeal
});