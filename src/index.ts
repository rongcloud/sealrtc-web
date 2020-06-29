import 'element-ui/lib/theme-chalk/index.css';

import Vue from 'vue';
import CompositionApi from '@vue/composition-api';
import ElementUI from 'element-ui';

import App from './App.vue';

Vue.use(CompositionApi);
Vue.use(ElementUI);
Vue.config.productionTip = false;

// 打印代码版本，便于追踪问题
window.console.warn(`Code Version：${COMMIT_ID}`);
// 打印 Demo 版本，便于测试追踪
window.console.warn(`Demo Version：${DEMO_VERSION}`);

new Vue({
  render: h => h(App),
}).$mount('#vue-app');
