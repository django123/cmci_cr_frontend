import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Commentaire } from '../../../domain/models';
import { CommentaireRepository, AddCommentaireRequest } from '../../../domain/repositories';
import { CommentaireHttpRepository } from '../../../infrastructure/repositories';

/**
 * Façade pour les opérations sur les Commentaires
 * Encapsule la logique métier et l'état
 */
@Injectable({
  providedIn: 'root'
})
export class CommentaireFacade {
  private readonly repository: CommentaireRepository = inject(CommentaireHttpRepository);

  // État local
  private readonly commentairesSubject = new BehaviorSubject<Commentaire[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  // Observables publics (lecture seule)
  readonly commentaires$ = this.commentairesSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();

  /**
   * Charge les commentaires d'un compte rendu
   */
  loadByCompteRenduId(compteRenduId: string): Observable<Commentaire[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.repository.getByCompteRenduId(compteRenduId).pipe(
      tap(commentaires => {
        this.commentairesSubject.next(commentaires);
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
   * Ajoute un commentaire à un compte rendu
   */
  add(compteRenduId: string, request: AddCommentaireRequest): Observable<Commentaire> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.repository.add(compteRenduId, request).pipe(
      tap(newCommentaire => {
        const current = this.commentairesSubject.value;
        this.commentairesSubject.next([...current, newCommentaire]);
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
   * Efface les commentaires (lors du changement de CR sélectionné)
   */
  clear(): void {
    this.commentairesSubject.next([]);
    this.errorSubject.next(null);
  }

  /**
   * Efface les erreurs
   */
  clearError(): void {
    this.errorSubject.next(null);
  }
}
