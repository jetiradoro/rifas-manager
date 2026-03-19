<template>
    <q-card flat bordered>
        <q-card-section class="row items-center q-gutter-md">
            <q-avatar :color="roleColor" text-color="white" size="48px">
                <q-icon :name="roleIcon" size="24px" />
            </q-avatar>
            <div class="col">
                <div class="row items-center q-gutter-sm">
                    <div class="text-subtitle1 text-weight-medium">
                        {{ user.name }}
                    </div>
                    <q-badge :color="roleColor" :label="roleLabel" />
                </div>
                <div class="text-caption text-grey-7 row items-center q-gutter-xs">
                    <q-icon name="email" size="14px" />
                    <span>{{ user.email }}</span>
                </div>
            </div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
            <EditButton @click="emitEdit" />
            <DeleteButton @click="emitDelete" />
        </q-card-actions>
    </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { User } from 'src/modules/auth/stores/auth-store';
import { EditButton, DeleteButton } from 'src/components/buttons';

const props = defineProps<{
    user: User;
}>();

const emit = defineEmits<{
    edit: [user: User];
    delete: [user: User];
}>();

/**
 * Color del badge según el rol.
 */
const roleColor = computed(() => {
    return props.user.role === 'admin' ? 'red-7' : 'blue-7';
});

/**
 * Icono según el rol.
 */
const roleIcon = computed(() => {
    return props.user.role === 'admin' ? 'admin_panel_settings' : 'person';
});

/**
 * Etiqueta del rol en español.
 */
const roleLabel = computed(() => {
    return props.user.role === 'admin' ? 'Administrador' : 'Usuario';
});

/**
 * Emite evento de edición.
 */
function emitEdit() {
    emit('edit', props.user);
}

/**
 * Emite evento de eliminación.
 */
function emitDelete() {
    emit('delete', props.user);
}
</script>
