import type { BookmarkInstance, BookmarksData } from '~/types'
import { isDemoMark } from '~/types'
import { updateBookmarkSchema } from '~/utils/schema'

export default defineEventHandler(async (event) => {
  if (getMethod(event) !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    })
  }

  const body = await readBody(event)
  
  // Validate data
  const result = updateBookmarkSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid data: ' + result.error.message
    })
  }

  const data = result.data
  const isDemo = isDemoMark(data.mark)
  
  if (isDemo) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Demo mode - cannot update bookmarks'
    })
  }

  try {
    const env = event.context.cloudflare?.env
    if (!env?.cloudmark) {
      throw createError({
        statusCode: 500,
        statusMessage: 'KV storage not available'
      })
    }

    const bookmarksData = await env.cloudmark.get<BookmarksData>(data.mark, 'json')
    if (!bookmarksData) {
      throw createError({
        statusCode: 404,
        statusMessage: `Bookmarks data for mark ${data.mark} not found`
      })
    }

    const bookmarkIndex = bookmarksData.bookmarks.findIndex(
      (b) => b.uuid === data.uuid
    )
    if (bookmarkIndex === -1) {
      throw createError({
        statusCode: 404,
        statusMessage: `Bookmark with UUID ${data.uuid} not found`
      })
    }

    const updatedBookmark: BookmarkInstance = {
      ...bookmarksData.bookmarks[bookmarkIndex],
      url: data.url,
      title: data.title,
      description: data.description || '',
      category: data.category,
      modifiedAt: new Date().toISOString(),
    }

    bookmarksData.bookmarks[bookmarkIndex] = updatedBookmark
    await env.cloudmark.put(data.mark, JSON.stringify(bookmarksData))

    return updatedBookmark
  } catch (error: any) {
    console.error('Error updating bookmark:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to update bookmark'
    })
  }
})