import { Observable } from 'rxjs';
import { Commentaire } from '../models';

/**
 * Interface du repository pour les Commentaires
 * Port (abstraction) suivant le principe d'inversion des dépendances
 */
export abstract class CommentaireRepository {
  /**
   * Récupère tous les commentaires d'un compte rendu
   */
  abstract getByCompteRenduId(compteRenduId: string): Observable<Commentaire[]>;

  /**
   * Ajoute un commentaire à un compte rendu
   */
  abstract add(compteRenduId: string, request: AddCommentaireRequest): Observable<Commentaire>;
}

/**
 * Request pour ajouter un commentaire
 */
export interface AddCommentaireRequest {
  contenu: string;
}
