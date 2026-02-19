/// <reference path="./index.d.ts" />

const keycloakUrl = Cypress.env('keycloakUrl') || 'http://localhost:8180';
const keycloakRealm = Cypress.env('keycloakRealm') || 'cmci';
const keycloakClientId = Cypress.env('keycloakClientId') || 'cmci-cr-frontend';
const tokenUrl = `${keycloakUrl}/realms/${keycloakRealm}/protocol/openid-connect/token`;

// Utilisateurs de test par rôle (à configurer dans Keycloak)
const testUsers: Record<string, { username: string; password: string }> = {
  FIDELE: { username: 'fidele.test@cmci.org', password: 'test123' },
  FD: { username: 'fd.test@cmci.org', password: 'test123' },
  LEADER: { username: 'leader.test@cmci.org', password: 'test123' },
  PASTEUR: { username: 'pasteur.test@cmci.org', password: 'test123' },
  ADMIN: { username: 'admin.test@cmci.org', password: 'test123' }
};

/**
 * Login programmatique via Keycloak token endpoint (sans passer par l'UI)
 */
Cypress.Commands.add('login', (role: string) => {
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
    if (response.status !== 200) {
      cy.log(`Keycloak login failed (${response.status}), using mock token for ${role}`);
      // Fallback: mock token pour les tests sans Keycloak
      const mockToken = createMockToken(role, user.username);
      setKeycloakSession(mockToken, role);
      return;
    }

    const { access_token, refresh_token, id_token } = response.body;
    setKeycloakSession({
      accessToken: access_token,
      refreshToken: refresh_token,
      idToken: id_token
    }, role);
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
  tokens: { accessToken: string; refreshToken: string; idToken: string },
  role: string
) {
  const kcKey = `kc-callback-cmci-cr-frontend`;

  // Parse le payload du token pour les infos utilisateur
  let tokenParsed: Record<string, unknown>;
  try {
    const payloadB64 = tokens.accessToken.split('.')[1];
    tokenParsed = JSON.parse(atob(payloadB64));
  } catch {
    tokenParsed = {};
  }

  // Stocker dans localStorage comme keycloak-angular le fait
  window.localStorage.setItem('kc-access-token', tokens.accessToken);
  window.localStorage.setItem('kc-refresh-token', tokens.refreshToken);
  window.localStorage.setItem('kc-id-token', tokens.idToken);
  window.localStorage.setItem('kc-token-parsed', JSON.stringify(tokenParsed));
  window.localStorage.setItem('kc-user-role', role);

  // Intercept les appels API pour injecter le token Bearer
  cy.intercept('**/api/**', (req) => {
    req.headers['Authorization'] = `Bearer ${tokens.accessToken}`;
  });
}

/**
 * Logout
 */
Cypress.Commands.add('logout', () => {
  cy.log('Logging out');
  window.localStorage.removeItem('kc-access-token');
  window.localStorage.removeItem('kc-refresh-token');
  window.localStorage.removeItem('kc-id-token');
  window.localStorage.removeItem('kc-token-parsed');
  window.localStorage.removeItem('kc-user-role');
  cy.visit('/auth/login');
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
