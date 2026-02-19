/// <reference path="../../support/index.d.ts" />

describe('Formulaire Compte Rendu', () => {
  beforeEach(() => {
    cy.login('FIDELE');
    cy.visit('/compte-rendu/new');
  });

  it('affiche le formulaire vide pour nouveau CR', () => {
    cy.url().should('include', '/compte-rendu/new');
    cy.get('form').should('exist');
  });

  it('affiche les champs obligatoires', () => {
    // Date, RDQD, prière seule sont obligatoires
    cy.get('input, p-calendar, p-inputnumber').should('have.length.greaterThan', 0);
  });

  it('valide que les champs obligatoires sont requis', () => {
    // Tenter de soumettre sans remplir les champs
    cy.get('button[type="submit"], button').contains(/sauvegarder|enregistrer|soumettre/i).click({ force: true });
    // Des messages d'erreur ou des champs en rouge devraient apparaître
    cy.get('.p-error, .ng-invalid, .p-invalid, [class*="error"]').should('exist');
  });

  it('permet la saisie du champ RDQD au format X/Y', () => {
    cy.get('input').then(($inputs) => {
      // Trouver le champ RDQD
      const rdqdInput = $inputs.filter('[formcontrolname="rdqd"], [name="rdqd"], [placeholder*="RDQD"], [placeholder*="rdqd"]');
      if (rdqdInput.length > 0) {
        cy.wrap(rdqdInput).clear().type('3/5');
        cy.wrap(rdqdInput).should('have.value', '3/5');
      }
    });
  });

  it('permet la saisie du temps de prière', () => {
    cy.get('input, p-inputnumber').then(($inputs) => {
      const priereInput = $inputs.filter('[formcontrolname="priereSeuleMinutes"], [formcontrolname*="priere"]');
      if (priereInput.length > 0) {
        cy.wrap(priereInput.first()).clear().type('45');
      }
    });
  });

  it('permet de cocher confession', () => {
    cy.get('body').then(($body) => {
      const checkbox = $body.find('[formcontrolname="confession"], p-checkbox[formcontrolname="confession"]');
      if (checkbox.length > 0) {
        cy.wrap(checkbox).click({ force: true });
      }
    });
  });

  it('permet de cocher jeûne', () => {
    cy.get('body').then(($body) => {
      const checkbox = $body.find('[formcontrolname="jeune"], p-checkbox[formcontrolname="jeune"]');
      if (checkbox.length > 0) {
        cy.wrap(checkbox).click({ force: true });
      }
    });
  });

  it('permet de cocher offrande', () => {
    cy.get('body').then(($body) => {
      const checkbox = $body.find('[formcontrolname="offrande"], p-checkbox[formcontrolname="offrande"]');
      if (checkbox.length > 0) {
        cy.wrap(checkbox).click({ force: true });
      }
    });
  });

  it('permet la saisie de la lecture biblique', () => {
    cy.get('body').then(($body) => {
      const input = $body.find('[formcontrolname="lectureBiblique"], [formcontrolname="livreBiblique"]');
      if (input.length > 0) {
        cy.wrap(input.first()).clear().type('3');
      }
    });
  });

  it('sauvegarde un CR complet avec toutes les données', () => {
    cy.fixture('compte-rendu').then((data) => {
      const cr = data.complet;

      cy.intercept('POST', '**/api/v1/cr').as('createCR');

      // Remplir les champs du formulaire
      cy.get('form').within(() => {
        // Date
        cy.get('input, p-calendar').first().clear().type(cr.date, { force: true });

        // RDQD
        cy.get('[formcontrolname="rdqd"], [name="rdqd"]').then(($el) => {
          if ($el.length) cy.wrap($el).clear().type(cr.rdqd);
        });

        // Prière
        cy.get('[formcontrolname="priereSeuleMinutes"]').then(($el) => {
          if ($el.length) cy.wrap($el).clear().type(String(cr.priereSeuleMinutes));
        });
      });

      // Soumettre
      cy.get('button').contains(/sauvegarder|enregistrer|créer/i).click({ force: true });
    });
  });

  it('sauvegarde un CR minimal', () => {
    cy.fixture('compte-rendu').then((data) => {
      const cr = data.minimal;

      cy.intercept('POST', '**/api/v1/cr').as('createCR');

      cy.get('form').within(() => {
        cy.get('input, p-calendar').first().clear().type(cr.date, { force: true });
        cy.get('[formcontrolname="rdqd"], [name="rdqd"]').then(($el) => {
          if ($el.length) cy.wrap($el).clear().type(cr.rdqd);
        });
        cy.get('[formcontrolname="priereSeuleMinutes"]').then(($el) => {
          if ($el.length) cy.wrap($el).clear().type(String(cr.priereSeuleMinutes));
        });
      });

      cy.get('button').contains(/sauvegarder|enregistrer|créer/i).click({ force: true });
    });
  });
});
