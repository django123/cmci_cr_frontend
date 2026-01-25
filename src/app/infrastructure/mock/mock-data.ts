import { CompteRendu } from '../../domain/models';
import { Commentaire } from '../../domain/models';
import { StatutCR } from '../../domain/enums';

/**
 * Données mock pour le développement et tests
 * Basées sur les données seed de la BD
 */

export const MOCK_COMPTES_RENDUS: CompteRendu[] = [
  {
    id: 'f1000000-0000-0000-0000-000000000001',
    utilisateurId: 'd1000000-0000-0000-0000-000000000030',
    date: new Date('2026-01-20'),
    rdqd: '1/1',
    priereSeule: '00:45:00',
    priereCouple: undefined,
    priereAvecEnfants: undefined,
    priereAutres: 2,
    lectureBiblique: 3,
    livreBiblique: 'Psaumes',
    litteraturePages: 15,
    litteratureTotal: 200,
    litteratureTitre: 'La vie chrétienne normale',
    confession: true,
    jeune: false,
    typeJeune: undefined,
    evangelisation: 1,
    offrande: true,
    notes: 'Très bonne journée de communion avec le Seigneur.',
    statut: StatutCR.SOUMIS,
    vuParFd: true,
    createdAt: new Date('2026-01-20T08:00:00'),
    updatedAt: new Date('2026-01-20T20:00:00')
  },
  {
    id: 'f1000000-0000-0000-0000-000000000002',
    utilisateurId: 'd1000000-0000-0000-0000-000000000030',
    date: new Date('2026-01-19'),
    rdqd: '1/1',
    priereSeule: '01:00:00',
    priereCouple: undefined,
    priereAvecEnfants: undefined,
    priereAutres: 1,
    lectureBiblique: 5,
    livreBiblique: 'Matthieu',
    litteraturePages: 20,
    litteratureTotal: 200,
    litteratureTitre: 'La vie chrétienne normale',
    confession: false,
    jeune: true,
    typeJeune: 'Jeûne de Daniel',
    evangelisation: 0,
    offrande: false,
    notes: 'Journée de jeûne et prière intense.',
    statut: StatutCR.VALIDE,
    vuParFd: true,
    createdAt: new Date('2026-01-19T07:00:00'),
    updatedAt: new Date('2026-01-19T21:00:00')
  },
  {
    id: 'f1000000-0000-0000-0000-000000000003',
    utilisateurId: 'd1000000-0000-0000-0000-000000000030',
    date: new Date('2026-01-18'),
    rdqd: '1/1',
    priereSeule: '00:30:00',
    priereCouple: undefined,
    priereAvecEnfants: undefined,
    priereAutres: 0,
    lectureBiblique: 2,
    livreBiblique: 'Romains',
    litteraturePages: 10,
    litteratureTotal: 150,
    litteratureTitre: 'Le combat spirituel',
    confession: true,
    jeune: false,
    typeJeune: undefined,
    evangelisation: 2,
    offrande: true,
    notes: 'Partage de l\'évangile avec deux collègues.',
    statut: StatutCR.SOUMIS,
    vuParFd: false,
    createdAt: new Date('2026-01-18T06:30:00'),
    updatedAt: new Date('2026-01-18T19:00:00')
  },
  {
    id: 'f1000000-0000-0000-0000-000000000004',
    utilisateurId: 'd1000000-0000-0000-0000-000000000030',
    date: new Date('2026-01-17'),
    rdqd: '1/1',
    priereSeule: '00:40:00',
    priereCouple: undefined,
    priereAvecEnfants: undefined,
    priereAutres: 3,
    lectureBiblique: 4,
    livreBiblique: 'Jean',
    litteraturePages: 25,
    litteratureTotal: 200,
    litteratureTitre: 'La vie chrétienne normale',
    confession: false,
    jeune: false,
    typeJeune: undefined,
    evangelisation: 0,
    offrande: true,
    notes: 'Méditation profonde sur l\'évangile de Jean.',
    statut: StatutCR.VALIDE,
    vuParFd: true,
    createdAt: new Date('2026-01-17T05:30:00'),
    updatedAt: new Date('2026-01-17T22:00:00')
  }
];

export const MOCK_COMMENTAIRES: Commentaire[] = [
  {
    id: 'c1000000-0000-0000-0000-000000000001',
    compteRenduId: 'f1000000-0000-0000-0000-000000000001',
    auteurId: 'd1000000-0000-0000-0000-000000000020',
    auteurNom: 'FD',
    auteurPrenom: 'Marie',
    contenu: 'Excellent travail ! Continue ainsi dans la prière.',
    createdAt: new Date('2026-01-20T21:00:00')
  },
  {
    id: 'c1000000-0000-0000-0000-000000000002',
    compteRenduId: 'f1000000-0000-0000-0000-000000000002',
    auteurId: 'd1000000-0000-0000-0000-000000000020',
    auteurNom: 'FD',
    auteurPrenom: 'Marie',
    contenu: 'Le jeûne est une pratique bénie. Que Dieu te fortifie !',
    createdAt: new Date('2026-01-19T22:00:00')
  }
];

/**
 * Génère un nouvel ID unique
 */
export function generateMockId(): string {
  return 'mock-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}
