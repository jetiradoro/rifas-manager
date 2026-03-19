<template>
  <q-page class="flex flex-center bg-gradient">
    <q-card class="register-card" flat bordered>
      <q-card-section class="text-center q-pb-none">
        <div class="text-h5 text-weight-bold q-mb-xs">Crear Cuenta</div>
        <div class="text-grey-7">Regístrate en el sistema de rifas</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="onSubmit" class="q-gutter-md">
          <q-input
            v-model="form.name"
            label="Nombre completo"
            outlined
            dense
            :rules="[
              (val) => !!val || 'El nombre es obligatorio',
              (val) => val.length >= 3 || 'Mínimo 3 caracteres',
            ]"
          >
            <template #prepend>
              <q-icon name="person" />
            </template>
          </q-input>

          <q-input
            v-model="form.email"
            label="Email"
            type="email"
            outlined
            dense
            :rules="[
              (val) => !!val || 'El email es obligatorio',
              (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Email no válido',
            ]"
          >
            <template #prepend>
              <q-icon name="mail" />
            </template>
          </q-input>

          <q-input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            label="Contraseña"
            outlined
            dense
            :rules="[
              (val) => !!val || 'La contraseña es obligatoria',
              (val) => val.length >= 6 || 'Mínimo 6 caracteres',
            ]"
          >
            <template #prepend>
              <q-icon name="lock" />
            </template>
            <template #append>
              <q-icon
                :name="showPassword ? 'visibility' : 'visibility_off'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <q-input
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            label="Confirmar contraseña"
            outlined
            dense
            :rules="[
              (val) => !!val || 'Confirma tu contraseña',
              (val) => val === form.password || 'Las contraseñas no coinciden',
            ]"
          >
            <template #prepend>
              <q-icon name="lock" />
            </template>
            <template #append>
              <q-icon
                :name="showConfirmPassword ? 'visibility' : 'visibility_off'"
                class="cursor-pointer"
                @click="showConfirmPassword = !showConfirmPassword"
              />
            </template>
          </q-input>

          <div class="q-mt-md">
            <q-btn
              type="submit"
              color="primary"
              label="Registrarse"
              class="full-width"
              :loading="authStore.loading"
              :disable="authStore.loading"
            />
          </div>
        </q-form>
      </q-card-section>

      <q-separator />

      <!-- <q-card-section>
                <GoogleLoginButton />
            </q-card-section> -->

      <q-separator />

      <q-card-section class="text-center q-pt-sm">
        <div class="text-body2 text-grey-7">
          ¿Ya tienes cuenta?
          <router-link to="/login" class="text-primary text-weight-medium">
            Inicia sesión
          </router-link>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/modules/auth/stores/auth-store';
// import GoogleLoginButton from 'src/modules/auth/components/GoogleLoginButton.vue';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const form = ref({
  name: '',
  email: '',
  password: '',
});

const confirmPassword = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);

/**
 * Maneja el envío del formulario de registro.
 */
async function onSubmit() {
  try {
    await authStore.register(form.value);
    $q.notify({
      type: 'positive',
      message: 'Cuenta creada exitosamente',
      position: 'top',
    });
    await router.push('/');
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Error al crear la cuenta',
      caption: (err as Error).message,
      position: 'top',
    });
  }
}
</script>

<style lang="scss" scoped>
.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-card {
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
}
</style>
