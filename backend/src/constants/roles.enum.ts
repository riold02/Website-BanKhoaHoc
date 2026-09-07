export enum RoleEnum {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  STUDENT = 'STUDENT',
}

export const ROLE_IDS: Record<RoleEnum, number> = {
  [RoleEnum.ADMIN]: 1,
  [RoleEnum.STAFF]: 2,
  [RoleEnum.STUDENT]: 3,
};
