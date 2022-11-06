<script setup lang="ts" name="DateContent">
import { ref } from "vue";
import dayjs from "dayjs";

import {
  ChevronLeft20Filled as LeftIcon,
  ChevronRight20Filled as RightIcon,
  Add20Regular as AddIcon,
} from "@vicons/fluent";

import WeekList from "./components/Calendar/WeekList.vue";
import DateContent from "./components/Calendar/DateContent.vue";
import ChangeTheme from "../components/ChangeTheme.vue";

import type { SelectOptions } from "@/types/components/calendar";

const dateContentRef = ref<InstanceType<typeof DateContent>>();

const currentTime = ref<number>(dayjs().valueOf());

const handleTime = (type: SelectOptions) => {
  switch (type) {
    case "LAST":
      currentTime.value = dayjs(currentTime.value).subtract(1, "M").valueOf();
      break;
    case "NEXT":
      currentTime.value = dayjs(currentTime.value).add(1, "M").valueOf();
      break;
    case "CURRENT":
      currentTime.value = dayjs().valueOf();
      break;
  }
};

const handleCreateEvent = (event: MouseEvent) => {
  event.stopPropagation();
  dateContentRef.value?.createEventByTime(
    dayjs(currentTime.value).format("YYYY-MM-DD")
  );
};
</script>

<template>
  <section class="flex items-center justify-end h-14 px-2">
    <n-button round class="!mx-4" @click="handleCreateEvent">
      <template #icon>
        <n-icon><AddIcon /></n-icon>
      </template>
      创建
    </n-button>
    <n-date-picker v-model:value="currentTime" type="month" class="border-0" />
    <n-button circle class="!mx-4" @click="handleTime('LAST')">
      <template #icon>
        <n-icon class="text-base">
          <LeftIcon />
        </n-icon>
      </template>
    </n-button>
    <n-button circle @click="handleTime('NEXT')">
      <template #icon>
        <n-icon class="text-base">
          <RightIcon />
        </n-icon>
      </template>
    </n-button>
    <n-button round class="!mx-4" @click="handleTime('CURRENT')">
      今天
    </n-button>
    <ChangeTheme />
  </section>

  <WeekList />

  <DateContent ref="dateContentRef" :current-time="currentTime" />
</template>
