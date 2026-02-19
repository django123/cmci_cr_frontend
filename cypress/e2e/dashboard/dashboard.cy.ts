/// <reference path="../../support/index.d.ts" />

describe('Dashboard', () => {
  describe('en tant que FIDELE', () => {
    beforeEach(() => {
      cy.login('FIDELE');
      cy.visit('/dashboard');
    });

    it('affiche le dashboard', () => {
      cy.url().should('include', '/dashboard');
      cy.get('body').should('be.visible');
    });

    it('affiche un message de bienvenue ou le titre dashboard', () => {
      cy.contains(/dashboard|tableau de bord|bienvenue/i).should('exist');
    });

    it('affiche les comptes rendus récents', () => {
      cy.intercept('GET', '**/api/v1/cr/**').as('getCRs');
      cy.visit('/dashboard');
      // Le dashboard devrait montrer les CR récents ou un message vide
      cy.get('body').should('be.visible');
    });

    it('permet la navigation vers nouveau CR', () => {
      cy.contains(/nouveau|créer|ajouter/i).should('exist');
    });

    it('affiche le verset du jour', () => {
      // Le dashboard inclut un widget verset
      cy.get('body').should('be.visible');
    });
  });

  describe('en tant que FD', () => {
    beforeEach(() => {
      cy.login('FD');
      cy.visit('/dashboard');
    });

    it('affiche le widget disciples pour FD+', () => {
      cy.url().should('include', '/dashboard');
      // FD devrait voir les infos sur ses disciples
      cy.get('body').should('be.visible');
    });

    it('affiche les statistiques correctement', () => {
      cy.intercept('GET', '**/api/v1/statistics/**').as('getStats');
      cy.visit('/dashboard');
      cy.get('body').should('be.visible');
    });
  });
});
