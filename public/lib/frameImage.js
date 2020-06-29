(function (win) {
  /**
   * 
   * @param {mediaStream} stream 
   * @param {object} options 
   * @param {string} options.type 图片类型 支持 png, jpeg, 默认 png
   * @param {number} options.width 图片宽度
   * @param {number} options.height 图片高度
   * @param {number} options.scale 缩放, 默认为 1, 建议范围: 0.01 - 5
   */
  var getBase64Image = function (stream, options) {
    options = options || {};
    var type = options.type || 'png',
      scale = Number(options.scale || 1);
    return new Promise(function (resolve, reject) {
      var video = document.createElement('video');
      var canvas = document.createElement('canvas');
      video.srcObject = stream;
      video.autoplay = true;
      video.onplay = function () {
        var width = options.width || video.videoWidth;
        var height = options.height || video.videoHeight;
        canvas.width = width * scale;
        canvas.height = height * scale;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        var base64 = canvas.toDataURL('image/' + type);
        resolve(base64);
      };
      video.onerror = reject;
    });
  };
  win.getBase64Image = getBase64Image;
})(window);