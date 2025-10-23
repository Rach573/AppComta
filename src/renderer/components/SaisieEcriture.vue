<template>
  <div class="saisie">
    <h2>Ajouter une écriture comptable</h2>


    <div class="bloc">
      <h3>Sélection assistée</h3>
      <label>
        Type prédéfini
        <select v-model="selectedKey">
          <optgroup v-for="grp in autoOptions" :label="grp.group" :key="grp.group">
            <option v-for="opt in grp.options" :key="opt.key" :value="opt.key">{{ opt.label }}</option>
          </optgroup>
        </select>
      </label>
      <label>
        Montant
        <input v-model.number="amountAuto" type="number" placeholder="0.00" />
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

    <div v-if="resultat" class="resultat">
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
    if (!window.electronService?.compta?.auto) {
      throw new Error('Service Electron non disponible.');
    }
    await window.electronService.compta.auto({
      key: selectedKey.value,
      amount: Number(amountAuto.value),
      paymentMode: requiresPaymentMode.value ? paymentMode.value : undefined,
      interestsPart: selectedKey.value === 'remboursement_emprunt_interets' && interestsPart.value ? Number(interestsPart.value) : undefined,
    });
    emit('added');
    selectedKey.value = '';
    amountAuto.value = null;
    interestsPart.value = null;
  } catch (e) {
    erreur.value = (e as any)?.message ?? String(e);
  }
};
</script>

<style scoped>
.saisie {
  padding: 1rem;
  max-width: 700px;
  margin: auto;
}
.bloc {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}
.bloc h3 {
  margin-top: 0;
  color: #333;
}
label {
  display: block;
  margin-bottom: 0.5rem;
}
input, select {
  width: 100%;
  margin-top: 0.3rem;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  margin-top: 1rem;
  padding: 0.7rem 1.5rem;
  background: #3BA18B;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
button:not(:disabled):hover {
  background: #2e8271;
}
.erreur {
  color: red;
}
</style>
