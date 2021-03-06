import Vue from "vue";
import axios from "./utils/http";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import "./assets/styles/theme.scss";
import App from "./App";
import router from "./router";
import store from "./store";
import filters from "./filters";
import { Table } from "element-ui";
Vue.use(Table);
Vue.use(ElementUI);
ElementUI.Dialog.props.closeOnClickModal.default = false;

Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key]);
});

//if (!process.env.IS_WEB)
Vue.use(require("vue-electron"));
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;

// 定义全局点击函数
Vue.prototype.globalClick = function(callback) {
  document.getElementById("main").onclick = function() {
    callback();
  };
};
// 定义全局点击函数
Vue.prototype.playlistClick = function(callback) {
  document.getElementById("playlist").onclick = function() {
    callback();
  };
};

Vue.prototype.$bus = new Vue();

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: "<App/>"
}).$mount("#app");
