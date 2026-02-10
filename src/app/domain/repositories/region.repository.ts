import { Observable } from 'rxjs';
import { Region } from '../models';

/**
 * Interface du repository pour la gestion des Regions
 * Port (abstraction) suivant le principe d'inversion des dependances
 */
export abstract class RegionRepository {
  abstract getAll(): Observable<Region[]>;
  abstract getById(id: string): Observable<Region>;
  abstract create(request: { nom: string; code: string }): Observable<Region>;
  abstract update(id: string, request: { nom?: string; code?: string }): Observable<Region>;
  abstract delete(id: string): Observable<void>;
}
