import { Observable } from 'rxjs';
import { CompteRendu } from '../models';

/**
 * Interface du repository pour les Comptes Rendus
 * Port (abstraction) suivant le principe d'inversion des dépendances
 */
export abstract class CompteRenduRepository {
  /**
   * Récupère un compte rendu par son ID
   */
  abstract getById(id: string): Observable<CompteRendu>;

  /**
   * Récupère tous les comptes rendus d'un utilisateur
   */
  abstract getByUserId(utilisateurId: string): Observable<CompteRendu[]>;

  /**
   * Récupère les comptes rendus d'un utilisateur pour une période
   */
  abstract getByUserIdAndPeriod(
    utilisateurId: string,
    startDate: Date,
    endDate: Date
  ): Observable<CompteRendu[]>;

  /**
   * Crée un nouveau compte rendu
   */
  abstract create(request: CreateCompteRenduRequest): Observable<CompteRendu>;

  /**
   * Met à jour un compte rendu existant
   */
  abstract update(id: string, request: UpdateCompteRenduRequest): Observable<CompteRendu>;

  /**
   * Supprime un compte rendu
   */
  abstract delete(id: string): Observable<void>;

  /**
   * Soumet un compte rendu pour validation
   */
  abstract submit(id: string): Observable<CompteRendu>;

  /**
   * Valide un compte rendu
   */
  abstract validate(id: string): Observable<CompteRendu>;

  /**
   * Marque un compte rendu comme vu par le FD
   */
  abstract markAsViewed(id: string): Observable<CompteRendu>;
}

/**
 * Request pour créer un compte rendu
 */
export interface CreateCompteRenduRequest {
  date: string;
  rdqd: string;
  priereSeuleMinutes: number;
  priereCoupleMinutes?: number;
  priereAvecEnfantsMinutes?: number;
  lectureBiblique?: number;
  livreBiblique?: string;
  litteraturePages?: number;
  litteratureTotal?: number;
  litteratureTitre?: string;
  priereAutres?: number;
  confession?: boolean;
  jeune?: boolean;
  typeJeune?: string;
  evangelisation?: number;
  offrande?: boolean;
  notes?: string;
}

/**
 * Request pour mettre à jour un compte rendu
 */
export interface UpdateCompteRenduRequest {
  rdqd?: string;
  priereSeuleMinutes?: number;
  priereCoupleMinutes?: number;
  priereAvecEnfantsMinutes?: number;
  lectureBiblique?: number;
  livreBiblique?: string;
  litteraturePages?: number;
  litteratureTotal?: number;
  litteratureTitre?: string;
  priereAutres?: number;
  confession?: boolean;
  jeune?: boolean;
  typeJeune?: string;
  evangelisation?: number;
  offrande?: boolean;
  notes?: string;
}
