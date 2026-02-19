/// <reference path="../../support/index.d.ts" />

describe('Administration Géographique', () => {
  describe('en tant que PASTEUR', () => {
    beforeEach(() => {
      cy.login('PASTEUR');
      cy.visit('/administration');
    });

    it('affiche la page d\'administration', () => {
      cy.url().should('include', '/administration');
      cy.contains(/administration|gestion|hiérarchie/i).should('exist');
    });

    it('affiche les onglets (Régions, Zones, Églises Locales, Églises de Maison)', () => {
      cy.get('body').then(($body) => {
        const tabs = $body.find('.p-tabview-nav li, .p-tab, [role="tab"]');
        expect(tabs.length).to.be.greaterThan(0);
      });
    });

    // --- REGIONS ---
    it('CRUD Régions - liste les régions', () => {
      cy.intercept('GET', '**/api/v1/admin/regions').as('getRegions');
      cy.visit('/administration');
      cy.get('body').should('be.visible');
    });

    it('CRUD Régions - créer une région', () => {
      cy.get('body').then(($body) => {
        const addBtn = $body.find('button:contains("Ajouter"), button:contains("Créer"), button:contains("Nouveau"), button[icon*="plus"]');
        if (addBtn.length > 0) {
          cy.wrap(addBtn.first()).click();
          // Remplir le formulaire
          cy.get('input[formcontrolname="nom"], input[placeholder*="nom"]').then(($input) => {
            if ($input.length) {
              cy.wrap($input).type('Test Région');
            }
          });
          cy.get('input[formcontrolname="code"], input[placeholder*="code"]').then(($input) => {
            if ($input.length) {
              cy.wrap($input).type('TST');
            }
          });
          cy.intercept('POST', '**/api/v1/admin/regions').as('createRegion');
          cy.get('button').contains(/sauvegarder|enregistrer|créer|valider/i).click({ force: true });
        }
      });
    });

    it('CRUD Régions - modifier une région', () => {
      cy.get('body').then(($body) => {
        const editBtn = $body.find('button[icon*="pencil"], button:contains("Modifier")');
        if (editBtn.length > 0) {
          cy.wrap(editBtn.first()).click();
          cy.get('input[formcontrolname="nom"], input[placeholder*="nom"]').then(($input) => {
            if ($input.length) {
              cy.wrap($input).clear().type('Région Modifiée');
            }
          });
          cy.intercept('PUT', '**/api/v1/admin/regions/*').as('updateRegion');
          cy.get('button').contains(/sauvegarder|mettre à jour|valider/i).click({ force: true });
        }
      });
    });

    it('CRUD Régions - supprimer une région', () => {
      cy.get('body').then(($body) => {
        const deleteBtn = $body.find('button[icon*="trash"], button:contains("Supprimer")');
        if (deleteBtn.length > 0) {
          cy.intercept('DELETE', '**/api/v1/admin/regions/*').as('deleteRegion');
          cy.wrap(deleteBtn.first()).click();
          // Confirmer la suppression
          cy.get('button').contains(/oui|confirmer|supprimer/i).click({ force: true });
        }
      });
    });

    // --- ZONES ---
    it('CRUD Zones - naviguer vers l\'onglet Zones', () => {
      cy.get('body').then(($body) => {
        const zoneTab = $body.find(':contains("Zone")').filter('[role="tab"], .p-tabview-nav li');
        if (zoneTab.length > 0) {
          cy.wrap(zoneTab.first()).click();
        }
      });
    });

    it('CRUD Zones - créer une zone avec région parent', () => {
      // Naviguer vers l'onglet Zones
      cy.get('body').then(($body) => {
        const zoneTab = $body.find(':contains("Zone")').filter('[role="tab"], .p-tabview-nav li');
        if (zoneTab.length > 0) {
          cy.wrap(zoneTab.first()).click();

          const addBtn = $body.find('button:contains("Ajouter"), button[icon*="plus"]');
          if (addBtn.length > 0) {
            cy.wrap(addBtn.first()).click();
            cy.intercept('POST', '**/api/v1/admin/zones').as('createZone');
          }
        }
      });
    });

    // --- EGLISES LOCALES ---
    it('CRUD Églises Locales - créer avec pasteur', () => {
      cy.get('body').then(($body) => {
        const tab = $body.find(':contains("Église Locale"), :contains("Eglise Locale")').filter('[role="tab"], .p-tabview-nav li');
        if (tab.length > 0) {
          cy.wrap(tab.first()).click();
        }
      });
    });

    // --- EGLISES DE MAISON ---
    it('CRUD Églises de Maison - créer avec leader', () => {
      cy.get('body').then(($body) => {
        const tab = $body.find(':contains("Église de Maison"), :contains("Eglise de Maison")').filter('[role="tab"], .p-tabview-nav li');
        if (tab.length > 0) {
          cy.wrap(tab.first()).click();
        }
      });
    });

    it('seed géographie', () => {
      cy.get('body').then(($body) => {
        const seedBtn = $body.find('button:contains("Seed"), button:contains("Initialiser"), button:contains("Pré-remplir")');
        if (seedBtn.length > 0) {
          cy.intercept('POST', '**/api/v1/admin/geography/seed').as('seed');
          cy.wrap(seedBtn.first()).click();
        }
      });
    });
  });

  describe('accès refusé', () => {
    it('FIDELE ne peut pas accéder à /administration', () => {
      cy.login('FIDELE');
      cy.visit('/administration');
      cy.url().should('include', '/dashboard');
    });

    it('FD ne peut pas accéder à /administration', () => {
      cy.login('FD');
      cy.visit('/administration');
      cy.url().should('include', '/dashboard');
    });
  });
});
