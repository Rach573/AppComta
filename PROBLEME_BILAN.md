# 🔍 Analyse du déséquilibre du bilan ÉcoBois

> Mise à jour (23/10/2025): la clôture automatique a été supprimée de `src/main/repository/testEcoBois.ts`. Lancez la clôture via le bouton UI lorsque vous souhaitez la tester.

## Problème identifié

Le bilan affiche:
- **Actif: 57 840 €** (28 840 trésorerie + 25 000 machine + 4 000 stock)
- **Passif: 81 480 €**

**Écart: 23 640 €**

## Cause racine

Le test `testEcoBois.ts` appelle automatiquement `cloturerExercice()` à la ligne ~220, ce qui:
1. Crée une écriture "Bénéfice reporté" de **7 640 €**
2. Cette écriture reste dans le store et s'affiche dans le bilan

Résultat: le bilan affiche:
- Bénéfice reporté: **7 640 €** ❌ (ne devrait pas être là avant clôture manuelle)
- Résultat de l'exercice: **7 640 €** ✅
- **Total passif en trop: 7 640 €**

Il reste encore **16 000 €** de déséquilibre, probablement dû à un problème dans le calcul du cashflow.

## Solution immédiate

### Option 1: Supprimer la clôture automatique du test

Dans `testEcoBois.ts`, lignes 218-235, **commenter ou supprimer** cette section:

```typescript
// Test clôture
console.log('🔒 TEST CLÔTURE D\'EXERCICE\n');
const cloture = await cloturerExercice();
console.log(`    ${cloture.inserted ? '✅ Clôture effectuée' : '⚠️  ' + cloture.message}`);
if (cloture.inserted) {
  console.log(`    Écriture créée: ${(cloture.entry as any).label} - ${(cloture.entry as any).amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`);
}

const bilanApres = await computeBalanceSheet();
const capitauxPropres = bilanApres.liabilities.find((s) => s.label === 'Capitaux propres');
if (capitauxPropres) {
  console.log('\n    Capitaux propres après clôture:');
  capitauxPropres.items.forEach((item) => {
    console.log(`      ${item.label.padEnd(40)} ${item.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`);
  });
  console.log(`      ${'Total'.padEnd(40)} ${capitauxPropres.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`);
}
```

**Remplacer par:**
```typescript
// Note: La clôture d'exercice peut être testée manuellement via le bouton UI
console.log('💡 Pour tester la clôture d\'exercice, utilisez le bouton "Clôturer l\'exercice" dans l\'onglet Bilan.\n');
```

### Option 2: Réinitialiser le store avant chaque test

Dans `testEcoBois.ts`, au début de la fonction, ajouter:

```typescript
// Nettoyage complet du store
import { comptaStore } from './ComptaStore';
comptaStore.length = 0;
```

## Problème secondaire: Trésorerie

La trésorerie affiche **28 840 €** au lieu de **44 840 €**.

**Flux attendus:**
- Entrées: 40 000 (capital) + 2 000 (crédit caisse) + 18 000 (encaissement) = **60 000 €**
- Sorties: 3 000 (frais) + 10 000 (paiement matières) + 2 160 (remb. crédit + intérêts) = **15 160 €**
- **Net: 44 840 €**

**Écart: 16 000 €**

### Hypothèse

Le cashflow ne compte peut-être pas correctement:
- L'emprunt de 15 000 € (financement)
- Ou le paiement avec l'emprunt (conflit entre paiement_fournisseurs et emprunt)

### Vérification

Dans la console, cherche la ligne:
```
Flux de financement        : ??? €
```

Le flux de financement devrait être:
- Apport capital: +40 000
- Emprunt bancaire: +15 000  
- Crédit caisse: +2 000
- Remboursement crédit: -2 000
- **Net financement: +55 000 €** (ou +15 000 si capital exclu)

## Actions à faire

1. ✅ **Désactiver la clôture automatique** dans testEcoBois.ts — Fait (23/10/2025)
2. ⏳ **Vérifier le calcul du cashflow** pour comprendre les 16 000 € manquants
3. ⏳ **Relancer le test** et noter les valeurs exactes de chaque flux

## Bilan attendu (correct)

**ACTIF: 73 840 €**
- Machine: 25 000 €
- Stock: 4 000 €
- Trésorerie: 44 840 €

**PASSIF: 73 840 €**
- Capital: 40 000 €
- Bénéfice reporté: 0 €
- Résultat: 7 640 €
- Emprunt bancaire: 15 000 €
- Dettes fournisseurs: 11 200 €

**✅ ÉQUILIBRE: 73 840 € = 73 840 €**
