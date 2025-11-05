// Types pour le compte de résultat
export interface IncomeStatementItem {
  label: string;
  amount: number;
}

export interface IncomeStatementSummary {
  charges: IncomeStatementItem[];
  produits: IncomeStatementItem[];
  resultatNet: number;
}

// Types pour le cashflow
export interface CashflowSummary {
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
  investissementsPayes?: number;
}

export type ComptaCategory =
  | 'vente'
  | 'revenu_service'
  | 'frais_immatriculation'
  | 'loyer'
  | 'electricite'
  | 'interets'
  | 'salaires'
  | 'achat_matieres'
  | 'achat_machine'
  | 'achat_logiciel'
  | 'achat_camion'
  | 'apport_capital'
  | 'emprunt_bancaire'
  | 'credit_caisse'
  | 'benefice_reporte'
  // Actif circulant / Passif court terme
  | 'stock'
  | 'creances_clients'
  | 'dettes_fournisseurs'
  // Mouvements et opérations spécifiques (pour auto-classification / cashflow)
  | 'encaissement_client'
  | 'paiement_fournisseurs'
  | 'remboursement_emprunt';

export type ComptaGroup = 'actif' | 'passif';

export interface ComptaEntry {
  id: string;
  label: string;
  amount: number;
  createdAt: string;
  category: ComptaCategory;
}

export interface BalanceSheetCategorySummary {
  category: ComptaCategory;
  label: string;
  amount: number;
}

export interface BalanceSheetSection {
  group: ComptaGroup;
  label: string;
  total: number;
  items: BalanceSheetCategorySummary[];
}

export interface BalanceSheetSummary {
  assets: BalanceSheetSection[];
  liabilities: BalanceSheetSection[];
  totalAssets: number;
  totalLiabilities: number;
}

export interface RegisterComptaPayload {
  label: string;
  amount: number;
  category: ComptaCategory;
}

export const COMPTA_CATEGORY_LABELS: Record<ComptaCategory, string> = {
  // PRODUITS
  vente: 'Vente de marchandises',
  revenu_service: 'Revenu de services',
  
  // CHARGES
  frais_immatriculation: "Frais d'immatriculation",
  loyer: 'Loyer',
  electricite: 'Électricité',
  interets: 'Intérêts bancaires',
  salaires: 'Salaires',
  achat_matieres: 'Achat de matières premières',
  
  // INVESTISSEMENT
  achat_machine: 'Achat de machine',
  achat_logiciel: 'Achat de logiciel',
  achat_camion: 'Achat de camion',
  
  // FINANCEMENT
  apport_capital: 'Apport en capital',
  emprunt_bancaire: 'Emprunt bancaire',
  credit_caisse: 'Crédit caisse',
  benefice_reporte: 'Bénéfice reporté',
  // BILAN CIRCULANT
  stock: 'Stocks',
  creances_clients: 'Créances clients',
  dettes_fournisseurs: 'Dettes fournisseurs',
  // Mouvements (utilisés par flux/cas spécifiques)
  encaissement_client: 'Encaissement client',
  paiement_fournisseurs: 'Paiement fournisseurs',
  remboursement_emprunt: 'Remboursement emprunt',
};

export const COMPTA_CATEGORY_GROUP: Record<ComptaCategory, { group: ComptaGroup; section: string }> = {
  // PRODUITS - Actif (augmentation de trésorerie)
  vente: { group: 'actif', section: 'Produits' },
  revenu_service: { group: 'actif', section: 'Produits' },
  
  // CHARGES - Passif (sortie de trésorerie)
  frais_immatriculation: { group: 'passif', section: 'Charges' },
  loyer: { group: 'passif', section: 'Charges' },
  electricite: { group: 'passif', section: 'Charges' },
  interets: { group: 'passif', section: 'Charges' },
  salaires: { group: 'passif', section: 'Charges' },
  achat_matieres: { group: 'passif', section: 'Charges' },
  
  // INVESTISSEMENT - Actif (acquisition d'actifs)
  achat_machine: { group: 'actif', section: 'Investissements' },
  achat_logiciel: { group: 'actif', section: 'Investissements' },
  achat_camion: { group: 'actif', section: 'Investissements' },
  
  // FINANCEMENT - Passif (sources de financement)
  apport_capital: { group: 'passif', section: 'Financement' },
  emprunt_bancaire: { group: 'passif', section: 'Financement' },
  credit_caisse: { group: 'passif', section: 'Financement' },
  benefice_reporte: { group: 'passif', section: 'Capitaux propres' },
  // ACTIF CIRCULANT / PASSIF COURT TERME
  stock: { group: 'actif', section: 'Actif circulant' },
  creances_clients: { group: 'actif', section: 'Actif circulant' },
  dettes_fournisseurs: { group: 'passif', section: 'Dettes fournisseurs' },
  // MOUVEMENTS (non destinés à l'affichage du bilan, utilisés pour flux)
  encaissement_client: { group: 'actif', section: 'Mouvements' },
  paiement_fournisseurs: { group: 'passif', section: 'Mouvements' },
  remboursement_emprunt: { group: 'passif', section: 'Mouvements' },
};
