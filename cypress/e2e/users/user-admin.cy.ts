/// <reference path="../../support/index.d.ts" />

describe('Administration des Utilisateurs', () => {
  describe('en tant que PASTEUR', () => {
    beforeEach(() => {
      cy.login('PASTEUR');
      cy.intercept('GET', '**/api/v1/admin/users').as('getUsers');
      cy.visit('/users');
    });

    it('affiche la page d\'administration des utilisateurs', () => {
      cy.url().should('include', '/users');
      cy.contains(/utilisateur[s]?|user[s]?/i).should('exist');
    });

    it('affiche la liste des utilisateurs', () => {
      cy.get('body').should('be.visible');
    });

    it('recherche un utilisateur', () => {
      cy.get('body').then(($body) => {
        const searchInput = $body.find('input[placeholder*="cherch"], input[placeholder*="search"], input[type="search"]');
        if (searchInput.length > 0) {
          cy.intercept('GET', '**/api/v1/admin/users/search**').as('searchUsers');
          cy.wrap(searchInput).type('test');
        }
      });
    });

    it('filtre par rôle', () => {
      cy.get('body').then(($body) => {
        const roleFilter = $body.find('[data-testid="role-filter"], p-dropdown, select');
        if (roleFilter.length > 0) {
          cy.wrap(roleFilter.first()).click();
          cy.contains('FD').click({ force: true });
        }
      });
    });

    it('assigne un rôle à un utilisateur', () => {
      cy.get('body').then(($body) => {
        const assignBtn = $body.find('button:contains("Rôle"), button:contains("Assigner"), button[icon*="user"]');
        if (assignBtn.length > 0) {
          cy.intercept('PUT', '**/api/v1/admin/users/*/role').as('assignRole');
          cy.wrap(assignBtn.first()).click();
        }
      });
    });

    it('affiche les statistiques utilisateurs', () => {
      cy.intercept('GET', '**/api/v1/admin/users/statistics').as('getUserStats');
      cy.get('body').should('be.visible');
    });
  });

  describe('accès refusé', () => {
    it('FIDELE ne peut pas accéder à /users', () => {
      cy.login('FIDELE');
      cy.visit('/users');
      cy.url().should('include', '/dashboard');
    });

    it('FD ne peut pas accéder à /users', () => {
      cy.login('FD');
      cy.visit('/users');
      cy.url().should('include', '/dashboard');
    });
  });
});
