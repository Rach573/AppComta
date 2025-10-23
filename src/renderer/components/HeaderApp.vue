<template>
<div class="header-app">
  <div class="header-bg">
    <div class="header-content">
      <img src="../assets/logoequilibro.png" alt="Logo Gestify" class="logo-img" />
      <div class="title-zone">
        <h1 class="app-title">GESTIFY</h1>
        <div class="app-slogan">Pensée pour les auto-entrepreneurs, PME, freelances qui veulent maîtriser leur gestion sans jargon.</div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const hover = ref(false);
const numbers = ref(['€', '+', '1', '×', '9', '=', '2', '%', '7', '-', '0']);
function numberStyle(i: number) {
  const delay = i * 0.15;
  const angle = (i * 360) / numbers.value.length;
  return {
    left: `${8 + Math.cos((angle * Math.PI) / 180) * 24}px`,
    top: `${-8 + Math.sin((angle * Math.PI) / 180) * 16}px`,
    animationDelay: `${delay}s`,
  };
}
</script>

<style scoped>
/* --- Gestify Header --- */
.header-app {
  width: 100%;
  position: relative;
}
.header-bg {
  background: radial-gradient(circle at 20% 40%, #1a1a1a 0%, #2a2a2a 60%, #1f1f1f 100%);
  border-bottom-left-radius: 32px;
  border-bottom-right-radius: 32px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.5);
  padding-bottom: 0;
  position: relative;
  border: 1px solid #3a3a3a;
}
.header-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: url('../assets/logoequilibro.png') no-repeat right -80px bottom -40px;
  background-size: 520px auto;
  opacity: 0.06;
  pointer-events: none;
  filter: grayscale(100%);
}
.header-content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 2.5rem;
  padding: 1.2rem 2.5rem 0.5rem 2.5rem;
}
.logo-card {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.logo-img {
  width: 170px;
  height: auto;
  z-index: 2;
  opacity: 0.98;
  filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.45));
}
.floating-numbers { display: none; }
.intro-floats {
  position: absolute;
  top: -6px;
  left: 0;
  right: 0;
  height: 28px;
  pointer-events: none;
}
.intro-floats span {
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  font-size: 0.9rem;
  font-family: 'Montserrat', Arial, sans-serif;
  font-weight: 600;
  color: #ffffff;
  opacity: 0;
  text-shadow: 0 2px 8px rgba(94,133,114,0.35);
  animation: floatIntro 1.6s ease-out forwards;
}
@keyframes floatIntro {
  0% { opacity: 0; transform: translate(-50%, 8px) scale(0.9); }
  35% { opacity: 1; }
  100% { opacity: 0; transform: translate(-50%, -10px) scale(1.05); }
}
@keyframes floatOut {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
  15% { opacity: 1; }
  85% { opacity: 1; transform: translate(-50%, -50%) translateY(-60px) scale(1.3); }
  100% { opacity: 0; transform: translate(-50%, -50%) translateY(-80px) scale(1.5); }
}
.title-zone {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  text-align: left;
}
.app-title {
  font-family: 'Montserrat', Arial, sans-serif;
  font-size: 3.75rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -1px;
  display: flex;
  align-items: center;
  gap: 0.2rem;
  margin-bottom: 0.2rem;
  text-shadow: 0 3px 16px rgba(94, 133, 114, 0.6), 0 1px 3px rgba(0, 0, 0, 0.3);
}
.gradient-text {
  background: linear-gradient(135deg, #ffffff 0%, #dfeee7 50%, #cfe4da 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 3px 12px rgba(94,133,114,0.5));
  animation: gradientMove 3.5s linear infinite alternate;
  background-size: 200% 200%;
}
@keyframes gradientMove {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}
.app-apostrophe {
  font-size: 2.7rem;
  color: #ffffff;
  font-weight: 900;
  margin-left: 0.1rem;
  filter: drop-shadow(0 2px 8px rgba(94,133,114,0.5));
}
.app-slogan {
  font-family: 'Inter', Arial, sans-serif;
  font-size: 1.08rem;
  color: #f8fafc;
  font-weight: 500;
  margin-top: 0.3rem;
  max-width: 480px;
  font-style: italic;
  text-align: left;
  text-shadow: 0 2px 10px rgba(94, 133, 114, 0.5), 0 1px 2px rgba(0, 0, 0, 0.2);
}
.watermark-below {
  display: block;
  font-family: 'Inter', Arial, sans-serif;
  font-size: 1.08rem;
  color: #f8fafc;
  font-weight: 700;
  max-width: 480px;
  white-space: pre-line;
  pointer-events: none;
  text-align: left;
  font-style: italic;
  text-shadow: none;
  margin-top: 2.2rem;
  opacity: 0.13;
}
.header-wave {
  width: 100%;
  margin-top: -2px;
}
.header-wave svg {
  display: block;
  width: 100%;
  height: 80px;
}
.header-wave path {
  fill: #1a1a1a;
}
@media (max-width: 700px) {
  .header-content {
    flex-direction: column;
    gap: 1.2rem;
    padding: 1.2rem 0.7rem 0.5rem 0.7rem;
  }
  .logo-card {
    margin-bottom: 0.5rem;
  }
  .title-zone {
    align-items: center;
    text-align: center;
  }
  .app-slogan {
    text-align: center;
  }
}

.header-app {
  width: 100%;
  position: relative;
}
.header-bg {
  background: #0C1C1E;
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  padding: 0.5rem 0 0.5rem 0;
}
.header-content {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1.2rem 2.2rem 1.2rem 2.2rem;
}
.logo-img {
  height: 56px;
  width: auto;
  margin-right: 1.5rem;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.18));
}
.title-zone {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}
.app-title {
  font-family: 'Poppins', 'Inter', 'Manrope', Arial, sans-serif;
  font-size: 2rem;
  font-weight: bold;
  color: #F3E9DC;
  letter-spacing: -1px;
  margin-bottom: 0.1rem;
  text-shadow: 0 0 6px #3BA18B;
}
.app-slogan {
  font-family: 'Poppins', 'Inter', 'Manrope', Arial, sans-serif;
  font-size: 0.9rem;
  color: #F3E9DC99;
  font-style: italic;
  font-weight: 400;
  margin-top: 0.1rem;
  max-width: 420px;
}
@media (max-width: 700px) {
  .header-content {
    flex-direction: column;
    gap: 1.1rem;
    padding: 1.1rem 0.7rem 0.7rem 0.7rem;
  }
  .title-zone {
    align-items: center;
    text-align: center;
  }
  .app-slogan {
    text-align: center;
  }
}
</style>
