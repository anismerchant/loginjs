import { Request, Response } from 'express';

export interface AuthRequest extends Request {
  user: string;
}

export interface LoginExpressConfig {
  jwtSecret: string;
  jwtResetSecret: string;
  emailFromUser: string;
  emailFromPass: string;
  emailHost: string;
  mongoDbUri: string;
  clientBaseUrl: string;
  emailPort?: number;
  emailSecure?: boolean;
  verifyEmailHeading?: string;
  verifyEmailSubjectLine?: string;
  verifyEmailMessage?: string;
  verifyEmailRedirect?: string;
  resetEmailHeading?: string;
  resetEmailSubjectLine?: string;
  resetEmailMessage?: string;
  resetEmailRedirect?: string;
  passwordLength?: number;
  jwtSessionExpiration?: number;
  jwtResetExpiration?: number;
}

export interface JwtPayload {
  user: {
    id: string;
  };
}

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

export interface LoginBody {
  res: Response;
  email: string;
  password: string;
}

export interface ChangePasswordBody {
  resetToken: string;
  newPassword: string;
}
