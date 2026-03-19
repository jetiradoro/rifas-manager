<template>
  <q-card dark style="min-width: 400px; max-width: 600px; width: 100%">
    <q-card-section>
      <div class="text-h6">Asignar ticket #{{ ticketNumbers.join(', #') }}</div>
    </q-card-section>
    <q-separator />
    <q-card-section class="q-gutter-md">
      <!-- Selector de persona -->
      <q-select
        v-model="selectedPerson"
        :options="filteredPersons"
        label="Seleccionar persona"
        dense
        dark
        filled
        use-input
        input-debounce="300"
        option-label="fullName"
        option-value="id"
        :rules="[(val) => !!val || 'Debes seleccionar una persona']"
        @filter="filterPersons"
      >
        <template #no-option>
          <q-item>
            <q-item-section class="text-grey-7"> No se encontraron personas </q-item-section>
          </q-item>
        </template>
        <template #option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section>
              <q-item-label>{{ scope.opt.fullName }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-select>

      <!-- Botón independiente para crear persona -->
      <q-btn
        v-if="isAdmin"
        flat
        no-caps
        color="primary"
        icon="person_add"
        label="Nueva persona"
        class="q-mt-xs"
        @click="showCreatePersonForm = true"
      />

      <!-- Estado del ticket -->
      <q-select
        v-model="status"
        :options="statusOptions"
        label="Estado"
        dense
        dark
        filled
        emit-value
        map-options
        :rules="[(val) => !!val || 'Debes seleccionar un estado']"
      />

      <!-- Observaciones -->
      <q-input
        v-model="observations"
        label="Observaciones (opcional)"
        type="textarea"
        dense
        dark
        filled
        rows="3"
      />
    </q-card-section>
    <q-separator />
    <q-card-actions align="right">
      <CancelButton @click="onCancel" />
      <SaveButton :loading="loading" @click="submit" />
    </q-card-actions>

    <!-- Diálogo para crear nueva persona -->
    <q-dialog v-model="showCreatePersonForm" persistent>
      <PersonForm @saved="onPersonCreated" @cancel="showCreatePersonForm = false" />
    </q-dialog>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useTicketsStore } from 'src/modules/tickets/stores/tickets-store';
import { usePersonsStore, type Person } from 'src/modules/persons/stores/persons-store';
import { useAuthStore } from 'src/modules/auth/stores/auth-store';
import { SaveButton, CancelButton } from 'src/components/buttons';
import PersonForm from 'src/modules/persons/components/PersonForm.vue';

interface Props {
  rifaId: number;
  ticketNumbers: number[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  saved: [];
  cancel: [];
}>();

const ticketsStore = useTicketsStore();
const personsStore = usePersonsStore();
const authStore = useAuthStore();

const $q = useQuasar();

const selectedPerson = ref<(Person & { fullName: string }) | null>(null);
const status = ref<'reserved' | 'paid'>('reserved');
const observations = ref('');
const loading = ref(false);
const showCreatePersonForm = ref(false);
const filteredPersons = ref<Array<Person & { fullName: string }>>([]);

const statusOptions = [{ label: 'Reservado', value: 'reserved' }];

if (authStore.isAdmin) {
  statusOptions.push({ label: 'Pagado', value: 'paid' });
}

/**
 * Personas con nombre completo para el selector.
 */
const personsWithFullName = computed(() => {
  return personsStore.persons.map((p) => ({
    ...p,
    fullName: `${p.name} ${p.surname}`,
  }));
});

const isAdmin = computed(() => {
  return authStore.isAdmin;
});

/**
 * Filtra las personas según el input del usuario.
 * @param val Texto de búsqueda
 * @param update Callback de actualización
 */
function filterPersons(val: string, update: (callback: () => void) => void) {
  update(() => {
    const needle = val.toLowerCase();
    filteredPersons.value = personsWithFullName.value.filter((p) =>
      p.fullName.toLowerCase().includes(needle),
    );
  });
}

/**
 * Envía el formulario.
 */
async function submit() {
  if (!selectedPerson.value) {
    $q.notify({
      type: 'warning',
      message: 'Debes seleccionar una persona',
    });
    return;
  }

  loading.value = true;
  try {
    const payload: {
      personId: number;
      ticketNumbers: number[];
      status: 'reserved' | 'paid';
      observations?: string;
    } = {
      personId: selectedPerson.value.id,
      ticketNumbers: props.ticketNumbers,
      status: status.value,
    };

    if (observations.value) {
      payload.observations = observations.value;
    }

    await ticketsStore.assignTickets(props.rifaId, payload);

    $q.notify({
      type: 'positive',
      message:
        props.ticketNumbers.length === 1
          ? `Ticket #${props.ticketNumbers[0]} asignado correctamente`
          : `${props.ticketNumbers.length} tickets asignados correctamente`,
    });

    emit('saved');
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al asignar el ticket',
    });
    console.error(error);
  } finally {
    loading.value = false;
  }
}

/**
 * Cancela la operación.
 */
function onCancel() {
  emit('cancel');
}

/**
 * Maneja la creación de una nueva persona.
 */
function onPersonCreated() {
  showCreatePersonForm.value = false;
  // Recargar personas y seleccionar la recién creada
  void personsStore.fetchPersons().then(() => {
    const lastPerson = personsStore.persons[0];
    if (lastPerson) {
      selectedPerson.value = {
        ...lastPerson,
        fullName: `${lastPerson.name} ${lastPerson.surname}`,
      };
    }
  });
}

onMounted(async () => {
  // Cargar personas si no están ya cargadas
  if (personsStore.persons.length === 0) {
    await personsStore.fetchPersons();
  }
  // Inicializar filteredPersons con todas las personas
  filteredPersons.value = personsWithFullName.value;
});
</script>
