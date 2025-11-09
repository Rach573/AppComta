import { ref, type Ref } from 'vue';
import type {
  ComptaEntry,
  ComptaCategory,
  BalanceSheetSummary,
  IncomeStatementSummary,
  CashflowSummary,
} from '@shared/types/compta';

export function useCompta() {
  const entries: Ref<ComptaEntry[]> = ref([]);
  const balanceSheet: Ref<BalanceSheetSummary | null> = ref(null);
  const incomeStatement: Ref<IncomeStatementSummary | null> = ref(null);
  const cashflow: Ref<CashflowSummary | null> = ref(null);

  const entriesLoading = ref(false);
  const balanceLoading = ref(false);
  const incomeLoading = ref(false);
  const cashflowLoading = ref(false);

  const entryError: Ref<string | null> = ref(null);
  const balanceError: Ref<string | null> = ref(null);
  const incomeError: Ref<string | null> = ref(null);
  const cashflowError: Ref<string | null> = ref(null);

  const fetchEntries = async () => {
    entriesLoading.value = true;
    entryError.value = null;
    try {
      entries.value = await window.electronService.compta.list();
    } catch (error) {
      console.error(error);
      entryError.value = 'Impossible de charger les ecritures comptables.';
    } finally {
      entriesLoading.value = false;
    }
  };

  const registerEntry = async (payload: {
    label: string;
    amount: number;
    category: ComptaCategory;
  }) => {
    entryError.value = null;
    try {
      await window.electronService.compta.register(payload);
      await fetchEntries();
    } catch (error) {
      console.error(error);
      entryError.value = "L'enregistrement comptable a echoue.";
      throw error;
    }
  };

  const deleteEntry = async (id: string) => {
    entryError.value = null;
    try {
      const removed = await window.electronService.compta.remove(id);
      if (!removed) {
        entryError.value = "L'ecriture a deja ete supprimee.";
      }
      await fetchEntries();
    } catch (error) {
      console.error(error);
      entryError.value = 'La suppression a echoue.';
      throw error;
    }
  };

  const generateBalance = async () => {
    balanceLoading.value = true;
    balanceError.value = null;
    try {
      balanceSheet.value = await window.electronService.compta.balance();
    } catch (error) {
      console.error(error);
      balanceError.value = 'La generation du bilan a echoue.';
    } finally {
      balanceLoading.value = false;
    }
  };

  const fetchIncomeStatement = async () => {
    incomeLoading.value = true;
    incomeError.value = null;
    try {
      incomeStatement.value = await window.electronService.compta.income();
    } catch (error) {
      incomeError.value = 'Erreur lors du chargement du compte de résultat.';
    } finally {
      incomeLoading.value = false;
    }
  };

  const fetchCashflow = async () => {
    cashflowLoading.value = true;
    cashflowError.value = null;
    try {
      cashflow.value = await window.electronService.compta.cashflow();
    } catch (error) {
      cashflowError.value = 'Erreur lors du chargement du cashflow.';
    } finally {
      cashflowLoading.value = false;
    }
  };

  const cloturerExercice = async () => {
    try {
      const res = await window.electronService.compta.cloture();
      await generateBalance();
      return res;
    } catch (e) {
      console.error('Erreur clôture', e);
    }
  };

  const testEcoBois = async () => {
    console.log('🌳 Lancement du test ÉcoBois...');
    try {
      const result = await window.electronService.compta.testEcoBois();
      console.log('✅ Test ÉcoBois terminé avec succès');
      await fetchEntries();
      await generateBalance();
      await fetchIncomeStatement();
      await fetchCashflow();
      return result;
    } catch (error) {
      console.error('❌ Erreur lors du test ÉcoBois :', error);
    }
  };

  const refreshAll = async () => {
    await Promise.all([
      fetchEntries(),
      generateBalance(),
      fetchIncomeStatement(),
      fetchCashflow(),
    ]);
  };

  return {
    // State
    entries,
    balanceSheet,
    incomeStatement,
    cashflow,
    // Loading
    entriesLoading,
    balanceLoading,
    incomeLoading,
    cashflowLoading,
    // Errors
    entryError,
    balanceError,
    incomeError,
    cashflowError,
    // Methods
    fetchEntries,
    registerEntry,
    deleteEntry,
    generateBalance,
    fetchIncomeStatement,
    fetchCashflow,
    cloturerExercice,
    testEcoBois,
    refreshAll,
  };
}
