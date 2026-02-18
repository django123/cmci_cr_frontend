import { TestBed } from '@angular/core/testing';
import { DiscipleMapper } from './disciple.mapper';
import { DiscipleResponseDTO, RoleStatisticsResponseDTO, KeycloakUserResponseDTO } from '../dto/response';
import { Role, StatutUtilisateur } from '../../domain/enums';

describe('DiscipleMapper', () => {
  let mapper: DiscipleMapper;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DiscipleMapper]
    });
    mapper = TestBed.inject(DiscipleMapper);
  });

  describe('toDiscipleDomain', () => {
    it('should convert a full Disciple DTO to domain model', () => {
      const dto: DiscipleResponseDTO = {
        id: 'disc-001',
        email: 'jean@cmci.org',
        nom: 'Dupont',
        prenom: 'Jean',
        nomComplet: 'Jean Dupont',
        role: 'FIDELE',
        egliseMaisonId: 'em-001',
        fdId: 'fd-001',
        fdNom: 'Pierre Martin',
        avatarUrl: 'https://example.com/avatar.jpg',
        telephone: '+237600000000',
        dateNaissance: '1990-05-15',
        dateBapteme: '2010-12-25',
        statut: 'ACTIF',
        createdAt: '2026-01-01T08:00:00',
        updatedAt: '2026-02-01T08:00:00'
      };

      const domain = mapper.toDiscipleDomain(dto);

      expect(domain.id).toBe('disc-001');
      expect(domain.email).toBe('jean@cmci.org');
      expect(domain.nom).toBe('Dupont');
      expect(domain.prenom).toBe('Jean');
      expect(domain.nomComplet).toBe('Jean Dupont');
      expect(domain.role).toBe(Role.FIDELE);
      expect(domain.egliseMaisonId).toBe('em-001');
      expect(domain.fdId).toBe('fd-001');
      expect(domain.fdNom).toBe('Pierre Martin');
      expect(domain.telephone).toBe('+237600000000');
      expect(domain.dateNaissance).toBeInstanceOf(Date);
      expect(domain.dateBapteme).toBeInstanceOf(Date);
      expect(domain.statut).toBe(StatutUtilisateur.ACTIF);
      expect(domain.createdAt).toBeInstanceOf(Date);
    });

    it('should handle minimal Disciple DTO (no optional fields)', () => {
      const dto: DiscipleResponseDTO = {
        id: 'disc-002',
        email: 'marie@cmci.org',
        nom: 'Kamga',
        prenom: 'Marie',
        nomComplet: 'Marie Kamga',
        role: 'FD',
        createdAt: '2026-01-01T08:00:00',
        updatedAt: '2026-01-01T08:00:00'
      };

      const domain = mapper.toDiscipleDomain(dto);

      expect(domain.id).toBe('disc-002');
      expect(domain.role).toBe(Role.FD);
      expect(domain.fdId).toBeUndefined();
      expect(domain.fdNom).toBeUndefined();
      expect(domain.egliseMaisonId).toBeUndefined();
      expect(domain.dateNaissance).toBeUndefined();
      expect(domain.dateBapteme).toBeUndefined();
      expect(domain.statut).toBe(StatutUtilisateur.ACTIF); // Default
    });

    it('should handle all roles correctly', () => {
      const roles = ['FIDELE', 'FD', 'LEADER', 'PASTEUR', 'ADMIN'];
      roles.forEach(role => {
        const dto: DiscipleResponseDTO = {
          id: 'disc-x', email: 'x@cmci.org', nom: 'X', prenom: 'Y',
          nomComplet: 'Y X', role: role, createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00'
        };
        const domain = mapper.toDiscipleDomain(dto);
        expect(domain.role).toBe(role as Role);
      });
    });
  });

  describe('toDiscipleDomainList', () => {
    it('should convert a list of Disciple DTOs', () => {
      const dtos: DiscipleResponseDTO[] = [
        { id: 'd-1', email: 'a@cmci.org', nom: 'A', prenom: 'B', nomComplet: 'B A', role: 'FIDELE', createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
        { id: 'd-2', email: 'c@cmci.org', nom: 'C', prenom: 'D', nomComplet: 'D C', role: 'FD', createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' }
      ];

      const result = mapper.toDiscipleDomainList(dtos);
      expect(result.length).toBe(2);
      expect(result[0].id).toBe('d-1');
      expect(result[1].id).toBe('d-2');
    });

    it('should handle empty/null list', () => {
      expect(mapper.toDiscipleDomainList([])).toEqual([]);
      expect(mapper.toDiscipleDomainList(null as any)).toEqual([]);
      expect(mapper.toDiscipleDomainList(undefined as any)).toEqual([]);
    });
  });

  describe('toRoleStatisticsDomain', () => {
    it('should convert RoleStatistics DTO', () => {
      const dto: RoleStatisticsResponseDTO = {
        totalUsers: 150,
        roleDistribution: { FIDELE: 120, FD: 20, LEADER: 5, PASTEUR: 3, ADMIN: 2 }
      };

      const domain = mapper.toRoleStatisticsDomain(dto);

      expect(domain.totalUsers).toBe(150);
      expect(domain.roleDistribution['FIDELE']).toBe(120);
      expect(domain.roleDistribution['ADMIN']).toBe(2);
    });
  });

  describe('toKeycloakUserDomain', () => {
    it('should convert KeycloakUser DTO to domain model', () => {
      const dto: KeycloakUserResponseDTO = {
        id: 'kc-001',
        keycloakId: 'kc-uuid-001',
        email: 'admin@cmci.org',
        nom: 'Admin',
        prenom: 'Super',
        nomComplet: 'Super Admin',
        role: 'ADMIN',
        statut: 'ACTIF',
        createdAt: '2026-01-01T08:00:00'
      };

      const domain = mapper.toKeycloakUserDomain(dto);

      expect(domain.id).toBe('kc-001');
      expect(domain.keycloakId).toBe('kc-uuid-001');
      expect(domain.email).toBe('admin@cmci.org');
      expect(domain.nomComplet).toBe('Super Admin');
      expect(domain.role).toBe(Role.ADMIN);
      expect(domain.statut).toBe(StatutUtilisateur.ACTIF);
      expect(domain.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('toKeycloakUserDomainList', () => {
    it('should convert list of KeycloakUser DTOs', () => {
      const dtos: KeycloakUserResponseDTO[] = [
        { id: 'k-1', keycloakId: 'kc-1', email: 'a@test.com', nom: 'A', prenom: 'B', nomComplet: 'B A', role: 'FIDELE', statut: 'ACTIF', createdAt: '2026-01-01T00:00:00' },
        { id: 'k-2', keycloakId: 'kc-2', email: 'c@test.com', nom: 'C', prenom: 'D', nomComplet: 'D C', role: 'PASTEUR', statut: 'ACTIF', createdAt: '2026-01-01T00:00:00' }
      ];

      const result = mapper.toKeycloakUserDomainList(dtos);
      expect(result.length).toBe(2);
      expect(result[0].role).toBe(Role.FIDELE);
      expect(result[1].role).toBe(Role.PASTEUR);
    });

    it('should handle empty/null list', () => {
      expect(mapper.toKeycloakUserDomainList([])).toEqual([]);
      expect(mapper.toKeycloakUserDomainList(null as any)).toEqual([]);
    });
  });
});
