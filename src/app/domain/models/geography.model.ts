/**
 * Entite Region - Regroupement geographique de zones
 */
export interface Region {
  readonly id: string;
  readonly nom: string;
  readonly code: string;
  readonly nombreZones: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Entite Zone - Subdivision d'une region
 */
export interface Zone {
  readonly id: string;
  readonly nom: string;
  readonly regionId: string;
  readonly regionNom: string;
  readonly nombreEglisesLocales: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Entite Eglise Locale - Eglise rattachee a une zone
 */
export interface EgliseLocale {
  readonly id: string;
  readonly nom: string;
  readonly zoneId: string;
  readonly zoneNom: string;
  readonly adresse?: string;
  readonly pasteurId?: string;
  readonly pasteurNom?: string;
  readonly nombreEglisesMaison: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Entite Eglise de Maison - Cellule rattachee a une eglise locale
 */
export interface EgliseMaison {
  readonly id: string;
  readonly nom: string;
  readonly egliseLocaleId: string;
  readonly egliseLocaleNom: string;
  readonly leaderId?: string;
  readonly leaderNom?: string;
  readonly adresse?: string;
  readonly nombreFideles: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Resultat du seed geographique
 */
export interface SeedResult {
  readonly regionsCreated: number;
  readonly regionsSkipped: number;
  readonly zonesCreated: number;
  readonly zonesSkipped: number;
}
