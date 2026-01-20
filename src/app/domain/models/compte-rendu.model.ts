import { StatutCR } from '../enums';

/**
 * Entité Compte Rendu (CR) - Rapport spirituel quotidien
 * Aggregate Root du domaine
 */
export interface CompteRendu {
  readonly id: string;
  readonly utilisateurId: string;
  readonly date: Date;
  readonly rdqd: string;

  // Données de prière
  readonly priereSeule: string;
  readonly priereCouple?: string;
  readonly priereAvecEnfants?: string;
  readonly priereAutres?: number;

  // Étude biblique
  readonly lectureBiblique?: number;
  readonly livreBiblique?: string;

  // Littérature
  readonly litteraturePages?: number;
  readonly litteratureTotal?: number;
  readonly litteratureTitre?: string;

  // Pratiques spirituelles
  readonly confession: boolean;
  readonly jeune: boolean;
  readonly typeJeune?: string;
  readonly evangelisation?: number;
  readonly offrande: boolean;

  // Métadonnées
  readonly notes?: string;
  readonly statut: StatutCR;
  readonly vuParFd: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Factory pour créer un nouveau Compte Rendu
 */
export function createEmptyCompteRendu(utilisateurId: string, date: Date): Partial<CompteRendu> {
  return {
    utilisateurId,
    date,
    rdqd: '0/7',
    priereSeule: '00:00',
    confession: false,
    jeune: false,
    offrande: false,
    statut: StatutCR.BROUILLON,
    vuParFd: false
  };
}

/**
 * Vérifie si un CR peut être modifié
 */
export function canModifyCompteRendu(cr: CompteRendu): boolean {
  if (cr.statut === StatutCR.BROUILLON) {
    return true;
  }

  if (cr.statut === StatutCR.SOUMIS) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return new Date(cr.createdAt) > sevenDaysAgo;
  }

  return false;
}

/**
 * Vérifie si un CR peut être soumis
 */
export function canSubmitCompteRendu(cr: CompteRendu): boolean {
  return cr.statut === StatutCR.BROUILLON;
}

/**
 * Vérifie si un CR peut être validé
 */
export function canValidateCompteRendu(cr: CompteRendu): boolean {
  return cr.statut === StatutCR.SOUMIS;
}
