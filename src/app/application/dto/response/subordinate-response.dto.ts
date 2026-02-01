/**
 * DTO de réponse pour un CR d'un subordonné (provenant de l'API)
 */
export interface SubordinateCRResponseDTO {
  id: string;
  date: string;
  rdqd: string;
  priereSeule: string;
  lectureBiblique?: number;
  statut: string;
  vuParFd: boolean;
  createdAt: string;
}

/**
 * DTO de réponse pour un subordonné avec ses CR (provenant de l'API)
 */
export interface SubordinateWithCRsResponseDTO {
  utilisateurId: string;
  nom: string;
  prenom: string;
  nomComplet: string;
  email: string;
  role: string;
  roleDisplayName: string;
  avatarUrl?: string;

  // Statistiques CR
  lastCRDate?: string;
  daysSinceLastCR?: number;
  regularityRate?: number;
  totalCRs: number;

  // Indicateurs d'alerte
  alertLevel: string;
  hasAlert: boolean;

  // Liste des CR
  compteRendus: SubordinateCRResponseDTO[];
}

/**
 * DTO de réponse pour les statistiques d'un subordonné (provenant de l'API)
 */
export interface SubordinateStatisticsResponseDTO {
  // Informations utilisateur
  utilisateurId: string;
  nom: string;
  prenom: string;
  nomComplet: string;
  email: string;
  role: string;
  roleDisplayName: string;
  avatarUrl?: string;

  // Période
  startDate: string;
  endDate: string;

  // Statistiques CR
  nombreTotalCRs: number;
  tauxRegularite: number;

  // RDQD
  rdqdCompletCount: number;
  tauxRDQD: number;

  // Prière
  dureeTotalePriere: string;
  dureeMoyennePriere: string;

  // Lecture Biblique
  totalChapitresLus: number;
  moyenneChapitresParJour: number;

  // Évangélisation
  totalPersonnesEvangelisees: number;

  // Pratiques spirituelles
  nombreConfessions: number;
  nombreJeunes: number;

  // Indicateurs
  tendancePositive: boolean;
  alertLevel: string;
  hasAlert: boolean;
}

/**
 * DTO de réponse pour un disciple avec son statut CR (provenant de l'API)
 */
export interface DiscipleWithCRStatusResponseDTO {
  discipleId: string;
  nom: string;
  prenom: string;
  nomComplet: string;
  email: string;
  avatarUrl?: string;

  // Statut CR
  dernierCRDate?: string;
  crAujourdhui: boolean;
  joursDepuisDernierCR?: number;
  tauxRegularite30j: number;

  // Indicateurs d'alerte
  alerte: boolean;
  niveauAlerte: string;
}
