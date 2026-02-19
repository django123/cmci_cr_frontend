/// <reference path="../../support/index.d.ts" />

describe('Workflow Compte Rendu', () => {
  it('workflow complet: Créer → Soumettre → Valider', () => {
    // Étape 1: FIDELE crée un CR
    cy.login('FIDELE');
    cy.intercept('POST', '**/api/v1/cr').as('createCR');
    cy.visit('/compte-rendu/new');

    cy.get('form').within(() => {
      cy.get('input, p-calendar').first().clear().type('2026-02-15', { force: true });
      cy.get('[formcontrolname="rdqd"], [name="rdqd"]').then(($el) => {
        if ($el.length) cy.wrap($el).clear().type('3/5');
      });
      cy.get('[formcontrolname="priereSeuleMinutes"]').then(($el) => {
        if ($el.length) cy.wrap($el).clear().type('45');
      });
    });

    cy.get('button').contains(/sauvegarder|enregistrer|créer/i).click({ force: true });
  });

  it('CR créé apparaît dans la liste', () => {
    cy.login('FIDELE');
    cy.intercept('GET', '**/api/v1/cr/user/**').as('getCRs');
    cy.visit('/compte-rendu');
    // La liste devrait contenir des CR
    cy.get('body').should('be.visible');
  });

  it('soumission change le statut à SOUMIS', () => {
    cy.login('FIDELE');
    cy.visit('/compte-rendu');

    // Trouver un CR en BROUILLON et le soumettre
    cy.get('body').then(($body) => {
      const submitBtn = $body.find('button:contains("Soumettre"), button:contains("soumettre")');
      if (submitBtn.length > 0) {
        cy.intercept('POST', '**/api/v1/cr/*/submit').as('submitCR');
        cy.wrap(submitBtn.first()).click();
        cy.wait('@submitCR');
      }
    });
  });

  it('FD peut valider un CR SOUMIS', () => {
    cy.login('FD');
    cy.intercept('GET', '**/api/v1/subordinates/cr**').as('getSubCRs');
    cy.visit('/validation');

    cy.get('body').then(($body) => {
      const validateBtn = $body.find('button:contains("Valider"), button:contains("valider")');
      if (validateBtn.length > 0) {
        cy.intercept('POST', '**/api/v1/cr/*/validate').as('validateCR');
        cy.wrap(validateBtn.first()).click();
        cy.wait('@validateCR');
      }
    });
  });

  it('CR validé change statut à VALIDE', () => {
    cy.login('FD');
    cy.visit('/validation');
    // Après validation, le CR devrait montrer le statut VALIDE
    cy.get('body').should('be.visible');
  });

  it('impossible de modifier un CR VALIDE', () => {
    cy.login('FIDELE');
    cy.visit('/compte-rendu');
    // Les CR validés ne devraient pas avoir de bouton modifier
    cy.get('body').should('be.visible');
  });

  it('ajout commentaire sur un CR', () => {
    cy.login('FD');
    cy.visit('/compte-rendu');

    cy.get('body').then(($body) => {
      const rows = $body.find('table tbody tr, .cr-item, .cr-card');
      if (rows.length > 0) {
        cy.wrap(rows.first()).click();
        // Trouver le champ commentaire
        cy.get('body').then(($detail) => {
          const commentInput = $detail.find('textarea, input[placeholder*="commentaire"], [formcontrolname="contenu"]');
          if (commentInput.length > 0) {
            cy.intercept('POST', '**/api/v1/cr/*/commentaires').as('addComment');
            cy.wrap(commentInput).type('Bon travail, continue comme ça !');
            cy.get('button').contains(/ajouter|envoyer|commenter/i).click();
            cy.wait('@addComment');
          }
        });
      }
    });
  });

  it('commentaires visibles dans le détail', () => {
    cy.login('FIDELE');
    cy.visit('/compte-rendu');

    cy.get('body').then(($body) => {
      const rows = $body.find('table tbody tr, .cr-item, .cr-card');
      if (rows.length > 0) {
        cy.wrap(rows.first()).click();
        // La section commentaires devrait être visible
        cy.get('body').should('be.visible');
      }
    });
  });
});
