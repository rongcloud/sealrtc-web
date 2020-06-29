(function (win) {
  var RongSeal = win.RongSeal = win.RongSeal || {};
  RongSeal = RongSeal || {};
  RongSeal.locale = RongSeal.locale || {};
  RongSeal.locale.en = {
    data: {
      installPrompt: 'For the first time to use screenshare, please download and install the plugin',
      downloadTitle: 'Download',
      room: 'Room ID',
      user: 'User ID',
      self: 'Self',
      roomIdEmpty: 'Room Id cannot be empty',
      userIdEmpty: 'User ID can not be empty',
      roomIdIllegal: 'Room ID can only enter letters and numbers',
      networkError: 'Network is disconnected',
      userNameEnglishOnly: 'User name can only be entered in English or numbers',
      getTokenError: 'Get token failed',
      rtcError: 'Init RTC failed',
      joinError: 'Join room failed',
      leftError: 'Left room failed',
      getScreenError: 'Get screenshare failed',
      addScreenError: 'Add screenshare failed',
      closeScreenError: 'Close screenshare failed',
      publishError: 'Publish stream failed',
      getLocalStreamError: 'Collection of camera equipment failed, please check:<br> 1. Whether the computer is connected and turned on the camera device; <br>2. Whether the camera has been authorized to capture the camera;<br>',
      subscriptError: 'Subscription failed',
      closeVideoError: 'Failed to close the camera',
      openVideoError: 'Failed to open the camera',
      closeAudioError: 'Turn off the microphone failed',
      openAudioError: 'Turning on the microphone failed',
      switchStreamError: 'Switching stream failed',
      sealRtcKickOﬀ: 'You have been removed from the room by the administrator, please try to join later',
      isManage: 'You are currently an administrator',
      newManage: ' become a new administrator',
      joinMeeting: ' Join the meeting',
      removeUser: 'Are you sure you want to remove user {0} from your room?',
      50065: 'You have been removed from the room！',
      40021: 'You are not allowed to join the room！'
    },
    placeholder: {
      roomId: 'Please enter the RoomId',
      userId: 'Please enter the UserName'
    },
    textContent: {
      closeVideo: 'Turn off the camera',
      closeAudio: 'Turn off the microphone',
      setting: 'Call settings',
      resolution: 'Resolution',
      bitrate: 'Bitrate',
      frameRate: 'FrameRate',
      bitrateMIN: 'bitrateMIN',
      bitrateMAX: 'bitrateMAX',
      url: 'MediaServer URL',
      userLoginId: 'userId',
      screenshareBusy: 'Screen Sharing',
      videoClosed: 'You have turned off the camera',
      otherVideoClosed: 'He/she has turned off the camera',
      alertTitle: 'Friendly reminders'
    },
    value: {
      startRTC: 'Start',
      cancel: 'Cancel',
      conform: 'OK'
    },
    title: {
      hangup: 'hangup',
      screenshare: 'screenshare',
      whiteboard: 'whiteboard'
    },
    common: {
      spectators: 'Spectators',
      video: 'Video',
      audio: 'Audio',
      online: 'Number of people online ( {0} )'
    }
  };
})(window);