import { Observable } from 'rxjs';
import { SubordinateWithCRs, SubordinateStatistics, DiscipleWithCRStatus } from '../models';

/**
 * Interface du repository pour les Subordonnés
 * Port (abstraction) suivant le principe d'inversion des dépendances
 */
export abstract class SubordinatesRepository {
  /**
   * Récupère les CR des subordonnés pour une période donnée
   * FD → ses disciples, Leader → membres de son église de maison,
   * Pasteur → membres de son église locale
   */
  abstract getSubordinatesCR(startDate: Date, endDate: Date): Observable<SubordinateWithCRs[]>;

  /**
   * Récupère un résumé des CR des subordonnés (sans les détails des CR)
   */
  abstract getSubordinatesCRSummary(startDate: Date, endDate: Date): Observable<SubordinateWithCRs[]>;

  /**
   * Récupère les statistiques des subordonnés pour une période donnée
   */
  abstract getSubordinatesStatistics(startDate: Date, endDate: Date): Observable<SubordinateStatistics[]>;

  /**
   * Récupère le statut CR des disciples (pour FD)
   */
  abstract getDisciplesStatus(): Observable<DiscipleWithCRStatus[]>;
}
