import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { solar2lunar } from "solarlunar";
import { isEmpty } from "lodash-es";

import { festival, lFestival } from "@/pages/calendar/home/constant/festival";

dayjs.extend(isBetween);

import type {
  EventType,
  SourceEventType,
  CalendarInfoType,
  CalendarEventInfo,
  PopoverPlacement,
  Placement,
} from "@/types/components/calendar";
import { StartWeekEnum } from "@/types/setting/calendar";

import { isAddtionalWorkday, isHoliday } from "./chinese-workday";

/**
 * 获取当月所有的需要渲染的事件
 * @param calendarInfo 当月的日期信息
 * @param eventList 当月从服务端返回的事件列表
 */
const getRenderEventList = (
  calendarInfo: CalendarInfoType[],
  eventList: SourceEventType[]
): {
  renderList: CalendarEventInfo[][]; // 当月渲染所需格式化后的事件
  currentEventList: EventType[][]; // 当月展示的所有事件，未排序
  nextEventList: EventType[][]; // 当月每一天的未来事件
} => {
  const currentEventList: EventType[][] = [];
  const nextEventList: EventType[][] = [];
  const renderList: CalendarEventInfo[][] = [];

  calendarInfo.forEach((dateInfo) => {
    const currentEvent = getCurrentDayEventList(dateInfo.fullTime, eventList);
    const nextEvent = getHasNextEventList(currentEvent);
    nextEventList.push(nextEvent);
    currentEventList.push(currentEvent);
  });

  calendarInfo.forEach((_dateInfo, index) => {
    const list = handleSortIndexEventList(
      index,
      nextEventList,
      currentEventList[index]
    );
    renderList.push(list);
  });

  return { renderList, currentEventList, nextEventList };
};

/**
 * @param date 当天的 fullTime
 * @param eventList 从服务获取的当月的所有事件列表
 * @returns 当天需要渲染的事件列表
 */
const getCurrentDayEventList = (
  date: string,
  eventList: SourceEventType[]
): EventType[] => {
  const eventAll: EventType[] = [];
  eventList.forEach((event) => {
    const eventInfo: EventType = {
      ...event,
      hasLast: false,
      hasNext: false,
    };

    // 取昨天 23:59:59 为一天的开始时间，当天的 23:59:59 为一天的结束时间
    const currentDayStartTime = dayjs(`${date}`)
      .subtract(1, "second")
      .valueOf();
    const currentDayEndTime = dayjs(`${date} 23:59:59`).valueOf();

    const eventStartTime = dayjs(event.startTime).valueOf();
    const eventEndTime = dayjs(event.endTime).valueOf();

    // 判断当天是否有事件
    if (dayjs(date).isBetween(event.startTime, event.endTime, "d", "[]")) {
      // 添加连贯事件标识
      eventInfo.hasLast = eventStartTime < currentDayStartTime;
      eventInfo.hasNext = eventEndTime > currentDayEndTime;
      eventAll.push(eventInfo);
    }
  });

  // 按照渲染规则，排序渲染当天的事件
  // TODO: 可不可以搞一个洋葱模型，类似 compose结构，目前出参和入参都是同一个eventList
  return sortEventList(eventAll);
};

/**
 * 筛选每一天中有未来事件的 event
 * @param eventList
 */
const getHasNextEventList = (eventList: EventType[]): EventType[] => {
  return eventList.filter((eventItem) => {
    return eventItem.hasNext;
  });
};

/**
 * 基于 _index 确认每一天事件的展示顺序
 * @param dateIndex 日历每天的索引
 * @param nextEventList 每天中具有未来事件的二维list
 * @param eventAllList 当天的所有事件
 * @returns
 */
const handleSortIndexEventList = (
  dateIndex: number,
  nextEventList: EventType[][],
  eventAllList: EventType[]
): CalendarEventInfo[] => {
  // 上一天的所有事件
  const lastEvents = dateIndex > 0 ? nextEventList[dateIndex - 1] : [];
  // 最终渲染的事件
  const showEventList: EventType[] = [];

  // 与上一天事件有连贯的事件
  lastEvents.forEach((lastEvent) => {
    eventAllList.forEach((eventItem) => {
      // 同一个事件，并且上一天的事件已通过 _index 确认位置，那么今天的事件也要和上一天的 _index 一致
      if (lastEvent.id === eventItem.id && lastEvent._index !== undefined) {
        showEventList[lastEvent._index] = eventItem;
        eventItem._index = lastEvent._index;
      }
    });
  });

  // 处理当天的事件和与后一天有连续性的
  for (let index = 0; index < eventAllList.length; index++) {
    const eventItem = eventAllList[index];

    // 排除已经处理过的事件
    if (eventItem._index !== undefined) continue;

    let hasIndex = false;

    // 因为处理上一天的事件是通过 索引index 直接赋值的，showEventList 会存在 empty 元素
    for (let showIndex = 0; showIndex < showEventList.length; showIndex++) {
      // 如果有 empty 元素，那么填充当天事件
      if (!showEventList[showIndex]) {
        hasIndex = true;
        eventItem._index = showIndex;
        showEventList[showIndex] = eventItem;
        // 填充完 eventItem 就要 break 掉 showEventList 的循环，继续执行 外层的 eventAllList 循环处理下一个当天的事件
        break;
      }
    }

    // 没有空位 empyt 元素的，依次 push 进去
    if (!hasIndex) {
      eventItem._index = showEventList.length;
      showEventList.push(eventItem);
    }
  }

  return fixEmptyInfo(dateIndex, showEventList);
};

