<template>
  <v-app>
    <v-card color="grey lighten-4" flat tile>
      <v-toolbar dense>
        <v-toolbar-title @click="$router.push('/')" style="cursor: pointer"
          >Панель управления системой Newser</v-toolbar-title
        >
        <v-spacer></v-spacer>
      </v-toolbar>
      <!-- <router-view /> -->

      <v-simple-table style="padding: 10px">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">Клиент</th>
              <th class="text-left">Время подключения</th>
              <th class="text-left">Действия</th>
              <th class="text-left">Конфиг</th>
              <th class="text-left">Логи</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in getClients" :key="item.name">
              <td>{{ item.name }}</td>
              <td>{{ item.time }}</td>
              <td>
                <div style="margin-top: 5px">

                  <v-btn
                    v-if="item.status === 'idle' && item.name.split('_')[0] === 'puppeteer'"
                    style="margin-right: 10px"
                    outlined
                    small
                    color="green"
                    @click="setClient(item)"
                    ><v-icon>mdi-play</v-icon>
                  </v-btn
                  >

                  <v-btn
                    v-if="item.status === 'idle' && item.name.split('_')[0] !== 'puppeteer'"
                    style="margin-right: 10px"
                    outlined
                    small
                    color="green"
                    @click="dialog = false; client = item; start(item)"
                    ><v-icon>mdi-play</v-icon>
                  </v-btn
                  >

                  <v-btn
                    v-if="item.status === 'running'"
                    style="margin-right: 10px"
                    outlined
                    small
                    color="red"
                    @click="stop(item)"
                    ><v-icon>mdi-stop</v-icon>
                  </v-btn>
                  <v-btn outlined small color="black" @click="restart(item)"
                    ><v-icon>mdi-sync</v-icon>
                  </v-btn>
                </div>
              </td>
              <td style="cursor:pointer">Изменить</td>
              <td style="cursor:pointer;" @click="client=item; sheet=true" >Смотреть</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
      <v-card-title>
        <v-responsive  >
        <div v-if="showLogsWindow" class="closeLogs">
          <div @click="showLogsWindow=!showLogsWindow">  
            &#10006;
            </div>
          <ul class="logs">
            <li v-for="(log,i) in client.logs" :key="i">{{log}}</li>
          </ul>
          
        </div>

        </v-responsive>
      </v-card-title>
    </v-card>

    <div class="text-center">
    <v-bottom-sheet
      v-model="sheet"
      persistent
    >
      
      <v-sheet
        class="text-center logs_block"
        
      >
        <v-btn
          class="mt-6"
          text
          color="error"
          @click="sheet = !sheet"
        >
          close
        </v-btn>

          <ul class="logs">
            <li v-for="(log,i) in client.logs" :key="i">{{log}}</li>
          </ul>
      </v-sheet>
    </v-bottom-sheet>
  </div>

    <v-row justify="center" v-if="puppeteer">
      <v-dialog
        v-model="dialog"
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
      >
        <v-card>
          <v-toolbar dark color="primary">
            <v-btn icon dark @click="dialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-toolbar-title>Настройки запуска</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
              <v-btn dark text @click="dialog = false; start()"> Запуск </v-btn>
            </v-toolbar-items>
          </v-toolbar>
          <v-list three-line subheader>
            <v-subheader>{{ client_name }}</v-subheader>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Источник запросов</v-list-item-title>
                <v-select v-model="source" :items="sources"></v-select>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Глубина поиска (в страницах)</v-list-item-title>
                <v-text-field type="number" v-model="pages"></v-text-field>
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <v-divider></v-divider>
          <v-list three-line subheader>
            <v-subheader>Поисковые системы</v-subheader>
            <v-list-item v-for="(item, index) in getEngines" :key="index">
              <v-list-item-action>
                <v-checkbox v-model="engines[index]"></v-checkbox>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>{{ item }}</v-list-item-title>
                <v-list-item-subtitle
                  >Добавить поисковую систему {{ item }} в поиск</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-dialog>
    </v-row>
  </v-app>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
export default {
  name: "App",
  data() {
    return {
      client: '',
      client_name: '',
      puppeteer: false,
      dialog: false,
      pages: 1,
      sources: ["Удаленный сервер", "Локальное хранилище запросов"],
      source: "Удаленный сервер",
      engines: [false, false, false],
      sheet: false,
      logs:[],
      showLogs:null,
      showLogsWindow:false
    }
  },
  computed: {
    ...mapGetters(["getClients", "getEngines"]),
  },
  sockets: {
    connect: function () {
      this.whoami();
    },
    update_clients: function (data) {
      this.getClientsAct(data);
    },
    log: function ({ member, data }) {
      this.getClients.map((client) => {
        if (client.name === member)
          client.logs.unshift(data)
      })
    },
  },
  methods: {
    ...mapActions(["clientsAct", "enginesAct"]),
    setClient(client) {
      this.client = client
      this.client_name = client.name
      this.puppeteer = this.client_name ? this.client_name.split('_')[0] === 'puppeteer' : false,
      this.dialog = true
    },
    getClientsAct(data) {
      this.clientsAct(data);
    },
    async getEnginesAct() {
      await this.enginesAct()
    },

    /**               Socket Methods                  */
    whoami() {
      this.$socket.emit("who_am_i", "newser_client");
    },
    start() {
      let queryData = {}
      queryData.source = this.source
      queryData.pages = this.pages
      queryData.engines = this.engines

      this.$socket.emit("start", this.client, queryData) 
      this.client.status = "running";
    },
    stop(client) {
      if (this.$socket.emit("stop", client)) client.status = "idle";
    },
    restart(client) {
      this.$socket.emit("restart", client);
    },
    viewLogs(name){
      //this.showLogs=name;
      console.log(name);
      this.logs=this.getClients;
      console.log(this.logs);
      this.showLogsWindow=true
    },
    /************************************************ */
  },
  mounted() {
    this.getEnginesAct()
  }
};
</script>

<style scoped>
* {
  font-family: "Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif;
}
  .logs_block{
    height: 42vh;
  }
  .logs{    
    display:flex;
    flex-direction:column;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: flex-start;
    box-sizing: border-box;
    padding: 3px 15px;
    font-size: .9rem;
    line-height: 1rem;
    font-weight: 400;
    width: 100%;
    -ms-user-select: none;
    -moz-user-select: none;
    -khtml-user-select: none;
    -webkit-user-select: none;
  }
  .logs>li{
    list-style: none;
  }
  .btn{
    width:200px;
    margin: 25px;
  }
  .closeLogs{
    position: relative;
  }
  .closeLogs>div{
    position: absolute;
    top:0;
    right:25px;
    font-size: 36px;
    opacity: 0.5;
    line-height: 36px;
    cursor: pointer;
    
  }
  .closeLogs>div:active{
    opacity: 0.9;
  }
  .footer{
    width: 100%;
  }
  .main{
    min-height: 85vh;
  }
  ::-webkit-scrollbar-button {
background-image:url('');
background-repeat:no-repeat;
width:9px;
height:0px
}

::-webkit-scrollbar-track {
background-color:#ecedee
}

::-webkit-scrollbar-thumb {
-webkit-border-radius: 0px;
border-radius: 0px;
background-color:#6dc0c8;
}

::-webkit-scrollbar-thumb:hover{
background-color:#56999f;
}

::-webkit-resizer{
background-image:url('');
background-repeat:no-repeat;
width:8px;
height:0px
}

::-webkit-scrollbar{
width: 8px;
}
</style>
