import { KeycloakService } from 'keycloak-angular';
import { keycloakConfig, keycloakInitOptions } from './keycloak.config';
import { getStoredKeycloakInitOptions } from './keycloak-session.helper';

/**
 * Factory pour initialiser Keycloak au demarrage de l'application.
 * Si une session de test est presente dans le localStorage, elle est
 * reinjectee dans keycloak-js afin que l'app reconnaisse la session.
 */
export function initializeKeycloak(keycloak: KeycloakService): () => Promise<boolean> {
  return async () => {
    const storedSessionInitOptions = getStoredKeycloakInitOptions();
    const initOptions = storedSessionInitOptions
      ? {
          ...keycloakInitOptions,
          initOptions: {
            ...keycloakInitOptions.initOptions,
            ...storedSessionInitOptions
          }
        }
      : keycloakInitOptions;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const openIdConfigurationUrl = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/.well-known/openid-configuration`;

      await fetch(openIdConfigurationUrl, {
        method: 'GET',
        mode: 'cors',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
    } catch {
      console.warn('Keycloak non disponible, demarrage en mode degrade');
      return false;
    }

    try {
      return await keycloak.init(initOptions);
    } catch (error) {
      console.error('Erreur d\'initialisation Keycloak:', error);
      return false;
    }
  };
}
