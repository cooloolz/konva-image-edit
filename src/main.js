import "normalize.css";
import "onsenui/css/onsenui.css";
import "onsenui/css/onsen-css-components.css";
import Vue from "vue";
import App from "./App.vue";
import Vant from "vant";
import "vant/lib/index.css";
import VueOnsen from "vue-onsenui";

Vue.use(VueOnsen);
Vue.use(Vant);
Vue.config.productionTip = false;

new Vue({
    render: (h) => h(App),
}).$mount("#app");
