<template>
    <q-btn
        color="white"
        text-color="grey-9"
        class="full-width google-btn"
        outline
        @click="handleGoogleLogin"
    >
        <template #default>
            <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                class="google-icon q-mr-sm"
            />
            Continuar con Google
        </template>
    </q-btn>
</template>

<script setup lang="ts">
import { useAuthStore } from 'src/modules/auth/stores/auth-store';

const authStore = useAuthStore();

/**
 * Maneja el login con Google OAuth.
 */
function handleGoogleLogin() {
    authStore.loginWithGoogle();
}
</script>

<style lang="scss" scoped>
.google-btn {
    border-color: #dadce0;

    &:hover {
        background-color: #f8f9fa;
    }
}

.google-icon {
    width: 18px;
    height: 18px;
}
</style>
