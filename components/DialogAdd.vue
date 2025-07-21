<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger as-child>
      <button
        class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
      >
        <Icon name="lucide:plus" class="h-4 w-4" />
        {{ $t('Components.DialogAdd.addBookmark') }}
      </button>
    </DialogTrigger>
    
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{{ $t('Components.DialogAdd.title') }}</DialogTitle>
        <DialogDescription>
          {{ $t('Components.DialogAdd.description') }}
        </DialogDescription>
      </DialogHeader>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <label for="url" class="text-sm font-medium">
            {{ $t('Components.DialogAdd.url') }} <span class="text-destructive">*</span>
          </label>
          <input
            id="url"
            v-model="form.url"
            type="url"
            placeholder="https://example.com"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
        </div>
        
        <div class="space-y-2">
          <label for="title" class="text-sm font-medium">
            {{ $t('Components.DialogAdd.title_label') }} <span class="text-destructive">*</span>
          </label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            placeholder="Bookmark title"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
        </div>
        
        <div class="space-y-2">
          <label for="description" class="text-sm font-medium">
            {{ $t('Components.DialogAdd.description') }}
          </label>
          <textarea
            id="description"
            v-model="form.description"
            placeholder="Optional description"
            rows="3"
            class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        
        <div class="space-y-2">
          <label for="category" class="text-sm font-medium">
            {{ $t('Components.DialogAdd.category') }} <span class="text-destructive">*</span>
          </label>
          <select
            id="category"
            v-model="form.category"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value="">{{ $t('Components.DialogAdd.selectCategory') }}</option>
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
            {{ $t('Components.DialogAdd.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <Icon v-if="isSubmitting" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
            {{ $t('Components.DialogAdd.add') }}
          </button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import type { BookmarkInstance } from '~/types'
import { defaultCategory } from '~/types'
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
  mark: string
  categories: string[]
}

interface Emits {
  (e: 'bookmark-added', bookmark: BookmarkInstance): void
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
  category: defaultCategory
})

// Reset form
const resetForm = () => {
  form.url = ''
  form.title = ''
  form.description = ''
  form.category = defaultCategory
}

// Handle form submission
const handleSubmit = async () => {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {
    const bookmarkData = {
      mark: props.mark,
      url: form.url.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category
    }

    const newBookmark = await $fetch<BookmarkInstance>('/api/bookmarks/add', {
      method: 'POST',
      body: bookmarkData
    })

    emit('bookmark-added', newBookmark)
    toast.success(t('Components.DialogAdd.success'))
    isOpen.value = false
    resetForm()
  } catch (error: any) {
    console.error('Error adding bookmark:', error)
    toast.error(error.data?.message || t('Components.DialogAdd.error'))
  } finally {
    isSubmitting.value = false
  }
}

// Auto-fill title from URL
watch(() => form.url, async (newUrl) => {
  if (newUrl && !form.title) {
    try {
      // Try to extract domain as fallback title
      const domain = new URL(newUrl).hostname.replace('www.', '')
      form.title = domain.charAt(0).toUpperCase() + domain.slice(1)
    } catch {
      // Invalid URL, ignore
    }
  }
})

// Reset form when dialog closes
watch(isOpen, (open) => {
  if (!open) {
    resetForm()
  }
})
</script>