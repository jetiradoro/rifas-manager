<template>
  <q-page class="q-pa-md">
    <q-btn flat icon="arrow_back" label="Volver" color="primary" class="q-mb-md" @click="goBack" />

    <div v-if="personsStore.loading" class="text-center q-py-lg">
      <q-spinner color="primary" size="48px" />
    </div>

    <div v-else-if="!person" class="text-center q-py-lg">
      <q-icon name="person_off" size="64px" class="text-grey-5 q-mb-md" />
      <div class="text-grey-7">Persona no encontrada</div>
    </div>

    <div v-else>
      <!-- Información de la persona -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section class="row items-center q-gutter-md">
          <q-avatar color="primary" text-color="white" size="64px">
            {{ initials }}
          </q-avatar>
          <div class="col">
            <div class="text-h6 text-weight-medium">{{ person.name }} {{ person.surname }}</div>
            <div
              v-if="person.email"
              class="text-caption text-grey-7 row items-center q-gutter-xs q-mt-xs"
            >
              <q-icon name="email" size="16px" />
              <span>{{ person.email }}</span>
            </div>
            <div v-if="person.phone" class="text-caption text-grey-7 row items-center q-gutter-xs">
              <q-icon name="phone" size="16px" />
              <span>{{ person.phone }}</span>
            </div>
          </div>
          <q-btn flat color="primary" icon="edit" label="Editar" @click="openEditForm" />
        </q-card-section>
      </q-card>

      <!-- Historial de tickets -->
      <q-card flat bordered>
        <q-card-section>
          <div class="flex items-center justify-between q-mb-md">
            <div class="text-h6">Historial de Tickets</div>
            <q-badge v-if="totalPrizesWon > 0" color="amber" text-color="black">
              <q-icon name="emoji_events" size="16px" class="q-mr-xs" />
              {{ totalPrizesWon }} {{ totalPrizesWon === 1 ? 'premio' : 'premios' }}
            </q-badge>
          </div>

          <div v-if="!person.tickets || person.tickets.length === 0" class="text-center q-py-lg">
            <q-icon name="confirmation_number_outlined" size="48px" class="text-grey-5 q-mb-md" />
            <div class="text-grey-7">Esta persona no tiene tickets asignados</div>
          </div>

          <div v-else>
            <q-expansion-item
              v-for="(group, rifaId) in ticketsByRifa"
              :key="rifaId"
              :label="group.rifa.name"
              :caption="`${group.tickets.length} ${group.tickets.length === 1 ? 'ticket' : 'tickets'}`"
              expand-icon-toggle
              header-class="text-primary"
              :default-opened="false"
            >
              <template #header>
                <q-item-section avatar>
                  <q-icon name="confirmation_number" color="primary" size="32px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ group.rifa.name }}</q-item-label>
                  <q-item-label caption>
                    <q-icon name="event" size="14px" />
                    {{ formatDate(group.rifa.fecha) }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="flex items-center gap-2">
                    <q-badge color="primary" :label="`${group.tickets.length} tickets`" />
                    <q-badge
                      v-if="countPrizesInGroup(group.tickets) > 0"
                      color="amber"
                      text-color="black"
                    >
                      <q-icon name="emoji_events" size="14px" class="q-mr-xs" />
                      {{ countPrizesInGroup(group.tickets) }}
                    </q-badge>
                  </div>
                </q-item-section>
              </template>

              <q-list separator>
                <q-item
                  v-for="ticket in group.tickets"
                  :key="ticket.id"
                  clickable
                  :class="{ 'ticket-with-prize': ticket.prizes.length > 0 }"
                  @click="navigateToRifa(ticket.rifa.id)"
                >
                  <q-item-section avatar>
                    <q-avatar
                      :color="getTicketStatusColor(ticket.status)"
                      text-color="white"
                      size="40px"
                    >
                      #{{ ticket.number }}
                    </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-medium">
                      Ticket #{{ ticket.number }}
                    </q-item-label>
                    <q-item-label v-if="ticket.observations" caption class="q-mt-xs">
                      <q-icon name="notes" size="14px" />
                      {{ ticket.observations }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <div class="column items-end q-gutter-xs">
                      <q-badge
                        :color="getTicketStatusColor(ticket.status)"
                        :label="getTicketStatusLabel(ticket.status)"
                      />
                      <q-badge v-if="ticket.prizes.length > 0" color="amber" text-color="black">
                        <q-icon name="emoji_events" size="14px" class="q-mr-xs" />
                        {{ getPrizeLabel(ticket.prizes[0]?.prizeOrder ?? 0) }}
                      </q-badge>
                      <q-icon name="chevron_right" size="20px" class="text-grey-5" />
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <q-dialog v-model="formOpen" persistent dark>
      <PersonForm :person="person" @saved="onSaved" @cancel="closeForm" />
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { usePersonsStore } from 'src/modules/persons/stores/persons-store';
import PersonForm from 'src/modules/persons/components/PersonForm.vue';
import {
  getTicketStatusColor,
  getTicketStatusLabel,
} from 'src/modules/tickets/constants/ticket-status';

const route = useRoute();
const router = useRouter();
const personsStore = usePersonsStore();

const formOpen = ref(false);

const person = computed(() => personsStore.currentPerson);

/**
 * Calcula las iniciales de la persona.
 */
const initials = computed(() => {
  if (!person.value) return '';
  const firstLetter = person.value.name.charAt(0).toUpperCase();
  const secondLetter = person.value.surname.charAt(0).toUpperCase();
  return `${firstLetter}${secondLetter}`;
});

/**
 * Agrupa tickets por rifa.
 */
const ticketsByRifa = computed(() => {
  if (!person.value?.tickets) return {};

  return person.value.tickets.reduce(
    (acc, ticket) => {
      const rifaId = ticket.rifa.id.toString();
      if (!acc[rifaId]) {
        acc[rifaId] = { rifa: ticket.rifa, tickets: [] };
      }
      acc[rifaId].tickets.push(ticket);
      return acc;
    },
    {} as Record<
      string,
      { rifa: { id: number; name: string; fecha: string }; tickets: typeof person.value.tickets }
    >,
  );
});

/**
 * Cuenta el total de premios ganados por la persona.
 */
const totalPrizesWon = computed(() => {
  if (!person.value?.tickets) return 0;
  return person.value.tickets.reduce((count, ticket) => count + ticket.prizes.length, 0);
});

/**
 * Cuenta los premios en un grupo de tickets.
 * @param tickets Lista de tickets del grupo
 * @returns Número de premios
 */
function countPrizesInGroup(
  tickets: Array<{
    id: number;
    number: number;
    status: 'available' | 'reserved' | 'paid';
    observations: string | null;
    rifa: { id: number; name: string; fecha: string };
    prizes: Array<{ id: number; prizeOrder: number }>;
  }>,
): number {
  return tickets.reduce((count, ticket) => count + ticket.prizes.length, 0);
}

/**
 * Obtiene la etiqueta del premio según su orden.
 * @param order Orden del premio (1=gordo, 2=segundo, etc)
 * @returns Etiqueta del premio
 */
function getPrizeLabel(order: number): string {
  if (order === 1) return 'Gordo';
  if (order === 2) return '2º Premio';
  if (order === 3) return '3º Premio';
  return `${order}º Premio`;
}

onMounted(async () => {
  const id = Number(route.params.id);
  if (id) {
    await personsStore.fetchPersonById(id);
  }
});

/**
 * Retorna al listado de personas.
 */
function goBack() {
  void router.push({ name: 'persons' });
}

/**
 * Abre el formulario de edición.
 */
function openEditForm() {
  formOpen.value = true;
}

/**
 * Cierra el formulario de edición.
 */
function closeForm() {
  formOpen.value = false;
}

/**
 * Maneja el evento de guardado y recarga los datos.
 */
async function onSaved() {
  formOpen.value = false;
  const id = Number(route.params.id);
  if (id) {
    await personsStore.fetchPersonById(id);
  }
}

/**
 * Formatea una fecha para mostrarla.
 */
function formatDate(date: string): string {
  return dayjs(date).format('DD/MM/YYYY HH:mm');
}

/**
 * Navega a la página de detalle de una rifa.
 * @param rifaId ID de la rifa
 */
function navigateToRifa(rifaId: number) {
  void router.push({ name: 'rifa-detail', params: { id: rifaId } });
}
</script>
