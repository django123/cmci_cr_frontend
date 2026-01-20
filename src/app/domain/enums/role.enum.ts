/**
 * Enum représentant les rôles utilisateur dans le système CMCI
 * @description Hiérarchie: FIDELE < FD < LEADER < PASTEUR < ADMIN
 */
export enum Role {
  FIDELE = 'FIDELE',
  FD = 'FD',
  LEADER = 'LEADER',
  PASTEUR = 'PASTEUR',
  ADMIN = 'ADMIN'
}

export const RoleLabels: Record<Role, string> = {
  [Role.FIDELE]: 'Fidèle',
  [Role.FD]: 'Faiseur de Disciples',
  [Role.LEADER]: 'Leader',
  [Role.PASTEUR]: 'Pasteur',
  [Role.ADMIN]: 'Administrateur'
};

export const RoleLevel: Record<Role, number> = {
  [Role.FIDELE]: 1,
  [Role.FD]: 2,
  [Role.LEADER]: 3,
  [Role.PASTEUR]: 4,
  [Role.ADMIN]: 5
};

export function hasMinimumRole(userRole: Role, requiredRole: Role): boolean {
  return RoleLevel[userRole] >= RoleLevel[requiredRole];
}

export function canValidateCR(role: Role): boolean {
  return hasMinimumRole(role, Role.FD);
}

export function canViewOthersCR(role: Role): boolean {
  return hasMinimumRole(role, Role.FD);
}
