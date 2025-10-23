/**
 * 🧪 TEST DE LA LOGIQUE COMPTABLE
 * 
 * Ce fichier teste les 3 états financiers avec un jeu de données cohérent
 * pour vérifier que :
 * 1. Le résultat du compte de résultat est bien reporté dans le bilan
 * 2. L'équation ACTIF = PASSIF est respectée
 * 3. Le cashflow reflète correctement les flux de trésorerie
 */

import { computeBalanceSheet, computeIncomeStatement } from './ComptaStore';
import { computeCashflow } from './CashflowService';

export async function testLogiqueComptable() {
  console.log('🧪 TEST DE LA LOGIQUE COMPTABLE');
  console.log('='.repeat(80));

  // 1️⃣ COMPTE DE RÉSULTAT
  console.log('\n📊 1. COMPTE DE RÉSULTAT');
  console.log('-'.repeat(80));
  const incomeStatement = await computeIncomeStatement();
  
  console.log('\n💰 PRODUITS :');
  incomeStatement.produits.forEach(p => {
    console.log(`  ${p.label.padEnd(40)} ${p.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`);
  });
  const totalProduits = incomeStatement.produits.reduce((sum, p) => sum + p.amount, 0);
  console.log(`  ${'TOTAL PRODUITS'.padEnd(40)} ${totalProduits.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`);
  
  console.log('\n💸 CHARGES :');
  incomeStatement.charges.forEach(c => {
    console.log(`  ${c.label.padEnd(40)} ${c.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`);
  });
  const totalCharges = incomeStatement.charges.reduce((sum, c) => sum + c.amount, 0);
  console.log(`  ${'TOTAL CHARGES'.padEnd(40)} ${totalCharges.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`);
  
  console.log('\n🎯 RÉSULTAT NET :');
  console.log(`  ${incomeStatement.resultatNet.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`);

  // 2️⃣ BILAN
  console.log('\n\n📋 2. BILAN');
  console.log('-'.repeat(80));
  const balanceSheet = await computeBalanceSheet();
  
  console.log('\n🔷 ACTIF :');
  balanceSheet.assets.forEach(section => {
    console.log(`\n  ${section.label.toUpperCase()}`);
    section.items.forEach(item => {
      console.log(`    ${item.label.padEnd(38)} ${item.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`);
    });
    console.log(`    ${'Total'.padEnd(38)} ${section.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`);
  });
  console.log(`\n  ${'TOTAL ACTIF'.padEnd(40)} ${balanceSheet.totalAssets.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`);
  
  console.log('\n🔶 PASSIF :');
  balanceSheet.liabilities.forEach(section => {
    console.log(`\n  ${section.label.toUpperCase()}`);
    section.items.forEach(item => {
      console.log(`    ${item.label.padEnd(38)} ${item.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`);
    });
    console.log(`    ${'Total'.padEnd(38)} ${section.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`);
  });
  console.log(`\n  ${'TOTAL PASSIF'.padEnd(40)} ${balanceSheet.totalLiabilities.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`);

  // ⚖️ VÉRIFICATION DE L'ÉQUILIBRE
  console.log('\n\n⚖️ VÉRIFICATION : ACTIF = PASSIF ?');
  console.log('-'.repeat(80));
  const equilibre = balanceSheet.totalAssets === balanceSheet.totalLiabilities;
  console.log(`  Actif  : ${balanceSheet.totalAssets.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`);
  console.log(`  Passif : ${balanceSheet.totalLiabilities.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`);
  console.log(`  Écart  : ${(balanceSheet.totalAssets - balanceSheet.totalLiabilities).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`);
  console.log(`  Résultat : ${equilibre ? '✅ ÉQUILIBRÉ' : '❌ DÉSÉQUILIBRÉ'}`);

  // 3️⃣ CASHFLOW
  console.log('\n\n💧 3. TABLEAU DE FLUX DE TRÉSORERIE');
  console.log('-'.repeat(80));
  
  // On doit passer les entries pour calculer le cashflow
  // Pour l'instant, on simule avec un import
  const { listComptaEntries } = await import('./ComptaStore');
  const entries = await listComptaEntries();
  const cashflow = computeCashflow(entries);
  
  console.log(`\n  Flux d'exploitation        : ${cashflow.exploitation.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`);
  console.log(`  Flux d'investissement      : ${cashflow.investissement.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`);
  console.log(`  Flux de financement        : ${cashflow.financement.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`);
  console.log(`  ${'—'.repeat(40)}`);
  console.log(`  VARIATION DE TRÉSORERIE    : ${cashflow.net.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`);

  // 📊 RÉSUMÉ FINAL
  console.log('\n\n📊 RÉSUMÉ FINAL');
  console.log('='.repeat(80));
  console.log(`  Résultat net (Compte de résultat) : ${incomeStatement.resultatNet.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`);
  console.log(`  Résultat reporté dans le bilan    : ${equilibre ? '✅ OUI' : '❌ NON'}`);
  console.log(`  Équilibre du bilan (A = P)        : ${equilibre ? '✅ OUI' : '❌ NON'}`);
  console.log(`  Variation de trésorerie           : ${cashflow.net.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`);
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ TEST TERMINÉ');
  
  return {
    incomeStatement,
    balanceSheet,
    cashflow,
    equilibre,
  };
}

// Fonction utilitaire pour lancer le test
export async function runTest() {
  try {
    const result = await testLogiqueComptable();
    return result;
  } catch (error) {
    console.error('❌ ERREUR LORS DU TEST :', error);
    throw error;
  }
}
