export const defaultMark = "demo";
export const defaultCategory = "General";

export interface BookmarkInstance {
  uuid: string;
  url: string;
  title: string;
  description: string;
  category: string;
  favicon: string;
  createdAt: string;
  modifiedAt: string;
}

export interface BookmarksData {
  mark: string;
  bookmarks: BookmarkInstance[];
}

export function isDemoMark(mark: string): boolean {
  return mark === defaultMark;
}

export interface Toast {
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
}

export interface BookmarkFormData {
  mark: string;
  url: string;
  title: string;
  description?: string;
  category: string;
  uuid?: string;
}