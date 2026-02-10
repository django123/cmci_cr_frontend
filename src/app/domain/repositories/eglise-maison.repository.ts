import { Observable } from 'rxjs';
import { EgliseMaison } from '../models';

/**
 * Interface du repository pour la gestion des Eglises de Maison
 * Port (abstraction) suivant le principe d'inversion des dependances
 */
export abstract class EgliseMaisonRepository {
  abstract getAll(): Observable<EgliseMaison[]>;
  abstract getById(id: string): Observable<EgliseMaison>;
  abstract getByEgliseLocaleId(egliseLocaleId: string): Observable<EgliseMaison[]>;
  abstract create(request: { nom: string; egliseLocaleId: string; leaderId?: string; adresse?: string }): Observable<EgliseMaison>;
  abstract update(id: string, request: { nom?: string; egliseLocaleId?: string; leaderId?: string; adresse?: string }): Observable<EgliseMaison>;
  abstract delete(id: string): Observable<void>;
}