/**
 * 当新的一周时，就应该按照新的 _index 索引位置排序了，所以清空之前赋值过 _index，重新排 _index
 * 非新的一周，对于 empty 的元素，填充 null 值
 * @param dateIndex
 * @param eventList
 */
const fixEmptyInfo = (
  dateIndex: number,
  eventList: EventType[]
): Array<EventType | null> => {
  const showEventList: Array<EventType | null> = [];
  // 新的一周
  if (dateIndex % 7 === 0) {
    const list = [];
    // 只能通过 for 循环筛选出 empty 元素
    for (let index = 0; index < eventList.length; index++) {
      const eventItem = eventList[index];
      if (eventItem) {
        list.push(eventItem);
      }
    }
    list.forEach((eventItem, index) => {
      eventItem._index = index;
      showEventList.push(eventItem);
    });
  } else {
    // 如果还有 empty 的元素，那么填充 null
    for (let index = 0; index < eventList.length; index++) {
      const eventItem = eventList[index];
      showEventList[index] = eventItem ?? null;
    }
  }
  return showEventList;
};

/**
 * 按照规则渲染当天的所有事件,正数为正序，负数为倒序
 * 1. 优先渲染无连贯事件
 * 2. 渲染无 last 或者 无 next 的事件
 * 3. 按照渲染结束时间排序，结束时间长的优先渲染
 */
const sortEventList = (eventList: EventType[]): EventType[] => {
  return eventList.sort((a, b) => {
    if (a.hasLast) {
      if (!b.hasLast) {
        return -1;
      } else if (dayjs(a.endTime).valueOf() > dayjs(b.endTime).valueOf()) {
        return -1;
      }
    }
    if (a.hasNext) {
      if (!b.hasNext) {
        return -1;
      } else if (dayjs(a.endTime).valueOf() > dayjs(b.endTime).valueOf()) {
        return -1;
      }
    }
    return 1;
  });
};

/**
 * 获取当天的节日信息，优先返回公历节日信息
 * @param month 公历月
 * @param day 公历日
 * @param lMonth 农历月
 * @param lDay 农历日
 * @returns 节日
 */
const getFestivalName = (
  month: number,
  day: number,
  lMonth: number,
  lDay: number
): string => {
  const festivalInfo = festival[`${month}-${day}`];
  if (!isEmpty(festivalInfo)) {
    return festivalInfo.title;
  }

  const lFestivalInfo = lFestival[`${lMonth}-${lDay}`];
  if (!isEmpty(lFestivalInfo)) {
    return lFestivalInfo.title;
  }
  return "";
};

/**
 * @param year
 * @param month
 * @param startWeek 开始周是周一还是周日
 * @returns 当月的日历信息
 */
const getDateTimeList = (
  year: number,
  month: number,
  startWeek: StartWeekEnum
) => {
  const MAX_RENDER_COUNT = 42;

  let renderMonthList = [];

  const currentMonth = dayjs(`${year}${month}`);
  const lastMonth = dayjs(currentMonth).subtract(1, "M");
  const nextMonth = dayjs(currentMonth).add(1, "M");
  const isStartSunday = startWeek === StartWeekEnum.SUNDAY;
  // 获取当月的第一天是周几，dayjs 中 0 为周日
  let firstDaysWeek =
    dayjs(currentMonth).startOf("month").day() === 0
      ? 7
      : dayjs(currentMonth).startOf("month").day();
  // 这个值是个闭包，一直传到 getDateInfo 函数中进行累加
  let dateIndex = 0;
  if (firstDaysWeek !== 0) {
    // 处理上个月日期信息
    const lastMonthDays = lastMonth.daysInMonth();
    const startIndex = lastMonthDays - firstDaysWeek;
    for (
      let lastDayIndex = isStartSunday ? startIndex + 1 : startIndex + 2;
      lastDayIndex <= lastMonthDays;
      lastDayIndex++
    ) {
      const { year, month, day } = {
        year: lastMonth.get("y"),
        month: lastMonth.get("M") + 1,
        day: lastDayIndex,
      };
      renderMonthList.push(getDateInfo(year, month, day, dateIndex++, "LAST"));
    }
  }

  // 处理本月日期信息
  for (
    let currentDayIndex = 1;
    currentDayIndex <= currentMonth.daysInMonth();
    currentDayIndex++
  ) {
    const { year, month, day } = {
      year: currentMonth.get("y"),
      month: currentMonth.get("M") + 1,
      day: currentDayIndex,
    };
    renderMonthList.push(getDateInfo(year, month, day, dateIndex++));
  }

  const currentLength = renderMonthList.length;
  // 处理下一个月日期信息： 35 天 - 上月补位的天数 - 本月的所有天数 = 下月需要补位的天数
  if (currentLength <= MAX_RENDER_COUNT) {
    for (
      let nextDayIndex = 1;
      nextDayIndex <= MAX_RENDER_COUNT - currentLength;
      nextDayIndex++
    ) {
      const { year, month, day } = {
        year: nextMonth.get("y"),
        month: nextMonth.get("M") + 1,
        day: nextDayIndex,
      };
      renderMonthList.push(getDateInfo(year, month, day, dateIndex++, "NEXT"));
    }
  } else {
    renderMonthList = renderMonthList.splice(0, MAX_RENDER_COUNT);
  }

  return renderMonthList;
};

