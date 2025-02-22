import { ACCOUNT_TYPE } from "../utils/constants"


export const sidebarLinks = [
  {
    id: 1,
    name: "My Profile",
    path: "/dashboard/my-profile",
    icon: "VscAccount",
  },
  {
    id: 2,
    name: "All Tasks",
    path: "/dashboard/all-tasks",
    type: ACCOUNT_TYPE.ADMIN,
    icon: "VscTasklist",
  },
  {
    id: 3,
    name: "Add Task",
    path: "/dashboard/add-task",
    type: [ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.USER],
    icon: "VscAdd",
  },
  {
    id: 4,
    name: "My Tasks",
    path: "/dashboard/my-tasks",
    type: ACCOUNT_TYPE.USER,
    icon: "VscChecklist",
  },
];
