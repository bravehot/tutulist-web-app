<script setup lang="ts">
import { computed, inject, onMounted } from "vue";
import { useDrag } from "vue3-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

import {
  CalendarInfoType,
  EventType,
  CalendarKey,
} from "@/types/components/calendar";
import { DragEventTypeEnum } from "@/types/components/calendar";

const props = defineProps<{
  eventInfo: EventType | null;
  dateInfo: CalendarInfoType;
  maxWidth: number;
}>();

const injectInfo = inject(CalendarKey);

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
      if (dropResult && dropResult.dropTime !== props.dateInfo.fullTime) {
        injectInfo?.handleEventDrag(
          item.eventId as number,
          dropResult.dropTime
        );
      } else {
        injectInfo?.clearHoverStatus();
      }
    }
  },
});
const eventTitle = computed(() => {
  const { dateInfo, eventInfo } = props;
  const isShow =
    dateInfo.dateIndex % 7 === 0 || (eventInfo && !eventInfo.hasLast);
  return isShow ? eventInfo?.title : "";
});

const isActive = computed(() => {
  const { eventInfo } = props;
  return eventInfo?.id === injectInfo?.clickEventId.value;
});

onMounted(() => {
  const emptyImage = getEmptyImage();
  preview(emptyImage, { captureDraggingState: true });
});
</script>
<template>
  <section
    :ref="drag"
    :class="[
      'content !cursor-pointer',
      {
        last: eventInfo?.hasLast,
        next: eventInfo?.hasNext,
        active: isActive,
        done: !isActive && eventInfo?.isDone,
      },
    ]"
  >
    <span
      v-if="eventTitle"
      class="text-sm scale-90 origin-left inline-block w-full overflow-hidden whitespace-nowrap overflow-ellipsis translate-x-2"
      :style="{ width: `${maxWidth}px` }"
    >
      {{ eventTitle }}
    </span>
  </section>
</template>
<style scoped lang="scss">
.content {
  @apply w-full h-full flex-1 cursor-default inline-block leading-5 mb-2 text-green-600 bg-green-400/60 dark:bg-green-700 dark:text-gray-300 rounded;
  &.active {
    @apply dark:bg-green-600 bg-green-500 text-green-900 dark:text-green-100;
  }

  &.last {
    @apply rounded-tl-none rounded-bl-none;
  }

  &.next {
    @apply rounded-tr-none rounded-br-none;
  }

  &.done {
    @apply dark:bg-green-900 bg-green-300/30 text-green-600 dark:text-green-600;
  }
}
</style>
