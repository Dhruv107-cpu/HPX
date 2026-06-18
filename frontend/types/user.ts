export type UserRole = "SUPERADMIN" | "USER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}