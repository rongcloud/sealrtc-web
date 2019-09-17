(function (RongSeal, dependencies) {
  'use strict';

  var Vue = dependencies.Vue,
    VueRouter = dependencies.VueRouter;

  function getRouter() {
    var router = new VueRouter({
      routes: [
        {
          path: '/login',
          name: 'login',
          component: RongSeal.login
        },
        {
          path: '/rtc',
          name: 'rtc',
          component: RongSeal.rtc
        },
        {
          path: '*',
          redirect: '/login'
        }
      ]
    });
    router.beforeEach(function (to, from, next) {
      var ignoreAuthRoutes = ['login'];
      var toName = to.name;
      var instance = RongSeal.instance || {};
      var auth = instance.auth;
      if (ignoreAuthRoutes.indexOf(toName) === -1 && !auth) {
        return next({ name: 'login' });
      }
      next();
    });
    return router;
  }

  function init(config) {
    RongSeal.instance = new Vue({
      el: config.el,
      router: getRouter()
    });
  }

  RongSeal.init = init;

})(window.RongSeal, {
  win: window,
  Vue: window.Vue,
  VueRouter: window.VueRouter
});