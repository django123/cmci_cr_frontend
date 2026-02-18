import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CompteRenduHttpRepository } from './compte-rendu-http.repository';
import { BaseHttpService } from '../http/base-http.service';
import { CompteRenduMapper } from '../../application/mappers';
import { CompteRenduResponseDTO } from '../../application/dto/response';
import { StatutCR } from '../../domain/enums';

describe('CompteRenduHttpRepository', () => {
  let repository: CompteRenduHttpRepository;
  let mockHttp: jasmine.SpyObj<BaseHttpService>;
  let mockMapper: jasmine.SpyObj<CompteRenduMapper>;

  const mockDTO: CompteRenduResponseDTO = {
    id: 'cr-001',
    utilisateurId: 'user-001',
    date: '2026-02-15',
    rdqd: '1/1',
    priereSeule: '01:30',
    confession: true,
    jeune: false,
    offrande: true,
    statut: StatutCR.SOUMIS,
    vuParFd: false,
    createdAt: '2026-02-15T08:00:00',
    updatedAt: '2026-02-15T08:00:00'
  };

  const mockDomain = {
    id: 'cr-001',
    utilisateurId: 'user-001',
    date: new Date('2026-02-15'),
    rdqd: '1/1',
    priereSeule: '01:30',
    confession: true,
    jeune: false,
    offrande: true,
    statut: StatutCR.SOUMIS,
    vuParFd: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    mockHttp = jasmine.createSpyObj('BaseHttpService', ['get', 'post', 'put', 'delete']);
    mockMapper = jasmine.createSpyObj('CompteRenduMapper', ['toDomain', 'toDomainList', 'toCreateDTO', 'toUpdateDTO']);

    TestBed.configureTestingModule({
      providers: [
        CompteRenduHttpRepository,
        { provide: BaseHttpService, useValue: mockHttp },
        { provide: CompteRenduMapper, useValue: mockMapper }
      ]
    });

    repository = TestBed.inject(CompteRenduHttpRepository);
  });

  describe('getById', () => {
    it('should call GET and map response', () => {
      mockHttp.get.and.returnValue(of(mockDTO));
      mockMapper.toDomain.and.returnValue(mockDomain);

      repository.getById('cr-001').subscribe(result => {
        expect(result.id).toBe('cr-001');
        expect(mockMapper.toDomain).toHaveBeenCalledWith(mockDTO);
      });
    });
  });

  describe('getByUserId', () => {
    it('should call GET and map response list', () => {
      mockHttp.get.and.returnValue(of([mockDTO]));
      mockMapper.toDomainList.and.returnValue([mockDomain]);

      repository.getByUserId('user-001').subscribe(result => {
        expect(result.length).toBe(1);
        expect(mockMapper.toDomainList).toHaveBeenCalledWith([mockDTO]);
      });
    });
  });

  describe('getByUserIdAndPeriod', () => {
    it('should call GET with date params', () => {
      mockHttp.get.and.returnValue(of([mockDTO]));
      mockMapper.toDomainList.and.returnValue([mockDomain]);

      const start = new Date('2026-02-01');
      const end = new Date('2026-02-28');

      repository.getByUserIdAndPeriod('user-001', start, end).subscribe(result => {
        expect(result.length).toBe(1);
      });

      expect(mockHttp.get).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should call POST and map response', () => {
      const createDTO = { date: '2026-02-15', rdqd: '1/1', priereSeuleMinutes: 90 };
      mockMapper.toCreateDTO.and.returnValue(createDTO);
      mockHttp.post.and.returnValue(of(mockDTO));
      mockMapper.toDomain.and.returnValue(mockDomain);

      repository.create({ date: '2026-02-15', rdqd: '1/1', priereSeuleMinutes: 90 }).subscribe(result => {
        expect(result.id).toBe('cr-001');
        expect(mockMapper.toCreateDTO).toHaveBeenCalled();
      });
    });
  });

  describe('update', () => {
    it('should call PUT and map response', () => {
      const updateDTO = { rdqd: '1/1' };
      mockMapper.toUpdateDTO.and.returnValue(updateDTO);
      mockHttp.put.and.returnValue(of(mockDTO));
      mockMapper.toDomain.and.returnValue(mockDomain);

      repository.update('cr-001', { rdqd: '1/1' }).subscribe(result => {
        expect(result.id).toBe('cr-001');
        expect(mockMapper.toUpdateDTO).toHaveBeenCalled();
      });
    });
  });

  describe('delete', () => {
    it('should call DELETE', () => {
      mockHttp.delete.and.returnValue(of(undefined));

      repository.delete('cr-001').subscribe(() => {
        expect(mockHttp.delete).toHaveBeenCalled();
      });
    });
  });

  describe('submit', () => {
    it('should call POST to submit endpoint', () => {
      const submittedDTO = { ...mockDTO, statut: StatutCR.SOUMIS };
      mockHttp.post.and.returnValue(of(submittedDTO));
      mockMapper.toDomain.and.returnValue({ ...mockDomain, statut: StatutCR.SOUMIS });

      repository.submit('cr-001').subscribe(result => {
        expect(result.statut).toBe(StatutCR.SOUMIS);
      });
    });
  });

  describe('validate', () => {
    it('should call POST to validate endpoint', () => {
      const validatedDTO = { ...mockDTO, statut: StatutCR.VALIDE, vuParFd: true };
      mockHttp.post.and.returnValue(of(validatedDTO));
      mockMapper.toDomain.and.returnValue({ ...mockDomain, statut: StatutCR.VALIDE, vuParFd: true });

      repository.validate('cr-001').subscribe(result => {
        expect(result.statut).toBe(StatutCR.VALIDE);
        expect(result.vuParFd).toBe(true);
      });
    });
  });

  describe('markAsViewed', () => {
    it('should call POST to mark-viewed endpoint', () => {
      const viewedDTO = { ...mockDTO, vuParFd: true };
      mockHttp.post.and.returnValue(of(viewedDTO));
      mockMapper.toDomain.and.returnValue({ ...mockDomain, vuParFd: true });

      repository.markAsViewed('cr-001').subscribe(result => {
        expect(result.vuParFd).toBe(true);
      });
    });
  });
});
