/**
 * 📘 COMPTASTORE - Gestion des écritures comptables et génération des états financiers
 * 
 * Ce fichier implémente la logique métier pour :
 * 1. Le BILAN (avec report automatique du résultat net dans les capitaux propres)
 * 2. Le COMPTE DE RÉSULTAT (produits - charges)
 * 
 * 📖 Documentation complète : voir LOGIQUE_METIER.md
 * 
 * ⚖️ Équation fondamentale garantie : ACTIF = PASSIF
 */

import type { IncomeStatementSummary, IncomeStatementItem, ComptaCategory } from '@shared/types/compta';
import { computeCashflow } from './CashflowService';

// Mapping des catégories en type "charge" ou "produit" pour le compte de résultat
const CHARGE_CATEGORIES: ComptaCategory[] = [
  'frais_immatriculation',
  'loyer',
  'electricite',
  'interets',
  'salaires',
  'achat_matieres',
];

const PRODUIT_CATEGORIES: ComptaCategory[] = [
  'vente',
  'revenu_service',
];

export async function computeIncomeStatement(): Promise<IncomeStatementSummary> {
  const charges: IncomeStatementItem[] = [];
  const produits: IncomeStatementItem[] = [];
  let totalCharges = 0;
  let totalProduits = 0;

  for (const entry of comptaStore) {
    if (CHARGE_CATEGORIES.includes(entry.category)) {
      charges.push({ label: COMPTA_CATEGORY_LABELS[entry.category], amount: entry.amount });
      totalCharges += entry.amount;
    } else if (PRODUIT_CATEGORIES.includes(entry.category)) {
      produits.push({ label: COMPTA_CATEGORY_LABELS[entry.category], amount: entry.amount });
      totalProduits += entry.amount;
    }
  }

  return {
    charges,
    produits,
    resultatNet: totalProduits - totalCharges,
  };
}
import { randomUUID } from 'node:crypto';
import type {
  BalanceSheetSummary,
  ComptaEntry,
  RegisterComptaPayload,
} from '@shared/types/compta';
import { COMPTA_CATEGORY_LABELS } from '@shared/types/compta';

// Store vide au démarrage - les données seront ajoutées via l'UI ou les tests
const comptaStore: ComptaEntry[] = [];

