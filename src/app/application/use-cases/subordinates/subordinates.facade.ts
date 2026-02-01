import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import {
  SubordinateWithCRs,
  SubordinateStatistics,
  DiscipleWithCRStatus
} from '../../../domain/models';
import { SubordinatesRepository } from '../../../domain/repositories';
import { SubordinatesHttpRepository } from '../../../infrastructure/repositories';

/**
 * Façade pour les opérations sur les Subordonnés
 * Encapsule la logique métier et l'état pour la gestion hiérarchique
 * FD → ses disciples, Leader → membres de son église de maison,
 * Pasteur → membres de son église locale
 */
@Injectable({
  providedIn: 'root'
})
export class SubordinatesFacade {
  private readonly repository: SubordinatesRepository = inject(SubordinatesHttpRepository);

  // État local
  private readonly subordinatesSubject = new BehaviorSubject<SubordinateWithCRs[]>([]);
  private readonly statisticsSubject = new BehaviorSubject<SubordinateStatistics[]>([]);
  private readonly disciplesSubject = new BehaviorSubject<DiscipleWithCRStatus[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  // Observables publics (lecture seule)
  readonly subordinates$ = this.subordinatesSubject.asObservable();
  readonly statistics$ = this.statisticsSubject.asObservable();
  readonly disciples$ = this.disciplesSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();

  // Observables dérivés
  readonly subordinatesWithAlerts$ = this.subordinates$.pipe(
    tap(subs => subs.filter(sub => sub.hasAlert))
  );

  readonly disciplesWithAlerts$ = this.disciples$.pipe(
    tap(disciples => disciples.filter(d => d.alerte))
  );

  /**
   * Charge les CR des subordonnés pour une période donnée
   */
  loadSubordinatesCR(startDate: Date, endDate: Date): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    console.log('[Facade] Loading subordinates CRs from', startDate, 'to', endDate);
    this.repository.getSubordinatesCR(startDate, endDate).pipe(
      tap(subordinates => {
        console.log('[Facade] Loaded subordinates:', subordinates.length);
        this.subordinatesSubject.next(subordinates);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error loading subordinates CRs:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    ).subscribe();
  }

  /**
   * Charge le résumé des CR des subordonnés (sans détails)
   */
  loadSubordinatesSummary(startDate: Date, endDate: Date): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    console.log('[Facade] Loading subordinates summary from', startDate, 'to', endDate);
    this.repository.getSubordinatesCRSummary(startDate, endDate).pipe(
      tap(subordinates => {
        console.log('[Facade] Loaded subordinates summary:', subordinates.length);
        this.subordinatesSubject.next(subordinates);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error loading subordinates summary:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    ).subscribe();
  }

  /**
   * Charge les statistiques des subordonnés pour une période donnée
   */
  loadSubordinatesStatistics(startDate: Date, endDate: Date): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    console.log('[Facade] Loading subordinates statistics from', startDate, 'to', endDate);
    this.repository.getSubordinatesStatistics(startDate, endDate).pipe(
      tap(statistics => {
        console.log('[Facade] Loaded subordinates statistics:', statistics.length);
        this.statisticsSubject.next(statistics);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error loading subordinates statistics:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    ).subscribe();
  }

  /**
   * Charge le statut CR des disciples (pour FD)
   */
  loadDisciplesStatus(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    console.log('[Facade] Loading disciples status');
    this.repository.getDisciplesStatus().pipe(
      tap(disciples => {
        console.log('[Facade] Loaded disciples:', disciples.length);
        this.disciplesSubject.next(disciples);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error loading disciples status:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    ).subscribe();
  }

  /**
   * Récupère les CR des subordonnés (retourne un Observable)
   */
  getSubordinatesCR(startDate: Date, endDate: Date): Observable<SubordinateWithCRs[]> {
    return this.repository.getSubordinatesCR(startDate, endDate);
  }

  /**
   * Récupère les statistiques des subordonnés (retourne un Observable)
   */
  getSubordinatesStatistics(startDate: Date, endDate: Date): Observable<SubordinateStatistics[]> {
    return this.repository.getSubordinatesStatistics(startDate, endDate);
  }

  /**
   * Récupère le statut des disciples (retourne un Observable)
   */
  getDisciplesStatus(): Observable<DiscipleWithCRStatus[]> {
    return this.repository.getDisciplesStatus();
  }

  /**
   * Efface les erreurs
   */
  clearError(): void {
    this.errorSubject.next(null);
  }

  /**
   * Réinitialise l'état
   */
  clear(): void {
    this.subordinatesSubject.next([]);
    this.statisticsSubject.next([]);
    this.disciplesSubject.next([]);
    this.errorSubject.next(null);
    this.loadingSubject.next(false);
  }
}
