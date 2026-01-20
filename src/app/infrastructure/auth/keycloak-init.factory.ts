import { KeycloakService } from 'keycloak-angular';
import { keycloakInitOptions, keycloakConfig } from './keycloak.config';

/**
 * Factory pour initialiser Keycloak au démarrage de l'application
 * Si Keycloak n'est pas disponible, l'app démarre en mode dégradé
 */
export function initializeKeycloak(keycloak: KeycloakService): () => Promise<boolean> {
  return async () => {
    // Vérifier d'abord si Keycloak est accessible
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      await fetch(keycloakConfig.url, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
    } catch (e) {
      console.warn('Keycloak non disponible, démarrage en mode dégradé');
      return false;
    }

    try {
      return await keycloak.init(keycloakInitOptions);
    } catch (error) {
      console.error('Erreur d\'initialisation Keycloak:', error);
      return false;
    }
  };
}
