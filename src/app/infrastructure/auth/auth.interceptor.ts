import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';

/**
 * Intercepteur HTTP pour l'authentification
 * - Ajoute le token JWT aux requêtes
 * - Gère le rafraîchissement automatique du token
 * - Redirige vers login si token expiré
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly keycloak = inject(KeycloakService);

  private readonly excludedUrls = ['/assets', '/public'];

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Ne pas intercepter les URLs exclues
    if (this.isExcludedUrl(request.url)) {
      return next.handle(request);
    }

    const isLoggedIn = this.keycloak.isLoggedIn();
    if (!isLoggedIn) {
      return next.handle(request);
    }

    return from(this.keycloak.getToken()).pipe(
      switchMap(token => {
        const authRequest = this.addAuthorizationHeader(request, token);
        return next.handle(authRequest);
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expiré ou invalide
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Vérifie si l'URL est exclue de l'interception
   */
  private isExcludedUrl(url: string): boolean {
    return this.excludedUrls.some(excluded => url.includes(excluded));
  }

  /**
   * Ajoute le header d'autorisation à la requête
   */
  private addAuthorizationHeader(
    request: HttpRequest<unknown>,
    token: string
  ): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  /**
   * Gère les erreurs 401 en tentant de rafraîchir le token
   */
  private handle401Error(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return from(this.keycloak.updateToken(30)).pipe(
      switchMap(() => from(this.keycloak.getToken())),
      switchMap(token => {
        const authRequest = this.addAuthorizationHeader(request, token);
        return next.handle(authRequest);
      }),
      catchError(() => {
        // Impossible de rafraîchir le token, rediriger vers login
        this.keycloak.login();
        return throwError(() => new Error('Session expirée'));
      })
    );
  }
}
