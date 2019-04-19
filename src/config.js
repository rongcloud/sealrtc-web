(function (dependencies) {
  var win = dependencies.win;
  win.RongSeal = win.RongSeal || {};
  //生产
  win.RongSeal.Config = {
    // 融云应用 AppKey，可在融云开发者后台获取
    APPKEY: 'z3v5yqkbv8v30',
    // SealRTC Server 地址
    URL: 'https://sealrtc.rongcloud.cn',
    // 屏幕共享插件下载地址，默认即可
    DOWNLOAD_SHARE_PLUGIN_URL: 'plugin/screenshare-addon.zip',
  };
})({
  win: window
});