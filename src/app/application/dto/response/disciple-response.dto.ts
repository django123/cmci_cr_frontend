/**
 * DTO de reponse pour un disciple (provenant de l'API)
 */
export interface DiscipleResponseDTO {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  nomComplet: string;
  role: string;
  egliseMaisonId?: string;
  fdId?: string;
  fdNom?: string;
  avatarUrl?: string;
  telephone?: string;
  dateNaissance?: string;
  dateBapteme?: string;
  statut?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO de reponse pour les statistiques de roles
 */
export interface RoleStatisticsResponseDTO {
  totalUsers: number;
  roleDistribution: Record<string, number>;
}

/**
 * DTO de reponse pour un utilisateur Keycloak
 */
export interface KeycloakUserResponseDTO {
  id: string;
  keycloakId: string;
  email: string;
  nom: string;
  prenom: string;
  nomComplet: string;
  role: string;
  statut: string;
  createdAt: string;
}
