import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import {
  CompteRenduRepository,
  CreateCompteRenduRequest,
  UpdateCompteRenduRequest
} from '../../domain/repositories';
import { CompteRendu } from '../../domain/models';
import { BaseHttpService } from '../http/base-http.service';
import { ApiEndpoints } from '../config/api.config';
import { CompteRenduMapper } from '../../application/mappers';
import { CompteRenduResponseDTO } from '../../application/dto/response';

/**
 * Implémentation HTTP du repository CompteRendu
 * Adapter: connecte le domaine à l'infrastructure externe (API REST)
 */
@Injectable({
  providedIn: 'root'
})
export class CompteRenduHttpRepository extends CompteRenduRepository {
  private readonly http = inject(BaseHttpService);
  private readonly mapper = inject(CompteRenduMapper);

  getById(id: string): Observable<CompteRendu> {
    return this.http.get<CompteRenduResponseDTO>(ApiEndpoints.CR.BY_ID(id)).pipe(
      map(dto => this.mapper.toDomain(dto))
    );
  }

  getByUserId(utilisateurId: string): Observable<CompteRendu[]> {
    return this.http.get<CompteRenduResponseDTO[]>(ApiEndpoints.CR.BY_USER(utilisateurId)).pipe(
      map(dtos => this.mapper.toDomainList(dtos))
    );
  }

  getByUserIdAndPeriod(
    utilisateurId: string,
    startDate: Date,
    endDate: Date
  ): Observable<CompteRendu[]> {
    const params = new HttpParams()
      .set('startDate', this.formatDate(startDate))
      .set('endDate', this.formatDate(endDate));

    return this.http
      .get<CompteRenduResponseDTO[]>(ApiEndpoints.CR.BY_USER_PERIOD(utilisateurId), { params })
      .pipe(map(dtos => this.mapper.toDomainList(dtos)));
  }

  create(request: CreateCompteRenduRequest): Observable<CompteRendu> {
    const dto = this.mapper.toCreateDTO(request);
    return this.http.post<CompteRenduResponseDTO>(ApiEndpoints.CR.BASE, dto).pipe(
      map(response => this.mapper.toDomain(response))
    );
  }

  update(id: string, request: UpdateCompteRenduRequest): Observable<CompteRendu> {
    const dto = this.mapper.toUpdateDTO(request);
    return this.http.put<CompteRenduResponseDTO>(ApiEndpoints.CR.BY_ID(id), dto).pipe(
      map(response => this.mapper.toDomain(response))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(ApiEndpoints.CR.BY_ID(id));
  }

  submit(id: string): Observable<CompteRendu> {
    return this.http.post<CompteRenduResponseDTO>(ApiEndpoints.CR.SUBMIT(id), {}).pipe(
      map(response => this.mapper.toDomain(response))
    );
  }

  validate(id: string): Observable<CompteRendu> {
    return this.http.post<CompteRenduResponseDTO>(ApiEndpoints.CR.VALIDATE(id), {}).pipe(
      map(response => this.mapper.toDomain(response))
    );
  }

  markAsViewed(id: string): Observable<CompteRendu> {
    return this.http.post<CompteRenduResponseDTO>(ApiEndpoints.CR.MARK_VIEWED(id), {}).pipe(
      map(response => this.mapper.toDomain(response))
    );
  }

  /**
   * Formate une date au format YYYY-MM-DD pour l'API
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
