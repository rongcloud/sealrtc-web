(function (dependencies) {
  var win = dependencies.win;
  var noop = function () { };
  var utils;

  var tplEngine = function (temp, data, regexp) {
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
  };

  var Cache = (function (config) {
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
  })();
  /* 
      var option = {
        url: '',
        method: '',
        headers: {},
        body: {},
        success: function(){},
        fail: function(){}
      };
    */
  var sendForm = function (option) {
    var formData = new FormData();
    var data = option.body || {};
    for (var key in data) {
      formData.append(key, data[key]);
    }
    var xhr = new XMLHttpRequest();
    xhr.open(option.method, option.url);
    xhr.addEventListener('load', function () {
      option.success && option.success(xhr.responseText);
    }, false);
    xhr.addEventListener('error', function (e) {
      option.fail && option.fail(e);
    });
    xhr.send(formData);
  };

  var isString = function (str) {
    return Object.prototype.toString.call(str) === '[object String]';
  };

  var isObject = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  };

  var download = function (url) {
    win.open(url);
  };

  var getDom = function (name) {
    var selector = null;
    try {
      selector = win.document.querySelector(name);
    } catch (e) {
      // console.error(e);
    }
    return selector;
  };

  var getDomById = function (id) {
    return document.getElementById(id);
  };

  var showDom = function (dom) {
    if (isString(dom)) {
      dom = getDom(dom)
    }
    if (dom) {
      dom.style.display = 'block';
    }
  };

  var hideDom = function (dom) {
    if (isString(dom)) {
      dom = getDom(dom)
    }
    if (dom) {
      dom.style.display = 'none';
    }
  };

  var getBrotherDom = function (dom, brotherName) {
    if (isString(dom)) {
      dom = getDom(dom);
    }
    if (!isString(brotherName)) {
      brotherName = brotherName.className;
    }
    var parent = dom.parentElement;
    var brothers = parent.children;
    var brother;
    for (var i = 0, max = brothers.length; i < max; i++) {
      var bro = brothers[i];
      if (bro.className.indexOf(brotherName) !== -1) {
        brother = bro;
      }
    }
    return brother;
  };

  var getChildDom = function (dom, childName) {
    if (isString(dom)) {
      dom = getDom(dom);
    }
    if (!isString(childName)) {
      childName = childName.className;
    }
    var children = dom.children;
    var child;
    for (var i = 0, max = children.length; i < max; i++) {
      var bro = children[i];
      if (bro.className.indexOf(childName) !== -1) {
        child = bro;
      }
    }
    return child;
  };

  var getSelectedDomByName = function (name) {
    var list = document.getElementsByName(name);
    var selectedEl;
    for (var i = 0, max = list.length; i < max; i++) {
      var el = list[i];
      if (el.checked === true) {
        selectedEl = el;
        return selectedEl;
      }
    }
    return selectedEl;
  };

  var hasClass = function (dom, className) {
    var classList = dom.classList;
    var hasClass = false;
    for (var i = 0; i < classList.length; i++) {
      var name = classList[i];
      if (name === className) {
        hasClass = true;
      }
    }
    return hasClass;
  };

  var addClass = function (dom, className) {
    if (!hasClass(dom, className)) {
      dom.classList.add(className);
    }
  };

  var removeClass = function (dom, className) {
    if (hasClass(dom, className)) {
      dom.classList.remove(className);
    }
  };

  var create = function (innerHTML) {
    var div = document.createElement('div');
    div.innerHTML = innerHTML;
    return div.children[0];
  };

  var Dom = {
    create: create,
    get: getDom,
    getById: getDomById,
    show: showDom,
    hide: hideDom,
    getSelectedByName: getSelectedDomByName,
    getBrother: getBrotherDom,
    getChild: getChildDom,
    addClass: addClass,
    removeClass: removeClass,
    hasClass: hasClass
  };

  utils = {
    noop: noop,
    tplEngine: tplEngine,
    Cache: Cache,
    sendForm: sendForm,
    isObject: isObject,
    download: download,
    Dom: Dom
  };
  win.RongSeal = win.RongSeal || {};
  win.RongSeal.utils = utils;
})({
  win: window
});