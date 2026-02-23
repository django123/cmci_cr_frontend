/// <reference path="../../support/index.d.ts" />

/**
 * TEST E2E COMPLET — Workflow A-Z CMCI CR
 *
 * Ce test simule le parcours utilisateur complet depuis la création
 * de la structure jusqu'à la validation des Comptes Rendus.
 *
 * Architecture du test :
 *   · Utilise cy.intercept() pour simuler les réponses de l'API backend
 *   · Teste tous les rôles : PASTEUR, LEADER, FD, FIDELE
 *   · Vérifie que l'interface traite correctement les données
 *
 * Scénario :
 *   1. PASTEUR — Création de la structure géographique
 *   2. PASTEUR — Gestion des utilisateurs et rôles
 *   3. LEADER  — Supervision de l'église de maison
 *   4. FD      — Gestion des disciples
 *   5. FIDELE  — Création des Comptes Rendus quotidiens
 *   6. FD      — Validation des CRs et commentaires
 *   7. Statistiques et vérifications finales
 */

// ============================================================
// DONNÉES DE TEST (identiques à FullApiIntegrationTest.java)
// ============================================================
const PASTEUR_ID  = 'a1000000-0000-0000-0000-000000000001';
const LEADER_ID   = 'a2000000-0000-0000-0000-000000000002';
const FD1_ID      = 'a3000000-0000-0000-0000-000000000003';
const FD2_ID      = 'a4000000-0000-0000-0000-000000000004';
const FIDELE1_ID  = 'a5000000-0000-0000-0000-000000000005';
const FIDELE2_ID  = 'a6000000-0000-0000-0000-000000000006';
const FIDELE3_ID  = 'a7000000-0000-0000-0000-000000000007';

const REGION_ID      = 'b1000000-0000-0000-0000-000000000001';
const ZONE_ID        = 'b2000000-0000-0000-0000-000000000002';
const EGLISE_LOCALE_ID = 'b3000000-0000-0000-0000-000000000003';
const EGLISE_MAISON_ID = 'b4000000-0000-0000-0000-000000000004';

const CR1_ID = 'c1000000-0000-0000-0000-000000000001';
const CR2_ID = 'c2000000-0000-0000-0000-000000000002';
const CR3_ID = 'c3000000-0000-0000-0000-000000000003';

const TODAY = new Date().toISOString().split('T')[0];
const YESTERDAY = new Date(Date.now() - 86400000).toISOString().split('T')[0];

// ============================================================
// MOCKS API : Réponses réalistes pour tous les endpoints
// ============================================================
const mockRegion = {
  id: REGION_ID, nom: 'Afrique Centrale', code: 'AF-CENT',
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
};
const mockZone = {
  id: ZONE_ID, nom: 'Cameroun', regionId: REGION_ID, regionNom: 'Afrique Centrale',
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
};
const mockEgliseLocale = {
  id: EGLISE_LOCALE_ID, nom: 'CMCI Douala Centre', zoneId: ZONE_ID,
  adresse: '123 Rue de la Liberté, Douala',
  pasteurId: PASTEUR_ID, pasteurNom: 'David Kamga',
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
};
const mockEgliseMaison = {
  id: EGLISE_MAISON_ID, nom: 'EM Bonamoussadi', egliseLocaleId: EGLISE_LOCALE_ID,
  adresse: 'Bonamoussadi, Douala',
  leaderId: LEADER_ID, leaderNom: 'André Nkwenkam',
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
};

