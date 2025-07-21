import type { BookmarksData } from '~/types'
import { isDemoMark } from '~/types'
import { deleteBookmarkSchema } from '~/utils/schema'

export default defineEventHandler(async (event) => {
  if (getMethod(event) !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    })
  }

  const body = await readBody(event)
  
  // Validate data
  const result = deleteBookmarkSchema.safeParse(body)
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
      statusMessage: 'Demo mode - cannot delete bookmarks'
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

    bookmarksData.bookmarks.splice(bookmarkIndex, 1)
    await env.cloudmark.put(data.mark, JSON.stringify(bookmarksData))

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting bookmark:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to delete bookmark'
    })
  }
})