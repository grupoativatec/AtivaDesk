export type TrilhasCategory = {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  order: number;
};

export type TrilhasPostListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  updatedAt: Date;
  category: {
    name: string;
    slug: string;
    color: string | null;
  };
};

export type TrilhasPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  updatedAt: Date;
  category: {
    name: string;
    slug: string;
    color: string | null;
  };
  attachments: Array<{
    id: string;
    filename: string;
    url: string;
    mimeType: string;
    size: number;
  }>;
};
