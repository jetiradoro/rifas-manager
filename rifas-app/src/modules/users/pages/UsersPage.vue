<template>
  <q-page class="q-pa-md">
    <section class="text-subtitle1 text-weight-bold q-mb-sm">Usuarios del sistema</section>

    <div class="users-list">
      <UserItem
        v-for="user in usersStore.users"
        :key="user.id"
        :user="user"
        @edit="openForm"
        @delete="handleDelete"
      />

      <q-card v-if="usersStore.users.length === 0 && !usersStore.loading" flat bordered>
        <q-card-section class="text-center text-grey-7">
          <q-icon name="info" size="32px" class="q-mb-sm text-grey-6" />
          <div>No hay usuarios registrados.</div>
        </q-card-section>
      </q-card>
    </div>

    <q-page-sticky position="bottom-right" :offset="[12, 12]">
      <q-btn round color="primary" padding="sm" icon="add" size="lg" @click="openForm()" />
    </q-page-sticky>

    <q-dialog v-model="formOpen" persistent>
      <UserForm :user="editingUser" @saved="onSaved" @cancel="closeForm" />
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useUsersStore } from 'src/modules/users/stores/users-store';
import type { User } from 'src/modules/auth/stores/auth-store';
import UserItem from 'src/modules/users/components/UserItem.vue';
import UserForm from 'src/modules/users/components/UserForm.vue';

const $q = useQuasar();
const usersStore = useUsersStore();

const formOpen = ref(false);
const editingUser = ref<User | null>(null);

onMounted(async () => {
  await usersStore.fetchUsers();
});

/**
 * Abre el formulario de usuario.
 * @param user Usuario a editar (opcional)
 */
function openForm(user?: User) {
  editingUser.value = user ?? null;
  formOpen.value = true;
}

/**
 * Cierra el formulario de usuario.
 */
function closeForm() {
  formOpen.value = false;
  editingUser.value = null;
}

/**
 * Maneja el evento de guardado del formulario.
 */
function onSaved() {
  closeForm();
  $q.notify({
    type: 'positive',
    message: editingUser.value ? 'Usuario actualizado' : 'Usuario creado',
    position: 'top',
  });
}

/**
 * Maneja la eliminación de un usuario.
 * @param user Usuario a eliminar
 */
function handleDelete(user: User) {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de que quieres eliminar al usuario "${user.name}"?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        await usersStore.deleteUser(user.id);
        $q.notify({
          type: 'positive',
          message: 'Usuario eliminado',
          position: 'top',
        });
      } catch {
        $q.notify({
          type: 'negative',
          message: 'Error al eliminar el usuario',
          position: 'top',
        });
      }
    })();
  });
}
</script>

<style lang="scss" scoped>
.users-list {
  display: grid;
  gap: 12px;
}
</style>
