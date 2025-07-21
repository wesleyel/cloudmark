<template>
  <div class="container relative">
    <!-- 装饰背景元素 -->
    <div class="fixed inset-0 -z-10">
      <div class="absolute top-0 right-0 w-[40rem] h-[40rem] bg-blue-500/10 rounded-full blur-3xl transform -translate-y-12 translate-x-12" />
      <div class="absolute bottom-0 left-0 w-[50rem] h-[50rem] bg-purple-500/10 rounded-full blur-3xl transform translate-y-12 -translate-x-12" />
      <div class="absolute bottom-1/3 right-1/4 w-[30rem] h-[30rem] bg-indigo-500/5 rounded-full blur-3xl" />
    </div>

    <!-- Hero 区域 -->
    <div class="flex flex-col items-center text-center pt-16 lg:pt-24 pb-8 max-w-3xl mx-auto animate-fadeIn">
      <!-- Logo 和主标题 -->
      <div class="relative mb-3 animate-scaleIn">
        <h1 class="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
          Cloudmark
        </h1>
        <div class="absolute -inset-1 bg-blue-500/20 rounded-full blur-xl -z-10" />
      </div>

      <h2 class="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 animate-fadeIn animation-delay-400">
        {{ $t('HomePage.title') }}
      </h2>

      <p class="text-xl text-muted-foreground mb-8 max-w-xl animate-fadeIn animation-delay-600">
        {{ $t('HomePage.description') }}
      </p>

      <!-- GitHub Star Badge -->
      <div class="mb-8 animate-fadeIn animation-delay-700">
        <a
          href="https://github.com/wesleyel/cloudmark"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="https://img.shields.io/github/stars/wesleyel/cloudmark?style=social"
            alt="GitHub stars"
            class="transition-transform hover:scale-105"
          />
        </a>
      </div>

      <div class="flex gap-4">
        <div class="animate-fadeUp animation-delay-800 hover-scale active-scale">
          <NuxtLink
            to="/doc"
            class="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-base font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            {{ $t('HomePage.quickstart') }}
            <Icon name="lucide:arrow-right" class="h-4 w-4" />
          </NuxtLink>
        </div>

        <div class="animate-fadeUp animation-delay-900 hover-scale active-scale">
          <NuxtLink
            to="/demo"
            class="inline-flex items-center gap-2 rounded-full border border-input bg-background px-8 py-3 text-base font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Demo
            <Icon name="lucide:external-link" class="h-4 w-4" />
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- 特性卡片 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-12 stagger-container">
      <div
        v-for="(key, index) in featureKeys"
        :key="key"
        :class="`relative rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm p-6 transition-all stagger-item feature-card animation-delay-${index * 100}`"
      >
        <div class="absolute top-0 right-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-lg -z-10 transform -translate-y-1/4 translate-x-1/4" />
        <h3 class="font-semibold mb-3 text-xl">
          {{ $t(`HomePage.features.${key}.title`) }}
        </h3>
        <p class="text-muted-foreground">
          {{ $t(`HomePage.features.${key}.desc`) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

// Get feature keys dynamically from the translation messages
const featureKeys = computed(() => {
  const messages = (useNuxtApp().$i18n as any).getLocaleMessage(useI18n().locale.value)
  return Object.keys(messages.HomePage?.features || {})
})

// SEO
useHead({
  title: 'Cloudmark - Your Universal Bookmark Manager',
  meta: [
    {
      name: 'description',
      content: 'Save and access your bookmarks from anywhere with Cloudmark, the seamless cloud bookmarking tool for professionals and casual users alike'
    },
    {
      property: 'og:title',
      content: 'Cloudmark - Your Universal Bookmark Manager'
    },
    {
      property: 'og:description',
      content: 'Save and access your bookmarks from anywhere with Cloudmark'
    },
    {
      property: 'og:image',
      content: '/og-image-en.png'
    }
  ]
})
</script>