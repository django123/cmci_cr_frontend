import { Injectable, inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { Observable, from, of, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { AuthRepository } from '../../domain/repositories';
import { Utilisateur } from '../../domain/models';
import { Role, StatutUtilisateur } from '../../domain/enums';

/**
 * Service d'authentification utilisant Keycloak
 * Implémente le pattern Adapter pour l'authentification
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService extends AuthRepository {
  private readonly keycloak = inject(KeycloakService);
  private readonly currentUserSubject = new BehaviorSubject<Utilisateur | null>(null);

  readonly currentUser$ = this.currentUserSubject.asObservable();

  getCurrentUser(): Observable<Utilisateur> {
    if (this.currentUserSubject.value) {
      return of(this.currentUserSubject.value);
    }

    return from(this.keycloak.loadUserProfile()).pipe(
      map(profile => this.mapKeycloakProfileToUtilisateur(profile)),
      tap(user => this.currentUserSubject.next(user)),
      catchError(() => {
        throw new Error('Impossible de charger le profil utilisateur');
      })
    );
  }

  isAuthenticated(): Observable<boolean> {
    return of(this.keycloak.isLoggedIn());
  }

  getToken(): Observable<string | null> {
    return from(this.keycloak.getToken()).pipe(
      catchError(() => of(null))
    );
  }

  login(): void {
    this.keycloak.login();
  }

  logout(): void {
    this.currentUserSubject.next(null);
    this.keycloak.logout(window.location.origin);
  }

  refreshToken(): Observable<string> {
    return from(this.keycloak.updateToken(30)).pipe(
      map(() => this.keycloak.getKeycloakInstance().token || ''),
      catchError(() => {
        this.logout();
        throw new Error('Session expirée');
      })
    );
  }

  /**
   * Récupère les rôles de l'utilisateur depuis Keycloak
   */
  getUserRoles(): string[] {
    return this.keycloak.getUserRoles();
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  hasRole(role: string): boolean {
    return this.keycloak.getUserRoles().includes(role);
  }

  /**
   * Vérifie si l'utilisateur a au moins un des rôles spécifiés
   */
  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.keycloak.getUserRoles();
    return roles.some(role => userRoles.includes(role));
  }

  /**
   * Mappe le profil Keycloak vers le modèle Utilisateur du domaine
   */
  private mapKeycloakProfileToUtilisateur(profile: Keycloak.KeycloakProfile): Utilisateur {
    const roles = this.keycloak.getUserRoles();
    const role = this.determineHighestRole(roles);
    const tokenParsed = this.keycloak.getKeycloakInstance().tokenParsed;

    return {
      id: profile.id || tokenParsed?.sub || '',
      email: profile.email || '',
      nom: profile.lastName || '',
      prenom: profile.firstName || '',
      role: role,
      egliseMaisonId: tokenParsed?.['eglise_maison_id'],
      fdId: tokenParsed?.['fd_id'],
      avatarUrl: tokenParsed?.['avatar_url'],
      telephone: tokenParsed?.['telephone'],
      dateNaissance: tokenParsed?.['date_naissance'] ? new Date(tokenParsed['date_naissance']) : undefined,
      dateBapteme: tokenParsed?.['date_bapteme'] ? new Date(tokenParsed['date_bapteme']) : undefined,
      statut: StatutUtilisateur.ACTIF,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Détermine le rôle le plus élevé parmi les rôles Keycloak
   */
  private determineHighestRole(roles: string[]): Role {
    const roleHierarchy = [Role.ADMIN, Role.PASTEUR, Role.LEADER, Role.FD, Role.FIDELE];

    for (const role of roleHierarchy) {
      if (roles.includes(role) || roles.includes(role.toLowerCase())) {
        return role;
      }
    }

    return Role.FIDELE;
  }
}
