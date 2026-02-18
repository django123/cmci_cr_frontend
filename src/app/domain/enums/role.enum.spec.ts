import {
  Role,
  RoleLabels,
  RoleLevel,
  hasMinimumRole,
  canValidateCR,
  canViewOthersCR
} from './role.enum';

describe('Role Enum', () => {
  describe('RoleLabels', () => {
    it('should have labels for all roles', () => {
      expect(RoleLabels[Role.FIDELE]).toBe('Fidèle');
      expect(RoleLabels[Role.FD]).toBe('Faiseur de Disciples');
      expect(RoleLabels[Role.LEADER]).toBe('Leader');
      expect(RoleLabels[Role.PASTEUR]).toBe('Pasteur');
      expect(RoleLabels[Role.ADMIN]).toBe('Administrateur');
    });
  });

  describe('RoleLevel', () => {
    it('should define correct hierarchy levels', () => {
      expect(RoleLevel[Role.FIDELE]).toBe(1);
      expect(RoleLevel[Role.FD]).toBe(2);
      expect(RoleLevel[Role.LEADER]).toBe(3);
      expect(RoleLevel[Role.PASTEUR]).toBe(4);
      expect(RoleLevel[Role.ADMIN]).toBe(5);
    });

    it('should maintain ascending order', () => {
      expect(RoleLevel[Role.FIDELE]).toBeLessThan(RoleLevel[Role.FD]);
      expect(RoleLevel[Role.FD]).toBeLessThan(RoleLevel[Role.LEADER]);
      expect(RoleLevel[Role.LEADER]).toBeLessThan(RoleLevel[Role.PASTEUR]);
      expect(RoleLevel[Role.PASTEUR]).toBeLessThan(RoleLevel[Role.ADMIN]);
    });
  });

  describe('hasMinimumRole', () => {
    it('should return true when user role meets requirement', () => {
      expect(hasMinimumRole(Role.ADMIN, Role.FIDELE)).toBe(true);
      expect(hasMinimumRole(Role.PASTEUR, Role.FD)).toBe(true);
      expect(hasMinimumRole(Role.FD, Role.FD)).toBe(true);
    });

    it('should return false when user role is below requirement', () => {
      expect(hasMinimumRole(Role.FIDELE, Role.FD)).toBe(false);
      expect(hasMinimumRole(Role.FD, Role.LEADER)).toBe(false);
      expect(hasMinimumRole(Role.LEADER, Role.ADMIN)).toBe(false);
    });
  });

  describe('canValidateCR', () => {
    it('should return false for FIDELE', () => {
      expect(canValidateCR(Role.FIDELE)).toBe(false);
    });

    it('should return true for FD and above', () => {
      expect(canValidateCR(Role.FD)).toBe(true);
      expect(canValidateCR(Role.LEADER)).toBe(true);
      expect(canValidateCR(Role.PASTEUR)).toBe(true);
      expect(canValidateCR(Role.ADMIN)).toBe(true);
    });
  });

  describe('canViewOthersCR', () => {
    it('should return false for FIDELE', () => {
      expect(canViewOthersCR(Role.FIDELE)).toBe(false);
    });

    it('should return true for FD and above', () => {
      expect(canViewOthersCR(Role.FD)).toBe(true);
      expect(canViewOthersCR(Role.LEADER)).toBe(true);
      expect(canViewOthersCR(Role.PASTEUR)).toBe(true);
      expect(canViewOthersCR(Role.ADMIN)).toBe(true);
    });
  });
});
