import { KeycloakOptions } from 'keycloak-angular';

/**
 * Configuration Keycloak
 */
export interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
}

export const keycloakConfig: KeycloakConfig = {
  url: 'http://localhost:8180',
  realm: 'cmci',
  clientId: 'cmci-cr-frontend'
};

/**
 * Options d'initialisation Keycloak
 * Note: onLoad: 'check-sso' désactivé pour éviter les erreurs CSP en dev
 */
export const keycloakInitOptions: KeycloakOptions = {
  config: {
    url: keycloakConfig.url,
    realm: keycloakConfig.realm,
    clientId: keycloakConfig.clientId
  },
  initOptions: {
    onLoad: undefined, // Ne pas forcer la connexion au démarrage
    checkLoginIframe: false,
    enableLogging: true
  },
  enableBearerInterceptor: true,
  bearerPrefix: 'Bearer',
  bearerExcludedUrls: ['/assets', '/public']
};
