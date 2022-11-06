import { TodoFolder } from "@/types/pages/todoBox";
import type { UserInfo } from "../user";

export type GlobalStoreType = {
  theme: "dark" | null;
  userInfo: UserInfo | null;
  folderList: TodoFolder[];
};
