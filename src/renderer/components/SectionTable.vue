<script setup lang="ts">
/**
 * 📊 Objectif : 
 * Générer dynamiquement l'affichage des sections comptables (bilan, compte de résultat, cashflow)
 * avec la structure visuelle suivante :
 *
 * 🔷 Structure attendue par section :
 * - Le nom de la section (ex: "Actifs Immobilisés", "Fonds propres", "Charges d'exploitation", etc.) est affiché en titre.
 * - Chaque ligne de la section comprend :
 *    - À gauche : le **libellé** (ex: "Brevet", "Équipements", "Salaire", "Ventes", etc.)
 *    - À droite : le **montant formaté** (ex: "70 000 €"), aligné à droite.
 * - En bas de chaque section, une ligne **Total** est affichée avec le total cumulé de la section.
 *
 * ✅ Exemple attendu (dans le DOM ou rendu visuel) pour une section :
 * 
 * Actifs Immobilisés
 * ┌────────────────────┬────────────┐
 * │ Brevet             │ 10 000 €   │
 * │ Équipements        │ 70 000 €   │
 * ├────────────────────┼────────────┤
 * │ Total              │ 80 000 €   │
 * └────────────────────┴────────────┘
 *
 * Ce modèle doit être appliqué :
 * - Aux sections d’actif et de passif du **bilan**,
 * - Aux sections "Charges" et "Produits" du **compte de résultat**,
 * - Aux catégories "Opérationnel", "Investissement" et "Financement" du **cashflow**.
 *
 * 💡 Règles :
 * - Les montants doivent être formatés en EUR avec `toLocaleString`.
 * - Chaque section peut contenir plusieurs éléments (`{ label, amount }`).
 * - La somme des montants d'une section doit être affichée en **gras**.
 * - Le rendu doit être propre et adapté pour affichage en tableau, flex ou grid.
 *
 * 🎨 Astuce UI :
 * Utiliser CSS Grid ou Flexbox avec deux colonnes :
 * - Colonne gauche : alignement à gauche du label.
 * - Colonne droite : alignement à droite du montant.
 *
 * 📦 Résultat attendu :
 * Un composant Vue qui prend une section de données et affiche :
 * - le titre
 * - les lignes { label, amount }
 * - le total cumulé
 */

const props = defineProps<{
  title: string;
  items: { label: string; amount: number }[];
  total?: number;
  flat?: boolean; // affine le style pour un rendu plus "plat" (sans effet carte)
}>();

function formatCurrency(value: number) {
  return value.toLocaleString('fr-BE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  });
}
</script>
<template>
  <div class="section-table" :class="{ flat: props.flat }">
    <div class="section-title">{{ title }}</div>
    <div class="section-table-grid">
      <div v-for="item in items" :key="item.label" class="section-row">
        <span class="section-label">{{ item.label }}</span>
        <span class="section-amount">{{ formatCurrency(item.amount) }}</span>
      </div>
      <div class="section-row section-total">
        <span class="section-label">Total</span>
        <span class="section-amount">{{ formatCurrency(total ?? items.reduce((sum, i) => sum + i.amount, 0)) }}</span>
      </div>
    </div>
  </div>
</template>
<style scoped>
.section-table {
  height: 100%; /* Permet de prendre la hauteur maximale du conteneur Flexbox */
  margin-bottom: 0; /* Retirer la marge basse pour l'intégration Flexbox */
  background: #ffffff; /* Blanc pour correspondre aux cartes de App.vue */
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.08); /* Ombre légère et subtile */
  padding: 1.5rem;
  max-width: 400px;
  border: 1px solid #e5e7eb; /* Bordure légère */
}
.section-table.flat {
  background: transparent;
  box-shadow: none;
  border: none;
  padding: 0;
}
.section-title {
  font-weight: 600;
  font-family: 'Poppins', 'Inter', 'Manrope', Arial, sans-serif;
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #1e3a8a; /* Bleu Marine pour le titre (charges/produits/flux) */
}
.section-table-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.6rem 1.2rem;
}
.section-row {
  display: contents;
}
.section-label {
  text-align: left;
  font-family: 'Poppins', 'Inter', 'Manrope', Arial, sans-serif;
  font-size: 1rem;
  color: #374151; /* Gris foncé pour les libellés */
}
.section-amount {
  text-align: right;
  font-family: 'Poppins', 'Inter', 'Manrope', Arial, sans-serif;
  font-size: 1rem;
  color: #374151; /* Gris foncé pour les montants */
  font-weight: 600;
}
.section-total .section-label {
  font-weight: bold;
  color: #06b6d4; /* Cyan pour le total */
  border-top: 1px solid #e5e7eb; /* Ligne de séparation claire */
  padding-top: 0.6rem;
}
.section-total .section-amount {
  font-weight: bold;
  color: #06b6d4; /* Cyan pour le total */
  border-top: 1px solid #e5e7eb;
  padding-top: 0.6rem;
}
</style>
