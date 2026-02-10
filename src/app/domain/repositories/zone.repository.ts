import { Observable } from 'rxjs';
import { Zone } from '../models';

/**
 * Interface du repository pour la gestion des Zones
 * Port (abstraction) suivant le principe d'inversion des dependances
 */
export abstract class ZoneRepository {
  abstract getAll(): Observable<Zone[]>;
  abstract getById(id: string): Observable<Zone>;
  abstract getByRegionId(regionId: string): Observable<Zone[]>;
  abstract create(request: { nom: string; regionId: string }): Observable<Zone>;
  abstract update(id: string, request: { nom?: string; regionId?: string }): Observable<Zone>;
  abstract delete(id: string): Observable<void>;
}
