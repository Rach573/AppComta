<template>
  <div class="saisie">
    <h2>Ajouter une écriture comptable</h2>
    <input v-model="description" placeholder="Ex: achat machine" />
    <input v-model.number="montant" type="number" placeholder="Montant" />
    <button @click="soumettre">Ajouter</button>

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
import { ref } from 'vue';

declare global {
  interface Window {
    api: {
      ajouterEcriture: (description: string, montant: number) => Promise<any>;
    };
  }
}

const description = ref('');
const montant = ref<number | null>(null);
const resultat = ref<any>(null);
const erreur = ref<string | null>(null);

const soumettre = async () => {
  erreur.value = null;
  resultat.value = null;
  try {
    if (!description.value || !montant.value) {
      throw new Error("Description et montant requis.");
    }
    const res = await window.api.ajouterEcriture(description.value, montant.value);
    resultat.value = res;
  } catch (e: any) {
    erreur.value = e.message;
  }
};
</script>

<style scoped>
.saisie {
  padding: 1rem;
  max-width: 600px;
  margin: auto;
}
.erreur {
  color: red;
}
</style>
