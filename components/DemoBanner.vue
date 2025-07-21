<template>
  <div v-if="isDemoMark(mark)" class="mb-8">
    <div class="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
      <div class="flex items-start gap-3">
        <Icon name="lucide:info" class="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        <div class="flex-1">
          <h3 class="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
            {{ $t('Components.DemoBanner.title') }}
          </h3>
          <p class="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
            {{ $t('Components.DemoBanner.description') }}
          </p>
          <div class="flex flex-wrap gap-2">
            <NuxtLink
              to="/"
              class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-700 transition-colors"
            >
              <Icon name="lucide:home" class="h-3 w-3" />
              {{ $t('Components.DemoBanner.goHome') }}
            </NuxtLink>
            <NuxtLink
              to="/doc"
              class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
            >
              <Icon name="lucide:book-open" class="h-3 w-3" />
              {{ $t('Components.DemoBanner.learnMore') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isDemoMark } from '~/types'

interface Props {
  mark: string
}

defineProps<Props>()

const { t } = useI18n()
</script>