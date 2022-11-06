import { defineStore } from "pinia";
import { cloneDeep } from "lodash-es";

import { weekList } from "@/pages/calendar/home/constant/index";
import { StartWeekEnum, WeekNameEnum } from "@/types/setting/calendar";

import { getSettingInfo } from "@/service/setting";

const useCalendarStore = defineStore("calendar", {
  state: () => ({
    weekList,
    isStartSunday: StartWeekEnum.MONDAY,
    isStarWeek: WeekNameEnum.WEEK,
  }),
  actions: {
    setWeekList() {
      const isStartSunday = this.isStartSunday === StartWeekEnum.SUNDAY;
      const isStarWeek = this.isStarWeek === WeekNameEnum.STAR_WEEK;

      let selectWeekList = cloneDeep(weekList);
      if (isStartSunday) {
        selectWeekList = [...selectWeekList.splice(-1, 1), ...selectWeekList];
      }
      if (isStarWeek) {
        selectWeekList = selectWeekList.map((weekName) => `星期${weekName}`);
      } else {
        selectWeekList = selectWeekList.map((weekName) => `周${weekName}`);
      }
      this.weekList = selectWeekList;
    },

    setStartSunday(startSunday: StartWeekEnum) {
      this.isStartSunday = startSunday;
      this.setWeekList();
    },

    setStarWeek(starWeek: WeekNameEnum) {
      this.isStarWeek = starWeek;
      this.setWeekList();
    },

    async getCalendarSetting() {
      const { code, data } = await getSettingInfo();
      if (code === 200) {
        this.setStartSunday(data.startWeek);
        this.setStarWeek(data.weekName);
      }
    },
  },
});

export default useCalendarStore;
