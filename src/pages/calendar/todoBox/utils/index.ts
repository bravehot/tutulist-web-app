import { groupBy } from "lodash-es";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import updateLocale from "dayjs/plugin/updateLocale";

import { TodoSortList, TodoType } from "@/types/pages/todoBox";
import { StartWeekEnum } from "@/types/setting/calendar";

import useCalendarStore from "@/stores/calendar";

dayjs.extend(weekOfYear);

const isLast3Day = (
  time: string
): false | { name: string; weekName: string } => {
  const today = dayjs().format("YYYY-MM-DD");
  const diff = dayjs(today).diff(dayjs(time).format("YYYY-MM-DD"), "d");
  const weekName = getWeekName(time);
  switch (diff) {
    case 0:
      return {
        name: "今天",
        weekName,
      };
    case 1:
      return {
        name: "昨天",
        weekName,
      };
    case 2:
      return {
        name: "前天",
        weekName,
      };
    default:
      return false;
  }
};

const isLast2Week = (
  time: string
): { isThisWeek: boolean; isLastWeek: boolean; isOtherWeek: boolean } => {
  const calendarStore = useCalendarStore();
  dayjs.extend(updateLocale);
  dayjs.updateLocale("en", {
    weekStart: calendarStore.isStartSunday !== StartWeekEnum.SUNDAY ? 1 : 0,
  });
  const diffWeeks = dayjs(time).week() - dayjs().week();

  return {
    isThisWeek: diffWeeks === 0,
    isLastWeek: diffWeeks === -1,
    isOtherWeek: diffWeeks !== 0 && diffWeeks !== -1,
  };
};

const getWeekDay = (time: string) => {
  let weekDay = dayjs(time).get("day");
  const calendarStore = useCalendarStore();

  if (calendarStore.isStartSunday !== StartWeekEnum.SUNDAY) {
    if (weekDay !== 0) {
      weekDay -= 1;
    } else {
      weekDay = 6;
    }
  }
  return weekDay;
};

const getWeekName = (time: string) => {
  const weekDay = getWeekDay(time);
  const calendarStore = useCalendarStore();
  return calendarStore.weekList[weekDay];
};

const handleSortTodoList = (
  list: TodoType[]
): Array<{
  name: string;
  list: TodoSortList[];
}> | null => {
  if (list.length) {
    const group = groupBy(list, "time");
    const sortList = Object.keys(group)
      .map((key) => {
        return {
          time: key,
          list: group[key],
        };
      })
      .sort((a, b) => dayjs(b.time).valueOf() - dayjs(a.time).valueOf());

    const thisWeek: TodoSortList[] = [];
    const lastWeek: TodoSortList[] = [];
    const otherWeek: TodoSortList[] = [];
    sortList.forEach(({ time, list }) => {
      const { isThisWeek, isLastWeek } = isLast2Week(time);
      if (isThisWeek || isLastWeek) {
        const weekName = getWeekName(time);
        const timeInfo = isLast3Day(time);
        if (isThisWeek) {
          thisWeek.push({
            time: timeInfo
              ? `${weekName} ${timeInfo.name}`
              : `${weekName} ${dayjs(time).format("YYYY年MM月DD日")}`,
            list,
          });
        } else {
          lastWeek.push({
            time: timeInfo
              ? `${weekName} ${timeInfo.name}`
              : `${weekName} ${dayjs(time).format("YYYY年MM月DD日")}`,
            list,
          });
        }
      } else {
        otherWeek.push({
          time: dayjs(time).format("YYYY年MM月DD日"),
          list,
        });
      }
    });
    return [
      { name: "本周", list: thisWeek },
      { name: "上周", list: lastWeek },
      { name: "两周前", list: otherWeek },
    ];
  }
  return null;
};

export { handleSortTodoList };
