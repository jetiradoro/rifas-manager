<template>
  <q-form @submit="onSubmit" class="q-gutter-md">
    <q-input
      v-model="form.name"
      label="Nombre"
      outlined
      :rules="[(val) => !!val || 'El nombre es obligatorio']"
    >
      <template v-slot:prepend>
        <q-icon name="person" />
      </template>
    </q-input>

    <q-input
      v-model="form.email"
      type="email"
      label="Email"
      outlined
      :rules="[
        (val) => !!val || 'El email es obligatorio',
        (val) => /.+@.+\..+/.test(val) || 'Email inválido',
      ]"
    >
      <template v-slot:prepend>
        <q-icon name="email" />
      </template>
    </q-input>

    <div class="row justify-end q-gutter-sm">
      <q-btn label="Cancelar" color="grey-7" flat @click="resetForm" :disable="loading" />
      <q-btn
        type="submit"
        label="Guardar Cambios"
        color="primary"
        :loading="loading"
        :disable="!hasChanges"
      />
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from 'src/modules/auth/stores/auth-store';
import { useQuasar } from 'quasar';

const authStore = useAuthStore();
const $q = useQuasar();

const loading = ref(false);
const form = ref({
  name: '',
  email: '',
});

const originalData = ref({
  name: '',
  email: '',
});

const hasChanges = computed(() => {
  return (
    form.value.name !== originalData.value.name || form.value.email !== originalData.value.email
  );
});

const loadUserData = () => {
  if (authStore.user) {
    form.value.name = authStore.user.name;
    form.value.email = authStore.user.email;
    originalData.value = { ...form.value };
  }
};

const resetForm = () => {
  form.value = { ...originalData.value };
};

const onSubmit = async () => {
  loading.value = true;
  try {
    const updateData: { name?: string; email?: string } = {};

    if (form.value.name !== originalData.value.name) {
      updateData.name = form.value.name;
    }
    if (form.value.email !== originalData.value.email) {
      updateData.email = form.value.email;
    }

    await authStore.updateProfile(updateData);

    originalData.value = { ...form.value };

    $q.notify({
      type: 'positive',
      message: 'Perfil actualizado correctamente',
      position: 'top',
    });
  } catch (error: unknown) {
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Error al actualizar el perfil',
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadUserData();
});
</script>
