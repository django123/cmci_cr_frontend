import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { EgliseMaisonRepository } from '../../domain/repositories';
import { EgliseMaison } from '../../domain/models';
import { BaseHttpService } from '../http/base-http.service';
import { ApiEndpoints } from '../config/api.config';
import { GeographyMapper } from '../../application/mappers';
import { EgliseMaisonResponseDTO } from '../../application/dto/response';
import { CreateEgliseMaisonRequestDTO, UpdateEgliseMaisonRequestDTO } from '../../application/dto/request';

/**
 * Implementation HTTP du repository EgliseMaison
 */
@Injectable({
  providedIn: 'root'
})
export class EgliseMaisonHttpRepository extends EgliseMaisonRepository {
  private readonly http = inject(BaseHttpService);
  private readonly mapper = inject(GeographyMapper);

  getAll(): Observable<EgliseMaison[]> {
    console.log('[API] Getting all eglises de maison');
    return this.http
      .get<EgliseMaisonResponseDTO[]>(ApiEndpoints.EGLISES_MAISON.BASE)
      .pipe(
        tap(dtos => console.log('[API] Eglises de maison response:', dtos?.length, 'items')),
        map(dtos => this.mapper.toEgliseMaisonDomainList(dtos))
      );
  }

  getById(id: string): Observable<EgliseMaison> {
    console.log('[API] Getting eglise de maison by ID', id);
    return this.http
      .get<EgliseMaisonResponseDTO>(ApiEndpoints.EGLISES_MAISON.BY_ID(id))
      .pipe(
        tap(dto => console.log('[API] Eglise de maison response:', dto)),
        map(dto => this.mapper.toEgliseMaisonDomain(dto))
      );
  }

  getByEgliseLocaleId(egliseLocaleId: string): Observable<EgliseMaison[]> {
    const params = new HttpParams().set('egliseLocaleId', egliseLocaleId);
    console.log('[API] Getting eglises de maison by eglise locale', egliseLocaleId);
    return this.http
      .get<EgliseMaisonResponseDTO[]>(ApiEndpoints.EGLISES_MAISON.BASE, { params })
      .pipe(
        tap(dtos => console.log('[API] Eglises de maison by eglise locale response:', dtos?.length, 'items')),
        map(dtos => this.mapper.toEgliseMaisonDomainList(dtos))
      );
  }

  create(request: CreateEgliseMaisonRequestDTO): Observable<EgliseMaison> {
    console.log('[API] Creating eglise de maison:', request.nom);
    return this.http
      .post<EgliseMaisonResponseDTO>(ApiEndpoints.EGLISES_MAISON.BASE, request)
      .pipe(
        tap(dto => console.log('[API] Eglise de maison created:', dto)),
        map(dto => this.mapper.toEgliseMaisonDomain(dto))
      );
  }

  update(id: string, request: UpdateEgliseMaisonRequestDTO): Observable<EgliseMaison> {
    console.log('[API] Updating eglise de maison:', id);
    return this.http
      .put<EgliseMaisonResponseDTO>(ApiEndpoints.EGLISES_MAISON.BY_ID(id), request)
      .pipe(
        tap(dto => console.log('[API] Eglise de maison updated:', dto)),
        map(dto => this.mapper.toEgliseMaisonDomain(dto))
      );
  }

  delete(id: string): Observable<void> {
    console.log('[API] Deleting eglise de maison:', id);
    return this.http.delete<void>(ApiEndpoints.EGLISES_MAISON.BY_ID(id));
  }
}
