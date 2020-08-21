import "normalize.css";
import "onsenui/css/onsenui.css";
import "onsenui/css/onsen-css-components.css";
import "vant/lib/index.css";
import Vue from "vue";
import App from "./App.vue";
import Vant from "vant";
import VueOnsen from "vue-onsenui";
import { VueHammer } from "vue2-hammer";
VueHammer.config.press = {
    time: 1000,
};
Vue.use(VueOnsen);
Vue.use(Vant);
Vue.use(VueHammer);
Vue.config.productionTip = false;

new Vue({
    render: (h) => h(App),
}).$mount("#app");
