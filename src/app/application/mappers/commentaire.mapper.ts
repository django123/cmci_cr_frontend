import { Injectable } from '@angular/core';
import { Commentaire } from '../../domain/models';
import { CommentaireResponseDTO } from '../dto/response';

/**
 * Mapper pour les transformations Commentaire
 * Responsabilité unique: conversion entre DTO et modèle domaine
 */
@Injectable({
  providedIn: 'root'
})
export class CommentaireMapper {
  /**
   * Convertit un DTO de réponse en modèle du domaine
   */
  toDomain(dto: CommentaireResponseDTO): Commentaire {
    return {
      id: dto.id,
      compteRenduId: dto.compteRenduId,
      auteurId: dto.auteurId,
      auteurNom: dto.auteurNom,
      auteurPrenom: dto.auteurPrenom,
      contenu: dto.contenu,
      createdAt: new Date(dto.createdAt)
    };
  }

  /**
   * Convertit une liste de DTOs en liste de modèles du domaine
   */
  toDomainList(dtos: CommentaireResponseDTO[]): Commentaire[] {
    return dtos.map(dto => this.toDomain(dto));
  }
}
