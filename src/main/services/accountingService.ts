// src/main/services/accountingService.ts

export interface EcritureComptable {
  libelle: string;
  date: Date;
  lignes: Array<{
    compte: string;
    libelle: string;
    debit?: number;
    credit?: number;
  }>;
}

interface DictionnaireComptable {
  [cle: string]: {
    description: string;
    comptes: {
      debit: { compte: string; libelle: string };
      credit: { compte: string; libelle: string };
    };
  };
}

const dictionnaireComptable: DictionnaireComptable = {
  "apport capital": {
    description: "Apport en capital par le fondateur",
    comptes: {
      debit: { compte: "512", libelle: "Banque" },
      credit: { compte: "101", libelle: "Capital social" }
    }
  },
  "frais immatriculation": {
    description: "Frais d'établissement",
    comptes: {
      debit: { compte: "201", libelle: "Frais d’établissement" },
      credit: { compte: "512", libelle: "Banque" }
    }
  },
  "achat machine": {
    description: "Achat d'une machine financée partiellement par emprunt",
    comptes: {
      debit: { compte: "215", libelle: "Immobilisation corporelle" },
      credit: { compte: "164", libelle: "Emprunt bancaire" }
    }
  },
  "achat matières": {
    description: "Achat de matières premières à crédit",
    comptes: {
      debit: { compte: "601", libelle: "Achats matières premières" },
      credit: { compte: "401", libelle: "Fournisseurs" }
    }
  },
  "vente meubles": {
    description: "Vente de production à crédit",
    comptes: {
      debit: { compte: "411", libelle: "Clients" },
      credit: { compte: "706", libelle: "Ventes de produits finis" }
    }
  },
  "consommation matières": {
    description: "Consommation de matières premières pour production",
    comptes: {
      debit: { compte: "603", libelle: "Variation des stocks" },
      credit: { compte: "601", libelle: "Achats matières premières" }
    }
  },
  "paiement fournisseurs": {
    description: "Paiement des fournisseurs",
    comptes: {
      debit: { compte: "401", libelle: "Fournisseurs" },
      credit: { compte: "512", libelle: "Banque" }
    }
  },
  "facture electricite": {
    description: "Facture d’électricité à régler",
    comptes: {
      debit: { compte: "6061", libelle: "Électricité" },
      credit: { compte: "401", libelle: "Fournisseurs" }
    }
  },
  "credit caisse": {
    description: "Crédit de caisse pour financer une charge",
    comptes: {
      debit: { compte: "512", libelle: "Banque" },
      credit: { compte: "519", libelle: "Crédit de caisse" }
    }
  },
  "encaissement client": {
    description: "Paiement reçu du client",
    comptes: {
      debit: { compte: "512", libelle: "Banque" },
      credit: { compte: "411", libelle: "Clients" }
    }
  },
  "remboursement credit caisse": {
    description: "Remboursement du crédit de caisse",
    comptes: {
      debit: { compte: "519", libelle: "Crédit de caisse" },
      credit: { compte: "512", libelle: "Banque" }
    }
  },
  "interets credit": {
    description: "Paiement des intérêts du crédit",
    comptes: {
      debit: { compte: "661", libelle: "Intérêts bancaires" },
      credit: { compte: "512", libelle: "Banque" }
    }
  }
};

export function trouverEcriture(input: string, montant: number): EcritureComptable | null {
  const cle = Object.keys(dictionnaireComptable).find(k => input.toLowerCase().includes(k));
  if (!cle) return null;

  const base = dictionnaireComptable[cle];

  return {
    libelle: base.description,
    date: new Date(),
    lignes: [
      { ...base.comptes.debit, debit: montant },
      { ...base.comptes.credit, credit: montant }
    ]
  };
}
