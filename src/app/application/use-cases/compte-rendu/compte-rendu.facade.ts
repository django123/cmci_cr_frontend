import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, tap, shareReplay, switchMap, catchError } from 'rxjs/operators';
import { CompteRendu } from '../../../domain/models';
import { CompteRenduRepository, CreateCompteRenduRequest, UpdateCompteRenduRequest } from '../../../domain/repositories';
import { CompteRenduHttpRepository } from '../../../infrastructure/repositories';
import { AuthService } from '../../../infrastructure/auth';
import { StatutCR } from '../../../domain/enums';

/**
 * Façade pour les opérations sur les Comptes Rendus
 * Encapsule la logique métier et l'état
 * Principe de ségrégation des interfaces: expose uniquement les méthodes nécessaires à la UI
 */
@Injectable({
  providedIn: 'root'
})
export class CompteRenduFacade {
  private readonly repository: CompteRenduRepository = inject(CompteRenduHttpRepository);
  private readonly authService = inject(AuthService);

  // État local
  private readonly comptesRendusSubject = new BehaviorSubject<CompteRendu[]>([]);
  private readonly selectedCRSubject = new BehaviorSubject<CompteRendu | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  // Observables publics (lecture seule)
  readonly comptesRendus$ = this.comptesRendusSubject.asObservable();
  readonly selectedCR$ = this.selectedCRSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();

  // Observables dérivés
  readonly brouillons$ = this.comptesRendus$.pipe(
    map(crs => crs.filter(cr => cr.statut === StatutCR.BROUILLON))
  );

  readonly soumis$ = this.comptesRendus$.pipe(
    map(crs => crs.filter(cr => cr.statut === StatutCR.SOUMIS))
  );

  readonly valides$ = this.comptesRendus$.pipe(
    map(crs => crs.filter(cr => cr.statut === StatutCR.VALIDE))
  );

  readonly recentCRs$ = this.comptesRendus$.pipe(
    map(crs => [...crs].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ).slice(0, 10))
  );

  /**
   * Charge les comptes rendus de l'utilisateur connecté
   */
  loadMyCompteRendus(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.authService.getCurrentUser().pipe(
      switchMap(user => this.repository.getByUserId(user.id)),
      tap(crs => {
        this.comptesRendusSubject.next(crs);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    ).subscribe();
  }

  /**
   * Charge les comptes rendus d'un utilisateur pour une période
   */
  loadByPeriod(utilisateurId: string, startDate: Date, endDate: Date): Observable<CompteRendu[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.repository.getByUserIdAndPeriod(utilisateurId, startDate, endDate).pipe(
      tap(crs => {
        this.comptesRendusSubject.next(crs);
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
   * Récupère un compte rendu par son ID
   */
  getById(id: string): Observable<CompteRendu> {
    return this.repository.getById(id).pipe(
      tap(cr => this.selectedCRSubject.next(cr))
    );
  }

  /**
   * Crée un nouveau compte rendu
   */
  create(request: CreateCompteRenduRequest): Observable<CompteRendu> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.repository.create(request).pipe(
      tap(newCR => {
        const current = this.comptesRendusSubject.value;
        this.comptesRendusSubject.next([newCR, ...current]);
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
   * Met à jour un compte rendu
   */
  update(id: string, request: UpdateCompteRenduRequest): Observable<CompteRendu> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.repository.update(id, request).pipe(
      tap(updatedCR => {
        const current = this.comptesRendusSubject.value;
        const index = current.findIndex(cr => cr.id === id);
        if (index !== -1) {
          const updated = [...current];
          updated[index] = updatedCR;
          this.comptesRendusSubject.next(updated);
        }
        if (this.selectedCRSubject.value?.id === id) {
          this.selectedCRSubject.next(updatedCR);
        }
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
   * Supprime un compte rendu
   */
  delete(id: string): Observable<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.repository.delete(id).pipe(
      tap(() => {
        const current = this.comptesRendusSubject.value;
        this.comptesRendusSubject.next(current.filter(cr => cr.id !== id));
        if (this.selectedCRSubject.value?.id === id) {
          this.selectedCRSubject.next(null);
        }
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
   * Soumet un compte rendu pour validation
   */
  submit(id: string): Observable<CompteRendu> {
    return this.repository.submit(id).pipe(
      tap(updatedCR => this.updateLocalCR(updatedCR))
    );
  }

  /**
   * Valide un compte rendu (FD/Leader/Pasteur/Admin)
   */
  validate(id: string): Observable<CompteRendu> {
    return this.repository.validate(id).pipe(
      tap(updatedCR => this.updateLocalCR(updatedCR))
    );
  }

  /**
   * Marque un compte rendu comme vu
   */
  markAsViewed(id: string): Observable<CompteRendu> {
    return this.repository.markAsViewed(id).pipe(
      tap(updatedCR => this.updateLocalCR(updatedCR))
    );
  }

  /**
   * Sélectionne un compte rendu
   */
  select(cr: CompteRendu | null): void {
    this.selectedCRSubject.next(cr);
  }

  /**
   * Efface les erreurs
   */
  clearError(): void {
    this.errorSubject.next(null);
  }

  /**
   * Met à jour un CR dans la liste locale
   */
  private updateLocalCR(updatedCR: CompteRendu): void {
    const current = this.comptesRendusSubject.value;
    const index = current.findIndex(cr => cr.id === updatedCR.id);
    if (index !== -1) {
      const updated = [...current];
      updated[index] = updatedCR;
      this.comptesRendusSubject.next(updated);
    }
    if (this.selectedCRSubject.value?.id === updatedCR.id) {
      this.selectedCRSubject.next(updatedCR);
    }
  }
}
