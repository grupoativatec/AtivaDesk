import { Clock, LayoutDashboard, Ticket, ListTodo } from "lucide-react";

export const data = {
  user: {
    name: "User",
    email: "user@example.com",
    avatar: "https://github.com/shadcn.png",
  },

  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Tickets",
      url: "/admin/tickets",
      icon: Ticket,
    },
    {
      title: "Tarefas",
      url: "/admin/tarefas",
      icon: ListTodo,
    },
  ],

  recentProjects: [
    {
      title: "Project 1",
      url: "/project1",
    },
  ],
};
