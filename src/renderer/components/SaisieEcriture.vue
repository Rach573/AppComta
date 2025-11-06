<template>
  <div class="saisie-content">
    
    <div class="form-wrapper">
      <label>
        Type prédéfini
        <select v-model="selectedKey">
          <optgroup v-for="grp in autoOptions" :label="grp.group" :key="grp.group">
            <option v-for="opt in grp.options" :key="opt.key" :value="opt.key">{{ opt.label }}</option>
          </optgroup>
        </select>
      </label>
                <optgroup v-for="grp in autoOptions" :label="grp.group" :key="grp.group">
                  <option v-for="opt in grp.options" :key="opt.key" :value="opt.key">{{ opt.label }}</option>
                </optgroup>
        Montant
        <input v-model.number="amountAuto" type="number" step="0.01" placeholder="0.00" />
      </label>
      <label v-if="selectedKey === 'vente_meubles'">
        Coût des matières premières consommées (CdV)
        <input v-model.number="costOfGoodsSoldAmount" type="number" step="0.01" placeholder="0.00" />
      </label>
      <label v-if="requiresPaymentMode">
        Mode de paiement
        <select v-model="paymentMode">
          <option value="comptant">Comptant</option>
          <option value="credit">À crédit</option>
        </select>
      </label>
      <label v-if="selectedKey === 'remboursement_emprunt_interets'">
        Dont intérêts
        <input v-model.number="interestsPart" type="number" placeholder="0.00" />
      </label>
      <button @click="soumettreAuto" :disabled="!selectedKey || !amountAuto">Classer automatiquement</button>
    </div>

            <button @click="soumettreAuto" :disabled="!selectedKey || !amountAuto">Enregistrer l'opération</button>
      <h3>{{ resultat.libelle }}</h3>
      <p>Date : {{ new Date(resultat.date).toLocaleDateString() }}</p>
      <table>
        <thead>
          <tr><th>Compte</th><th>Libellé</th><th>Débit</th><th>Crédit</th></tr>
        </thead>
        <tbody>
          <tr v-for="(ligne, i) in resultat.lignes" :key="i">
            <td>{{ ligne.compte }}</td>
            <td>{{ ligne.libelle }}</td>
            <td>{{ ligne.debit || '-' }}</td>
            <td>{{ ligne.credit || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="erreur" class="erreur">{{ erreur }}</p>
  </div>
</template>


<script setup lang="ts">
import { computed, ref } from 'vue';
import { AUTO_OPTIONS_GROUPED, type AutoKey, type PaymentMode } from '@shared/autoClassifier';
import { COMPTA_CATEGORY_LABELS } from '@shared/types/compta';
const emit = defineEmits<{ (e: 'added'): void }>();

// Pour affichage symétrique (optionnel)
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
const incomeStatement = ref<any>(null); // à connecter si besoin
const allCharges = computed(() =>
  CHARGE_CATEGORIES.map(cat => {
    const found = incomeStatement.value?.charges?.find((i: { label: string; amount: number }) => i.label === COMPTA_CATEGORY_LABELS[cat as keyof typeof COMPTA_CATEGORY_LABELS]);
    return { label: COMPTA_CATEGORY_LABELS[cat as keyof typeof COMPTA_CATEGORY_LABELS], amount: found ? found.amount : 0 };
  })
);
const allProduits = computed(() =>
  PRODUIT_CATEGORIES.map(cat => {
    const found = incomeStatement.value?.produits?.find((i: { label: string; amount: number }) => i.label === COMPTA_CATEGORY_LABELS[cat as keyof typeof COMPTA_CATEGORY_LABELS]);
    return { label: COMPTA_CATEGORY_LABELS[cat as keyof typeof COMPTA_CATEGORY_LABELS], amount: found ? found.amount : 0 };
  })
);
defineExpose({ allCharges, allProduits });

declare global {
  interface Window {
    api: {
      ajouterEcriture: (description: string, montant: number) => Promise<any>;
    };
  }
}

const resultat = ref<any>(null);
const erreur = ref<string | null>(null);
// Options d'auto-classification
const autoOptions = AUTO_OPTIONS_GROUPED;
const selectedKey = ref<AutoKey | ''>('');
const amountAuto = ref<number | null>(null);
const paymentMode = ref<PaymentMode>('comptant');
const interestsPart = ref<number | null>(null);
const costOfGoodsSoldAmount = ref<number | null>(null);
const requiresPaymentMode = computed(() => {
  const group = autoOptions.find(g => g.options.some(o => o.key === selectedKey.value));
  const opt = group?.options.find(o => o.key === selectedKey.value);
  return Boolean(opt?.requiresPaymentMode);
});

const soumettreAuto = async () => {
  erreur.value = null;
  try {
    if (!selectedKey.value || !amountAuto.value) {
      throw new Error('Sélection et montant requis.');
    }
    // Validation CdV obligatoire pour vente_meubles
    if (selectedKey.value === 'vente_meubles' && (!costOfGoodsSoldAmount.value || costOfGoodsSoldAmount.value <= 0)) {
      throw new Error("Le coût des matières premières consommées (CdV) est obligatoire pour la vente.");
    }
    if (!window.electronService?.compta?.auto) {
      throw new Error('Service Electron non disponible.');
    }
    await window.electronService.compta.auto({
      key: selectedKey.value,
      amount: Number(amountAuto.value),
      paymentMode: requiresPaymentMode.value ? paymentMode.value : undefined,
      interestsPart: selectedKey.value === 'remboursement_emprunt_interets' && interestsPart.value ? Number(interestsPart.value) : undefined,
      costOfGoodsSoldAmount: selectedKey.value === 'vente_meubles' && costOfGoodsSoldAmount.value != null ? Number(costOfGoodsSoldAmount.value) : undefined,
    });
    emit('added');
    selectedKey.value = '';
    amountAuto.value = null;
    interestsPart.value = null;
    costOfGoodsSoldAmount.value = null;
  } catch (e) {
    erreur.value = (e as any)?.message ?? String(e);
  }
};
</script>

<style scoped>
/* Remplacer .saisie par .saisie-content et simplifier les styles */
.saisie-content {
  padding: 0;
  max-width: none;
  margin: 0;
}
.form-wrapper { /* Remplacer .bloc */
  margin-bottom: 0rem;
  padding: 0;
  border: none;
  background: none;
  display: grid;
  gap: 1.2rem; /* Aligner avec le style de App.vue */
}
/* Le reste des styles (.erreur, .resultat, table, etc.) doit rester inchangé */

/* Surcharge des styles globaux du formulaire pour la cohérence */
.form-wrapper label {
  display: grid;
  gap: 0.5rem;
  font-weight: 600;
  color: #4c1d95; /* Couleur de App.vue */
}
.form-wrapper input,
.form-wrapper select {
  padding: 0.75rem;
  border: 1px solid rgba(91, 95, 151, 0.25);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
}

.form-wrapper button {
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

.form-wrapper button:disabled {
  opacity: 0.7;
  cursor: wait;
  box-shadow: none;
}

.resultat {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f0fdf4;
  border-radius: 8px;
  border: 1px solid #86efac;
}

.resultat h3 {
  margin-top: 0;
  color: #166534;
}

.resultat table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.resultat th,
.resultat td {
  padding: 0.5rem;
  text-align: left;
  border-bottom: 1px solid #d1fae5;
}

.resultat th {
  font-weight: 600;
  background: #dcfce7;
  color: #166534;
}

.erreur {
  color: #dc2626;
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fee2e2;
  border-radius: 8px;
  border: 1px solid #fca5a5;
}
</style>
