<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import SaisieEcriture from './components/SaisieEcriture.vue';
import SectionTable from './components/SectionTable.vue';
import type {
  BalanceSheetSummary,
  ComptaCategory,
  ComptaEntry,
  IncomeStatementSummary,
  CashflowSummary,
} from '@shared/types/compta';
import {
  COMPTA_CATEGORY_GROUP,
  COMPTA_CATEGORY_LABELS,
} from '@shared/types/compta';

const entriesLoading = ref(false);
const savingEntry = ref(false);
const balanceLoading = ref(false);
const deletingEntryId = ref<string | null>(null);
const currentView = ref<'entries' | 'balance' | 'income' | 'cashflow'>('entries');

// Données pour compte de résultat et cashflow
const incomeStatement = ref<IncomeStatementSummary | null>(null);
const incomeLoading = ref(false);
const incomeError = ref<string | null>(null);
const cashflow = ref<CashflowSummary | null>(null);
const cashflowLoading = ref(false);
const cashflowError = ref<string | null>(null);

// Adaptation Cashflow -> SectionTable: construire des listes à partir des totaux numériques
// Affichage détaillé de tous les flux par catégorie (pour rendre tout visible)
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
    { label: "Investissements payés", amount: cashflow.value.investissement },
    { label: "Apports en capital", amount: cashflow.value.apports ?? 0 },
    { label: "Emprunts reçus", amount: cashflow.value.emprunts ?? 0 },
    { label: "Remboursements emprunts", amount: cashflow.value.remboursements ?? 0 },
    { label: "Total financement", amount: cashflow.value.financement },
  ];
});

// Générer toutes les lignes (même à zéro) pour le compte de résultat
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

const fetchIncomeStatement = async () => {
  incomeLoading.value = true;
  incomeError.value = null;
  try {
    incomeStatement.value = await window.electronService.compta.income();
  } catch (error) {
    incomeError.value = 'Erreur lors du chargement du compte de résultat.';
  } finally {
    incomeLoading.value = false;
  }
};

const fetchCashflow = async () => {
  cashflowLoading.value = true;
  cashflowError.value = null;
  try {
    cashflow.value = await window.electronService.compta.cashflow();
  } catch (error) {
    cashflowError.value = 'Erreur lors du chargement du cashflow.';
  } finally {
    cashflowLoading.value = false;
  }
};

const entries = ref<ComptaEntry[]>([]);
const balanceSheet = ref<BalanceSheetSummary | null>(null);

const form = reactive({
  label: '',
  amount: 0,
  category: 'frais_etablissement' as ComptaCategory,
});

const entryError = ref<string | null>(null);
const balanceError = ref<string | null>(null);
const historiqueExpanded = ref(true);

const dashboardBalance = computed(() =>
  entries.value.reduce((total, { amount }) => total + amount, 0),
);

const toggleHistorique = () => {
  historiqueExpanded.value = !historiqueExpanded.value;
};

const updateLabel = () => {
  form.label = COMPTA_CATEGORY_LABELS[form.category];
};

