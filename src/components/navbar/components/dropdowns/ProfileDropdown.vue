<template>
  <div class="profile-dropdown-wrapper">
    <VaDropdown
      v-model="isShown"
      :offset="[9, 0]"
      :close-on-content-click="false"
      class="profile-dropdown"
      stick-to-edges
    >
      <template #anchor>
        <VaButton
          preset="secondary"
          color="textPrimary"
        >
          <span class="profile-dropdown__anchor min-w-max">
            <slot />
            <VaAvatar
              :size="32"
              color="warning"
            > 😍 </VaAvatar>
          </span>
        </VaButton>
      </template>
      <VaDropdownContent
        class="profile-dropdown__content px-0 py-4"
        :style="{ '--hover-color': hoverColor }"
      >
        <VaList
          v-for="group in options"
          :key="group.name"
        >
          <VaListItem
            v-for="item in group.list"
            :key="item.name"
            class="menu-item px-4 text-base cursor-pointer h-8"
            @click="handleItemClick(item)"
          >
            <VaIcon
              :name="item.icon"
              class="pr-1"
              color="secondary"
            />
            {{ t(`user.${item.name}`) }}
          </VaListItem>
        </VaList>
        <div class="theme-switch px-4 mt-2">
          <VaSwitch
            v-model="isDarkTheme"
            size="small"
            color="primary"
          />
          <span class="theme-switch__label">{{ isDarkTheme ? t('buttonSelect.dark') : t('buttonSelect.light') }}</span>
        </div>
      </VaDropdownContent>
    </VaDropdown>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useColors } from 'vuestic-ui'
import { useAuthStore } from '../../../../stores/auth'
const { colors, setHSLAColor, applyPreset, currentPresetName } = useColors()
const hoverColor = computed(() => setHSLAColor(colors.focus, { a: 0.1 }))
const THEME_STORAGE_KEY = 'theme-preset'

const isDarkTheme = computed({
  get: () => currentPresetName.value === 'dark',
  set: (value: boolean) => {
    applyPreset(value ? 'dark' : 'light')
  },
})

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
type ProfileListItem = {
  name: string
  to?: string
  href?: string
  icon: string
}

type ProfileOptions = {
  name: string
  separator: boolean
  list: ProfileListItem[]
}

withDefaults(
  defineProps<{
    options?: ProfileOptions[]
  }>(),
  {
    options: () => [
      {
        name: '',
        separator: false,
        list: [
          {
            name: 'change-password',
            to: 'change-password',
            icon: 'mso-password',
          },
          {
            name: 'logout',
            to: 'login',
            icon: 'mso-logout',
          },
        ],
      },
    ],
  },
)
const isShown = ref(false)

onMounted(() => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  if (savedTheme === 'dark' || savedTheme === 'light') {
    applyPreset(savedTheme)
    return
  }

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyPreset('dark')
  }
})

watch(currentPresetName, (preset) => {
  if (preset === 'dark' || preset === 'light') {
    localStorage.setItem(THEME_STORAGE_KEY, preset)
  }
})

const handleItemClick = async (item: ProfileListItem) => {
  if (item.name === 'logout') {
    try {
      await authStore.logout()
      router.push({ name: 'login' })
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  } else if (item.to) {
    router.push({ name: item.to })
  } else if (item.href) {
    window.open(item.href, '_blank')
  }

  isShown.value = false
}

// const resolveLinkAttribute = (item: ProfileListItem) => {
//   return item.to ? { to: { name: item.to } } : item.href ? { href: item.href, target: '_blank' } : {}
// }
</script>

<style lang="scss">
.profile-dropdown {
  cursor: pointer;

  &__content {
    width: 15rem;
    max-width: calc(100vw - 1rem);
    overflow-x: hidden;

    .menu-item:hover {
      background: var(--hover-color);
    }
  }

  &__anchor {
    display: inline-block;
  }
}

.theme-switch {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 0.4rem;
}


</style>
