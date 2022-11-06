<script setup lang="ts">
import { inject, ref, computed } from "vue";
import dayjs from "dayjs";

import New from "./New.vue";
import Forward from "./Forward.vue";
import Backward from "./Backward.vue";
import Event from "./Event.vue";
import Empty from "./Empty.vue";

import {
  CalendarInfoType,
  CalendarEventInfo,
  EventType,
} from "@/types/components/calendar";
import { PopoverKey } from "@/types/components/popover";

const injectInfo = inject(PopoverKey);

const props = defineProps<{
  dateInfo: CalendarInfoType;
  eventList: CalendarEventInfo[];
  dropStyle: {
    width: number;
    height: number;
  };
  showMaxCount: number;
}>();

const eventContainerRef = ref<HTMLElement | null>();

const maxWidth = computed(() => {
  const { width } = props.dropStyle;
  return width - 16;
});

const isShow = computed(() => {
  const { eventList, showMaxCount } = props;
  return eventList.length > showMaxCount;
});

const handleClick = (event: MouseEvent, eventInfo: EventType) => {
  event.stopPropagation();
  const { dateInfo } = props;
  const currentTarget = event.currentTarget as HTMLElement;
  const { startTime, endTime, id } = eventInfo;
  const { dateIndex, fullTime: time } = dateInfo;
  // 点击的是单天事件
  const isSingleEvent = dayjs(endTime).diff(startTime, "d") === 0;

  if (isSingleEvent) {
    injectInfo?.handlePopoverVisiable(
      eventInfo,
      false,
      {
        dateIndex,
        time,
        target: currentTarget,
      },
      undefined,
      id
    );
  } else {
    const { fullTime, dateIndex } = dateInfo;
    const isClickStart = fullTime === startTime;
    const isClickEnd = fullTime === endTime;
    // 如果点击的事件是开始日或者结束日，那么直接传 target，能减少一次直取 DOM 的次数吧
    injectInfo?.handleRangePopoverVisiable(
      eventInfo,
      dateIndex,
      isClickStart || isClickEnd
        ? {
            target: event.currentTarget as HTMLElement,
            type: isClickStart ? "start" : "end",
          }
        : null
    );
  }
};

const getMoreEvent = (event: MouseEvent) => {
  event.stopPropagation();
  const currentTarget = event.currentTarget as HTMLElement;
  injectInfo?.handlePopoverAllVisiable(true, currentTarget, props.dateInfo);
};
</script>
<template>
  <section
    v-if="eventList?.length"
    ref="eventContainerRef"
    class="event-container flex flex-col"
  >
    <template v-for="(eventInfo, eventIndex) in eventList">
      <template v-if="eventIndex <= showMaxCount - 1">
        <section
          v-if="eventInfo"
          :key="eventInfo.id ?? eventIndex"
          class="relative flex w-full h-5 mb-1"
          @click="handleClick($event, eventInfo)"
        >
          <Forward
            v-if="!eventInfo.hasLast"
            :event-info="eventInfo"
            :date-info="dateInfo"
          />
          <Event
            :event-info="eventInfo"
            :date-info="dateInfo"
            :max-width="maxWidth"
          />
          <Backward
            v-if="!eventInfo.hasNext"
            :event-info="eventInfo"
            :date-info="dateInfo"
          />
        </section>
        <Empty v-else :key="eventIndex" />
      </template>
    </template>

    <section v-if="isShow" class="w-full h-5 leading-5" @click="getMoreEvent">
      <span
        class="inline-block pl-2 scale-90 origin-left text-gray-500 hover:text-gray-500/80 cursor-pointer"
        >更多 {{ eventList.length - showMaxCount }} 项
      </span>
    </section>
  </section>
  <New v-else :date-info="dateInfo" />
</template>
