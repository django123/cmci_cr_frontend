import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AdministrationFacade } from './administration.facade';
import {
  RegionHttpRepository,
  ZoneHttpRepository,
  EgliseLocaleHttpRepository,
  EgliseMaisonHttpRepository
} from '../../../infrastructure/repositories';
import { Region, Zone, EgliseLocale, EgliseMaison } from '../../../domain/models';

describe('AdministrationFacade', () => {
  let facade: AdministrationFacade;
  let mockRegionRepo: jasmine.SpyObj<RegionHttpRepository>;
  let mockZoneRepo: jasmine.SpyObj<ZoneHttpRepository>;
  let mockEgliseLocaleRepo: jasmine.SpyObj<EgliseLocaleHttpRepository>;
  let mockEgliseMaisonRepo: jasmine.SpyObj<EgliseMaisonHttpRepository>;

  const now = new Date();

  const mockRegion: Region = { id: 'reg-001', nom: 'Centre', code: 'CTR', nombreZones: 3, createdAt: now, updatedAt: now };
  const mockZone: Zone = { id: 'zone-001', nom: 'Zone Nord', regionId: 'reg-001', regionNom: 'Centre', nombreEglisesLocales: 2, createdAt: now, updatedAt: now };
  const mockEgliseLocale: EgliseLocale = { id: 'el-001', nom: 'CMCI Douala', zoneId: 'zone-001', zoneNom: 'Zone Nord', nombreEglisesMaison: 4, createdAt: now, updatedAt: now };
  const mockEgliseMaison: EgliseMaison = { id: 'em-001', nom: 'Maison Bonaberi', egliseLocaleId: 'el-001', egliseLocaleNom: 'CMCI Douala', nombreFideles: 10, createdAt: now, updatedAt: now };

  beforeEach(() => {
    mockRegionRepo = jasmine.createSpyObj('RegionHttpRepository', ['getAll', 'getById', 'create', 'update', 'delete', 'seedGeography']);
    mockZoneRepo = jasmine.createSpyObj('ZoneHttpRepository', ['getAll', 'getById', 'getByRegionId', 'create', 'update', 'delete']);
    mockEgliseLocaleRepo = jasmine.createSpyObj('EgliseLocaleHttpRepository', ['getAll', 'getById', 'getByZoneId', 'create', 'update', 'delete']);
    mockEgliseMaisonRepo = jasmine.createSpyObj('EgliseMaisonHttpRepository', ['getAll', 'getById', 'getByEgliseLocaleId', 'create', 'update', 'delete']);

    TestBed.configureTestingModule({
      providers: [
        AdministrationFacade,
        { provide: RegionHttpRepository, useValue: mockRegionRepo },
        { provide: ZoneHttpRepository, useValue: mockZoneRepo },
        { provide: EgliseLocaleHttpRepository, useValue: mockEgliseLocaleRepo },
        { provide: EgliseMaisonHttpRepository, useValue: mockEgliseMaisonRepo }
      ]
    });

    facade = TestBed.inject(AdministrationFacade);
  });

  // ========== REGIONS ==========

  describe('Regions', () => {
    it('should load all regions', () => {
      mockRegionRepo.getAll.and.returnValue(of([mockRegion]));

      facade.loadRegions();

      facade.regions$.subscribe(regions => {
        expect(regions.length).toBe(1);
        expect(regions[0].nom).toBe('Centre');
      });
    });

    it('should create a region and add to list', () => {
      const newRegion = { ...mockRegion, id: 'reg-002', nom: 'Littoral', code: 'LIT' };
      mockRegionRepo.create.and.returnValue(of(newRegion));

      facade.createRegion({ nom: 'Littoral', code: 'LIT' }).subscribe(result => {
        expect(result.nom).toBe('Littoral');
      });

      facade.regions$.subscribe(regions => {
        expect(regions.find(r => r.nom === 'Littoral')).toBeTruthy();
      });
    });

    it('should update a region in the list', () => {
      // Load first
      mockRegionRepo.getAll.and.returnValue(of([mockRegion]));
      facade.loadRegions();

      const updated = { ...mockRegion, nom: 'Centre Modifié' };
      mockRegionRepo.update.and.returnValue(of(updated));

      facade.updateRegion('reg-001', { nom: 'Centre Modifié' }).subscribe(result => {
        expect(result.nom).toBe('Centre Modifié');
      });
    });

    it('should delete a region from the list', () => {
      mockRegionRepo.getAll.and.returnValue(of([mockRegion]));
      facade.loadRegions();

      mockRegionRepo.delete.and.returnValue(of(undefined));

      facade.deleteRegion('reg-001').subscribe(() => {
        facade.regions$.subscribe(regions => {
          expect(regions.find(r => r.id === 'reg-001')).toBeFalsy();
        });
      });
    });
  });

  // ========== ZONES ==========

  describe('Zones', () => {
    it('should load all zones', () => {
      mockZoneRepo.getAll.and.returnValue(of([mockZone]));

      facade.loadZones();

      facade.zones$.subscribe(zones => {
        expect(zones.length).toBe(1);
        expect(zones[0].nom).toBe('Zone Nord');
      });
    });

    it('should load zones by region', () => {
      mockZoneRepo.getByRegionId.and.returnValue(of([mockZone]));

      facade.loadZonesByRegion('reg-001');

      facade.zones$.subscribe(zones => {
        expect(zones.length).toBe(1);
      });
      expect(mockZoneRepo.getByRegionId).toHaveBeenCalledWith('reg-001');
    });

    it('should create a zone', () => {
      mockZoneRepo.create.and.returnValue(of(mockZone));

      facade.createZone({ nom: 'Zone Nord', regionId: 'reg-001' }).subscribe(result => {
        expect(result.nom).toBe('Zone Nord');
      });
    });

    it('should delete a zone', () => {
      mockZoneRepo.getAll.and.returnValue(of([mockZone]));
      facade.loadZones();

      mockZoneRepo.delete.and.returnValue(of(undefined));

      facade.deleteZone('zone-001').subscribe(() => {
        facade.zones$.subscribe(zones => {
          expect(zones.find(z => z.id === 'zone-001')).toBeFalsy();
        });
      });
    });
  });

  // ========== EGLISES LOCALES ==========

  describe('Eglises Locales', () => {
    it('should load all eglises locales', () => {
      mockEgliseLocaleRepo.getAll.and.returnValue(of([mockEgliseLocale]));

      facade.loadEglisesLocales();

      facade.eglisesLocales$.subscribe(eglises => {
        expect(eglises.length).toBe(1);
        expect(eglises[0].nom).toBe('CMCI Douala');
      });
    });

    it('should load eglises locales by zone', () => {
      mockEgliseLocaleRepo.getByZoneId.and.returnValue(of([mockEgliseLocale]));

      facade.loadEglisesLocalesByZone('zone-001');

      expect(mockEgliseLocaleRepo.getByZoneId).toHaveBeenCalledWith('zone-001');
    });

    it('should create an eglise locale with pasteur', () => {
      const withPasteur = { ...mockEgliseLocale, pasteurId: 'p-001', pasteurNom: 'Pasteur Martin' };
      mockEgliseLocaleRepo.create.and.returnValue(of(withPasteur));

      facade.createEgliseLocale({ nom: 'CMCI Douala', zoneId: 'zone-001', pasteurId: 'p-001' }).subscribe(result => {
        expect(result.pasteurId).toBe('p-001');
      });
    });

    it('should delete an eglise locale', () => {
      mockEgliseLocaleRepo.getAll.and.returnValue(of([mockEgliseLocale]));
      facade.loadEglisesLocales();

      mockEgliseLocaleRepo.delete.and.returnValue(of(undefined));

      facade.deleteEgliseLocale('el-001').subscribe(() => {
        facade.eglisesLocales$.subscribe(e => {
          expect(e.find(x => x.id === 'el-001')).toBeFalsy();
        });
      });
    });
  });

  // ========== EGLISES DE MAISON ==========

  describe('Eglises de Maison', () => {
    it('should load all eglises de maison', () => {
      mockEgliseMaisonRepo.getAll.and.returnValue(of([mockEgliseMaison]));

      facade.loadEglisesMaison();

      facade.eglisesMaison$.subscribe(eglises => {
        expect(eglises.length).toBe(1);
        expect(eglises[0].nom).toBe('Maison Bonaberi');
      });
    });

    it('should load eglises de maison by eglise locale', () => {
      mockEgliseMaisonRepo.getByEgliseLocaleId.and.returnValue(of([mockEgliseMaison]));

      facade.loadEglisesMaisonByEgliseLocale('el-001');

      expect(mockEgliseMaisonRepo.getByEgliseLocaleId).toHaveBeenCalledWith('el-001');
    });

    it('should create an eglise de maison with leader', () => {
      const withLeader = { ...mockEgliseMaison, leaderId: 'l-001', leaderNom: 'Leader Paul' };
      mockEgliseMaisonRepo.create.and.returnValue(of(withLeader));

      facade.createEgliseMaison({ nom: 'Maison', egliseLocaleId: 'el-001', leaderId: 'l-001' }).subscribe(result => {
        expect(result.leaderId).toBe('l-001');
      });
    });

    it('should delete an eglise de maison', () => {
      mockEgliseMaisonRepo.getAll.and.returnValue(of([mockEgliseMaison]));
      facade.loadEglisesMaison();

      mockEgliseMaisonRepo.delete.and.returnValue(of(undefined));

      facade.deleteEgliseMaison('em-001').subscribe(() => {
        facade.eglisesMaison$.subscribe(e => {
          expect(e.find(x => x.id === 'em-001')).toBeFalsy();
        });
      });
    });
  });

  // ========== SEED ==========

  describe('seedGeography', () => {
    it('should seed geography and reload data', () => {
      const seedResult = { regionsCreated: 10, regionsSkipped: 0, zonesCreated: 25, zonesSkipped: 0 };
      mockRegionRepo.seedGeography.and.returnValue(of(seedResult));
      mockRegionRepo.getAll.and.returnValue(of([]));
      mockZoneRepo.getAll.and.returnValue(of([]));

      facade.seedGeography().subscribe(result => {
        expect(result.regionsCreated).toBe(10);
        expect(result.zonesCreated).toBe(25);
      });
    });
  });

  // ========== UTILS ==========

  describe('clear', () => {
    it('should reset all state', () => {
      facade.clear();

      facade.regions$.subscribe(r => expect(r.length).toBe(0));
      facade.zones$.subscribe(z => expect(z.length).toBe(0));
      facade.eglisesLocales$.subscribe(el => expect(el.length).toBe(0));
      facade.eglisesMaison$.subscribe(em => expect(em.length).toBe(0));
      facade.error$.subscribe(e => expect(e).toBeNull());
      facade.loading$.subscribe(l => expect(l).toBe(false));
    });
  });
});
