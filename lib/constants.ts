import {
  Clock,
  LayoutDashboard,
  Ticket,
  ListTodo,
  FolderKanban,
  Columns3,
  FileText,
  Users,
  Key,
  Book,
} from "lucide-react";

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
      title: "Projetos",
      url: "/admin/projetos",
      icon: FolderKanban,
    },
    {
      title: "Tarefas",
      url: "/admin/tarefas",
      icon: ListTodo,
    },
    {
      title: "Kanban",
      url: "/admin/kanban",
      icon: Columns3,
    },
    {
      title: "Documentação",
      url: "/admin/docs",
      icon: FileText,
    },
    {
      title: "Usuários",
      url: "/admin/users",
      icon: Users,
    },
    {
      title: "Acessos",
      url: "/admin/acessos",
      icon: Key,
    },
    {
      title: "Trilhas",
      url: "/admin/trilhas",
      icon: Book,
    },
  ],

  recentProjects: [
    {
      title: "Project 1",
      url: "/project1",
    },
  ],
};
