import { createRouter, createMemoryHistory, type RouteRecordRaw } from 'vue-router';
import EntriesView from './pages/EntriesView.vue';
import BalanceView from './pages/BalanceView.vue';
import IncomeView from './pages/IncomeView.vue';
import CashflowView from './pages/CashflowView.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'entries',
    component: EntriesView,
  },
  {
    path: '/balance',
    name: 'balance',
    component: BalanceView,
  },
  {
    path: '/income',
    name: 'income',
    component: IncomeView,
  },
  {
    path: '/cashflow',
    name: 'cashflow',
    component: CashflowView,
  },
];

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
});