const getDateInfo = (
  year: number,
  month: number,
  day: number,
  dateLocalIndex: number,
  monthType?: "LAST" | "NEXT"
): CalendarInfoType => {
  /**
   * term 节气 string
   * dayCn 农历日中文名称 string
   * monthCn 农历月中文名称，如果为闰月，则会在月份前增加 闰 字 string
   * cMonth 公历月 number
   * lMonth 农历月 number
   * lDay 农历日 number
   * @doc：https://www.npmjs.com/package/solarlunar
   */
  const { term, dayCn, monthCn, lMonth, lDay } = solar2lunar(year, month, day);
  const date = dayjs(`${year}-${month}-${day}`).format("YYYY-MM-DD");
  const info = {
    monthCn,
    day,
    month,
    year,
    cName: term || (dayCn === "初一" ? monthCn : dayCn), // 优先展示节气，如果是初一，展示农历月份
    fullTime: date,
    festivalName: getFestivalName(month, day, lMonth, lDay),
    isAddtionalWorkday: isAddtionalWorkday(date),
    isHoliday: isHoliday(date),
    isLast: monthType === "LAST",
    isNext: monthType === "NEXT",
    dateIndex: dateLocalIndex,
  };
  return info;
};

const getPopoverPlacement = (dateIndex: number): PopoverPlacement => {
  const { rowNum, colNum } = getRowColNum(dateIndex);
  const isLastRow = rowNum === 6;
  const isRight = colNum < 3;
  let placement: Placement = isRight ? "right-start" : "left-start";

  if (isLastRow) {
    placement = isRight ? "right-end" : "left-end";
  }

  return {
    placement,
    rowNum,
    colNum,
  };
};

const getRowColNum = (
  dateIndex: number
): { colNum: number; rowNum: number } => {
  const rowNum = Math.ceil((dateIndex + 1) / 7); // 当前行
  const colNum = (dateIndex + 1) % 7 === 0 ? 7 : (dateIndex + 1) % 7; // 当前列
  return {
    rowNum,
    colNum,
  };
};

// 获取新增事件跨天拖拽时 popover 的 placement 信息
const getRangePopoverPlacement = (
  startDateIndex: number,
  endDateIndex: number
): {
  direction: "start" | "end"; // 以 start 还是 end 的 dom 节点作为弹出位置
  placement: Placement;
} => {
  const { rowNum: startRowNum, colNum: startColNum } =
    getRowColNum(startDateIndex);
  const { rowNum: endRowNum, colNum: endColNum } = getRowColNum(endDateIndex);

  const isLeftEndRow = startRowNum === 6;
  const isRightEndRow = endRowNum === 6;
  const isEndRow = isLeftEndRow || isRightEndRow;

  const toLeft = startColNum >= 3;
  const toRight = endColNum <= 4;

  // 判断事件的两侧是否有冗余空间，如果没有冗余空间，那么 popover 需要向上或者向下弹出
  const isRedundantSpace = toLeft || toRight;

  if (isRedundantSpace) {
    if (isEndRow) {
      // 如果左侧非末行，并且还有冗余空间，那么按照 left-start 处理
      const leftPlacement = isLeftEndRow ? "left-end" : "left-start";

      return {
        direction: toLeft ? "start" : "end",
        placement: toLeft ? leftPlacement : "right-end",
      };
    }
    return {
      direction: toLeft ? "start" : "end",
      placement: toLeft ? "left-start" : "right-start",
    };
  } else {
    return {
      direction: "start",
      placement: startRowNum <= 2 ? "bottom-start" : "top-start",
    };
  }
};

export {
  getRowColNum,
  getRenderEventList,
  getDateTimeList,
  getCurrentDayEventList,
  getHasNextEventList,
  handleSortIndexEventList,
  getPopoverPlacement,
  getRangePopoverPlacement,
};
