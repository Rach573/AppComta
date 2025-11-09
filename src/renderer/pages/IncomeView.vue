<template>
  <div class="income-view">
    <p v-if="incomeLoading">Chargement...</p>
    <p v-if="incomeError" class="error">{{ incomeError }}</p>

    <div v-else-if="incomeStatement" class="results-grid">
      <div class="results-column">
        <SectionTable
          title="Charges"
          :items="allCharges"
          :total="incomeStatement.charges.reduce((s, i) => s + i.amount, 0)"
          flat
        />
      </div>
      <div class="results-column">
        <SectionTable
          title="Produits"
          :items="allProduits"
          :total="incomeStatement.produits.reduce((s, i) => s + i.amount, 0)"
          flat
        />
      </div>
    </div>

    <div v-if="incomeStatement" class="result-total">
      Résultat du compte : <strong>{{ formatCurrency(resultatNet) }}</strong>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import SectionTable from '../components/SectionTable.vue';
import { useCompta } from '../composables/useCompta';
import { COMPTA_CATEGORY_LABELS } from '@shared/types/compta';
import type { ComptaCategory } from '@shared/types/compta';

const {
  incomeStatement,
  incomeLoading,
  incomeError,
  fetchIncomeStatement,
} = useCompta();

const CHARGE_CATEGORIES = [
  'frais_immatriculation',
  'loyer',
  'electricite',
  'interets',
  'salaires',
  'achat_matieres',
];

const PRODUIT_CATEGORIES = [
  'vente',
  'revenu_service',
];

const allCharges = computed(() =>
  CHARGE_CATEGORIES.map(cat => {
    const found = incomeStatement.value?.charges.find(i => i.label === COMPTA_CATEGORY_LABELS[cat as ComptaCategory]);
    return { label: COMPTA_CATEGORY_LABELS[cat as ComptaCategory], amount: found ? found.amount : 0 };
  })
);

const allProduits = computed(() =>
  PRODUIT_CATEGORIES.map(cat => {
    const found = incomeStatement.value?.produits.find(i => i.label === COMPTA_CATEGORY_LABELS[cat as ComptaCategory]);
    return { label: COMPTA_CATEGORY_LABELS[cat as ComptaCategory], amount: found ? found.amount : 0 };
  })
);

const resultatNet = computed(() =>
  incomeStatement.value?.resultatNet ??
  (incomeStatement.value?.produits.reduce((s, i) => s + i.amount, 0) ?? 0) -
  (incomeStatement.value?.charges.reduce((s, i) => s + i.amount, 0) ?? 0)
);

const formatCurrency = (value: number) =>
  value.toLocaleString('fr-BE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  });

onMounted(() => {
  void fetchIncomeStatement();
});
</script>

<style scoped>
.income-view {
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
