/// <reference path="../../support/index.d.ts" />

describe('Contrôle d\'accès par rôle', () => {
  describe('FIDELE - accès limité', () => {
    beforeEach(() => {
      cy.login('FIDELE');
    });

    it('peut accéder au dashboard', () => {
      cy.visit('/dashboard');
      cy.url().should('include', '/dashboard');
    });

    it('peut accéder aux comptes rendus', () => {
      cy.visit('/compte-rendu');
      cy.url().should('include', '/compte-rendu');
    });

    it('peut accéder au profil', () => {
      cy.visit('/profile');
      cy.url().should('include', '/profile');
    });

    it('ne peut pas accéder à /validation - redirigé vers dashboard', () => {
      cy.visit('/validation');
      cy.url().should('include', '/dashboard');
    });

    it('ne peut pas accéder à /disciples - redirigé vers dashboard', () => {
      cy.visit('/disciples');
      cy.url().should('include', '/dashboard');
    });

    it('ne peut pas accéder à /administration - redirigé vers dashboard', () => {
      cy.visit('/administration');
      cy.url().should('include', '/dashboard');
    });

    it('ne peut pas accéder à /users - redirigé vers dashboard', () => {
      cy.visit('/users');
      cy.url().should('include', '/dashboard');
    });
  });

  describe('FD - accès intermédiaire', () => {
    beforeEach(() => {
      cy.login('FD');
    });

    it('peut accéder à /validation', () => {
      cy.visit('/validation');
      cy.url().should('include', '/validation');
    });

    it('peut accéder à /disciples', () => {
      cy.visit('/disciples');
      cy.url().should('include', '/disciples');
    });

    it('ne peut pas accéder à /administration', () => {
      cy.visit('/administration');
      cy.url().should('include', '/dashboard');
    });

    it('ne peut pas accéder à /users', () => {
      cy.visit('/users');
      cy.url().should('include', '/dashboard');
    });
  });

  describe('PASTEUR - accès étendu', () => {
    beforeEach(() => {
      cy.login('PASTEUR');
    });

    it('peut accéder à /validation', () => {
      cy.visit('/validation');
      cy.url().should('include', '/validation');
    });

    it('peut accéder à /disciples', () => {
      cy.visit('/disciples');
      cy.url().should('include', '/disciples');
    });

    it('peut accéder à /administration', () => {
      cy.visit('/administration');
      cy.url().should('include', '/administration');
    });

    it('peut accéder à /users', () => {
      cy.visit('/users');
      cy.url().should('include', '/users');
    });
  });

  describe('ADMIN - accès total', () => {
    beforeEach(() => {
      cy.login('ADMIN');
    });

    it('peut accéder à /dashboard', () => {
      cy.visit('/dashboard');
      cy.url().should('include', '/dashboard');
    });

    it('peut accéder à /validation', () => {
      cy.visit('/validation');
      cy.url().should('include', '/validation');
    });

    it('peut accéder à /disciples', () => {
      cy.visit('/disciples');
      cy.url().should('include', '/disciples');
    });

    it('peut accéder à /administration', () => {
      cy.visit('/administration');
      cy.url().should('include', '/administration');
    });

    it('peut accéder à /users', () => {
      cy.visit('/users');
      cy.url().should('include', '/users');
    });

    it('peut accéder à /profile', () => {
      cy.visit('/profile');
      cy.url().should('include', '/profile');
    });
  });
});
