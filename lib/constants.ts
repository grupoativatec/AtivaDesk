import { Clock, LayoutDashboard, Ticket, ListTodo, FolderKanban, Columns3 } from "lucide-react";

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
    {
      title: "Projetos",
      url: "/admin/projetos",
      icon: FolderKanban,
    },
    {
      title: "Kanban",
      url: "/admin/kanban",
      icon: Columns3,
    },
  ],

  recentProjects: [
    {
      title: "Project 1",
      url: "/project1",
    },
  ],
};
