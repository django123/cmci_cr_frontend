import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DisciplesFacade } from './disciples.facade';
import { DiscipleHttpRepository } from '../../../infrastructure/repositories';
import { Disciple } from '../../../domain/models';
import { Role, StatutUtilisateur } from '../../../domain/enums';

describe('DisciplesFacade', () => {
  let facade: DisciplesFacade;
  let mockRepository: jasmine.SpyObj<DiscipleHttpRepository>;

  const createMockDisciple = (overrides: Partial<Disciple> = {}): Disciple => ({
    id: 'disc-001',
    email: 'jean@cmci.org',
    nom: 'Dupont',
    prenom: 'Jean',
    nomComplet: 'Jean Dupont',
    role: Role.FIDELE,
    statut: StatutUtilisateur.ACTIF,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  });

  beforeEach(() => {
    mockRepository = jasmine.createSpyObj('DiscipleHttpRepository', [
      'getByFD', 'getMyDisciples', 'getUnassigned', 'assignToFD', 'removeFromFD', 'countByFD'
    ]);

    TestBed.configureTestingModule({
      providers: [
        DisciplesFacade,
        { provide: DiscipleHttpRepository, useValue: mockRepository }
      ]
    });

    facade = TestBed.inject(DisciplesFacade);
  });

  describe('loadDisciplesByFD', () => {
    it('should load disciples of a specific FD', () => {
      const disciples = [
        createMockDisciple({ id: 'd-1', fdId: 'fd-001' }),
        createMockDisciple({ id: 'd-2', fdId: 'fd-001' })
      ];
      mockRepository.getByFD.and.returnValue(of(disciples));

      facade.loadDisciplesByFD('fd-001');

      facade.disciples$.subscribe(result => {
        expect(result.length).toBe(2);
      });
      expect(mockRepository.getByFD).toHaveBeenCalledWith('fd-001');
    });
  });

  describe('loadMyDisciples', () => {
    it('should load current user disciples', () => {
      const disciples = [createMockDisciple()];
      mockRepository.getMyDisciples.and.returnValue(of(disciples));

      facade.loadMyDisciples();

      facade.myDisciples$.subscribe(result => {
        expect(result.length).toBe(1);
      });
    });
  });

  describe('loadUnassignedDisciples', () => {
    it('should load unassigned disciples', () => {
      const disciples = [
        createMockDisciple({ id: 'd-1' }),
        createMockDisciple({ id: 'd-2' })
      ];
      mockRepository.getUnassigned.and.returnValue(of(disciples));

      facade.loadUnassignedDisciples();

      facade.unassigned$.subscribe(result => {
        expect(result.length).toBe(2);
      });
    });
  });

  describe('assignToFD', () => {
    it('should assign a disciple to a FD and update lists', () => {
      const assigned = createMockDisciple({ id: 'd-1', fdId: 'fd-001', fdNom: 'Pierre' });
      mockRepository.assignToFD.and.returnValue(of(assigned));

      // Load unassigned first
      const unassigned = [createMockDisciple({ id: 'd-1' })];
      mockRepository.getUnassigned.and.returnValue(of(unassigned));
      facade.loadUnassignedDisciples();

      facade.assignToFD('d-1', 'fd-001').subscribe(result => {
        expect(result.fdId).toBe('fd-001');
      });

      // Should be removed from unassigned
      facade.unassigned$.subscribe(result => {
        expect(result.find(d => d.id === 'd-1')).toBeFalsy();
      });
    });
  });

  describe('removeFromFD', () => {
    it('should remove FD assignment and update lists', () => {
      const removed = createMockDisciple({ id: 'd-1', fdId: undefined, fdNom: undefined });
      mockRepository.removeFromFD.and.returnValue(of(removed));

      facade.removeFromFD('d-1').subscribe(result => {
        expect(result.fdId).toBeUndefined();
      });
    });
  });

  describe('countDisciplesByFD', () => {
    it('should return count of disciples', () => {
      mockRepository.countByFD.and.returnValue(of(5));

      facade.countDisciplesByFD('fd-001').subscribe(count => {
        expect(count).toBe(5);
      });
    });
  });

  describe('selectDisciple', () => {
    it('should select a disciple', (done) => {
      const disciple = createMockDisciple();
      facade.selectDisciple(disciple);
      facade.selectedDisciple$.subscribe(selected => {
        expect(selected).toEqual(disciple);
        done();
      });
    });

    it('should deselect a disciple', (done) => {
      facade.selectDisciple(null);
      facade.selectedDisciple$.subscribe(selected => {
        expect(selected).toBeNull();
        done();
      });
    });
  });

  describe('clear', () => {
    it('should reset all state', () => {
      // Load some data first
      mockRepository.getMyDisciples.and.returnValue(of([createMockDisciple()]));
      facade.loadMyDisciples();

      // Then clear
      facade.clear();

      facade.disciples$.subscribe(d => expect(d.length).toBe(0));
      facade.myDisciples$.subscribe(d => expect(d.length).toBe(0));
      facade.unassigned$.subscribe(d => expect(d.length).toBe(0));
      facade.selectedDisciple$.subscribe(d => expect(d).toBeNull());
      facade.error$.subscribe(e => expect(e).toBeNull());
      facade.loading$.subscribe(l => expect(l).toBe(false));
    });
  });
});
