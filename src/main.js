import "normalize.css";
import "onsenui/css/onsenui.css";
import "onsenui/css/onsen-css-components.css";
import "vant/lib/index.css";
import Vue from "vue";
import App from "./App.vue";
import VueOnsen from "vue-onsenui";
import Vant from "vant";
Vue.use(VueOnsen);
Vue.use(Vant);
Vue.config.productionTip = false;

new Vue({
    render: (h) => h(App),
}).$mount("#app");
