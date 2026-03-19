<template>
    <q-card style="min-width: 320px; max-width: 480px; width: 100%">
        <q-card-section>
            <div class="text-h6">{{ title }}</div>
        </q-card-section>
        <q-separator />
        <q-card-section class="q-gutter-md">
            <q-input
                v-model="formModel.name"
                label="Nombre completo"
                dense
                outlined
                autofocus
                :rules="[(val) => !!val || 'El nombre es obligatorio']"
            />

            <q-input
                v-model="formModel.email"
                label="Email"
                type="email"
                dense
                outlined
                :rules="emailRules"
            />

            <q-input
                v-if="!props.user"
                v-model="formModel.password"
                label="Contraseña"
                type="password"
                dense
                outlined
                :rules="passwordRules"
            />

            <q-select
                v-model="formModel.role"
                label="Rol"
                :options="roleOptions"
                dense
                outlined
                emit-value
                map-options
                :rules="[(val) => !!val || 'El rol es obligatorio']"
            />

            <q-select
                v-model="formModel.personId"
                label="Persona asociada (opcional)"
                :options="personOptions"
                dense
                outlined
                clearable
                use-input
                emit-value
                map-options
                option-value="value"
                option-label="label"
                @filter="filterPersons"
            >
                <template #no-option>
                    <q-item>
                        <q-item-section class="text-grey">Sin resultados</q-item-section>
                    </q-item>
                </template>
            </q-select>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
            <CancelButton @click="onCancel" />
            <SaveButton :loading="loading" @click="submit" />
        </q-card-actions>
    </q-card>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useQuasar } from 'quasar';
import {
    useUsersStore,
    type CreateUserPayload,
    type UpdateUserPayload,
} from 'src/modules/users/stores/users-store';
import type { User } from 'src/modules/auth/stores/auth-store';
import { usePersonsStore } from 'src/modules/persons/stores/persons-store';
import { SaveButton, CancelButton } from 'src/components/buttons';

interface FormModel {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'user' | '';
    personId: number | null;
}

const props = defineProps<{
    user?: User | null;
}>();

const emit = defineEmits<{
    saved: [];
    cancel: [];
}>();

const $q = useQuasar();
const usersStore = useUsersStore();
const personsStore = usePersonsStore();

const loading = ref(false);

const formModel = reactive<FormModel>({
    name: props.user?.name ?? '',
    email: props.user?.email ?? '',
    password: '',
    role: props.user?.role ?? '',
    personId: props.user?.personId ?? null,
});

const roleOptions = [
    { label: 'Administrador', value: 'admin' },
    { label: 'Usuario', value: 'user' },
];

const allPersons = ref<Array<{ label: string; value: number }>>([]);
const personOptions = ref<Array<{ label: string; value: number }>>([]);

/**
 * Título del formulario.
 */
const title = computed(() => (props.user ? 'Editar Usuario' : 'Nuevo Usuario'));

/**
 * Reglas de validación del email.
 */
const emailRules = [
    (val: string) => !!val || 'El email es obligatorio',
    (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Email no válido',
];

/**
 * Reglas de validación de la contraseña.
 */
const passwordRules = [
    (val: string) => !!val || 'La contraseña es obligatoria',
    (val: string) => val.length >= 6 || 'Mínimo 6 caracteres',
];

/**
 * Carga las personas para el selector.
 */
async function loadPersons() {
    try {
        await personsStore.fetchPersons();
        allPersons.value = personsStore.persons.map((p) => ({
            label: `${p.name} ${p.surname}`,
            value: p.id,
        }));
        personOptions.value = [...allPersons.value];
    } catch (err) {
        console.error('Error al cargar personas:', err);
    }
}

/**
 * Filtra las personas según el texto ingresado.
 * @param val Texto de búsqueda
 * @param update Función de actualización de Quasar
 */
function filterPersons(val: string, update: (callback: () => void) => void) {
    update(() => {
        const needle = val.toLowerCase();
        personOptions.value = allPersons.value.filter((v) =>
            v.label.toLowerCase().includes(needle)
        );
    });
}

/**
 * Valida el formulario.
 * @returns true si el formulario es válido
 */
function validateForm(): boolean {
    if (!formModel.name || !formModel.email || !formModel.role) {
        $q.notify({
            type: 'negative',
            message: 'Completa todos los campos obligatorios',
            position: 'top',
        });
        return false;
    }

    if (!props.user && !formModel.password) {
        $q.notify({
            type: 'negative',
            message: 'La contraseña es obligatoria',
            position: 'top',
        });
        return false;
    }

    return true;
}

/**
 * Envía el formulario.
 */
async function submit() {
    if (!validateForm()) return;

    loading.value = true;

    try {
        if (props.user) {
            const updatePayload: UpdateUserPayload = {
                name: formModel.name,
                email: formModel.email,
                role: formModel.role as 'admin' | 'user',
            };
            if (formModel.personId !== null) {
                updatePayload.personId = formModel.personId;
            }
            await usersStore.updateUser(props.user.id, updatePayload);
        } else {
            const createPayload: CreateUserPayload = {
                name: formModel.name,
                email: formModel.email,
                password: formModel.password,
                role: formModel.role as 'admin' | 'user',
            };
            if (formModel.personId !== null) {
                createPayload.personId = formModel.personId;
            }
            await usersStore.createUser(createPayload);
        }

        emit('saved');
    } catch (err) {
        $q.notify({
            type: 'negative',
            message: 'Error al guardar el usuario',
            caption: (err as Error).message,
            position: 'top',
        });
    } finally {
        loading.value = false;
    }
}

/**
 * Cancela la edición.
 */
function onCancel() {
    emit('cancel');
}

// Cargar personas al montar
void loadPersons();
</script>
