import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { KeycloakUser, RoleStatistics } from '../../../domain/models';
import { Role } from '../../../domain/enums';
import { UserAdminRepository } from '../../../domain/repositories';
import { UserAdminHttpRepository } from '../../../infrastructure/repositories';

/**
 * Facade pour l'administration des utilisateurs
 * Encapsule la logique metier et l'etat pour la gestion des utilisateurs via Keycloak
 */
@Injectable({
  providedIn: 'root'
})
export class UserAdminFacade {
  private readonly repository: UserAdminRepository = inject(UserAdminHttpRepository);

  // Etat local
  private readonly usersSubject = new BehaviorSubject<KeycloakUser[]>([]);
  private readonly pendingUsersSubject = new BehaviorSubject<KeycloakUser[]>([]);
  private readonly statisticsSubject = new BehaviorSubject<RoleStatistics | null>(null);
  private readonly selectedUserSubject = new BehaviorSubject<KeycloakUser | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  // Observables publics (lecture seule)
  readonly users$ = this.usersSubject.asObservable();
  readonly pendingUsers$ = this.pendingUsersSubject.asObservable();
  readonly statistics$ = this.statisticsSubject.asObservable();
  readonly selectedUser$ = this.selectedUserSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();

  /**
   * Charge tous les utilisateurs
   */
  loadAllUsers(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    console.log('[Facade] Loading all users');
    this.repository.getAll().pipe(
      tap(users => {
        console.log('[Facade] Loaded users:', users.length);
        this.usersSubject.next(users);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error loading users:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    ).subscribe();
  }

  /**
   * Charge les utilisateurs par role
   */
  loadUsersByRole(role: Role): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    console.log('[Facade] Loading users by role', role);
    this.repository.getByRole(role).pipe(
      tap(users => {
        console.log('[Facade] Loaded users by role:', users.length);
        this.usersSubject.next(users);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error loading users by role:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    ).subscribe();
  }

  /**
   * Recherche des utilisateurs
   */
  searchUsers(query: string): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    console.log('[Facade] Searching users with query', query);
    this.repository.search(query).pipe(
      tap(users => {
        console.log('[Facade] Search results:', users.length);
        this.usersSubject.next(users);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error searching users:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    ).subscribe();
  }

  /**
   * Charge les utilisateurs en attente de promotion
   */
  loadPendingUsers(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    console.log('[Facade] Loading pending users');
    this.repository.getPending().pipe(
      tap(users => {
        console.log('[Facade] Loaded pending users:', users.length);
        this.pendingUsersSubject.next(users);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error loading pending users:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    ).subscribe();
  }

  /**
   * Charge les statistiques des roles
   */
  loadStatistics(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    console.log('[Facade] Loading statistics');
    this.repository.getStatistics().pipe(
      tap(stats => {
        console.log('[Facade] Loaded statistics:', stats);
        this.statisticsSubject.next(stats);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error loading statistics:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    ).subscribe();
  }

  /**
   * Assigne un role a un utilisateur
   */
  assignRole(userId: string, role: Role): Observable<KeycloakUser> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.repository.assignRole(userId, role).pipe(
      tap(user => {
        console.log('[Facade] Role assigned:', user);
        // Mettre a jour la liste des utilisateurs
        const currentUsers = this.usersSubject.getValue();
        const userIndex = currentUsers.findIndex(u => u.id === user.id);
        if (userIndex >= 0) {
          const newList = [...currentUsers];
          newList[userIndex] = user;
          this.usersSubject.next(newList);
        }
        // Retirer de la liste des utilisateurs en attente
        const pendingUsers = this.pendingUsersSubject.getValue();
        this.pendingUsersSubject.next(pendingUsers.filter(u => u.id !== user.id));
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error assigning role:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  /**
   * Recupere un utilisateur par ID
   */
  getUserById(id: string): Observable<KeycloakUser> {
    return this.repository.getById(id);
  }

  /**
   * Selectionne un utilisateur
   */
  selectUser(user: KeycloakUser | null): void {
    this.selectedUserSubject.next(user);
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
    this.usersSubject.next([]);
    this.pendingUsersSubject.next([]);
    this.statisticsSubject.next(null);
    this.selectedUserSubject.next(null);
    this.errorSubject.next(null);
    this.loadingSubject.next(false);
  }
}
