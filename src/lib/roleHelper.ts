// Helper function to check if user has admin privileges
export const isAdminOrEngineering = (roleName?: string): boolean => {
  return roleName === "Admin" || roleName === "Engineering";
};

export const isAdminOrEngineeringById = (roleId?: string): boolean => {
  return roleId === "adm" || roleId === "eng";
};
