<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { getPopoverPlacement, getRangePopoverPlacement } from "../../utils";
import { getPositionInfo } from "@/utils";

import type { Placement, PopoverPosition } from "@/types/components/calendar";
import type { StyleValue } from "vue";

const props = defineProps<{
  show: boolean;
  positionInfo: PopoverPosition | null;
  // 放置源的样式
  dropStyle: {
    width: number;
    height: number;
  };
  popoverStyle?: {
    width: number;
    height: number | "auto";
  };
  eventId?: number;
  overlap?: boolean;
  placement?: Placement;
  raw?: boolean; // 是否有基础样式，默认不带
}>();

const emits = defineEmits<{
  (e: "close"): void;
}>();

const POPOVER_WIDTH = 340;
const POPOVER_HEIGHT = 240;

const contentstyle = computed<StyleValue>(() => {
  const { positionInfo, dropStyle } = props;
  const maxHeight = document.body.clientHeight;

  const width = `${
    props.popoverStyle?.width
      ? Math.round(props.popoverStyle?.width)
      : POPOVER_WIDTH
  }px`;
  const height =
    props.popoverStyle?.height === "auto"
      ? "auto"
      : `${props.popoverStyle?.height ?? POPOVER_HEIGHT}px`;

  if (positionInfo) {
    const { isRange, start } = positionInfo;
    // 边缘边距，搂的太紧有点热
    const SMALL_EDGE = 4;
    const BASE_EDGE = 8;
    const EDGE = 35;

    let targetHeight = 0;

    let isLeft = false;
    let isRight = false;
    let isEnd = false;
    let isBottom = false;
    let isTop = false;

    let left = 0;
    let top = 0;

    if (!isRange) {
      let { placement } = getPopoverPlacement(start.dateIndex);
      if (props.placement) {
        placement = props.placement;
      }
      const position = getPositionInfo(start.target as HTMLElement);

      isLeft = placement.startsWith("left");
      isRight = placement.startsWith("right");
      isEnd = placement.endsWith("end");
      isBottom = placement.startsWith("bottom");
      isTop = placement.startsWith("top");

      left = position?.left;
      top = position?.top;
    } else {
      if (positionInfo.end) {
        const { end } = positionInfo;
        const { dateIndex: startDateIndex, target: startTarget } = start;
        const { dateIndex: endDateIndex, target: endTarget } = end;
        const { placement, direction } = getRangePopoverPlacement(
          startDateIndex,
          endDateIndex
        );
        isTop = placement.startsWith("top");
        isBottom = placement.startsWith("bottom");
        isLeft = placement.startsWith("left");
        isRight = placement.startsWith("right");

        isEnd = placement.endsWith("end");

        if (direction === "start" && startTarget) {
          const position = getPositionInfo(startTarget);
          left = position.left;
          top = position.top;
          targetHeight = position.height ?? 0;
        }

        if (direction === "end" && endTarget) {
          const position = getPositionInfo(endTarget);
          left = position.left;
          top = position.top;
          targetHeight = position.height ?? 0;
        }
      }
    }

    if (!props.overlap) {
      // 向右弹需要再次加上自身的宽度
      if (isRight) {
        left += dropStyle.width + BASE_EDGE;
        if (!isEnd) {
          top -= EDGE;
        }
      }

      if (isLeft) {
        left -= POPOVER_WIDTH + BASE_EDGE;
        if (!isEnd) {
          top -= EDGE;
        }
        // 判断左侧是否溢出
        if (left < 0) {
          left = SMALL_EDGE;
        }
      }
      if (isEnd) {
        top -= POPOVER_HEIGHT - dropStyle.height + BASE_EDGE;
        // 判断底部是否溢出
        if (top + POPOVER_HEIGHT + BASE_EDGE > maxHeight) {
          top = maxHeight - POPOVER_HEIGHT - BASE_EDGE;
        }
      }
      if (isTop) {
        top -= POPOVER_HEIGHT + BASE_EDGE;
      }
      if (isBottom) {
        if (props.eventId) {
          top += targetHeight + SMALL_EDGE;
        } else {
          top += dropStyle.height + BASE_EDGE;
        }
      }
    } else {
      const { popoverStyle } = props;
      const targetPosition = getPositionInfo(start.target as HTMLElement);
      const { colNum } = getPopoverPlacement(start.dateIndex);

      top += targetPosition.height;
      if (colNum === 7) {
        const diffWidth = Math.round(
          popoverStyle!.width - targetPosition.width
        );
        left -= diffWidth;
      } else {
        const diffWidth = Math.round(
          (Math.round(popoverStyle!.width) - targetPosition.width) / 2
        );
        left -= diffWidth;
      }
    }
    if (left >= 0 && top >= 0) {
      return {
        boxShadow: "var(--box-shadow-2)",
        backgroundColor: "var(--popover-color)",
        transform: `translate(${left}px, ${top}px) ${
          props.overlap ? "translateY(-100%)" : ""
        }`,
        width,
        height,
      };
    } else {
      return { display: "none" };
    }
  }
  return {};
});

onMounted(() => {
  window.addEventListener("click", handleOutside);
  window.addEventListener("resize", handleOutside);
});

onUnmounted(() => {
  window.removeEventListener("click", handleOutside);
  window.removeEventListener("resize", handleOutside);
});

const handleOutside = () => {
  if (props.show) {
    emits("close");
  }
};

const handleClick = (event: MouseEvent) => {
  event.stopPropagation();
};
</script>
<template>
  <!-- to 选择 #app 是因为可以使用 naive 组件库提供的样式信息 -->
  <Teleport to="#app">
    <Transition>
      <n-el
        v-if="show"
        tag="section"
        :class="[
          'absolute left-0 top-0 z-40 rounded transition transform  box-border',
          { 'px-3 py-2': raw },
        ]"
        :style="contentstyle"
        @click="handleClick"
      >
        <slot />
      </n-el>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.15s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
