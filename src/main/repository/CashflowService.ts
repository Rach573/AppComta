/**
 * 💧 CASHFLOW SERVICE - Tableau de flux de trésorerie
 * 
 * Calcule les flux de trésorerie en 3 catégories :
 * 1. Flux d'EXPLOITATION (activité courante : produits encaissés - charges décaissées)
 * 2. Flux d'INVESTISSEMENT (achats/ventes d'immobilisations)
 * 3. Flux de FINANCEMENT (apports, emprunts, remboursements)
 * 
 * 💰 VARIATION TRÉSORERIE = Total des 3 flux
 * 
 * 📖 Documentation complète : voir LOGIQUE_METIER.md
 */

/*
👋 GitHub Copilot, voici ce que je veux :

Je développe une application de comptabilité (AppCompta) en Vue + Electron + TypeScript. L'utilisateur saisit des écritures comptables avec un libellé, un montant et une catégorie.

Je souhaite maintenant ajouter un module de **calcul automatique du flux de trésorerie (cashflow)** basé sur les écritures enregistrées.

💡 Objectif : créer une fonction `computeCashflow(entries: ComptaEntry[]): CashflowSummary` qui :

1. Regroupe les flux de trésorerie en 3 catégories :
   - Flux de **l’exploitation** (liés à l’activité courante)
   - Flux d’**investissement** (immobilisations)
   - Flux de **financement** (emprunts, apports, etc.)

2. Utilise la catégorie comptable de chaque écriture pour classer automatiquement :
   - Charges & produits d’exploitation → exploitation
   - Immobilisations (achats machines, bâtiments) → investissement
   - Apport capital, emprunts, remboursements → financement

3. Retourne un objet du type suivant :
```ts
export type CashflowSummary = {
  exploitation: number;
  investissement: number;
  financement: number;
  net: number;
  encaissementsClients?: number;
  paiementsFournisseurs?: number;
  paiementsCharges?: number;
  interets?: number;
  apports?: number;
  emprunts?: number;
  remboursements?: number;
};
```
---

*/
import type { ComptaEntry, ComptaCategory } from '@shared/types/compta';

export type CashflowSummary = {
  exploitation: number;
  investissement: number;
  financement: number;
  net: number;
  encaissementsClients: number;
  paiementsFournisseurs: number;
  paiementsCharges: number;
  interets: number;
  apports: number;
  emprunts: number;
  remboursements: number;
  investissementsPayes: number;
};

// Revenus d'exploitation (comptabilisés en cash seulement si pas de créance)
const REVENUS_EXPLOITATION: ComptaCategory[] = [
  'vente',
  'revenu_service',
];

// Charges d'exploitation (cash seulement si pas de dette fournisseur)
const CHARGES_EXPLOITATION: ComptaCategory[] = [
  'frais_immatriculation',
  'loyer',
  'electricite',
  'interets',
  'salaires',
  // Important: on n'inclut PAS 'achat_matieres' ici, car dans notre modèle
  // le décaissement réel est capté par 'paiement_fournisseurs'.
];

const INVESTISSEMENT_CATEGORIES: ComptaCategory[] = [
  'achat_machine',
  'achat_logiciel',
  'achat_camion',
];

const FINANCEMENT_ENTREES: ComptaCategory[] = [
  'apport_capital',
  'emprunt_bancaire',
  'credit_caisse',
];

// Outils de multi-ensemble (multiset) par montant
function keyAmt(n: number) {
  return Math.round(n * 100) / 100; // 2 décimales
}
function addCount(map: Map<number, number>, amt: number) {
  const k = keyAmt(amt);
  map.set(k, (map.get(k) ?? 0) + 1);
}
function tryConsume(map: Map<number, number>, amt: number): boolean {
  const k = keyAmt(amt);
  const cur = map.get(k) ?? 0;
  if (cur > 0) {
    if (cur === 1) map.delete(k); else map.set(k, cur - 1);
    return true;
  }
  return false;
}

