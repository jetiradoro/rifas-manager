<template>
  <q-page class="flex flex-center bg-gradient">
    <q-card class="login-card" flat bordered>
      <q-card-section class="text-center q-pb-none">
        <div class="text-h5 text-weight-bold q-mb-xs">RIFAS MANAGER</div>
        <div class="text-grey-7">Accede al sistema de rifas</div>
      </q-card-section>

      <q-card-section>
        <LoginForm @login-success="onLoginSuccess" />
      </q-card-section>

      <q-separator />

      <!-- <q-card-section>
                <GoogleLoginButton />
            </q-card-section> -->

      <q-separator />

      <!-- TODO: pendiente de mejorar la gestión de usuarios registrados libremente -->
      <!-- <q-card-section class="text-center q-pt-sm">
        <div class="text-body2 text-grey-7">
          ¿No tienes cuenta?
          <router-link to="/register" class="text-primary text-weight-medium">
            Regístrate
          </router-link>
        </div>
      </q-card-section> -->
    </q-card>
  </q-page>
</template>

<script setup
        lang="ts">
        import { useRouter } from 'vue-router';
        import LoginForm from 'src/modules/auth/components/LoginForm.vue';
        import { appConfig } from 'src/config';
        import { computed } from 'vue';
        // import GoogleLoginButton from 'src/modules/auth/components/GoogleLoginButton.vue';

        const router = useRouter();
        const demoEnv = computed(() => appConfig.demo_env === 'true');

        /**
         * Maneja el éxito del login.
         */
        async function onLoginSuccess() {
          await router.push('/');
        }
</script>

<style lang="scss"
       scoped>
      .bg-gradient {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .login-card {
        width: 100%;
        max-width: 400px;
        border-radius: 12px;
      }
    </style>
