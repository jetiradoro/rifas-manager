<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title class="text-weight-bold"> Gestión de Rifas </q-toolbar-title>

        <q-badge color="dark" class="q-mr-sm"> v{{ appConfig.version }} </q-badge>

        <q-btn-dropdown flat round dense icon="account_circle">
          <q-list>
            <q-item-label header>
              <div class="text-weight-bold">{{ authStore.user?.name }}</div>
              <div class="text-caption text-grey-7">{{ authStore.user?.email }}</div>
            </q-item-label>

            <q-separator />

            <q-item>
              <q-item-section avatar>
                <q-avatar :color="roleColor" text-color="white" size="32px">
                  <q-icon :name="roleIcon" size="18px" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ roleLabel }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable :to="{ name: 'profile' }">
              <q-item-section avatar>
                <q-icon name="settings" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Mi Perfil</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable @click="logout">
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Cerrar sesión</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Menú Principal </q-item-label>

        <q-item
          v-for="item in menuItems"
          :key="item.name"
          clickable
          :active="isActiveRoute(item.activeRoutes)"
          @click="navigateTo(item.route)"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ item.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
      <ScrollToTopButton />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { appConfig } from 'src/config';
import { useAuthStore } from 'src/modules/auth/stores/auth-store';
import ScrollToTopButton from 'src/components/common/ScrollToTopButton.vue';

interface MenuItem {
  name: string;
  label: string;
  icon: string;
  route: string;
  activeRoutes: string[];
  adminOnly?: boolean;
}

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const leftDrawerOpen = ref(false);

/**
 * Configuración de los items del menú principal.
 */
const allMenuItems: MenuItem[] = [
  {
    name: 'rifas',
    label: 'Rifas',
    icon: 'confirmation_number',
    route: 'rifas',
    activeRoutes: ['rifas'],
  },
  {
    name: 'persons',
    label: 'Personas',
    icon: 'people',
    route: 'persons',
    activeRoutes: ['persons', 'person-detail'],
    adminOnly: true,
  },
  {
    name: 'users',
    label: 'Usuarios',
    icon: 'admin_panel_settings',
    route: 'users',
    activeRoutes: ['users'],
    adminOnly: true,
  },
  {
    name: 'privacy-policy',
    label: 'Política de Privacidad',
    icon: 'lock',
    route: 'privacy-policy',
    activeRoutes: ['privacy-policy'],
  },
  {
    name: 'terms-of-service',
    label: 'Condiciones de Servicio',
    icon: 'gavel',
    route: 'terms-of-service',
    activeRoutes: ['terms-of-service'],
  },
];

/**
 * Filtra los items del menú según el rol del usuario.
 */
const menuItems = computed(() => {
  return allMenuItems.filter((item) => !item.adminOnly || authStore.isAdmin);
});

/**
 * Color del rol del usuario.
 */
const roleColor = computed(() => {
  return authStore.isAdmin ? 'red-7' : 'blue-7';
});

/**
 * Icono del rol del usuario.
 */
const roleIcon = computed(() => {
  return authStore.isAdmin ? 'admin_panel_settings' : 'person';
});

/**
 * Etiqueta del rol en español.
 */
const roleLabel = computed(() => {
  return authStore.isAdmin ? 'Administrador' : 'Usuario';
});

/**
 * Inicializa el store de autenticación.
 */
onMounted(async () => {
  await authStore.initialize();
});

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function navigateTo(routeName: string) {
  void router.push({ name: routeName });
}

/**
 * Verifica si la ruta actual coincide con alguna de las rutas activas del item.
 */
function isActiveRoute(activeRoutes: string[]): boolean {
  return activeRoutes.includes(route.name as string);
}

/**
 * Cierra la sesión del usuario.
 */
function logout() {
  $q.dialog({
    title: 'Cerrar sesión',
    message: '¿Estás seguro de que quieres cerrar sesión?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      authStore.logout();
      await router.push('/login');
      $q.notify({
        type: 'positive',
        message: 'Sesión cerrada',
        position: 'top',
      });
    })();
  });
}
</script>
