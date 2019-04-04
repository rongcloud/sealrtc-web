(function (win) {
  var RongSeal = win.RongSeal = win.RongSeal || {};
  RongSeal = RongSeal || {};
  RongSeal.locale = RongSeal.locale || {};
  RongSeal.locale.zh = {
    data: {
      installPrompt: '首次使用屏幕共享, 请下载并安装插件',
      downloadTitle: '下载插件',
      room: '会议室 ID',
      user: '用户 ID',
      userName: '用户名',
      self: '自己',
      roomIdEmpty: '会议室 ID 不能为空',
      userNameEmpty: '用户名称不能为空',
      userIdEmpty: '用户 ID 不能为空',
      roomIdIllegal: '会议室 ID 只能包含大小写字母、阿拉伯数字、+、=、-、_ 且长度不能超过 64 个字符',
      networkError: '网络已断开',
      phoneNumberErr: '手机号格式非法',
      verifyCodeErr: '请输入手机验证码',
      verifyCodeIncorrect: '验证码错误',
      verifyCodeExpired: '验证码过期',
      tokenExpired: 'token 已失效，请重新获取',
      kickedByOtherTips: '此用户已被其他端登录！',
      verifyCodeTips: '您还未验证过手机号，请先验证',

      getTokenError: '获取 token 失败',
      rtcError: '初始化 RTC 失败',
      joinError: '加入房间失败',
      leftError: '离开房间失败',
      getScreenError: '获取屏幕共享流失败',
      addScreenError: '加入屏幕共享流失败',
      closeScreenError: '关闭屏幕共享失败',
      getWhiteboardError: '获取白板失败',
      publishError: '推送流失败',
      getLocalStreamError: '获取本地视频流失败',
      subscriptError: '订阅失败',
      closeVideoError: '关闭摄像头失败',
      openVideoError: '打开摄像头失败',
      closeAudioError: '关闭麦克风失败',
      openAudioError: '打开麦克风失败',
      switchStreamError: '切换流失败'
    },
    placeholder: {
      roomId: '请输入会议室 ID',
      userId: '请输入用户 ID',
      userName: '请输入用户名称',
      phoneNumber: '手机号',
      verifyCode: '手机验证码'
    },
    textContent: {
      closeVideo: '加入时关闭摄像头',
      closeAudio: '加入时关闭麦克风',
      bystanders: '旁听者模式',
      setting: '通话设置',
      resolution: '分辨率',
      screenshareBusy: '正在分享屏幕',
      videoClosed: '摄像头已关闭',
      otherVideoClosed: '对方已关闭摄像头',
      alertTitle: '提示',
      phoneTips: '请输入手机号验证登录，目前只支持中国区',
      btnLoading: '加载中...',
      systemTips: '注：音视频核心引擎升级 SealRTC v3.0.0 版本与老版本不兼容，请统一使用新版本体验',
      userListClose: '关闭'
    },
    value: {
      startRTC: '开始会议',
      cancel: '取消',
      conform: '确定',
      sendVerifyCode: '发送验证码',
      verifyLogin: '验证登录'
    },
    title: {
      hangup: '挂断',
      screenshare: '屏幕共享',
      whiteboard: '白板'
    }
  };
})(window);