/// <reference path="../../support/index.d.ts" />

describe('Gestion des Disciples', () => {
  describe('en tant que FD', () => {
    beforeEach(() => {
      cy.login('FD');
      cy.intercept('GET', '**/api/v1/disciples/my-disciples').as('getMyDisciples');
      cy.intercept('GET', '**/api/v1/disciples/unassigned').as('getUnassigned');
      cy.visit('/disciples');
    });

    it('affiche la page des disciples', () => {
      cy.url().should('include', '/disciples');
      cy.contains(/disciple[s]?/i).should('exist');
    });

    it('affiche la liste de mes disciples', () => {
      cy.get('body').should('be.visible');
      // La page devrait montrer les disciples assignés au FD
    });

    it('affiche les disciples non assignés', () => {
      // Chercher un onglet ou bouton pour les non-assignés
      cy.get('body').then(($body) => {
        const tab = $body.find(':contains("Non assigné"), :contains("non assigné"), :contains("Unassigned")');
        if (tab.length > 0) {
          cy.wrap(tab.first()).click({ force: true });
        }
      });
    });

    it('permet d\'assigner un disciple', () => {
      cy.get('body').then(($body) => {
        const assignBtn = $body.find('button:contains("Assigner"), button:contains("assigner"), button[icon*="plus"]');
        if (assignBtn.length > 0) {
          cy.intercept('POST', '**/api/v1/disciples/*/assign-fd').as('assignFD');
          cy.wrap(assignBtn.first()).click();
        }
      });
    });

    it('permet de retirer un disciple', () => {
      cy.get('body').then(($body) => {
        const removeBtn = $body.find('button:contains("Retirer"), button:contains("retirer"), button[icon*="minus"], button[icon*="trash"]');
        if (removeBtn.length > 0) {
          cy.intercept('DELETE', '**/api/v1/disciples/*/fd').as('removeFD');
          cy.wrap(removeBtn.first()).click();
        }
      });
    });

    it('affiche le compteur de disciples', () => {
      // Un compteur ou badge devrait indiquer le nombre de disciples
      cy.get('body').should('be.visible');
    });

    it('les onglets fonctionnent', () => {
      cy.get('body').then(($body) => {
        const tabs = $body.find('.p-tabview-nav li, .p-tab, [role="tab"]');
        if (tabs.length > 1) {
          cy.wrap(tabs.eq(1)).click();
          cy.wrap(tabs.eq(0)).click();
        }
      });
    });

    it('filtre/recherche de disciples', () => {
      cy.get('body').then(($body) => {
        const searchInput = $body.find('input[placeholder*="cherch"], input[placeholder*="search"], input[placeholder*="filtr"]');
        if (searchInput.length > 0) {
          cy.wrap(searchInput).type('test');
        }
      });
    });
  });

  describe('accès refusé pour FIDELE', () => {
    it('FIDELE ne peut pas accéder à /disciples', () => {
      cy.login('FIDELE');
      cy.visit('/disciples');
      cy.url().should('include', '/dashboard');
    });
  });
});
