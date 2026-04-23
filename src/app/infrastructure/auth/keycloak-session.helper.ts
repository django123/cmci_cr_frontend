import { KeycloakInitOptions } from 'keycloak-js';

interface StoredKeycloakSession {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
}

function isBrowserContext(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getStoredKeycloakInitOptions(): Partial<KeycloakInitOptions> | null {
  if (!isBrowserContext()) {
    return null;
  }

  const accessToken = window.localStorage.getItem('kc-access-token');
  if (!accessToken) {
    return null;
  }

  const refreshToken = window.localStorage.getItem('kc-refresh-token') || undefined;
  const idToken = window.localStorage.getItem('kc-id-token') || undefined;

  return {
    token: accessToken,
    refreshToken,
    idToken
  };
}

export function getStoredKeycloakSession(): StoredKeycloakSession | null {
  const initOptions = getStoredKeycloakInitOptions();
  if (!initOptions?.token) {
    return null;
  }

  return {
    accessToken: initOptions.token,
    refreshToken: initOptions.refreshToken,
    idToken: initOptions.idToken
  };
}

export function clearStoredKeycloakSession(): void {
  if (!isBrowserContext()) {
    return;
  }

  window.localStorage.removeItem('kc-access-token');
  window.localStorage.removeItem('kc-refresh-token');
  window.localStorage.removeItem('kc-id-token');
  window.localStorage.removeItem('kc-token-parsed');
  window.localStorage.removeItem('kc-user-role');
}