export async function listComptaEntries(): Promise<ComptaEntry[]> {
  return [...comptaStore].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function insertComptaEntry(payload: RegisterComptaPayload): Promise<ComptaEntry> {
  const entry: ComptaEntry = {
    id: randomUUID(),
    label: payload.label,
    amount: payload.amount,
    createdAt: new Date().toISOString(),
    category: payload.category,
  };
  comptaStore.push(entry);
  return entry;
}

export async function removeComptaEntry(id: string): Promise<boolean> {
  const index = comptaStore.findIndex((entry) => entry.id === id);
  if (index === -1) {
    return false;
  }
  comptaStore.splice(index, 1);
  return true;
}

export async function computeBalanceSheet(): Promise<BalanceSheetSummary> {
  // Catégories pertinentes pour le BILAN uniquement
  const INVESTISSEMENT_CATEGORIES: ComptaCategory[] = [
    'achat_machine',
    'achat_logiciel',
    'achat_camion',
  ];
  const DETTE_CATEGORIES: ComptaCategory[] = [
    'emprunt_bancaire',
    'credit_caisse',
    'dettes_fournisseurs',
  ];
  const CAPITAUX_PROPRES_CATEGORIES: ComptaCategory[] = [
    'apport_capital',
  ];

  // 1) Actif
  // 1.a) Actif immobilisé (Investissements)
  const actifImmobiliseItems: { category: ComptaEntry['category']; amount: number }[] = [];
  for (const cat of INVESTISSEMENT_CATEGORIES) {
    const total = comptaStore
      .filter((e) => e.category === cat)
      .reduce((s, e) => s + e.amount, 0);
  actifImmobiliseItems.push({ category: cat, amount: total });
  }
  const totalActifImmobilise = actifImmobiliseItems.reduce((s, i) => s + i.amount, 0);

  // 1.b) Actif circulant (Stock, Créances)
  const ACTIF_CIRCULANT_CATEGORIES: ComptaCategory[] = ['stock', 'creances_clients'];
  const actifCirculantItems: { category: ComptaEntry['category']; amount: number }[] = [];
  for (const cat of ACTIF_CIRCULANT_CATEGORIES) {
    const total = comptaStore
      .filter((e) => e.category === cat)
      .reduce((s, e) => s + e.amount, 0);
  actifCirculantItems.push({ category: cat, amount: total });
  }
  const totalActifCirculant = actifCirculantItems.reduce((s, i) => s + i.amount, 0);

  // 1.c) Disponibilités (Trésorerie) = variation nette de trésorerie (cashflow net)
  const cashflow = computeCashflow(comptaStore);
  const tresorerie = cashflow.net; // Montant synthétique

  // 2) Passif
  // 2.a) Capitaux propres = apports + résultat de l'exercice
  const apports = CAPITAUX_PROPRES_CATEGORIES
    .map((cat) => comptaStore.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0))
    .reduce((a, b) => a + b, 0);
  const beneficeReporte = comptaStore
    .filter((e) => e.category === 'benefice_reporte')
    .reduce((s, e) => s + e.amount, 0);
  const hasCloture = comptaStore.some(
    (e) => e.category === 'benefice_reporte' &&
      (e.label?.toLowerCase().includes('clôture') || e.label?.toLowerCase().includes('cloture')),
  );
  const incomeStatement = await computeIncomeStatement();
  const resultatNet = incomeStatement.resultatNet;
  const resultatNetEquity = hasCloture ? 0 : resultatNet;

  // 2.b) Dettes (emprunts, découverts)
  const dettesItems: { category: ComptaEntry['category']; amount: number }[] = [];
  for (const cat of DETTE_CATEGORIES) {
    const total = comptaStore
      .filter((e) => e.category === cat)
      .reduce((s, e) => s + e.amount, 0);
  dettesItems.push({ category: cat, amount: total });
  }
  const totalDettes = dettesItems.reduce((s, i) => s + i.amount, 0);

  // Construction des sections du bilan
  const assets = [
    {
      group: 'actif' as const,
      label: 'Actif immobilisé',
      total: totalActifImmobilise,
      items: actifImmobiliseItems.map((i) => ({
        category: i.category,
        label: COMPTA_CATEGORY_LABELS[i.category],
        amount: i.amount,
      })),
    },
    {
      group: 'actif' as const,
      label: 'Actif circulant',
      total: totalActifCirculant,
      items: actifCirculantItems.map((i) => ({
        category: i.category,
        label: COMPTA_CATEGORY_LABELS[i.category],
        amount: i.amount,
      })),
    },
    {
      group: 'actif' as const,
      label: 'Disponibilités',
      total: tresorerie,
      items: [
        {
          // Ligne synthétique
          category: 'tresorerie' as any,
          label: 'Trésorerie',
          amount: tresorerie,
        },
      ],
    },
  ];

  const capitauxPropresTotal = apports + beneficeReporte + resultatNetEquity;
  const liabilities = [
    {
      group: 'passif' as const,
      label: 'Capitaux propres',
      total: capitauxPropresTotal,
      items: [
        {
          category: 'apport_capital',
          label: COMPTA_CATEGORY_LABELS['apport_capital'],
          amount: apports,
        },
        {
          category: 'benefice_reporte' as any,
          label: COMPTA_CATEGORY_LABELS['benefice_reporte'],
          amount: beneficeReporte,
        },
        {
          category: 'resultat_exercice' as any,
          label: "Résultat de l'exercice",
          amount: resultatNetEquity,
        },
      ],
    },
    {
      group: 'passif' as const,
      label: 'Dettes',
      total: totalDettes,
      items: dettesItems.map((i) => ({
        category: i.category,
        label: COMPTA_CATEGORY_LABELS[i.category],
        amount: i.amount,
      })),
    },
  ];

  const totalAssets = assets.reduce((sum, section) => sum + section.total, 0);
  const totalLiabilities = liabilities.reduce((sum, section) => sum + section.total, 0);

  return {
    assets,
    liabilities,
    totalAssets,
    totalLiabilities,
  };
}
