import { createApp } from 'vue';
// @ts-ignore Vite handles Vue single-file component resolution at build time
import App from './App.vue';

const app = createApp(App);

app.mount('#app');
