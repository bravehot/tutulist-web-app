import { createApp } from "vue";
import { createPinia } from "pinia";

import router from "./routes";
import App from "./App.vue";
import "./style.css";

const app = createApp(App);

// 处理 tailwindcss 样式冲突
const meta = document.createElement("meta");
meta.name = "naive-ui-style";
document.head.appendChild(meta);

app.use(createPinia());
app.use(router);
app.mount("#app");
