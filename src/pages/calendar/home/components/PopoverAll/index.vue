<script setup lang="ts">
import { computed, inject, toRefs, watch } from "vue";
import { useDrop } from "vue3-dnd";
import dayjs from "dayjs";
import { Dismiss20Regular as CloseIcon } from "@vicons/fluent";
import useCalendarStore from "@/stores/calendar";

import Event from "./Event.vue";

import { CalendarKey, DragEventTypeEnum } from "@/types/components/calendar";
import type { CalendarEventInfo } from "@/types/components/calendar";
import { StartWeekEnum } from "@/types/setting/calendar";

const props = defineProps<{
  dateInfo: { dateIndex: number; fullTime: string } | null;
  eventList: CalendarEventInfo[] | null;
}>();

const emits = defineEmits<{
  (e: "close"): void;
}>();

const calendarStore = useCalendarStore();
const calendarInject = inject(CalendarKey);

const { isStartSunday, weekList } = toRefs(calendarStore);
const [collect, drop] = useDrop({
  accept: [DragEventTypeEnum.EVENT],
  drop: () => {
    if (props.dateInfo) {
      return {
        // drag 侧可以通过 monitor.getDropResult() 拿到该值
        dropTime: props.dateInfo.fullTime,
        dateIndex: props.dateInfo.dateIndex,
      };
    }
  },
  collect: (monitor) => ({
    isOver: monitor.isOver(),
  }),
});

const timeTitle = computed(() => {
  if (props.dateInfo) {
    const { fullTime } = props.dateInfo;
    let currentDay = dayjs(fullTime).day();
    if (isStartSunday.value !== StartWeekEnum.SUNDAY) {
      currentDay = currentDay === 0 ? 6 : currentDay - 1;
    }
    return `${dayjs(fullTime).format("MM月DD日")} ${
      weekList.value[currentDay]
    }`;
  }
  return "";
});

const handleClose = () => {
  emits("close");
};

watch(
  () => collect.value.isOver,
  (isOver) => {
    if (isOver) {
      calendarInject?.clearHoverStatus();
    }
  }
);
</script>
<template>
  <section v-if="eventList" :ref="drop">
    <div class="flex items-center px-3 pt-2">
      <span
        class="inline-block text w-full text-center text-gray-500 dark:text-stone-300"
      >
        {{ timeTitle }}
      </span>

      <n-button size="tiny" quaternary>
        <n-icon class="cursor-pointer" @click="handleClose">
          <CloseIcon />
        </n-icon>
      </n-button>
    </div>
    <n-scrollbar
      style="max-height: 185px"
      :class="[
        'px-3 pt-0.5 transition',
        {
          'bg-green-100/80 dark:bg-gray-800/10': collect.isOver,
        },
      ]"
    >
      <!-- 套一层 template，因为事件中有 null 值作为占位元素 -->
      <template v-for="eventItem in eventList">
        <Event
          v-if="eventItem"
          :key="eventItem.id"
          :event-info="eventItem"
          :date-info="dateInfo!"
        />
      </template>
    </n-scrollbar>
  </section>
</template>
