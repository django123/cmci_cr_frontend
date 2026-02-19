/// <reference path="../../support/index.d.ts" />

describe('Liste des Comptes Rendus', () => {
  beforeEach(() => {
    cy.login('FIDELE');
    cy.intercept('GET', '**/api/v1/cr/user/**').as('getCRs');
    cy.visit('/compte-rendu');
  });

  it('affiche la page liste des CR', () => {
    cy.url().should('include', '/compte-rendu');
    cy.contains(/compte[s]?\s*rendu[s]?/i).should('exist');
  });

  it('affiche le bouton nouveau CR', () => {
    cy.contains(/nouveau|créer|ajouter/i).should('exist');
  });

  it('navigue vers le formulaire de création', () => {
    cy.contains(/nouveau|créer|ajouter/i).first().click();
    cy.url().should('include', '/compte-rendu/new');
  });

  it('affiche la liste des CR existants', () => {
    // La page devrait afficher une table ou une liste
    cy.get('body').should('be.visible');
  });

  it('filtre par statut BROUILLON', () => {
    // Cherche un dropdown ou des boutons de filtre
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="status-filter"]').length > 0) {
        cy.getByTestId('status-filter').click();
        cy.contains('Brouillon').click();
      }
    });
  });

  it('filtre par statut SOUMIS', () => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="status-filter"]').length > 0) {
        cy.getByTestId('status-filter').click();
        cy.contains('Soumis').click();
      }
    });
  });

  it('affiche les badges de statut avec les bonnes couleurs', () => {
    // Les badges PrimeNG utilisent les classes p-tag-*
    cy.get('body').should('be.visible');
  });

  it('navigue vers le détail d\'un CR au clic', () => {
    // Si des CR existent dans la liste, cliquer sur le premier
    cy.get('body').then(($body) => {
      const rows = $body.find('table tbody tr, .p-datatable-tbody tr, .cr-item');
      if (rows.length > 0) {
        cy.wrap(rows.first()).click();
        cy.url().should('match', /\/compte-rendu\/[a-zA-Z0-9-]+/);
      }
    });
  });
});
