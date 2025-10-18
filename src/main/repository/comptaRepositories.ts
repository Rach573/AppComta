import type {
  BalanceSheetSummary,
  ComptaEntry,
  RegisterComptaPayload,
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
