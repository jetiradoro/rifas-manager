<template>
  <q-form @submit="onSubmit" class="q-gutter-md">

    <q-input v-model="form.newPassword" :type="showNewPassword ? 'text' : 'password'" label="Nueva Contraseña" outlined
      :rules="[
        (val) => !!val || 'La nueva contraseña es obligatoria',
        (val) => val.length >= 6 || 'Mínimo 6 caracteres',
      ]">
      <template v-slot:prepend>
        <q-icon name="lock" />
      </template>
      <template v-slot:append>
        <q-icon :name="showNewPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer"
          @click="showNewPassword = !showNewPassword" />
      </template>
    </q-input>

    <q-input v-model="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
      label="Confirmar Nueva Contraseña" outlined :rules="[
        (val) => !!val || 'Debes confirmar la contraseña',
        (val) => val === form.newPassword || 'Las contraseñas no coinciden',
      ]">
      <template v-slot:prepend>
        <q-icon name="lock" />
      </template>
      <template v-slot:append>
        <q-icon :name="showConfirmPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer"
          @click="showConfirmPassword = !showConfirmPassword" />
      </template>
    </q-input>

    <div class="row justify-end q-gutter-sm">
      <q-btn label="Cancelar" color="grey-7" flat @click="resetForm" :disable="loading" />
      <q-btn type="submit" label="Cambiar Contraseña" color="primary" :loading="loading" />
    </div>
  </q-form>
</template>

<script setup
        lang="ts">
        import { ref } from 'vue';
        import { useAuthStore } from 'src/modules/auth/stores/auth-store';
        import { useQuasar } from 'quasar';
        import { appConfig } from 'src/config';

        const authStore = useAuthStore();
        const $q = useQuasar();

        const loading = ref(false);
        // const showCurrentPassword = ref(false);
        const showNewPassword = ref(false);
        const showConfirmPassword = ref(false);

        const form = ref({
          // currentPassword: '',
          newPassword: '',
        });

        const confirmPassword = ref('');

        const resetForm = () => {
          form.value = {
            // currentPassword: '',
            newPassword: '',
          };
          confirmPassword.value = '';
        };

        const onSubmit = async () => {
          if (appConfig.demo_env === 'true') {
            $q.notify({
              type: 'negative',
              message: 'Modo demo: cambio de contraseña deshabilitado',
              position: 'top',
            });
            return;
          }

          loading.value = true;
          try {
            await authStore.updatePassword(form.value);

            $q.notify({
              type: 'positive',
              message: 'Contraseña actualizada correctamente',
              position: 'top',
            });

            resetForm();
          } catch (error: unknown) {
            $q.notify({
              type: 'negative',
              message: error instanceof Error ? error.message : 'Error al actualizar la contraseña',
              position: 'top',
            });
          } finally {
            loading.value = false;
          }
        };
</script>
