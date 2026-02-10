import { Observable } from 'rxjs';
import { Role } from '../enums';
import { KeycloakUser, RoleStatistics } from '../models';

/**
 * Interface du repository pour l'administration des utilisateurs
 * Port (abstraction) suivant le principe d'inversion des dependances
 */
export abstract class UserAdminRepository {
  /**
   * Recupere tous les utilisateurs
   */
  abstract getAll(): Observable<KeycloakUser[]>;

  /**
   * Recupere un utilisateur par son ID
   */
  abstract getById(id: string): Observable<KeycloakUser>;

  /**
   * Recupere les utilisateurs par role
   */
  abstract getByRole(role: Role): Observable<KeycloakUser[]>;

  /**
   * Recherche des utilisateurs
   */
  abstract search(query: string): Observable<KeycloakUser[]>;

  /**
   * Assigne un role a un utilisateur
   */
  abstract assignRole(userId: string, role: Role): Observable<KeycloakUser>;

  /**
   * Recupere les statistiques des roles
   */
  abstract getStatistics(): Observable<RoleStatistics>;

  /**
   * Recupere les fideles en attente de promotion
   */
  abstract getPending(): Observable<KeycloakUser[]>;
}
