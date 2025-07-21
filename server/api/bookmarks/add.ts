import type { BookmarkInstance, BookmarksData } from '~/types'
import { isDemoMark, defaultCategory } from '~/types'
import { bookmarkSchema } from '~/utils/schema'

function generateUUID(): string {
  return crypto.randomUUID()
}

function createDefaultBookmarksData(mark: string): BookmarksData {
  return {
    mark,
    bookmarks: [],
  }
}

async function getFavicon(url: string, size: number = 64): Promise<string> {
  const domain = new URL(url).hostname.replace("www.", "")
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  
  if (method === 'GET') {
    // Handle bookmarklet GET request
    const query = getQuery(event)
    const { mark, title = 'Untitled', url } = query
    
    if (!mark || !url) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Mark and URL parameters are required'
      })
    }

    const formData = {
      mark: mark as string,
      url: url as string,
      title: title as string,
      category: defaultCategory
    }

    // Validate data
    const result = bookmarkSchema.safeParse(formData)
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
        statusMessage: 'Demo mode - cannot add bookmarks'
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

      let bookmarksData = await env.cloudmark.get<BookmarksData>(data.mark, 'json')
      if (!bookmarksData) {
        bookmarksData = createDefaultBookmarksData(data.mark)
      }

      // Check if bookmark already exists
      if (bookmarksData.bookmarks.find((b) => b.url === data.url)) {
        throw createError({
          statusCode: 409,
          statusMessage: `Bookmark ${data.title} (${data.url}) already exists`
        })
      }

      const uuid = generateUUID()
      const favicon = await getFavicon(data.url)
      const newBookmark: BookmarkInstance = {
        uuid,
        url: data.url,
        title: data.title,
        description: data.description || '',
        category: data.category,
        favicon,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      }

      bookmarksData.bookmarks.push(newBookmark)
      await env.cloudmark.put(data.mark, JSON.stringify(bookmarksData))

      // Redirect back to bookmark page with success message
      return sendRedirect(event, `/${data.mark}?status=success&message=${encodeURIComponent('Bookmark added successfully')}`)
    } catch (error: any) {
      console.error('Error adding bookmark:', error)
      return sendRedirect(event, `/${data.mark}?status=error&message=${encodeURIComponent(error.message || 'Failed to add bookmark')}`)
    }
  }

  if (method === 'POST') {
    // Handle form POST request
    const body = await readBody(event)
    
    // Validate data
    const result = bookmarkSchema.safeParse(body)
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
        statusMessage: 'Demo mode - cannot add bookmarks'
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

      let bookmarksData = await env.cloudmark.get<BookmarksData>(data.mark, 'json')
      if (!bookmarksData) {
        bookmarksData = createDefaultBookmarksData(data.mark)
      }

      // Check if bookmark already exists
      if (bookmarksData.bookmarks.find((b) => b.url === data.url)) {
        throw createError({
          statusCode: 409,
          statusMessage: `Bookmark ${data.title} (${data.url}) already exists`
        })
      }

      const uuid = generateUUID()
      const favicon = await getFavicon(data.url)
      const newBookmark: BookmarkInstance = {
        uuid,
        url: data.url,
        title: data.title,
        description: data.description || '',
        category: data.category,
        favicon,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      }

      bookmarksData.bookmarks.push(newBookmark)
      await env.cloudmark.put(data.mark, JSON.stringify(bookmarksData))

      return newBookmark
    } catch (error: any) {
      console.error('Error adding bookmark:', error)
      throw createError({
        statusCode: 500,
        statusMessage: error.message || 'Failed to add bookmark'
      })
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method not allowed'
  })
})