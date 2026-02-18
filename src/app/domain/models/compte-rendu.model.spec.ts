import {
  CompteRendu,
  createEmptyCompteRendu,
  canModifyCompteRendu,
  canSubmitCompteRendu,
  canValidateCompteRendu
} from './compte-rendu.model';
import { StatutCR } from '../enums';

describe('CompteRendu Model', () => {
  const createCR = (overrides: Partial<CompteRendu> = {}): CompteRendu => ({
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

  describe('createEmptyCompteRendu', () => {
    it('should create an empty CR with default values', () => {
      const date = new Date('2026-02-15');
      const cr = createEmptyCompteRendu('user-001', date);

      expect(cr.utilisateurId).toBe('user-001');
      expect(cr.date).toEqual(date);
      expect(cr.rdqd).toBe('0/7');
      expect(cr.priereSeule).toBe('00:00');
      expect(cr.confession).toBe(false);
      expect(cr.jeune).toBe(false);
      expect(cr.offrande).toBe(false);
      expect(cr.statut).toBe(StatutCR.BROUILLON);
      expect(cr.vuParFd).toBe(false);
    });
  });

  describe('canModifyCompteRendu', () => {
    it('should allow modification of BROUILLON CR', () => {
      const cr = createCR({ statut: StatutCR.BROUILLON });
      expect(canModifyCompteRendu(cr)).toBe(true);
    });

    it('should allow modification of recently SOUMIS CR (within 7 days)', () => {
      const cr = createCR({
        statut: StatutCR.SOUMIS,
        createdAt: new Date() // Created just now
      });
      expect(canModifyCompteRendu(cr)).toBe(true);
    });

    it('should not allow modification of old SOUMIS CR (more than 7 days)', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10);
      const cr = createCR({
        statut: StatutCR.SOUMIS,
        createdAt: oldDate
      });
      expect(canModifyCompteRendu(cr)).toBe(false);
    });

    it('should not allow modification of VALIDE CR', () => {
      const cr = createCR({ statut: StatutCR.VALIDE });
      expect(canModifyCompteRendu(cr)).toBe(false);
    });
  });

  describe('canSubmitCompteRendu', () => {
    it('should allow submission of BROUILLON CR', () => {
      const cr = createCR({ statut: StatutCR.BROUILLON });
      expect(canSubmitCompteRendu(cr)).toBe(true);
    });

    it('should not allow submission of SOUMIS CR', () => {
      const cr = createCR({ statut: StatutCR.SOUMIS });
      expect(canSubmitCompteRendu(cr)).toBe(false);
    });

    it('should not allow submission of VALIDE CR', () => {
      const cr = createCR({ statut: StatutCR.VALIDE });
      expect(canSubmitCompteRendu(cr)).toBe(false);
    });
  });

  describe('canValidateCompteRendu', () => {
    it('should allow validation of SOUMIS CR', () => {
      const cr = createCR({ statut: StatutCR.SOUMIS });
      expect(canValidateCompteRendu(cr)).toBe(true);
    });

    it('should not allow validation of BROUILLON CR', () => {
      const cr = createCR({ statut: StatutCR.BROUILLON });
      expect(canValidateCompteRendu(cr)).toBe(false);
    });

    it('should not allow validation of VALIDE CR', () => {
      const cr = createCR({ statut: StatutCR.VALIDE });
      expect(canValidateCompteRendu(cr)).toBe(false);
    });
  });
});
