import { Role, StatutUtilisateur } from '../enums';

/**
 * Entite Disciple - Utilisateur avec informations FD
 */
export interface Disciple {
  readonly id: string;
  readonly email: string;
  readonly nom: string;
  readonly prenom: string;
  readonly nomComplet: string;
  readonly role: Role;
  readonly egliseMaisonId?: string;
  readonly fdId?: string;
  readonly fdNom?: string;
  readonly avatarUrl?: string;
  readonly telephone?: string;
  readonly dateNaissance?: Date;
  readonly dateBapteme?: Date;
  readonly statut: StatutUtilisateur;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Statistiques de distribution des roles
 */
export interface RoleStatistics {
  readonly totalUsers: number;
  readonly roleDistribution: Record<string, number>;
}

/**
 * Utilisateur Keycloak (pour l'administration)
 */
export interface KeycloakUser {
  readonly id: string;
  readonly keycloakId: string;
  readonly email: string;
  readonly nom: string;
  readonly prenom: string;
  readonly nomComplet: string;
  readonly role: Role;
  readonly statut: StatutUtilisateur;
  readonly createdAt: Date;
}
