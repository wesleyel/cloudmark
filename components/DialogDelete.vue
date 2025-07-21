<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger as-child>
      <button
        class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-destructive hover:text-destructive-foreground h-8 w-8"
        :title="$t('Components.DialogDelete.delete')"
      >
        <Icon name="lucide:trash-2" class="h-4 w-4" />
      </button>
    </DialogTrigger>
    
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Icon name="lucide:alert-triangle" class="h-5 w-5 text-destructive" />
          {{ $t('Components.DialogDelete.title') }}
        </DialogTitle>
        <DialogDescription>
          {{ $t('Components.DialogDelete.description') }}
        </DialogDescription>
      </DialogHeader>
      
      <div class="bg-muted/50 rounded-lg p-4 my-4">
        <div class="flex items-start gap-3">
          <img
            :src="bookmark.favicon"
            :alt="`${bookmark.title} favicon`"
            class="w-6 h-6 rounded-sm object-cover flex-shrink-0 mt-0.5"
            loading="lazy"
          />
          <div class="flex-1 min-w-0">
            <h4 class="font-medium text-sm truncate">{{ bookmark.title }}</h4>
            <p class="text-xs text-muted-foreground truncate">{{ bookmark.url }}</p>
            <div class="flex items-center gap-2 mt-1">
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                {{ bookmark.category }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <p class="text-sm text-muted-foreground">
        {{ $t('Components.DialogDelete.warning') }}
      </p>
      
      <div class="flex justify-end gap-3 pt-4">
        <button
          type="button"
          @click="isOpen = false"
          class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          {{ $t('Components.DialogDelete.cancel') }}
        </button>
        <button
          type="button"
          @click="handleDelete"
          :disabled="isDeleting"
          class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
        >
          <Icon v-if="isDeleting" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
          {{ $t('Components.DialogDelete.deleteButton') }}
        </button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import type { BookmarkInstance } from '~/types'
import { toast } from 'vue-sonner'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from 'radix-vue'

interface Props {
  bookmark: BookmarkInstance
  mark: string
}

interface Emits {
  (e: 'bookmark-deleted'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

// State
const isOpen = ref(false)
const isDeleting = ref(false)

// Handle delete
const handleDelete = async () => {
  if (isDeleting.value) return
  
  isDeleting.value = true
  
  try {
    await $fetch('/api/bookmarks/delete', {
      method: 'POST',
      body: {
        mark: props.mark,
        uuid: props.bookmark.uuid
      }
    })

    emit('bookmark-deleted')
    toast.success(t('Components.DialogDelete.success'))
    isOpen.value = false
  } catch (error: any) {
    console.error('Error deleting bookmark:', error)
    toast.error(error.data?.message || t('Components.DialogDelete.error'))
  } finally {
    isDeleting.value = false
  }
}
</script>