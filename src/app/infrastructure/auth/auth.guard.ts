import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';

/**
 * Guard d'authentification basé sur Keycloak
 * Protège les routes nécessitant une authentification
 * Gère le mode dégradé quand Keycloak n'est pas disponible
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard extends KeycloakAuthGuard {
  constructor(
    protected override readonly router: Router,
    protected readonly keycloak: KeycloakService
  ) {
    super(router, keycloak);
  }

  async isAccessAllowed(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    try {
      // Vérifier si Keycloak est initialisé et fonctionnel
      const keycloakInstance = this.keycloak.getKeycloakInstance();

      // Si Keycloak n'est pas disponible, rediriger vers login local
      if (!keycloakInstance) {
        console.warn('Keycloak non disponible, redirection vers login local');
        this.router.navigate(['/auth/login']);
        return false;
      }

      // Si l'utilisateur n'est pas authentifié
      if (!this.authenticated) {
        // Rediriger vers la page de login locale
        this.router.navigate(['/auth/login']);
        return false;
      }

      // Vérifier les rôles requis si spécifiés dans la route
      const requiredRoles = route.data['roles'] as string[];

      if (!requiredRoles || requiredRoles.length === 0) {
        return true;
      }

      // Vérifier si l'utilisateur a au moins un des rôles requis
      const hasRequiredRole = requiredRoles.some(role =>
        this.roles.includes(role) || this.roles.includes(role.toLowerCase())
      );

      if (!hasRequiredRole) {
        this.router.navigate(['/dashboard']);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur AuthGuard:', error);
      this.router.navigate(['/auth/login']);
      return false;
    }
  }
}
