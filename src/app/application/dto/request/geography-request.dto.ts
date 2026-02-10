/**
 * DTO de requete pour creer une region
 */
export interface CreateRegionRequestDTO {
  nom: string;
  code: string;
}

/**
 * DTO de requete pour mettre a jour une region
 */
export interface UpdateRegionRequestDTO {
  nom?: string;
  code?: string;
}

/**
 * DTO de requete pour creer une zone
 */
export interface CreateZoneRequestDTO {
  nom: string;
  regionId: string;
}

/**
 * DTO de requete pour mettre a jour une zone
 */
export interface UpdateZoneRequestDTO {
  nom?: string;
  regionId?: string;
}

/**
 * DTO de requete pour creer une eglise locale
 */
export interface CreateEgliseLocaleRequestDTO {
  nom: string;
  zoneId: string;
  adresse?: string;
  pasteurId?: string;
}

/**
 * DTO de requete pour mettre a jour une eglise locale
 */
export interface UpdateEgliseLocaleRequestDTO {
  nom?: string;
  zoneId?: string;
  adresse?: string;
  pasteurId?: string;
}

/**
 * DTO de requete pour creer une eglise de maison
 */
export interface CreateEgliseMaisonRequestDTO {
  nom: string;
  egliseLocaleId: string;
  leaderId?: string;
  adresse?: string;
}

/**
 * DTO de requete pour mettre a jour une eglise de maison
 */
export interface UpdateEgliseMaisonRequestDTO {
  nom?: string;
  egliseLocaleId?: string;
  leaderId?: string;
  adresse?: string;
}
