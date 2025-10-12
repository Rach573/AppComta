import { randomUUID } from 'node:crypto';
import type {
  BalanceSheetSummary,
  ComptaEntry,
  RegisterComptaPayload,
} from '@shared/types/compta';
import { COMPTA_CATEGORY_GROUP, COMPTA_CATEGORY_LABELS } from '@shared/types/compta';

const comptaStore: ComptaEntry[] = [
  {
    id: randomUUID(),
    label: 'Achat materiel',
    amount: 5000,
    createdAt: new Date().toISOString(),
    category: 'frais_etablissement',
  },
  {
    id: randomUUID(),
    label: 'Facture client',
    amount: 70000,
    createdAt: new Date().toISOString(),
    category: 'actif_immobilise_equipement',
  },
  {
    id: randomUUID(),
    label: 'Capital initial',
    amount: 60000,
    createdAt: new Date().toISOString(),
    category: 'capitaux_propres_capital_initial',
  },
  {
    id: randomUUID(),
    label: 'Benefice reporte',
    amount: -2700,
    createdAt: new Date().toISOString(),
    category: 'capitaux_propres_benefices_reportes',
  },
  {
    id: randomUUID(),
    label: 'Stock marchandises',
    amount: 15000,
    createdAt: new Date().toISOString(),
    category: 'actifs_circulants_stock',
  },
  {
    id: randomUUID(),
    label: 'Tresorerie',
    amount: 7300,
    createdAt: new Date().toISOString(),
    category: 'actifs_circulants_cash',
  },
  {
    id: randomUUID(),
    label: 'Creances clients',
    amount: 0,
    createdAt: new Date().toISOString(),
    category: 'actifs_circulants_creances',
  },
  {
    id: randomUUID(),
    label: 'Dettes financieres long terme',
    amount: 50000,
    createdAt: new Date().toISOString(),
    category: 'dette_long_terme_financiere',
  },
];

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
  const sectionsMap: Record<
    'actif' | 'passif',
    Map<
      string,
      {
        label: string;
        items: Map<string, { category: ComptaEntry['category']; amount: number }>;
        total: number;
      }
    >
  > = {
    actif: new Map(),
    passif: new Map(),
  };

  const getSection = (group: 'actif' | 'passif', label: string) => {
    let section = sectionsMap[group].get(label);
    if (!section) {
      section = { label, items: new Map(), total: 0 };
      sectionsMap[group].set(label, section);
    }
    return section;
  };

  comptaStore.forEach((entry) => {
    const meta = COMPTA_CATEGORY_GROUP[entry.category];
    const section = getSection(meta.group, meta.section);
    const key = entry.category;
    const item = section.items.get(key);
    if (item) {
      item.amount += entry.amount;
    } else {
      section.items.set(key, { category: entry.category, amount: entry.amount });
    }
    section.total += entry.amount;
  });

  const buildSections = (group: 'actif' | 'passif') =>
    Array.from(sectionsMap[group].values()).map((section) => ({
      group,
      label: section.label,
      total: section.total,
      items: Array.from(section.items.values()).map((item) => ({
        category: item.category,
        label: COMPTA_CATEGORY_LABELS[item.category],
        amount: item.amount,
      })),
    }));

  const assets = buildSections('actif');
  const liabilities = buildSections('passif');

  const totalAssets = assets.reduce((sum, section) => sum + section.total, 0);
  const totalLiabilities = liabilities.reduce(
    (sum, section) => sum + section.total,
    0,
  );

  return {
    assets,
    liabilities,
    totalAssets,
    totalLiabilities,
  };
}
