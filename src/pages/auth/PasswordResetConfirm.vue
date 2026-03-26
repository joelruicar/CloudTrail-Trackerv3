<template>
  <VaForm
    ref="confirmForm"
    @submit.prevent="handleConfirm"
  >
    <h1 class="font-semibold text-4xl mb-4">
      Confirm Reset
    </h1>

    <VaInput
      v-model="username"
      label="Username"
      class="mb-4"
      :rules="[validators.required]"
      @keydown.enter="handleConfirm"
    />

    <VaInput
      v-model="code"
      label="Confirmation Code"
      class="mb-4"
      :rules="[validators.required]"
      @keydown.enter="handleConfirm"
    />

    <VaValue
      v-slot="isPasswordVisible"
      :default-value="false"
    >
      <VaInput
        v-model="password"
        label="New Password"
        class="mb-4"
        :type="isPasswordVisible.value ? 'text' : 'password'"
        :rules="[validators.required]"
        @clickAppendInner.stop="isPasswordVisible.value = !isPasswordVisible.value"
        @keydown.enter="handleConfirm"
      >
        <template #appendInner>
          <VaIcon
            :name="isPasswordVisible.value ? 'mso-visibility_off' : 'mso-visibility'"
            class="cursor-pointer"
            color="secondary"
          />
        </template>
      </VaInput>
    </VaValue>

    <VaAlert
      v-if="error"
      color="danger"
      class="mb-4"
    >
      {{ errorMessage }}
    </VaAlert>

    <div class="flex justify-center mt-4">
      <VaButton
        class="w-full"
        :loading="processing"
        @click="handleConfirm"
      >
        Confirm Password Reset
      </VaButton>
    </div>
  </VaForm>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useForm, useToast } from 'vuestic-ui'
import { useAuthStore } from '../../stores/auth'
import { validators } from '../../services/utils'

const authStore = useAuthStore()
const router = useRouter()
const { init } = useToast()
const { validate } = useForm('confirmForm')

const username = ref('')
const code = ref('')
const password = ref('')
const error = ref(false)
const errorMessage = ref('')
const processing = ref(false)

const handleConfirm = async () => {
  if (!validate()) return

  processing.value = true
  error.value = false

  try {
    await authStore.confirmResetPassword(username.value, code.value, password.value)
    init({ message: 'Password reset successful', color: 'success' })
    router.replace({ name: 'login' })
  } catch (err: any) {
    error.value = true
    errorMessage.value = err.message || 'An error occurred'
  } finally {
    processing.value = false
  }
}
</script>
