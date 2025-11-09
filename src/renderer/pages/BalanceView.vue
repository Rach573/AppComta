<template>
  <div class="balance-view">
    <div class="balance-actions">
      <button type="button" @click="handleTestEcoBois" class="btn-test">
        🌳 Test ÉcoBois
      </button>
      <button type="button" @click="handleCloture">
        Clôturer l'exercice
      </button>
    </div>

    <p v-if="balanceLoading">Generation...</p>
    <p v-if="balanceError" class="error">{{ balanceError }}</p>

    <div v-if="balanceSheet && !balanceLoading" class="balance-grid">
      <div class="balance-column">
        <h3 class="balance-title actif">Actif</h3>
        <div class="balance-box">
          <div v-for="section in assetSections" :key="section.label" class="balance-section">
            <h4>{{ section.label }}</h4>
            <ul>
              <li v-for="item in section.items" :key="item.category">
                <span>{{ item.label }}</span>
                <span>{{ formatCurrency(item.amount) }}</span>
              </li>
            </ul>
            <div class="section-total">
              Total {{ section.label }} :
              <strong>{{ formatCurrency(section.total) }}</strong>
            </div>
          </div>
          <div class="grand-total actif">
            <span>Total de l'Actif</span>
            <strong>{{ formatCurrency(totalAssets) }}</strong>
          </div>
        </div>
      </div>

      <div class="balance-column">
        <h3 class="balance-title passif">Passif</h3>
        <div class="balance-box">
          <div
            v-for="section in liabilitySections"
            :key="section.label"
            class="balance-section"
          >
            <h4>{{ section.label }}</h4>
            <ul>
              <li v-for="item in section.items" :key="item.category">
                <span>{{ item.label }}</span>
                <span>{{ formatCurrency(item.amount) }}</span>
              </li>
            </ul>
            <div class="section-total">
              Total {{ section.label }} :
              <strong>{{ formatCurrency(section.total) }}</strong>
            </div>
          </div>
          <div class="grand-total passif">
            <span>Total du Passif</span>
            <strong>{{ formatCurrency(totalLiabilities) }}</strong>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useCompta } from '../composables/useCompta';

const {
  balanceSheet,
  balanceLoading,
  balanceError,
  generateBalance,
  cloturerExercice,
  testEcoBois,
} = useCompta();

const assetSections = computed(() => balanceSheet.value?.assets ?? []);
const liabilitySections = computed(() => balanceSheet.value?.liabilities ?? []);
const totalAssets = computed(() => balanceSheet.value?.totalAssets ?? 0);
const totalLiabilities = computed(() => balanceSheet.value?.totalLiabilities ?? 0);

const formatCurrency = (value: number) =>
  value.toLocaleString('fr-BE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  });

const handleTestEcoBois = async () => {
  await testEcoBois();
};

const handleCloture = async () => {
  await cloturerExercice();
};

onMounted(() => {
  void generateBalance();
});
</script>

<style scoped>
.balance-view {
  display: grid;
  gap: 1.8rem;
}

.balance-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-test {
  background: linear-gradient(135deg, #3BA18B, #2d8574);
  font-size: 0.9rem;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  border: none;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.btn-test:hover {
  box-shadow: 0 12px 24px rgba(59, 161, 139, 0.35);
}

button {
  padding: 0.75rem 1.8rem;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

button:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 30px rgba(79, 70, 229, 0.35);
}

.balance-grid {
  display: flex;
  gap: 2rem;
  align-items: stretch;
}

.balance-column {
  flex: 1 1 45%;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.balance-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 3px solid;
}

.balance-title.actif {
  color: #d53f8c;
  border-color: #d53f8c;
}

.balance-title.passif {
  color: #4f46e5;
  border-color: #4f46e5;
}

.balance-box {
  border: 2px solid rgba(91, 95, 151, 0.2);
  border-radius: 18px;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex-grow: 1;
}

.balance-section h4 {
  margin: 0 0 0.85rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: #302b63;
}

.balance-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.55rem;
}

.balance-section li {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  color: #444b6e;
}

.section-total {
  margin-top: 0.9rem;
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  color: #302b63;
}

.grand-total {
  font-size: 1.15rem;
  font-weight: 700;
  display: flex;
  justify-content: space-between;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(91, 95, 151, 0.25);
  margin-top: auto;
}

.grand-total.actif {
  color: #d53f8c;
}

.grand-total.passif {
  color: #4f46e5;
}
</style>
