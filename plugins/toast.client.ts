import { toast } from 'vue-sonner'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      toast: {
        success: (message: string) => toast.success(message),
        error: (message: string) => toast.error(message),
        warning: (message: string) => toast.warning(message),
        info: (message: string) => toast.info(message),
      }
    }
  }
})