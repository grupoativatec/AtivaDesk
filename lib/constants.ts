import { Clock, LayoutDashboard } from "lucide-react";

export const data = {
  user: {
    name: "User",
    email: "user@example.com",
    avatar: "https://github.com/shadcn.png",
  },

  navMain: [
    {
      title: "TEST",
      url: "/test",
      icon: Clock,
    },
    {
      title: "dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
  ],

  recentProjects: [
    {
      title: "Project 1",
      url: "/project1",
    },
  ],
};
