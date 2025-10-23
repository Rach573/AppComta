<template>
  <div class="logo-wrapper">
    <div class="logo-block">
      <img
        class="logo-image"
        src="../assets/logoequilibro.png"
        alt="Logo Équili Bro' - Ton allié comptable"
      />
      <div class="logo-title">Équili Bro’</div>
      <div class="slogan">Pensée pour les auto-entrepreneurs, PME, freelances qui veulent maîtriser leur gestion sans jargon.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Aucun script nécessaire pour ce composant statique
</script>

<style scoped>
.logo-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1.2rem 0.5rem 0.8rem 0.5rem;
  width: 100%;
}

.logo-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.logo-image {
  max-width: 180px;
  width: 100%;
  margin: 0 auto 0.2rem auto;
  display: block;
  filter: drop-shadow(0 5px 20px rgba(0, 0, 0, 0.1));
}

.logo-title {
  font-size: 2rem;
  font-weight: 700;
  color: #5e8572;
  letter-spacing: -1px;
  font-family: 'Montserrat', Arial, sans-serif;
}

.slogan {
  font-size: 1rem;
  color: #44695a;
  font-weight: 500;
  margin-top: 0.1rem;
  font-style: italic;
  max-width: 400px;
  font-family: 'Inter', Arial, sans-serif;
}
</style>