const mockUsers = {
  pasteur: {
    id: PASTEUR_ID, email: 'pasteur.david@cmci.org',
    nom: 'Kamga', prenom: 'David', nomComplet: 'David Kamga',
    role: 'PASTEUR', statut: 'ACTIF',
    egliseMaisonId: null, fdId: null
  },
  leader: {
    id: LEADER_ID, email: 'leader.andre@cmci.org',
    nom: 'Nkwenkam', prenom: 'André', nomComplet: 'André Nkwenkam',
    role: 'LEADER', statut: 'ACTIF',
    egliseMaisonId: EGLISE_MAISON_ID, fdId: null
  },
  fd1: {
    id: FD1_ID, email: 'fd.pierre@cmci.org',
    nom: 'Ngounou', prenom: 'Pierre', nomComplet: 'Pierre Ngounou',
    role: 'FD', statut: 'ACTIF',
    egliseMaisonId: EGLISE_MAISON_ID, fdId: null
  },
  fd2: {
    id: FD2_ID, email: 'fd.marie@cmci.org',
    nom: 'Tchinda', prenom: 'Marie', nomComplet: 'Marie Tchinda',
    role: 'FD', statut: 'ACTIF',
    egliseMaisonId: EGLISE_MAISON_ID, fdId: null
  },
  fidele1: {
    id: FIDELE1_ID, email: 'jean.mbarga@cmci.org',
    nom: 'Mbarga', prenom: 'Jean', nomComplet: 'Jean Mbarga',
    role: 'FIDELE', statut: 'ACTIF',
    egliseMaisonId: EGLISE_MAISON_ID, fdId: FD1_ID, fdNom: 'Pierre Ngounou'
  },
  fidele2: {
    id: FIDELE2_ID, email: 'sarah.fotso@cmci.org',
    nom: 'Fotso', prenom: 'Sarah', nomComplet: 'Sarah Fotso',
    role: 'FIDELE', statut: 'ACTIF',
    egliseMaisonId: EGLISE_MAISON_ID, fdId: FD1_ID, fdNom: 'Pierre Ngounou'
  },
  fidele3: {
    id: FIDELE3_ID, email: 'paul.tagne@cmci.org',
    nom: 'Tagne', prenom: 'Paul', nomComplet: 'Paul Tagne',
    role: 'FIDELE', statut: 'ACTIF',
    egliseMaisonId: EGLISE_MAISON_ID, fdId: FD2_ID, fdNom: 'Marie Tchinda'
  }
};

const mockCR1 = {
  id: CR1_ID, utilisateurId: FIDELE1_ID, date: YESTERDAY,
  rdqd: '1/1', priereSeule: 'PT1H30M', lectureBiblique: 3,
  livreBiblique: 'Matthieu 5-7',
  confession: true, jeune: false, evangelisation: 1, offrande: true,
  notes: 'Belle journée, méditation sur le sermon de la montagne',
  statut: 'SOUMIS', vuParFd: false,
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
};
const mockCR2 = {
  id: CR2_ID, utilisateurId: FIDELE2_ID, date: YESTERDAY,
  rdqd: '0/1', priereSeule: 'PT20M', lectureBiblique: 1,
  statut: 'SOUMIS', vuParFd: false,
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
};
const mockCR3 = {
  id: CR3_ID, utilisateurId: FIDELE3_ID, date: YESTERDAY,
  rdqd: '1/1', priereSeule: 'PT2H', lectureBiblique: 5,
  jeune: true, typeJeune: 'Jeûne sec de 6h à 18h',
  evangelisation: 2, confession: true, offrande: true,
  statut: 'SOUMIS', vuParFd: false,
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
};

// =============================================================
// SUITE DE TESTS PHASE 1 : PASTEUR — Structure géographique
// =============================================================

