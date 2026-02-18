import { TestBed } from '@angular/core/testing';
import { CompteRenduMapper } from './compte-rendu.mapper';
import { CompteRenduResponseDTO } from '../dto/response';
import { StatutCR } from '../../domain/enums';

describe('CompteRenduMapper', () => {
  let mapper: CompteRenduMapper;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CompteRenduMapper]
    });
    mapper = TestBed.inject(CompteRenduMapper);
  });

  describe('toDomain', () => {
    it('should convert a full CR DTO to domain model', () => {
      const dto: CompteRenduResponseDTO = {
        id: 'cr-001',
        utilisateurId: 'user-001',
        date: '2026-02-15',
        rdqd: '1/1',
        priereSeule: '01:30',
        priereCouple: '00:30',
        priereAvecEnfants: '00:15',
        priereAutres: 2,
        lectureBiblique: 3,
        livreBiblique: 'Matthieu',
        litteraturePages: 10,
        litteratureTotal: 200,
        litteratureTitre: 'Le Sentier de la Vie',
        confession: true,
        jeune: true,
        typeJeune: 'Jeûne sec',
        evangelisation: 1,
        offrande: true,
        notes: 'Belle journée',
        statut: StatutCR.SOUMIS,
        vuParFd: false,
        createdAt: '2026-02-15T08:00:00',
        updatedAt: '2026-02-15T08:00:00'
      };

      const domain = mapper.toDomain(dto);

      expect(domain.id).toBe('cr-001');
      expect(domain.utilisateurId).toBe('user-001');
      expect(domain.date).toBeInstanceOf(Date);
      expect(domain.rdqd).toBe('1/1');
      expect(domain.priereSeule).toBe('01:30');
      expect(domain.priereCouple).toBe('00:30');
      expect(domain.priereAvecEnfants).toBe('00:15');
      expect(domain.priereAutres).toBe(2);
      expect(domain.lectureBiblique).toBe(3);
      expect(domain.livreBiblique).toBe('Matthieu');
      expect(domain.litteraturePages).toBe(10);
      expect(domain.litteratureTotal).toBe(200);
      expect(domain.litteratureTitre).toBe('Le Sentier de la Vie');
      expect(domain.confession).toBe(true);
      expect(domain.jeune).toBe(true);
      expect(domain.typeJeune).toBe('Jeûne sec');
      expect(domain.evangelisation).toBe(1);
      expect(domain.offrande).toBe(true);
      expect(domain.notes).toBe('Belle journée');
      expect(domain.statut).toBe(StatutCR.SOUMIS);
      expect(domain.vuParFd).toBe(false);
      expect(domain.createdAt).toBeInstanceOf(Date);
      expect(domain.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle minimal CR DTO', () => {
      const dto: CompteRenduResponseDTO = {
        id: 'cr-002',
        utilisateurId: 'user-001',
        date: '2026-02-14',
        rdqd: '0/1',
        priereSeule: '00:15',
        confession: false,
        jeune: false,
        offrande: false,
        statut: StatutCR.BROUILLON,
        vuParFd: false,
        createdAt: '2026-02-14T07:00:00',
        updatedAt: '2026-02-14T07:00:00'
      };

      const domain = mapper.toDomain(dto);

      expect(domain.id).toBe('cr-002');
      expect(domain.rdqd).toBe('0/1');
      expect(domain.priereSeule).toBe('00:15');
      expect(domain.confession).toBe(false);
      expect(domain.jeune).toBe(false);
      expect(domain.offrande).toBe(false);
      expect(domain.statut).toBe(StatutCR.BROUILLON);
    });

    it('should handle empty rdqd gracefully', () => {
      const dto: CompteRenduResponseDTO = {
        id: 'cr-003',
        utilisateurId: 'user-001',
        date: '2026-02-13',
        rdqd: '',
        priereSeule: '',
        confession: false,
        jeune: false,
        offrande: false,
        statut: StatutCR.BROUILLON,
        vuParFd: false,
        createdAt: '2026-02-13T07:00:00',
        updatedAt: '2026-02-13T07:00:00'
      };

      const domain = mapper.toDomain(dto);
      expect(domain.rdqd).toBe('');
      expect(domain.priereSeule).toBe('');
    });
  });

  describe('toDomainList', () => {
    it('should convert a list of DTOs', () => {
      const dtos: CompteRenduResponseDTO[] = [
        {
          id: 'cr-001', utilisateurId: 'user-001', date: '2026-02-15',
          rdqd: '1/1', priereSeule: '01:00', confession: true, jeune: false,
          offrande: true, statut: StatutCR.VALIDE, vuParFd: true,
          createdAt: '2026-02-15T08:00:00', updatedAt: '2026-02-15T08:00:00'
        },
        {
          id: 'cr-002', utilisateurId: 'user-001', date: '2026-02-14',
          rdqd: '0/1', priereSeule: '00:30', confession: false, jeune: false,
          offrande: false, statut: StatutCR.SOUMIS, vuParFd: false,
          createdAt: '2026-02-14T08:00:00', updatedAt: '2026-02-14T08:00:00'
        }
      ];

      const result = mapper.toDomainList(dtos);

      expect(result.length).toBe(2);
      expect(result[0].id).toBe('cr-001');
      expect(result[0].statut).toBe(StatutCR.VALIDE);
      expect(result[1].id).toBe('cr-002');
      expect(result[1].statut).toBe(StatutCR.SOUMIS);
    });

    it('should handle empty list', () => {
      const result = mapper.toDomainList([]);
      expect(result.length).toBe(0);
    });
  });

  describe('toCreateDTO', () => {
    it('should convert a full create request to DTO', () => {
      const request = {
        date: '2026-02-15',
        rdqd: '1/1',
        priereSeuleMinutes: 90,
        priereCoupleMinutes: 30,
        priereAvecEnfantsMinutes: 15,
        lectureBiblique: 3,
        livreBiblique: 'Matthieu',
        litteraturePages: 10,
        litteratureTotal: 200,
        litteratureTitre: 'Le Sentier',
        priereAutres: 2,
        confession: true,
        jeune: true,
        typeJeune: 'Jeûne sec',
        evangelisation: 1,
        offrande: true,
        notes: 'Test'
      };

      const dto = mapper.toCreateDTO(request);

      expect(dto.date).toBe('2026-02-15');
      expect(dto.rdqd).toBe('1/1');
      expect(dto.priereSeuleMinutes).toBe(90);
      expect(dto.priereCoupleMinutes).toBe(30);
      expect(dto.lectureBiblique).toBe(3);
      expect(dto.confession).toBe(true);
      expect(dto.evangelisation).toBe(1);
    });

    it('should convert a minimal create request to DTO', () => {
      const request = {
        date: '2026-02-15',
        rdqd: '0/1',
        priereSeuleMinutes: 15,
        lectureBiblique: 1
      };

      const dto = mapper.toCreateDTO(request);

      expect(dto.date).toBe('2026-02-15');
      expect(dto.priereSeuleMinutes).toBe(15);
      expect(dto.confession).toBeUndefined();
    });
  });

  describe('toUpdateDTO', () => {
    it('should only include defined fields in update DTO', () => {
      const request = {
        rdqd: '1/1',
        priereSeuleMinutes: 120,
        confession: true
      };

      const dto = mapper.toUpdateDTO(request);

      expect(dto.rdqd).toBe('1/1');
      expect(dto.priereSeuleMinutes).toBe(120);
      expect(dto.confession).toBe(true);
      expect(dto.jeune).toBeUndefined();
      expect(dto.offrande).toBeUndefined();
    });

    it('should handle empty update request', () => {
      const dto = mapper.toUpdateDTO({});
      expect(Object.keys(dto).length).toBe(0);
    });
  });
});
