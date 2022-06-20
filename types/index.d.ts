import { Request, Response, NextFunction } from 'express';
import { Document } from 'mongoose';

export declare interface AuthRequest<UserDocument = {}> extends Request {
  user?: UserDocument;
}

export declare interface LoginExpressConfig<UserDocument = {}> {
  jwtSecret: string;
  jwtResetSecret: string;
  emailFromUser: string;
  emailFromPass: string;
  emailHost: string;
  userModel: UserDocument;
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
  email: string;
  password: string;
}

export declare interface ChangePasswordBody {
  resetToken: string;
  newPassword: string;
}

export declare class LoginExpress<UserDocument = {}> {
  constructor(config: LoginExpressConfig<UserDocument>);
  isLoggedIn(req: Request, res: Response, next: NextFunction): void;
  isAdmin(req: Request, res: Response, next: NextFunction): void;
  getUser<T>(id: string): Promise<T>;
  register(res: Response, userInfo: RegisterBody): Promise<void>;
  verify(token: string): Promise<void>;
  login(res: Response, userInfo: LoginBody): Promise<void>;
  logout(res: Response): void;
  changePassword(res: Response, options: ChangePasswordBody): Promise<void>;
  createSession(res: Response, userId: string): void;
  sendVerificationEmail(user: UserDocument): Promise<void>;
  sendPasswordResetEmail(email: string): Promise<void>;
}
