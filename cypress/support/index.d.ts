/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Login programmatique via Keycloak token endpoint
     * @param role - Le rôle de l'utilisateur: FIDELE, FD, LEADER, PASTEUR, ADMIN
     */
    login(role: 'FIDELE' | 'FD' | 'LEADER' | 'PASTEUR' | 'ADMIN'): Chainable<void>;

    /**
     * Logout - supprime le token et recharge la page
     */
    logout(): Chainable<void>;

    /**
     * Vérifie que l'URL contient le chemin donné
     */
    shouldBeOnPage(path: string): Chainable<void>;

    /**
     * Attend que le spinner de chargement disparaisse
     */
    waitForLoad(): Chainable<void>;

    /**
     * Sélectionne un élément par data-testid
     */
    getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Intercepte les appels API avec un alias
     */
    interceptApi(method: string, endpoint: string, alias: string): Chainable<void>;
  }
}
