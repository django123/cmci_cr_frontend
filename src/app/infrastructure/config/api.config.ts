import { InjectionToken } from '@angular/core';

/**
 * Configuration de l'API Backend
 */
export interface ApiConfig {
  baseUrl: string;
  apiVersion: string;
  timeout: number;
}

export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG');

export const defaultApiConfig: ApiConfig = {
  baseUrl: '/api',
  apiVersion: 'v1',
  timeout: 30000
};

/**
 * Construit l'URL complète de l'API
 */
export function buildApiUrl(config: ApiConfig, endpoint: string): string {
  const base = config.baseUrl.endsWith('/') ? config.baseUrl.slice(0, -1) : config.baseUrl;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}/${config.apiVersion}${path}`;
}

/**
 * Endpoints de l'API
 */
export const ApiEndpoints = {
  // Comptes Rendus
  CR: {
    BASE: '/cr',
    BY_ID: (id: string) => `/cr/${id}`,
    BY_USER: (userId: string) => `/cr/user/${userId}`,
    BY_USER_PERIOD: (userId: string) => `/cr/user/${userId}/period`,
    SUBMIT: (id: string) => `/cr/${id}/submit`,
    VALIDATE: (id: string) => `/cr/${id}/validate`,
    MARK_VIEWED: (id: string) => `/cr/${id}/mark-viewed`
  },

  // Commentaires
  COMMENTAIRES: {
    BY_CR: (crId: string) => `/cr/${crId}/commentaires`
  },

  // Statistiques
  STATISTICS: {
    PERSONAL: '/statistics/personal',
    BY_USER: (userId: string) => `/statistics/user/${userId}`
  },

  // Subordonnés (visibilité hiérarchique)
  SUBORDINATES: {
    CR: '/subordinates/cr',
    SUMMARY: '/subordinates/cr/summary',
    STATISTICS: '/subordinates/statistics',
    DISCIPLES: '/subordinates/disciples'
  }
} as const;
