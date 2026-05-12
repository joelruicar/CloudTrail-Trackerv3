<template>
  <VaForm
    ref="form"
    @submit.prevent="submit"
  >
    <h1 class="font-semibold text-4xl mb-4">
      Log in
    </h1>
    <VaInput
      v-model="formData.username"
      :rules="[validators.required]"
      class="mb-4"
      label="Username"
      type="username"
      background="textInput"
      @keydown.enter="submit"
    />
    <VaValue
      v-slot="isPasswordVisible"
      :default-value="false"
    >
      <VaInput
        v-model="formData.password"
        :rules="[validators.required]"
        :type="isPasswordVisible.value ? 'text' : 'password'"
        class="mb-4"
        label="Password"
        background="textInput"
        @keydown.enter="submit"
        @clickAppendInner.stop="isPasswordVisible.value = !isPasswordVisible.value"
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

    <div class="auth-layout__options flex flex-col sm:flex-row items-start sm:items-center justify-between">
      <VaCheckbox
        v-model="formData.keepLoggedIn"
        class="mb-2 sm:mb-0"
        label="Keep me signed in on this device"
      />
      <RouterLink
        :to="{ name: 'recover-password' }"
        class="mt-2 sm:mt-0 sm:ml-1 font-semibold text-primary"
      >
        Forgot password?
      </RouterLink>
    </div>

    <div class="flex justify-center mt-4">
      <VaButton
        class="w-full"
        @click="submit"
      >
        Login
      </VaButton>
    </div>
  </VaForm>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useForm, useToast } from 'vuestic-ui'
import { validators } from '../../services/utils'
import { useAuthStore } from '../../stores/auth'

const { validate } = useForm('form')
const { push } = useRouter()
const { init } = useToast()
const authStore = useAuthStore()

const formData = reactive({
  username: '',
  password: '',
  keepLoggedIn: false,
})

const submit = async () => {
  if (validate()) {
    try {
      await authStore.login(formData.username, formData.password)
      // init({ message: 'Inicio de sesión exitoso', color: 'success' })
      push({ name: 'dashboard' })
    } catch (error: any) {
      init({ message: 'Error al iniciar sesión: ' + error.message, color: 'danger' })
    }
  }
}
</script>
<style scoped>
:deep(.va-input-wrapper__field:has(input:-webkit-autofill)) {
  background-color:var(--va-text-input)  !important;
}

:deep(.va-input-wrapper__field input:-webkit-autofill) {
  -webkit-box-shadow: 0 0 0px 1000px var(--va-text-input)  inset;
  transition: background-color 5000s ease-in-out 0s;
}
</style>