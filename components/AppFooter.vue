<template>
  <footer class="border-t border-border/40 mt-auto">
    <div class="container flex flex-col gap-2 py-6 text-center">
      <p class="text-xs text-muted-foreground">
        Released under the AGPL License.
      </p>
      <p class="text-xs text-muted-foreground">
        Copyright © {{ currentYear }}
        <NuxtLink
          to="https://github.com/wesleyel"
          class="hover:text-primary"
          target="_blank"
          external
        >
          Wesley Yang
        </NuxtLink>
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>