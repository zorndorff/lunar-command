import { createApp } from 'vue';
import App from './App.vue';
import './index.css';
import {store} from './store';
import SimWorker from './sim.worker?worker';

const worker = new SimWorker();

worker.addEventListener('message', ({ data }) => {
  let message = data.message;

  switch (message) {
    case 'SIM_UPDATE':
      store.dispatch('increment',  data.entities);
    break;
  }
});

createApp(App)
.use(store)
.mount('#app')
