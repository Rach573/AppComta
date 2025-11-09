<template>
  <div class="app-container">
    <main class="app-layout">
      <header class="app-header">
        <div class="hero-title-area">
          <img src="./assets/logoequilibro.png" alt="Logo Équili Bro'" class="logo-hero">
          <div>
            <h1>Équili Bro'</h1>
            <p>Gère ton business avec ton Bro' comptable.</p>
          </div>
        </div>
      </header>

      <nav class="app-nav">
        <router-link to="/" :class="{ active: $route.name === 'entries' }">Ecritures</router-link>
        <router-link to="/balance" :class="{ active: $route.name === 'balance' }">Bilan</router-link>
        <router-link to="/income" :class="{ active: $route.name === 'income' }">Compte de résultat</router-link>
        <router-link to="/cashflow" :class="{ active: $route.name === 'cashflow' }">Cashflow</router-link>
      </nav>

      <div class="app-view card">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// App.vue est désormais un simple shell
// Toute la logique métier est dans les pages et le composable useCompta
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: stretch;
  padding: 3rem 1.5rem;
}

.app-layout {
  width: min(1100px, 100%);
  display: grid;
  gap: 2rem;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 2rem 2.5rem;
  box-shadow: 0 10px 20px rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.1);
}

.hero-title-area {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.logo-hero {
  height: 80px;
  width: auto;
  flex-shrink: 0;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.1));
}

.app-header h1 {
  margin: 0 0 0.25rem;
  font-size: 2.2rem;
  color: #1e3a8a;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.app-header p {
  margin: 0;
  color: #4b5563;
  font-weight: 400;
  font-style: italic;
  font-size: 1.05rem;
  font-family: 'Inter', sans-serif;
}

.app-nav {
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 999px;
  padding: 0.35rem 1.5rem;
  box-shadow: 0 12px 30px rgba(6, 182, 212, 0.12);
  max-width: 520px;
  margin: 0 auto;
}

.app-nav a {
  border: none;
  background: transparent;
  padding: 0.6rem 1.8rem;
  border-radius: 999px;
  font-weight: 600;
  color: #1e3a8a;
  transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}

.app-nav a.active {
  background: linear-gradient(135deg, #06b6d4, #1e3a8a);
  color: #fff;
  box-shadow: 0 8px 15px rgba(6, 182, 212, 0.3);
}

.app-nav a:not(.active):hover {
  background: rgba(6, 182, 212, 0.1);
  color: #06b6d4;
}

.app-view {
  padding: 2rem;
}

@media (max-width: 720px) {
  .app-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .app-nav {
    width: 100%;
    justify-content: space-between;
  }

  .app-nav a {
    flex: 1;
    text-align: center;
  }
}
</style>
