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
    // TOKEN_URL: 'https://apiqa.rongcloud.net/user/get_token_new',
    GET_SMS_CODE_URL: 'https://sealrtc.rongcloud.cn/user/send_code',
    VERIFY_SMS_CODE_URL: 'https://sealrtc.rongcloud.cn/user/verify_code',
    DOWNLOAD_SHARE_PLUGIN_URL: 'plugin/screenshare-addon.zip',
    APP_ID: 'z3v5yqkbv8v30',
    NAVI: 'nav.cn.ronghub.com'
  };
})({
  win: window
});