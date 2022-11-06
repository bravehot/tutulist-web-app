<script setup lang="ts">
import { NConfigProvider, zhCN, dateZhCN, darkTheme } from "naive-ui";
import { onMounted, computed } from "vue";

import Message from "./components/message.vue";

import useGlobalStore from "@/stores/global";
import { UserTokenEnum } from "@/types/user";

const globalStore = useGlobalStore();

onMounted(() => {
  const matchMedia = window.matchMedia("(prefers-color-scheme: dark)");
  matchMedia.addEventListener("change", ({ matches }) => {
    handleTheme(matches);
  });
  handleTheme(matchMedia.matches);
  getInitialInfo();
});

const handleTheme = (matches: boolean) => {
  const theme = matches ? "dark" : null;
  globalStore.handleTheme(theme);
};

const theme = computed(() => (globalStore.theme === "dark" ? darkTheme : null));

const getInitialInfo = () => {
  const token = window.localStorage.getItem(UserTokenEnum.ASSET_TOKEN);
  const refreshToken = window.localStorage.getItem(UserTokenEnum.REFRESH_TOKEN);
  if (token && refreshToken) {
    globalStore.getInitialInfo();
  }
};
</script>

<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN" :theme="theme">
    <n-message-provider>
      <n-dialog-provider>
        <router-view />
        <Message />
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>
