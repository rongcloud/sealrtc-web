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
    appkey: 'appkey',
    // navi: 'navi',
    server: 'server'
  };
});