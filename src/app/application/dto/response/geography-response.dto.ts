/**
 * DTO de reponse pour une region (provenant de l'API)
 */
export interface RegionResponseDTO {
  id: string;
  nom: string;
  code: string;
  nombreZones: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO de reponse pour une zone (provenant de l'API)
 */
export interface ZoneResponseDTO {
  id: string;
  nom: string;
  regionId: string;
  regionNom: string;
  nombreEglisesLocales: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO de reponse pour une eglise locale (provenant de l'API)
 */
export interface EgliseLocaleResponseDTO {
  id: string;
  nom: string;
  zoneId: string;
  zoneNom: string;
  adresse?: string;
  pasteurId?: string;
  pasteurNom?: string;
  nombreEglisesMaison: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO de reponse pour une eglise de maison (provenant de l'API)
 */
export interface EgliseMaisonResponseDTO {
  id: string;
  nom: string;
  egliseLocaleId: string;
  egliseLocaleNom: string;
  leaderId?: string;
  leaderNom?: string;
  adresse?: string;
  nombreFideles: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO de reponse pour le resultat du seed geographique
 */
export interface SeedResultDTO {
  regionsCreated: number;
  regionsSkipped: number;
  zonesCreated: number;
  zonesSkipped: number;
}
