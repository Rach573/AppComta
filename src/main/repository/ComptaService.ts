import { computeCashflow } from './CashflowService';
export async function generateCashflow() {
  const entries = await getComptaEntries();
  return computeCashflow(entries);
}
import { computeIncomeStatement } from './ComptaStore';
export async function generateIncomeStatement() {
  return computeIncomeStatement();
}
import { trouverEcriture } from '@main/services/accountingService';
import { buildAutoEntries } from '@main/services/autoClassifier';
import { suggestCategoryFromLabel } from '@shared/autoClassifier';
import type { AutoClassifyInput } from '@shared/autoClassifier';

export async function ajouterEcritureAuto(description: string, montant: number) {
  const ecriture = trouverEcriture(description, montant);
  if (!ecriture) {
    // Fallback: classification heuristique par libellé
    const suggested = suggestCategoryFromLabel(description);
    if (!suggested) throw new Error('Opération inconnue ou non supportée');
    await insertComptaEntry({
      label: description,
      amount: montant,
      category: suggested,
    });
    return null;
  }

  // Mapping catégorie selon le compte crédit
  let category: ComptaCategory = 'vente'; // Valeur par défaut
  const credit = ecriture.lignes.find(l => l.credit);
  if (credit) {
    // Produits (classe 7)
    if (credit.compte.startsWith('70')) category = 'vente';
    else if (credit.compte.startsWith('74')) category = 'revenu_service';
    // Charges (classe 6)
    else if (credit.compte.startsWith('61')) category = 'loyer';
    else if (credit.compte.startsWith('62')) category = 'electricite';
    else if (credit.compte.startsWith('64')) category = 'salaires';
    else if (credit.compte.startsWith('66')) category = 'interets';
    else if (credit.compte.startsWith('60')) category = 'achat_matieres';
    // Capitaux (classe 1)
    else if (credit.compte.startsWith('101')) category = 'apport_capital';
    else if (credit.compte.startsWith('164')) category = 'emprunt_bancaire';
    else if (credit.compte.startsWith('52')) category = 'credit_caisse';
    // Immobilisations (classe 2)
    else if (credit.compte.startsWith('215')) category = 'achat_machine';
    else if (credit.compte.startsWith('205')) category = 'achat_logiciel';
    else if (credit.compte.startsWith('218')) category = 'achat_camion';
  }

  await insertComptaEntry({
    label: ecriture.libelle,
    amount: montant,
    category,
  });
  return ecriture;
}

export async function enregistrerEcritureAuto(input: AutoClassifyInput) {
  const payloads = buildAutoEntries(input);
  const inserted: ComptaEntry[] = [];
  for (const p of payloads) {
    const e = await insertComptaEntry(p);
    inserted.push(e);
  }
  return inserted;
}

import type {
  BalanceSheetSummary,
  ComptaEntry,
  RegisterComptaPayload,
  ComptaCategory,
} from '@shared/types/compta';
import {
  computeBalanceSheet,
  insertComptaEntry,
  listComptaEntries,
  removeComptaEntry,
} from './ComptaStore';


export async function getComptaEntries(): Promise<ComptaEntry[]> {
  return listComptaEntries();
}

export async function registerComptaEntry(
  payload: RegisterComptaPayload,
): Promise<ComptaEntry> {
  return insertComptaEntry(payload);
}

export async function deleteComptaEntry(id: string): Promise<boolean> {
  return removeComptaEntry(id);
}

export async function generateBalanceSheet(): Promise<BalanceSheetSummary> {
  return computeBalanceSheet();
}

// Clôture d'exercice: bascule le résultat courant en "Bénéfice reporté"
export async function cloturerExercice() {
  const income = await computeIncomeStatement();
  const resultat = income.resultatNet;
  if (resultat === 0) {
    return { inserted: false, message: 'Résultat nul: aucune écriture de clôture créée.' };
  }
  const e = await insertComptaEntry({
    label: `Bénéfice reporté - Clôture`,
    amount: resultat,
    category: 'benefice_reporte',
  });
  return { inserted: true, entry: e };
}