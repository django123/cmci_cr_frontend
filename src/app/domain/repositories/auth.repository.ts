import { Observable } from 'rxjs';
import { Utilisateur } from '../models';

/**
 * Interface du repository pour l'Authentification
 * Port (abstraction) suivant le principe d'inversion des dépendances
 */
export abstract class AuthRepository {
  /**
   * Récupère l'utilisateur actuellement connecté
   */
  abstract getCurrentUser(): Observable<Utilisateur>;

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  abstract isAuthenticated(): Observable<boolean>;

  /**
   * Récupère le token JWT
   */
  abstract getToken(): Observable<string | null>;

  /**
   * Initialise le processus de connexion
   */
  abstract login(): void;

  /**
   * Déconnecte l'utilisateur
   */
  abstract logout(): void;

  /**
   * Rafraîchit le token
   */
  abstract refreshToken(): Observable<string>;
}
