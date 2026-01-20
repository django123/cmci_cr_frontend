/**
 * Modèle de statistiques pour un utilisateur sur une période
 */
export interface Statistics {
  readonly startDate: Date;
  readonly endDate: Date;

  // Statistiques CR
  readonly totalCRSoumis: number;
  readonly totalCRValides: number;
  readonly tauxCompletion: number;

  // Statistiques RDQD
  readonly totalRDQDAccomplis: number;
  readonly totalRDQDAttendus: number;
  readonly moyenneRDQD: number;

  // Statistiques prière (en minutes)
  readonly totalPriereSeuleMinutes: number;
  readonly totalPriereCoupleMinutes: number;
  readonly totalPriereAvecEnfantsMinutes: number;

  // Statistiques étude
  readonly totalTempsEtudeParoleMinutes: number;

  // Statistiques évangélisation
  readonly totalContactsUtiles: number;
  readonly totalInvitationsCulte: number;
  readonly totalEvangelisations: number;

  // Statistiques offrandes
  readonly totalOffrandes: number;
}

/**
 * Obtient le temps total de prière en minutes
 */
export function getTotalPrayerMinutes(stats: Statistics): number {
  return (
    stats.totalPriereSeuleMinutes +
    stats.totalPriereCoupleMinutes +
    stats.totalPriereAvecEnfantsMinutes
  );
}

/**
 * Formate une durée en minutes en chaîne lisible
 */
export function formatMinutesToReadable(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}min`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${mins}min`;
  }
}

/**
 * Calcule le pourcentage de progression
 */
export function calculateProgressPercentage(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
}
