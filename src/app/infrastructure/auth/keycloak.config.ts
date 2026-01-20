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
  url: 'http://localhost:8080',
  realm: 'cmci',
  clientId: 'cmci-cr-frontend'
};

/**
 * Options d'initialisation Keycloak
 */
export const keycloakInitOptions: KeycloakOptions = {
  config: {
    url: keycloakConfig.url,
    realm: keycloakConfig.realm,
    clientId: keycloakConfig.clientId
  },
  initOptions: {
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
    checkLoginIframe: false
  },
  enableBearerInterceptor: true,
  bearerPrefix: 'Bearer',
  bearerExcludedUrls: ['/assets']
};
