import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn'; // 导入本地化语言

// Vuetify
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

import '@mdi/font/css/materialdesignicons.css'; // Ensure you are using css-loader

import App from './App.vue';
import router from './router';

dayjs.locale('zh-cn');

const app = createApp(App);
const pinia = createPinia();

pinia.use(piniaPluginPersistedstate);

const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi', // This is already the default value - only for display purposes
  },
  components,
  directives,
});

app.use(pinia);
app.use(router);
app.use(vuetify);

app.mount('#app');