export function computeCashflow(entries: ComptaEntry[]): CashflowSummary {
  let exploitation = 0;
  let investissement = 0;
  let financement = 0;

    let encaissementsClients = 0;
    let paiementsFournisseurs = 0;
    let paiementsCharges = 0;
    let interets = 0;
    let investissementsPayes = 0;
    let apportsCapital = 0;
    let empruntsRecus = 0;
    let remboursements = 0;

  // Préparer les multi-ensembles pour détecter les opérations à crédit (non cash)
  const dettesFournisseurs = new Map<number, number>(); // dettes initiales (positives)
  const creancesClients = new Map<number, number>(); // créances initiales (positives)

  // Totaux pour neutralisation achat immobilisation financé par emprunt et/ou dette
  let totalAchatMachine = 0;
  let totalDettesInvestPositives = 0; // uniquement dettes liées à l'immobilisation
  let totalEmpruntPositif = 0;

  for (const e of entries) {
    if (e.category === 'dettes_fournisseurs' && e.amount > 0) {
      addCount(dettesFournisseurs, e.amount);
      // Ne compter pour la neutralisation investissement que les dettes liées à la machine/immobilisation
      const lbl = (e.label || '').toLowerCase();
      if (lbl.includes('machine') || lbl.includes('immobil')) {
        totalDettesInvestPositives += e.amount;
      }
    }
    if (e.category === 'creances_clients' && e.amount > 0) {
      addCount(creancesClients, e.amount);
    }
    if (e.category === 'achat_machine' && e.amount > 0) {
      totalAchatMachine += e.amount;
    }
    if (e.category === 'emprunt_bancaire' && e.amount > 0) {
      totalEmpruntPositif += e.amount;
    }
  }

  for (const entry of entries) {
    const { category, amount } = entry;

    // Encaissements/décaissements explicites
    if (category === 'encaissement_client') {
      exploitation += Math.abs(amount); // encaissement
      encaissementsClients += Math.abs(amount);
      continue;
    }
    if (category === 'paiement_fournisseurs') {
      exploitation -= Math.abs(amount); // décaissement (amount est négatif dans nos écritures)
      paiementsFournisseurs += Math.abs(amount);
      continue;
    }

    // Financement
    if (FINANCEMENT_ENTREES.includes(category)) {
      financement += amount; // entrées positives
  if (category === 'apport_capital') apportsCapital += amount;
  if (category === 'emprunt_bancaire') empruntsRecus += amount;
  if (category === 'credit_caisse') empruntsRecus += amount;
      continue;
    }
    if (category === 'remboursement_emprunt') {
      financement += amount; // généralement négatif
      remboursements += amount;
      continue;
    }

    // Intérêts (considérés cash à la date d'enregistrement)
    if (category === 'interets') {
      exploitation -= Math.abs(amount);
      interets -= Math.abs(amount);
      continue;
    }

    // Revenus d'exploitation: cash seulement si pas de créance associée
    if (REVENUS_EXPLOITATION.includes(category)) {
      if (!tryConsume(creancesClients, amount)) {
        exploitation += amount;
        encaissementsClients += amount;
      }
      continue;
    }

    // Charges d'exploitation: cash seulement si pas de dette fournisseur associée
    if (CHARGES_EXPLOITATION.includes(category)) {
      if (!tryConsume(dettesFournisseurs, amount)) {
        // Charges sont sorties de cash
        exploitation -= amount;
        paiementsCharges += amount;
      }
      continue;
    }

    // Investissement: cash seulement si pas de dette fournisseur associée
    if (INVESTISSEMENT_CATEGORIES.includes(category)) {
      if (!tryConsume(dettesFournisseurs, amount)) {
        investissement -= amount;
      }
      investissementsPayes += amount;
      continue;
    }

    // Autres catégories: ignorées pour le cashflow
  }

  // Neutralisation achat machine financé par emprunt et/ou dette fournisseur
  // - Première neutralisation par dettes fournisseurs (non cash)
  const offsetDettes = Math.min(totalAchatMachine, totalDettesInvestPositives);
  if (offsetDettes > 0) {
    investissement += offsetDettes; // on annule la partie non cash de l'investissement
  }
  const restantApresDettes = Math.max(0, totalAchatMachine - offsetDettes);
  // - Deuxième neutralisation par emprunt bancaire versé directement au fournisseur
  const offsetEmprunt = Math.min(restantApresDettes, totalEmpruntPositif);
  if (offsetEmprunt > 0) {
    investissement += offsetEmprunt; // annule la partie de l'achat couverte par l'emprunt
    financement -= offsetEmprunt;    // et annule l'entrée de financement correspondante (neutralisation)
  empruntsRecus -= offsetEmprunt;
  }

  const net = exploitation + investissement + financement;
  return {
    exploitation,
    investissement,
    financement,
    net,
    encaissementsClients,
    paiementsFournisseurs,
    paiementsCharges,
    interets,
    apports: apportsCapital,
    emprunts: empruntsRecus,
    remboursements,
    investissementsPayes,
  };
}
