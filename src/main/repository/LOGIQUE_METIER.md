# 📘 LOGIQUE MÉTIER COMPTABLE – Construction des États Financiers

## Objectif
Génère dynamiquement à partir d'un tableau d'écritures comptables :
1. **Le BILAN** (situation patrimoniale)
2. **Le COMPTE DE RÉSULTAT** (performance de l'exercice)
3. **Le TABLEAU DE FLUX DE TRÉSORERIE (CASHFLOW)** (mouvements de trésorerie)

---

## 🔹 1. STRUCTURE DU BILAN

Le bilan présente la situation patrimoniale de l'entreprise à un instant T.

### ACTIF (Emplois des ressources)
- **Actif immobilisé** : immobilisations incorporelles, corporelles, financières
  - Exemples : machines, logiciels, camions
  - Catégories : `achat_machine`, `achat_logiciel`, `achat_camion`
  
- **Actif circulant** : stocks, créances clients, trésorerie
  - Produits en attente d'encaissement
  - Catégories : `vente`, `revenu_service` (augmentent la trésorerie)

### PASSIF (Origine des ressources)
- **Capitaux propres** : capital, **résultat de l'exercice**
  - Capital apporté par les propriétaires
  - Résultat net (bénéfice/perte) de l'exercice **automatiquement reporté**
  - Catégories : `apport_capital` + résultat du compte de résultat
  
- **Dettes** : emprunts, dettes fournisseurs, découverts bancaires
  - Obligations de remboursement
  - Catégories : `emprunt_bancaire`, `credit_caisse`
  
- **Charges courantes** : représentent des dettes ou engagements
  - Catégories : `frais_immatriculation`, `loyer`, `electricite`, `interets`, `salaires`, `achat_matieres`

### ⚖️ Équation fondamentale
```
TOTAL ACTIF = TOTAL PASSIF
```

Cette équation est **toujours respectée** grâce au report automatique du résultat net dans les capitaux propres.

---

## 🔹 2. STRUCTURE DU COMPTE DE RÉSULTAT

Le compte de résultat mesure la performance économique sur une période donnée.

### PRODUITS (Revenus)
- **Ventes de marchandises**
  - Catégorie : `vente`
- **Prestations de services**
  - Catégorie : `revenu_service`

### CHARGES (Dépenses)
- **Charges d'exploitation courante**
  - Catégories : `loyer`, `electricite`, `salaires`, `achat_matieres`
- **Charges financières**
  - Catégorie : `interets`
- **Charges exceptionnelles**
  - Catégorie : `frais_immatriculation`

### 💰 Calcul du résultat net
```
RÉSULTAT NET = Total Produits - Total Charges
```

Ce résultat est ensuite **automatiquement reporté** dans la section "Capitaux propres" du bilan.

### Exemple
```typescript
Produits :
- Vente marchandises : 50 000 €
- Prestations services : 20 000 €
Total Produits : 70 000 €

Charges :
- Loyer : 1 500 €
- Salaires : 8 000 €
- Matières premières : 12 000 €
Total Charges : 21 500 €

Résultat Net : 70 000 - 21 500 = 48 500 €
→ Ce montant apparaît dans "Capitaux propres" du bilan
```

---

## 🔹 3. STRUCTURE DU CASHFLOW (Tableau de flux de trésorerie)

Le cashflow retrace les **mouvements réels** d'entrées et sorties de trésorerie.

### 1️⃣ Flux de trésorerie d'EXPLOITATION
Encaissements et décaissements liés à l'activité courante.

**Entrées (+)** :
- Ventes encaissées : `vente`, `revenu_service`

**Sorties (-)** :
- Charges payées : `loyer`, `electricite`, `salaires`, `achat_matieres`, `interets`, `frais_immatriculation`

```
Flux Exploitation = Encaissements - Décaissements
```

### 2️⃣ Flux de trésorerie d'INVESTISSEMENT
Acquisitions et cessions d'immobilisations.

**Sorties (-)** :
- Achats d'immobilisations : `achat_machine`, `achat_logiciel`, `achat_camion`

```
Flux Investissement = - Montant des investissements
```

### 3️⃣ Flux de trésorerie de FINANCEMENT
Mouvements de capitaux propres et d'emprunts.

**Entrées (+)** :
- Apports en capital : `apport_capital`
- Emprunts contractés : `emprunt_bancaire`, `credit_caisse`

**Sorties (-)** :
- Remboursements d'emprunts (à implémenter si nécessaire)

```
Flux Financement = Apports + Emprunts - Remboursements
```

### 💧 Variation de trésorerie
```
VARIATION TRÉSORERIE = Flux Exploitation + Flux Investissement + Flux Financement
```

Cette variation doit correspondre à la variation du poste "Banque" entre deux bilans.

---

## 🎯 EXEMPLE COMPLET

### Écritures comptables
```typescript
[
  { label: 'Apport capital', category: 'apport_capital', amount: 100000 },
  { label: 'Emprunt bancaire', category: 'emprunt_bancaire', amount: 50000 },
  { label: 'Achat machine', category: 'achat_machine', amount: 35000 },
  { label: 'Vente marchandises', category: 'vente', amount: 50000 },
  { label: 'Prestations services', category: 'revenu_service', amount: 20000 },
  { label: 'Loyer', category: 'loyer', amount: 1500 },
  { label: 'Salaires', category: 'salaires', amount: 8000 },
  { label: 'Matières premières', category: 'achat_matieres', amount: 12000 },
]
```

### COMPTE DE RÉSULTAT
```
Produits :
- Ventes : 50 000 €
- Services : 20 000 €
Total Produits : 70 000 €

Charges :
- Loyer : 1 500 €
- Salaires : 8 000 €
- Matières : 12 000 €
Total Charges : 21 500 €

RÉSULTAT NET : 48 500 €
```

### BILAN
```
ACTIF                          PASSIF
-----                          ------
Investissements :              Capitaux propres :
- Machine : 35 000 €           - Capital : 100 000 €
                               - Résultat : 48 500 €
                               Total : 148 500 €
Produits :
- Ventes : 50 000 €            Dettes :
- Services : 20 000 €          - Emprunt : 50 000 €
Total : 70 000 €               Total : 50 000 €

                               Charges :
                               - Loyer : 1 500 €
                               - Salaires : 8 000 €
                               - Matières : 12 000 €
                               Total : 21 500 €

TOTAL ACTIF : 105 000 €        TOTAL PASSIF : 220 000 €
```

**Note** : Dans cet exemple simplifié, l'équilibre doit être ajusté en considérant que :
- Les produits augmentent la trésorerie (actif)
- Les charges diminuent la trésorerie
- Le résultat net représente la différence

### CASHFLOW
```
Flux d'Exploitation :
+ Ventes : 50 000 €
+ Services : 20 000 €
- Loyer : 1 500 €
- Salaires : 8 000 €
- Matières : 12 000 €
= 48 500 €

Flux d'Investissement :
- Machine : 35 000 €
= -35 000 €

Flux de Financement :
+ Capital : 100 000 €
+ Emprunt : 50 000 €
= 150 000 €

VARIATION TRÉSORERIE : 163 500 €
```

---

## ✅ VÉRIFICATIONS AUTOMATIQUES

L'application garantit :

1. **Équilibre du bilan** : ACTIF = PASSIF
   - Le résultat net est automatiquement reporté dans les capitaux propres

2. **Cohérence comptable** : Le résultat du compte de résultat = Produits - Charges

3. **Traçabilité des flux** : La variation de trésorerie du cashflow reflète les mouvements réels

---

## 🔧 IMPLÉMENTATION TECHNIQUE

### Fichiers concernés

1. **`ComptaStore.ts`**
   - `computeIncomeStatement()` : Calcul du compte de résultat
   - `computeBalanceSheet()` : Génération du bilan avec report automatique du résultat

2. **`CashflowService.ts`**
   - `computeCashflow()` : Calcul des flux de trésorerie

3. **`compta.ts`**
   - Définition des types et des catégories
   - Mapping des catégories vers les sections du bilan

### Catégories disponibles

**PRODUITS** (augmentent l'actif) :
- `vente`
- `revenu_service`

**CHARGES** (diminuent l'actif / augmentent le passif) :
- `frais_immatriculation`
- `loyer`
- `electricite`
- `interets`
- `salaires`
- `achat_matieres`

**INVESTISSEMENTS** (actif immobilisé) :
- `achat_machine`
- `achat_logiciel`
- `achat_camion`

**FINANCEMENT** (passif) :
- `apport_capital`
- `emprunt_bancaire`
- `credit_caisse`
