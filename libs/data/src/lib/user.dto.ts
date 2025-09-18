export interface UserSummary {
  id: string;
  email: string;
  displayName: string;
  role: string;
  organizationId: string;
  organizationPath?: string;
}

export interface AuthPayload {
  user: UserSummary;
  accessToken: string;
  expiresIn: number;
}
