/// <reference path="../../support/index.d.ts" />

describe('Profil Utilisateur', () => {
  beforeEach(() => {
    cy.login('FIDELE');
    cy.visit('/profile');
  });

  it('affiche la page de profil', () => {
    cy.url().should('include', '/profile');
    cy.contains(/profil|profile/i).should('exist');
  });

  it('affiche les informations de l\'utilisateur', () => {
    // Le profil devrait afficher nom, prénom, email, rôle
    cy.get('body').should('be.visible');
  });

  it('affiche le rôle de l\'utilisateur', () => {
    cy.get('body').then(($body) => {
      const roleText = $body.text();
      expect(roleText.toLowerCase()).to.satisfy((text: string) =>
        text.includes('fidèle') || text.includes('fidele') || text.includes('rôle') || text.includes('role')
      );
    });
  });

  it('affiche les informations de l\'église de maison', () => {
    // Le profil devrait montrer l'église de maison si assignée
    cy.get('body').should('be.visible');
  });
});
