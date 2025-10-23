<template>
  <!-- Ancien header supprimé (robot/logo) pour respecter la charte Gestify -->
</template>

<script setup lang="ts">

</script>

<style scoped>
.app-apostrophe {
  font-size: 2.7rem;
  color: #5e8572;
  font-weight: 900;
  margin-left: 0.1rem;
}
.app-slogan {
  font-family: 'Montserrat', Arial, sans-serif;
  font-size: 1.08rem;
  color: #4338ca;
  font-weight: 500;
  margin-top: 0.3rem;
  max-width: 480px;
  font-style: italic;
}
@media (max-width: 700px) {
  .header-banner {
    flex-direction: column;
    gap: 1.2rem;
    padding: 1.2rem 0.7rem;
    min-height: 0;
  }
  .logo-zone {
    justify-content: center;
    min-width: 0;
  }
  .header-content {
    align-items: center;
    text-align: center;
  }
}
</style>
