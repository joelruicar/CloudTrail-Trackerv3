<template>
  <VaForm ref="passwordResetForm" @submit.prevent="handleReset">
    <h1 class="font-semibold text-4xl mb-4 text-center">Password Reset</h1>

    <p class="text-base mb-6 leading-5 text-center">
      Enter your username and we'll send you a code to reset your password.
    </p>

    <VaInput
      v-model="username"
      label="Username"
      class="mb-4"
      :rules="[validators.required]"
      placeholder="Enter your username"
      @keydown.enter="handleReset"
    />

    <VaAlert v-if="error" color="danger" class="mb-4">
      {{ errorMessage }}
    </VaAlert>

    <div class="flex justify-center mt-4">
      <VaButton class="w-full" :loading="processing" @click="handleReset"> Recover Password </VaButton>
    </div>

    <div class="mt-4 text-center">
      <RouterLink :to="{ name: 'login' }" class="font-semibold text-primary"> Back to Login </RouterLink>
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
const { validate } = useForm('passwordResetForm')

const username = ref('')
const error = ref(false)
const errorMessage = ref('')
const processing = ref(false)

const handleReset = async () => {
  if (!validate()) return

  processing.value = true
  error.value = false

  try {
    await authStore.resetPassword(username.value)

    init({ message: 'Reset code sent to your email', color: 'success' })
    router.push({ name: 'confirm-password-reset' })
  } catch (err: any) {
    error.value = true
    errorMessage.value = err.message || 'Failed to initiate password reset'
  } finally {
    processing.value = false
  }
}
</script>
