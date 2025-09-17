// Role definitions and display names
export const ROLES = {
  SYSTEM_ADMIN: 'system_admin',
  MEDICAL_OFFICER: 'medical_officer',
  NURSING_OFFICER: 'nursing_officer',
  FRONT_DESK: 'front_desk',
  LAB_OFFICER: 'lab_officer',
  PHARMACY_OFFICER: 'pharmacy_officer'
};

export const ROLE_DISPLAY_NAMES = {
  [ROLES.SYSTEM_ADMIN]: 'System Administrator',
  [ROLES.MEDICAL_OFFICER]: 'Medical Officer',
  [ROLES.NURSING_OFFICER]: 'Nursing Officer',
  [ROLES.FRONT_DESK]: 'Front Desk Officer',
  [ROLES.LAB_OFFICER]: 'Laboratory Officer',
  [ROLES.PHARMACY_OFFICER]: 'Pharmacy Officer'
};

export const getRoleDisplayName = (role) => {
  return ROLE_DISPLAY_NAMES[role] || role;
};

export const getAllRoles = () => {
  return Object.values(ROLES);
};

export const getRoleOptions = () => {
  return Object.entries(ROLE_DISPLAY_NAMES).map(([value, label]) => ({
    value,
    label
  }));
};
