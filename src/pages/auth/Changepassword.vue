<template>
  <div class="password-change-container">
    <VaForm
      ref="passwordForm"
      class="p-4"
      @submit.prevent="handlePasswordChange"
    >
      <h1 class="font-semibold text-4xl mb-4">
        Change Password
      </h1>

      <VaValue
        v-slot="isOldVisible"
        :default-value="false"
      >
        <VaInput
          v-model="oldPass"
          label="Current Password"
          class="mb-4"
          :type="isOldVisible.value ? 'text' : 'password'"
          background="textInput"
          :rules="[validators.required]"
          @clickAppendInner.stop="isOldVisible.value = !isOldVisible.value"
        >
          <template #appendInner>
            <VaIcon
              :name="isOldVisible.value ? 'mso-visibility_off' : 'mso-visibility'"
              class="cursor-pointer"
              color="secondary"
            />
          </template>
        </VaInput>
      </VaValue>

      <VaValue
        v-slot="isNewVisible"
        :default-value="false"
      >
        <VaInput
          v-model="newPass"
          label="New Password"
          class="mb-4"
          :type="isNewVisible.value ? 'text' : 'password'"
          background="textInput"
          :rules="[validators.required]"
          @clickAppendInner.stop="isNewVisible.value = !isNewVisible.value"
        >
          <template #appendInner>
            <VaIcon
              :name="isNewVisible.value ? 'mso-visibility_off' : 'mso-visibility'"
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
        outline
      >
        {{ errorMessage }}
      </VaAlert>

      <div class="flex gap-2">
        <VaButton
          class="w-full"
          type="submit"
          :loading="processing"
        >
          Confirm New Password
        </VaButton>
        <VaButton
          preset="secondary"
          @click="router.back()"
        >
          Cancel
        </VaButton>
      </div>
    </VaForm>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useForm, useToast } from 'vuestic-ui'
import { useAuthStore } from '../../stores/auth'
import { validators } from '../../services/utils'

const router = useRouter()
const { init } = useToast()
const { validate } = useForm('passwordForm')
const authStore = useAuthStore()

const oldPass = ref('')
const newPass = ref('')
const error = ref(false)
const errorMessage = ref('')
const processing = ref(false)
const getErrorMessage = (err: unknown) => err instanceof Error ? err.message : 'An error occurred during the update.'

const handlePasswordChange = async () => {
  if (!validate()) return

  processing.value = true
  error.value = false

  try {
    await authStore.changePassword(oldPass.value, newPass.value)
    init({ message: 'Password updated successfully', color: 'success' })
    router.replace({ name: 'dashboard' })
  } catch (err) {
    error.value = true
    errorMessage.value = getErrorMessage(err)
  } finally {
    processing.value = false
  }
}
</script>

<style scoped>
.password-change-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
