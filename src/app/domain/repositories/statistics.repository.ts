import { Observable } from 'rxjs';
import { Statistics } from '../models';

/**
 * Interface du repository pour les Statistiques
 * Port (abstraction) suivant le principe d'inversion des dépendances
 */
export abstract class StatisticsRepository {
  /**
   * Récupère les statistiques personnelles de l'utilisateur connecté
   */
  abstract getPersonalStatistics(startDate: Date, endDate: Date): Observable<Statistics>;

  /**
   * Récupère les statistiques d'un utilisateur spécifique (Admin)
   */
  abstract getUserStatistics(
    utilisateurId: string,
    startDate: Date,
    endDate: Date
  ): Observable<Statistics>;

  /**
   * Exporte les statistiques personnelles en PDF ou Excel
   */
  abstract exportPersonalStatistics(
    startDate: Date,
    endDate: Date,
    format: 'pdf' | 'excel'
  ): Observable<Blob>;

  /**
   * Exporte les statistiques de groupe en PDF ou Excel (FD+)
   */
  abstract exportGroupStatistics(
    startDate: Date,
    endDate: Date,
    format: 'pdf' | 'excel'
  ): Observable<Blob>;
}
