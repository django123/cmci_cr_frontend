import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DiscipleRepository } from '../../domain/repositories';
import { Disciple } from '../../domain/models';
import { BaseHttpService } from '../http/base-http.service';
import { ApiEndpoints } from '../config/api.config';
import { DiscipleMapper } from '../../application/mappers';
import { DiscipleResponseDTO } from '../../application/dto/response';
import { AssignFDRequestDTO } from '../../application/dto/request';

/**
 * Implementation HTTP du repository Disciple
 * Adapter: connecte le domaine a l'infrastructure externe (API REST)
 */
@Injectable({
  providedIn: 'root'
})
export class DiscipleHttpRepository extends DiscipleRepository {
  private readonly http = inject(BaseHttpService);
  private readonly mapper = inject(DiscipleMapper);

  assignToFD(discipleId: string, fdId: string): Observable<Disciple> {
    const body: AssignFDRequestDTO = { fdId };
    console.log('[API] Assigning disciple', discipleId, 'to FD', fdId);
    return this.http
      .post<DiscipleResponseDTO>(ApiEndpoints.DISCIPLES.ASSIGN_FD(discipleId), body)
      .pipe(
        tap(dto => console.log('[API] Disciple assigned:', dto)),
        map(dto => this.mapper.toDiscipleDomain(dto))
      );
  }

  removeFromFD(discipleId: string): Observable<Disciple> {
    console.log('[API] Removing FD assignment from disciple', discipleId);
    return this.http
      .delete<DiscipleResponseDTO>(ApiEndpoints.DISCIPLES.REMOVE_FD(discipleId))
      .pipe(
        tap(dto => console.log('[API] FD assignment removed:', dto)),
        map(dto => this.mapper.toDiscipleDomain(dto))
      );
  }

  getByFD(fdId: string): Observable<Disciple[]> {
    console.log('[API] Getting disciples of FD', fdId);
    return this.http
      .get<DiscipleResponseDTO[]>(ApiEndpoints.DISCIPLES.BY_FD(fdId))
      .pipe(
        tap(dtos => console.log('[API] Disciples by FD response:', dtos?.length, 'items')),
        map(dtos => this.mapper.toDiscipleDomainList(dtos))
      );
  }

  getMyDisciples(): Observable<Disciple[]> {
    console.log('[API] Getting my disciples');
    return this.http
      .get<DiscipleResponseDTO[]>(ApiEndpoints.DISCIPLES.MY_DISCIPLES)
      .pipe(
        tap(dtos => console.log('[API] My disciples response:', dtos?.length, 'items')),
        map(dtos => this.mapper.toDiscipleDomainList(dtos))
      );
  }

  getUnassigned(): Observable<Disciple[]> {
    console.log('[API] Getting unassigned disciples');
    return this.http
      .get<DiscipleResponseDTO[]>(ApiEndpoints.DISCIPLES.UNASSIGNED)
      .pipe(
        tap(dtos => console.log('[API] Unassigned disciples response:', dtos?.length, 'items')),
        map(dtos => this.mapper.toDiscipleDomainList(dtos))
      );
  }

  countByFD(fdId: string): Observable<number> {
    console.log('[API] Counting disciples of FD', fdId);
    return this.http
      .get<number>(ApiEndpoints.DISCIPLES.COUNT_BY_FD(fdId))
      .pipe(
        tap(count => console.log('[API] Disciples count:', count))
      );
  }
}
