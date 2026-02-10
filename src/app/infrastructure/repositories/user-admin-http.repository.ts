import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { UserAdminRepository } from '../../domain/repositories';
import { KeycloakUser, RoleStatistics } from '../../domain/models';
import { Role } from '../../domain/enums';
import { BaseHttpService } from '../http/base-http.service';
import { ApiEndpoints } from '../config/api.config';
import { DiscipleMapper } from '../../application/mappers';
import { KeycloakUserResponseDTO, RoleStatisticsResponseDTO } from '../../application/dto/response';
import { AssignRoleRequestDTO } from '../../application/dto/request';

/**
 * Implementation HTTP du repository UserAdmin
 * Adapter: connecte le domaine a l'infrastructure externe (API REST)
 */
@Injectable({
  providedIn: 'root'
})
export class UserAdminHttpRepository extends UserAdminRepository {
  private readonly http = inject(BaseHttpService);
  private readonly mapper = inject(DiscipleMapper);

  getAll(): Observable<KeycloakUser[]> {
    console.log('[API] Getting all users');
    return this.http
      .get<KeycloakUserResponseDTO[]>(ApiEndpoints.ADMIN_USERS.BASE)
      .pipe(
        tap(dtos => console.log('[API] All users response:', dtos?.length, 'items')),
        map(dtos => this.mapper.toKeycloakUserDomainList(dtos))
      );
  }

  getById(id: string): Observable<KeycloakUser> {
    console.log('[API] Getting user by ID', id);
    return this.http
      .get<KeycloakUserResponseDTO>(ApiEndpoints.ADMIN_USERS.BY_ID(id))
      .pipe(
        tap(dto => console.log('[API] User response:', dto)),
        map(dto => this.mapper.toKeycloakUserDomain(dto))
      );
  }

  getByRole(role: Role): Observable<KeycloakUser[]> {
    console.log('[API] Getting users by role', role);
    return this.http
      .get<KeycloakUserResponseDTO[]>(ApiEndpoints.ADMIN_USERS.BY_ROLE(role))
      .pipe(
        tap(dtos => console.log('[API] Users by role response:', dtos?.length, 'items')),
        map(dtos => this.mapper.toKeycloakUserDomainList(dtos))
      );
  }

  search(query: string): Observable<KeycloakUser[]> {
    const params = new HttpParams().set('q', query);
    console.log('[API] Searching users with query', query);
    return this.http
      .get<KeycloakUserResponseDTO[]>(ApiEndpoints.ADMIN_USERS.SEARCH, { params })
      .pipe(
        tap(dtos => console.log('[API] Search response:', dtos?.length, 'items')),
        map(dtos => this.mapper.toKeycloakUserDomainList(dtos))
      );
  }

  assignRole(userId: string, role: Role): Observable<KeycloakUser> {
    const body: AssignRoleRequestDTO = { role };
    console.log('[API] Assigning role', role, 'to user', userId);
    return this.http
      .put<KeycloakUserResponseDTO>(ApiEndpoints.ADMIN_USERS.ASSIGN_ROLE(userId), body)
      .pipe(
        tap(dto => console.log('[API] Role assigned:', dto)),
        map(dto => this.mapper.toKeycloakUserDomain(dto))
      );
  }

  getStatistics(): Observable<RoleStatistics> {
    console.log('[API] Getting role statistics');
    return this.http
      .get<RoleStatisticsResponseDTO>(ApiEndpoints.ADMIN_USERS.STATISTICS)
      .pipe(
        tap(dto => console.log('[API] Statistics response:', dto)),
        map(dto => this.mapper.toRoleStatisticsDomain(dto))
      );
  }

  getPending(): Observable<KeycloakUser[]> {
    console.log('[API] Getting pending users');
    return this.http
      .get<KeycloakUserResponseDTO[]>(ApiEndpoints.ADMIN_USERS.PENDING)
      .pipe(
        tap(dtos => console.log('[API] Pending users response:', dtos?.length, 'items')),
        map(dtos => this.mapper.toKeycloakUserDomainList(dtos))
      );
  }
}
