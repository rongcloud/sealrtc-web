(function (dependencies) {
  var win = dependencies.win;
  win.RongSeal = win.RongSeal || {};
  win.RongSeal.Config = {
    GET_SMS_CODE_URL: 'https://sealrtc.rongcloud.cn/user/send_code',
    VERIFY_SMS_CODE_URL: 'https://sealrtc.rongcloud.cn/user/verify_code',
    DOWNLOAD_SHARE_PLUGIN_URL: 'plugin/screenshare-addon.zip',
    APP_ID: 'z3v5yqkbv8v30',
    NAVI: 'nav.cn.ronghub.com'
  };
})({
  win: window
});