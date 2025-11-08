/* NOUVEAU : Utiliser Flexbox pour le contrôle vertical dans le bilan */
.balance-box {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex-grow: 1;
}
.balance-section {
  margin-bottom: 0;
}
.balance-section:last-of-type {
  flex-grow: 1;
  margin-bottom: 1.5rem;
}
/* 1. STYLES SPÉCIFIQUES AU HERO (Logo et Titre) */
.logo-hero {
  height: 80px; /* Taille augmentée à 80px */
  width: auto;
  flex-shrink: 0;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.1)); 
}
.hero h1 {
  margin: 0 0 0.25rem;
  font-size: 2.2rem; 
  color: #1e3a8a; /* Bleu Marine */
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  letter-spacing: -0.5px;
}
.hero p {
  margin: 0;
  color: #4b5563; /* Gris foncé */
  font-weight: 400;
  font-style: italic;
  font-size: 1.05rem; 
  font-family: 'Inter', sans-serif;
}
/* 2. STYLES DES TITRES DE SECTION (Historique aligné sur 'Opération comptable') */
.card h2.section-title-coherence {
  color: #1e3a8a; /* Bleu Marine pour les titres de section classiques */
  margin-top: 0;
  font-size: 1.6rem;
  font-weight: 700;
}
/* Style spécifique pour "Historique des écritures" pour correspondre au label "Opération comptable" */
.entries-header .historique-label {
  color: #4c1d95;
  font-weight: 600;
  font-size: 1rem;
  font-family: inherit;
  margin: 0;
}

/* Forcer tous les titres à utiliser la même police que le reste de la page */
:global(h1),
:global(h2),
:global(h3),
:global(h4),
:global(h5),
:global(h6) {
  font-family: inherit !important;
}
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
    { label: "Investissements payés", amount: -(cashflow.value.investissementsPayes ?? 0) },
    { label: "Apports en capital", amount: cashflow.value.apports ?? 0 },
    { label: "Emprunts reçus", amount: cashflow.value.emprunts ?? 0 },
    { label: "Remboursements emprunts", amount: cashflow.value.remboursements ?? 0 },
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
        <div class="hero-title-area">
          <img src="./assets/logoequilibro.png" alt="Logo Équili Bro'" class="logo-hero">
          <div>
            <h1>Équili Bro'</h1>
            <p>Gère ton business avec ton Bro' comptable.</p>
          </div>
        </div>
        
      </header>


      <nav class="tabs">
        <button type="button" :class="{ active: currentView === 'entries' }" @click="goTo('entries')">Ecritures</button>
        <button type="button" :class="{ active: currentView === 'balance' }" @click="goTo('balance')">Bilan</button>
        <button type="button" :class="{ active: currentView === 'income' }" @click="goTo('income')">Compte de résultat</button>
        <button type="button" :class="{ active: currentView === 'cashflow' }" @click="goTo('cashflow')">Cashflow</button>
      </nav>

      <section v-if="currentView === 'entries'" class="entries-view">
        <section class="card form-card" style="grid-column: 1 / -1; max-width: 600px; justify-self: center;">
          
          <div class="manual-form" style="display: none;"> 
          </div>
          
          <div class="section-header" style="margin-top: 1.5rem;"></div>
          <SaisieEcriture @added="() => { void fetchEntries(); void generateBalance(); void fetchIncomeStatement(); void fetchCashflow(); }" />
        </section>

        <section class="card entries" style="grid-column: 1 / -1;">
          <div class="entries-header" @click="toggleHistorique">
            <h2 class="historique-label">Historique des écritures ({{ entries.length }})</h2>
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
            
          </div>
          <div style="display: flex; gap: 10px;">
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
      </section>

      <section v-else-if="currentView === 'income'" class="card balance-card">
        <div class="section-header"></div>
        <div v-if="incomeLoading">Chargement...</div>
        <div v-else-if="incomeError" class="error">{{ incomeError }}</div>
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
        <div v-if="incomeStatement" class="grand-total" style="margin-top:1.5rem; color:#1a936f;">
          Résultat du compte : <strong>{{ formatCurrency(incomeStatement.resultatNet ?? (incomeStatement.produits.reduce((s,i)=>s+i.amount,0) - incomeStatement.charges.reduce((s,i)=>s+i.amount,0))) }}</strong>
        </div>
      </section>

      <section v-else-if="currentView === 'cashflow'" class="card balance-card">
        <div class="section-header"></div>
        <div v-if="cashflowLoading">Chargement...</div>
        <div v-else-if="cashflowError" class="error">{{ cashflowError }}</div>
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
            
        <div v-if="cashflow" class="grand-total" style="margin-top:1.5rem; color:#1a936f;">
          Variation nette de trésorerie : <strong>{{ formatCurrency(cashflow.net) }}</strong>
        </div>
      </section>

    </main>
  </div>
</template>

