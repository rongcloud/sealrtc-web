(function (RongSeal, dependencies) {
  /* 登录逻辑 */

  var win = dependencies.win,
    Vue = win.Vue;
  var RongRTC = win.RongRTC,
    Resolution = RongRTC.Resolution;
  var utils = RongSeal.utils,
    common = RongSeal.common,
    Mode = common.ENUM.Mode,
    Store = common.Store,
    service = RongSeal.service,
    setting = RongSeal.setting;

  var TokenStore = common.TokenStore,
    UserStore = common.UserStore,
    ResolutionStore = common.ResolutionStore;

  var MAX_SMS_TIME = 60;
  var REGION = 86;
  var ResolutionList = [
    { value: '320 * 240', key: Resolution.Solution_320_240 },
    { value: '640 * 480', key: Resolution.Solution_640_480 },
    { value: '1280 * 720', key: Resolution.Solution_1280_720 }
  ];

  function toRTCPage(data) {
    var instance = RongSeal.instance;
    instance.$router.push({
      name: 'rtc',
      params: data
    });
  }

  function start(params) {
    var phone = params.phone,
      token = params.token;

    return service.initIM(token).then(function (userId) {
      UserStore.set(phone, params.roomId, params.userName);
      TokenStore.set(phone, token);
      service.setAuth(userId);
      params.userId = userId;
      toRTCPage(params);
    }).catch(function () {
      win.alert('进入会议失败');
    });
  }

  function setSMSTimeout(context) {
    context.smsTime = MAX_SMS_TIME;
    var timeout = setInterval(function() {
      context.smsTime--;
      console.log(context.smsTime);
      if (!context.smsTime) {
        clearInterval(timeout);
      }
    }, 1000);
  }

  var DefaultUser = UserStore.get();
  RongSeal.login = Vue.component('login', {
    template: '#rong-template-login',
    data: function () {
      return {
        roomId: DefaultUser.roomId || '',
        phone: DefaultUser.phone || '',
        userName: DefaultUser.userName || '',
        verifyCode: '',
        isLoading: false,
        isVerifing: false,
        smsTime: 0,
        resolution: ResolutionStore.get() || Resolution.Solution_640_480,
        mode: Mode.Normal,
        sendCodeText: '发送验证码'
      };
    },
    computed: {
      isCanStart: function () {
        return this.roomId && this.phone && this.userName;
      },
      resolutionList: function () {
        return ResolutionList;
      },
      Mode: function () {
        return Mode;
      }
    },
    mounted: function () {
      utils.compatiblePlaceholder();
    },
    methods: {
      isResolutionSelected: function (resolution) {
        return resolution.key === this.resolution;
      },
      selectResolution: function (key) {
        this.resolution = key;
        ResolutionStore.set(key);
      },
      login: function () {
        var context = this;
        if (!context.isCanStart) {
          return;
        }
        var phone = context.phone;
        var token = TokenStore.get(phone);
        if (token) {
          var data = context.$data;
          start(utils.extend(data, {
            token: token
          }));
        } else {
          context.isVerifing = true;
        }
      },
      verify: function () {
        var context = this;
        service.verifySMSCode({
          phone: context.phone,
          region: REGION,
          code: context.verifyCode
        }).then(function (result) {
          var data = context.$data;
          start(utils.extend(data, result));
        }).catch(function () {
          alert('验证失败');
        });
      },
      sendSMS: function () {
        var context = this;
        service.sendSMSCode({
          phone: context.phone,
          region: REGION
        }).then(function () {
          setSMSTimeout(context);
        }).catch(function () {
          alert('发送验证码失败');
        });
      }
    }
  });

})(window.RongSeal, {
  win: window
});