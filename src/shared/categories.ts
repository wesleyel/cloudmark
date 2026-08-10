import { type BookmarksData, defaultCategory } from "./types";

/** Compute the ordered list of categories (default first, then unique others). */
export const getCategories = (bookmarksdata: BookmarksData | null) => {
  if (!bookmarksdata) {
    return [defaultCategory];
  }

  const uniqueCategories = [
    ...new Set(bookmarksdata.bookmarks.map((bookmark) => bookmark.category)),
  ];

  if (!uniqueCategories.includes(defaultCategory)) {
    return [defaultCategory, ...uniqueCategories];
  }

  return [
    defaultCategory,
    ...uniqueCategories.filter((category) => category !== defaultCategory),
  ];
};
