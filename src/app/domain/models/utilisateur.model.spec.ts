import {
  Utilisateur,
  getFullName,
  getInitials,
  isActive,
  canViewOthersCR,
  canValidateCR
} from './utilisateur.model';
import { Role, StatutUtilisateur } from '../enums';

describe('Utilisateur Model', () => {
  const createUser = (overrides: Partial<Utilisateur> = {}): Utilisateur => ({
    id: 'user-001',
    email: 'jean@cmci.org',
    nom: 'Dupont',
    prenom: 'Jean',
    role: Role.FIDELE,
    statut: StatutUtilisateur.ACTIF,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  });

  describe('getFullName', () => {
    it('should return full name', () => {
      const user = createUser({ prenom: 'Jean', nom: 'Dupont' });
      expect(getFullName(user)).toBe('Jean Dupont');
    });
  });

  describe('getInitials', () => {
    it('should return initials in uppercase', () => {
      const user = createUser({ prenom: 'Jean', nom: 'Dupont' });
      expect(getInitials(user)).toBe('JD');
    });

    it('should handle lowercase names', () => {
      const user = createUser({ prenom: 'jean', nom: 'dupont' });
      expect(getInitials(user)).toBe('JD');
    });
  });

  describe('isActive', () => {
    it('should return true for active user', () => {
      const user = createUser({ statut: StatutUtilisateur.ACTIF });
      expect(isActive(user)).toBe(true);
    });

    it('should return false for inactive user', () => {
      const user = createUser({ statut: StatutUtilisateur.INACTIF });
      expect(isActive(user)).toBe(false);
    });

    it('should return false for suspended user', () => {
      const user = createUser({ statut: StatutUtilisateur.SUSPENDU });
      expect(isActive(user)).toBe(false);
    });
  });

  describe('canViewOthersCR', () => {
    it('should return false for FIDELE', () => {
      const user = createUser({ role: Role.FIDELE });
      expect(canViewOthersCR(user)).toBe(false);
    });

    it('should return true for FD', () => {
      const user = createUser({ role: Role.FD });
      expect(canViewOthersCR(user)).toBe(true);
    });

    it('should return true for LEADER', () => {
      const user = createUser({ role: Role.LEADER });
      expect(canViewOthersCR(user)).toBe(true);
    });

    it('should return true for PASTEUR', () => {
      const user = createUser({ role: Role.PASTEUR });
      expect(canViewOthersCR(user)).toBe(true);
    });

    it('should return true for ADMIN', () => {
      const user = createUser({ role: Role.ADMIN });
      expect(canViewOthersCR(user)).toBe(true);
    });
  });

  describe('canValidateCR', () => {
    it('should return false for FIDELE', () => {
      const user = createUser({ role: Role.FIDELE });
      expect(canValidateCR(user)).toBe(false);
    });

    it('should return true for FD', () => {
      const user = createUser({ role: Role.FD });
      expect(canValidateCR(user)).toBe(true);
    });

    it('should return true for PASTEUR', () => {
      const user = createUser({ role: Role.PASTEUR });
      expect(canValidateCR(user)).toBe(true);
    });
  });
});
