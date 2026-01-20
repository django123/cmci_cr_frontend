import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommentaireRepository, AddCommentaireRequest } from '../../domain/repositories';
import { Commentaire } from '../../domain/models';
import { BaseHttpService } from '../http/base-http.service';
import { ApiEndpoints } from '../config/api.config';
import { CommentaireMapper } from '../../application/mappers';
import { CommentaireResponseDTO } from '../../application/dto/response';

/**
 * Implémentation HTTP du repository Commentaire
 * Adapter: connecte le domaine à l'infrastructure externe (API REST)
 */
@Injectable({
  providedIn: 'root'
})
export class CommentaireHttpRepository extends CommentaireRepository {
  private readonly http = inject(BaseHttpService);
  private readonly mapper = inject(CommentaireMapper);

  getByCompteRenduId(compteRenduId: string): Observable<Commentaire[]> {
    return this.http
      .get<CommentaireResponseDTO[]>(ApiEndpoints.COMMENTAIRES.BY_CR(compteRenduId))
      .pipe(map(dtos => this.mapper.toDomainList(dtos)));
  }

  add(compteRenduId: string, request: AddCommentaireRequest): Observable<Commentaire> {
    return this.http
      .post<CommentaireResponseDTO>(ApiEndpoints.COMMENTAIRES.BY_CR(compteRenduId), request)
      .pipe(map(dto => this.mapper.toDomain(dto)));
  }
}