<style scoped>
:global(body) {
/* Mise en page côte à côte Charges / Produits et Cashflow */
.results-grid {
  display: flex;
  flex-wrap: nowrap; /* force 2 colonnes côte à côte */
  gap: 2rem;
  align-items: stretch;
}
.results-column {
  flex: 1 1 0; /* deux colonnes qui partagent l'espace */
  min-width: 0; /* autorise le rétrécissement sans wrap */
  display: flex;
}
.results-column > * {
  flex: 1;
  min-width: 0;
}
/* Optionnel: permettre le scroll horizontal si l'écran est trop étroit */
.results-grid {
  overflow-x: auto;
}
  margin: 0;
  font-family: 'Inter', Arial, sans-serif;
  background: linear-gradient(135deg, #f0f4f8 0%, #e8edf1 100%);
  min-height: 100vh;
  color: #374151; /* Nouveau gris foncé professionnel */
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
  height: 60px;
  width: auto;
  flex-shrink: 0;
}

.hero h1 {
  margin: 0 0 0.25rem;
  font-size: 2.2rem;
  color: #1e3a8a; /* Bleu Marine sur fond clair */
  font-family: 'Montserrat', sans-serif; /* Police souhaitée pour le titre */
  font-weight: 700;
  letter-spacing: -0.5px;
}

.hero p {
  margin: 0;
  color: #4b5563; /* Gris foncé lisible sur fond clair */
  font-weight: 400;
  font-style: italic; /* Donne du caractère au slogan */
  font-size: 1.05rem;
  font-family: 'Inter', sans-serif; /* Police souhaitée pour le slogan */
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
  color: #1e3a8a; /* Bleu Marine par défaut */
}

.hero-balance.positive {
  color: #059669; /* Vert Émeraude */
}

.hero-balance.negative {
  color: #d64545;
}

.tabs {
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 999px;
  padding: 0.35rem 1.5rem;
  box-shadow: 0 12px 30px rgba(6, 182, 212, 0.12); /* Cyan shadow */
  max-width: 520px;
  margin: 0 auto;
}

.tabs button {
  border: none;
  background: transparent;
  padding: 0.6rem 1.8rem;
  border-radius: 999px;
  font-weight: 600;
  color: #1e3a8a; /* Bleu Marine */
  transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.tabs button.active {
  background: linear-gradient(135deg, #06b6d4, #1e3a8a); /* Cyan -> Bleu Marine */
  color: #fff;
  box-shadow: 0 8px 15px rgba(6, 182, 212, 0.3);
}

.tabs button:not(.active):hover {
  background: rgba(6, 182, 212, 0.1); /* Cyan hover */
  color: #06b6d4;
}

.entries-view {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

@media (max-width: 720px) {
  /* Supprimer le bloc de media query si vous voulez forcer la saisie sur une seule colonne large */
}

.card {
  display: inline-flex;
  align-self: center;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 999px;
  padding: 0.35rem;
  box-shadow: 0 12px 30px rgba(91, 95, 151, 0.15);
  justify-content: center;
  width: 100%;
  margin: 0 auto;
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
  color: #1e3a8a; /* Bleu Marine pour les libellés importants */
}

.entries .category {
  color: #6b7280; /* Gris doux */
}

.entry-meta {
  display: grid;
  gap: 0.25rem;
  justify-items: end;
  font-size: 0.9rem;
}

.entries .amount {
  font-weight: 600;
  color: #1e3a8a; /* Bleu Marine pour les montants */
}

.entries .amount.negative {
  color: #dc2626;
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
  border-bottom: 2px solid rgba(6, 182, 212, 0.1);
}

.entries-header:hover {
  opacity: 0.8;
}

.toggle-icon {
  font-size: 1.2rem;
  color: #06b6d4; /* Cyan pour l'icône déroulante */
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

/* Harmonisation visuelle : colonnes égales et même nombre de lignes */
.balance-grid {
  display: flex;
  gap: 2rem;
  align-items: stretch;
}
.balance-grid {
  display: flex; /* Utiliser Flexbox pour la taille égale */
  gap: 2rem;
  flex-wrap: wrap;
  align-items: stretch; /* CRITIQUE : Assure que les colonnes ont la même hauteur */
}

.balance-column {
  flex: 1 1 45%; /* CRITIQUE : Répartition égale de l'espace horizontal */
  min-width: 300px;
  display: flex; /* CHANGER : Passer à flex pour contrôler l'étirement des enfants (balance-box) */
  flex-direction: column;
  gap: 1.2rem;
}

.balance-box {
  border: 2px solid rgba(91, 95, 151, 0.2);
  border-radius: 18px;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  display: grid;
  gap: 1.5rem;
  flex-grow: 1; /* CRITIQUE : Permet à la boîte de contenu de prendre toute la hauteur */
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
  display: flex;
  justify-content: space-between;
  text-align: left;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(91, 95, 151, 0.25);
  margin-top: auto; /* Ancrage au bas du conteneur Flex */
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
