import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 30000,
    video: false,
    screenshotOnRunFailure: true,
    chromeWebSecurity: false,
    env: {
      apiUrl: 'http://localhost:8081/api/v1',
      keycloakUrl: 'http://localhost:8180',
      keycloakRealm: 'cmci',
      keycloakClientId: 'cmci-cr-frontend'
    }
  }
});
