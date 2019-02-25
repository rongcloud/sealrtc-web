(function (dependencies) {
  var win = dependencies.win;
  win.RongSeal = win.RongSeal || {};

  win.RongSeal.Config = {
    TOKEN_URL: 'https://apiqa.rongcloud.net/user/get_token_new',
    DOWNLOAD_SHARE_PLUGIN_URL: 'plugin/screenshare-addon.zip',
    APP_ID: 'c9kqb3rdkbb8j',
    NAVI: 'navqa.cn.ronghub.com'
  };
})({
  win: window
});

window.global_config = {
  TOKEN_URL: 'https://t-rtc.ronghub.com/voiptoken',
  WS_NAV_URL: 'https://t-rtc.ronghub.com/nav/websocketlist',
  DOWNLOAD_SHARE_PLUGIN_URL: 'http://cdn.ronghub.com/chrome-addon-1.0.0.zip',
  IS_SHOW_WB: true,
  APP_ID: 'e0x9wycfx7flq'
};