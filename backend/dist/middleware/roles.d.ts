import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { UserRole } from '../models/User';
export declare const requireRole: (...roles: UserRole[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireSeller: (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=roles.d.ts.map