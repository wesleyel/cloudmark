<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger as-child>
      <button
        class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8"
        :title="$t('Components.DialogEdit.edit')"
      >
        <Icon name="lucide:edit-2" class="h-4 w-4" />
      </button>
    </DialogTrigger>
    
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{{ $t('Components.DialogEdit.title') }}</DialogTitle>
        <DialogDescription>
          {{ $t('Components.DialogEdit.description') }}
        </DialogDescription>
      </DialogHeader>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <label for="edit-url" class="text-sm font-medium">
            {{ $t('Components.DialogEdit.url') }} <span class="text-destructive">*</span>
          </label>
          <input
            id="edit-url"
            v-model="form.url"
            type="url"
            placeholder="https://example.com"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
        </div>
        
        <div class="space-y-2">
          <label for="edit-title" class="text-sm font-medium">
            {{ $t('Components.DialogEdit.title_label') }} <span class="text-destructive">*</span>
          </label>
          <input
            id="edit-title"
            v-model="form.title"
            type="text"
            placeholder="Bookmark title"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
        </div>
        
        <div class="space-y-2">
          <label for="edit-description" class="text-sm font-medium">
            {{ $t('Components.DialogEdit.description') }}
          </label>
          <textarea
            id="edit-description"
            v-model="form.description"
            placeholder="Optional description"
            rows="3"
            class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        
        <div class="space-y-2">
          <label for="edit-category" class="text-sm font-medium">
            {{ $t('Components.DialogEdit.category') }} <span class="text-destructive">*</span>
          </label>
          <select
            id="edit-category"
            v-model="form.category"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value="">{{ $t('Components.DialogEdit.selectCategory') }}</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
        
        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            @click="isOpen = false"
            class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            {{ $t('Components.DialogEdit.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <Icon v-if="isSubmitting" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
            {{ $t('Components.DialogEdit.save') }}
          </button>
        </div>
      </form>
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
  categories: string[]
}

interface Emits {
  (e: 'bookmark-updated', bookmark: BookmarkInstance): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

// State
const isOpen = ref(false)
const isSubmitting = ref(false)

// Form data
const form = reactive({
  url: '',
  title: '',
  description: '',
  category: ''
})

// Initialize form with bookmark data
const initializeForm = () => {
  form.url = props.bookmark.url
  form.title = props.bookmark.title
  form.description = props.bookmark.description || ''
  form.category = props.bookmark.category
}

// Handle form submission
const handleSubmit = async () => {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {
    const bookmarkData = {
      mark: props.mark,
      uuid: props.bookmark.uuid,
      url: form.url.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category
    }

    const updatedBookmark = await $fetch<BookmarkInstance>('/api/bookmarks/update', {
      method: 'POST',
      body: bookmarkData
    })

    emit('bookmark-updated', updatedBookmark)
    toast.success(t('Components.DialogEdit.success'))
    isOpen.value = false
  } catch (error: any) {
    console.error('Error updating bookmark:', error)
    toast.error(error.data?.message || t('Components.DialogEdit.error'))
  } finally {
    isSubmitting.value = false
  }
}

// Initialize form when dialog opens
watch(isOpen, (open) => {
  if (open) {
    initializeForm()
  }
})

// Initialize form on mount
onMounted(() => {
  initializeForm()
})
</script>