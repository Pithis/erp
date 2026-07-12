import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getPrisma } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'enterprise_devops_secret_token_123456';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'HR_STAFF' | 'OPERATIONS_STAFF' | 'CREATIVE_SPECIALIST' | 'STAKEHOLDER';
    contractType: 'FULL_TIME' | 'FREELANCE';
  };
  auditOldValue?: any;
}

// 1. JWT Authentication Middleware
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Try extracting token from HTTP-Only cookie, fallback to Authorization header
  let token = req.cookies?.token;

  if (!token) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }



  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

// 2. RBAC Enforcement Middleware
export function requireRoles(allowedRoles: ('HR_STAFF' | 'OPERATIONS_STAFF' | 'CREATIVE_SPECIALIST' | 'STAKEHOLDER')[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden. Insufficient permissions.' });
    }
    next();
  };
}

// Helper to extract entity ID and table/model name from request path
function getEntityInfo(url: string) {
  const parts = url.split('/').filter(Boolean);
  // Expected structure: api/<entity>/<id> or api/<entity>
  const entityIndex = parts.indexOf('api');
  if (entityIndex === -1 || parts.length <= entityIndex + 1) return null;

  const entity = parts[entityIndex + 1]; // e.g. "projects", "tasks", "inventory", "schedule"
  const id = parts[entityIndex + 2];    // UUID if present

  // Map route names to Prisma model keys
  const modelMapping: { [key: string]: string } = {
    projects: 'project',
    tasks: 'task',
    inventory: 'inventoryItem',
    schedule: 'scheduleEntry',
    users: 'user',
  };

  const prismaModel = modelMapping[entity];
  return prismaModel ? { model: prismaModel, id } : null;
}

// 3. Automated Ledger Logging Interceptor
export async function auditLogger(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Only log state-modifying operations
  if (!['POST', 'PUT', 'DELETE'].includes(req.method)) {
    return next();
  }

  const prisma = getPrisma();
  const info = getEntityInfo(req.originalUrl);

  // Capture original value before operation for PUT and DELETE
  if (info && info.id && ['PUT', 'DELETE'].includes(req.method)) {
    try {
      const dbModel = (prisma as any)[info.model];
      if (dbModel && typeof dbModel.findUnique === 'function') {
        const record = await dbModel.findUnique({ where: { id: info.id } });
        if (record) {
          req.auditOldValue = record;
        }
      }
    } catch (e) {
      console.error('[Audit Log pre-fetch error]:', e);
    }
  }

  // Intercept response write/send to audit log after successful database operations
  const originalJson = res.json;
  res.json = function (body: any) {
    res.json = originalJson; // Restore original

    // Only create audit log if the response indicates success
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null;
      const userId = req.user?.id || null;
      const actionType = `${req.method}_${info?.model?.toUpperCase() || 'UNKNOWN'}`;

      // Run async in background without blocking current request
      prisma.auditLog.create({
        data: {
          userId,
          ipAddress,
          actionType,
          oldValue: req.auditOldValue ? JSON.stringify(req.auditOldValue) : null,
          newValue: body ? JSON.stringify(body) : JSON.stringify(req.body),
        }
      }).catch(err => console.error('[Failed to write Audit Log]:', err));
    }

    return originalJson.call(this, body);
  };

  next();
}
