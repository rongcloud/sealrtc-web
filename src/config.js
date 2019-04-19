(function (dependencies) {
  var win = dependencies.win;
  win.RongSeal = win.RongSeal || {};
  //开发
  // win.RongSeal.Config = {
  //   TOKEN_URL: 'https://apiqa.rongcloud.net/user/get_token_new',
  //   GET_SMS_CODE_URL: 'https://apiqa.rongcloud.net/user/send_code_yp',
  //   VERIFY_SMS_CODE_URL: 'https://apiqa.rongcloud.net/user/verify_code_yp_t',
  //   DOWNLOAD_SHARE_PLUGIN_URL: 'plugin/screenshare-addon.zip',
  //   APP_ID: 'c9kqb3rdkbb8j',
  //   NAVI: 'navqa.cn.ronghub.com'
  // };
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