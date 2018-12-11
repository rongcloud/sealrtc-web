(function (dependencies) {
  var win = dependencies.win;
  const noop = function () {};
  let utils;

  const tplEngine = (temp, data, regexp) => {
    let replaceAction = function (object) {
      return temp.replace(regexp || (/{([^}]+)}/g), function (match, name) {
        if (match.charAt(0) === '\\') return match.slice(1);
        return (object[name] !== undefined) ? object[name] : '{' + name + '}';
      });
    };
    if (!(Object.prototype.toString.call(data) === '[object Array]')) data = [data];
    let ret = [];
    for (let i = 0, j = data.length; i < j; i++) {
      ret.push(replaceAction(data[i]));
    }
    return ret.join('');
  };

  const Cache = (function (config) {
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
  const sendForm = function (option) {
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

  const isString = (str) => {
    return Object.prototype.toString.call(str) === '[object String]';
  };

  const getDom = function (name) {
    var selector = null;
    try {
      selector = win.document.querySelector(name);
    } catch (e) {
      // console.error(e);
    }
    return selector;
  };

  const getDomById = function (id) {
    return document.getElementById(id);
  };

  const showDom = function (dom) {
    if (isString(dom)) {
      dom = utils.getDom(dom)
    }
    if (dom) {
      dom.style.display = 'block';
    }
  };

  const hideDom = function (dom) {
    if (isString(dom)) {
      dom = utils.getDom(dom)
    }
    if (dom) {
      dom.style.display = 'none';
    }
  };

  const getBrotherDom = function (dom, brotherName) {
    if (isString(dom)) {
      dom = utils.getDom(dom);
    }
    if (!isString(brotherName)) {
      brotherName = brotherName.className;
    }
    let parent = dom.parentElement;
    let brothers = parent.children;
    let brother;
    for (let i = 0, max = brothers.length; i < max; i++) {
      let bro = brothers[i];
      if (bro.className.indexOf(brotherName) !== -1) {
        brother = bro;
      }
    }
    return brother;
  };

  const getChildDom = function (dom, childName) {
    if (isString(dom)) {
      dom = utils.getDom(dom);
    }
    if (!isString(childName)) {
      childName = childName.className;
    }
    let children = dom.children;
    let child;
    for (let i = 0, max = children.length; i < max; i++) {
      let bro = children[i];
      if (bro.className.indexOf(childName) !== -1) {
        child = bro;
      }
    }
    return child;
  };

  const getSelected = function (name) {
    let list = document.getElementsByName(name);
    let selectedEl;
    for (let i = 0, max = list.length; i < max; i++) {
      let el = list[i];
      if (el.checked === true) {
        selectedEl = el;
        return selectedEl;
      }
    }
    return selectedEl;
  };
  
  utils = {
    noop: noop,
    tplEngine: tplEngine,
    Cache: Cache,
    sendForm: sendForm,
    getDom: getDom,
    showDom: showDom,
    hideDom: hideDom,
    getDomById: getDomById,
    getSelected: getSelected,
    getBrotherDom: getBrotherDom,
    getChildDom: getChildDom
  };
  win.RongSeal = win.RongSeal || {};
  win.RongSeal.utils = utils;
})({
  win: window
});