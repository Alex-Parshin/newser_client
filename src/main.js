import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueSocketIO from 'vue-socket.io'
import vuetify from './plugins/vuetify'
import VJsoneditor from 'v-jsoneditor/src/index'

Vue.use(VJsoneditor)
Vue.config.productionTip = false
Vue.use(new VueSocketIO({
    debug: true,
    connection: `http://10.13.7.65:5000`,
    vuex: {
        store,
        actionPrefix: 'SOCKET_',
        mutationPrefix: 'SOCKET_'
    }
}))

new Vue({
    router,
    store,
    vuetify,
    render: h => h(App)
}).$mount('#app')