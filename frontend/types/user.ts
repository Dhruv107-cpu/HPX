export type UserRole = "SUPERADMIN" | "USER" | "ADMIN";

export interface ApiUser {
  email_id: string;
  role: string;
  is_active: boolean;
}

export interface ApiUserListItem extends ApiUser {
  id: string;
  created_at: string;
}