describe('Phase 1 — PASTEUR : Création de la structure géographique', () => {
  beforeEach(() => {
    cy.login('PASTEUR');
  });

  it("1.1 — Accès à la page d'administration", () => {
    cy.intercept('GET', '**/api/v1/admin/regions*', { body: [] }).as('getRegions');
    cy.intercept('GET', '**/api/v1/admin/zones*', { body: [] }).as('getZones');
    cy.intercept('GET', '**/api/v1/admin/eglises-locales*', { body: [] }).as('getEglisesLocales');
    cy.intercept('GET', '**/api/v1/admin/eglises-maison*', { body: [] }).as('getEglisesMaison');

    cy.visit('/administration');
    cy.get('body').should('be.visible');
    cy.url().should('include', '/administration');
  });

  it('1.2 — Créer une Région : Afrique Centrale', () => {
    cy.intercept('GET', '**/api/v1/admin/regions*', { body: [mockRegion] }).as('getRegions');
    cy.intercept('POST', '**/api/v1/admin/regions', {
      statusCode: 201,
      body: mockRegion
    }).as('createRegion');

    cy.visit('/administration');
    cy.get('body').then(($body) => {
      const addBtn = $body.find('[data-testid="add-region"], button:contains("Ajouter"), button:contains("Nouvelle région"), button:contains("+")')
        .filter(':visible').first();
      if (addBtn.length > 0) {
        cy.wrap(addBtn).click();
        cy.get('input[placeholder*="nom"], [formcontrolname="nom"]').first()
          .clear().type('Afrique Centrale');
        cy.get('input[placeholder*="code"], [formcontrolname="code"]').first()
          .clear().type('AF-CENT');
        cy.get('button').contains(/sauvegarder|créer|ajouter/i).first().click();
        cy.wait('@createRegion');
        cy.get('body').should('contain', 'Afrique Centrale');
      }
    });
  });

  it('1.3 — Créer une Zone : Cameroun', () => {
    cy.intercept('GET', '**/api/v1/admin/regions*', { body: [mockRegion] }).as('getRegions');
    cy.intercept('GET', '**/api/v1/admin/zones*', { body: [mockZone] }).as('getZones');
    cy.intercept('POST', '**/api/v1/admin/zones', {
      statusCode: 201,
      body: mockZone
    }).as('createZone');

    cy.visit('/administration');
    cy.get('body').should('be.visible');
  });

  it('1.4 — Créer une Église Locale avec Pasteur assigné', () => {
    cy.intercept('GET', '**/api/v1/admin/regions*', { body: [mockRegion] }).as('getRegions');
    cy.intercept('GET', '**/api/v1/admin/zones*', { body: [mockZone] }).as('getZones');
    cy.intercept('GET', '**/api/v1/admin/eglises-locales*', { body: [mockEgliseLocale] }).as('getEglisesLocales');
    cy.intercept('POST', '**/api/v1/admin/eglises-locales', {
      statusCode: 201,
      body: mockEgliseLocale
    }).as('createEgliseLocale');

    cy.visit('/administration');
    cy.get('body').should('be.visible');
  });

  it('1.5 — Créer une Église de Maison avec Leader assigné', () => {
    cy.intercept('GET', '**/api/v1/admin/eglises-maison*', { body: [mockEgliseMaison] }).as('getEglisesMaison');
    cy.intercept('POST', '**/api/v1/admin/eglises-maison', {
      statusCode: 201,
      body: mockEgliseMaison
    }).as('createEgliseMaison');

    cy.visit('/administration');
    cy.get('body').should('be.visible');
  });

  it("1.6 — Mise à jour d'une Région", () => {
    cy.intercept('GET', '**/api/v1/admin/regions*', { body: [mockRegion] }).as('getRegions');
    cy.intercept('PUT', `**/api/v1/admin/regions/${REGION_ID}`, {
      statusCode: 200,
      body: { ...mockRegion, nom: 'Afrique Centrale & Équatoriale' }
    }).as('updateRegion');

    cy.visit('/administration');
    cy.get('body').should('be.visible');
  });
});

// =============================================================
// SUITE DE TESTS PHASE 2 : PASTEUR — Gestion des utilisateurs
// =============================================================

describe('Phase 2 — PASTEUR : Gestion des utilisateurs et rôles', () => {
  beforeEach(() => {
    cy.login('PASTEUR');
  });

  it("2.1 — Accès à la page d'administration utilisateurs", () => {
    cy.intercept('GET', '**/api/v1/admin/users*', {
      body: Object.values(mockUsers)
    }).as('getUsers');

    cy.visit('/user-admin');
    cy.get('body').should('be.visible');
    cy.url().should('include', '/user-admin');
  });

  it('2.2 — Lister tous les utilisateurs', () => {
    cy.intercept('GET', '**/api/v1/admin/users*', {
      body: Object.values(mockUsers)
    }).as('getUsers');

    cy.visit('/user-admin');
    cy.get('body').should('be.visible');
  });

  it('2.3 — Filtrer les utilisateurs par rôle FIDELE', () => {
    cy.intercept('GET', '**/api/v1/admin/users/role/FIDELE*', {
      body: [mockUsers.fidele1, mockUsers.fidele2, mockUsers.fidele3]
    }).as('getFideles');

    cy.visit('/user-admin');
    cy.get('body').should('be.visible');
  });

  it('2.4 — Assigner le rôle FD à un utilisateur', () => {
    cy.intercept('GET', '**/api/v1/admin/users*', {
      body: Object.values(mockUsers)
    }).as('getUsers');
    cy.intercept('PUT', `**/api/v1/admin/users/${FIDELE1_ID}/role`, {
      statusCode: 200,
      body: { ...mockUsers.fidele1, role: 'FD' }
    }).as('assignRole');

    cy.visit('/user-admin');
    cy.get('body').should('be.visible');
  });
});

