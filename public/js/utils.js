(function (dependencies) {
  var win = dependencies.win;
  var noop = function () { };
  var utils;

  var isString = function (str) {
    return Object.prototype.toString.call(str) === '[object String]';
  };

  var isObject = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  };

  var isArray = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  };

  var isNodeList = function (obj) {
    return Object.prototype.toString.call(obj) === '[object NodeList]';
  };

  var forEach = function (obj, callback) {
    callback = callback || noop;
    var loopObj = function () {
      for (var key in obj) {
        callback(obj[key], key, obj);
      }
    };
    var loopArr = function () {
      for (var i = 0, len = obj.length; i < len; i++) {
        callback(obj[i], i);
      }
    };
    if (isObject(obj)) {
      loopObj();
    }
    if (isArray(obj) || isNodeList(obj)) {
      loopArr();
    }
  };

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
  var SessionCache = (function (config){
    config = config || {};
    var prefix = config.prefix || 'rong-sealrtc-v2';
    var genKey = function (key) {
      return utils.tplEngine('{prefix}_{key}', {
        prefix: prefix,
        key: key
      });
    };
    var set = function (key, value) {
      sessionStorage.setItem(genKey(key), value);
    };
    var get = function (key) {
      return sessionStorage.getItem(genKey(key));
    };
    var remove = function (key) {
      sessionStorage.removeItem(genKey(key));
    };
    return {
      set: set,
      get: get,
      remove: remove
    };
  })();
  var LocalCache = (function (config){
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

  var ajax = function (option) {
    var getXHR = function () {
      var xhr = null;
      var hasXDomain = function () {
        return (typeof XDomainRequest !== 'undefined');
      };
      var hasXMLRequest = function () {
        return (typeof XMLHttpRequest !== 'undefined');
      };
      if (hasXDomain()) {
        xhr = new win.XDomainRequest();
      } else if (hasXMLRequest()) {
        xhr = new win.XMLHttpRequest();
      } else {
        xhr = new win.ActiveXObject('Microsoft.XMLHTTP');
      }
      return xhr;
    };

    var xhr = getXHR();
    var method = option.method || 'GET';
    var url = option.url;
    var queryStrings = option.queryStrings || {};
    var tpl = '{key}={value}', strings = [];
    utils.forEach(queryStrings, function (value, key) {
      var str = utils.tplEngine(tpl, {
        key: key,
        value: value
      });
      strings.push(str);
    });
    var queryString = strings.join('&');
    var urlTpl = '{url}?{queryString}';
    url = utils.tplEngine(urlTpl, {
      url: url,
      queryString: queryString
    });

    xhr.open(method, url, true);

    var headers = option.headers || {};
    utils.forEach(headers, function (header, name) {
      xhr.setRequestHeader(name, header);
    });

    var success = option.success || utils.noop;
    var fail = option.fail || utils.noop;
    var isSuccess = function (xhr) {
      return /^(200|202|10000)$/.test(xhr.status);
    };

    var onLoad = function () {
      var result = xhr.responseText;
      if (isSuccess(xhr)) {
        success(result);
      } else {
        fail(result.target.status);
      }
    };
    if ('onload' in xhr) {
      xhr.onload = onLoad;
    }
    else {
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          onLoad();
        }
      };
    }
    xhr.onerror = function (error) {
      fail(error.target.status);
    };
    xhr.send(option.body);
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

  var getDomByClass = function (className) {
    return getDom('.' + className);
  };

  var getDomList = function (name) {
    var selector = null;
    try {
      selector = win.document.querySelectorAll(name);
    } catch (e) {
      // console.error(e);
    }
    return selector;
  };

  var getDomById = function (id) {
    return win.document.getElementById(id);
  };

  var showDom = function (dom) {
    if (isString(dom)) {
      dom = getDom(dom)
    }
    if (dom) {
      dom.style.display = 'block';
    }
  };

  var showDomByClass = function (className) {
    showDom('.' + className);
  };

  var hideDom = function (dom) {
    if (isString(dom)) {
      dom = getDom(dom)
    }
    if (dom) {
      dom.style.display = 'none';
    }
  };

  var hideDomByClass = function (className) {
    hideDom('.' + className);
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

  var getDomListByName = function (name) {
    return win.document.getElementsByName(name);
  };

  var getSelectedDomByName = function (name) {
    var list = win.document.getElementsByName(name);
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
    var div = win.document.createElement('div');
    div.innerHTML = innerHTML;
    return div.children[0];
  };

  var isNumberAndLetter = function (val) {
    var reg = /^[A-Za-z0-9+=_-]+$/;
    return reg.test(val)
  };

  var isLetter = function (val) {
    var reg = /^[A-Za-z]+$/;
    return reg.test(val)
   
  };

  var insertAfter = function(newEl, targetEl) {
    var parentEl = targetEl.parentNode;
    if(parentEl.lastChild == targetEl){
      parentEl.appendChild(newEl);
    }else{
      parentEl.insertBefore(newEl,targetEl.nextSibling);
    }     
  }

  var getBrowser = function() {
    var userAgent = win.navigator.userAgent;
    var version;
    var type;

    /* 记录各浏览器名字和匹配条件 */
    var condition = {
      IE: /rv:([\d.]+)\) like Gecko|MSIE ([\d.]+)/,
      Edge: /Edge\/([\d.]+)/,
      Firefox: /Firefox\/([\d.]+)/,
      Opera: /(?:OPERA|OPR).([\d.]+)/,
      WeChat: /MicroMessenger/i,
      QQBrowser: /QQBrowser\/([\d.]+)/,
      Chrome: /Chrome\/([\d.]+)/,
      Safari: /Version\/([\d.]+).*Safari/,
      iOSChrome: /Mobile\/([\d.]+).*Safari/
    };

    for (var key in condition) {
      if (!condition.hasOwnProperty(key)) continue;
      var browserContent = userAgent.match(condition[key]);
      if (browserContent) {
        type = key;
        version = browserContent[1] || browserContent[2];
        break;
      }
    }
    return {
      type: type ? type : 'UnKonw',
      version: version ? version : 'UnKonw'
    };
  }
  var isSupportGetDisplayMedia = function() {
    var bro = getBrowser();
    var version = parseInt(bro.version);
    return version > 71 ? true : false;
  }
  var Dom = {
    create: create,
    get: getDom,
    getByClass: getDomByClass,
    getList: getDomList,
    getById: getDomById,
    show: showDom,
    showByClass: showDomByClass,
    hide: hideDom,
    hideByClass: hideDomByClass,
    getSelectedByName: getSelectedDomByName,
    getDomListByName: getDomListByName,
    getBrother: getBrotherDom,
    getChild: getChildDom,
    addClass: addClass,
    removeClass: removeClass,
    hasClass: hasClass,
    insertAfter: insertAfter
  };
  //暂时支持 on 单次
  function EventEmitter() {
    var events = {};
    this.emit = function (name) {
      var event = events[name] || function () { };
      event();
    };
    this.on = function (name, event) {
      events[name] = event;
    };
  }
  //去字符串前后空格
  function trim(str) {
    return str.replace(/(^\s*)|(\s*$)/g, '');
  }
  function isChineseChar(str){   
    var reg = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
    return reg.test(str);
  }
  function getRandomStr() {
    var tplArr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    var randomArr = [],randomStr = '{a}{b}{c}{d}';
    for(var i=0; i<4; i++){
      var index = Math.floor(Math.random() * tplArr.length)
      randomArr.push(tplArr[index])
    }
    randomStr = tplEngine('{a}{b}{c}{d}',{
      a: randomArr[0],
      b: randomArr[1],
      c: randomArr[2],
      d: randomArr[3],
    })
    return randomStr;
  }
  utils = {
    noop: noop,
    forEach: forEach,
    tplEngine: tplEngine,
    Cache: Cache,
    SessionCache: SessionCache,
    LocalCache: LocalCache,
    sendForm: sendForm,
    ajax: ajax,
    isObject: isObject,
    download: download,
    Dom: Dom,
    isNumberAndLetter: isNumberAndLetter,
    EventEmitter,
    trim: trim,
    getBrowser: getBrowser,
    isChineseChar: isChineseChar,
    isLetter: isLetter,
    getRandomStr: getRandomStr,
    isSupportGetDisplayMedia
  };
  win.RongSeal = win.RongSeal || {};
  win.RongSeal.utils = utils;
})({
  win: window
});