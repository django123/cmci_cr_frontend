/**
 * Enum représentant le statut d'un Compte Rendu
 * @description Cycle de vie: BROUILLON -> SOUMIS -> VALIDE
 */
export enum StatutCR {
  BROUILLON = 'BROUILLON',
  SOUMIS = 'SOUMIS',
  VALIDE = 'VALIDE'
}

export const StatutCRLabels: Record<StatutCR, string> = {
  [StatutCR.BROUILLON]: 'Brouillon',
  [StatutCR.SOUMIS]: 'Soumis',
  [StatutCR.VALIDE]: 'Validé'
};

export const StatutCRColors: Record<StatutCR, string> = {
  [StatutCR.BROUILLON]: 'secondary',
  [StatutCR.SOUMIS]: 'info',
  [StatutCR.VALIDE]: 'success'
};
