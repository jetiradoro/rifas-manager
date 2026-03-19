<template>
  <q-card dark style="min-width: 320px; max-width: 480px; width: 100%">
    <q-card-section>
      <div class="text-h6">{{ title }}</div>
    </q-card-section>
    <q-separator />
    <q-card-section class="q-gutter-md">
      <q-input
        v-model="formModel.name"
        label="Nombre"
        dense
        autofocus
        dark
        filled
        :rules="[(val) => !!val || 'El nombre es obligatorio']"
      />
      <q-input
        v-model="formModel.surname"
        label="Apellido"
        dense
        dark
        filled
        :rules="[(val) => !!val || 'El apellido es obligatorio']"
      />
      <q-input
        v-model="formModel.phone"
        label="Teléfono"
        dense
        dark
        filled
        :error="contactError"
        :error-message="contactErrorMessage"
        @update:model-value="clearContactError"
      />
      <q-input
        v-model="formModel.email"
        label="Email"
        type="email"
        dense
        dark
        filled
        :rules="emailRules"
        :error="contactError"
        @update:model-value="clearContactError"
      />
      <div v-if="!formModel.phone && !formModel.email" class="text-caption text-warning">
        * Debes proporcionar al menos teléfono o email
      </div>
    </q-card-section>
    <q-separator />
    <q-card-actions align="right">
      <CancelButton @click="onCancel" />
      <SaveButton :loading="loading" @click="submit" />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import {
  usePersonsStore,
  type Person,
  type CreatePersonPayload,
} from 'src/modules/persons/stores/persons-store';
import { SaveButton, CancelButton } from 'src/components/buttons';

interface FormModel {
  name: string;
  surname: string;
  phone: string;
  email: string;
}

const props = defineProps<{
  person?: Person | null;
}>();

const emit = defineEmits<{
  (e: 'saved'): void;
  (e: 'cancel'): void;
}>();

const personsStore = usePersonsStore();
const $q = useQuasar();

const formModel = reactive<FormModel>({
  name: '',
  surname: '',
  phone: '',
  email: '',
});

const contactError = ref(false);
const contactErrorMessage = ref('');

const title = computed(() => (props.person ? 'Editar Persona' : 'Nueva Persona'));
const loading = computed(() => personsStore.loading);

/**
 * Reglas de validación para el campo email.
 * Solo valida formato si hay contenido.
 */
const emailRules = computed(() => [
  (val: string) => !val || /.+@.+\..+/.test(val) || 'Email inválido',
]);

watch(
  () => props.person,
  (val) => {
    if (val) {
      formModel.name = val.name;
      formModel.surname = val.surname;
      formModel.phone = val.phone || '';
      formModel.email = val.email || '';
    } else {
      resetForm();
    }
  },
  { immediate: true },
);

/**
 * Limpia el estado de error de contacto.
 */
function clearContactError() {
  contactError.value = false;
  contactErrorMessage.value = '';
}

/**
 * Resetea el formulario a valores vacíos.
 */
function resetForm() {
  formModel.name = '';
  formModel.surname = '';
  formModel.phone = '';
  formModel.email = '';
  clearContactError();
}

/**
 * Valida y envía el formulario.
 */
async function submit() {
  // Validación nombre y apellido obligatorios
  if (!formModel.name || !formModel.surname) {
    $q.notify({ type: 'warning', message: 'Completa nombre y apellido.' });
    return;
  }

  // Validación: al menos teléfono o email
  if (!formModel.phone && !formModel.email) {
    contactError.value = true;
    contactErrorMessage.value = 'Debes proporcionar al menos teléfono o email';
    $q.notify({ type: 'warning', message: 'Debes proporcionar al menos teléfono o email.' });
    return;
  }

  // Validación de email si se proporciona
  if (formModel.email && !/^.+@.+\..+$/.test(formModel.email)) {
    $q.notify({ type: 'warning', message: 'Email inválido.' });
    return;
  }

  const payload: CreatePersonPayload = {
    name: formModel.name,
    surname: formModel.surname,
    ...(formModel.phone ? { phone: formModel.phone } : {}),
    ...(formModel.email ? { email: formModel.email } : {}),
  };

  try {
    if (props.person) {
      await personsStore.updatePerson(props.person.id, payload);
      $q.notify({ type: 'positive', message: 'Persona actualizada correctamente' });
    } else {
      await personsStore.createPerson(payload);
      $q.notify({ type: 'positive', message: 'Persona creada correctamente' });
    }
    emit('saved');
    resetForm();
  } catch (error) {
    console.error('Error saving person:', error);
    // Error ya notificado por el interceptor global de axios
  }
}

/**
 * Cancela la edición.
 */
function onCancel() {
  emit('cancel');
}
</script>
