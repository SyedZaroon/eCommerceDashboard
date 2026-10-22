import { PERMISSIONS } from "./role";

export const hasPermission = (user, resource, action) => {
  if (!user || user.status !== "Active") {
    return false;
  }

  const allowedRoles = PERMISSIONS[resource]?.[action];

  if (!allowedRoles) {
    return false;
  }

  return allowedRoles.includes(user.role);
};