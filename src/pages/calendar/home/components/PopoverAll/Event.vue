<script setup lang="ts">
import { computed, inject, onMounted } from "vue";
import { useDrag } from "vue3-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

import { DragEventTypeEnum } from "@/types/components/calendar";
import {
  CalendarEventInfo,
  EventType,
  CalendarKey,
} from "@/types/components/calendar";
import { PopoverKey } from "@/types/components/popover";

const injectCalendarInfo = inject(CalendarKey);
const injectPopoverInfo = inject(PopoverKey);

const props = defineProps<{
  dateInfo: { dateIndex: number; fullTime: string };
  eventInfo: CalendarEventInfo;
}>();
const [, drag, preview] = useDrag({
  type: DragEventTypeEnum.EVENT,
  item: () => ({
    dragTime: props.dateInfo.fullTime,
    eventId: props.eventInfo?.id,
    eventTitle: props.eventInfo?.title,
    dateIndex: props.dateInfo.dateIndex,
  }),
  end: (item, monitor) => {
    const isDidProp = monitor.didDrop();
    if (isDidProp) {
      const dropResult: { dropTime: string; dateIndex: number } | null =
        monitor.getDropResult();
      if (dropResult) {
        if (dropResult.dropTime !== props.dateInfo.fullTime) {
          injectCalendarInfo?.handleEventDrag(
            item.eventId as number,
            dropResult.dropTime
          );
        } else {
          injectCalendarInfo?.clearHoverStatus();
        }
      }
    }
  },
});

const isActive = computed(() => {
  const { eventInfo } = props;
  return eventInfo?.id === injectCalendarInfo?.clickEventId.value;
});

onMounted(() => {
  const emptyImage = getEmptyImage();
  preview(emptyImage, { captureDraggingState: true });
});
const handleClick = (event: MouseEvent, eventInfo: EventType) => {
  event.stopPropagation();
  const { dateInfo } = props;
  const currentTarget = event.currentTarget as HTMLElement;
  const { id } = eventInfo;
  const { dateIndex, fullTime: time } = dateInfo;
  injectPopoverInfo?.handlePopoverVisiable(
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
};
</script>
<template>
  <template v-if="eventInfo">
    <div
      :ref="drag"
      :class="[
        'content !cursor-pointer',
        {
          active: isActive,
          done: !isActive && eventInfo?.isDone,
        },
      ]"
      @click="handleClick($event, eventInfo!)"
    >
      <span
        class="text-sm scale-90 origin-left inline-block pl-2 w-full overflow-hidden whitespace-nowrap overflow-ellipsis"
      >
        {{ eventInfo.title }}
      </span>
    </div>
  </template>
</template>

<style scoped lang="scss">
.content {
  @apply w-full h-5 flex-1 cursor-default inline-block leading-5 mb-2 text-green-600 bg-green-400/60 dark:bg-green-700 dark:text-gray-200 rounded;
  &.active {
    @apply dark:bg-green-600 bg-green-500/80 text-green-900 dark:text-green-100;
  }
  &.done {
    @apply dark:bg-green-900/70 bg-green-300/30 text-green-600 dark:text-green-500;
  }
}
</style>
