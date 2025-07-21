<template>
  <div>
    <BookmarkUI 
      :mark="mark"
      :bookmarks-data="bookmarksData"
      :categories="categories"
      :base-url="baseUrl"
    />
  </div>
</template>

<script setup lang="ts">
import type { BookmarksData } from '~/types'

const route = useRoute()
const mark = route.params.mark as string

// Fetch bookmark data
const { data: bookmarksData } = await useFetch<BookmarksData | null>(`/api/bookmarks/${mark}`)

// Get categories
const categories = computed(() => getCategories(bookmarksData.value))

// Get base URL
const baseUrl = getBaseUrl()

// SEO
useHead({
  title: `Bookmarks - ${mark} | Cloudmark`,
  meta: [
    {
      name: 'description',
      content: `Bookmark collection for ${mark} - Cloudmark`
    }
  ]
})

// Handle URL query parameters for toast messages
const query = route.query
if (query.status && query.message) {
  const { $toast } = useNuxtApp()
  const variant = query.status === 'success' ? 'success' : 
                 query.status === 'error' ? 'error' : 
                 query.status === 'warning' ? 'warning' : 'info'
  
  const message = decodeURIComponent(query.message as string)
  
  nextTick(() => {
    $toast[variant](message)
  })
}
</script>