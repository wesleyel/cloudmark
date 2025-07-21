<template>
  <div class="container relative">
    <!-- 装饰背景元素 -->
    <div class="fixed inset-0 -z-10">
      <div class="absolute top-0 right-0 w-[40rem] h-[40rem] bg-blue-500/10 rounded-full blur-3xl transform -translate-y-12 translate-x-12" />
      <div class="absolute bottom-0 left-0 w-[50rem] h-[50rem] bg-purple-500/10 rounded-full blur-3xl transform translate-y-12 -translate-x-12" />
    </div>

    <div class="py-12 lg:py-16">
      <!-- 标题 -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 mb-4">
          {{ $t('DocPage.title') }}
        </h1>
        <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
          {{ $t('DocPage.description') }}
        </p>
      </div>

      <!-- 快速开始步骤 -->
      <div class="max-w-4xl mx-auto">
        <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <!-- 步骤1 -->
          <div class="bg-card rounded-xl border border-border/60 p-6 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <span class="text-blue-500 font-bold">1</span>
              </div>
              <h3 class="text-lg font-semibold">{{ $t('DocPage.step1.title') }}</h3>
            </div>
            <p class="text-muted-foreground mb-4">{{ $t('DocPage.step1.description') }}</p>
            <div class="space-y-2">
              <input
                v-model="customMark"
                type="text"
                :placeholder="$t('DocPage.step1.placeholder')"
                class="w-full px-3 py-2 text-sm border border-input rounded-md bg-background"
                @input="generateBookmarkletUrl"
              />
              <button
                @click="generateRandomMarkId"
                class="w-full px-3 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
              >
                {{ $t('DocPage.step1.random') }}
              </button>
            </div>
          </div>

          <!-- 步骤2 -->
          <div class="bg-card rounded-xl border border-border/60 p-6 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <span class="text-green-500 font-bold">2</span>
              </div>
              <h3 class="text-lg font-semibold">{{ $t('DocPage.step2.title') }}</h3>
            </div>
            <p class="text-muted-foreground mb-4">{{ $t('DocPage.step2.description') }}</p>
            <div v-if="bookmarkletUrl" class="space-y-2">
              <div class="p-3 bg-secondary/50 rounded-md border border-dashed border-border">
                <a
                  :href="bookmarkletUrl"
                  @click.prevent="copyBookmarklet"
                  class="text-sm text-blue-600 hover:text-blue-700 break-all cursor-pointer"
                  :title="$t('DocPage.step2.dragTip')"
                >
                  📚 Save to {{ customMark || 'my-bookmarks' }}
                </a>
              </div>
              <p class="text-xs text-muted-foreground">{{ $t('DocPage.step2.dragTip') }}</p>
            </div>
          </div>

          <!-- 步骤3 -->
          <div class="bg-card rounded-xl border border-border/60 p-6 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                <span class="text-purple-500 font-bold">3</span>
              </div>
              <h3 class="text-lg font-semibold">{{ $t('DocPage.step3.title') }}</h3>
            </div>
            <p class="text-muted-foreground mb-4">{{ $t('DocPage.step3.description') }}</p>
            <div v-if="bookmarksUrl" class="space-y-2">
              <NuxtLink
                :to="bookmarksUrl"
                class="inline-block w-full px-3 py-2 text-sm text-center bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                {{ $t('DocPage.step3.visit') }}
              </NuxtLink>
              <p class="text-xs text-muted-foreground break-all">{{ baseUrl }}{{ bookmarksUrl }}</p>
            </div>
          </div>
        </div>

        <!-- 特性说明 -->
        <div class="mt-16">
          <h2 class="text-2xl font-bold text-center mb-8">{{ $t('DocPage.features.title') }}</h2>
          <div class="grid gap-6 md:grid-cols-2">
            <div
              v-for="(feature, index) in features"
              :key="index"
              class="flex gap-4 p-6 bg-card/50 rounded-xl border border-border/60"
            >
              <div class="flex-shrink-0">
                <Icon :name="feature.icon" class="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 class="font-semibold mb-2">{{ feature.title }}</h3>
                <p class="text-muted-foreground text-sm">{{ feature.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 示例 -->
        <div class="mt-16 text-center">
          <h2 class="text-2xl font-bold mb-4">{{ $t('DocPage.demo.title') }}</h2>
          <p class="text-muted-foreground mb-6">{{ $t('DocPage.demo.description') }}</p>
          <NuxtLink
            to="/demo"
            class="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <Icon name="lucide:play" class="h-4 w-4" />
            {{ $t('DocPage.demo.button') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner'

const { t } = useI18n()

// Reactive state
const customMark = ref('')
const bookmarkletUrl = ref('')
const bookmarksUrl = ref('')
const baseUrl = getBaseUrl()

// Features data
const features = computed(() => [
  {
    icon: 'lucide:shield-check',
    title: t('DocPage.features.noRegistration.title'),
    description: t('DocPage.features.noRegistration.description')
  },
  {
    icon: 'lucide:bookmark-plus',
    title: t('DocPage.features.oneClick.title'),
    description: t('DocPage.features.oneClick.description')
  },
  {
    icon: 'lucide:tag',
    title: t('DocPage.features.categories.title'),
    description: t('DocPage.features.categories.description')
  },
  {
    icon: 'lucide:globe',
    title: t('DocPage.features.crossDevice.title'),
    description: t('DocPage.features.crossDevice.description')
  }
])

// Methods
const generateRandomMarkId = () => {
  customMark.value = generateRandomMark()
  generateBookmarkletUrl()
}

const generateBookmarkletUrl = () => {
  const mark = customMark.value || 'my-bookmarks'
  bookmarkletUrl.value = `javascript:(function(){let m='${mark}',u=encodeURIComponent(location.href),t=encodeURIComponent(document.title);window.open('${baseUrl}/api/bookmarks/add?mark='+m+'&title='+t+'&url='+u, '_blank').focus()})()`
  bookmarksUrl.value = `/${mark}`
}

const copyBookmarklet = async () => {
  try {
    await navigator.clipboard.writeText(bookmarkletUrl.value)
    toast.success(t('DocPage.step2.copied'))
  } catch (error) {
    toast.error(t('DocPage.step2.copyFailed'))
  }
}

// Initialize with random mark
onMounted(() => {
  generateRandomMarkId()
})

// SEO
useHead({
  title: 'Quick Start Guide | Cloudmark',
  meta: [
    {
      name: 'description',
      content: 'Learn how to use Cloudmark in 3 simple steps. Create your bookmark collection and start saving links instantly.'
    }
  ]
})
</script>