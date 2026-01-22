import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
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
    console.log('[API] Getting CR by ID:', id);
    return this.http.get<CompteRenduResponseDTO>(ApiEndpoints.CR.BY_ID(id)).pipe(
      tap(dto => console.log('[API] CR Response:', dto)),
      map(dto => this.mapper.toDomain(dto))
    );
  }

  getByUserId(utilisateurId: string): Observable<CompteRendu[]> {
    console.log('[API] Getting CRs for user:', utilisateurId);
    return this.http.get<CompteRenduResponseDTO[]>(ApiEndpoints.CR.BY_USER(utilisateurId)).pipe(
      tap(dtos => console.log('[API] CRs Response:', dtos?.length, 'items', dtos)),
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

    console.log('[API] Getting CRs for user by period:', utilisateurId, startDate, endDate);
    return this.http
      .get<CompteRenduResponseDTO[]>(ApiEndpoints.CR.BY_USER_PERIOD(utilisateurId), { params })
      .pipe(
        tap(dtos => console.log('[API] CRs by period Response:', dtos?.length, 'items')),
        map(dtos => this.mapper.toDomainList(dtos))
      );
  }

  create(request: CreateCompteRenduRequest): Observable<CompteRendu> {
    const dto = this.mapper.toCreateDTO(request);
    console.log('[API] Creating CR:', dto);
    return this.http.post<CompteRenduResponseDTO>(ApiEndpoints.CR.BASE, dto).pipe(
      tap(response => console.log('[API] Create Response:', response)),
      map(response => this.mapper.toDomain(response))
    );
  }

  update(id: string, request: UpdateCompteRenduRequest): Observable<CompteRendu> {
    const dto = this.mapper.toUpdateDTO(request);
    console.log('[API] Updating CR:', id, dto);
    return this.http.put<CompteRenduResponseDTO>(ApiEndpoints.CR.BY_ID(id), dto).pipe(
      tap(response => console.log('[API] Update Response:', response)),
      map(response => this.mapper.toDomain(response))
    );
  }

  delete(id: string): Observable<void> {
    console.log('[API] Deleting CR:', id);
    return this.http.delete<void>(ApiEndpoints.CR.BY_ID(id)).pipe(
      tap(() => console.log('[API] Delete successful'))
    );
  }

  submit(id: string): Observable<CompteRendu> {
    console.log('[API] Submitting CR:', id);
    return this.http.post<CompteRenduResponseDTO>(ApiEndpoints.CR.SUBMIT(id), {}).pipe(
      tap(response => console.log('[API] Submit Response:', response)),
      map(response => this.mapper.toDomain(response))
    );
  }

  validate(id: string): Observable<CompteRendu> {
    console.log('[API] Validating CR:', id);
    return this.http.post<CompteRenduResponseDTO>(ApiEndpoints.CR.VALIDATE(id), {}).pipe(
      tap(response => console.log('[API] Validate Response:', response)),
      map(response => this.mapper.toDomain(response))
    );
  }

  markAsViewed(id: string): Observable<CompteRendu> {
    console.log('[API] Marking CR as viewed:', id);
    return this.http.post<CompteRenduResponseDTO>(ApiEndpoints.CR.MARK_VIEWED(id), {}).pipe(
      tap(response => console.log('[API] MarkAsViewed Response:', response)),
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
