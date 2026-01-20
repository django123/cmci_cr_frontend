import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { StatisticsRepository } from '../../domain/repositories';
import { Statistics } from '../../domain/models';
import { BaseHttpService } from '../http/base-http.service';
import { ApiEndpoints } from '../config/api.config';
import { StatisticsMapper } from '../../application/mappers';
import { StatisticsResponseDTO } from '../../application/dto/response';

/**
 * Implémentation HTTP du repository Statistics
 * Adapter: connecte le domaine à l'infrastructure externe (API REST)
 */
@Injectable({
  providedIn: 'root'
})
export class StatisticsHttpRepository extends StatisticsRepository {
  private readonly http = inject(BaseHttpService);
  private readonly mapper = inject(StatisticsMapper);

  getPersonalStatistics(startDate: Date, endDate: Date): Observable<Statistics> {
    const params = new HttpParams()
      .set('startDate', this.formatDate(startDate))
      .set('endDate', this.formatDate(endDate));

    return this.http
      .get<StatisticsResponseDTO>(ApiEndpoints.STATISTICS.PERSONAL, { params })
      .pipe(map(dto => this.mapper.toDomain(dto)));
  }

  getUserStatistics(
    utilisateurId: string,
    startDate: Date,
    endDate: Date
  ): Observable<Statistics> {
    const params = new HttpParams()
      .set('startDate', this.formatDate(startDate))
      .set('endDate', this.formatDate(endDate));

    return this.http
      .get<StatisticsResponseDTO>(ApiEndpoints.STATISTICS.BY_USER(utilisateurId), { params })
      .pipe(map(dto => this.mapper.toDomain(dto)));
  }

  /**
   * Formate une date au format YYYY-MM-DD pour l'API
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
