import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Statistics, formatMinutesToReadable, getTotalPrayerMinutes } from '../../../domain/models';
import { StatisticsRepository } from '../../../domain/repositories';
import { StatisticsHttpRepository } from '../../../infrastructure/repositories';

/**
 * Façade pour les opérations sur les Statistiques
 * Encapsule la logique métier et l'état
 */
@Injectable({
  providedIn: 'root'
})
export class StatisticsFacade {
  private readonly repository: StatisticsRepository = inject(StatisticsHttpRepository);

  // État local
  private readonly statisticsSubject = new BehaviorSubject<Statistics | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  // Observables publics (lecture seule)
  readonly statistics$ = this.statisticsSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();

  /**
   * Charge les statistiques personnelles
   */
  loadPersonalStatistics(startDate: Date, endDate: Date): Observable<Statistics> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.repository.getPersonalStatistics(startDate, endDate).pipe(
      tap(stats => {
        this.statisticsSubject.next(stats);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  /**
   * Charge les statistiques d'un utilisateur (Admin)
   */
  loadUserStatistics(utilisateurId: string, startDate: Date, endDate: Date): Observable<Statistics> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.repository.getUserStatistics(utilisateurId, startDate, endDate).pipe(
      tap(stats => {
        this.statisticsSubject.next(stats);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  /**
   * Charge les statistiques du mois courant
   */
  loadCurrentMonthStatistics(): void {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.loadPersonalStatistics(startDate, endDate).subscribe();
  }

  /**
   * Charge les statistiques de la semaine courante
   */
  loadCurrentWeekStatistics(): void {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Lundi
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // Dimanche

    this.loadPersonalStatistics(startDate, endDate).subscribe();
  }

  /**
   * Obtient le temps total de prière formaté
   */
  getTotalPrayerFormatted(stats: Statistics): string {
    const totalMinutes = getTotalPrayerMinutes(stats);
    return formatMinutesToReadable(totalMinutes);
  }

  /**
   * Efface les statistiques
   */
  clear(): void {
    this.statisticsSubject.next(null);
    this.errorSubject.next(null);
  }

  /**
   * Efface les erreurs
   */
  clearError(): void {
    this.errorSubject.next(null);
  }
}
