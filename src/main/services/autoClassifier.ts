import type { AutoClassifyInput, AutoKey } from '@shared/autoClassifier';
import type { RegisterComptaPayload } from '@shared/types/compta';

export function buildAutoEntries(input: AutoClassifyInput): RegisterComptaPayload[] {
  const { key, amount, paymentMode, interestsPart } = input;
  const entries: RegisterComptaPayload[] = [];

  const add = (category: RegisterComptaPayload['category'], label: string, amt: number) => {
    entries.push({ category, label, amount: amt });
  };

  switch (key) {
    case 'capital_initial': {
      add('apport_capital', 'Apport en capital', amount);
      break;
    }
    case 'emprunt_bancaire': {
      add('emprunt_bancaire', 'Emprunt bancaire', amount);
      break;
    }
    case 'frais_immatriculation': {
      add('frais_immatriculation', "Frais d'immatriculation", amount);
      // Paiement comptant -> impacte cashflow (dans ce modèle, on laisse le cashflow existant gérer par catégorie)
      break;
    }
    case 'achat_machine': {
      add('achat_machine', 'Achat de machine', amount);
      // Si à crédit -> fournisseur
      if (paymentMode === 'credit') {
        add('dettes_fournisseurs', 'Dette fournisseur - machine', amount);
      }
      break;
    }
    case 'achat_matieres': {
      // Constitution de stock (Bilan)
      add('stock', 'Stock matières premières', amount);
      if (paymentMode === 'credit') {
        add('dettes_fournisseurs', 'Dette fournisseur - matières', amount);
      }
      break;
    }
    case 'vente_meubles': {
      // Produit (CR) + créance si pas encaissé
      add('vente', 'Vente de meubles', amount);
      if (paymentMode === 'credit') {
        add('creances_clients', 'Créance client', amount);
      }
      break;
    }
    case 'paiement_fournisseurs': {
      // Paiement d'une dette fournisseur -> diminue passif (enregistré en négatif)
      add('paiement_fournisseurs', 'Paiement fournisseurs', -Math.abs(amount));
      add('dettes_fournisseurs', 'Réduction dette fournisseur', -Math.abs(amount));
      break;
    }
    case 'facture_electricite': {
      // Charge (CR). Si à crédit, enregistre la dette.
      add('electricite', 'Facture électricité', amount);
      if (paymentMode === 'credit') {
        add('dettes_fournisseurs', 'Dette fournisseur - électricité', amount);
      }
      break;
    }
    case 'credit_caisse': {
      add('credit_caisse', 'Crédit de caisse', amount);
      break;
    }
    case 'encaissement_client': {
      // Encaissement d'une créance client : mouvement + réduction créance (négatif)
      add('encaissement_client', 'Encaissement client', Math.abs(amount));
      add('creances_clients', 'Réduction créance client', -Math.abs(amount));
      break;
    }
    case 'remboursement_emprunt_interets': {
      const interets = Math.max(0, interestsPart ?? 0);
      const principal = Math.max(0, amount - interets);
      if (principal > 0) {
        add('remboursement_emprunt', 'Remboursement emprunt (principal)', -principal);
        // Réduction de la dette bancaire
        add('emprunt_bancaire', 'Réduction emprunt bancaire', -principal);
      }
      if (interets > 0) {
        add('interets', 'Intérêts emprunt', interets);
      }
      break;
    }
    default:
      const _exhaustive: never = key as never;
      throw new Error(`Clé non supportée: ${_exhaustive}`);
  }

  return entries;
}
