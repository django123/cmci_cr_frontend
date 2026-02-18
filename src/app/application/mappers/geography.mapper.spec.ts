import { TestBed } from '@angular/core/testing';
import { GeographyMapper } from './geography.mapper';
import {
  RegionResponseDTO,
  ZoneResponseDTO,
  EgliseLocaleResponseDTO,
  EgliseMaisonResponseDTO,
  SeedResultDTO
} from '../dto/response';

describe('GeographyMapper', () => {
  let mapper: GeographyMapper;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GeographyMapper]
    });
    mapper = TestBed.inject(GeographyMapper);
  });

  // ========== REGION ==========

  describe('toRegionDomain', () => {
    it('should convert a Region DTO to domain model', () => {
      const dto: RegionResponseDTO = {
        id: 'reg-001',
        nom: 'Centre',
        code: 'CTR',
        nombreZones: 5,
        createdAt: '2026-01-01T08:00:00',
        updatedAt: '2026-01-15T10:00:00'
      };

      const domain = mapper.toRegionDomain(dto);

      expect(domain.id).toBe('reg-001');
      expect(domain.nom).toBe('Centre');
      expect(domain.code).toBe('CTR');
      expect(domain.nombreZones).toBe(5);
      expect(domain.createdAt).toBeInstanceOf(Date);
      expect(domain.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('toRegionDomainList', () => {
    it('should convert a list of Region DTOs', () => {
      const dtos: RegionResponseDTO[] = [
        { id: 'reg-001', nom: 'Centre', code: 'CTR', nombreZones: 3, createdAt: '2026-01-01T08:00:00', updatedAt: '2026-01-01T08:00:00' },
        { id: 'reg-002', nom: 'Littoral', code: 'LIT', nombreZones: 2, createdAt: '2026-01-02T08:00:00', updatedAt: '2026-01-02T08:00:00' }
      ];

      const result = mapper.toRegionDomainList(dtos);

      expect(result.length).toBe(2);
      expect(result[0].nom).toBe('Centre');
      expect(result[1].nom).toBe('Littoral');
    });

    it('should handle empty list', () => {
      expect(mapper.toRegionDomainList([])).toEqual([]);
    });

    it('should handle null/undefined', () => {
      expect(mapper.toRegionDomainList(null as any)).toEqual([]);
      expect(mapper.toRegionDomainList(undefined as any)).toEqual([]);
    });
  });

  // ========== ZONE ==========

  describe('toZoneDomain', () => {
    it('should convert a Zone DTO to domain model', () => {
      const dto: ZoneResponseDTO = {
        id: 'zone-001',
        nom: 'Zone Nord',
        regionId: 'reg-001',
        regionNom: 'Centre',
        nombreEglisesLocales: 4,
        createdAt: '2026-01-05T08:00:00',
        updatedAt: '2026-01-10T08:00:00'
      };

      const domain = mapper.toZoneDomain(dto);

      expect(domain.id).toBe('zone-001');
      expect(domain.nom).toBe('Zone Nord');
      expect(domain.regionId).toBe('reg-001');
      expect(domain.regionNom).toBe('Centre');
      expect(domain.nombreEglisesLocales).toBe(4);
      expect(domain.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('toZoneDomainList', () => {
    it('should convert a list of Zone DTOs', () => {
      const dtos: ZoneResponseDTO[] = [
        { id: 'z-1', nom: 'Zone A', regionId: 'r-1', regionNom: 'R1', nombreEglisesLocales: 2, createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
        { id: 'z-2', nom: 'Zone B', regionId: 'r-1', regionNom: 'R1', nombreEglisesLocales: 1, createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' }
      ];

      const result = mapper.toZoneDomainList(dtos);
      expect(result.length).toBe(2);
      expect(result[0].nom).toBe('Zone A');
      expect(result[1].nom).toBe('Zone B');
    });

    it('should handle empty/null list', () => {
      expect(mapper.toZoneDomainList([])).toEqual([]);
      expect(mapper.toZoneDomainList(null as any)).toEqual([]);
    });
  });

  // ========== EGLISE LOCALE ==========

  describe('toEgliseLocaleDomain', () => {
    it('should convert an EgliseLocale DTO with pasteur', () => {
      const dto: EgliseLocaleResponseDTO = {
        id: 'el-001',
        nom: 'CMCI Douala Central',
        zoneId: 'zone-001',
        zoneNom: 'Zone Nord',
        adresse: '123 rue de la Paix',
        pasteurId: 'pasteur-001',
        pasteurNom: 'Pasteur Martin',
        nombreEglisesMaison: 8,
        createdAt: '2026-01-01T08:00:00',
        updatedAt: '2026-02-01T08:00:00'
      };

      const domain = mapper.toEgliseLocaleDomain(dto);

      expect(domain.id).toBe('el-001');
      expect(domain.nom).toBe('CMCI Douala Central');
      expect(domain.zoneId).toBe('zone-001');
      expect(domain.zoneNom).toBe('Zone Nord');
      expect(domain.adresse).toBe('123 rue de la Paix');
      expect(domain.pasteurId).toBe('pasteur-001');
      expect(domain.pasteurNom).toBe('Pasteur Martin');
      expect(domain.nombreEglisesMaison).toBe(8);
    });

    it('should handle EgliseLocale DTO without pasteur', () => {
      const dto: EgliseLocaleResponseDTO = {
        id: 'el-002',
        nom: 'CMCI Yaoundé',
        zoneId: 'zone-002',
        zoneNom: 'Zone Sud',
        nombreEglisesMaison: 3,
        createdAt: '2026-01-01T08:00:00',
        updatedAt: '2026-01-01T08:00:00'
      };

      const domain = mapper.toEgliseLocaleDomain(dto);
      expect(domain.pasteurId).toBeUndefined();
      expect(domain.pasteurNom).toBeUndefined();
      expect(domain.adresse).toBeUndefined();
    });
  });

  describe('toEgliseLocaleDomainList', () => {
    it('should convert a list of EgliseLocale DTOs', () => {
      const dtos: EgliseLocaleResponseDTO[] = [
        { id: 'el-1', nom: 'EL1', zoneId: 'z-1', zoneNom: 'Z1', nombreEglisesMaison: 2, createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' }
      ];

      const result = mapper.toEgliseLocaleDomainList(dtos);
      expect(result.length).toBe(1);
      expect(result[0].nom).toBe('EL1');
    });
  });

  // ========== EGLISE DE MAISON ==========

  describe('toEgliseMaisonDomain', () => {
    it('should convert an EgliseMaison DTO with leader', () => {
      const dto: EgliseMaisonResponseDTO = {
        id: 'em-001',
        nom: 'Maison Bonaberi',
        egliseLocaleId: 'el-001',
        egliseLocaleNom: 'CMCI Douala',
        leaderId: 'leader-001',
        leaderNom: 'Leader Paul',
        adresse: '45 rue des Palmiers',
        nombreFideles: 12,
        createdAt: '2026-01-01T08:00:00',
        updatedAt: '2026-02-01T08:00:00'
      };

      const domain = mapper.toEgliseMaisonDomain(dto);

      expect(domain.id).toBe('em-001');
      expect(domain.nom).toBe('Maison Bonaberi');
      expect(domain.egliseLocaleId).toBe('el-001');
      expect(domain.egliseLocaleNom).toBe('CMCI Douala');
      expect(domain.leaderId).toBe('leader-001');
      expect(domain.leaderNom).toBe('Leader Paul');
      expect(domain.adresse).toBe('45 rue des Palmiers');
      expect(domain.nombreFideles).toBe(12);
    });

    it('should handle EgliseMaison DTO without leader', () => {
      const dto: EgliseMaisonResponseDTO = {
        id: 'em-002',
        nom: 'Maison Akwa',
        egliseLocaleId: 'el-001',
        egliseLocaleNom: 'CMCI Douala',
        nombreFideles: 5,
        createdAt: '2026-01-01T08:00:00',
        updatedAt: '2026-01-01T08:00:00'
      };

      const domain = mapper.toEgliseMaisonDomain(dto);
      expect(domain.leaderId).toBeUndefined();
      expect(domain.leaderNom).toBeUndefined();
    });
  });

  describe('toEgliseMaisonDomainList', () => {
    it('should convert a list and handle empty', () => {
      expect(mapper.toEgliseMaisonDomainList([])).toEqual([]);
      expect(mapper.toEgliseMaisonDomainList(null as any)).toEqual([]);
    });
  });

  // ========== SEED RESULT ==========

  describe('toSeedResultDomain', () => {
    it('should convert SeedResult DTO', () => {
      const dto: SeedResultDTO = {
        regionsCreated: 10,
        regionsSkipped: 2,
        zonesCreated: 25,
        zonesSkipped: 5
      };

      const domain = mapper.toSeedResultDomain(dto);

      expect(domain.regionsCreated).toBe(10);
      expect(domain.regionsSkipped).toBe(2);
      expect(domain.zonesCreated).toBe(25);
      expect(domain.zonesSkipped).toBe(5);
    });
  });
});
