/// <reference path="./index.d.ts" />

const keycloakUrl = Cypress.env('keycloakUrl') || 'http://localhost:8180';
const keycloakRealm = Cypress.env('keycloakRealm') || 'cmci';
const keycloakClientId = Cypress.env('keycloakClientId') || 'cmci-cr-frontend';
const tokenUrl = `${keycloakUrl}/realms/${keycloakRealm}/protocol/openid-connect/token`;

// Utilisateurs de test par rôle (à configurer dans Keycloak)
const testUsers: Record<string, { username: string; password: string }> = {
  FIDELE: { username: 'fidele@cmci.org', password: 'fidele123' },
  FD: { username: 'fd@cmci.org', password: 'fd123456' },
  LEADER: { username: 'leader@cmci.org', password: 'leader123' },
  PASTEUR: { username: 'pasteur@cmci.org', password: 'pasteur123' },
  ADMIN: { username: 'admin@cmci.org', password: 'admin123' }
};

/**
 * Login programmatique via Keycloak token endpoint (sans passer par l'UI)
 */
Cypress.Commands.add('login', (role: string, path = '/') => {
  const user = testUsers[role];
  if (!user) {
    throw new Error(`Unknown role: ${role}. Available: ${Object.keys(testUsers).join(', ')}`);
  }

  cy.log(`Logging in as ${role} (${user.username})`);

  cy.request({
    method: 'POST',
    url: tokenUrl,
    form: true,
    body: {
      grant_type: 'password',
      client_id: keycloakClientId,
      username: user.username,
      password: user.password,
      scope: 'openid'
    },
    failOnStatusCode: false
  }).then((response) => {
    let tokens: { accessToken: string; refreshToken: string; idToken: string };

    if (response.status !== 200) {
      cy.log(`Keycloak login failed (${response.status}), using mock token for ${role}`);
      tokens = createMockToken(role, user.username);
    } else {
      const { access_token, refresh_token, id_token } = response.body;
      tokens = {
        accessToken: access_token,
        refreshToken: refresh_token,
        idToken: id_token
      };
    }

    cy.intercept('**/api/**', (req) => {
      req.headers['Authorization'] = `Bearer ${tokens.accessToken}`;
    });

    cy.visit(path, {
      onBeforeLoad(win) {
        setKeycloakSession(win, tokens, role);
      }
    });
  });
});

/**
 * Crée un mock token JWT pour les tests sans Keycloak
 */
function createMockToken(role: string, username: string) {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);

  const payload = btoa(JSON.stringify({
    exp: now + 3600,
    iat: now,
    sub: `test-${role.toLowerCase()}-id`,
    user_id: `test-${role.toLowerCase()}-id`,
    email: username,
    preferred_username: username.split('@')[0],
    given_name: role.charAt(0) + role.slice(1).toLowerCase(),
    family_name: 'Test',
    realm_access: {
      roles: [role, role.toLowerCase()]
    },
    resource_access: {
      [keycloakClientId]: {
        roles: [role, role.toLowerCase()]
      }
    }
  }));

  const signature = btoa('mock-signature');
  const token = `${header}.${payload}.${signature}`;

  return {
    accessToken: token,
    refreshToken: token,
    idToken: token
  };
}

/**
 * Stocke la session Keycloak dans le localStorage
 */
function setKeycloakSession(
  win: Window,
  tokens: { accessToken: string; refreshToken: string; idToken: string },
  role: string
) {
  captureBrowserErrors(win);

  // Parse le payload du token pour les infos utilisateur
  let tokenParsed: Record<string, unknown>;
  try {
    const payloadB64 = tokens.accessToken.split('.')[1];
    tokenParsed = JSON.parse(atob(payloadB64));
  } catch {
    tokenParsed = {};
  }

  // Stocker dans localStorage comme keycloak-angular le fait
  win.localStorage.setItem('kc-access-token', tokens.accessToken);
  win.localStorage.setItem('kc-refresh-token', tokens.refreshToken);
  win.localStorage.setItem('kc-id-token', tokens.idToken);
  win.localStorage.setItem('kc-token-parsed', JSON.stringify(tokenParsed));
  win.localStorage.setItem('kc-user-role', role);
}

function captureBrowserErrors(win: Window) {
  const messages: string[] = [];
  const storeMessages = () => {
    win.localStorage.setItem('cypress-browser-messages', JSON.stringify(messages));
  };
  const serializeValue = (value: unknown): string => {
    if (value instanceof Error) {
      return `${value.name}: ${value.message}\n${value.stack || ''}`.trim();
    }

    if (typeof value === 'object' && value !== null) {
      const maybeError = value as { name?: string; message?: string; stack?: string };
      if (maybeError.message || maybeError.stack) {
        return `${maybeError.name || 'Error'}: ${maybeError.message || ''}\n${maybeError.stack || ''}`.trim();
      }

      try {
        return JSON.stringify(value, Object.getOwnPropertyNames(value));
      } catch {
        return String(value);
      }
    }

    return String(value);
  };
  const pushMessage = (level: string, value: unknown) => {
    messages.push(`[${level}] ${serializeValue(value)}`);
    storeMessages();
  };

  const originalConsoleError = win.console.error.bind(win.console);
  win.console.error = (...args: unknown[]) => {
    args.forEach(arg => pushMessage('console.error', arg));
    originalConsoleError(...args);
  };

  const originalConsoleWarn = win.console.warn.bind(win.console);
  win.console.warn = (...args: unknown[]) => {
    args.forEach(arg => pushMessage('console.warn', arg));
    originalConsoleWarn(...args);
  };

  win.addEventListener('error', (event) => {
    pushMessage('window.error', event.error || event.message);
  });

  win.addEventListener('unhandledrejection', (event) => {
    pushMessage('unhandledrejection', event.reason);
  });

  storeMessages();
}

/**
 * Logout
 */
Cypress.Commands.add('logout', () => {
  cy.log('Logging out');
  cy.visit('/auth/login', {
    onBeforeLoad(win) {
      win.localStorage.removeItem('kc-access-token');
      win.localStorage.removeItem('kc-refresh-token');
      win.localStorage.removeItem('kc-id-token');
      win.localStorage.removeItem('kc-token-parsed');
      win.localStorage.removeItem('kc-user-role');
    }
  });
});

/**
 * Vérifie la page courante
 */
Cypress.Commands.add('shouldBeOnPage', (path: string) => {
  cy.url().should('include', path);
});

/**
 * Attend la fin du chargement (spinner PrimeNG)
 */
Cypress.Commands.add('waitForLoad', () => {
  cy.get('.p-progress-spinner', { timeout: 1000 }).should('not.exist');
  cy.get('.loading-overlay', { timeout: 1000 }).should('not.exist');
});

/**
 * Sélection par data-testid
 */
Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});

/**
 * Intercepte les appels API
 */
Cypress.Commands.add('interceptApi', (method: string, endpoint: string, alias: string) => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:8081/api/v1';
  cy.intercept(method, `${apiUrl}${endpoint}*`).as(alias);
});
