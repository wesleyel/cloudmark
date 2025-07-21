import { z } from 'zod'

export const bookmarkSchema = z.object({
  mark: z.string().min(1, 'Mark is required'),
  url: z.string().url('Invalid URL'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
})

export const updateBookmarkSchema = bookmarkSchema.extend({
  uuid: z.string().min(1, 'UUID is required'),
})

export const deleteBookmarkSchema = z.object({
  mark: z.string().min(1, 'Mark is required'),
  uuid: z.string().min(1, 'UUID is required'),
})

export type BookmarkFormData = z.infer<typeof bookmarkSchema>
export type UpdateBookmarkFormData = z.infer<typeof updateBookmarkSchema>
export type DeleteBookmarkFormData = z.infer<typeof deleteBookmarkSchema>