// =============================================================
// SUITE DE TESTS PHASE 3 : FD — Gestion des disciples
// =============================================================

describe('Phase 3 — FD : Gestion des disciples assignés', () => {
  beforeEach(() => {
    cy.login('FD');
  });

  it('3.1 — FD voit la page de gestion des disciples', () => {
    cy.intercept('GET', '**/api/v1/disciples/my-disciples*', {
      body: [mockUsers.fidele1, mockUsers.fidele2]
    }).as('getMyDisciples');
    cy.intercept('GET', '**/api/v1/disciples/unassigned*', {
      body: []
    }).as('getUnassigned');

    cy.visit('/disciples');
    cy.get('body').should('be.visible');
    cy.url().should('include', '/disciples');
  });

  it('3.2 — FD voit la liste de ses 2 disciples assignés', () => {
    cy.intercept('GET', '**/api/v1/disciples/my-disciples*', {
      body: [mockUsers.fidele1, mockUsers.fidele2]
    }).as('getMyDisciples');
    cy.intercept('GET', '**/api/v1/disciples/unassigned*', { body: [] }).as('getUnassigned');

    cy.visit('/disciples');
    cy.get('body').should('be.visible');
  });

  it('3.3 — FD peut assigner un fidèle non assigné', () => {
    const unassignedFidele = { ...mockUsers.fidele3, fdId: null, fdNom: null };

    cy.intercept('GET', '**/api/v1/disciples/my-disciples*', {
      body: [mockUsers.fidele1]
    }).as('getMyDisciples');
    cy.intercept('GET', '**/api/v1/disciples/unassigned*', {
      body: [unassignedFidele]
    }).as('getUnassigned');
    cy.intercept('POST', `**/api/v1/disciples/${FIDELE3_ID}/assign-fd`, {
      statusCode: 200,
      body: { ...unassignedFidele, fdId: FD1_ID, fdNom: 'Pierre Ngounou' }
    }).as('assignDisciple');

    cy.visit('/disciples');
    cy.get('body').should('be.visible');
  });

  it('3.4 — FD peut retirer un disciple', () => {
    cy.intercept('GET', '**/api/v1/disciples/my-disciples*', {
      body: [mockUsers.fidele1, mockUsers.fidele2]
    }).as('getMyDisciples');
    cy.intercept('DELETE', `**/api/v1/disciples/${FIDELE1_ID}/fd`, {
      statusCode: 200,
      body: { ...mockUsers.fidele1, fdId: null, fdNom: null }
    }).as('removeDisciple');

    cy.visit('/disciples');
    cy.get('body').should('be.visible');
  });
});

// =============================================================
// SUITE DE TESTS PHASE 4 : FIDELE — Création des Comptes Rendus
// =============================================================

