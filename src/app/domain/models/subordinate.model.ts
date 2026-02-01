import { StatutCR } from '../enums';

/**
 * Niveau d'alerte pour un subordonné
 */
export type AlertLevel = 'NONE' | 'WARNING' | 'CRITICAL';

/**
 * Modèle domain pour un CR d'un subordonné
 */
export interface SubordinateCR {
  id: string;
  date: Date;
  rdqd: string;
  priereSeule: string;
  lectureBiblique?: number;
  statut: StatutCR;
  vuParFd: boolean;
  createdAt: Date;
}

/**
 * Modèle domain pour un subordonné avec ses CR
 */
export interface SubordinateWithCRs {
  utilisateurId: string;
  nom: string;
  prenom: string;
  nomComplet: string;
  email: string;
  role: string;
  roleDisplayName: string;
  avatarUrl?: string;

  // Statistiques CR
  lastCRDate?: Date;
  daysSinceLastCR?: number;
  regularityRate?: number;
  totalCRs: number;

  // Indicateurs d'alerte
  alertLevel: AlertLevel;
  hasAlert: boolean;

  // Liste des CR
  compteRendus: SubordinateCR[];
}

/**
 * Modèle domain pour les statistiques d'un subordonné
 */
export interface SubordinateStatistics {
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
  startDate: Date;
  endDate: Date;

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
  alertLevel: AlertLevel;
  hasAlert: boolean;
}

/**
 * Modèle domain pour un disciple avec son statut CR
 */
export interface DiscipleWithCRStatus {
  discipleId: string;
  nom: string;
  prenom: string;
  nomComplet: string;
  email: string;
  avatarUrl?: string;

  // Statut CR
  dernierCRDate?: Date;
  crAujourdhui: boolean;
  joursDepuisDernierCR?: number;
  tauxRegularite30j: number;

  // Indicateurs d'alerte
  alerte: boolean;
  niveauAlerte: AlertLevel;
}
