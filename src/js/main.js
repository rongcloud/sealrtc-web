(function (dependencies) {
  const win = dependencies.win,
    RongRTC = dependencies.RongRTC;

  let rongRTC;
    
  const observeRTC = () => {
    let Observer = rongRTC.Observer;
    let observer = new Observer((mutation) => {
      if (mutation.type === 'error') {
        // TODO 初始化失败
      }
    });
    observer.observe(rongRTC, {
      error: true
    });
  };

  const observeRoom = () => {
    let Room = rongRTC.Room,
      Observer = rongRTC.Observer;
    let observer = new Observer((mutation) => {
      let type = mutation.type;
      // user = mutation.user;
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
  };

  const observeStream = () => {
    let Stream = rongRTC.Stream,
      Observer = rongRTC.Observer;
    let observer = new Observer((mutation) => {
      let type = mutation.type;
      // user = mutation.user,
      // stream = mutation.stream;
      if (type === 'added') {
        // TODO 相应媒体流展示
      }
    });
    observer.observe(Stream, {
      added: true
    });
  };

  function startMeet() {
    rongRTC = new RongRTC();
    observeRTC();
    observeRoom();
    observeStream();
  }

  win.RongSeal = win.RongSeal || {};
  win.RongSeal.startMeet = startMeet;

})({
  win: window,
  RongRTC: window.RongRTC,
  RongSeal: window.RongSeal
});