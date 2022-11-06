<script setup lang="ts">
import {
  WeatherSunny20Regular as SunnyIcon,
  WeatherMoon20Regular as MoonIcon,
} from "@vicons/fluent";
import useGlobalStore from "@/stores/global";

const globalStore = useGlobalStore();

const handleTheme = () => {
  const theme = globalStore.theme === "dark" ? null : "dark";
  globalStore.handleTheme(theme);
};
</script>
<template>
  <n-button circle text class="!mx-2 inline-block" @click="handleTheme">
    <template #icon>
      <n-icon size="28">
        <SunnyIcon v-if="globalStore.theme !== 'dark'" />
        <MoonIcon v-else />
      </n-icon>
    </template>
  </n-button>
</template>

<style></style>
