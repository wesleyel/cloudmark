<template>
  <div class="min-h-screen flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,rgba(147,51,234,0.15),transparent_70%),radial-gradient(ellipse_at_right,rgba(59,130,246,0.15),transparent_70%)]">
    <!-- Header -->
    <AppHeader />
    
    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>
    
    <!-- Footer -->
    <AppFooter />
    
    <!-- Toast Provider -->
    <Toaster />
  </div>
</template>

<script setup lang="ts">
import { Toaster } from 'vue-sonner'

useHead({
  htmlAttrs: {
    class: '!scroll-smooth'
  },
  link: [
    { rel: 'dns-prefetch', href: 'https://www.google-analytics.com' },
    { rel: 'preconnect', href: 'https://www.google-analytics.com' }
  ]
})
</script>