const formatCurrency = (value: number) =>
  value.toLocaleString('fr-BE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  });

const categoryGroups = computed(() => {
  const map = new Map<
    string,
    {
      key: string;
      group: 'actif' | 'passif';
      label: string;
      options: { value: ComptaCategory; label: string }[];
    }
  >();

  (Object.entries(COMPTA_CATEGORY_LABELS) as [ComptaCategory, string][]).forEach(
    ([value, label]) => {
      const meta = COMPTA_CATEGORY_GROUP[value];
      const key = `${meta.group}-${meta.section}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          group: meta.group,
          label: meta.section,
          options: [],
        });
      }
      map.get(key)?.options.push({ value, label });
    },
  );

  return Array.from(map.values())
    .sort((a, b) => {
      if (a.group === b.group) {
        return a.label.localeCompare(b.label);
      }
      return (a.group === 'actif' ? 0 : 1) - (b.group === 'actif' ? 0 : 1);
    })
    .map((group) => ({
      ...group,
      options: group.options.sort((a, b) => a.label.localeCompare(b.label)),
    }));
});

const assetSections = computed(() => balanceSheet.value?.assets ?? []);
const liabilitySections = computed(() => balanceSheet.value?.liabilities ?? []);
const totalAssets = computed(() => balanceSheet.value?.totalAssets ?? 0);
const totalLiabilities = computed(() => balanceSheet.value?.totalLiabilities ?? 0);

const categoryLabel = (category: ComptaCategory) => COMPTA_CATEGORY_LABELS[category];
const isDeleting = (id: string) => deletingEntryId.value === id;

const resetForm = () => {
  form.label = '';
  form.amount = 0;
  form.category = 'vente';
};

const fetchEntries = async () => {
  entriesLoading.value = true;
  entryError.value = null;

  try {
    entries.value = await window.electronService.compta.list();
  } catch (error) {
    console.error(error);
    entryError.value = 'Impossible de charger les ecritures comptables.';
  } finally {
    entriesLoading.value = false;
  }
};

const submit = async () => {
  if (!form.label.trim()) {
    entryError.value = 'Veuillez donner un libelle.';
    return;
  }

  const numericAmount = Number(form.amount);
  if (!Number.isFinite(numericAmount)) {
    entryError.value = 'Veuillez fournir un montant valide.';
    return;
  }

  savingEntry.value = true;
  entryError.value = null;

  try {
    await window.electronService.compta.register({
      label: form.label.trim(),
      amount: numericAmount,
      category: form.category,
    });
    await fetchEntries();
    await generateBalance();
    await fetchIncomeStatement();
    await fetchCashflow();
    resetForm();
  } catch (error) {
    console.error(error);
    entryError.value = "L'enregistrement comptable a echoue.";
  } finally {
    savingEntry.value = false;
  }
};

const deleteEntry = async (id: string) => {
  deletingEntryId.value = id;
  entryError.value = null;

  try {
    const removed = await window.electronService.compta.remove(id);
    if (!removed) {
      entryError.value = "L'ecriture a deja ete supprimee.";
    }
    await fetchEntries();
    await generateBalance();
  } catch (error) {
    console.error(error);
    entryError.value = 'La suppression a echoue.';
  } finally {
    deletingEntryId.value = null;
  }
};

const generateBalance = async () => {
  balanceLoading.value = true;
  balanceError.value = null;

  try {
    balanceSheet.value = await window.electronService.compta.balance();
  } catch (error) {
    console.error(error);
    balanceError.value = 'La generation du bilan a echoue.';
  } finally {
    balanceLoading.value = false;
  }
};

const cloturerExercice = async () => {
  try {
    const res = await window.electronService.compta.cloture();
    await generateBalance();
    return res;
  } catch (e) {
    console.error('Erreur clôture', e);
  }
};

const testLogique = async () => {
  console.log('🧪 Lancement du test de la logique comptable...');
  try {
    const result = await window.electronService.compta.test();
    console.log('✅ Test terminé avec succès');
    return result;
  } catch (error) {
    console.error('❌ Erreur lors du test :', error);
  }
};

const testEcoBois = async () => {
  console.log('🌳 Lancement du test ÉcoBois...');
  try {
    const result = await window.electronService.compta.testEcoBois();
    console.log('✅ Test ÉcoBois terminé avec succès');
    await fetchEntries();
    await generateBalance();
    await fetchIncomeStatement();
    await fetchCashflow();
    return result;
  } catch (error) {
    console.error('❌ Erreur lors du test ÉcoBois :', error);
  }
};

const goTo = async (view: 'entries' | 'balance' | 'income' | 'cashflow') => {
  currentView.value = view;
  if (view === 'balance') {
    await generateBalance();
  } else if (view === 'income') {
    await fetchIncomeStatement();
  } else if (view === 'cashflow') {
    await fetchCashflow();
  }
};

onMounted(() => {
  void fetchEntries();
  void generateBalance();
});
</script>

<template>
  <div class="app-shell">
    <main class="layout">
      <header class="hero">
        <div>
          <h1>AppCompta</h1>
          <p>Suivez vos ecritures et visualisez votre bilan en un clin d'oeil.</p>
        </div>
        <div
          class="hero-balance"
          :class="{ negative: dashboardBalance < 0, positive: dashboardBalance >= 0 }"
        >
          Solde courant
          <strong>{{ formatCurrency(dashboardBalance) }}</strong>
        </div>
      </header>


      <nav class="tabs">
        <button type="button" :class="{ active: currentView === 'entries' }" @click="goTo('entries')">Ecritures</button>
        <button type="button" :class="{ active: currentView === 'balance' }" @click="goTo('balance')">Bilan</button>
        <button type="button" :class="{ active: currentView === 'income' }" @click="goTo('income')">Compte de résultat</button>
        <button type="button" :class="{ active: currentView === 'cashflow' }" @click="goTo('cashflow')">Cashflow</button>
      </nav>

      <section v-if="currentView === 'entries'" class="entries-view">
        <section class="card form-card">
          <h2>Nouvelle ecriture</h2>
          <form @submit.prevent="submit">
            <label>
              Type d'écriture
              <select v-model="form.category" @change="updateLabel">
                <optgroup
                  v-for="group in categoryGroups"
                  :key="group.key"
                  :label="`${group.label} (${group.group === 'actif' ? 'Actif' : 'Passif'})`"
                >
                  <option
                    v-for="option in group.options"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </optgroup>
              </select>
            </label>
            <label>
              Montant (EUR)
              <input v-model.number="form.amount" type="number" step="0.01" placeholder="0.00" />
            </label>
            <button type="submit" :disabled="savingEntry">
              {{ savingEntry ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </form>
          <p v-if="entryError" class="error">{{ entryError }}</p>
        </section>

        <section class="card form-card">
          <div class="section-header">
            <div>
              <h2>Saisie automatique (par description)</h2>
              <p class="subtitle">Tapez une description (ex: "achat machine") et un montant – la catégorie est déduite automatiquement.</p>
            </div>
          </div>
          <SaisieEcriture @added="() => { void fetchEntries(); void generateBalance(); void fetchIncomeStatement(); void fetchCashflow(); }" />
        </section>

        <section class="card entries">
          <div class="entries-header" @click="toggleHistorique">
            <h2>Historique des ecritures ({{ entries.length }})</h2>
            <span class="toggle-icon">{{ historiqueExpanded ? '▼' : '▶' }}</span>
          </div>
          <div v-show="historiqueExpanded" class="entries-content">
            <p v-if="entriesLoading">Chargement...</p>
            <p v-else-if="entries.length === 0">Aucune ecriture pour le moment.</p>
            <div v-else class="entries-scroll">
              <ul>
                <li v-for="entry in entries" :key="entry.id">
                  <div class="entry-main">
                    <span class="label">{{ entry.label }}</span>
                    <span class="category">{{ categoryLabel(entry.category) }}</span>
                  </div>
                  <div class="entry-meta">
                    <span class="amount" :class="{ negative: entry.amount < 0 }">
                      {{ formatCurrency(entry.amount) }}
                    </span>
                    <span class="date">
                      {{ new Date(entry.createdAt).toLocaleString('fr-BE') }}
                    </span>
                  </div>
                  <button
                    type="button"
                    class="ghost"
                    :disabled="isDeleting(entry.id)"
                    @click="deleteEntry(entry.id)"
                  >
                    {{ isDeleting(entry.id) ? 'Suppression...' : 'Supprimer' }}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </section>

      <section v-else-if="currentView === 'balance'" class="card balance-card">
        <div class="section-header">
          <div>
            <h2>Bilan comptable</h2>
            <p class="subtitle">Visualisation inspiree de la presentation classique Actif / Passif</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button type="button" @click="testLogique" class="btn-test" title="Tester la logique comptable (voir console)">
              🧪 Test
            </button>
            <button type="button" @click="testEcoBois" class="btn-test" title="Tester l'exercice ÉcoBois (voir console)" style="background: #1a936f;">
              🌳 Test ÉcoBois
            </button>
            <button type="button" @click="generateBalance" :disabled="balanceLoading">
              {{ balanceLoading ? 'Generation...' : 'Actualiser le bilan' }}
            </button>
            <button type="button" @click="cloturerExercice" title="Clôturer l'exercice et reporter le résultat">
              Clôturer l'exercice
            </button>
          </div>
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
                Total de l'Actif : <strong>{{ formatCurrency(totalAssets) }}</strong>
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
                Total du Passif : <strong>{{ formatCurrency(totalLiabilities) }}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section v-else-if="currentView === 'income'" class="card balance-card">
        <div class="section-header">
          <div>
            <h2>Compte de résultat</h2>
            <p class="subtitle">Présentation Charges / Produits avec toutes les lignes, même à zéro</p>
          </div>
        </div>
        <div v-if="incomeLoading">Chargement...</div>
        <div v-else-if="incomeError" class="error">{{ incomeError }}</div>
        <div v-else-if="incomeStatement" class="balance-grid">
          <div class="balance-column">
            <SectionTable
              title="Charges"
              :items="allCharges"
              :total="incomeStatement.charges.reduce((s, i) => s + i.amount, 0)"
            />
          </div>
          <div class="balance-column">
            <SectionTable
              title="Produits"
              :items="allProduits"
              :total="incomeStatement.produits.reduce((s, i) => s + i.amount, 0)"
            />
          </div>
        </div>
      </section>

      <section v-else-if="currentView === 'cashflow'" class="card balance-card">
        <div class="section-header">
          <div>
            <h2>Cashflow</h2>
            <p class="subtitle">Présentation symétrique, toutes les lignes affichées même à zéro</p>
          </div>
        </div>
        <div v-if="cashflowLoading">Chargement...</div>
        <div v-else-if="cashflowError" class="error">{{ cashflowError }}</div>
        <div v-else-if="cashflow" class="balance-grid">
          <div class="balance-column">
            <SectionTable
              title="Exploitation"
              :items="cashflowItemsExploitation"
              :total="cashflowItemsExploitation.reduce((s, i) => s + i.amount, 0)"
            />
          </div>
          <div class="balance-column">
            <SectionTable
              title="Financement & Investissement"
              :items="cashflowItemsFinInv"
              :total="cashflowItemsFinInv.reduce((s, i) => s + i.amount, 0)"
            />
          </div>
        </div>
        <div v-if="cashflow" class="grand-total" style="margin-top:1.5rem; color:#1a936f;">
          Variation nette de trésorerie : <strong>{{ formatCurrency(cashflow.net) }}</strong>
        </div>
      </section>

    </main>
  </div>
</template>

<style scoped>
:global(body) {
  margin: 0;
  font-family: 'Inter', Arial, sans-serif;
  background: linear-gradient(135deg, #f3e8ff 0%, #e0f2ff 50%, #f4e1ff 100%);
  min-height: 100vh;
  color: #1f2933;
}

.app-shell {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: stretch;
  padding: 3rem 1.5rem;
  box-sizing: border-box;
}

.layout {
  width: min(1100px, 100%);
  display: grid;
  gap: 2rem;
}

.hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 2rem 2.5rem;
  box-shadow: 0 20px 45px rgba(124, 58, 237, 0.15);
  border: 1px solid rgba(124, 58, 237, 0.12);
}

.hero h1 {
  margin: 0 0 0.5rem;
  font-size: 2rem;
  color: #4c1d95;
}

.hero p {
  margin: 0;
  color: #5b5f97;
  font-weight: 500;
}

.hero-balance {
  text-align: right;
  font-weight: 600;
  font-size: 1.05rem;
  color: #5b5f97;
  display: grid;
  gap: 0.25rem;
}

.hero-balance strong {
  font-size: 1.6rem;
  color: inherit;
}

.hero-balance.positive {
  color: #1a936f;
}

.hero-balance.negative {
  color: #d64545;
}

.tabs {
  display: inline-flex;
  align-self: center;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 999px;
  padding: 0.35rem;
  box-shadow: 0 12px 30px rgba(91, 95, 151, 0.15);
}

.tabs button {
  border: none;
  background: transparent;
  padding: 0.6rem 1.8rem;
  border-radius: 999px;
  font-weight: 600;
  color: #5b5f97;
  transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.tabs button.active {
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  color: #fff;
  box-shadow: 0 10px 25px rgba(79, 70, 229, 0.35);
}

.tabs button:not(.active):hover {
  background: rgba(124, 58, 237, 0.1);
}

.entries-view {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.card {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 18px 35px rgba(91, 95, 151, 0.15);
  border: 1px solid rgba(91, 95, 151, 0.12);
}

.form-card form {
  display: grid;
  gap: 1.2rem;
}

label {
  display: grid;
  gap: 0.5rem;
  font-weight: 600;
  color: #4c1d95;
}

input,
select {
  padding: 0.75rem;
  border: 1px solid rgba(91, 95, 151, 0.25);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input:focus,
select:focus {
  outline: none;
  border-color: #7c3aed;
  box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.15);
}

select optgroup {
  font-weight: 700;
  font-style: normal;
  color: #4c1d95;
}

button {
  justify-self: flex-start;
  padding: 0.75rem 1.8rem;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

button:disabled {
  opacity: 0.7;
  cursor: wait;
  box-shadow: none;
}

button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 30px rgba(79, 70, 229, 0.35);
}

.btn-test {
  background: linear-gradient(135deg, #3BA18B, #2d8574);
  font-size: 0.9rem;
  padding: 0.6rem 1.2rem;
}

.btn-test:hover {
  box-shadow: 0 12px 24px rgba(59, 161, 139, 0.35);
}

.ghost {
  background: rgba(124, 58, 237, 0.08);
  color: #7c3aed;
  border: 1px solid rgba(124, 58, 237, 0.25);
  padding: 0.5rem 1.2rem;
  border-radius: 10px;
}

.ghost:not(:disabled):hover {
  background: rgba(124, 58, 237, 0.2);
}

.entries ul {
  list-style: none;
  padding: 0;
  margin: 1.5rem 0 0;
  display: grid;
  gap: 1rem;
}

.entries li {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem 1.25rem;
  border: 1px solid rgba(91, 95, 151, 0.15);
  border-radius: 14px;
  background: #fff;
}

.entry-main {
  display: grid;
  gap: 0.25rem;
}

.entries .label {
  font-weight: 600;
  color: #302b63;
}

.entries .category {
  color: #5b5f97;
}

.entry-meta {
  display: grid;
  gap: 0.25rem;
  justify-items: end;
  font-size: 0.9rem;
}

.entries .amount {
  font-weight: 600;
  color: #302b63;
}

.entries .amount.negative {
  color: #d64545;
}

.entries .date {
  color: #5b5f97;
}

/* Styles pour l'historique déroulant */
.entries-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(124, 58, 237, 0.1);
}

.entries-header:hover {
  opacity: 0.8;
}

.toggle-icon {
  font-size: 1.2rem;
  color: #7c3aed;
  transition: transform 0.2s ease;
}

.entries-content {
  margin-top: 1rem;
}

.entries-scroll {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.entries-scroll::-webkit-scrollbar {
  width: 6px;
}

.entries-scroll::-webkit-scrollbar-track {
  background: rgba(124, 58, 237, 0.05);
  border-radius: 10px;
}

.entries-scroll::-webkit-scrollbar-thumb {
  background: rgba(124, 58, 237, 0.3);
  border-radius: 10px;
}

.entries-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(124, 58, 237, 0.5);
}

.balance-card {
  display: grid;
  gap: 1.8rem;
}

.balance-card .section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
}

.balance-card .subtitle {
  margin: 0.35rem 0 0;
  color: #5b5f97;
}

.balance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
}

.balance-column {
  display: grid;
  gap: 1.2rem;
}

.balance-title {
  font-size: 1.6rem;
  text-align: center;
  font-weight: 700;
}

.balance-title.actif {
  color: #d53f8c;
}

.balance-title.passif {
  color: #4f46e5;
}

.balance-box {
  border: 2px solid rgba(91, 95, 151, 0.2);
  border-radius: 18px;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  display: grid;
  gap: 1.5rem;
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
  text-align: center;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(91, 95, 151, 0.25);
}

.grand-total.actif {
  color: #d53f8c;
}

.grand-total.passif {
  color: #4f46e5;
}

.error {
  color: #d64545;
  margin-top: 1.2rem;
  font-weight: 600;
}

@media (max-width: 720px) {
  .hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-balance {
    text-align: left;
  }

  .entries li {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    justify-items: start;
  }

  .entry-meta {
    justify-items: start;
  }

  .tabs {
    width: 100%;
    justify-content: space-between;
  }

  .tabs button {
    flex: 1;
  }
}
</style>
