import { Injectable } from '@angular/core';
import { CompteRendu } from '../../domain/models';
import { CompteRenduResponseDTO } from '../dto/response';
import { CreateCompteRenduRequestDTO, UpdateCompteRenduRequestDTO } from '../dto/request';
import { CreateCompteRenduRequest, UpdateCompteRenduRequest } from '../../domain/repositories';

/**
 * Mapper pour les transformations Compte Rendu
 * Responsabilité unique: conversion entre DTO et modèle domaine
 */
@Injectable({
  providedIn: 'root'
})
export class CompteRenduMapper {
  /**
   * Convertit un DTO de réponse en modèle du domaine
   */
  toDomain(dto: CompteRenduResponseDTO): CompteRendu {
    return {
      id: dto.id,
      utilisateurId: dto.utilisateurId,
      date: new Date(dto.date),
      rdqd: dto.rdqd,
      priereSeule: dto.priereSeule,
      priereCouple: dto.priereCouple,
      priereAvecEnfants: dto.priereAvecEnfants,
      priereAutres: dto.priereAutres,
      lectureBiblique: dto.lectureBiblique,
      livreBiblique: dto.livreBiblique,
      litteraturePages: dto.litteraturePages,
      litteratureTotal: dto.litteratureTotal,
      litteratureTitre: dto.litteratureTitre,
      confession: dto.confession,
      jeune: dto.jeune,
      typeJeune: dto.typeJeune,
      evangelisation: dto.evangelisation,
      offrande: dto.offrande,
      notes: dto.notes,
      statut: dto.statut,
      vuParFd: dto.vuParFd,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt)
    };
  }

  /**
   * Convertit une liste de DTOs en liste de modèles du domaine
   */
  toDomainList(dtos: CompteRenduResponseDTO[]): CompteRendu[] {
    return dtos.map(dto => this.toDomain(dto));
  }

  /**
   * Convertit une requête de création en DTO pour l'API
   */
  toCreateDTO(request: CreateCompteRenduRequest): CreateCompteRenduRequestDTO {
    return {
      date: request.date,
      rdqd: request.rdqd,
      priereSeuleMinutes: request.priereSeuleMinutes,
      priereCoupleMinutes: request.priereCoupleMinutes,
      priereAvecEnfantsMinutes: request.priereAvecEnfantsMinutes,
      lectureBiblique: request.lectureBiblique,
      livreBiblique: request.livreBiblique,
      litteraturePages: request.litteraturePages,
      litteratureTotal: request.litteratureTotal,
      litteratureTitre: request.litteratureTitre,
      priereAutres: request.priereAutres,
      confession: request.confession,
      jeune: request.jeune,
      typeJeune: request.typeJeune,
      evangelisation: request.evangelisation,
      offrande: request.offrande,
      notes: request.notes
    };
  }

  /**
   * Convertit une requête de mise à jour en DTO pour l'API
   */
  toUpdateDTO(request: UpdateCompteRenduRequest): UpdateCompteRenduRequestDTO {
    const dto: UpdateCompteRenduRequestDTO = {};

    if (request.rdqd !== undefined) dto.rdqd = request.rdqd;
    if (request.priereSeuleMinutes !== undefined) dto.priereSeuleMinutes = request.priereSeuleMinutes;
    if (request.priereCoupleMinutes !== undefined) dto.priereCoupleMinutes = request.priereCoupleMinutes;
    if (request.priereAvecEnfantsMinutes !== undefined) dto.priereAvecEnfantsMinutes = request.priereAvecEnfantsMinutes;
    if (request.lectureBiblique !== undefined) dto.lectureBiblique = request.lectureBiblique;
    if (request.livreBiblique !== undefined) dto.livreBiblique = request.livreBiblique;
    if (request.litteraturePages !== undefined) dto.litteraturePages = request.litteraturePages;
    if (request.litteratureTotal !== undefined) dto.litteratureTotal = request.litteratureTotal;
    if (request.litteratureTitre !== undefined) dto.litteratureTitre = request.litteratureTitre;
    if (request.priereAutres !== undefined) dto.priereAutres = request.priereAutres;
    if (request.confession !== undefined) dto.confession = request.confession;
    if (request.jeune !== undefined) dto.jeune = request.jeune;
    if (request.typeJeune !== undefined) dto.typeJeune = request.typeJeune;
    if (request.evangelisation !== undefined) dto.evangelisation = request.evangelisation;
    if (request.offrande !== undefined) dto.offrande = request.offrande;
    if (request.notes !== undefined) dto.notes = request.notes;

    return dto;
  }
}
