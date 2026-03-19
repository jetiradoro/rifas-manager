<template>
  <q-card flat bordered>
    <q-card-section class="row items-center q-gutter-md">
      <q-avatar color="primary" text-color="white" size="48px">
        {{ initials }}
      </q-avatar>
      <div class="col">
        <div
          class="text-subtitle1 text-weight-medium text-primary cursor-pointer"
          @click="emitViewDetail"
        >
          {{ person.name }} {{ person.surname }}
        </div>
        <div v-if="person.email" class="text-caption text-grey-7 row items-center q-gutter-xs">
          <q-icon name="email" size="14px" />
          <span>{{ person.email }}</span>
        </div>
        <div v-if="person.phone" class="text-caption text-grey-7 row items-center q-gutter-xs">
          <q-icon name="phone" size="14px" />
          <span>{{ person.phone }}</span>
        </div>
      </div>
    </q-card-section>
    <q-separator />
    <q-card-actions align="right">
      <EditButton @click="emitEdit" />
      <DeleteButton @click="openDeleteDialog" />
    </q-card-actions>
  </q-card>

  <DeleteConfirmDialog ref="deleteDialog" :message="deleteMessage" @confirm="handleDelete" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';
import { usePersonsStore, type Person } from 'src/modules/persons/stores/persons-store';
import DeleteConfirmDialog from 'src/components/common/DeleteConfirmDialog.vue';
import { EditButton, DeleteButton } from 'src/components/buttons';

const props = defineProps<{
  person: Person;
}>();

const emit = defineEmits<{
  (e: 'edit', value: Person): void;
  (e: 'viewDetail', value: Person): void;
}>();

const personsStore = usePersonsStore();
const $q = useQuasar();
const deleteDialog = ref<InstanceType<typeof DeleteConfirmDialog> | null>(null);

/**
 * Calcula las iniciales de la persona (primera letra nombre + apellido).
 */
const initials = computed(() => {
  const firstLetter = props.person.name.charAt(0).toUpperCase();
  const secondLetter = props.person.surname.charAt(0).toUpperCase();
  return `${firstLetter}${secondLetter}`;
});

/**
 * Mensaje de confirmación de eliminación.
 */
const deleteMessage = computed(() => {
  return `¿Estás seguro de eliminar a "${props.person.name} ${props.person.surname}"? Esta acción no se puede deshacer.`;
});

function emitEdit() {
  emit('edit', props.person);
}

function emitViewDetail() {
  emit('viewDetail', props.person);
}

function openDeleteDialog() {
  deleteDialog.value?.open();
}

async function handleDelete() {
  await personsStore.deletePerson(props.person.id);
  $q.notify({ type: 'positive', message: 'Persona eliminada correctamente' });
}
</script>
