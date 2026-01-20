/**
 * DTO de réponse pour les Statistiques (provenant de l'API)
 */
export interface StatisticsResponseDTO {
  startDate: string;
  endDate: string;
  totalCRSoumis: number;
  totalCRValides: number;
  tauxCompletion: number;
  totalRDQDAccomplis: number;
  totalRDQDAttendus: number;
  moyenneRDQD: number;
  totalPriereSeuleMinutes: number;
  totalPriereCoupleMinutes: number;
  totalPriereAvecEnfantsMinutes: number;
  totalTempsEtudeParoleMinutes: number;
  totalContactsUtiles: number;
  totalInvitationsCulte: number;
  totalOffrandes: number;
  totalEvangelisations: number;
}
