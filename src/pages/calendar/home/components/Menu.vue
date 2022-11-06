<script setup lang="ts">
import { RouterLink, useRoute } from "vue-router";
import { computed, h } from "vue";
import {
  CalendarAssistant20Regular as CalendarIcon,
  CheckboxPerson20Regular as TodoBoxIcon,
  Apps20Regular as QuadrantIcon,
  // Settings20Regular as SettingsIcon,
  // Timer20Regular as TimerIcon,
} from "@vicons/fluent";

import User from "./User.vue";

import { renderIcon } from "@/utils";
import logo from "@/assets/logo/Tu.png";

import type { MenuOption } from "naive-ui";

const routeInfo = useRoute();
const routeKey = computed(() => routeInfo.name);

const menuOptions: MenuOption[] = [
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: "home",
          },
        },
        { default: () => "日历视角" }
      ),
    icon: renderIcon(CalendarIcon),
    key: "home",
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: "quadrant",
          },
        },
        { default: () => "时间四象限" }
      ),
    icon: renderIcon(QuadrantIcon),
    key: "quadrant",
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: "todoBox",
          },
        },
        { default: () => "任务箱" }
      ),
    icon: renderIcon(TodoBoxIcon),
    key: "todoBox",
  },
  // {
  //   label: () =>
  //     h(
  //       RouterLink,
  //       {
  //         to: {
  //           name: "pomodoro",
  //         },
  //       },
  //       { default: () => "番茄时钟" }
  //     ),
  //   icon: renderIcon(TimerIcon),
  //   key: "pomodoro",
  // },
  // {
  //   label: () =>
  //     h(
  //       RouterLink,
  //       {
  //         to: {
  //           name: "setting",
  //         },
  //       },
  //       { default: () => "偏好设置" }
  //     ),
  //   icon: renderIcon(SettingsIcon),
  //   key: "setting",
  // },
];
</script>

<template>
  <section class="flex justify-between flex-col h-full">
    <section>
      <img :src="logo" class="logo" />
      <n-menu
        collapsed
        :collapsed-width="64"
        :options="menuOptions"
        :value="routeKey"
      />
    </section>
    <User />
  </section>
</template>

<style scoped lang="scss">
.logo {
  @apply w-11 mx-2 mt-2 mb-3;
}
</style>
