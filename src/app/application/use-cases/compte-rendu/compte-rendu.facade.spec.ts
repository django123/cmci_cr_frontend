import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CompteRenduFacade } from './compte-rendu.facade';
import { CompteRenduHttpRepository } from '../../../infrastructure/repositories';
import { AuthService } from '../../../infrastructure/auth';
import { CompteRendu } from '../../../domain/models';
import { StatutCR } from '../../../domain/enums';

describe('CompteRenduFacade', () => {
  let facade: CompteRenduFacade;
  let mockRepository: jasmine.SpyObj<CompteRenduHttpRepository>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const createMockCR = (overrides: Partial<CompteRendu> = {}): CompteRendu => ({
    id: 'cr-001',
    utilisateurId: 'user-001',
    date: new Date('2026-02-15'),
    rdqd: '1/1',
    priereSeule: '01:30',
    confession: true,
    jeune: false,
    offrande: true,
    statut: StatutCR.BROUILLON,
    vuParFd: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  });

  const mockUser = {
    id: 'user-001',
    email: 'jean@cmci.org',
    nom: 'Dupont',
    prenom: 'Jean',
    role: 'FIDELE' as any,
    statut: 'ACTIF' as any,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    mockRepository = jasmine.createSpyObj('CompteRenduHttpRepository', [
      'getById', 'getByUserId', 'getByUserIdAndPeriod',
      'create', 'update', 'delete', 'submit', 'validate', 'markAsViewed'
    ]);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);

    TestBed.configureTestingModule({
      providers: [
        CompteRenduFacade,
        { provide: CompteRenduHttpRepository, useValue: mockRepository },
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    facade = TestBed.inject(CompteRenduFacade);
  });

  describe('loadMyCompteRendus', () => {
    it('should load CRs for the current user', () => {
      const crs = [createMockCR(), createMockCR({ id: 'cr-002' })];
      mockAuthService.getCurrentUser.and.returnValue(of(mockUser));
      mockRepository.getByUserId.and.returnValue(of(crs));

      facade.loadMyCompteRendus();

      facade.comptesRendus$.subscribe(result => {
        expect(result.length).toBe(2);
      });
      expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
      expect(mockRepository.getByUserId).toHaveBeenCalledWith('user-001');
    });

    it('should set loading state during load', () => {
      mockAuthService.getCurrentUser.and.returnValue(of(mockUser));
      mockRepository.getByUserId.and.returnValue(of([]));

      let loadingStates: boolean[] = [];
      facade.loading$.subscribe(l => loadingStates.push(l));

      facade.loadMyCompteRendus();

      // Should have been true at some point
      expect(loadingStates).toContain(true);
    });
  });

  describe('loadCompteRendusForUser', () => {
    it('should load CRs for a specific user', () => {
      const crs = [createMockCR({ utilisateurId: 'user-002' })];
      mockRepository.getByUserId.and.returnValue(of(crs));

      facade.loadCompteRendusForUser('user-002');

      facade.comptesRendus$.subscribe(result => {
        expect(result.length).toBe(1);
        expect(result[0].utilisateurId).toBe('user-002');
      });
    });
  });

  describe('loadCompteRendusForUsers', () => {
    it('should set empty list for empty userIds', () => {
      facade.loadCompteRendusForUsers([]);

      facade.comptesRendus$.subscribe(result => {
        expect(result.length).toBe(0);
      });
    });

    it('should load CRs for multiple users', () => {
      const crs1 = [createMockCR({ id: 'cr-1', utilisateurId: 'u-1' })];
      const crs2 = [createMockCR({ id: 'cr-2', utilisateurId: 'u-2' })];
      mockRepository.getByUserId.and.callFake((id: string) => {
        return id === 'u-1' ? of(crs1) : of(crs2);
      });

      facade.loadCompteRendusForUsers(['u-1', 'u-2']);

      facade.comptesRendus$.subscribe(result => {
        expect(result.length).toBe(2);
      });
    });
  });

  describe('create', () => {
    it('should create a CR and add it to the list', () => {
      const newCR = createMockCR({ id: 'cr-new', statut: StatutCR.SOUMIS });
      mockRepository.create.and.returnValue(of(newCR));

      facade.create({ date: '2026-02-15', rdqd: '1/1', priereSeuleMinutes: 90 }).subscribe(result => {
        expect(result.id).toBe('cr-new');
      });

      facade.comptesRendus$.subscribe(crs => {
        expect(crs.find(cr => cr.id === 'cr-new')).toBeTruthy();
      });
    });
  });

  describe('update', () => {
    it('should update a CR in the list', () => {
      const existing = createMockCR({ id: 'cr-001' });
      const updated = createMockCR({ id: 'cr-001', rdqd: '1/1' });

      // First load existing CRs
      mockAuthService.getCurrentUser.and.returnValue(of(mockUser));
      mockRepository.getByUserId.and.returnValue(of([existing]));
      facade.loadMyCompteRendus();

      // Then update
      mockRepository.update.and.returnValue(of(updated));
      facade.update('cr-001', { rdqd: '1/1' }).subscribe(result => {
        expect(result.rdqd).toBe('1/1');
      });
    });
  });

  describe('delete', () => {
    it('should remove a CR from the list', () => {
      const cr = createMockCR({ id: 'cr-del' });

      mockAuthService.getCurrentUser.and.returnValue(of(mockUser));
      mockRepository.getByUserId.and.returnValue(of([cr]));
      facade.loadMyCompteRendus();

      mockRepository.delete.and.returnValue(of(undefined));
      facade.delete('cr-del').subscribe(() => {
        facade.comptesRendus$.subscribe(crs => {
          expect(crs.find(c => c.id === 'cr-del')).toBeFalsy();
        });
      });
    });
  });

  describe('submit', () => {
    it('should submit a CR', () => {
      const submitted = createMockCR({ id: 'cr-001', statut: StatutCR.SOUMIS });
      mockRepository.submit.and.returnValue(of(submitted));

      facade.submit('cr-001').subscribe(result => {
        expect(result.statut).toBe(StatutCR.SOUMIS);
      });
    });
  });

  describe('validate', () => {
    it('should validate a CR', () => {
      const validated = createMockCR({ id: 'cr-001', statut: StatutCR.VALIDE, vuParFd: true });
      mockRepository.validate.and.returnValue(of(validated));

      facade.validate('cr-001').subscribe(result => {
        expect(result.statut).toBe(StatutCR.VALIDE);
        expect(result.vuParFd).toBe(true);
      });
    });
  });

  describe('markAsViewed', () => {
    it('should mark CR as viewed', () => {
      const viewed = createMockCR({ id: 'cr-001', vuParFd: true });
      mockRepository.markAsViewed.and.returnValue(of(viewed));

      facade.markAsViewed('cr-001').subscribe(result => {
        expect(result.vuParFd).toBe(true);
      });
    });
  });

  describe('derived observables', () => {
    it('should filter brouillons, soumis, and valides', () => {
      const crs = [
        createMockCR({ id: 'cr-1', statut: StatutCR.BROUILLON }),
        createMockCR({ id: 'cr-2', statut: StatutCR.SOUMIS }),
        createMockCR({ id: 'cr-3', statut: StatutCR.VALIDE }),
        createMockCR({ id: 'cr-4', statut: StatutCR.SOUMIS })
      ];

      mockAuthService.getCurrentUser.and.returnValue(of(mockUser));
      mockRepository.getByUserId.and.returnValue(of(crs));
      facade.loadMyCompteRendus();

      facade.brouillons$.subscribe(b => expect(b.length).toBe(1));
      facade.soumis$.subscribe(s => expect(s.length).toBe(2));
      facade.valides$.subscribe(v => expect(v.length).toBe(1));
    });

    it('should return most recent CRs limited to 10', () => {
      const crs = Array.from({ length: 15 }, (_, i) =>
        createMockCR({ id: `cr-${i}`, date: new Date(2026, 1, i + 1) })
      );

      mockAuthService.getCurrentUser.and.returnValue(of(mockUser));
      mockRepository.getByUserId.and.returnValue(of(crs));
      facade.loadMyCompteRendus();

      facade.recentCRs$.subscribe(recent => {
        expect(recent.length).toBe(10);
        // Most recent first
        expect(new Date(recent[0].date).getTime()).toBeGreaterThanOrEqual(
          new Date(recent[1].date).getTime()
        );
      });
    });
  });

  describe('select', () => {
    it('should select a CR', (done) => {
      const cr = createMockCR();
      facade.select(cr);
      facade.selectedCR$.subscribe(selected => {
        expect(selected).toEqual(cr);
        done();
      });
    });

    it('should deselect a CR', (done) => {
      facade.select(null);
      facade.selectedCR$.subscribe(selected => {
        expect(selected).toBeNull();
        done();
      });
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      facade.clearError();
      facade.error$.subscribe(error => {
        expect(error).toBeNull();
      });
    });
  });
});
