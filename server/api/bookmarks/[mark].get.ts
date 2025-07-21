import type { BookmarksData } from '~/types'
import { isDemoMark } from '~/types'
import { DEMO_BOOKMARKS_DATA } from '~/data/demo'

export default defineEventHandler(async (event) => {
  const mark = getRouterParam(event, 'mark')
  
  if (!mark) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Mark parameter is required'
    })
  }

  const isDemo = isDemoMark(mark)
  if (isDemo) {
    return DEMO_BOOKMARKS_DATA
  }

  try {
    // For Cloudflare KV storage
    const env = event.context.cloudflare?.env
    if (!env?.cloudmark) {
      throw createError({
        statusCode: 500,
        statusMessage: 'KV storage not available'
      })
    }

    const bookmarksData = await env.cloudmark.get<BookmarksData>(mark, 'json')
    
    if (!bookmarksData) {
      return null
    }

    return bookmarksData
  } catch (error) {
    console.error('Error fetching bookmarks:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch bookmarks'
    })
  }
})