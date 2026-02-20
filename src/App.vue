<template>
  <div class="p-3 h-full w-full">
    <UApp>
      <RouterView/>
    </UApp>
  </div>
</template>
<script setup lang="ts">
</script>

<style>
body, html, #app {
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100%;
}
</style>