(function (dependencies) {
  var win = dependencies.win;
  var utils = {
    noop: function () {},
    tplEngine: function (temp, data, regexp) {
      var replaceAction = function (object) {
        return temp.replace(regexp || (/{([^}]+)}/g), function (match, name) {
          if (match.charAt(0) === '\\') return match.slice(1);
          return (object[name] !== undefined) ? object[name] : '{' + name + '}';
        });
      };
      if (!(Object.prototype.toString.call(data) === '[object Array]')) data = [data];
      var ret = [];
      for (var i = 0, j = data.length; i < j; i++) {
        ret.push(replaceAction(data[i]));
      }
      return ret.join('');
    },
    Cache: function (config) {
      config = config || {};
      var prefix = config.prefix || 'rong-sealrtc-v2';
      var genKey = function (key) {
        return utils.tplEngine('{prefix}_{key}', {
          prefix: prefix,
          key: key
        });
      };
      var set = function (key, value) {
        localStorage.setItem(genKey(key), value);
      };
      var get = function (key) {
        return localStorage.getItem(genKey(key));
      };
      var remove = function (key) {
        localStorage.removeItem(genKey(key));
      };
      return {
        set: set,
        get: get,
        remove: remove
      };
    },
    getDom: function (name) {
      return document.querySelector(name);
    }
  };
  win.RongSeal = win.RongSeal || {};
  win.RongSeal.utils = utils;
})({
  win: window
});