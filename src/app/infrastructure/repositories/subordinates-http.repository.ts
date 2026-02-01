import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { SubordinatesRepository } from '../../domain/repositories';
import {
  SubordinateWithCRs,
  SubordinateStatistics,
  DiscipleWithCRStatus
} from '../../domain/models';
import { BaseHttpService } from '../http/base-http.service';
import { ApiEndpoints } from '../config/api.config';
import { SubordinatesMapper } from '../../application/mappers';
import {
  SubordinateWithCRsResponseDTO,
  SubordinateStatisticsResponseDTO,
  DiscipleWithCRStatusResponseDTO
} from '../../application/dto/response';

/**
 * Implémentation HTTP du repository Subordinates
 * Adapter: connecte le domaine à l'infrastructure externe (API REST)
 */
@Injectable({
  providedIn: 'root'
})
export class SubordinatesHttpRepository extends SubordinatesRepository {
  private readonly http = inject(BaseHttpService);
  private readonly mapper = inject(SubordinatesMapper);

  getSubordinatesCR(startDate: Date, endDate: Date): Observable<SubordinateWithCRs[]> {
    const params = new HttpParams()
      .set('startDate', this.formatDate(startDate))
      .set('endDate', this.formatDate(endDate));

    console.log('[API] Getting subordinates CRs from', startDate, 'to', endDate);
    return this.http
      .get<SubordinateWithCRsResponseDTO[]>(ApiEndpoints.SUBORDINATES.CR, { params })
      .pipe(
        tap(dtos => console.log('[API] Subordinates CRs Response:', dtos?.length, 'items')),
        map(dtos => this.mapper.toSubordinateWithCRsDomainList(dtos))
      );
  }

  getSubordinatesCRSummary(startDate: Date, endDate: Date): Observable<SubordinateWithCRs[]> {
    const params = new HttpParams()
      .set('startDate', this.formatDate(startDate))
      .set('endDate', this.formatDate(endDate));

    console.log('[API] Getting subordinates CR summary from', startDate, 'to', endDate);
    return this.http
      .get<SubordinateWithCRsResponseDTO[]>(ApiEndpoints.SUBORDINATES.SUMMARY, { params })
      .pipe(
        tap(dtos => console.log('[API] Subordinates Summary Response:', dtos?.length, 'items')),
        map(dtos => this.mapper.toSubordinateWithCRsDomainList(dtos))
      );
  }

  getSubordinatesStatistics(startDate: Date, endDate: Date): Observable<SubordinateStatistics[]> {
    const params = new HttpParams()
      .set('startDate', this.formatDate(startDate))
      .set('endDate', this.formatDate(endDate));

    console.log('[API] Getting subordinates statistics from', startDate, 'to', endDate);
    return this.http
      .get<SubordinateStatisticsResponseDTO[]>(ApiEndpoints.SUBORDINATES.STATISTICS, { params })
      .pipe(
        tap(dtos => console.log('[API] Subordinates Statistics Response:', dtos?.length, 'items')),
        map(dtos => this.mapper.toStatisticsDomainList(dtos))
      );
  }

  getDisciplesStatus(): Observable<DiscipleWithCRStatus[]> {
    console.log('[API] Getting disciples status');
    return this.http
      .get<DiscipleWithCRStatusResponseDTO[]>(ApiEndpoints.SUBORDINATES.DISCIPLES)
      .pipe(
        tap(dtos => console.log('[API] Disciples Status Response:', dtos?.length, 'items')),
        map(dtos => this.mapper.toDiscipleStatusDomainList(dtos))
      );
  }

  /**
   * Formate une date au format YYYY-MM-DD pour l'API
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
