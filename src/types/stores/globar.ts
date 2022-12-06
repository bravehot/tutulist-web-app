import { TodoFolder } from "@/types/pages/todoBox";
import { ThemeEnum } from "../enum";
import type { UserInfo } from "../user";

export type GlobalStoreType = {
  theme: "dark" | null;
  userInfo: UserInfo | null;
  folderList: TodoFolder[];
  settingTheme: ThemeEnum;
};
