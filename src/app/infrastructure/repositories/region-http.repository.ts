import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { RegionRepository } from '../../domain/repositories';
import { Region, SeedResult } from '../../domain/models';
import { BaseHttpService } from '../http/base-http.service';
import { ApiEndpoints } from '../config/api.config';
import { GeographyMapper } from '../../application/mappers';
import { RegionResponseDTO, SeedResultDTO } from '../../application/dto/response';
import { CreateRegionRequestDTO, UpdateRegionRequestDTO } from '../../application/dto/request';

/**
 * Implementation HTTP du repository Region
 */
@Injectable({
  providedIn: 'root'
})
export class RegionHttpRepository extends RegionRepository {
  private readonly http = inject(BaseHttpService);
  private readonly mapper = inject(GeographyMapper);

  getAll(): Observable<Region[]> {
    console.log('[API] Getting all regions');
    return this.http
      .get<RegionResponseDTO[]>(ApiEndpoints.REGIONS.BASE)
      .pipe(
        tap(dtos => console.log('[API] Regions response:', dtos?.length, 'items')),
        map(dtos => this.mapper.toRegionDomainList(dtos))
      );
  }

  getById(id: string): Observable<Region> {
    console.log('[API] Getting region by ID', id);
    return this.http
      .get<RegionResponseDTO>(ApiEndpoints.REGIONS.BY_ID(id))
      .pipe(
        tap(dto => console.log('[API] Region response:', dto)),
        map(dto => this.mapper.toRegionDomain(dto))
      );
  }

  create(request: CreateRegionRequestDTO): Observable<Region> {
    console.log('[API] Creating region:', request.nom);
    return this.http
      .post<RegionResponseDTO>(ApiEndpoints.REGIONS.BASE, request)
      .pipe(
        tap(dto => console.log('[API] Region created:', dto)),
        map(dto => this.mapper.toRegionDomain(dto))
      );
  }

  update(id: string, request: UpdateRegionRequestDTO): Observable<Region> {
    console.log('[API] Updating region:', id);
    return this.http
      .put<RegionResponseDTO>(ApiEndpoints.REGIONS.BY_ID(id), request)
      .pipe(
        tap(dto => console.log('[API] Region updated:', dto)),
        map(dto => this.mapper.toRegionDomain(dto))
      );
  }

  delete(id: string): Observable<void> {
    console.log('[API] Deleting region:', id);
    return this.http.delete<void>(ApiEndpoints.REGIONS.BY_ID(id));
  }

  seedGeography(): Observable<SeedResult> {
    console.log('[API] Seeding geography');
    return this.http
      .post<SeedResultDTO>(ApiEndpoints.GEOGRAPHY.SEED, {})
      .pipe(
        tap(dto => console.log('[API] Seed result:', dto)),
        map(dto => this.mapper.toSeedResultDomain(dto))
      );
  }
}
