<template>
  <div
    v-if="categories.length > 1"
    class="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40"
  >
    <div class="bg-background/95 backdrop-blur-sm border border-border/60 rounded-full px-4 py-2 shadow-lg">
      <nav class="flex items-center space-x-1">
        <button
          v-for="category in categories"
          :key="category"
          @click="scrollToCategory(category)"
          class="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
          :title="`Go to ${category}`"
        >
          {{ category }}
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BookmarksData } from '~/types'

interface Props {
  categories: string[]
  bookmarksData: BookmarksData | null
}

defineProps<Props>()

const scrollToCategory = (category: string) => {
  const element = document.getElementById(`category-${category}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>