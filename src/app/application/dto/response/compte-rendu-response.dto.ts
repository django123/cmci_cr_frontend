import { StatutCR } from '../../../domain/enums';

/**
 * DTO de réponse pour un Compte Rendu (provenant de l'API)
 */
export interface CompteRenduResponseDTO {
  id: string;
  utilisateurId: string;
  utilisateurNom?: string;
  utilisateurPrenom?: string;
  date: string;
  rdqd: string;
  priereSeule: string;
  priereCouple?: string;
  priereAvecEnfants?: string;
  priereAutres?: number;
  lectureBiblique?: number;
  livreBiblique?: string;
  litteraturePages?: number;
  litteratureTotal?: number;
  litteratureTitre?: string;
  confession: boolean;
  jeune: boolean;
  typeJeune?: string;
  evangelisation?: number;
  offrande: boolean;
  notes?: string;
  statut: StatutCR;
  vuParFd: boolean;
  createdAt: string;
  updatedAt: string;
}
