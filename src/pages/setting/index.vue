<script setup lang="ts">
import { computed, h, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { MenuOption } from "naive-ui";

import { ArrowLeft20Filled as BackIcon } from "@vicons/fluent";

const MENU_OPTIONS: MenuOption[] = [
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: "accountSetting",
          },
        },
        { default: () => "账户设置" }
      ),
    key: "accountSetting",
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: "preferenceSetting",
          },
        },
        { default: () => "偏好设置" }
      ),
    key: "preferenceSetting",
  },
];
const router = useRouter();
const routeInfo = useRoute();

const loading = ref<boolean>(false);
const routeKey = computed(() => routeInfo.name);

const handleBack = () => {
  router.push({
    name: "home",
  });
};
</script>
<template>
  <n-layout has-sider>
    <section class="wrapper mx-auto py-5 h-screen flex flex-col">
      <template v-if="!loading">
        <section class="flex justify-start mb-2">
          <n-button text @click="handleBack">
            <template #icon>
              <n-icon size="15"> <BackIcon /> </n-icon>
            </template>
            返 回
          </n-button>
        </section>

        <section class="flex flex-1">
          <n-menu
            :options="MENU_OPTIONS"
            style="width: 240px"
            :value="routeKey"
          >
          </n-menu>
          <n-layout-content>
            <router-view />
          </n-layout-content>
        </section>
      </template>

      <n-skeleton v-else text :repeat="6" />
    </section>
  </n-layout>
</template>

<style lang="scss" scoped>
.wrapper {
  width: 960px;
}
</style>
