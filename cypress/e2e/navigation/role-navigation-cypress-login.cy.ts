/// <reference path="../../support/index.d.ts" />

describe('Navigation par role avec login Cypress', () => {
  it('FIDELE accede a /statistics et reste bloque hors routes supervisees', () => {
    cy.login('FIDELE', '/statistics');
    cy.url().should('include', '/statistics');
    cy.get('app-statistics', { timeout: 20000 }).should('exist');

    cy.visit('/validation');
    cy.url({ timeout: 15000 }).should('include', '/dashboard');
  });

  it('FD accede a /validation, /disciples et voit le mode groupe dans /statistics', () => {
    cy.login('FD', '/validation');
    cy.url().should('include', '/validation');

    cy.visit('/disciples');
    cy.url().should('include', '/disciples');

    cy.visit('/statistics');
    cy.url().should('include', '/statistics');
    cy.get('.mode-btn', { timeout: 20000 }).should('have.length.at.least', 2);
  });

  it('LEADER accede desormais a /users et /administration', () => {
    cy.login('LEADER', '/users');
    cy.url().should('include', '/users');

    cy.visit('/administration');
    cy.url().should('include', '/administration');
  });
});