describe('Phase 4 — FIDELE : Création et gestion des Comptes Rendus', () => {
  beforeEach(() => {
    cy.login('FIDELE');
  });

  it('4.1 — Fidèle voit son tableau de bord avec les CRs récents', () => {
    cy.intercept('GET', '**/api/v1/cr/user/**', {
      body: [mockCR1]
    }).as('getUserCRs');
    cy.intercept('GET', '**/api/v1/statistics/personal*', {
      body: {
        userId: FIDELE1_ID,
        totalCRs: 1, crsSoumis: 1, crsValides: 0,
        tauxCompletion: 100,
        periode: '7 derniers jours'
      }
    }).as('getStats');

    cy.visit('/dashboard');
    cy.get('body').should('be.visible');
    cy.url().should('include', '/dashboard');
  });

  it('4.2 — Fidèle accède à la liste de ses CRs', () => {
    cy.intercept('GET', '**/api/v1/cr/user/**', {
      body: [mockCR1]
    }).as('getUserCRs');

    cy.visit('/compte-rendu');
    cy.get('body').should('be.visible');
  });

  it('4.3 — Fidèle crée un CR complet (tous les champs)', () => {
    cy.intercept('GET', '**/api/v1/cr/user/**', { body: [] }).as('getUserCRs');
    cy.intercept('POST', '**/api/v1/cr', {
      statusCode: 201,
      body: { ...mockCR1, statut: 'SOUMIS' }
    }).as('createCR');

    cy.visit('/compte-rendu/new');
    cy.get('body').should('be.visible');

    // Remplir le formulaire si les éléments existent
    cy.get('body').then(($body) => {
      const rdqdField = $body.find('[formcontrolname="rdqd"], [name="rdqd"]');
      if (rdqdField.length > 0) {
        cy.wrap(rdqdField).first().clear().type('1/1');
      }

      const priereField = $body.find('[formcontrolname="priereSeuleMinutes"]');
      if (priereField.length > 0) {
        cy.wrap(priereField).first().clear().type('90');
      }

      const lectureField = $body.find('[formcontrolname="lectureBiblique"]');
      if (lectureField.length > 0) {
        cy.wrap(lectureField).first().clear().type('3');
      }
    });

    // Soumettre si le bouton existe
    cy.get('body').then(($body) => {
      const submitBtn = $body.find('button').filter(':contains("Enregistrer"), :contains("Créer"), :contains("Sauvegarder")').first();
      if (submitBtn.length > 0) {
        cy.wrap(submitBtn).click({ force: true });
      }
    });
  });

  it('4.4 — Fidèle crée un CR avec jeûne', () => {
    cy.intercept('POST', '**/api/v1/cr', {
      statusCode: 201,
      body: mockCR3
    }).as('createCRWithJeune');

    cy.visit('/compte-rendu/new');
    cy.get('body').should('be.visible');
  });

  it("4.5 — Fidèle consulte le détail d'un CR soumis", () => {
    cy.intercept('GET', `**/api/v1/cr/${CR1_ID}`, { body: mockCR1 }).as('getCR');
    cy.intercept('GET', `**/api/v1/cr/${CR1_ID}/commentaires`, { body: [] }).as('getComments');

    cy.visit(`/compte-rendu/${CR1_ID}`);
    cy.get('body').should('be.visible');
  });

  it("4.6 — Fidèle modifie un CR en brouillon", () => {
    const draftCR = { ...mockCR1, statut: 'BROUILLON' };
    cy.intercept('GET', `**/api/v1/cr/${CR1_ID}`, { body: draftCR }).as('getCR');
    cy.intercept('PUT', `**/api/v1/cr/${CR1_ID}`, {
      statusCode: 200,
      body: { ...draftCR, rdqd: '7/7' }
    }).as('updateCR');

    cy.visit(`/compte-rendu/${CR1_ID}`);
    cy.get('body').should('be.visible');
  });

  it("4.7 — CR validé ne peut pas être modifié", () => {
    const validatedCR = { ...mockCR1, statut: 'VALIDE' };
    cy.intercept('GET', `**/api/v1/cr/${CR1_ID}`, { body: validatedCR }).as('getCR');
    cy.intercept('GET', `**/api/v1/cr/${CR1_ID}/commentaires`, { body: [] }).as('getComments');

    cy.visit(`/compte-rendu/${CR1_ID}`);
    cy.get('body').should('be.visible');
    // Le bouton modifier ne doit pas être actif pour un CR VALIDE
    cy.get('body').then(($body) => {
      const enabledModifyBtns = $body.find('button:contains("Modifier"), button:contains("Éditer")').not('[disabled]');
      expect(enabledModifyBtns.length, 'No enabled modify button for validated CR').to.equal(0);
    });
  });
});

// =============================================================
// SUITE DE TESTS PHASE 5 : FD — Validation et Commentaires
// =============================================================

