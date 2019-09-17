(function (global, factory) {
  if (typeof exports === 'object' && module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && (define.amd || define.cmd)) {
    define(factory);
  } else {
    global.RongSeal = global.RongSeal || {};
    global.RongSeal.setting = factory();
  }
})(this, function () {


  return {
    appkey: 'z3v5yqkbv8v30',
    // navi: 'http://navqa.cn.ronghub.com',
    server: 'https://sealrtc.rongcloud.cn'
  };
});