(function (dependencies) {
  // 便于运维上线生产环境时修改，使 location.search.appkey 失效
  const defaultAppkey = '';
  const defaultRTCS = '';
  /**
   * 解析 location.search 字段
   * 【必填】
   * 1. appkey
   * 2. rtcs: sealrtc-server api 地址
   * 【选填】
   * 1. ms: media-server 地址，值为空时使用导航下发地址
   */
  function parseLocation() {
    const search = location.search.replace(/^\?/, '');
    if (search.length === 0) {
      return {};
    }
    const conf = Object.assign({}, ...search.split('&').map((kv) => {
      const [key, value] = kv.split(/=/);
      return {
        [key]: value,
      };
    }));
    return conf;
  }

  const search = parseLocation();
  const appkey = search.appkey || defaultAppkey;
  const rtcs = search.rtcs || defaultRTCS;

  if (!appkey || !rtcs) {
    throw 'appkey 与 rtcs 不可为空!'
  }

  var win = dependencies.win;
  win.RongSeal = win.RongSeal || {};

  win.RongSeal.Config = {
    // 融云应用 AppKey
    APPKEY: appkey,
    // SealRTC Server 地址
    URL: rtcs,
    // media server 地址，无值时跟随导航分配
    MEDIA_SERVER: search.ms,

    // 屏幕共享插件下载地址，默认即可
    DOWNLOAD_SHARE_PLUGIN_URL: 'plugin/screenshare-addon.zip',
  };
})({
  win: window
});