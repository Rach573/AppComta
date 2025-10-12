export type ComptaCategory =
  | 'frais_etablissement'
  | 'actif_immobilise_brevet'
  | 'actif_immobilise_equipement'
  | 'actifs_circulants_creances'
  | 'actifs_circulants_stock'
  | 'actifs_circulants_cash'
  | 'capitaux_propres_capital_initial'
  | 'capitaux_propres_benefices_reportes'
  | 'dette_long_terme_financiere'
  | 'dette_court_terme_financiere'
  | 'dette_court_terme_commerciale';

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
  frais_etablissement: "Frais d'etablissement",
  actif_immobilise_brevet: 'Actifs immobilises - Brevet',
  actif_immobilise_equipement: 'Actifs immobilises - Equipement',
  actifs_circulants_creances: 'Actifs circulants - Creances',
  actifs_circulants_stock: 'Actifs circulants - Stock',
  actifs_circulants_cash: 'Actifs circulants - Cash',
  capitaux_propres_capital_initial: 'Fonds propres - Capital initial',
  capitaux_propres_benefices_reportes: 'Fonds propres - Benefices reportes',
  dette_long_terme_financiere: 'Dettes > 1 an - Dettes financieres',
  dette_court_terme_financiere: 'Dettes < 1 an - Dettes financieres',
  dette_court_terme_commerciale: 'Dettes < 1 an - Dettes commerciales',
};

export const COMPTA_CATEGORY_GROUP: Record<ComptaCategory, { group: ComptaGroup; section: string }> = {
  frais_etablissement: { group: 'actif', section: 'Actif' },
  actif_immobilise_brevet: { group: 'actif', section: 'Actifs immobilises' },
  actif_immobilise_equipement: { group: 'actif', section: 'Actifs immobilises' },
  actifs_circulants_creances: { group: 'actif', section: 'Actifs circulants' },
  actifs_circulants_stock: { group: 'actif', section: 'Actifs circulants' },
  actifs_circulants_cash: { group: 'actif', section: 'Actifs circulants' },
  capitaux_propres_capital_initial: { group: 'passif', section: 'Fonds propres' },
  capitaux_propres_benefices_reportes: { group: 'passif', section: 'Fonds propres' },
  dette_long_terme_financiere: { group: 'passif', section: 'Dettes > 1 an' },
  dette_court_terme_financiere: { group: 'passif', section: 'Dettes < 1 an' },
  dette_court_terme_commerciale: { group: 'passif', section: 'Dettes < 1 an' },
};
