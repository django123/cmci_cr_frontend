/**
 * Enum représentant le statut d'un utilisateur
 */
export enum StatutUtilisateur {
  ACTIF = 'ACTIF',
  INACTIF = 'INACTIF',
  SUSPENDU = 'SUSPENDU'
}

export const StatutUtilisateurLabels: Record<StatutUtilisateur, string> = {
  [StatutUtilisateur.ACTIF]: 'Actif',
  [StatutUtilisateur.INACTIF]: 'Inactif',
  [StatutUtilisateur.SUSPENDU]: 'Suspendu'
};
