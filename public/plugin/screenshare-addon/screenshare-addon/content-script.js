var Keys = {
  CHECK: 'rong-check-share-installed',
  CHECK_RESPONSE: 'rong-share-installed',
  GET: 'rong-share-get',
  GET_RESPONSE: 'rong-share-get-response',
  CLEAR_BOX: 'rong-share-clear-box'
};

var sendToBackground = function (msg) {
  chrome.runtime.sendMessage(msg);
};

var sendToWindow = function (msg) {
  window.postMessage(msg, '*');
};

var listenBackgroundMsg = function (callback) {
  chrome.runtime.onMessage.addListener(callback);
};

var listenWindowMsg = function (callback) {
  window.addEventListener('message', callback);
};

listenBackgroundMsg(function (data) {
  var type = data.type;
  if (type === Keys.GET_RESPONSE) {
    sendToWindow(data);
  }
});

listenWindowMsg(function (event) {
  var data = event.data;
  var type = data.type;
  switch(type) {
    case Keys.CHECK:
      sendToWindow({
        type: Keys.CHECK_RESPONSE
      });
      break;
    case Keys.GET:
      sendToBackground({
        type: Keys.GET
      });
      break;
    case Keys.CLEAR_BOX:
      sendToBackground({
        type: Keys.CLEAR_BOX
      });
    default:
      break;
  }
});

