/// <reference types="vite/client" />
/// <reference types=".vuestic" />

declare module 'epic-spinners' {
  import type { DefineComponent } from 'vue'

  export const AtomSpinner: DefineComponent<{
    animationDuration?: number
    size?: number
    color?: string
  }>
}
