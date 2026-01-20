/**
 * DTO de réponse pour un Commentaire (provenant de l'API)
 */
export interface CommentaireResponseDTO {
  id: string;
  compteRenduId: string;
  auteurId: string;
  auteurNom: string;
  auteurPrenom: string;
  contenu: string;
  createdAt: string;
}
