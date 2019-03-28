(function (dependencies) {
  var win = dependencies.win;
  win.RongSeal = win.RongSeal || {};

  win.RongSeal.Config = {
    TOKEN_URL: 'https://apiqa.rongcloud.net/user/get_token_new',
    GET_SMS_CODE_URL: 'https://apiqa.rongcloud.net/user/send_code_yp',
    VERIFY_SMS_CODE_URL: 'https://apiqa.rongcloud.net/user/verify_code_yp_t',
    DOWNLOAD_SHARE_PLUGIN_URL: 'plugin/screenshare-addon.zip',
    APP_ID: 'c9kqb3rdkbb8j',
    NAVI: 'navqa.cn.ronghub.com'
  };
})({
  win: window
});