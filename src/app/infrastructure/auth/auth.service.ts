import { Injectable, inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { Observable, of, BehaviorSubject } from 'rxjs';
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

    // Utiliser directement les données du token (évite les appels CORS)
    const user = this.getUserFromToken();
    if (user) {
      console.log('[AuthService] User from token:', user.id, user.email, user.role);
      this.currentUserSubject.next(user);
      return of(user);
    }

    throw new Error('Impossible de charger le profil utilisateur depuis le token');
  }

  /**
   * Extrait les informations utilisateur directement du token JWT
   * Évite les problèmes CORS avec l'endpoint /account de Keycloak
   */
  private getUserFromToken(): Utilisateur | null {
    const tokenParsed = this.keycloak.getKeycloakInstance().tokenParsed;

    if (!tokenParsed) {
      console.error('[AuthService] No token parsed available');
      return null;
    }

    console.log('[AuthService] Token parsed:', tokenParsed);

    const roles = this.keycloak.getUserRoles();
    const role = this.determineHighestRole(roles);

    // user_id vient de notre mapper Keycloak configuré
    const userId = tokenParsed['user_id'] || tokenParsed.sub || '';

    return {
      id: userId,
      email: tokenParsed['email'] || '',
      nom: tokenParsed['family_name'] || tokenParsed['preferred_username'] || '',
      prenom: tokenParsed['given_name'] || '',
      role: role,
      egliseMaisonId: tokenParsed['eglise_maison_id'],
      fdId: tokenParsed['fd_id'],
      avatarUrl: tokenParsed['avatar_url'],
      telephone: tokenParsed['telephone'],
      dateNaissance: tokenParsed['date_naissance'] ? new Date(tokenParsed['date_naissance']) : undefined,
      dateBapteme: tokenParsed['date_bapteme'] ? new Date(tokenParsed['date_bapteme']) : undefined,
      statut: StatutUtilisateur.ACTIF,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  isAuthenticated(): Observable<boolean> {
    return of(this.keycloak.isLoggedIn());
  }

  getToken(): Observable<string | null> {
    try {
      const token = this.keycloak.getKeycloakInstance().token;
      return of(token || null);
    } catch {
      return of(null);
    }
  }

  login(): void {
    this.keycloak.login();
  }

  logout(): void {
    this.currentUserSubject.next(null);
    this.keycloak.logout(window.location.origin);
  }

  refreshToken(): Observable<string> {
    return new Observable(observer => {
      this.keycloak.updateToken(30).then(() => {
        const token = this.keycloak.getKeycloakInstance().token || '';
        observer.next(token);
        observer.complete();
      }).catch(() => {
        this.logout();
        observer.error(new Error('Session expirée'));
      });
    });
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
