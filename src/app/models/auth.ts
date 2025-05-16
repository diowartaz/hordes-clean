export interface JwtPayload {
  id: string;
  exp: number;
}

export interface AuthResponse {
  token: string;
}

export interface SignUpParams {
  email: string;
  password: string;
  username?: string;
}

export interface SignInParams {
  email: string;
  password: string;
}
