import { Injectable } from '@angular/core';
import {
  RegionResponseDTO,
  ZoneResponseDTO,
  EgliseLocaleResponseDTO,
  EgliseMaisonResponseDTO,
  SeedResultDTO
} from '../dto/response';
import { Region, Zone, EgliseLocale, EgliseMaison, SeedResult } from '../../domain/models';

/**
 * Mapper pour les entites geographiques
 * Transforme les DTOs API en modeles domain
 */
@Injectable({
  providedIn: 'root'
})
export class GeographyMapper {

  toRegionDomain(dto: RegionResponseDTO): Region {
    return {
      id: dto.id,
      nom: dto.nom,
      code: dto.code,
      nombreZones: dto.nombreZones,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt)
    };
  }

  toRegionDomainList(dtos: RegionResponseDTO[]): Region[] {
    return dtos?.map(dto => this.toRegionDomain(dto)) || [];
  }

  toZoneDomain(dto: ZoneResponseDTO): Zone {
    return {
      id: dto.id,
      nom: dto.nom,
      regionId: dto.regionId,
      regionNom: dto.regionNom,
      nombreEglisesLocales: dto.nombreEglisesLocales,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt)
    };
  }

  toZoneDomainList(dtos: ZoneResponseDTO[]): Zone[] {
    return dtos?.map(dto => this.toZoneDomain(dto)) || [];
  }

  toEgliseLocaleDomain(dto: EgliseLocaleResponseDTO): EgliseLocale {
    return {
      id: dto.id,
      nom: dto.nom,
      zoneId: dto.zoneId,
      zoneNom: dto.zoneNom,
      adresse: dto.adresse,
      pasteurId: dto.pasteurId,
      pasteurNom: dto.pasteurNom,
      nombreEglisesMaison: dto.nombreEglisesMaison,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt)
    };
  }

  toEgliseLocaleDomainList(dtos: EgliseLocaleResponseDTO[]): EgliseLocale[] {
    return dtos?.map(dto => this.toEgliseLocaleDomain(dto)) || [];
  }

  toEgliseMaisonDomain(dto: EgliseMaisonResponseDTO): EgliseMaison {
    return {
      id: dto.id,
      nom: dto.nom,
      egliseLocaleId: dto.egliseLocaleId,
      egliseLocaleNom: dto.egliseLocaleNom,
      leaderId: dto.leaderId,
      leaderNom: dto.leaderNom,
      adresse: dto.adresse,
      nombreFideles: dto.nombreFideles,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt)
    };
  }

  toEgliseMaisonDomainList(dtos: EgliseMaisonResponseDTO[]): EgliseMaison[] {
    return dtos?.map(dto => this.toEgliseMaisonDomain(dto)) || [];
  }

  toSeedResultDomain(dto: SeedResultDTO): SeedResult {
    return {
      regionsCreated: dto.regionsCreated,
      regionsSkipped: dto.regionsSkipped,
      zonesCreated: dto.zonesCreated,
      zonesSkipped: dto.zonesSkipped
    };
  }
}
