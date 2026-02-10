import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ZoneRepository } from '../../domain/repositories';
import { Zone } from '../../domain/models';
import { BaseHttpService } from '../http/base-http.service';
import { ApiEndpoints } from '../config/api.config';
import { GeographyMapper } from '../../application/mappers';
import { ZoneResponseDTO } from '../../application/dto/response';
import { CreateZoneRequestDTO, UpdateZoneRequestDTO } from '../../application/dto/request';

/**
 * Implementation HTTP du repository Zone
 */
@Injectable({
  providedIn: 'root'
})
export class ZoneHttpRepository extends ZoneRepository {
  private readonly http = inject(BaseHttpService);
  private readonly mapper = inject(GeographyMapper);

  getAll(): Observable<Zone[]> {
    console.log('[API] Getting all zones');
    return this.http
      .get<ZoneResponseDTO[]>(ApiEndpoints.ZONES.BASE)
      .pipe(
        tap(dtos => console.log('[API] Zones response:', dtos?.length, 'items')),
        map(dtos => this.mapper.toZoneDomainList(dtos))
      );
  }

  getById(id: string): Observable<Zone> {
    console.log('[API] Getting zone by ID', id);
    return this.http
      .get<ZoneResponseDTO>(ApiEndpoints.ZONES.BY_ID(id))
      .pipe(
        tap(dto => console.log('[API] Zone response:', dto)),
        map(dto => this.mapper.toZoneDomain(dto))
      );
  }

  getByRegionId(regionId: string): Observable<Zone[]> {
    const params = new HttpParams().set('regionId', regionId);
    console.log('[API] Getting zones by region', regionId);
    return this.http
      .get<ZoneResponseDTO[]>(ApiEndpoints.ZONES.BASE, { params })
      .pipe(
        tap(dtos => console.log('[API] Zones by region response:', dtos?.length, 'items')),
        map(dtos => this.mapper.toZoneDomainList(dtos))
      );
  }

  create(request: CreateZoneRequestDTO): Observable<Zone> {
    console.log('[API] Creating zone:', request.nom);
    return this.http
      .post<ZoneResponseDTO>(ApiEndpoints.ZONES.BASE, request)
      .pipe(
        tap(dto => console.log('[API] Zone created:', dto)),
        map(dto => this.mapper.toZoneDomain(dto))
      );
  }

  update(id: string, request: UpdateZoneRequestDTO): Observable<Zone> {
    console.log('[API] Updating zone:', id);
    return this.http
      .put<ZoneResponseDTO>(ApiEndpoints.ZONES.BY_ID(id), request)
      .pipe(
        tap(dto => console.log('[API] Zone updated:', dto)),
        map(dto => this.mapper.toZoneDomain(dto))
      );
  }

  delete(id: string): Observable<void> {
    console.log('[API] Deleting zone:', id);
    return this.http.delete<void>(ApiEndpoints.ZONES.BY_ID(id));
  }
}
