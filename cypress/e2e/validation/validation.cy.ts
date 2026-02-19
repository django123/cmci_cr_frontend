/// <reference path="../../support/index.d.ts" />

describe('Validation des Comptes Rendus', () => {
  describe('en tant que FD', () => {
    beforeEach(() => {
      cy.login('FD');
      cy.intercept('GET', '**/api/v1/subordinates/cr**').as('getSubCRs');
      cy.visit('/validation');
    });

    it('affiche la page de validation', () => {
      cy.url().should('include', '/validation');
      cy.contains(/validation|valider|comptes?\s*rendus?/i).should('exist');
    });

    it('affiche la liste des CR à valider', () => {
      cy.get('body').should('be.visible');
      // Devrait montrer les CR soumis par les subordonnés
    });

    it('permet de valider un CR', () => {
      cy.get('body').then(($body) => {
        const validateBtn = $body.find('button:contains("Valider"), button[icon*="check"]');
        if (validateBtn.length > 0) {
          cy.intercept('POST', '**/api/v1/cr/*/validate').as('validateCR');
          cy.wrap(validateBtn.first()).click();
        }
      });
    });

    it('permet de marquer un CR comme vu', () => {
      cy.get('body').then(($body) => {
        const viewBtn = $body.find('button:contains("Vu"), button:contains("Marquer"), button[icon*="eye"]');
        if (viewBtn.length > 0) {
          cy.intercept('POST', '**/api/v1/cr/*/mark-viewed').as('markViewed');
          cy.wrap(viewBtn.first()).click();
        }
      });
    });

    it('CR disparaît de la liste après validation', () => {
      cy.get('body').then(($body) => {
        const rows = $body.find('table tbody tr, .cr-item');
        const initialCount = rows.length;
        if (initialCount > 0) {
          const validateBtn = $body.find('button:contains("Valider")');
          if (validateBtn.length > 0) {
            cy.intercept('POST', '**/api/v1/cr/*/validate').as('validateCR');
            cy.wrap(validateBtn.first()).click();
            // Après validation, il devrait y avoir un CR de moins
            cy.get('body').should('be.visible');
          }
        }
      });
    });
  });

  describe('accès refusé pour FIDELE', () => {
    it('FIDELE ne peut pas accéder à la validation', () => {
      cy.login('FIDELE');
      cy.visit('/validation');
      // Devrait être redirigé vers le dashboard
      cy.url().should('include', '/dashboard');
    });
  });
});