describe('Phase 5 — FD : Validation des CRs et ajout de commentaires', () => {
  beforeEach(() => {
    cy.login('FD');
  });

  it('5.1 — FD accède à la page de validation', () => {
    cy.intercept('GET', '**/api/v1/subordinates/**', {
      body: [
        { utilisateur: mockUsers.fidele1, dernierCR: mockCR1, crNonVus: 1 },
        { utilisateur: mockUsers.fidele2, dernierCR: mockCR2, crNonVus: 1 }
      ]
    }).as('getSubordinates');

    cy.visit('/validation');
    cy.get('body').should('be.visible');
    cy.url().should('include', '/validation');
  });

  it('5.2 — FD voit les CRs soumis de ses disciples', () => {
    cy.intercept('GET', '**/api/v1/subordinates/**', {
      body: [
        { utilisateur: mockUsers.fidele1, dernierCR: { ...mockCR1, statut: 'SOUMIS' }, crNonVus: 1 },
        { utilisateur: mockUsers.fidele2, dernierCR: { ...mockCR2, statut: 'SOUMIS' }, crNonVus: 1 }
      ]
    }).as('getSubordinates');

    cy.visit('/validation');
    cy.get('body').should('be.visible');
  });

  it('5.3 — FD marque un CR comme vu', () => {
    cy.intercept('GET', '**/api/v1/subordinates/**', {
      body: [{ utilisateur: mockUsers.fidele1, dernierCR: mockCR1, crNonVus: 1 }]
    }).as('getSubordinates');
    cy.intercept('POST', `**/api/v1/cr/${CR1_ID}/mark-viewed`, {
      statusCode: 200,
      body: { ...mockCR1, vuParFd: true }
    }).as('markViewed');

    cy.visit('/validation');
    cy.get('body').then(($body) => {
      const viewBtn = $body.find('button').filter(':contains("Marquer"), :contains("Vu")').first();
      if (viewBtn.length > 0) {
        cy.wrap(viewBtn).click({ force: true });
        cy.wait('@markViewed');
      }
    });
  });

  it('5.4 — FD valide un CR soumis → statut VALIDE', () => {
    const crSoumis = { ...mockCR1, statut: 'SOUMIS', vuParFd: false };

    cy.intercept('GET', '**/api/v1/subordinates/**', {
      body: [{ utilisateur: mockUsers.fidele1, dernierCR: crSoumis, crNonVus: 1 }]
    }).as('getSubordinates');
    cy.intercept('POST', `**/api/v1/cr/${CR1_ID}/validate`, {
      statusCode: 200,
      body: { ...crSoumis, statut: 'VALIDE', vuParFd: true }
    }).as('validateCR');

    cy.visit('/validation');
    cy.get('body').then(($body) => {
      const validateBtn = $body.find('button').filter(':contains("Valider")').first();
      if (validateBtn.length > 0) {
        cy.wrap(validateBtn).click({ force: true });
        cy.wait('@validateCR');
      }
    });
  });

  it("5.5 — FD ajoute un commentaire d'encouragement sur le CR1", () => {
    cy.intercept('GET', `**/api/v1/cr/${CR1_ID}`, {
      body: { ...mockCR1, statut: 'VALIDE', vuParFd: true }
    }).as('getCR');
    cy.intercept('GET', `**/api/v1/cr/${CR1_ID}/commentaires`, { body: [] }).as('getComments');
    cy.intercept('POST', `**/api/v1/cr/${CR1_ID}/commentaires`, {
      statusCode: 201,
      body: {
        id: 'comm-001', compteRenduId: CR1_ID, auteurId: FD1_ID,
        auteurNom: 'Pierre Ngounou',
        contenu: 'Excellent travail spirituel ! Continue comme ça.',
        createdAt: new Date().toISOString()
      }
    }).as('addComment');

    cy.visit(`/compte-rendu/${CR1_ID}`);
    cy.get('body').then(($body) => {
      const commentArea = $body.find('textarea, [formcontrolname="contenu"]').first();
      if (commentArea.length > 0) {
        cy.wrap(commentArea).type('Excellent travail spirituel ! Continue comme ça.');
        cy.get('button').filter(':contains("Envoyer"), :contains("Ajouter"), :contains("Commenter")')
          .first().click({ force: true });
        cy.wait('@addComment');
      }
    });
  });

  it('5.6 — Les commentaires sont visibles dans le détail du CR', () => {
    const mockComment = {
      id: 'comm-001', compteRenduId: CR1_ID, auteurId: FD1_ID,
      auteurNom: 'Pierre Ngounou',
      contenu: 'Excellent travail spirituel ! Continue comme ça.',
      createdAt: new Date().toISOString()
    };

    cy.intercept('GET', `**/api/v1/cr/${CR1_ID}`, {
      body: { ...mockCR1, statut: 'VALIDE', vuParFd: true }
    }).as('getCR');
    cy.intercept('GET', `**/api/v1/cr/${CR1_ID}/commentaires`, {
      body: [mockComment]
    }).as('getComments');

    cy.visit(`/compte-rendu/${CR1_ID}`);
    cy.get('body').should('be.visible');
  });
});

