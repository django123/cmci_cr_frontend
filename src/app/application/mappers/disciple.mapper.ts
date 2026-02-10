import { Injectable } from '@angular/core';
import {
  DiscipleResponseDTO,
  RoleStatisticsResponseDTO,
  KeycloakUserResponseDTO
} from '../dto/response';
import { Disciple, RoleStatistics, KeycloakUser } from '../../domain/models';
import { Role, StatutUtilisateur } from '../../domain/enums';

/**
 * Mapper pour les Disciples et l'administration utilisateurs
 * Transforme les DTOs API en modeles domain
 */
@Injectable({
  providedIn: 'root'
})
export class DiscipleMapper {

  /**
   * Convertit un DTO Disciple en modele domain
   */
  toDiscipleDomain(dto: DiscipleResponseDTO): Disciple {
    return {
      id: dto.id,
      email: dto.email,
      nom: dto.nom,
      prenom: dto.prenom,
      nomComplet: dto.nomComplet,
      role: dto.role as Role,
      egliseMaisonId: dto.egliseMaisonId,
      fdId: dto.fdId,
      fdNom: dto.fdNom,
      avatarUrl: dto.avatarUrl,
      telephone: dto.telephone,
      dateNaissance: dto.dateNaissance ? new Date(dto.dateNaissance) : undefined,
      dateBapteme: dto.dateBapteme ? new Date(dto.dateBapteme) : undefined,
      statut: (dto.statut as StatutUtilisateur) || StatutUtilisateur.ACTIF,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt)
    };
  }

  /**
   * Convertit une liste de DTO Disciple en modeles domain
   */
  toDiscipleDomainList(dtos: DiscipleResponseDTO[]): Disciple[] {
    return dtos?.map(dto => this.toDiscipleDomain(dto)) || [];
  }

  /**
   * Convertit un DTO RoleStatistics en modele domain
   */
  toRoleStatisticsDomain(dto: RoleStatisticsResponseDTO): RoleStatistics {
    return {
      totalUsers: dto.totalUsers,
      roleDistribution: dto.roleDistribution
    };
  }

  /**
   * Convertit un DTO KeycloakUser en modele domain
   */
  toKeycloakUserDomain(dto: KeycloakUserResponseDTO): KeycloakUser {
    return {
      id: dto.id,
      keycloakId: dto.keycloakId,
      email: dto.email,
      nom: dto.nom,
      prenom: dto.prenom,
      nomComplet: dto.nomComplet,
      role: dto.role as Role,
      statut: dto.statut as StatutUtilisateur,
      createdAt: new Date(dto.createdAt)
    };
  }

  /**
   * Convertit une liste de DTO KeycloakUser en modeles domain
   */
  toKeycloakUserDomainList(dtos: KeycloakUserResponseDTO[]): KeycloakUser[] {
    return dtos?.map(dto => this.toKeycloakUserDomain(dto)) || [];
  }
}
