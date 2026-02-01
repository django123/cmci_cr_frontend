import { Injectable } from '@angular/core';
import {
  SubordinateCRResponseDTO,
  SubordinateWithCRsResponseDTO,
  SubordinateStatisticsResponseDTO,
  DiscipleWithCRStatusResponseDTO
} from '../dto/response';
import {
  SubordinateCR,
  SubordinateWithCRs,
  SubordinateStatistics,
  DiscipleWithCRStatus,
  AlertLevel
} from '../../domain/models';
import { StatutCR } from '../../domain/enums';

/**
 * Mapper pour les Subordonnés
 * Transforme les DTOs API en modèles domain
 */
@Injectable({
  providedIn: 'root'
})
export class SubordinatesMapper {

  /**
   * Convertit un DTO SubordinateCR en modèle domain
   */
  toCRDomain(dto: SubordinateCRResponseDTO): SubordinateCR {
    return {
      id: dto.id,
      date: new Date(dto.date),
      rdqd: dto.rdqd,
      priereSeule: dto.priereSeule,
      lectureBiblique: dto.lectureBiblique,
      statut: dto.statut as StatutCR,
      vuParFd: dto.vuParFd,
      createdAt: new Date(dto.createdAt)
    };
  }

  /**
   * Convertit un DTO SubordinateWithCRs en modèle domain
   */
  toSubordinateWithCRsDomain(dto: SubordinateWithCRsResponseDTO): SubordinateWithCRs {
    return {
      utilisateurId: dto.utilisateurId,
      nom: dto.nom,
      prenom: dto.prenom,
      nomComplet: dto.nomComplet,
      email: dto.email,
      role: dto.role,
      roleDisplayName: dto.roleDisplayName,
      avatarUrl: dto.avatarUrl,
      lastCRDate: dto.lastCRDate ? new Date(dto.lastCRDate) : undefined,
      daysSinceLastCR: dto.daysSinceLastCR,
      regularityRate: dto.regularityRate,
      totalCRs: dto.totalCRs,
      alertLevel: this.parseAlertLevel(dto.alertLevel),
      hasAlert: dto.hasAlert,
      compteRendus: dto.compteRendus?.map(cr => this.toCRDomain(cr)) || []
    };
  }

  /**
   * Convertit une liste de DTO SubordinateWithCRs en modèles domain
   */
  toSubordinateWithCRsDomainList(dtos: SubordinateWithCRsResponseDTO[]): SubordinateWithCRs[] {
    return dtos?.map(dto => this.toSubordinateWithCRsDomain(dto)) || [];
  }

  /**
   * Convertit un DTO SubordinateStatistics en modèle domain
   */
  toStatisticsDomain(dto: SubordinateStatisticsResponseDTO): SubordinateStatistics {
    return {
      utilisateurId: dto.utilisateurId,
      nom: dto.nom,
      prenom: dto.prenom,
      nomComplet: dto.nomComplet,
      email: dto.email,
      role: dto.role,
      roleDisplayName: dto.roleDisplayName,
      avatarUrl: dto.avatarUrl,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      nombreTotalCRs: dto.nombreTotalCRs,
      tauxRegularite: dto.tauxRegularite,
      rdqdCompletCount: dto.rdqdCompletCount,
      tauxRDQD: dto.tauxRDQD,
      dureeTotalePriere: dto.dureeTotalePriere,
      dureeMoyennePriere: dto.dureeMoyennePriere,
      totalChapitresLus: dto.totalChapitresLus,
      moyenneChapitresParJour: dto.moyenneChapitresParJour,
      totalPersonnesEvangelisees: dto.totalPersonnesEvangelisees,
      nombreConfessions: dto.nombreConfessions,
      nombreJeunes: dto.nombreJeunes,
      tendancePositive: dto.tendancePositive,
      alertLevel: this.parseAlertLevel(dto.alertLevel),
      hasAlert: dto.hasAlert
    };
  }

  /**
   * Convertit une liste de DTO SubordinateStatistics en modèles domain
   */
  toStatisticsDomainList(dtos: SubordinateStatisticsResponseDTO[]): SubordinateStatistics[] {
    return dtos?.map(dto => this.toStatisticsDomain(dto)) || [];
  }

  /**
   * Convertit un DTO DiscipleWithCRStatus en modèle domain
   */
  toDiscipleStatusDomain(dto: DiscipleWithCRStatusResponseDTO): DiscipleWithCRStatus {
    return {
      discipleId: dto.discipleId,
      nom: dto.nom,
      prenom: dto.prenom,
      nomComplet: dto.nomComplet,
      email: dto.email,
      avatarUrl: dto.avatarUrl,
      dernierCRDate: dto.dernierCRDate ? new Date(dto.dernierCRDate) : undefined,
      crAujourdhui: dto.crAujourdhui,
      joursDepuisDernierCR: dto.joursDepuisDernierCR,
      tauxRegularite30j: dto.tauxRegularite30j,
      alerte: dto.alerte,
      niveauAlerte: this.parseAlertLevel(dto.niveauAlerte)
    };
  }

  /**
   * Convertit une liste de DTO DiscipleWithCRStatus en modèles domain
   */
  toDiscipleStatusDomainList(dtos: DiscipleWithCRStatusResponseDTO[]): DiscipleWithCRStatus[] {
    return dtos?.map(dto => this.toDiscipleStatusDomain(dto)) || [];
  }

  /**
   * Parse le niveau d'alerte depuis une string
   */
  private parseAlertLevel(level: string): AlertLevel {
    const validLevels: AlertLevel[] = ['NONE', 'WARNING', 'CRITICAL'];
    return validLevels.includes(level as AlertLevel) ? level as AlertLevel : 'NONE';
  }
}
