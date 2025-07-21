<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <button
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors duration-200"
      >
        <Icon name="lucide:globe" class="h-4 w-4" />
        <span class="hidden sm:inline">{{ currentLocale.name }}</span>
      </button>
    </DropdownMenuTrigger>
    
    <DropdownMenuContent align="end">
      <DropdownMenuItem
        v-for="locale in availableLocales"
        :key="locale.code"
        @click="switchLocale(locale.code)"
        :class="{ 'bg-accent': locale.code === $i18n.locale.value }"
      >
        {{ locale.name }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from 'radix-vue'

const { locale, locales, setLocale } = useI18n()

const availableLocales = computed(() => locales.value)
const currentLocale = computed(() => 
  availableLocales.value.find(l => l.code === locale.value) || availableLocales.value[0]
)

const switchLocale = async (code: string) => {
  await setLocale(code)
}
</script>