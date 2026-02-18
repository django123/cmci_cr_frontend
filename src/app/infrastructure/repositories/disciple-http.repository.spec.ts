import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DiscipleHttpRepository } from './disciple-http.repository';
import { BaseHttpService } from '../http/base-http.service';
import { DiscipleMapper } from '../../application/mappers';
import { DiscipleResponseDTO } from '../../application/dto/response';
import { Role, StatutUtilisateur } from '../../domain/enums';

describe('DiscipleHttpRepository', () => {
  let repository: DiscipleHttpRepository;
  let mockHttp: jasmine.SpyObj<BaseHttpService>;
  let mockMapper: jasmine.SpyObj<DiscipleMapper>;

  const mockDTO: DiscipleResponseDTO = {
    id: 'disc-001',
    email: 'jean@cmci.org',
    nom: 'Dupont',
    prenom: 'Jean',
    nomComplet: 'Jean Dupont',
    role: 'FIDELE',
    fdId: 'fd-001',
    fdNom: 'Pierre Martin',
    statut: 'ACTIF',
    createdAt: '2026-01-01T08:00:00',
    updatedAt: '2026-01-01T08:00:00'
  };

  const mockDomain = {
    id: 'disc-001',
    email: 'jean@cmci.org',
    nom: 'Dupont',
    prenom: 'Jean',
    nomComplet: 'Jean Dupont',
    role: Role.FIDELE,
    fdId: 'fd-001',
    fdNom: 'Pierre Martin',
    statut: StatutUtilisateur.ACTIF,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    mockHttp = jasmine.createSpyObj('BaseHttpService', ['get', 'post', 'put', 'delete']);
    mockMapper = jasmine.createSpyObj('DiscipleMapper', ['toDiscipleDomain', 'toDiscipleDomainList']);

    TestBed.configureTestingModule({
      providers: [
        DiscipleHttpRepository,
        { provide: BaseHttpService, useValue: mockHttp },
        { provide: DiscipleMapper, useValue: mockMapper }
      ]
    });

    repository = TestBed.inject(DiscipleHttpRepository);
  });

  describe('assignToFD', () => {
    it('should call POST with fdId in body', () => {
      mockHttp.post.and.returnValue(of(mockDTO));
      mockMapper.toDiscipleDomain.and.returnValue(mockDomain);

      repository.assignToFD('disc-001', 'fd-001').subscribe(result => {
        expect(result.id).toBe('disc-001');
        expect(result.fdId).toBe('fd-001');
        expect(mockMapper.toDiscipleDomain).toHaveBeenCalledWith(mockDTO);
      });

      expect(mockHttp.post).toHaveBeenCalled();
      // Verify the body contains fdId
      const postArgs = mockHttp.post.calls.mostRecent().args;
      expect(postArgs[1]).toEqual({ fdId: 'fd-001' });
    });
  });

  describe('removeFromFD', () => {
    it('should call DELETE', () => {
      const removedDTO = { ...mockDTO, fdId: undefined, fdNom: undefined };
      const removedDomain = { ...mockDomain, fdId: undefined, fdNom: undefined };
      mockHttp.delete.and.returnValue(of(removedDTO));
      mockMapper.toDiscipleDomain.and.returnValue(removedDomain);

      repository.removeFromFD('disc-001').subscribe(result => {
        expect(result.fdId).toBeUndefined();
      });
    });
  });

  describe('getByFD', () => {
    it('should call GET and map list', () => {
      mockHttp.get.and.returnValue(of([mockDTO]));
      mockMapper.toDiscipleDomainList.and.returnValue([mockDomain]);

      repository.getByFD('fd-001').subscribe(result => {
        expect(result.length).toBe(1);
        expect(mockMapper.toDiscipleDomainList).toHaveBeenCalledWith([mockDTO]);
      });
    });
  });

  describe('getMyDisciples', () => {
    it('should call GET for my disciples', () => {
      mockHttp.get.and.returnValue(of([mockDTO]));
      mockMapper.toDiscipleDomainList.and.returnValue([mockDomain]);

      repository.getMyDisciples().subscribe(result => {
        expect(result.length).toBe(1);
      });
    });
  });

  describe('getUnassigned', () => {
    it('should call GET for unassigned disciples', () => {
      mockHttp.get.and.returnValue(of([mockDTO, mockDTO]));
      mockMapper.toDiscipleDomainList.and.returnValue([mockDomain, mockDomain]);

      repository.getUnassigned().subscribe(result => {
        expect(result.length).toBe(2);
      });
    });
  });

  describe('countByFD', () => {
    it('should call GET and return count', () => {
      mockHttp.get.and.returnValue(of(5));

      repository.countByFD('fd-001').subscribe(count => {
        expect(count).toBe(5);
      });
    });
  });
});
