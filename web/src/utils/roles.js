import { ALL_ROLES, ROLES, STAFF_ROLES } from "../constants";

export function isValidRole(role) {
  return ALL_ROLES.includes(role);
}

export function isStaff(role) {
  return STAFF_ROLES.includes(role);
}

/** Landing page for a signed-in user; null when the role is unknown. */
export function homePathForRole(role) {
  if (role === ROLES.MEMBER) return "/app/tickets";
  if (isStaff(role)) return "/admin/inbox";
  return null;
}
