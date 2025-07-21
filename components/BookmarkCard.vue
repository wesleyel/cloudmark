<template>
  <div class="group relative h-full">
    <div class="relative h-full bg-card rounded-xl border border-border/60 hover:border-border/80 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md">
      <!-- 悬停时的渐变背景 -->
      <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <!-- 卡片内容 -->
      <div class="relative flex flex-col h-full p-6">
        <!-- 头部：图标和操作按钮 -->
        <div class="flex items-start justify-between gap-4 mb-4">
          <div class="flex-shrink-0">
            <img
              :src="bookmark.favicon"
              :alt="`${bookmark.title} favicon`"
              class="w-8 h-8 rounded-sm object-cover"
              loading="lazy"
              @error="onFaviconError"
            />
          </div>
          
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <DialogEdit
              :bookmark="bookmark"
              :mark="mark"
              :categories="categories"
              @bookmark-updated="(updatedBookmark) => $emit('bookmark-updated', updatedBookmark)"
            />
            <DialogDelete
              :bookmark="bookmark"
              :mark="mark"
              @bookmark-deleted="() => $emit('bookmark-deleted')"
            />
          </div>
        </div>

        <!-- 标题和链接 -->
        <div class="flex-1 min-h-0">
          <a
            :href="bookmark.url"
            target="_blank"
            rel="noopener noreferrer"
            class="block group-hover:text-primary transition-colors duration-200"
          >
            <h3 class="font-semibold text-lg mb-2 line-clamp-2 leading-tight">
              {{ bookmark.title }}
            </h3>
          </a>
          
          <!-- 描述 -->
          <p
            v-if="bookmark.description"
            class="text-muted-foreground text-sm line-clamp-3 mb-4"
          >
            {{ bookmark.description }}
          </p>
        </div>

        <!-- 底部：分类和时间 -->
        <div class="flex items-center justify-between gap-2 pt-4 border-t border-border/40">
          <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary/50 text-secondary-foreground">
            {{ bookmark.category }}
          </span>
          
          <time 
            :datetime="bookmark.createdAt"
            class="text-xs text-muted-foreground"
            :title="`Created: ${formatDate(bookmark.createdAt)}`"
          >
            {{ formatRelativeTime(bookmark.createdAt) }}
          </time>
        </div>
      </div>

      <!-- 外部链接指示器 -->
      <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Icon name="lucide:external-link" class="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BookmarkInstance } from '~/types'
import { format, formatDistanceToNow } from 'date-fns'

interface Props {
  bookmark: BookmarkInstance
  mark: string
  categories: string[]
}

interface Emits {
  (e: 'bookmark-updated', bookmark: BookmarkInstance): void
  (e: 'bookmark-deleted'): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

// Fallback for broken favicons
const onFaviconError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = `https://www.google.com/s2/favicons?domain=${getDomain(props.bookmark.url)}&sz=32`
}

// Date formatting utilities
const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'PPp')
}

const formatRelativeTime = (dateString: string) => {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true })
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>