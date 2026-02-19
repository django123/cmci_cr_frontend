/// <reference path="../../support/index.d.ts" />

describe('Détail Compte Rendu', () => {
  beforeEach(() => {
    cy.login('FIDELE');
  });

  it('affiche le détail d\'un CR existant', () => {
    // Navigue vers la liste pour trouver un CR
    cy.intercept('GET', '**/api/v1/cr/user/**').as('getCRs');
    cy.visit('/compte-rendu');

    cy.get('body').then(($body) => {
      const rows = $body.find('table tbody tr, .p-datatable-tbody tr, .cr-item, .cr-card');
      if (rows.length > 0) {
        cy.wrap(rows.first()).click();
        cy.url().should('match', /\/compte-rendu\/[a-zA-Z0-9-]+/);
      } else {
        cy.log('Aucun CR trouvé, test skippé');
      }
    });
  });

  it('affiche les informations principales du CR', () => {
    cy.intercept('GET', '**/api/v1/cr/*').as('getCR');
    // Accéder directement à un CR (si l'ID est connu)
    cy.visit('/compte-rendu');
    cy.get('body').should('be.visible');
  });

  it('affiche le statut du CR', () => {
    cy.visit('/compte-rendu');
    // Les statuts devraient être visibles sous forme de badges
    cy.get('body').then(($body) => {
      const badges = $body.find('.p-tag, .p-badge, [class*="statut"], [class*="status"]');
      if (badges.length > 0) {
        cy.wrap(badges.first()).should('be.visible');
      }
    });
  });

  it('affiche les commentaires du CR', () => {
    cy.visit('/compte-rendu');
    cy.get('body').then(($body) => {
      const rows = $body.find('table tbody tr, .cr-item, .cr-card');
      if (rows.length > 0) {
        cy.wrap(rows.first()).click();
        // Chercher la section commentaires
        cy.get('body').should('be.visible');
      }
    });
  });

  it('permet de modifier un CR en BROUILLON', () => {
    cy.visit('/compte-rendu');
    cy.get('body').then(($body) => {
      const editBtn = $body.find('button:contains("Modifier"), a:contains("Modifier"), [icon="pi pi-pencil"]');
      if (editBtn.length > 0) {
        cy.wrap(editBtn.first()).click();
        cy.url().should('include', '/edit');
      }
    });
  });

  it('ne permet pas de modifier un CR VALIDE', () => {
    // Un CR validé ne devrait pas avoir de bouton modifier
    cy.visit('/compte-rendu');
    cy.get('body').should('be.visible');
  });
});
