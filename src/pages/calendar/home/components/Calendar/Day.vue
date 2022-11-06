<script setup lang="ts">
import { computed, inject, onMounted } from "vue";
import dayjs from "dayjs";
import { useDrag, useDrop } from "vue3-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

import EventList from "./EventList.vue";

import {
  CalendarEventInfo,
  CalendarInfoType,
  DragItemTypes,
  DropResult,
  CalendarKey,
} from "@/types/components/calendar";
import { PopoverKey } from "@/types/components/popover";
import { DragEventTypeEnum } from "@/types/components/calendar";

const props = defineProps<{
  dateInfo: CalendarInfoType;
  eventList: CalendarEventInfo[];
  dropStyle: {
    width: number;
    height: number;
  };
  showMaxCount: number;
}>();

const injectCalendarInfo = inject(CalendarKey);
const injectPopoverInfo = inject(PopoverKey);

// Day 组件既是放置源又是拖拽源
const [, drag, preview] = useDrag({
  type: DragEventTypeEnum.NEW,
  item: () => ({
    dragTime: props.dateInfo.fullTime,
    dateIndex: props.dateInfo.dateIndex,
  }),
  end: (item, monitor) => {
    const isDidProp = monitor.didDrop();
    if (isDidProp) {
      const dropResult: DropResult | null = monitor.getDropResult();
      if (dropResult) {
        const dragItem = {
          dateIndex: item.dateIndex,
          time: item.dragTime,
        };
        const dropItem = {
          dateIndex: dropResult.dateIndex,
          time: dropResult.dropTime,
        };

        if (dragItem.dateIndex > dropItem.dateIndex) {
          injectCalendarInfo?.createNewEvent(dropItem, dragItem);
        } else {
          injectCalendarInfo?.createNewEvent(dragItem, dropItem);
        }
      }
    }
  },
});

const [, drop] = useDrop({
  accept: [
    DragEventTypeEnum.EVENT,
    DragEventTypeEnum.FORWARD,
    DragEventTypeEnum.BACKWARD,
    DragEventTypeEnum.NEW,
  ],
  drop: () => ({
    // drag 侧可以通过 monitor.getDropResult() 拿到该值
    dropTime: props.dateInfo.fullTime,
    dateIndex: props.dateInfo.dateIndex,
  }),
  // 当拖拽组件经过组件上时调用该方法。
  hover: (item: { dateIndex: number }, monitor) => {
    const dragItem: DragItemTypes = monitor.getItem();
    if (!dragItem) return;

    const dragType = monitor.getItemType();

    const { eventId } = dragItem;
    const { fullTime, dateIndex } = props.dateInfo;

    switch (dragType) {
      case DragEventTypeEnum.EVENT:
        injectCalendarInfo?.handleEventHover(
          eventId as number,
          fullTime,
          dateIndex
        );
        break;
      case DragEventTypeEnum.FORWARD:
        injectCalendarInfo?.handleForwardHover(
          eventId as number,
          fullTime,
          dateIndex
        );
        break;
      case DragEventTypeEnum.BACKWARD:
        injectCalendarInfo?.handleBackwardHover(
          eventId as number,
          fullTime,
          dateIndex
        );
        break;
      case DragEventTypeEnum.NEW:
        injectCalendarInfo?.createNewEventHover(item.dateIndex, dateIndex);
        break;
      default:
        break;
    }

    // 拖动过程中如果 popover open 状态，那么将其关闭
    if (injectPopoverInfo?.isPopoverShow) {
      injectPopoverInfo.setPopoverShow(false);
    }
  },
});
const isToday = computed(() => {
  const { dateInfo } = props;
  return dateInfo.fullTime === dayjs().format("YYYY-MM-DD");
});

onMounted(() => {
  const emptyImage = getEmptyImage();
  preview(emptyImage, { captureDraggingState: true });
});

// 单天点击
const handlePopover = (event: MouseEvent) => {
  event.stopPropagation();
  const currentTarget = event.currentTarget as HTMLElement;
  if (currentTarget) {
    const { dateIndex, fullTime: time } = props.dateInfo;
    injectPopoverInfo?.handlePopoverVisiable(null, false, {
      dateIndex,
      time,
      target: currentTarget,
    });
  }
};
</script>
<template>
  <section
    :ref="(node) => drag(drop(node as HTMLElement))"
    :class="[
      { 'bg-green-50 dark:bg-green-800/10': dateInfo.hover },
      'border border-t-0 border-l-0 box-border border-gray-200 dark:border-gray-500',
    ]"
    @click="handlePopover"
  >
    <section class="flex items-center cursor-default h-7 px-2 pt-2 pb-1">
      <div class="select-none">
        <span
          :class="[
            'text-sm mr-2',
            {
              'inline-block bg-blue-500/80 rounded-full h-6 w-6 text-center leading-6 text-white':
                isToday,
            },
          ]"
        >
          {{ dateInfo.day }}
        </span>
        <span class="text-xs text-gray-400 dark:text-gray-500">
          {{ dateInfo.festivalName || dateInfo.cName }}
        </span>
      </div>

      <div class="ml-auto select-none">
        <span
          v-if="dateInfo.isAddtionalWorkday"
          class="inline-block text-xs text-green-500 dark:text-green-400"
        >
          班
        </span>
        <span
          v-if="dateInfo.isHoliday"
          class="inline-block text-xs text-red-500 dark:text-red-400"
        >
          休
        </span>
      </div>
    </section>

    <EventList
      :event-list="eventList"
      :date-info="dateInfo"
      :drop-style="dropStyle"
      :show-max-count="showMaxCount"
    />
  </section>
</template>

<style scoped lang="scss">
.event-container {
  // 28为每一天日期信息的高度
  height: calc(100% - 28px);
  @apply overflow-hidden;
}
</style>
