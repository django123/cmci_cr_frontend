import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { API_CONFIG, ApiConfig, buildApiUrl, defaultApiConfig } from '../config/api.config';
import { ErrorResponseDTO } from '../../application/dto/response';

/**
 * Options de requête HTTP
 */
export interface RequestOptions {
  headers?: HttpHeaders;
  params?: HttpParams | { [param: string]: string | string[] };
}

/**
 * Service HTTP de base pour les appels API
 * Principe de responsabilité unique: gestion centralisée des appels HTTP
 */
@Injectable({
  providedIn: 'root'
})
export class BaseHttpService {
  private readonly http = inject(HttpClient);
  private readonly config: ApiConfig;

  constructor() {
    // Utilise la config par défaut si non injectée
    this.config = defaultApiConfig;
  }

  /**
   * Effectue une requête GET
   */
  get<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    const url = buildApiUrl(this.config, endpoint);
    return this.http.get<T>(url, options).pipe(
      timeout(this.config.timeout),
      catchError(this.handleError)
    );
  }

  /**
   * Effectue une requête POST
   */
  post<T>(endpoint: string, body: unknown, options?: RequestOptions): Observable<T> {
    const url = buildApiUrl(this.config, endpoint);
    return this.http.post<T>(url, body, options).pipe(
      timeout(this.config.timeout),
      catchError(this.handleError)
    );
  }

  /**
   * Effectue une requête PUT
   */
  put<T>(endpoint: string, body: unknown, options?: RequestOptions): Observable<T> {
    const url = buildApiUrl(this.config, endpoint);
    return this.http.put<T>(url, body, options).pipe(
      timeout(this.config.timeout),
      catchError(this.handleError)
    );
  }

  /**
   * Effectue une requête DELETE
   */
  delete<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    const url = buildApiUrl(this.config, endpoint);
    return this.http.delete<T>(url, options).pipe(
      timeout(this.config.timeout),
      catchError(this.handleError)
    );
  }

  /**
   * Effectue une requête GET qui retourne un Blob (fichier binaire)
   */
  getBlob(endpoint: string, options?: RequestOptions): Observable<Blob> {
    const url = buildApiUrl(this.config, endpoint);
    return this.http.get(url, {
      ...(options || {}),
      responseType: 'blob'
    } as { responseType: 'blob'; params?: any }).pipe(
      timeout(this.config.timeout),
      catchError(this.handleError)
    );
  }

  /**
   * Gestion centralisée des erreurs HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage: string;
    let errorResponse: ErrorResponseDTO | null = null;

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client (réseau, etc.)
      errorMessage = `Erreur réseau: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorResponse = error.error as ErrorResponseDTO;
      errorMessage = errorResponse?.message || `Erreur serveur: ${error.status}`;

      // Gestion des codes d'erreur spécifiques
      switch (error.status) {
        case 401:
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          break;
        case 403:
          errorMessage = 'Vous n\'avez pas les droits pour effectuer cette action.';
          break;
        case 404:
          errorMessage = 'Ressource non trouvée.';
          break;
        case 409:
          errorMessage = errorResponse?.message || 'Conflit: la ressource existe déjà.';
          break;
        case 500:
          errorMessage = 'Erreur interne du serveur. Veuillez réessayer plus tard.';
          break;
      }
    }

    console.error('HTTP Error:', {
      status: error.status,
      message: errorMessage,
      details: errorResponse
    });

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      details: errorResponse
    }));
  }
}

/**
 * Interface pour les erreurs HTTP traitées
 */
export interface HttpError {
  status: number;
  message: string;
  details: ErrorResponseDTO | null;
}
