<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <router-view />
      <ScrollToTopButton />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import ScrollToTopButton from 'src/components/common/ScrollToTopButton.vue';
// Layout minimalista para páginas de autenticación (login, register)
</script>
