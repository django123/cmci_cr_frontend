/**
 * DTO de requête pour mettre à jour un Compte Rendu
 */
export interface UpdateCompteRenduRequestDTO {
  rdqd?: string;
  priereSeuleMinutes?: number;
  priereCoupleMinutes?: number;
  priereAvecEnfantsMinutes?: number;
  lectureBiblique?: number;
  livreBiblique?: string;
  litteraturePages?: number;
  litteratureTotal?: number;
  litteratureTitre?: string;
  priereAutres?: number;
  confession?: boolean;
  jeune?: boolean;
  typeJeune?: string;
  evangelisation?: number;
  offrande?: boolean;
  notes?: string;
}
