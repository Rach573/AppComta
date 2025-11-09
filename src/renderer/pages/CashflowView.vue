<template>
  <div class="cashflow-view">
    <p v-if="cashflowLoading">Chargement...</p>
    <p v-if="cashflowError" class="error">{{ cashflowError }}</p>

    <div v-else-if="cashflow" class="results-grid">
      <div class="results-column">
        <SectionTable
          title="Exploitation"
          :items="cashflowItemsExploitation"
          :total="cashflowItemsExploitation.reduce((s, i) => s + i.amount, 0)"
          flat
        />
      </div>
      <div class="results-column">
        <SectionTable
          title="Financement & Investissement"
          :items="cashflowItemsFinInv"
          :total="cashflowItemsFinInv.reduce((s, i) => s + i.amount, 0)"
          flat
        />
      </div>
    </div>

    <div v-if="cashflow" class="result-total">
      Variation nette de trésorerie : <strong>{{ formatCurrency(cashflow.net) }}</strong>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import SectionTable from '../components/SectionTable.vue';
import { useCompta } from '../composables/useCompta';

const {
  cashflow,
  cashflowLoading,
  cashflowError,
  fetchCashflow,
} = useCompta();

const cashflowItemsExploitation = computed(() => {
  if (!cashflow.value) return [];
  return [
    { label: "Encaissements clients", amount: cashflow.value.encaissementsClients ?? cashflow.value.exploitation },
    { label: "Paiements fournisseurs", amount: cashflow.value.paiementsFournisseurs ?? 0 },
    { label: "Paiements charges", amount: cashflow.value.paiementsCharges ?? 0 },
    { label: "Intérêts", amount: cashflow.value.interets ?? 0 },
    { label: "Total exploitation", amount: cashflow.value.exploitation },
  ];
});

const cashflowItemsFinInv = computed(() => {
  if (!cashflow.value) return [];
  return [
    { label: "Investissements payés", amount: -(cashflow.value.investissementsPayes ?? 0) },
    { label: "Apports en capital", amount: cashflow.value.apports ?? 0 },
    { label: "Emprunts reçus", amount: cashflow.value.emprunts ?? 0 },
    { label: "Remboursements emprunts", amount: cashflow.value.remboursements ?? 0 },
  ];
});

const formatCurrency = (value: number) =>
  value.toLocaleString('fr-BE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  });

onMounted(() => {
  void fetchCashflow();
});
</script>

<style scoped>
.cashflow-view {
  display: grid;
  gap: 1.8rem;
}

.results-grid {
  display: flex;
  flex-wrap: nowrap;
  gap: 2rem;
  align-items: stretch;
  overflow-x: auto;
}

.results-column {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
}

.results-column > * {
  flex: 1;
  min-width: 0;
}

.result-total {
  margin-top: 1.5rem;
  color: #1a936f;
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
}

.result-total strong {
  font-size: 1.4rem;
}
</style>
