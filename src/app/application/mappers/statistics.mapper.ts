import { Injectable } from '@angular/core';
import { Statistics } from '../../domain/models';
import { StatisticsResponseDTO } from '../dto/response';

/**
 * Mapper pour les transformations Statistics
 * Responsabilité unique: conversion entre DTO et modèle domaine
 */
@Injectable({
  providedIn: 'root'
})
export class StatisticsMapper {
  /**
   * Convertit un DTO de réponse en modèle du domaine
   */
  toDomain(dto: StatisticsResponseDTO): Statistics {
    return {
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      totalCRSoumis: dto.totalCRSoumis,
      totalCRValides: dto.totalCRValides,
      tauxCompletion: dto.tauxCompletion,
      totalRDQDAccomplis: dto.totalRDQDAccomplis,
      totalRDQDAttendus: dto.totalRDQDAttendus,
      moyenneRDQD: dto.moyenneRDQD,
      totalPriereSeuleMinutes: dto.totalPriereSeuleMinutes,
      totalPriereCoupleMinutes: dto.totalPriereCoupleMinutes,
      totalPriereAvecEnfantsMinutes: dto.totalPriereAvecEnfantsMinutes,
      totalTempsEtudeParoleMinutes: dto.totalTempsEtudeParoleMinutes,
      totalContactsUtiles: dto.totalContactsUtiles,
      totalInvitationsCulte: dto.totalInvitationsCulte,
      totalOffrandes: dto.totalOffrandes,
      totalEvangelisations: dto.totalEvangelisations
    };
  }
}
