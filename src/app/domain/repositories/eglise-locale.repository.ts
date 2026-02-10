import { Observable } from 'rxjs';
import { EgliseLocale } from '../models';

/**
 * Interface du repository pour la gestion des Eglises Locales
 * Port (abstraction) suivant le principe d'inversion des dependances
 */
export abstract class EgliseLocaleRepository {
  abstract getAll(): Observable<EgliseLocale[]>;
  abstract getById(id: string): Observable<EgliseLocale>;
  abstract getByZoneId(zoneId: string): Observable<EgliseLocale[]>;
  abstract create(request: { nom: string; zoneId: string; adresse?: string; pasteurId?: string }): Observable<EgliseLocale>;
  abstract update(id: string, request: { nom?: string; zoneId?: string; adresse?: string; pasteurId?: string }): Observable<EgliseLocale>;
  abstract delete(id: string): Observable<void>;
}
