<template>
    <q-form @submit.prevent="onSubmit" class="q-gutter-md">
        <q-input v-model="form.email" label="Email" type="email" outlined dense :rules="[
            (val) => !!val || 'El email es obligatorio',
            (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Email no válido',
        ]">
            <template #prepend>
                <q-icon name="mail" />
            </template>
        </q-input>

        <q-input v-model="form.password" :type="showPassword ? 'text' : 'password'" label="Contraseña" outlined dense
            :rules="[(val) => !!val || 'La contraseña es obligatoria']">
            <template #prepend>
                <q-icon name="lock" />
            </template>
            <template #append>
                <q-icon :name="showPassword ? 'visibility' : 'visibility_off'" class="cursor-pointer"
                    @click="showPassword = !showPassword" />
            </template>
        </q-input>


        <div class="q-mt-md">
            <q-btn type="submit" color="primary" label="Iniciar sesión" class="full-width" :loading="authStore.loading"
                :disable="authStore.loading" />
        </div>
    </q-form>
</template>

<script setup
        lang="ts">
        import { computed, ref } from 'vue';
        import { useQuasar } from 'quasar';
        import { useAuthStore } from 'src/modules/auth/stores/auth-store';
        import { appConfig } from 'src/config';

        const emit = defineEmits<{
            loginSuccess: [];
        }>();

        const demoEnv = computed(() => appConfig.demo_env === 'true');

        const $q = useQuasar();
        const authStore = useAuthStore();

        const form = ref({
            email: '',
            password: '',
        });

        const showPassword = ref(false);

        /**
         * Maneja el envío del formulario de login.
         */
        async function onSubmit() {
            try {
                await authStore.login(form.value);
                $q.notify({
                    type: 'positive',
                    message: 'Sesión iniciada exitosamente',
                    position: 'top',
                });
                emit('loginSuccess');
            } catch (err) {
                $q.notify({
                    type: 'negative',
                    message: 'Error al iniciar sesión',
                    caption: (err as Error).message,
                    position: 'top',
                });
            }
        }
</script>
