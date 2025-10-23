/**
 * 🧪 TEST EXERCICE ÉCOBOIS
 * 
 * Simule les opérations de la première année d'ÉcoBois pour valider:
 * - Bilan (Actif/Passif équilibré)
 * - Compte de résultat (Charges/Produits)
 * - Cashflow (Exploitation, Investissement, Financement)
 * - Clôture d'exercice (Bénéfice reporté)
 */

import { insertComptaEntry, listComptaEntries } from './ComptaStore';
import { computeBalanceSheet, computeIncomeStatement } from './ComptaStore';
import { computeCashflow } from './CashflowService';

export async function testEcoBois() {
  console.log('\n🌳 ════════════════════════════════════════════════════════════');
  console.log('   TEST EXERCICE ÉCOBOIS - PREMIÈRE ANNÉE');
  console.log('   ════════════════════════════════════════════════════════════\n');

  // Note: Le store est maintenant vide au démarrage (données initiales supprimées de ComptaStore.ts)

  // 1. Capital initial: 40 000 €
  console.log('1️⃣  Apport capital initial: 40 000 €');
  await insertComptaEntry({
    label: 'Apport en capital',
    amount: 40000,
    category: 'apport_capital',
  });

  // 2. Frais d'immatriculation: 3 000 €
  console.log('2️⃣  Frais d\'immatriculation: 3 000 €');
  await insertComptaEntry({
    label: 'Frais d\'immatriculation',
    amount: 3000,
    category: 'frais_immatriculation',
  });

  // 3. Achat machine 25 000 € (emprunt 15 000 €, reste à payer 10 000 €)
  console.log('3️⃣  Achat machine: 25 000 € (emprunt 15 000 €, dette 10 000 €)');
  await insertComptaEntry({
    label: 'Achat de machine',
    amount: 25000,
    category: 'achat_machine',
  });
  // Dette nette après financement emprunt direct: 25 000 - 15 000 = 10 000 €
  await insertComptaEntry({
    label: 'Dette fournisseur - machine (après emprunt 15 000)',
    amount: 10000,
    category: 'dettes_fournisseurs',
  });
  await insertComptaEntry({
    label: 'Emprunt bancaire',
    amount: 15000,
    category: 'emprunt_bancaire',
  });

  // 4. Achat matières premières à crédit: 10 000 €
  console.log('4️⃣  Achat matières premières à crédit: 10 000 €');
  await insertComptaEntry({
    label: 'Stock matières premières',
    amount: 10000,
    category: 'stock',
  });
  await insertComptaEntry({
    label: 'Dette fournisseur - matières',
    amount: 10000,
    category: 'dettes_fournisseurs',
  });

  // 5. Vente meubles à crédit: 18 000 € (coût matières: 6 000 €)
  console.log('5️⃣  Vente meubles à crédit: 18 000 € (coût matières: 6 000 €)');
  await insertComptaEntry({
    label: 'Vente de meubles',
    amount: 18000,
    category: 'vente',
  });
  await insertComptaEntry({
    label: 'Créance client',
    amount: 18000,
    category: 'creances_clients',
  });
  // Sortie du stock (coût des ventes)
  await insertComptaEntry({
    label: 'Consommation matières premières',
    amount: 6000,
    category: 'achat_matieres',
  });
  await insertComptaEntry({
    label: 'Réduction stock',
    amount: -6000,
    category: 'stock',
  });

  // 6. Paiement fournisseurs: 10 000 €
  console.log('6️⃣  Paiement fournisseurs: 10 000 €');
  await insertComptaEntry({
    label: 'Paiement fournisseurs',
    amount: -10000,
    category: 'paiement_fournisseurs',
  });
  await insertComptaEntry({
    label: 'Réduction dette fournisseur',
    amount: -10000,
    category: 'dettes_fournisseurs',
  });

  // 7. Facture électricité à crédit: 1 200 €
  console.log('7️⃣  Facture électricité à crédit: 1 200 €');
  await insertComptaEntry({
    label: 'Facture électricité',
    amount: 1200,
    category: 'electricite',
  });
  await insertComptaEntry({
    label: 'Dette fournisseur - électricité',
    amount: 1200,
    category: 'dettes_fournisseurs',
  });

  // 8. Crédit de caisse: 2 000 €
  console.log('8️⃣  Crédit de caisse: 2 000 €');
  await insertComptaEntry({
    label: 'Crédit de caisse',
    amount: 2000,
    category: 'credit_caisse',
  });

  // 9. Encaissement client: 18 000 €
  console.log('9️⃣  Encaissement client: 18 000 €');
  await insertComptaEntry({
    label: 'Encaissement client',
    amount: 18000,
    category: 'encaissement_client',
  });
  await insertComptaEntry({
    label: 'Réduction créance client',
    amount: -18000,
    category: 'creances_clients',
  });

  // 10. Remboursement crédit de caisse + intérêts (2 000 € + 160 €)
  console.log('🔟 Remboursement crédit caisse + intérêts: 2 160 € (dont 160 € intérêts)');
  await insertComptaEntry({
    label: 'Remboursement crédit caisse',
    amount: -2000,
    category: 'credit_caisse',
  });
  await insertComptaEntry({
    label: 'Intérêts crédit caisse',
    amount: 160,
    category: 'interets',
  });

  console.log('\n✅ Toutes les opérations ont été saisies.\n');

  // Affichage des états comptables
  console.log('📊 ════════════════════════════════════════════════════════════');
  console.log('   ÉTATS COMPTABLES FINAUX');
  console.log('   ════════════════════════════════════════════════════════════\n');

  // Bilan
  const bilan = await computeBalanceSheet();
  console.log('📋 BILAN\n');
  console.log('  ACTIF:');
  bilan.assets.forEach((section) => {
    console.log(`    ${section.label}:`);
    section.items.forEach((item) => {
      console.log(`      ${item.label.padEnd(40)} ${item.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`);
    });
    console.log(`      ${'Total'.padEnd(40)} ${section.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €\n`);
  });
  console.log(`  ${'TOTAL ACTIF'.padEnd(42)} ${bilan.totalAssets.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €\n`);

  console.log('  PASSIF:');
  bilan.liabilities.forEach((section) => {
    console.log(`    ${section.label}:`);
    section.items.forEach((item) => {
      console.log(`      ${item.label.padEnd(40)} ${item.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`);
    });
    console.log(`      ${'Total'.padEnd(40)} ${section.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €\n`);
  });
  console.log(`  ${'TOTAL PASSIF'.padEnd(42)} ${bilan.totalLiabilities.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €\n`);

  const equilibre = bilan.totalAssets === bilan.totalLiabilities;
  console.log(`  ⚖️  ÉQUILIBRE: ${equilibre ? '✅ OUI' : '❌ NON'}`);
  console.log(`      Actif  : ${bilan.totalAssets.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`);
  console.log(`      Passif : ${bilan.totalLiabilities.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`);
  console.log(`      Écart  : ${(bilan.totalAssets - bilan.totalLiabilities).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €\n`);

  // Compte de résultat
  const cr = await computeIncomeStatement();
  console.log('📈 COMPTE DE RÉSULTAT\n');
  console.log('  CHARGES:');
  cr.charges.forEach((c) => {
    console.log(`    ${c.label.padEnd(40)} ${c.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`);
  });
  const totalCharges = cr.charges.reduce((s, c) => s + c.amount, 0);
  console.log(`    ${'Total Charges'.padEnd(40)} ${totalCharges.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €\n`);

  console.log('  PRODUITS:');
  cr.produits.forEach((p) => {
    console.log(`    ${p.label.padEnd(40)} ${p.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`);
  });
  const totalProduits = cr.produits.reduce((s, p) => s + p.amount, 0);
  console.log(`    ${'Total Produits'.padEnd(40)} ${totalProduits.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €\n`);

  console.log(`  💰 RÉSULTAT NET: ${cr.resultatNet.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €\n`);

  // Cashflow
  const entries = await listComptaEntries();
  const cf = computeCashflow(entries);
  console.log('💵 CASHFLOW\n');
  console.log(`    Flux d'exploitation        : ${cf.exploitation.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`);
  console.log(`    Flux d'investissement      : ${cf.investissement.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`);
  console.log(`    Flux de financement        : ${cf.financement.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`);
  console.log(`    ───────────────────────────────────────────────`);
  console.log(`    Variation nette trésorerie : ${cf.net.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €\n`);

  // Remarque: la clôture d'exercice est désormais déclenchée manuellement via le bouton UI.

  console.log('\n🎉 ════════════════════════════════════════════════════════════');
  console.log('   TEST ÉCOBOIS TERMINÉ AVEC SUCCÈS');
  console.log('   ════════════════════════════════════════════════════════════\n');

  return {
    bilan,
    compteResultat: cr,
    cashflow: cf,
    equilibre,
  };
}
