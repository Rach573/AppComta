export type AutoKey =
  | 'capital_initial'
  | 'frais_immatriculation'
  | 'achat_machine'
  | 'achat_matieres'
  | 'vente_meubles'
  | 'paiement_fournisseurs'
  | 'facture_electricite'
  | 'credit_caisse'
  | 'emprunt_bancaire'
  | 'encaissement_client'
  | 'remboursement_emprunt_interets';

export type AutoOption = {
  key: AutoKey;
  label: string;
  requiresPaymentMode?: boolean; // ex: comptant / à crédit
};

export const AUTO_OPTIONS_GROUPED: { group: string; options: AutoOption[] }[] = [
  {
    group: 'Bilan / Financement',
    options: [
      { key: 'capital_initial', label: 'Capital initial' },
      { key: 'credit_caisse', label: 'Crédit de caisse' },
      { key: 'emprunt_bancaire', label: 'Emprunt bancaire' },
    ],
  },
  {
    group: 'Immobilisations / Stocks / Créances',
    options: [
      { key: 'achat_machine', label: 'Achat de machine', requiresPaymentMode: true },
      { key: 'achat_matieres', label: 'Achat de matières premières', requiresPaymentMode: true },
      { key: 'vente_meubles', label: 'Vente de meubles', requiresPaymentMode: true },
    ],
  },
  {
    group: 'Exploitation / Charges / Produits',
    options: [
      { key: 'frais_immatriculation', label: "Frais d'immatriculation", requiresPaymentMode: true },
      { key: 'facture_electricite', label: 'Facture électricité', requiresPaymentMode: true },
      { key: 'paiement_fournisseurs', label: 'Paiement fournisseurs' },
      { key: 'encaissement_client', label: 'Encaissement client' },
      { key: 'remboursement_emprunt_interets', label: 'Remboursement emprunt + intérêts' },
    ],
  },
];

export type PaymentMode = 'comptant' | 'credit';

export type AutoClassifyInput = {
  key: AutoKey;
  amount: number;
  paymentMode?: PaymentMode; // si applicable
  interestsPart?: number; // pour remboursement emprunt (part intérêts)
  costOfGoodsSoldAmount?: number; // CdV pour vente_meubles (consommation de matières)
};

// --- Extension: autoClassifier par libellé libre ---
// Objectif: analyser un libellé saisi en texte libre et proposer une
// classification de haut niveau + une catégorie compta suggérée.

export type ClassificationResult = {
  type: 'actif' | 'passif' | 'charge' | 'produit';
  subtype:
    | 'immobilisation'
    | 'stock'
    | 'creance_client'
    | 'tresorerie'
    | 'capitaux_propres'
    | 'dettes_fournisseurs'
    | 'emprunt'
    | 'vente'
    | 'electricite'
    | 'frais_etablissement'
    | 'interets'
    | 'achats';
  destinations: Array<'bilan' | 'resultat' | 'cashflow'>;
  // Catégorie comptable suggérée pour l'insertion rapide
  suggestedCategory?: import('./types/compta').ComptaCategory;
};

// Heuristiques simples basées sur des mots-clés FR courants
export function autoClassifier(label: string): ClassificationResult | null {
  const l = label.toLowerCase();

  const is = (kw: string | string[]) =>
    (Array.isArray(kw) ? kw : [kw]).some((k) => l.includes(k));

  // Produits / Ventes
  if (is(['vente', 'facture client', 'chiffre d’affaires', "chiffre d'affaires"])) {
    return {
      type: 'produit',
      subtype: 'vente',
      destinations: ['resultat', 'cashflow'],
      suggestedCategory: 'vente',
    };
  }

  // Frais d'établissement
  if (is(['frais immatriculation', "frais d'immatriculation", 'frais etablissement', "frais d’etablissement"])) {
    return {
      type: 'charge',
      subtype: 'frais_etablissement',
      destinations: ['resultat', 'cashflow'],
      suggestedCategory: 'frais_immatriculation',
    };
  }

  // Electricité
  if (is(['electricite', 'électricité', 'edf'])) {
    return {
      type: 'charge',
      subtype: 'electricite',
      destinations: ['resultat', 'cashflow'],
      suggestedCategory: 'electricite',
    };
  }

  // Intérêts
  if (is(['interet', 'intérêt', 'interets', 'intérêts'])) {
    return {
      type: 'charge',
      subtype: 'interets',
      destinations: ['resultat', 'cashflow'],
      suggestedCategory: 'interets',
    };
  }

  // Achats matières / stock
  if (is(['achat matiere', 'achat matières', 'achat mp', 'matiere premiere', 'matières premières'])) {
    return {
      type: 'charge',
      subtype: 'achats',
      destinations: ['resultat', 'bilan'],
      suggestedCategory: 'achat_matieres',
    };
  }

  // Immobilisation machine / camion / logiciel
  if (is(['achat machine', 'machine', 'immobilisation', 'camion', 'logiciel'])) {
    return {
      type: 'actif',
      subtype: 'immobilisation',
      destinations: ['bilan', 'cashflow'],
      suggestedCategory: 'achat_machine',
    };
  }

  // Emprunt / Crédit caisse
  if (is(['emprunt', 'credit caisse', 'crédit caisse', 'prêt bancaire'])) {
    return {
      type: 'passif',
      subtype: 'emprunt',
      destinations: ['bilan', 'cashflow'],
      suggestedCategory: is(['credit caisse', 'crédit caisse']) ? 'credit_caisse' : 'emprunt_bancaire',
    };
  }

  // Paiement fournisseurs / dettes fournisseurs
  if (is(['paiement fournisseur', 'paiement fournisseurs'])) {
    return {
      type: 'passif',
      subtype: 'dettes_fournisseurs',
      destinations: ['bilan', 'cashflow'],
      suggestedCategory: 'paiement_fournisseurs',
    };
  }
  if (is(['dette fournisseur', 'dettes fournisseurs'])) {
    return {
      type: 'passif',
      subtype: 'dettes_fournisseurs',
      destinations: ['bilan'],
      suggestedCategory: 'dettes_fournisseurs',
    };
  }

  // Encaissement client / créance client
  if (is(['encaissement client', 'paiement client'])) {
    return {
      type: 'actif',
      subtype: 'tresorerie',
      destinations: ['cashflow', 'bilan'],
      suggestedCategory: 'encaissement_client',
    };
  }
  if (is(['creance client', 'créance client'])) {
    return {
      type: 'actif',
      subtype: 'creance_client',
      destinations: ['bilan'],
      suggestedCategory: 'creances_clients',
    };
  }

  // Apport de capital
  if (is(['apport capital', 'capital initial'])) {
    return {
      type: 'passif',
      subtype: 'capitaux_propres',
      destinations: ['bilan', 'cashflow'],
      suggestedCategory: 'apport_capital',
    };
  }

  return null;
}

export function suggestCategoryFromLabel(label: string): import('./types/compta').ComptaCategory | null {
  const res = autoClassifier(label);
  return res?.suggestedCategory ?? null;
}
