import { Role, StatutUtilisateur } from '../enums';

/**
 * Entité Utilisateur - Membre de l'église
 */
export interface Utilisateur {
  readonly id: string;
  readonly email: string;
  readonly nom: string;
  readonly prenom: string;
  readonly role: Role;
  readonly egliseMaisonId?: string;
  readonly fdId?: string;
  readonly avatarUrl?: string;
  readonly telephone?: string;
  readonly dateNaissance?: Date;
  readonly dateBapteme?: Date;
  readonly statut: StatutUtilisateur;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Obtient le nom complet de l'utilisateur
 */
export function getFullName(utilisateur: Utilisateur): string {
  return `${utilisateur.prenom} ${utilisateur.nom}`;
}

/**
 * Obtient les initiales de l'utilisateur
 */
export function getInitials(utilisateur: Utilisateur): string {
  return `${utilisateur.prenom.charAt(0)}${utilisateur.nom.charAt(0)}`.toUpperCase();
}

/**
 * Vérifie si l'utilisateur est actif
 */
export function isActive(utilisateur: Utilisateur): boolean {
  return utilisateur.statut === StatutUtilisateur.ACTIF;
}

/**
 * Vérifie si l'utilisateur peut voir les CR des autres
 */
export function canViewOthersCR(utilisateur: Utilisateur): boolean {
  return [Role.FD, Role.LEADER, Role.PASTEUR, Role.ADMIN].includes(utilisateur.role);
}

/**
 * Vérifie si l'utilisateur peut valider les CR
 */
export function canValidateCR(utilisateur: Utilisateur): boolean {
  return [Role.FD, Role.LEADER, Role.PASTEUR, Role.ADMIN].includes(utilisateur.role);
}
