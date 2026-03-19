<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-8">
        <div class="text-h4 text-weight-bold q-mb-md">Mi Perfil</div>

        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">Información Personal</div>
            <ProfileForm />
          </q-card-section>
        </q-card>

        <q-card flat bordered v-if="!isGoogleUser">
          <q-card-section>
            <div class="text-h6 q-mb-md">Cambiar Contraseña</div>
            <PasswordForm />
          </q-card-section>
        </q-card>

        <q-card flat bordered v-else class="bg-blue-1">
          <q-card-section>
            <div class="row items-center">
              <q-icon name="info" size="sm" class="q-mr-sm text-blue" />
              <div class="text-body1">
                Has iniciado sesión con Google. No puedes cambiar tu contraseña desde aquí.
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from 'src/modules/auth/stores/auth-store';
import ProfileForm from '../components/ProfileForm.vue';
import PasswordForm from '../components/PasswordForm.vue';

const authStore = useAuthStore();

const isGoogleUser = computed(() => !!authStore.user?.googleId);
</script>
