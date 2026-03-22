import { createApp } from 'vue';
import App from './App.vue';
import './styles/main.scss';

createApp(App).mount('#app');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js');
  });
}
