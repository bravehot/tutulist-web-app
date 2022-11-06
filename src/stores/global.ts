import { defineStore } from "pinia";
import { getFolderListRequest } from "@/service/calendar/todoBox";

import type { GlobalStoreType } from "@/types/stores/globar";
import { UserGenderEnum, UserInfo, UserTokenEnum } from "@/types/user";
import { TodoFolder } from "@/types/pages/todoBox";

import useCalendarStore from "./calendar";
import { getUserInfo } from "@/service/user";

const useGlobalStore = defineStore("global", {
  state: (): GlobalStoreType => ({
    theme: null,
    userInfo: null,
    folderList: [],
  }),
  actions: {
    setFolderList(foderList: TodoFolder[]) {
      this.folderList = foderList;
    },
    handleTheme(themeType: "dark" | null) {
      this.theme = themeType === "dark" ? "dark" : null;
      if (themeType) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },

    setUserInfo(info: UserInfo | null) {
      this.userInfo = info;
    },

    updateUserInfo(info: {
      avatar: string;
      username: string;
      gender: UserGenderEnum;
    }) {
      if (this.userInfo) {
        this.userInfo.avatar = info.avatar;
        this.userInfo.username = info.username;
        this.userInfo.gender = info.gender;
      }
    },
    handleLogout() {
      this.userInfo = null;
      window.localStorage.removeItem(UserTokenEnum.ASSET_TOKEN);
      window.localStorage.removeItem(UserTokenEnum.REFRESH_TOKEN);
    },

    async getInitialInfo() {
      const calendarStore = useCalendarStore();

      await this.getCurrentUserInfo();
      await this.getFolderList();
      await calendarStore.getCalendarSetting();
    },

    async getFolderList() {
      const { code, data } = await getFolderListRequest();
      if (code === 200) {
        this.folderList = data.sort((a, b) => a.sortIndex - b.sortIndex);
      }
    },

    async getCurrentUserInfo() {
      const { code, data } = await getUserInfo();
      if (code === 200) {
        this.userInfo = data;
      }
    },
  },
});

export default useGlobalStore;
