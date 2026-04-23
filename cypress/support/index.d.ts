/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Login programmatique via Keycloak token endpoint.
     * Le premier affichage se fait directement sur la route cible
     * avec la session deja hydratee.
     */
    login(
      role: 'FIDELE' | 'FD' | 'LEADER' | 'PASTEUR' | 'ADMIN',
      path?: string
    ): Chainable<void>;

    /**
     * Logout - supprime le token et recharge la page.
     */
    logout(): Chainable<void>;

    /**
     * Verifie que l'URL contient le chemin donne.
     */
    shouldBeOnPage(path: string): Chainable<void>;

    /**
     * Attend que le spinner de chargement disparaisse.
     */
    waitForLoad(): Chainable<void>;

    /**
     * Selectionne un element par data-testid.
     */
    getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Intercepte les appels API avec un alias.
     */
    interceptApi(method: string, endpoint: string, alias: string): Chainable<void>;
  }
}
