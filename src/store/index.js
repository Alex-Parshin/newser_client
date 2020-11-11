import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        clients: [],
        engines: []
    },
    mutations: {
        clients(state, data) {
            let newClients = []
            data.forEach(client => {
                newClients.push({
                    name: client,
                    time: new Date(Date.now()).toLocaleTimeString(),
                    status: 'idle',
                    message: 'Подключился!',
                    logs: []
                })
            })
            state.clients = newClients
        },
        engines(state, data) {
            state.engines = data
        }
    },
    actions: {
        clientsAct({ commit }, data) {
            commit('clients', data)
        },
        async enginesAct({ commit }) {
            await axios.get(`http://${process.env.VUE_APP_HOST}:${process.env.VUE_APP_PORT}/api/getEngines`)
                .then(data => {
                    commit('engines', data.data)
                })
        }
    },
    modules: {},
    getters: {
        getClients: state => state.clients,
        getEngines: state => state.engines
    }
})