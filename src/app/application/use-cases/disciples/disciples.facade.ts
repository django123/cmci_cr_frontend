import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Disciple } from '../../../domain/models';
import { DiscipleRepository } from '../../../domain/repositories';
import { DiscipleHttpRepository } from '../../../infrastructure/repositories';

/**
 * Facade pour les operations sur les Disciples
 * Encapsule la logique metier et l'etat pour la gestion des disciples
 */
@Injectable({
  providedIn: 'root'
})
export class DisciplesFacade {
  private readonly repository: DiscipleRepository = inject(DiscipleHttpRepository);

  // Etat local
  private readonly disciplesSubject = new BehaviorSubject<Disciple[]>([]);
  private readonly myDisciplesSubject = new BehaviorSubject<Disciple[]>([]);
  private readonly unassignedSubject = new BehaviorSubject<Disciple[]>([]);
  private readonly selectedDiscipleSubject = new BehaviorSubject<Disciple | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  // Observables publics (lecture seule)
  readonly disciples$ = this.disciplesSubject.asObservable();
  readonly myDisciples$ = this.myDisciplesSubject.asObservable();
  readonly unassigned$ = this.unassignedSubject.asObservable();
  readonly selectedDisciple$ = this.selectedDiscipleSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();

  /**
   * Charge les disciples d'un FD specifique
   */
  loadDisciplesByFD(fdId: string): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    console.log('[Facade] Loading disciples of FD', fdId);
    this.repository.getByFD(fdId).pipe(
      tap(disciples => {
        console.log('[Facade] Loaded disciples:', disciples.length);
        this.disciplesSubject.next(disciples);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error loading disciples:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    ).subscribe();
  }

  /**
   * Charge les disciples de l'utilisateur connecte
   */
  loadMyDisciples(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    console.log('[Facade] Loading my disciples');
    this.repository.getMyDisciples().pipe(
      tap(disciples => {
        console.log('[Facade] Loaded my disciples:', disciples.length);
        this.myDisciplesSubject.next(disciples);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error loading my disciples:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    ).subscribe();
  }

  /**
   * Charge les disciples sans FD
   */
  loadUnassignedDisciples(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    console.log('[Facade] Loading unassigned disciples');
    this.repository.getUnassigned().pipe(
      tap(disciples => {
        console.log('[Facade] Loaded unassigned disciples:', disciples.length);
        this.unassignedSubject.next(disciples);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error loading unassigned disciples:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    ).subscribe();
  }

  /**
   * Assigne un disciple a un FD
   */
  assignToFD(discipleId: string, fdId: string): Observable<Disciple> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.repository.assignToFD(discipleId, fdId).pipe(
      tap(disciple => {
        console.log('[Facade] Disciple assigned to FD:', disciple);
        // Mettre a jour les listes
        this.updateDiscipleLists(disciple);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error assigning disciple:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  /**
   * Retire l'assignation d'un disciple a son FD
   */
  removeFromFD(discipleId: string): Observable<Disciple> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.repository.removeFromFD(discipleId).pipe(
      tap(disciple => {
        console.log('[Facade] FD assignment removed:', disciple);
        // Mettre a jour les listes
        this.updateDiscipleLists(disciple);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error removing FD assignment:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  /**
   * Recupere le nombre de disciples d'un FD
   */
  countDisciplesByFD(fdId: string): Observable<number> {
    return this.repository.countByFD(fdId);
  }

  /**
   * Selectionne un disciple
   */
  selectDisciple(disciple: Disciple | null): void {
    this.selectedDiscipleSubject.next(disciple);
  }

  /**
   * Efface les erreurs
   */
  clearError(): void {
    this.errorSubject.next(null);
  }

  /**
   * Reinitialise l'etat
   */
  clear(): void {
    this.disciplesSubject.next([]);
    this.myDisciplesSubject.next([]);
    this.unassignedSubject.next([]);
    this.selectedDiscipleSubject.next(null);
    this.errorSubject.next(null);
    this.loadingSubject.next(false);
  }

  /**
   * Met a jour les listes de disciples apres une modification
   */
  private updateDiscipleLists(updatedDisciple: Disciple): void {
    // Mettre a jour dans la liste des disciples
    const currentDisciples = this.disciplesSubject.getValue();
    const discipleIndex = currentDisciples.findIndex(d => d.id === updatedDisciple.id);
    if (discipleIndex >= 0) {
      const newList = [...currentDisciples];
      newList[discipleIndex] = updatedDisciple;
      this.disciplesSubject.next(newList);
    }

    // Mettre a jour dans la liste de mes disciples
    const myDisciples = this.myDisciplesSubject.getValue();
    const myIndex = myDisciples.findIndex(d => d.id === updatedDisciple.id);
    if (myIndex >= 0) {
      if (updatedDisciple.fdId) {
        const newList = [...myDisciples];
        newList[myIndex] = updatedDisciple;
        this.myDisciplesSubject.next(newList);
      } else {
        // Retirer de mes disciples si plus de FD
        this.myDisciplesSubject.next(myDisciples.filter(d => d.id !== updatedDisciple.id));
      }
    }

    // Mettre a jour la liste des non assignes
    const unassigned = this.unassignedSubject.getValue();
    if (updatedDisciple.fdId) {
      // Retirer des non assignes
      this.unassignedSubject.next(unassigned.filter(d => d.id !== updatedDisciple.id));
    } else {
      // Ajouter aux non assignes si pas deja present
      if (!unassigned.find(d => d.id === updatedDisciple.id)) {
        this.unassignedSubject.next([...unassigned, updatedDisciple]);
      }
    }
  }
}
