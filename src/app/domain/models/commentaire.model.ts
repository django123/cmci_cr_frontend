/**
 * Entité Commentaire - Commentaire sur un Compte Rendu
 */
export interface Commentaire {
  readonly id: string;
  readonly compteRenduId: string;
  readonly auteurId: string;
  readonly auteurNom: string;
  readonly auteurPrenom: string;
  readonly contenu: string;
  readonly createdAt: Date;
}

/**
 * Obtient le nom complet de l'auteur
 */
export function getAuteurFullName(commentaire: Commentaire): string {
  return `${commentaire.auteurPrenom} ${commentaire.auteurNom}`;
}

/**
 * Obtient les initiales de l'auteur
 */
export function getAuteurInitials(commentaire: Commentaire): string {
  return `${commentaire.auteurPrenom.charAt(0)}${commentaire.auteurNom.charAt(0)}`.toUpperCase();
}
