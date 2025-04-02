export class SessionDto {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number | undefined;
  refresh_token: string;
}
