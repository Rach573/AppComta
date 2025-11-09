<template>
  <div class="entries-view">
    <section class="card form-card">
      <SaisieEcriture @added="handleEntryAdded" />
    </section>

    <section class="card entries">
      <div class="entries-header" @click="toggleHistorique">
        <h2 class="historique-label">Historique des écritures ({{ entries.length }})</h2>
        <span class="toggle-icon">{{ historiqueExpanded ? '▼' : '▶' }}</span>
      </div>
      <div v-show="historiqueExpanded" class="entries-content">
        <p v-if="entriesLoading">Chargement...</p>
        <p v-else-if="entries.length === 0">Aucune ecriture pour le moment.</p>
        <div v-else class="entries-scroll">
          <ul>
            <li v-for="entry in entries" :key="entry.id">
              <div class="entry-main">
                <span class="label">{{ entry.label }}</span>
                <span class="category">{{ categoryLabel(entry.category) }}</span>
              </div>
              <div class="entry-meta">
                <span class="amount" :class="{ negative: entry.amount < 0 }">
                  {{ formatCurrency(entry.amount) }}
                </span>
                <span class="date">
                  {{ new Date(entry.createdAt).toLocaleString('fr-BE') }}
                </span>
              </div>
              <button
                type="button"
                class="ghost"
                :disabled="deletingId === entry.id"
                @click="handleDelete(entry.id)"
              >
                {{ deletingId === entry.id ? 'Suppression...' : 'Supprimer' }}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import SaisieEcriture from '../components/SaisieEcriture.vue';
import { useCompta } from '../composables/useCompta';
import { COMPTA_CATEGORY_LABELS } from '@shared/types/compta';
import type { ComptaCategory } from '@shared/types/compta';

const {
  entries,
  entriesLoading,
  fetchEntries,
  deleteEntry,
  refreshAll,
} = useCompta();

const historiqueExpanded = ref(true);
const deletingId = ref<string | null>(null);

const toggleHistorique = () => {
  historiqueExpanded.value = !historiqueExpanded.value;
};

const categoryLabel = (category: ComptaCategory) => COMPTA_CATEGORY_LABELS[category];

const formatCurrency = (value: number) =>
  value.toLocaleString('fr-BE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  });

const handleEntryAdded = async () => {
  await refreshAll();
};

const handleDelete = async (id: string) => {
  deletingId.value = id;
  try {
    await deleteEntry(id);
  } finally {
    deletingId.value = null;
  }
};

onMounted(() => {
  void fetchEntries();
});
</script>

<style scoped>
.entries-view {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.form-card {
  grid-column: 1 / -1;
  max-width: 600px;
  justify-self: center;
}

.entries {
  grid-column: 1 / -1;
}

.entries-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(6, 182, 212, 0.1);
}

.entries-header:hover {
  opacity: 0.8;
}

.historique-label {
  color: #4c1d95;
  font-weight: 600;
  font-size: 1rem;
  margin: 0;
}

.toggle-icon {
  font-size: 1.2rem;
  color: #06b6d4;
  transition: transform 0.2s ease;
}

.entries-content {
  margin-top: 1rem;
}

.entries-scroll {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.entries-scroll::-webkit-scrollbar {
  width: 6px;
}

.entries-scroll::-webkit-scrollbar-track {
  background: rgba(124, 58, 237, 0.05);
  border-radius: 10px;
}

.entries-scroll::-webkit-scrollbar-thumb {
  background: rgba(124, 58, 237, 0.3);
  border-radius: 10px;
}

.entries-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(124, 58, 237, 0.5);
}

.entries ul {
  list-style: none;
  padding: 0;
  margin: 1.5rem 0 0;
  display: grid;
  gap: 1rem;
}

.entries li {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem 1.25rem;
  border: 1px solid rgba(91, 95, 151, 0.15);
  border-radius: 14px;
  background: #fff;
}

.entry-main {
  display: grid;
  gap: 0.25rem;
}

.entries .label {
  font-weight: 600;
  color: #1e3a8a;
}

.entries .category {
  color: #6b7280;
}

.entry-meta {
  display: grid;
  gap: 0.25rem;
  justify-items: end;
  font-size: 0.9rem;
}

.entries .amount {
  font-weight: 600;
  color: #1e3a8a;
}

.entries .amount.negative {
  color: #dc2626;
}

.entries .date {
  color: #5b5f97;
}

.ghost {
  background: rgba(124, 58, 237, 0.08);
  color: #7c3aed;
  border: 1px solid rgba(124, 58, 237, 0.25);
  padding: 0.5rem 1.2rem;
  border-radius: 10px;
  cursor: pointer;
}

.ghost:not(:disabled):hover {
  background: rgba(124, 58, 237, 0.2);
}

.ghost:disabled {
  opacity: 0.6;
  cursor: wait;
}
</style>
