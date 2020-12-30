(function (dependencies) {
  var win = dependencies.win;
  win.RongSeal = win.RongSeal || {};
  //生产
  win.RongSeal.Config = {
    // 融云应用 AppKey，可在融云开发者后台获取
    APPKEY: {APPKEY},
    // SealRTC Server 地址
    URL: {URL},
    // 屏幕共享插件下载地址，默认即可
    DOWNLOAD_SHARE_PLUGIN_URL: {DOWNLOAD_SHARE_PLUGIN_URL},
  };
})({
  win: window
});