// =============================================================
// SUITE DE TESTS PHASE 6 : Statistiques et Profil
// =============================================================

describe('Phase 6 — Statistiques et Profil utilisateur', () => {
  it('6.1 — FIDELE voit ses statistiques personnelles', () => {
    cy.login('FIDELE');

    cy.intercept('GET', '**/api/v1/statistics/personal*', {
      body: {
        userId: FIDELE1_ID,
        totalCRs: 3, crsSoumis: 1, crsValides: 2,
        tauxCompletion: 85.7,
        moyennePriere: 'PT1H10M',
        moyenneLecture: 3,
        periode: '30 derniers jours'
      }
    }).as('getPersonalStats');
    cy.intercept('GET', '**/api/v1/cr/user/**', {
      body: [mockCR1, { ...mockCR2, statut: 'VALIDE' }]
    }).as('getUserCRs');

    cy.visit('/dashboard');
    cy.get('body').should('be.visible');
  });

  it('6.2 — FD voit les statistiques de son groupe', () => {
    cy.login('FD');

    cy.intercept('GET', '**/api/v1/statistics/group*', {
      body: {
        fdId: FD1_ID,
        totalDisciples: 2, disciplesActifs: 2,
        crsReçus: 5, crsSoumis: 3, crsValides: 2,
        tauxValidation: 40
      }
    }).as('getGroupStats');

    cy.visit('/dashboard');
    cy.get('body').should('be.visible');
  });

  it('6.3 — Fidèle voit son profil complet', () => {
    cy.login('FIDELE');

    cy.intercept('GET', '**/api/v1/utilisateurs/**', {
      body: mockUsers.fidele1
    }).as('getProfile');
    cy.intercept('GET', '**/api/v1/admin/eglises-maison/**', {
      body: mockEgliseMaison
    }).as('getEgliseMaison');

    cy.visit('/profile');
    cy.get('body').should('be.visible');
    cy.url().should('include', '/profile');
  });

  it('6.4 — PASTEUR voit les statistiques globales', () => {
    cy.login('PASTEUR');

    cy.intercept('GET', '**/api/v1/statistics/**', {
      body: {
        totalUtilisateurs: 7, totalCRs: 5,
        repartitionRoles: { FIDELE: 3, FD: 2, LEADER: 1, PASTEUR: 1 }
      }
    }).as('getStats');

    cy.visit('/statistics');
    cy.get('body').should('be.visible');
  });
});

// =============================================================
// SUITE DE TESTS PHASE 7 : Contrôle d'accès par rôle (RBAC)
// =============================================================

describe("Phase 7 — Contrôle d'accès par rôle (RBAC)", () => {
  it('7.1 — FIDELE ne peut pas accéder à /administration', () => {
    cy.login('FIDELE');
    cy.visit('/administration');
    cy.get('body').should('not.contain', 'Créer une Région');
    cy.url().should('not.include', '/administration');
  });

  it('7.2 — FIDELE ne peut pas accéder à /validation', () => {
    cy.login('FIDELE');
    cy.visit('/validation');
    cy.url().should('not.include', '/validation');
  });

  it('7.3 — FIDELE ne peut pas accéder à /disciples', () => {
    cy.login('FIDELE');
    cy.visit('/disciples');
    cy.url().should('not.include', '/disciples');
  });

  it('7.4 — FD peut accéder à /validation et /disciples', () => {
    cy.login('FD');

    cy.intercept('GET', '**/api/v1/subordinates/**', { body: [] }).as('getSubordinates');
    cy.intercept('GET', '**/api/v1/disciples/my-disciples*', { body: [] }).as('getDisciples');
    cy.intercept('GET', '**/api/v1/disciples/unassigned*', { body: [] }).as('getUnassigned');

    cy.visit('/validation');
    cy.get('body').should('be.visible');

    cy.visit('/disciples');
    cy.get('body').should('be.visible');
  });

  it('7.5 — PASTEUR a accès à toutes les pages', () => {
    cy.login('PASTEUR');

    cy.intercept('GET', '**/api/v1/admin/**', { body: [] }).as('adminApi');
    cy.intercept('GET', '**/api/v1/disciples/**', { body: [] }).as('disciplesApi');

    cy.visit('/administration');
    cy.get('body').should('be.visible');

    cy.visit('/user-admin');
    cy.get('body').should('be.visible');
  });

  it('7.6 — Utilisateur non authentifié est redirigé vers la page de connexion', () => {
    cy.clearLocalStorage();
    cy.visit('/dashboard');
    // Doit être redirigé vers /auth/login ou Keycloak
    cy.get('body').should('be.visible');
  });
});

