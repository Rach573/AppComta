import { createApp } from 'vue';
// @ts-ignore Vite handles Vue single-file component resolution at build time
import App from './App.vue';
import { router } from './router';
import './style/global.css';

const app = createApp(App);

app.use(router);
app.mount('#app');
