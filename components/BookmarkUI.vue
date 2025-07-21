<template>
  <div class="container relative">
    <!-- 悬浮导航 -->
    <FloatingNav :categories="validCategories" :bookmarks-data="bookmarksData" />

    <!-- 装饰背景元素 -->
    <div class="fixed inset-0 -z-10">
      <div class="absolute top-0 right-0 w-[40rem] h-[40rem] bg-blue-500/10 rounded-full blur-3xl transform -translate-y-12 translate-x-12" />
      <div class="absolute bottom-0 left-0 w-[50rem] h-[50rem] bg-purple-500/10 rounded-full blur-3xl transform translate-y-12 -translate-x-12" />
      <div class="absolute bottom-1/3 right-1/4 w-[30rem] h-[30rem] bg-indigo-500/5 rounded-full blur-3xl" />
    </div>

    <div class="py-12 lg:py-16 scroll-smooth">
      <DemoBanner :mark="mark" />

      <!-- 标题区域 -->
      <div class="title-area flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <div class="title-text flex items-center gap-2 mb-2">
            <h1 class="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
              {{ $t('BookmarksPage.title') }}
            </h1>
          </div>
          <p class="subtitle-text text-muted-foreground">
            {{ $t('BookmarksPage.collection', { mark }) }}
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          <DialogAdd
            :mark="mark"
            :categories="categories"
            @bookmark-added="onBookmarkAdded"
          />

          <div>
            <BookmarkletButton :mark="mark" :base-url="baseUrl" />
            <div class="hidden sm:flex items-center mt-1 text-xs text-muted-foreground">
              <span class="animate-pulse">↑</span>
              <span class="ml-1">{{ $t('BookmarksPage.dragTip') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 书签列表 -->
      <div v-if="bookmarksData && bookmarksData.bookmarks.length > 0 && validCategories.length > 0" class="stagger-container space-y-8">
        <div
          v-for="(category, categoryIndex) in validCategories"
          :key="category"
          :id="`category-${category}`"
          :class="`stagger-item delay-${categoryIndex * 100} overflow-hidden scroll-mt-24`"
        >
          <template v-if="getCategoryBookmarks(category).length > 0">
            <div class="flex items-center gap-2 mb-4">
              <div class="flex items-center px-3 py-1.5 bg-primary/10 text-primary rounded-lg">
                <Icon name="lucide:layers" class="h-4 w-4 mr-2 opacity-70" />
                <h3 class="text-md font-medium">{{ category }}</h3>
              </div>
              <div class="text-sm text-muted-foreground">
                ({{ getCategoryBookmarks(category).length }})
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="(bookmark, index) in getCategoryBookmarks(category)"
                :key="bookmark.uuid"
                :class="`h-full w-full delay-${(index % 9) * 100}`"
              >
                <BookmarkCard
                  :bookmark="bookmark"
                  :mark="mark"
                  :categories="categories"
                  @bookmark-updated="onUpdateBookmark"
                  @bookmark-deleted="() => onDeleteBookmark(bookmark.uuid)"
                />
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state text-center py-16 px-4">
        <div class="max-w-md mx-auto">
          <div class="bg-card/50 backdrop-blur-sm border border-border/60 rounded-xl p-8 shadow-sm">
            <div class="flex justify-center mb-4">
              <div class="relative w-16 h-16 flex items-center justify-center">
                <div class="absolute inset-0 bg-blue-500/10 rounded-full blur-md"></div>
                <Icon name="lucide:search" class="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <p class="text-muted-foreground text-lg mb-6">
              {{ $t('BookmarksPage.noBookmarks') }}
            </p>
            <div class="hover-scale flex justify-center">
              <DialogAdd
                :mark="mark"
                :categories="categories"
                @bookmark-added="onBookmarkAdded"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BookmarkInstance, BookmarksData } from '~/types'

interface Props {
  mark: string
  bookmarksData: BookmarksData | null
  categories: string[]
  baseUrl: string
}

const props = defineProps<Props>()

const { t } = useI18n()

// Reactive state
const currentBookmarksData = ref<BookmarksData | null>(props.bookmarksData)

// Computed properties
const validCategories = computed(() => 
  props.categories.filter((cat) => cat.trim() !== "")
)

// Methods
const getCategoryBookmarks = (category: string) => {
  if (!currentBookmarksData.value) return []
  return currentBookmarksData.value.bookmarks.filter(
    (b) => b.category === category
  )
}

const refreshBookmarks = () => {
  navigateTo(`/${props.mark}`)
}

const onBookmarkAdded = (bookmark: BookmarkInstance) => {
  if (currentBookmarksData.value) {
    currentBookmarksData.value = {
      ...currentBookmarksData.value,
      bookmarks: [...currentBookmarksData.value.bookmarks, bookmark],
    }
    refreshBookmarks()
  }
}

const onUpdateBookmark = (bookmark: BookmarkInstance) => {
  if (currentBookmarksData.value) {
    currentBookmarksData.value = {
      ...currentBookmarksData.value,
      bookmarks: currentBookmarksData.value.bookmarks.map((b) =>
        b.uuid === bookmark.uuid ? bookmark : b
      ),
    }
    refreshBookmarks()
  }
}

const onDeleteBookmark = (uuid: string) => {
  if (currentBookmarksData.value) {
    currentBookmarksData.value = {
      ...currentBookmarksData.value,
      bookmarks: currentBookmarksData.value.bookmarks.filter(
        (b) => b.uuid !== uuid
      ),
    }
    refreshBookmarks()
  }
}

// Watch for props changes
watch(() => props.bookmarksData, (newData) => {
  currentBookmarksData.value = newData
})
</script>