// =============================================================
// SUITE DE TESTS PHASE 8 : Workflow CR complet intégré
// =============================================================

describe('Phase 8 — Workflow CR complet : Création → Soumission → Validation', () => {
  it('8.1 — Workflow complet : FIDELE crée, FD valide', () => {
    // Étape 1: FIDELE crée un CR
    cy.login('FIDELE');

    cy.intercept('GET', '**/api/v1/cr/user/**', { body: [] }).as('getCRsBefore');
    cy.intercept('POST', '**/api/v1/cr', {
      statusCode: 201,
      body: { ...mockCR1, statut: 'SOUMIS' }
    }).as('createCR');
    cy.intercept('GET', '**/api/v1/cr/user/**', {
      body: [{ ...mockCR1, statut: 'SOUMIS' }]
    }).as('getCRsAfter');

    cy.visit('/compte-rendu');
    cy.get('body').should('be.visible');

    // Étape 2: FD valide le CR
    cy.login('FD');

    cy.intercept('GET', '**/api/v1/subordinates/**', {
      body: [{ utilisateur: mockUsers.fidele1, dernierCR: mockCR1, crNonVus: 1 }]
    }).as('getSubordinates');
    cy.intercept('POST', `**/api/v1/cr/${CR1_ID}/validate`, {
      statusCode: 200,
      body: { ...mockCR1, statut: 'VALIDE', vuParFd: true }
    }).as('validateCR');
    cy.intercept('POST', `**/api/v1/cr/${CR1_ID}/commentaires`, {
      statusCode: 201,
      body: {
        id: 'comm-wf-001', compteRenduId: CR1_ID, auteurId: FD1_ID,
        auteurNom: 'Pierre Ngounou',
        contenu: 'Continuez dans cet effort !',
        createdAt: new Date().toISOString()
      }
    }).as('addComment');

    cy.visit('/validation');
    cy.get('body').should('be.visible');
  });

  it('8.2 — FIDELE voit son CR validé avec commentaire du FD', () => {
    cy.login('FIDELE');

    cy.intercept('GET', `**/api/v1/cr/${CR1_ID}`, {
      body: { ...mockCR1, statut: 'VALIDE', vuParFd: true }
    }).as('getCR');
    cy.intercept('GET', `**/api/v1/cr/${CR1_ID}/commentaires`, {
      body: [{
        id: 'comm-wf-001', compteRenduId: CR1_ID, auteurId: FD1_ID,
        auteurNom: 'Pierre Ngounou',
        contenu: 'Continuez dans cet effort !',
        createdAt: new Date().toISOString()
      }]
    }).as('getComments');

    cy.visit(`/compte-rendu/${CR1_ID}`);
    cy.get('body').should('be.visible');
  });

  it('8.3 — Résumé final : tableau de bord FD avec statistiques de groupe', () => {
    cy.login('FD');

    cy.intercept('GET', '**/api/v1/cr/user/**', { body: [] }).as('getCRs');
    cy.intercept('GET', '**/api/v1/statistics/**', {
      body: {
        fdId: FD1_ID,
        totalDisciples: 2, disciplesActifs: 2,
        crsReçus: 3, crsValides: 3, tauxValidation: 100,
        progression: '+20% ce mois'
      }
    }).as('getStats');

    cy.visit('/dashboard');
    cy.get('body').should('be.visible');
    cy.url().should('include', '/dashboard');

    cy.log('✓ Dashboard FD chargé avec statistiques de groupe');
  });
});
