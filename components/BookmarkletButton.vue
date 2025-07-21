<template>
  <button
    ref="bookmarkletRef"
    @click="copyBookmarklet"
    class="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
    :title="$t('Components.BookmarkletButton.dragToBookmarks')"
  >
    <Icon name="lucide:bookmark" class="h-4 w-4" />
    {{ $t('Components.BookmarkletButton.bookmarklet') }}
  </button>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner'

interface Props {
  mark: string
  baseUrl: string
}

const props = defineProps<Props>()
const { t } = useI18n()

const bookmarkletRef = ref<HTMLElement>()

const bookmarkletCode = computed(() => {
  return `javascript:(function(){
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    const bookmarkUrl = '${props.baseUrl}/api/bookmarks/add?mark=${props.mark}&url=' + url + '&title=' + title;
    window.open(bookmarkUrl, '_blank');
  })();`
})

const copyBookmarklet = async () => {
  try {
    await navigator.clipboard.writeText(bookmarkletCode.value)
    toast.success(t('Components.BookmarkletButton.copied'))
  } catch (error) {
    console.error('Failed to copy bookmarklet:', error)
    toast.error(t('Components.BookmarkletButton.copyFailed'))
  }
}

// Set up bookmarklet as draggable link
onMounted(() => {
  if (bookmarkletRef.value) {
    const element = bookmarkletRef.value as HTMLAnchorElement
    element.href = bookmarkletCode.value
    element.draggable = true
    
    element.addEventListener('dragstart', (e) => {
      if (e.dataTransfer) {
        e.dataTransfer.setData('text/uri-list', bookmarkletCode.value)
        e.dataTransfer.setData('text/plain', bookmarkletCode.value)
      }
    })
  }
})
</script>