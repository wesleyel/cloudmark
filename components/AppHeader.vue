<template>
  <header class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="container flex h-14 items-center">
      <!-- Logo -->
      <NuxtLink
        to="/"
        class="flex items-center space-x-2 transition-transform duration-200 hover:scale-105"
      >
        <img
          src="/icon1.svg"
          alt="Cloudmark logo"
          width="24"
          height="24"
          class="h-6 w-6 text-primary"
        />
        <span class="font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
          Cloudmark
        </span>
      </NuxtLink>

      <!-- Navigation -->
      <nav class="ml-auto flex gap-2 sm:gap-4 items-center">
        <NuxtLink
          to="/doc"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors duration-200"
          prefetch
        >
          <Icon name="lucide:file-text" class="h-4 w-4" />
          <span class="hidden sm:inline">{{ $t('Navigation.quickstart') }}</span>
        </NuxtLink>
        
        <NuxtLink
          to="https://github.com/wesleyel/cloudmark"
          external
          target="_blank"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors duration-200"
        >
          <Icon name="lucide:github" class="h-4 w-4" />
          <span class="hidden sm:inline">{{ $t('Navigation.github') }}</span>
        </NuxtLink>
        
        <div class="pl-1 border-border/40">
          <LanguageSwitcher />
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>