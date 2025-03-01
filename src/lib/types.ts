export interface BookmarkInstance {
  uuid: string;
  url: string;
  title: string;
  favicon?: string;
  createdAt: string;
  modifiedAt: string;
  category: string;
  description?: string; // 添加可选的描述字段
}

export type InsertBookmarkInstance = Omit<
  BookmarkInstance,
  "uuid" | "createdAt" | "modifiedAt" | "favicon"
> & {
  mark: string;
};

export type UpdateBookmarkInstance = Omit<
  BookmarkInstance,
  "createdAt" | "modifiedAt" | "favicon"
> & {
  mark: string;
};

export interface BookmarksData {
  mark: string;
  bookmarks: BookmarkInstance[];
}

export const defaultMark = "default";
export const defaultCategory = "default";

export function createDefaultBookmarksData(mark: string): BookmarksData {
  return {
    mark,
    bookmarks: [],
  };
}
