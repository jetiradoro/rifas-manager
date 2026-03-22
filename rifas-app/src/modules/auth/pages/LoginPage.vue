<template>
  <q-page class="login-page window-height">
    <div class="row fit no-wrap">
      <div class="col-12 col-md-6 flex flex-center q-pa-md q-pa-lg-xl form-side">
        <q-card class="login-card" flat bordered>
          <q-card-section class="text-center q-pb-none">
            <div class="text-h5 text-weight-bold q-mb-xs">Iniciar sesión</div>
            <div class="text-grey-7">Accede al sistema de rifas</div>
          </q-card-section>

          <q-card-section>
            <LoginForm @login-success="onLoginSuccess" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-md-6 gt-sm text-white flex flex-center q-pa-xl info-side">
        <div class="text-center info-panel">
          <q-img src="/images/logo.webp" alt="Logo Rifas Manager" fit="contain" class="logo q-mx-auto q-mb-lg" />
          <h1 class="text-h4 text-weight-bold q-mb-sm">Rifas Manager</h1>
          <p class="text-body1 text-grey-2">
            Gestiona rifas, premios y participantes de forma rápida y sencilla en
            una sola plataforma.
          </p>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup
        lang="ts">
        import { useRouter } from 'vue-router';
        import LoginForm from 'src/modules/auth/components/LoginForm.vue';

        const router = useRouter();

        /**
         * Maneja el éxito del login.
         */
        async function onLoginSuccess() {
          await router.push('/');
        }
</script>

<style lang="scss"
       scoped>
      .login-page {
        min-height: 100dvh;
        height: 100dvh;
      }

      .form-side {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .info-side {
        background: linear-gradient(160deg, #0f172a 0%, #1e3a8a 55%, #4c1d95 100%);
      }

      .login-card {
        width: 100%;
        max-width: 400px;
        border-radius: 12px;
      }

      .info-panel {
        max-width: 420px;
      }

      .logo {
        width: 180px;
        max-width: 100%;
      }
    </style>
