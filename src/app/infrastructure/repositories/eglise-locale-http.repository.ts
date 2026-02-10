import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { EgliseLocaleRepository } from '../../domain/repositories';
import { EgliseLocale } from '../../domain/models';
import { BaseHttpService } from '../http/base-http.service';
import { ApiEndpoints } from '../config/api.config';
import { GeographyMapper } from '../../application/mappers';
import { EgliseLocaleResponseDTO } from '../../application/dto/response';
import { CreateEgliseLocaleRequestDTO, UpdateEgliseLocaleRequestDTO } from '../../application/dto/request';

/**
 * Implementation HTTP du repository EgliseLocale
 */
@Injectable({
  providedIn: 'root'
})
export class EgliseLocaleHttpRepository extends EgliseLocaleRepository {
  private readonly http = inject(BaseHttpService);
  private readonly mapper = inject(GeographyMapper);

  getAll(): Observable<EgliseLocale[]> {
    console.log('[API] Getting all eglises locales');
    return this.http
      .get<EgliseLocaleResponseDTO[]>(ApiEndpoints.EGLISES_LOCALES.BASE)
      .pipe(
        tap(dtos => console.log('[API] Eglises locales response:', dtos?.length, 'items')),
        map(dtos => this.mapper.toEgliseLocaleDomainList(dtos))
      );
  }

  getById(id: string): Observable<EgliseLocale> {
    console.log('[API] Getting eglise locale by ID', id);
    return this.http
      .get<EgliseLocaleResponseDTO>(ApiEndpoints.EGLISES_LOCALES.BY_ID(id))
      .pipe(
        tap(dto => console.log('[API] Eglise locale response:', dto)),
        map(dto => this.mapper.toEgliseLocaleDomain(dto))
      );
  }

  getByZoneId(zoneId: string): Observable<EgliseLocale[]> {
    const params = new HttpParams().set('zoneId', zoneId);
    console.log('[API] Getting eglises locales by zone', zoneId);
    return this.http
      .get<EgliseLocaleResponseDTO[]>(ApiEndpoints.EGLISES_LOCALES.BASE, { params })
      .pipe(
        tap(dtos => console.log('[API] Eglises locales by zone response:', dtos?.length, 'items')),
        map(dtos => this.mapper.toEgliseLocaleDomainList(dtos))
      );
  }

  create(request: CreateEgliseLocaleRequestDTO): Observable<EgliseLocale> {
    console.log('[API] Creating eglise locale:', request.nom);
    return this.http
      .post<EgliseLocaleResponseDTO>(ApiEndpoints.EGLISES_LOCALES.BASE, request)
      .pipe(
        tap(dto => console.log('[API] Eglise locale created:', dto)),
        map(dto => this.mapper.toEgliseLocaleDomain(dto))
      );
  }

  update(id: string, request: UpdateEgliseLocaleRequestDTO): Observable<EgliseLocale> {
    console.log('[API] Updating eglise locale:', id);
    return this.http
      .put<EgliseLocaleResponseDTO>(ApiEndpoints.EGLISES_LOCALES.BY_ID(id), request)
      .pipe(
        tap(dto => console.log('[API] Eglise locale updated:', dto)),
        map(dto => this.mapper.toEgliseLocaleDomain(dto))
      );
  }

  delete(id: string): Observable<void> {
    console.log('[API] Deleting eglise locale:', id);
    return this.http.delete<void>(ApiEndpoints.EGLISES_LOCALES.BY_ID(id));
  }
}
