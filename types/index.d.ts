import { Request, Response, NextFunction } from 'express';

export declare interface LoginExpressConfig {
  jwtResetSecret: string;
  emailFromUser: string;
  emailFromPass: string;
  emailHost: string;
  mongoDbUri: string;
  mongoDbModelName: string;
  mongoDbSchemaDefinition: string;
  clientBaseUrl: string;
  emailPort?: 25 | 465 | 587 | 2525;
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

export declare interface RegisterBody {
  name: string;
  email: string;
  password: string;
  [key: string]: unknown;
}

export declare interface LoginBody {
  res: Response;
  email: string;
  password: string;
}

export declare interface ChangePasswordBody {
  resetToken: string;
  newPassword: string;
}

export declare class LoginExpress {
  constructor(config: LoginExpressConfig);
  isLoggedIn(req: Request, res: Response, next: NextFunction): void;
  getUser<T>(id: string): Promise<T>;
  register(options: RegisterBody): Promise<void>;
  verify(token: string): Promise<void>;
  login(options: LoginBody): Promise<void>;
  resetPassword(email: string): Promise<void>;
  changePassword(options: ChangePasswordBody): Promise<void>;
}
