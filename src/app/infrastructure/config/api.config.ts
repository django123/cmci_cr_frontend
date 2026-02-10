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
  },

  // Administration des utilisateurs
  ADMIN_USERS: {
    BASE: '/admin/users',
    BY_ID: (id: string) => `/admin/users/${id}`,
    BY_ROLE: (role: string) => `/admin/users/role/${role}`,
    SEARCH: '/admin/users/search',
    ASSIGN_ROLE: (id: string) => `/admin/users/${id}/role`,
    STATISTICS: '/admin/users/statistics',
    PENDING: '/admin/users/pending'
  },

  // Regions
  REGIONS: {
    BASE: '/admin/regions',
    BY_ID: (id: string) => `/admin/regions/${id}`,
    BY_CODE: (code: string) => `/admin/regions/code/${code}`
  },

  // Zones
  ZONES: {
    BASE: '/admin/zones',
    BY_ID: (id: string) => `/admin/zones/${id}`
  },

  // Eglises Locales
  EGLISES_LOCALES: {
    BASE: '/admin/eglises-locales',
    BY_ID: (id: string) => `/admin/eglises-locales/${id}`
  },

  // Eglises de Maison
  EGLISES_MAISON: {
    BASE: '/admin/eglises-maison',
    BY_ID: (id: string) => `/admin/eglises-maison/${id}`
  },

  // Geographie (seed)
  GEOGRAPHY: {
    SEED: '/admin/geography/seed'
  },

  // Gestion des disciples
  DISCIPLES: {
    ASSIGN_FD: (discipleId: string) => `/disciples/${discipleId}/assign-fd`,
    REMOVE_FD: (discipleId: string) => `/disciples/${discipleId}/fd`,
    BY_FD: (fdId: string) => `/disciples/fd/${fdId}`,
    MY_DISCIPLES: '/disciples/my-disciples',
    UNASSIGNED: '/disciples/unassigned',
    COUNT_BY_FD: (fdId: string) => `/disciples/count/fd/${fdId}`
  }
} as const;
