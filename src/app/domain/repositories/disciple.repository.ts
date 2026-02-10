import { Observable } from 'rxjs';
import { Disciple } from '../models';

/**
 * Interface du repository pour la gestion des Disciples
 * Port (abstraction) suivant le principe d'inversion des dependances
 */
export abstract class DiscipleRepository {
  /**
   * Assigne un disciple a un FD
   */
  abstract assignToFD(discipleId: string, fdId: string): Observable<Disciple>;

  /**
   * Retire l'assignation d'un disciple a son FD
   */
  abstract removeFromFD(discipleId: string): Observable<Disciple>;

  /**
   * Recupere les disciples d'un FD specifique
   */
  abstract getByFD(fdId: string): Observable<Disciple[]>;

  /**
   * Recupere les disciples de l'utilisateur connecte
   */
  abstract getMyDisciples(): Observable<Disciple[]>;

  /**
   * Recupere les disciples sans FD assigne
   */
  abstract getUnassigned(): Observable<Disciple[]>;

  /**
   * Compte les disciples d'un FD
   */
  abstract countByFD(fdId: string): Observable<number>;
}
